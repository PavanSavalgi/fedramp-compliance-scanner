import * as vscode from 'vscode';
import * as path from 'path';
import { ComplianceIssue, ComplianceReport, FedRAMPLevel } from './types';

export class ComplianceTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly issue?: ComplianceIssue,
        public readonly file?: string
    ) {
        super(label, collapsibleState);
        
        if (issue) {
            this.tooltip = `${issue.message}\n\nRemediation: ${issue.remediation}`;
            this.contextValue = 'complianceIssue';
            this.iconPath = this.getIconForSeverity(issue.severity);
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [
                    vscode.Uri.file(issue.file),
                    {
                        selection: new vscode.Range(
                            issue.line - 1, 
                            issue.column, 
                            issue.line - 1, 
                            issue.column + 10
                        )
                    }
                ]
            };
        } else if (file) {
            this.tooltip = file;
            this.contextValue = 'complianceFile';
            this.iconPath = vscode.ThemeIcon.File;
        } else {
            this.contextValue = 'complianceCategory';
            this.iconPath = vscode.ThemeIcon.Folder;
        }
    }

    private getIconForSeverity(severity: string): vscode.ThemeIcon {
        switch (severity) {
            case 'error':
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
            case 'warning':
                return new vscode.ThemeIcon('warning', new vscode.ThemeColor('warningForeground'));
            case 'info':
                return new vscode.ThemeIcon('info', new vscode.ThemeColor('infoForeground'));
            default:
                return new vscode.ThemeIcon('circle-outline');
        }
    }
}

export class ComplianceTreeProvider implements vscode.TreeDataProvider<ComplianceTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ComplianceTreeItem | undefined | null | void> = new vscode.EventEmitter<ComplianceTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ComplianceTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private report: ComplianceReport | undefined;

    constructor() {}

    public updateReport(report: ComplianceReport) {
        this.report = report;
        this._onDidChangeTreeData.fire();
    }

    public clear() {
        this.report = undefined;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ComplianceTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ComplianceTreeItem): Thenable<ComplianceTreeItem[]> {
        if (!this.report) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show summary and categories
            const items: ComplianceTreeItem[] = [];
            
            // Summary item
            const summaryLabel = `Summary: ${this.report.summary.errors} errors, ${this.report.summary.warnings} warnings, ${this.report.summary.info} info`;
            items.push(new ComplianceTreeItem(summaryLabel, vscode.TreeItemCollapsibleState.None));

            // Compliance level
            items.push(new ComplianceTreeItem(`Level: ${this.report.level}`, vscode.TreeItemCollapsibleState.None));

            // Files scanned
            items.push(new ComplianceTreeItem(`Files: ${this.report.scannedFiles}/${this.report.totalFiles}`, vscode.TreeItemCollapsibleState.None));

            if (this.report.issues.length > 0) {
                // Group by severity
                if (this.report.summary.errors > 0) {
                    items.push(new ComplianceTreeItem(`Errors (${this.report.summary.errors})`, vscode.TreeItemCollapsibleState.Collapsed));
                }
                if (this.report.summary.warnings > 0) {
                    items.push(new ComplianceTreeItem(`Warnings (${this.report.summary.warnings})`, vscode.TreeItemCollapsibleState.Collapsed));
                }
                if (this.report.summary.info > 0) {
                    items.push(new ComplianceTreeItem(`Information (${this.report.summary.info})`, vscode.TreeItemCollapsibleState.Collapsed));
                }
            }

            return Promise.resolve(items);
        } else {
            // Show issues for each category
            const issues = this.getIssuesForCategory(element.label);
            const groupedByFile = this.groupIssuesByFile(issues);
            
            const items: ComplianceTreeItem[] = [];
            for (const [filePath, fileIssues] of groupedByFile) {
                const fileName = path.basename(filePath);
                const fileItem = new ComplianceTreeItem(
                    `${fileName} (${fileIssues.length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    filePath
                );
                items.push(fileItem);
            }

            return Promise.resolve(items);
        }
    }

    private getIssuesForCategory(category: string): ComplianceIssue[] {
        if (!this.report) {
            return [];
        }

        if (category.startsWith('Errors')) {
            return this.report.issues.filter(issue => issue.severity === 'error');
        } else if (category.startsWith('Warnings')) {
            return this.report.issues.filter(issue => issue.severity === 'warning');
        } else if (category.startsWith('Information')) {
            return this.report.issues.filter(issue => issue.severity === 'info');
        }

        return [];
    }

    private groupIssuesByFile(issues: ComplianceIssue[]): Map<string, ComplianceIssue[]> {
        const grouped = new Map<string, ComplianceIssue[]>();
        
        for (const issue of issues) {
            if (!grouped.has(issue.file)) {
                grouped.set(issue.file, []);
            }
            grouped.get(issue.file)!.push(issue);
        }

        return grouped;
    }
}
