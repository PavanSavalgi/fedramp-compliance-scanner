import * as vscode from 'vscode';
import { LiveComplianceScanner } from './liveComplianceScanner';
import { SimpleReportGenerator } from './simpleReportGenerator';

let liveScanner: LiveComplianceScanner;
let reportGenerator: SimpleReportGenerator;

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
