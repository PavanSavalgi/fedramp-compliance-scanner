import * as vscode from 'vscode';
import { LiveComplianceScanner } from './liveComplianceScanner';
import { SimpleReportGenerator } from './simpleReportGenerator';
import { generateCoverageReport, COVERAGE_SUMMARY } from './awsConformancePackAnalysis';

let liveScanner: LiveComplianceScanner;
let reportGenerator: SimpleReportGenerator;

function generateCoverageWebview(markdownContent: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AWS Config Conformance Pack Coverage</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            h1, h2, h3, h4 {
                color: var(--vscode-textPreformat-foreground);
                margin-top: 2em;
                margin-bottom: 1em;
            }
            h1 {
                border-bottom: 2px solid var(--vscode-textSeparator-foreground);
                padding-bottom: 10px;
            }
            h2 {
                border-bottom: 1px solid var(--vscode-textSeparator-foreground);
                padding-bottom: 5px;
            }
            .coverage-summary {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .coverage-high { color: #4caf50; }
            .coverage-medium { color: #ff9800; }
            .coverage-low { color: #f44336; }
            ul, ol {
                padding-left: 20px;
            }
            li {
                margin: 5px 0;
            }
            code {
                background-color: var(--vscode-textCodeBlock-background);
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .control-section {
                margin: 20px 0;
                padding: 15px;
                border-left: 4px solid var(--vscode-textLink-foreground);
                background-color: var(--vscode-editor-inactiveSelectionBackground);
            }
            .rule-item {
                background-color: var(--vscode-input-background);
                padding: 8px;
                margin: 5px 0;
                border-radius: 3px;
                border-left: 3px solid var(--vscode-textLink-foreground);
            }
            .severity-critical { border-left-color: #f44336; }
            .severity-high { border-left-color: #ff9800; }
            .severity-medium { border-left-color: #2196f3; }
            .severity-low { border-left-color: #4caf50; }
        </style>
    </head>
    <body>
        <div class="container">
            ${convertMarkdownToHTML(markdownContent)}
        </div>
    </body>
    </html>
    `;
}

function convertMarkdownToHTML(markdown: string): string {
    return markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
        .replace(/---/g, '<hr>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.*)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
        .replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')
        .replace(/<p>(<hr>)<\/p>/g, '$1')
        .replace(/Coverage: (\d+)%/g, (match, percentage) => {
            const num = parseInt(percentage);
            const cssClass = num >= 70 ? 'coverage-high' : num >= 50 ? 'coverage-medium' : 'coverage-low';
            return `Coverage: <span class="${cssClass}">${percentage}%</span>`;
        });
}

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 FedRAMP Compliance Scanner activated');

    // Initialize the live scanner
    liveScanner = new LiveComplianceScanner();
    reportGenerator = new SimpleReportGenerator(liveScanner);

    // Register commands
    const commands = [
        // Core scanning commands
        vscode.commands.registerCommand('fedramp.scanWorkspace', async () => {
            await liveScanner.scanWorkspace();
        }),

        vscode.commands.registerCommand('fedramp.scanCurrentFile', async () => {
            await liveScanner.scanCurrentFile();
        }),

        vscode.commands.registerCommand('fedramp.toggleLiveScanning', () => {
            liveScanner.toggleScanning();
        }),

        // Reporting command
        vscode.commands.registerCommand('fedramp.generateReport', async () => {
            await reportGenerator.generateReport();
        }),

        // AWS Config Conformance Pack Coverage
        vscode.commands.registerCommand('fedramp.showAWSConformancePackCoverage', async () => {
            const panel = vscode.window.createWebviewPanel(
                'awsConformanceCoverage',
                'AWS Config Conformance Pack Coverage for FedRAMP',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            const coverageReport = generateCoverageReport();
            const htmlContent = generateCoverageWebview(coverageReport);
            panel.webview.html = htmlContent;
        }),

        // Quick actions
        vscode.commands.registerCommand('fedramp.showProblems', () => {
            vscode.commands.executeCommand('workbench.panel.markers.view.focus');
        }),

        vscode.commands.registerCommand('fedramp.clearProblems', () => {
            liveScanner['diagnosticCollection'].clear();
            vscode.window.showInformationMessage('Compliance problems cleared');
        })
    ];

    // Add all commands to subscriptions
    context.subscriptions.push(...commands);
    context.subscriptions.push(liveScanner);

    // Show welcome message
    vscode.window.showInformationMessage(
        '🛡️ FedRAMP Compliance Scanner is ready! Live scanning is enabled.',
        'Scan Workspace',
        'Generate Report'
    ).then(selection => {
        switch (selection) {
            case 'Scan Workspace':
                vscode.commands.executeCommand('fedramp.scanWorkspace');
                break;
            case 'Generate Report':
                vscode.commands.executeCommand('fedramp.generateReport');
                break;
        }
    });

    // Start with initial workspace scan if enabled
    const config = vscode.workspace.getConfiguration('fedrampCompliance');
    const autoScan = config.get('autoScanOnActivation', true);
    
    if (autoScan) {
        // Delay initial scan to allow workspace to fully load
        setTimeout(() => {
            liveScanner.scanWorkspace();
        }, 2000);
    }
}

export function deactivate(): void {
    console.log('👋 FedRAMP Compliance Scanner deactivated');
    
    if (liveScanner) {
        liveScanner.dispose();
    }
}
