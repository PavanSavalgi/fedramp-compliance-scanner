import * as vscode from 'vscode';
import { GlobalComplianceControls } from './globalComplianceControls';
import { ComplianceReport, ComplianceIssue, FedRAMPLevel, ComplianceStandard } from './types';
import * as path from 'path';

export class LiveComplianceScanner {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private statusBarItem: vscode.StatusBarItem;
    private complianceControls: GlobalComplianceControls;
    private isEnabled: boolean = true;
    private fileWatcher: vscode.FileSystemWatcher | undefined;
    private documentChangeTimeout: NodeJS.Timeout | undefined;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.complianceControls = new GlobalComplianceControls();
        this.setupStatusBar();
        this.setupFileWatcher();
        this.setupEventHandlers();
    }

    private setupStatusBar(): void {
        this.statusBarItem.text = '$(shield) FedRAMP: Ready';
        this.statusBarItem.color = '#4CAF50';
        this.statusBarItem.tooltip = 'FedRAMP Compliance Scanner - Click to toggle';
        this.statusBarItem.command = 'fedramp.toggleLiveScanning';
        this.statusBarItem.show();
    }

    private setupFileWatcher(): void {
        // Watch for file changes in compliance-relevant files
        const pattern = '**/*.{tf,yaml,yml,json,hcl,py,js,ts,md,sh,dockerfile,Dockerfile}';
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        
        this.fileWatcher.onDidChange(this.onFileChanged.bind(this));
        this.fileWatcher.onDidCreate(this.onFileCreated.bind(this));
        this.fileWatcher.onDidDelete(this.onFileDeleted.bind(this));
    }

    private setupEventHandlers(): void {
        // Scan when active editor changes
        vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this));
        
        // Scan when document content changes (debounced)
        vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged.bind(this));
        
        // Scan when document is saved
        vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this));
        
        // Register toggle command
        vscode.commands.registerCommand('fedramp.toggleLiveScanning', this.toggleScanning.bind(this));
        
        // Register scan workspace command
        vscode.commands.registerCommand('fedramp.scanWorkspace', this.scanWorkspace.bind(this));
        
        // Register scan current file command
        vscode.commands.registerCommand('fedramp.scanCurrentFile', this.scanCurrentFile.bind(this));
    }

    private async onFileChanged(uri: vscode.Uri): Promise<void> {
        if (this.isEnabled) {
            await this.scanFile(uri);
        }
    }

    private async onFileCreated(uri: vscode.Uri): Promise<void> {
        if (this.isEnabled) {
            await this.scanFile(uri);
        }
    }

    private onFileDeleted(uri: vscode.Uri): void {
        this.diagnosticCollection.delete(uri);
        this.updateStatusBar();
    }

    private async onActiveEditorChanged(editor: vscode.TextEditor | undefined): Promise<void> {
        if (this.isEnabled && editor) {
            await this.scanFile(editor.document.uri);
        }
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        if (!this.isEnabled || event.contentChanges.length === 0) {
            return;
        }

        // Debounce rapid changes - scan after 1 second of inactivity
        if (this.documentChangeTimeout) {
            clearTimeout(this.documentChangeTimeout);
        }

        this.documentChangeTimeout = setTimeout(async () => {
            await this.scanFile(event.document.uri);
        }, 1000);
    }

    private async onDocumentSaved(document: vscode.TextDocument): Promise<void> {
        if (this.isEnabled) {
            await this.scanFile(document.uri);
        }
    }

    public async scanFile(uri: vscode.Uri): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();
            const fileName = path.basename(uri.fsPath);
            const extension = path.extname(fileName).toLowerCase();

            // Get compliance level from configuration
            const config = vscode.workspace.getConfiguration('fedrampCompliance');
            const level = config.get<FedRAMPLevel>('complianceLevel', FedRAMPLevel.Moderate);
            
            // Get applicable controls for this file type
            const controls = await this.complianceControls.getControlsForStandards(['FedRAMP']);
            const applicableControls = controls.filter((control: any) => 
                this.isControlApplicableToFile(control, fileName, extension)
            );

            const issues: ComplianceIssue[] = [];
            
            // Scan file content against applicable controls
            for (const control of applicableControls) {
                for (const check of control.checks) {
                    if (this.isCheckApplicableToFile(check, fileName, extension)) {
                        const fileIssues = await this.performCheck(
                            control, 
                            check, 
                            content, 
                            uri.fsPath, 
                            document
                        );
                        issues.push(...fileIssues);
                    }
                }
            }

            // Convert issues to VS Code diagnostics
            const diagnostics = this.convertIssuesToDiagnostics(issues, uri);
            
            // Update diagnostics collection
            this.diagnosticCollection.set(uri, diagnostics);
            
            // Update status bar
            this.updateStatusBar();
            
            // Show notifications for critical issues
            this.showCriticalIssueNotifications(diagnostics, fileName);

        } catch (error) {
            console.error(`Error scanning file ${uri.fsPath}:`, error);
        }
    }

    private isControlApplicableToFile(control: any, fileName: string, extension: string): boolean {
        // Infrastructure as Code files
        if (['.tf', '.yaml', '.yml', '.json'].includes(extension)) {
            return ['AC', 'SC', 'CM', 'SI', 'AU', 'RA'].includes(control.family);
        }
        
        // Source code files
        if (['.py', '.js', '.ts', '.java', '.go', '.rs'].includes(extension)) {
            return ['AC', 'SC', 'SI', 'SA'].includes(control.family);
        }
        
        // Configuration files
        if (fileName.includes('config') || fileName.includes('env') || extension === '.conf') {
            return ['AC', 'SC', 'CM', 'IA'].includes(control.family);
        }
        
        // Docker files
        if (fileName.toLowerCase().includes('dockerfile') || extension === '.dockerfile') {
            return ['AC', 'SC', 'CM', 'SI'].includes(control.family);
        }
        
        // Documentation files
        if (['.md', '.txt', '.rst'].includes(extension)) {
            return ['SA', 'PL', 'PM'].includes(control.family);
        }
        
        return true; // Default to applicable
    }

    private isCheckApplicableToFile(check: any, fileName: string, extension: string): boolean {
        if (check.fileTypes && check.fileTypes.length > 0) {
            return check.fileTypes.some((type: string) => 
                extension === type || fileName.includes(type)
            );
        }
        return true;
    }

    private async performCheck(
        control: any, 
        check: any, 
        content: string, 
        filePath: string, 
        document: vscode.TextDocument
    ): Promise<ComplianceIssue[]> {
        const issues: ComplianceIssue[] = [];
        
        if (check.pattern) {
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(check.pattern);
                
                if (match) {
                    const issue: ComplianceIssue = {
                        control: control.id,
                        check: check.id || control.id,
                        file: filePath,
                        line: i + 1,
                        column: match.index || 0,
                        severity: check.severity || control.severity,
                        message: check.message,
                        remediation: check.remediation
                    };
                    
                    issues.push(issue);
                }
            }
        }
        
        return issues;
    }

    private convertIssuesToDiagnostics(issues: ComplianceIssue[], uri: vscode.Uri): vscode.Diagnostic[] {
        return issues.map(issue => {
            const line = Math.max(0, issue.line - 1);
            const column = Math.max(0, issue.column);
            
            const range = new vscode.Range(
                new vscode.Position(line, column),
                new vscode.Position(line, column + 50) // Highlight reasonable length
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                `[${issue.control}] ${issue.message}`,
                this.getSeverityLevel(issue.severity)
            );

            diagnostic.source = 'FedRAMP Compliance';
            diagnostic.code = issue.control;
            
            // Add remediation as related information
            if (issue.remediation) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(uri, range),
                        `Remediation: ${issue.remediation}`
                    )
                ];
            }

            return diagnostic;
        });
    }

    private getSeverityLevel(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }

    private updateStatusBar(): void {
        if (!this.isEnabled) {
            this.statusBarItem.text = '$(shield) FedRAMP: Disabled';
            this.statusBarItem.color = '#757575';
            this.statusBarItem.tooltip = 'FedRAMP Compliance Scanner is disabled';
            return;
        }

        let totalIssues = 0;
        let errorCount = 0;
        
        // Count issues across all files
        vscode.workspace.workspaceFolders?.forEach(folder => {
            vscode.workspace.findFiles('**/*', '**/node_modules/**').then(files => {
                files.forEach(file => {
                    const diagnostics = this.diagnosticCollection.get(file);
                    if (diagnostics) {
                        totalIssues += diagnostics.length;
                        errorCount += diagnostics.filter((d: vscode.Diagnostic) => 
                            d.severity === vscode.DiagnosticSeverity.Error
                        ).length;
                    }
                });
            });
        });

        if (totalIssues === 0) {
            this.statusBarItem.text = '$(shield) FedRAMP: ✓ Clean';
            this.statusBarItem.color = '#4CAF50';
            this.statusBarItem.tooltip = 'No compliance issues found';
        } else {
            this.statusBarItem.text = `$(shield) FedRAMP: ${totalIssues} issues`;
            this.statusBarItem.color = errorCount > 0 ? '#F44336' : '#FF9800';
            this.statusBarItem.tooltip = `${totalIssues} compliance issues found (${errorCount} errors)`;
        }
    }

    private showCriticalIssueNotifications(diagnostics: vscode.Diagnostic[], fileName: string): void {
        const criticalIssues = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
        
        if (criticalIssues.length > 0) {
            const message = `⚠️ ${criticalIssues.length} critical compliance issue(s) found in ${fileName}`;
            vscode.window.showWarningMessage(message, 'Show Problems', 'Dismiss').then(selection => {
                if (selection === 'Show Problems') {
                    vscode.commands.executeCommand('workbench.panel.markers.view.focus');
                }
            });
        }
    }

    public toggleScanning(): void {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            vscode.window.showInformationMessage('🔄 FedRAMP live scanning enabled');
            this.scanWorkspace();
        } else {
            vscode.window.showInformationMessage('⏸️ FedRAMP live scanning disabled');
            this.diagnosticCollection.clear();
        }
        
        this.updateStatusBar();
    }

    public async scanWorkspace(): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning workspace for FedRAMP compliance...',
            cancellable: false
        }, async (progress) => {
            try {
                // Clear existing diagnostics
                this.diagnosticCollection.clear();
                
                // Find all relevant files
                const files = await vscode.workspace.findFiles(
                    '**/*.{tf,yaml,yml,json,hcl,py,js,ts,md,sh,dockerfile,Dockerfile}',
                    '**/node_modules/**'
                );
                
                let processed = 0;
                for (const file of files) {
                    await this.scanFile(file);
                    processed++;
                    progress.report({ 
                        increment: (processed / files.length) * 100,
                        message: `Scanned ${processed}/${files.length} files`
                    });
                }
                
                vscode.window.showInformationMessage(`✅ Workspace scan complete. Found ${this.getTotalIssueCount()} compliance issues.`);
                
            } catch (error) {
                console.error('Error scanning workspace:', error);
                vscode.window.showErrorMessage('Failed to scan workspace for compliance issues');
            }
        });
    }

    public async scanCurrentFile(): Promise<void> {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to scan');
            return;
        }

        await this.scanFile(activeEditor.document.uri);
        const diagnostics = this.diagnosticCollection.get(activeEditor.document.uri) || [];
        
        vscode.window.showInformationMessage(
            `✅ File scan complete. Found ${diagnostics.length} compliance issues.`
        );
    }

    private getTotalIssueCount(): number {
        let total = 0;
        // This is a simplified count - in practice we'd track this better
        return total;
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
        this.statusBarItem.dispose();
        this.fileWatcher?.dispose();
        
        if (this.documentChangeTimeout) {
            clearTimeout(this.documentChangeTimeout);
        }
    }
}
