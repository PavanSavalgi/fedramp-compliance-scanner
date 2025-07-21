"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const cloudManager_1 = require("./cloud/cloudManager");
const analyticsDashboard_1 = require("./analytics/analyticsDashboard");
function activate(context) {
    console.log('🚀 FedRAMP Compliance Scanner v2.9.0 activated with advanced cloud infrastructure analytics!');
    // Create diagnostic collection for problems
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
    // Initialize cloud infrastructure manager
    const cloudManager = new cloudManager_1.CloudInfrastructureManager();
    // Initialize analytics dashboard
    const analyticsDashboard = new analyticsDashboard_1.AnalyticsDashboard(context);
    // Command 1: Test Command
    console.log('📋 Registering test command...');
    const testCmd = vscode.commands.registerCommand('fedramp.test', () => {
        console.log('🧪 Test command executed successfully!');
        vscode.window.showInformationMessage('🧪 FedRAMP Extension v2.9.0 is working perfectly with cloud integration!');
    });
    // Command 2: Scan Workspace Command
    console.log('📁 Registering scan workspace command...');
    const scanWorkspaceCmd = vscode.commands.registerCommand('fedramp.scanWorkspace', async () => {
        console.log('📁 Scan workspace command executed!');
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open to scan');
            return;
        }
        vscode.window.showInformationMessage('🔍 Scanning workspace for FedRAMP compliance...');
        try {
            // Clear previous diagnostics
            diagnosticCollection.clear();
            // Scan all supported files in workspace
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const supportedExtensions = ['.tf', '.yaml', '.yml', '.json', '.hcl', '.md'];
            let scannedFiles = 0;
            let issuesFound = 0;
            for (const ext of supportedExtensions) {
                const pattern = new vscode.RelativePattern(workspaceFolder, `**/*${ext}`);
                const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
                for (const file of files) {
                    const issues = await scanFile(file);
                    if (issues.length > 0) {
                        diagnosticCollection.set(file, issues);
                        issuesFound += issues.length;
                    }
                    scannedFiles++;
                }
            }
            vscode.window.showInformationMessage(`✅ Workspace scan complete! ${scannedFiles} files scanned, ${issuesFound} compliance issues found`);
            if (issuesFound > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ Workspace scan failed: ${error}`);
        }
    });
    // Command 3: Scan Current File Command
    console.log('📄 Registering scan current file command...');
    const scanCurrentFileCmd = vscode.commands.registerCommand('fedramp.scanCurrentFile', async () => {
        console.log('📄 Scan current file command executed!');
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to scan');
            return;
        }
        vscode.window.showInformationMessage('🔍 Scanning current file for FedRAMP compliance...');
        try {
            const issues = await scanFile(activeEditor.document.uri);
            diagnosticCollection.set(activeEditor.document.uri, issues);
            vscode.window.showInformationMessage(`✅ File scan complete! ${issues.length} compliance issues found`);
            if (issues.length > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ File scan failed: ${error}`);
        }
    });
    // Command 4: Generate Report Command (with PDF export)
    console.log('📊 Registering generate report command...');
    const reportCmd = vscode.commands.registerCommand('fedramp.generateReport', async () => {
        console.log('📊 Generate report command executed!');
        // Show progress
        vscode.window.showInformationMessage('🔄 Generating FedRAMP Compliance Report with scan results...');
        // Collect scan results from diagnostics
        const scanResults = {
            totalFiles: 0,
            totalIssues: 0,
            issuesByFile: new Map(),
            issuesByType: new Map(),
            scanTimestamp: new Date().toLocaleString()
        };
        // Get all diagnostics from our collection
        diagnosticCollection.forEach((uri, diagnostics) => {
            if (diagnostics.length > 0) {
                scanResults.totalFiles++;
                scanResults.totalIssues += diagnostics.length;
                scanResults.issuesByFile.set(uri.fsPath, [...diagnostics]);
                // Count issues by type
                diagnostics.forEach(diagnostic => {
                    const match = diagnostic.message.match(/\[([^\]]+)\]/);
                    const control = match ? match[1] : 'Unknown';
                    scanResults.issuesByType.set(control, (scanResults.issuesByType.get(control) || 0) + 1);
                });
            }
        });
        // Create webview panel
        const panel = vscode.window.createWebviewPanel('fedRAMPReport', 'FedRAMP Compliance Report v2.9.0 - Enhanced with Browser Print', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Handle messages from webview (for export functionality)
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'export':
                    await handleExportRequest(message.format, message.data, scanResults);
                    break;
                case 'print':
                    await handlePrintRequest(message.data, scanResults);
                    break;
            }
        });
        // Generate enhanced report HTML with actual scan results
        panel.webview.html = generateEnhancedReportHTML(scanResults);
        console.log('✅ Report generated successfully with scan results!');
        vscode.window.showInformationMessage(`✅ FedRAMP Compliance Report generated! ${scanResults.totalIssues} issues found across ${scanResults.totalFiles} files`);
    });
    // Command 5: Clear Problems Command
    console.log('🧹 Registering clear problems command...');
    const clearCmd = vscode.commands.registerCommand('fedramp.clearProblems', () => {
        console.log('🧹 Clear problems command executed!');
        diagnosticCollection.clear();
        vscode.window.showInformationMessage('🧹 Compliance problems cleared!');
    });
    // Command 6: Show Problems Command
    console.log('⚠️ Registering show problems command...');
    const showProblemsCmd = vscode.commands.registerCommand('fedramp.showProblems', () => {
        console.log('⚠️ Show problems command executed!');
        vscode.commands.executeCommand('workbench.panel.markers.view.focus');
    });
    // Cloud Integration Commands - NEW in v2.7.0
    console.log('☁️ Registering cloud integration commands...');
    // Command 7: Connect to AWS
    const connectAWSCmd = vscode.commands.registerCommand('fedramp.connectAWS', async () => {
        console.log('☁️ Connect AWS command executed!');
        const connected = await cloudManager.connectToCloud('aws');
        if (connected) {
            vscode.window.showInformationMessage('✅ Successfully connected to AWS!');
        }
    });
    // Command 8: Scan Cloud Infrastructure
    const scanCloudCmd = vscode.commands.registerCommand('fedramp.scanCloudInfra', async () => {
        console.log('🔍 Scan cloud infrastructure command executed!');
        if (!cloudManager.isConnected()) {
            vscode.window.showWarningMessage('Please connect to a cloud provider first', 'Connect to AWS').then(action => {
                if (action === 'Connect to AWS') {
                    vscode.commands.executeCommand('fedramp.connectAWS');
                }
            });
            return;
        }
        const report = await cloudManager.scanCloudInfrastructure();
        if (report) {
            vscode.window.showInformationMessage(`✅ Cloud scan complete! Compliance Score: ${report.complianceScore}% (${report.issues.length} issues found)`);
        }
    });
    // Command 9: Generate Cloud Compliance Report
    const cloudReportCmd = vscode.commands.registerCommand('fedramp.cloudComplianceReport', async () => {
        console.log('📊 Generate cloud compliance report command executed!');
        await cloudManager.exportCloudReport('html');
    });
    // Command 10: Monitor Cloud Drift
    const monitorDriftCmd = vscode.commands.registerCommand('fedramp.monitorCloudDrift', async () => {
        console.log('👁️ Monitor cloud drift command executed!');
        if (!cloudManager.isConnected()) {
            vscode.window.showWarningMessage('Please connect to a cloud provider first');
            return;
        }
        const isCurrentlyMonitoring = false; // TODO: Get actual monitoring status
        if (isCurrentlyMonitoring) {
            cloudManager.stopMonitoring();
        }
        else {
            const intervalMinutes = await vscode.window.showInputBox({
                prompt: 'Enter monitoring interval in minutes',
                value: '30',
                placeHolder: '30'
            });
            if (intervalMinutes) {
                await cloudManager.startMonitoring({
                    checkInterval: parseInt(intervalMinutes) || 30
                });
            }
        }
    });
    // Command 11: Cloud Settings
    const cloudSettingsCmd = vscode.commands.registerCommand('fedramp.cloudSettings', async () => {
        console.log('⚙️ Cloud settings command executed!');
        const status = cloudManager.getConnectionStatus();
        const options = [
            {
                label: '🔌 Connect to AWS',
                detail: 'Connect to Amazon Web Services'
            },
            {
                label: '🔌 Disconnect',
                detail: 'Disconnect from current cloud provider'
            },
            {
                label: '📊 Connection Status',
                detail: status.connected ?
                    `Connected to ${status.provider} (${status.region})` :
                    'Not connected'
            },
            {
                label: '⚙️ Open Settings',
                detail: 'Open VS Code settings for cloud configuration'
            }
        ];
        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select cloud action',
            title: 'FedRAMP Cloud Integration'
        });
        switch (selection?.label) {
            case '🔌 Connect to AWS':
                vscode.commands.executeCommand('fedramp.connectAWS');
                break;
            case '🔌 Disconnect':
                await cloudManager.disconnectFromCloud();
                break;
            case '⚙️ Open Settings':
                vscode.commands.executeCommand('workbench.action.openSettings', 'fedrampCompliance.cloud');
                break;
        }
    });
    // Command 12: Analytics Dashboard
    const analyticsDashboardCmd = vscode.commands.registerCommand('fedramp.analyticsDashboard', async () => {
        console.log('📊 Analytics dashboard command executed!');
        try {
            // Check if cloud manager is connected
            const isConnected = cloudManager.isConnected();
            if (!isConnected) {
                const connectFirst = await vscode.window.showInformationMessage('Not connected to any cloud provider. Would you like to connect to AWS first?', 'Connect to AWS', 'Show Empty Dashboard', 'Cancel');
                if (connectFirst === 'Connect to AWS') {
                    await vscode.commands.executeCommand('fedramp.connectAWS');
                    return;
                }
                else if (connectFirst === 'Cancel') {
                    return;
                }
                // Continue to show empty dashboard
            }
            // Show analytics dashboard
            await analyticsDashboard.showDashboard();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open analytics dashboard: ${error}`);
        }
    });
    // Add all commands to subscriptions
    context.subscriptions.push(testCmd, scanWorkspaceCmd, scanCurrentFileCmd, reportCmd, clearCmd, showProblemsCmd, 
    // Cloud integration commands
    connectAWSCmd, scanCloudCmd, cloudReportCmd, monitorDriftCmd, cloudSettingsCmd, analyticsDashboardCmd, diagnosticCollection);
    console.log('✅ All 12 commands registered successfully (6 core + 6 cloud & analytics)!');
    // Show welcome message
    vscode.window.showInformationMessage('🛡️ FedRAMP Compliance Scanner v2.9.0 activated! Now with advanced cloud analytics:', 'Test Extension', 'Scan Workspace', 'Connect to AWS', 'Generate Report').then(selection => {
        switch (selection) {
            case 'Test Extension':
                vscode.commands.executeCommand('fedramp.test');
                break;
            case 'Scan Workspace':
                vscode.commands.executeCommand('fedramp.scanWorkspace');
                break;
            case 'Connect to AWS':
                vscode.commands.executeCommand('fedramp.connectAWS');
                break;
            case 'Generate Report':
                vscode.commands.executeCommand('fedramp.generateReport');
                break;
        }
    });
    // Cleanup function
    context.subscriptions.push({
        dispose: () => {
            cloudManager.dispose();
        }
    });
    console.log('✅ FedRAMP Compliance Scanner v2.9.0 activation completed successfully!');
}
// File scanning function
async function scanFile(uri) {
    const diagnostics = [];
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        const text = document.getText();
        const fileName = path.basename(uri.fsPath);
        // Sample compliance checks
        const lines = text.split('\n');
        lines.forEach((line, lineNumber) => {
            // Check for common security violations
            if (line.includes('password') && line.includes('=')) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, 0, lineNumber, line.length), '[AC-2] Hardcoded password detected - Use secure credential management', vscode.DiagnosticSeverity.Error));
            }
            if (line.includes('http://')) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, 0, lineNumber, line.length), '[SC-8] Unencrypted HTTP connection - Use HTTPS for data protection', vscode.DiagnosticSeverity.Warning));
            }
            if (line.includes('public_ip') || line.includes('0.0.0.0/0')) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, 0, lineNumber, line.length), '[AC-3] Overly permissive network access - Restrict IP ranges', vscode.DiagnosticSeverity.Warning));
            }
            if (line.includes('encryption') && line.includes('false')) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, 0, lineNumber, line.length), '[SC-13] Encryption disabled - Enable encryption for data protection', vscode.DiagnosticSeverity.Error));
            }
        });
    }
    catch (error) {
        console.error(`Error scanning file ${uri.fsPath}:`, error);
    }
    return diagnostics;
}
// AI-based suggestions for compliance issues
function generateAISuggestions(control, issue) {
    const suggestionMap = {
        'AC-2': {
            'hardcoded password': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions:</h5>
                    <ul>
                        <li><strong>Immediate:</strong> Replace hardcoded passwords with environment variables or secure vaults (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)</li>
                        <li><strong>Implementation:</strong> Use <code>process.env.PASSWORD</code> or secure credential injection at runtime</li>
                        <li><strong>Security:</strong> Implement password rotation policies and access logging</li>
                        <li><strong>Best Practice:</strong> Use service accounts with role-based access instead of shared credentials</li>
                    </ul>
                    <div class="code-example">
                        <strong>Example Fix:</strong><br>
                        <code style="background: #f8f9fa; padding: 10px; display: block; margin: 5px 0;">
                        // ❌ Bad: password = "mypassword123"<br>
                        // ✅ Good: password = process.env.DB_PASSWORD
                        </code>
                    </div>
                </div>
            `
        },
        'SC-8': {
            'unencrypted http': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions:</h5>
                    <ul>
                        <li><strong>Immediate:</strong> Replace all HTTP URLs with HTTPS equivalents</li>
                        <li><strong>Certificate:</strong> Obtain valid SSL/TLS certificates (Let's Encrypt for free certificates)</li>
                        <li><strong>Configuration:</strong> Configure web servers to redirect HTTP to HTTPS automatically</li>
                        <li><strong>Compliance:</strong> Implement HTTP Strict Transport Security (HSTS) headers</li>
                    </ul>
                    <div class="code-example">
                        <strong>Example Fix:</strong><br>
                        <code style="background: #f8f9fa; padding: 10px; display: block; margin: 5px 0;">
                        // ❌ Bad: http://api.example.com<br>
                        // ✅ Good: https://api.example.com
                        </code>
                    </div>
                </div>
            `
        },
        'AC-3': {
            'overly permissive': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions:</h5>
                    <ul>
                        <li><strong>Principle:</strong> Apply least privilege access - restrict to specific IP ranges or subnets</li>
                        <li><strong>Network Segmentation:</strong> Use VPCs, security groups, and network ACLs to limit access</li>
                        <li><strong>Monitoring:</strong> Implement network access logging and anomaly detection</li>
                        <li><strong>Zero Trust:</strong> Consider implementing zero-trust network architecture</li>
                    </ul>
                    <div class="code-example">
                        <strong>Example Fix:</strong><br>
                        <code style="background: #f8f9fa; padding: 10px; display: block; margin: 5px 0;">
                        // ❌ Bad: cidr_blocks = ["0.0.0.0/0"]<br>
                        // ✅ Good: cidr_blocks = ["10.0.1.0/24", "192.168.1.0/24"]
                        </code>
                    </div>
                </div>
            `
        },
        'SC-13': {
            'encryption disabled': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions:</h5>
                    <ul>
                        <li><strong>Data at Rest:</strong> Enable encryption for databases, storage volumes, and backups</li>
                        <li><strong>Data in Transit:</strong> Use TLS 1.2+ for all network communications</li>
                        <li><strong>Key Management:</strong> Implement proper key rotation and secure key storage</li>
                        <li><strong>Compliance:</strong> Use FIPS 140-2 validated encryption modules for FedRAMP</li>
                    </ul>
                    <div class="code-example">
                        <strong>Example Fix:</strong><br>
                        <code style="background: #f8f9fa; padding: 10px; display: block; margin: 5px 0;">
                        // ❌ Bad: encryption = false<br>
                        // ✅ Good: encryption = true, kms_key_id = "arn:aws:kms:..."
                        </code>
                    </div>
                </div>
            `
        }
    };
    // Extract control type from issue message
    const controlType = control.match(/\[(.*?)\]/)?.[1] || control;
    // Find matching suggestion based on issue content
    for (const [issueType, suggestion] of Object.entries(suggestionMap[controlType] || {})) {
        if (issue.toLowerCase().includes(issueType.toLowerCase())) {
            return suggestion;
        }
    }
    // Generic AI suggestion if no specific match found
    return `
        <div class="ai-suggestion">
            <h5>🤖 AI Remediation Suggestions:</h5>
            <ul>
                <li><strong>Review:</strong> Examine the flagged code for compliance with ${controlType} requirements</li>
                <li><strong>Documentation:</strong> Consult FedRAMP security controls documentation</li>
                <li><strong>Best Practices:</strong> Implement industry-standard security measures</li>
                <li><strong>Testing:</strong> Validate fixes with security scanning tools</li>
            </ul>
        </div>
    `;
}
// Enhanced report generation with actual scan results and PDF export
//# sourceMappingURL=temp_part1.js.map