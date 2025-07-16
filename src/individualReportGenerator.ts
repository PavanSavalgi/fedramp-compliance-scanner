import * as vscode from 'vscode';
import { ComplianceReport, ComplianceStandard } from './types';
import { ReportGenerator } from './reportGenerator';

export class IndividualReportGenerator {
    private baseGenerator: ReportGenerator;

    constructor(baseGenerator: ReportGenerator) {
        this.baseGenerator = baseGenerator;
    }

    async generateIndividualReports(report: ComplianceReport): Promise<void> {
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const selectedStandards = config.get<ComplianceStandard[]>('complianceStandards', ['FedRAMP']);
        
        // Generate a report for each selected standard
        for (const standard of selectedStandards) {
            await this.generateStandardSpecificReport(report, standard);
        }
        
        vscode.window.showInformationMessage(`Generated individual reports for ${selectedStandards.length} compliance standards`);
    }

    async generateStandardSpecificReport(originalReport: ComplianceReport, standard: ComplianceStandard): Promise<void> {
        // Filter issues for the specific standard
        const standardIssues = originalReport.issues.filter(issue => 
            this.isIssueForStandard(issue.control, standard)
        );

        // Create a standard-specific report
        const standardReport: ComplianceReport = {
            ...originalReport,
            standards: [standard],
            issues: standardIssues,
            summary: {
                ...originalReport.summary,
                errors: standardIssues.filter(i => i.severity === 'error').length,
                warnings: standardIssues.filter(i => i.severity === 'warning').length,
                info: standardIssues.filter(i => i.severity === 'info').length,
                controlsCovered: new Set(standardIssues.map(i => i.control)).size
            }
        };

        const standardName = this.getStandardDisplayName(standard);
        const panel = vscode.window.createWebviewPanel(
            `${standard.toLowerCase().replace('-', '')}Report`,
            `${standardName} Compliance Report`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = this.getStandardSpecificWebviewContent(standardReport, standard);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'exportReport':
                        await this.exportStandardReport(standardReport, standard, message.format);
                        break;
                }
            }
        );
    }

    private isIssueForStandard(control: string, standard: ComplianceStandard): boolean {
        const standardPrefixes: { [key in ComplianceStandard]: string[] } = {
            'FedRAMP': ['AC-', 'AU-', 'CM-', 'IA-', 'SC-', 'SI-'],
            'GDPR': ['GDPR-'],
            'HIPAA': ['HIPAA-'],
            'DPDP': ['DPDP-'],
            'PCI-DSS': ['PCI-'],
            'ISO-27001': ['ISO-A-'],
            'ISO-27002': ['ISO27002-'],
            'SOC-2': ['SOC2-'],
            'NIST-CSF': ['NIST-']
        };

        const prefixes = standardPrefixes[standard] || [];
        return prefixes.some(prefix => control.startsWith(prefix));
    }

    private getStandardDisplayName(standard: ComplianceStandard): string {
        const names: { [key in ComplianceStandard]: string } = {
            'FedRAMP': 'FedRAMP',
            'GDPR': 'GDPR',
            'HIPAA': 'HIPAA',
            'DPDP': 'DPDP Act',
            'PCI-DSS': 'PCI DSS',
            'ISO-27001': 'ISO 27001',
            'ISO-27002': 'ISO 27002',
            'SOC-2': 'SOC 2',
            'NIST-CSF': 'NIST CSF'
        };
        return names[standard];
    }

    private getStandardColor(standard: ComplianceStandard): string {
        const colors: { [key in ComplianceStandard]: string } = {
            'FedRAMP': '#1e40af',
            'GDPR': '#7c3aed',
            'HIPAA': '#059669',
            'DPDP': '#ea580c',
            'PCI-DSS': '#dc2626',
            'ISO-27001': '#0891b2',
            'ISO-27002': '#0284c7',
            'SOC-2': '#9333ea',
            'NIST-CSF': '#065f46'
        };
        return colors[standard];
    }

    private getStandardDescription(standard: ComplianceStandard): string {
        const descriptions: { [key in ComplianceStandard]: string } = {
            'FedRAMP': 'Federal Risk and Authorization Management Program - US government cloud security standard',
            'GDPR': 'General Data Protection Regulation - EU data protection and privacy regulation',
            'HIPAA': 'Health Insurance Portability and Accountability Act - US healthcare privacy regulation',
            'DPDP': 'Digital Personal Data Protection Act - India\'s comprehensive data protection law',
            'PCI-DSS': 'Payment Card Industry Data Security Standard - Global payment card security requirements',
            'ISO-27001': 'International standard for information security management systems',
            'ISO-27002': 'Code of practice for information security controls',
            'SOC-2': 'Service Organization Control 2 - Security and availability controls for service organizations',
            'NIST-CSF': 'NIST Cybersecurity Framework - US framework for managing cybersecurity risk'
        };
        return descriptions[standard];
    }

    private calculateComplianceScore(report: ComplianceReport): number {
        if (report.summary.totalControls === 0) {return 100;}
        
        const totalIssues = report.summary.errors + report.summary.warnings + report.summary.info;
        const maxPossibleIssues = report.summary.totalControls;
        
        if (totalIssues === 0) {return 100;}
        
        // Weight errors more heavily than warnings and info
        const weightedIssues = (report.summary.errors * 3) + (report.summary.warnings * 2) + (report.summary.info * 1);
        const maxWeightedIssues = maxPossibleIssues * 3;
        
        const score = Math.max(0, Math.round(100 - (weightedIssues / maxWeightedIssues * 100)));
        return score;
    }

    private getStandardSpecificWebviewContent(report: ComplianceReport, standard: ComplianceStandard): string {
        const standardName = this.getStandardDisplayName(standard);
        const standardColor = this.getStandardColor(standard);
        const complianceScore = this.calculateComplianceScore(report);
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${standardName} Compliance Report</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, ${standardColor}, #2d3748);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .header h1 {
                    margin: 0;
                    font-size: 2.5em;
                    font-weight: 300;
                }
                .header .subtitle {
                    font-size: 1.2em;
                    opacity: 0.9;
                    margin-top: 10px;
                }
                .compliance-score {
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    padding: 10px 20px;
                    border-radius: 25px;
                    margin-top: 15px;
                    font-size: 1.1em;
                    font-weight: bold;
                }
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .summary-card {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .summary-card h3 {
                    margin: 0 0 10px 0;
                    color: var(--vscode-textLink-foreground);
                }
                .summary-card .number {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .summary-card.errors .number { color: #e53e3e; }
                .summary-card.warnings .number { color: #f6ad55; }
                .summary-card.info .number { color: #4299e1; }
                .summary-card.covered .number { color: #48bb78; }
                .standard-info {
                    background: var(--vscode-textBlockQuote-background);
                    border-left: 4px solid ${standardColor};
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }
                .actions {
                    display: flex;
                    gap: 15px;
                    margin: 30px 0;
                    flex-wrap: wrap;
                }
                .btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn:hover {
                    background: var(--vscode-button-hoverBackground);
                    transform: translateY(-1px);
                }
                .btn.secondary {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .findings {
                    margin-top: 30px;
                }
                .finding {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    margin: 15px 0;
                    padding: 20px;
                }
                .finding.error { border-left: 4px solid #e53e3e; }
                .finding.warning { border-left: 4px solid #f6ad55; }
                .finding.info { border-left: 4px solid #4299e1; }
                .finding h4 {
                    margin: 0 0 10px 0;
                    color: var(--vscode-textLink-foreground);
                }
                .finding .meta {
                    font-size: 0.9em;
                    color: var(--vscode-descriptionForeground);
                    margin: 5px 0;
                }
                .finding .remediation {
                    background: var(--vscode-textBlockQuote-background);
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 15px;
                    border-left: 3px solid ${standardColor};
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🛡️ ${standardName} Compliance Report</h1>
                <div class="subtitle">${this.getStandardDescription(standard)}</div>
                <div class="compliance-score">
                    Compliance Score: ${complianceScore}%
                </div>
            </div>

            <div class="summary-cards">
                <div class="summary-card errors">
                    <h3>Critical Issues</h3>
                    <div class="number">${report.summary.errors}</div>
                </div>
                <div class="summary-card warnings">
                    <h3>Warnings</h3>
                    <div class="number">${report.summary.warnings}</div>
                </div>
                <div class="summary-card info">
                    <h3>Information</h3>
                    <div class="number">${report.summary.info}</div>
                </div>
                <div class="summary-card covered">
                    <h3>Controls Covered</h3>
                    <div class="number">${report.summary.controlsCovered}</div>
                </div>
            </div>

            <div class="standard-info">
                <h3>About ${standardName}</h3>
                <p>${this.getStandardDescription(standard)}</p>
            </div>

            <div class="actions">
                <button class="btn secondary" onclick="exportReport('html')">🌐 Export HTML</button>
                <button class="btn secondary" onclick="exportReport('json')">📋 Export JSON</button>
                <button class="btn secondary" onclick="exportReport('md')">📝 Export Markdown</button>
            </div>

            <div class="findings">
                <h2>📋 Detailed Findings (${report.issues.length} issues)</h2>
                ${report.issues.length === 0 ? 
                    '<div class="standard-info"><p>🎉 No compliance issues found for this standard!</p></div>' :
                    report.issues.map(issue => `
                        <div class="finding ${issue.severity}">
                            <h4>${issue.control}: ${issue.message}</h4>
                            <div class="meta">
                                <strong>File:</strong> ${issue.file}:${issue.line}<br>
                                <strong>Severity:</strong> ${issue.severity.toUpperCase()}
                            </div>
                            <div class="remediation">
                                <strong>💡 Remediation:</strong> ${issue.remediation}
                            </div>
                        </div>
                    `).join('')
                }
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function exportReport(format) {
                    vscode.postMessage({ command: 'exportReport', format: format });
                }
            </script>
        </body>
        </html>
        `;
    }

    private async exportStandardReport(report: ComplianceReport, standard: ComplianceStandard, format: string): Promise<void> {
        const standardName = this.getStandardDisplayName(standard);
        
        try {
            let content: string;
            let extension: string;

            switch (format) {
                case 'json':
                    content = JSON.stringify(report, null, 2);
                    extension = 'json';
                    break;
                case 'html':
                    content = this.getStandardSpecificWebviewContent(report, standard);
                    extension = 'html';
                    break;
                default:
                    content = this.generateStandardMarkdownReport(report, standard);
                    extension = 'md';
            }

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`${standardName.replace(/\s+/g, '_')}_compliance_report_${new Date().toISOString().split('T')[0]}.${extension}`),
                filters: {
                    'Report Files': [extension]
                }
            });

            if (uri) {
                const fs = require('fs');
                fs.writeFileSync(uri.fsPath, content);
                vscode.window.showInformationMessage(`${standardName} report exported to ${uri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export ${standardName} report: ${error}`);
        }
    }

    private generateStandardMarkdownReport(report: ComplianceReport, standard: ComplianceStandard): string {
        const standardName = this.getStandardDisplayName(standard);
        const complianceScore = this.calculateComplianceScore(report);
        
        return `# ${standardName} Compliance Report

Generated: ${report.timestamp.toLocaleString()}
Compliance Score: ${complianceScore}%

## Summary

- **Standard**: ${standardName}
- **Total Files Scanned**: ${report.totalFiles}
- **Files with Issues**: ${report.scannedFiles}
- **Critical Issues**: ${report.summary.errors}
- **Warnings**: ${report.summary.warnings}
- **Information Items**: ${report.summary.info}
- **Controls Covered**: ${report.summary.controlsCovered}/${report.summary.totalControls}

## About ${standardName}

${this.getStandardDescription(standard)}

## Detailed Findings

${report.issues.length === 0 ? 
    '🎉 **No compliance issues found for this standard!**' :
    report.issues.map(issue => `
### ${issue.control}: ${issue.message}

- **File**: \`${issue.file}:${issue.line}\`
- **Severity**: ${issue.severity.toUpperCase()}
- **Remediation**: ${issue.remediation}

`).join('')}

---
*Report generated by FedRAMP Compliance Scanner v1.1.0*
`;
    }
}
