import * as vscode from 'vscode';
import { ComplianceScanner } from './scanner';
import { GlobalComplianceControls } from './globalComplianceControls';
import { ComplianceStandard } from './types';

export class RealtimeComplianceMonitor {
    private fileWatcher: vscode.FileSystemWatcher | undefined;
    private scanner: ComplianceScanner;
    private globalControls: GlobalComplianceControls;
    private statusBarItem: vscode.StatusBarItem;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private isEnabled: boolean = false;

    constructor() {
        this.scanner = new ComplianceScanner();
        this.globalControls = new GlobalComplianceControls();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
        
        // Initialize status bar
        this.updateStatusBar();
    }

    public async initialize(): Promise<void> {
        console.log('🔄 Initializing Real-time Compliance Monitor...');
        
        // Check if real-time monitoring is enabled in settings
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        this.isEnabled = config.get('enableRealTimeMonitoring', false);
        
        if (this.isEnabled) {
            this.startMonitoring();
        }
        
        // Register command to toggle real-time monitoring
        vscode.commands.registerCommand('fedramp.toggleRealTimeMonitoring', () => {
            this.toggleMonitoring();
        });

        // Monitor active editor changes
        vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this));
        
        // Monitor text document changes
        vscode.workspace.onDidChangeTextDocument(this.onTextDocumentChanged.bind(this));

        console.log('✅ Real-time Compliance Monitor initialized');
    }

    private startMonitoring(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }

        // Create file watcher for compliance-relevant files
        const watchPattern = '**/*.{tf,yaml,yml,json,hcl,md,txt,sh,py,js,ts}';
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(watchPattern);

        // Handle file events
        this.fileWatcher.onDidChange(this.onFileChanged.bind(this));
        this.fileWatcher.onDidCreate(this.onFileCreated.bind(this));
        this.fileWatcher.onDidDelete(this.onFileDeleted.bind(this));

        this.isEnabled = true;
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('🔄 Real-time compliance monitoring enabled');
        console.log('🔄 File watcher started for compliance monitoring');
    }

    private stopMonitoring(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
            this.fileWatcher = undefined;
        }

        this.isEnabled = false;
        this.updateStatusBar();
        this.diagnosticCollection.clear();
        
        vscode.window.showInformationMessage('⏸️ Real-time compliance monitoring disabled');
        console.log('⏸️ File watcher stopped');
    }

    private toggleMonitoring(): void {
        if (this.isEnabled) {
            this.stopMonitoring();
        } else {
            this.startMonitoring();
        }

        // Update configuration
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        config.update('enableRealTimeMonitoring', this.isEnabled, vscode.ConfigurationTarget.Workspace);
    }

    private async onFileChanged(uri: vscode.Uri): Promise<void> {
        if (!this.isEnabled) {
            return;
        }
        
        console.log(`🔍 File changed: ${uri.fsPath}`);
        await this.scanFile(uri);
    }

    private async onFileCreated(uri: vscode.Uri): Promise<void> {
        if (!this.isEnabled) {
            return;
        }
        
        console.log(`📄 File created: ${uri.fsPath}`);
        await this.scanFile(uri);
    }

    private onFileDeleted(uri: vscode.Uri): void {
        if (!this.isEnabled) {
            return;
        }
        
        console.log(`🗑️ File deleted: ${uri.fsPath}`);
        this.diagnosticCollection.delete(uri);
    }

    private async onActiveEditorChanged(editor: vscode.TextEditor | undefined): Promise<void> {
        if (!this.isEnabled || !editor) {
            return;
        }
        
        console.log(`📝 Active editor changed: ${editor.document.uri.fsPath}`);
        await this.scanFile(editor.document.uri);
    }

    private async onTextDocumentChanged(event: vscode.TextDocumentChangeEvent): Promise<void> {
        if (!this.isEnabled || event.contentChanges.length === 0) {
            return;
        }
        
        // Debounce rapid changes - only scan after 2 seconds of inactivity
        setTimeout(async () => {
            console.log(`✏️ Document changed: ${event.document.uri.fsPath}`);
            await this.scanFile(event.document.uri);
        }, 2000);
    }

    private async scanFile(uri: vscode.Uri): Promise<void> {
        try {
            // Get enabled compliance standards from configuration
            const config = vscode.workspace.getConfiguration('fedrampCompliance');
            const enabledStandards = config.get<ComplianceStandard[]>('complianceStandards', ['FedRAMP']);
            
            // Scan the file for compliance violations using the workspace scanner
            const results = await this.scanner.scanWorkspaceWithStandards(enabledStandards, undefined, false);
            
            // Filter results to only include issues from the current file
            const fileResults = {
                ...results,
                issues: results.issues.filter(issue => issue.file === uri.fsPath)
            };
            
            // Convert compliance issues to VS Code diagnostics
            const diagnostics: vscode.Diagnostic[] = [];
            
            for (const issue of fileResults.issues) {
                const range = new vscode.Range(
                    new vscode.Position(Math.max(0, issue.line - 1), 0),
                    new vscode.Position(Math.max(0, issue.line - 1), issue.column || 100)
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `${issue.control}: ${issue.message}`,
                    this.getSeverity(issue.severity)
                );

                diagnostic.source = 'FedRAMP Compliance';
                diagnostic.code = issue.control;
                
                // Add remediation as a related information
                if (issue.remediation) {
                    diagnostic.relatedInformation = [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(uri, range),
                            `Remediation: ${issue.remediation}`
                        )
                    ];
                }

                diagnostics.push(diagnostic);
            }

            // Update diagnostics for this file
            this.diagnosticCollection.set(uri, diagnostics);
            
            // Update status bar with violation count
            this.updateStatusBarWithViolations(diagnostics.length);
            
            // Show notification for critical violations
            const criticalViolations = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            if (criticalViolations.length > 0) {
                const message = `⚠️ ${criticalViolations.length} critical compliance violation(s) found in ${uri.fsPath.split('/').pop()}`;
                vscode.window.showWarningMessage(message, 'Show Problems').then(selection => {
                    if (selection === 'Show Problems') {
                        vscode.commands.executeCommand('workbench.panel.markers.view.focus');
                    }
                });
            }

        } catch (error) {
            console.error(`❌ Error scanning file ${uri.fsPath}:`, error);
        }
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
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
        if (this.isEnabled) {
            this.statusBarItem.text = '$(shield) FedRAMP: Monitoring';
            this.statusBarItem.color = '#4CAF50';
            this.statusBarItem.tooltip = 'Real-time compliance monitoring is active. Click to disable.';
            this.statusBarItem.command = 'fedramp.toggleRealTimeMonitoring';
        } else {
            this.statusBarItem.text = '$(shield) FedRAMP: Disabled';
            this.statusBarItem.color = '#757575';
            this.statusBarItem.tooltip = 'Real-time compliance monitoring is disabled. Click to enable.';
            this.statusBarItem.command = 'fedramp.toggleRealTimeMonitoring';
        }
        this.statusBarItem.show();
    }

    private updateStatusBarWithViolations(violationCount: number): void {
        if (!this.isEnabled) {
            return;
        }

        if (violationCount > 0) {
            this.statusBarItem.text = `$(shield) FedRAMP: ${violationCount} issues`;
            this.statusBarItem.color = violationCount > 5 ? '#FF5722' : '#FF9800';
            this.statusBarItem.tooltip = `${violationCount} compliance violations detected. Click to view details.`;
            this.statusBarItem.command = 'workbench.panel.markers.view.focus';
        } else {
            this.statusBarItem.text = '$(shield) FedRAMP: ✓ Clean';
            this.statusBarItem.color = '#4CAF50';
            this.statusBarItem.tooltip = 'No compliance violations detected. Click to disable monitoring.';
            this.statusBarItem.command = 'fedramp.toggleRealTimeMonitoring';
        }
    }

    public dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
        this.statusBarItem.dispose();
        this.diagnosticCollection.dispose();
    }
}

// Utility function to register the real-time monitor
export function activateRealtimeMonitoring(context: vscode.ExtensionContext): RealtimeComplianceMonitor {
    const monitor = new RealtimeComplianceMonitor();
    monitor.initialize();
    
    context.subscriptions.push(monitor);
    
    return monitor;
}
