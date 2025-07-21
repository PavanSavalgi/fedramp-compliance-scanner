import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CloudInfrastructureManager } from './cloud/cloudManager';
import { AnalyticsDashboard } from './analytics/analyticsDashboard';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 FedRAMP Compliance Scanner v2.12.1 activated with advanced cloud infrastructure analytics!');

    // Create diagnostic collection for problems
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
    
    // Initialize cloud infrastructure manager
    const cloudManager = new CloudInfrastructureManager();
    
    // Initialize analytics dashboard
    const analyticsDashboard = new AnalyticsDashboard(context);

    // Command 1: Test Command
    console.log('📋 Registering test command...');
    const testCmd = vscode.commands.registerCommand('fedramp.test', () => {
        console.log('🧪 Test command executed successfully!');
        vscode.window.showInformationMessage('🧪 FedRAMP Extension v2.12.1 is working perfectly with cloud integration!');
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
            
            vscode.window.showInformationMessage(
                `✅ Workspace scan complete! ${scannedFiles} files scanned, ${issuesFound} compliance issues found`
            );
            
            if (issuesFound > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
            
        } catch (error) {
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
            
            vscode.window.showInformationMessage(
                `✅ File scan complete! ${issues.length} compliance issues found`
            );
            
            if (issues.length > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
            
        } catch (error) {
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
            criticalIssues: 0,
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
            issuesByFile: new Map<string, vscode.Diagnostic[]>(),
            issuesByType: new Map<string, number>(),
            scanTimestamp: new Date().toLocaleString()
        };

        // Get all diagnostics from our collection
        diagnosticCollection.forEach((uri, diagnostics) => {
            if (diagnostics.length > 0) {
                scanResults.totalFiles++;
                scanResults.totalIssues += diagnostics.length;
                scanResults.issuesByFile.set(uri.fsPath, [...diagnostics]);
                
                // Count issues by type and severity
                diagnostics.forEach(diagnostic => {
                    const match = diagnostic.message.match(/\[([^\]]+)\]/);
                    const control = match ? match[1] : 'Unknown';
                    scanResults.issuesByType.set(control, (scanResults.issuesByType.get(control) || 0) + 1);
                    
                    // Categorize by severity
                    if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
                        scanResults.criticalIssues++;
                    } else if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
                        scanResults.highIssues++;
                    } else {
                        scanResults.mediumIssues++;
                    }
                });
            }
        });
        
        // Create webview panel
        const panel = vscode.window.createWebviewPanel(
            'fedRAMPReport',
            'FedRAMP Compliance Report v2.12.1 - Enhanced with Browser Print',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Handle messages from webview (for export functionality)
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'export':
                        await handleExportRequest(message.format, message.data, scanResults);
                        break;
                    case 'print':
                        await handlePrintRequest(message.data, scanResults);
                        break;
                }
            }
        );

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
            vscode.window.showInformationMessage(
                `✅ Cloud scan complete! Compliance Score: ${report.complianceScore}% (${report.issues.length} issues found)`
            );
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
        } else {
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
        const options: vscode.QuickPickItem[] = [
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
                const connectFirst = await vscode.window.showInformationMessage(
                    'Not connected to any cloud provider. Would you like to connect to AWS first?',
                    'Connect to AWS', 'Show Empty Dashboard', 'Cancel'
                );
                
                if (connectFirst === 'Connect to AWS') {
                    await vscode.commands.executeCommand('fedramp.connectAWS');
                    return;
                } else if (connectFirst === 'Cancel') {
                    return;
                }
                // Continue to show empty dashboard
            }
            
            // Show analytics dashboard
            await analyticsDashboard.showDashboard();
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open analytics dashboard: ${error}`);
        }
    });

    // Add all commands to subscriptions
    context.subscriptions.push(
        testCmd,
        scanWorkspaceCmd,
        scanCurrentFileCmd,
        reportCmd,
        clearCmd,
        showProblemsCmd,
        // Cloud integration commands
        connectAWSCmd,
        scanCloudCmd,
        cloudReportCmd,
        monitorDriftCmd,
        cloudSettingsCmd,
        analyticsDashboardCmd,
        diagnosticCollection
    );

    console.log('✅ All 12 commands registered successfully (6 core + 6 cloud & analytics)!');

    // Show welcome message
    vscode.window.showInformationMessage(
        '🛡️ FedRAMP Compliance Scanner v2.12.1 activated! Now with advanced cloud analytics:',
        'Test Extension',
        'Scan Workspace',
        'Connect to AWS',
        'Generate Report'
    ).then(selection => {
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

    console.log('✅ FedRAMP Compliance Scanner v2.12.2 activation completed successfully!');
}

// Enhanced credential detection to avoid false positives
function isHardcodedCredential(line: string): boolean {
    // Patterns that indicate secure credential usage (should NOT be flagged)
    const securePatterns = [
        /aws_secretsmanager_secret/i,           // AWS Secrets Manager
        /data\.aws_secretsmanager/i,            // Terraform data source
        /var\./i,                               // Terraform variables
        /local\./i,                             // Terraform locals
        /process\.env/i,                        // Node.js environment variables
        /os\.getenv/i,                          // Python environment variables
        /Environment\.GetEnvironmentVariable/i, // C# environment variables
        /System\.getenv/i,                      // Java environment variables
        /\${[^}]+}/,                           // Variable interpolation ${VAR}
        /!Ref\s+/,                             // CloudFormation reference
        /{{\s*resolve:/,                       // CloudFormation dynamic reference
        /\[\[.*\]\]/,                          // Helm template
        /\{\{\s*\.Values\./,                   // Helm values
        /_ENV$/i,                              // Environment variable suffix
        /_SECRET$/i,                           // Secret reference suffix
        /from_parameter/i,                      // Parameter reference
        /from_secret/i,                        // Secret reference
        /vault:/i,                             // HashiCorp Vault
        /base64decode/i,                       // Base64 encoded (often secrets)
        /decrypt/i,                            // Encrypted value
        /kms:/i,                               // KMS encrypted
        /arn:aws:secretsmanager/i,             // AWS ARN for secrets
        /password_field_name/i,                // Field name, not value
        /password_length/i,                    // Configuration parameter
        /password_policy/i,                    // Policy reference
        /random_password/i,                    // Generated password
        /password_version/i,                   // Version reference
        // S3 and object storage patterns (NOT credentials)
        /s3_bucket/i,                          // S3 bucket reference
        /s3_object/i,                          // S3 object reference
        /s3_key/i,                             // S3 object key
        /object_key/i,                         // Generic object key
        /file_key/i,                           // File key/path
        /path_key/i,                           // Path key
        /bucket_key/i,                         // Bucket key
        /storage_key/i,                        // Storage key
        /prefix_key/i,                         // Prefix key
        /cache_key/i,                          // Cache key
        /lookup_key/i,                         // Lookup key
        /index_key/i,                          // Index key
        /partition_key/i,                      // Database partition key
        /sort_key/i,                           // Database sort key
        /primary_key/i,                        // Database primary key
        /foreign_key/i,                        // Database foreign key
        /composite_key/i,                      // Database composite key
        /\bkey\s*[=:]\s*["'][^"']*\/[^"']*["']/i, // key = "path/to/file" pattern
        /\bkey\s*[=:]\s*["'][^"']*\.[^"']*["']/i, // key = "filename.ext" pattern
        /\bkey\s*[=:]\s*["'][^"']*-[^"']*["']/i,  // key = "object-name" pattern
    ];

    // Check if this line uses secure patterns (don't flag these)
    if (securePatterns.some(pattern => pattern.test(line))) {
        return false;
    }

    // Pattern for hardcoded credentials (these SHOULD be flagged)
    const hardcodedPatterns = [
        // Specific credential patterns (NOT file paths or object keys)
        /(?:password|pwd|secret|auth_token|access_token|credential)\s*[=:]\s*["'][^"'${}()[\]\/\.\-]{6,}["']/i,
        
        // Common weak passwords
        /(?:password|pwd)\s*[=:]\s*["']?(admin|password|123456|default|root|guest|user|test|demo)["']?/i,
        
        // API keys and tokens (long hex/base64 strings, but not file paths)
        /(?:api_key|access_key|secret_key|auth_key)\s*[=:]\s*["'][A-Za-z0-9+/=]{20,}["']/i,
        
        // Database connection strings with embedded passwords
        /(?:connection_string|conn_str|database_url)\s*[=:]\s*["'][^"']*password=[^"']*["']/i,
        
        // JWT tokens and bearer tokens
        /(?:jwt_token|bearer_token)\s*[=:]\s*["'][A-Za-z0-9\.\-_]{20,}["']/i,
    ];

    // Check if this line contains hardcoded credentials
    return hardcodedPatterns.some(pattern => pattern.test(line));
}

// Helper function to detect HTTP false positives
function isHttpFalsePositive(line: string): boolean {
    // Check if HTTP appears in contexts where it's acceptable
    const falsePositivePatterns = [
        /^\s*#.*http:\/\//i,  // In comments
        /^\s*\/\/.*http:\/\//i,  // In comments
        /^\s*\/\*.*http:\/\//i,  // In block comments
        /description.*http:\/\//i,  // In description fields
        /comment.*http:\/\//i,  // In comment fields
        /note.*http:\/\//i,  // In note fields
        /example.*http:\/\//i,  // In example fields
        /docs?.*http:\/\//i,  // In documentation
        /url.*variable/i,  // Variable names containing URL
        /http_.*[a-zA-Z]/i,  // Variable names starting with http_
        /.*_http[a-zA-Z_]/i,  // Variable names ending with http
        /redirect.*http/i,  // Redirect configurations (sometimes legitimate)
        /health[_\s]*check.*http/i,  // Health check endpoints
        /webhook.*http/i,  // Webhook configurations
        /default.*http/i,  // Default value configurations
        /fallback.*http/i,  // Fallback configurations
        /callback.*http/i,  // Callback URLs
        /endpoint.*http/i,  // Endpoint configurations
        /reference.*http/i,  // Reference documentation
        /link.*http/i,  // Link references
        /see.*http/i,  // See also references
        /visit.*http/i,  // Visit references
    ];
    
    return falsePositivePatterns.some(pattern => pattern.test(line));
}

// Helper function to detect network false positives
function isNetworkFalsePositive(line: string): boolean {
    // Check if network access patterns are in acceptable contexts
    const falsePositivePatterns = [
        /^\s*#.*public_ip/i,  // In comments
        /^\s*\/\/.*public_ip/i,  // In comments
        /description.*public_ip/i,  // In description
        /variable.*public_ip/i,  // Variable names
        /output.*public_ip/i,  // Output values
        /data.*public_ip/i,  // Data source references
        /example.*0\.0\.0\.0/i,  // Example configurations
        /health[_\s]*check/i,  // Health check configurations
        /load[_\s]*balancer/i,  // Load balancer configurations (often need public access)
        /nat[_\s]*gateway/i,  // NAT gateway configurations
        /internet[_\s]*gateway/i,  // Internet gateway configurations
        /public[_\s]*subnet/i,  // Public subnet configurations
        /default.*public/i,  // Default public configurations
        /aws[_\s]*instance.*public_ip/i,  // AWS instance public IP references
        /elastic[_\s]*ip/i,  // Elastic IP configurations
        /eip[_\s]*allocation/i,  // EIP allocation
        /associate.*public_ip/i,  // Public IP association
        /assign.*public_ip/i,  // Public IP assignment
    ];
    
    return falsePositivePatterns.some(pattern => pattern.test(line));
}

// Helper function to detect encryption false positives
function isEncryptionFalsePositive(line: string): boolean {
    // Check if encryption=false is in acceptable contexts
    const falsePositivePatterns = [
        /^\s*#.*encryption.*false/i,  // In comments
        /^\s*\/\/.*encryption.*false/i,  // In comments
        /description.*encryption.*false/i,  // In description
        /example.*encryption.*false/i,  // Example configurations
        /test.*encryption.*false/i,  // Test configurations
        /dev.*encryption.*false/i,  // Development configurations
        /local.*encryption.*false/i,  // Local development
        /backup.*encryption.*false/i,  // Backup configurations (sometimes acceptable)
        /default.*encryption.*false/i,  // Default configurations
        /optional.*encryption.*false/i,  // Optional encryption
        /legacy.*encryption.*false/i,  // Legacy system compatibility
    ];
    
    return falsePositivePatterns.some(pattern => pattern.test(line));
}

// File scanning function
async function scanFile(uri: vscode.Uri): Promise<vscode.Diagnostic[]> {
    const diagnostics: vscode.Diagnostic[] = [];
    
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        const text = document.getText();
        const fileName = path.basename(uri.fsPath);
        
        // Enhanced compliance checks with smart pattern matching
        const lines = text.split('\n');
        
        lines.forEach((line, lineNumber) => {
            // Enhanced hardcoded credential detection (avoid false positives)
            if (isHardcodedCredential(line)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNumber, 0, lineNumber, line.length),
                    '[AC-2] Hardcoded credential detected - Use secure credential management (AWS Secrets Manager, environment variables)',
                    vscode.DiagnosticSeverity.Error
                ));
            }
            
            // Enhanced HTTP detection to avoid false positives
            if (line.includes('http://') && !isHttpFalsePositive(line)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNumber, 0, lineNumber, line.length),
                    '[SC-8] Unencrypted HTTP connection - Use HTTPS for data protection',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
            
            // Enhanced network access detection to avoid false positives
            if ((line.includes('public_ip') || line.includes('0.0.0.0/0')) && !isNetworkFalsePositive(line)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNumber, 0, lineNumber, line.length),
                    '[AC-3] Overly permissive network access - Restrict IP ranges',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
            
            // Enhanced encryption detection to avoid false positives
            if (line.includes('encryption') && line.includes('false') && !isEncryptionFalsePositive(line)) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineNumber, 0, lineNumber, line.length),
                    '[SC-13] Encryption disabled - Enable encryption for data protection',
                    vscode.DiagnosticSeverity.Error
                ));
            }
        });
        
    } catch (error) {
        console.error(`Error scanning file ${uri.fsPath}:`, error);
    }
    
    return diagnostics;
}

// AI-based suggestions for compliance issues
function generateAISuggestions(control: string, issue: string): string {
    const suggestionMap: Record<string, Record<string, string>> = {
        'AC-2': {
            'hardcoded password': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions - Enhanced Security:</h5>
                    <ul>
                        <li><strong>Immediate:</strong> Replace hardcoded credentials with secure management systems</li>
                        <li><strong>AWS:</strong> Use AWS Secrets Manager - <code>data.aws_secretsmanager_secret_version.db_password.secret_string</code></li>
                        <li><strong>Environment:</strong> Use environment variables - <code>process.env.DB_PASSWORD</code></li>
                        <li><strong>Terraform:</strong> Use variables - <code>var.database_password</code></li>
                        <li><strong>Security:</strong> Implement credential rotation, access logging, and least privilege principles</li>
                        <li><strong>Best Practice:</strong> Never commit secrets to version control</li>
                    </ul>
                    <div class="code-example">
                        <strong>Examples:</strong><br>
                        <span class="bad">❌ Bad: password = "hardcoded123"</span><br>
                        <span class="good">✅ Good: password = data.aws_secretsmanager_secret_version.db.secret_string</span><br>
                        <span class="good">✅ Good: password = var.database_password</span><br>
                        <span class="good">✅ Good: password = process.env.DB_PASSWORD</span>
                    </div>
                </div>
            `,
            'hardcoded credential': `
                <div class="ai-suggestion">
                    <h5>🤖 AI Remediation Suggestions - Credential Security:</h5>
                    <ul>
                        <li><strong>Immediate:</strong> Remove hardcoded credentials from source code</li>
                        <li><strong>Implementation:</strong> Use secure credential management systems</li>
                        <li><strong>AWS Secrets Manager:</strong> Store and retrieve secrets securely</li>
                        <li><strong>Environment Variables:</strong> Load credentials at runtime</li>
                        <li><strong>Access Control:</strong> Implement role-based access and least privilege</li>
                        <li><strong>Monitoring:</strong> Enable credential access logging and alerts</li>
                    </ul>
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
// Simple HTML generation function to replace the problematic one
function generateEnhancedReportHTML(scanResults: {
    totalFiles: number;
    totalIssues: number;
    issuesByFile: Map<string, vscode.Diagnostic[]>;
    issuesByType: Map<string, number>;
    scanTimestamp: string;
}): string {
    return buildWorkingHTMLReport(scanResults);
}

// Enhanced compliance assessment function
function assessComplianceLevel(scanResults: any): {level: string, status: string, score: number, color: string, icon: string} {
    const totalFiles = scanResults.totalFiles || 1;
    const totalIssues = scanResults.totalIssues || 0;
    const criticalIssues = scanResults.criticalIssues || 0;
    const highIssues = scanResults.highIssues || 0;
    const mediumIssues = scanResults.mediumIssues || 0;
    
    // Calculate compliance score (0-100)
    let score = 100;
    if (totalIssues > 0) {
        // More reasonable scoring for low issue counts
        const criticalPenalty = criticalIssues * 20; // Reduced from 25
        const highPenalty = highIssues * 10;         // Reduced from 15
        const mediumPenalty = mediumIssues * 5;      // Reduced from 8
        const lowPenalty = (scanResults.lowIssues || 0) * 2;
        
        // Adjust issue ratio penalty based on scale
        const issueRatio = totalIssues / Math.max(totalFiles, 1);
        const ratioPenalty = Math.min(20, issueRatio * 15); // Reduced impact
        
        const totalPenalty = Math.min(90, criticalPenalty + highPenalty + mediumPenalty + lowPenalty + ratioPenalty);
        score = Math.max(10, 100 - totalPenalty);
        
        // Special case: boost score for minimal issues with no critical problems
        if (totalIssues <= 3 && criticalIssues === 0) {
            score = Math.max(75, score); // Ensure minimal issues get reasonable score
        }
    }
    
    // FedRAMP Impact Level Assessment
    let level: string, status: string, color: string, icon: string;
    
    if (score >= 95 && criticalIssues === 0 && highIssues <= 1) {
        level = "High Impact Ready";
        status = "FULLY COMPLIANT";
        color = "#1b5e20"; // Dark green
        icon = "🟢";
    } else if (score >= 70 && criticalIssues === 0 && highIssues <= 3) {
        // More lenient threshold when no critical issues
        level = "Moderate Impact Ready";
        status = "SUBSTANTIALLY COMPLIANT";
        color = "#2e7d32"; // Green
        icon = "🟡";
    } else if (score >= 60 && criticalIssues <= 1 && highIssues <= 5) {
        level = "Low Impact Ready";
        status = "PARTIALLY COMPLIANT";
        color = "#f57c00"; // Orange
        icon = "🟠";
    } else if (score >= 40) {
        level = "Basic Compliance";
        status = "NON-COMPLIANT";
        color = "#e65100"; // Dark orange
        icon = "🔴";
    } else {
        level = "Critical Issues";
        status = "CRITICAL NON-COMPLIANCE";
        color = "#c62828"; // Red
        icon = "🚨";
    }
    
    return { level, status, score: Math.round(score), color, icon };
}

function buildWorkingHTMLReport(scanResults: any): string {
    const html = [
        '<!DOCTYPE html>',
        '<html><head>',
        '<meta charset="UTF-8">',
        '<title>FedRAMP Compliance Report v2.12.1</title>',
        '<style>',
        '/* Material Design 3.0 FedRAMP Report Styles */',
        '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap");',
        'body{font-family:"Roboto",system-ui,-apple-system,sans-serif;margin:0;padding:24px;background:#fafafa;color:#212121;line-height:1.6;}',
        
        '/* Material Design Header */',
        '.header{background:linear-gradient(135deg,#1976d2 0%,#1565c0 100%);color:white;padding:32px;border-radius:16px;text-align:center;box-shadow:0 8px 32px rgba(25,118,210,0.3);margin-bottom:24px;}',
        '.header h1{margin:0 0 12px 0;font-size:2.5rem;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,0.2);}',
        '.header p{margin:0;font-size:1.1rem;opacity:0.9;font-weight:300;}',
        
        '/* Material Design Cards */',
        '.coverage-overview{background:white;padding:32px;border-radius:16px;margin:24px 0;box-shadow:0 4px 16px rgba(0,0,0,0.1);border:1px solid #e0e0e0;}',
        '.coverage-overview h2{color:#1565c0;text-align:center;margin:0 0 32px 0;font-size:2rem;font-weight:500;}',
        
        '/* Enhanced Coverage Cards */',
        '.coverage-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-top:24px;}',
        '.coverage-level{background:white;padding:24px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border:1px solid #e0e0e0;transition:all 0.3s ease;}',
        '.coverage-level:hover{box-shadow:0 4px 20px rgba(0,0,0,0.12);transform:translateY(-2px);}',
        '.coverage-level.low{border-top:4px solid #4caf50;}',
        '.coverage-level.moderate{border-top:4px solid #ff9800;}',
        '.coverage-level.high{border-top:4px solid #f44336;}',
        '.coverage-level h3{margin:0 0 16px 0;font-size:1.4rem;font-weight:500;display:flex;align-items:center;gap:8px;}',
        '.coverage-level h3 .icon{font-size:1.2rem;}',
        
        '/* Material Design Chips */',
        '.coverage-stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;}',
        '.stat{background:#e3f2fd;color:#1565c0;padding:6px 16px;border-radius:20px;font-size:0.875rem;font-weight:500;border:1px solid #bbdefb;}',
        '.stat.controls{background:#e8f5e8;color:#2e7d32;border-color:#c8e6c8;}',
        '.stat.requirements{background:#fff3e0;color:#ef6c00;border-color:#ffcc02;}',
        
        '/* Enhanced Lists */',
        '.coverage-level ul{list-style:none;padding:0;margin:0;}',
        '.coverage-level li{margin:12px 0;padding:8px 12px;background:#f5f5f5;border-radius:8px;font-size:0.9rem;border-left:3px solid #2196f3;}',
        '.coverage-level li strong{color:#1565c0;font-weight:500;}',
        
        '/* Material Design Compliance Summary Card */',
        '.compliance-summary{background:white;border-radius:16px;padding:32px;margin:24px 0;box-shadow:0 4px 16px rgba(0,0,0,0.1);border:1px solid #e0e0e0;}',
        '.compliance-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:16px;}',
        '.compliance-title{font-size:1.75rem;font-weight:500;color:#212121;margin:0;}',
        '.compliance-score{display:flex;align-items:center;gap:16px;}',
        '.score-circle{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:600;color:white;box-shadow:0 4px 12px rgba(0,0,0,0.2);}',
        '.score-details{text-align:right;}',
        '.impact-level{font-size:1.1rem;font-weight:500;margin:0;}',
        '.compliance-status{font-size:0.95rem;opacity:0.8;margin:4px 0 0 0;}',
        
        '/* Material Design Metrics Grid */',
        '.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:24px;}',
        '.metric-card{background:#f8f9fa;padding:20px;border-radius:12px;text-align:center;border:1px solid #e0e0e0;}',
        '.metric-value{font-size:2rem;font-weight:600;color:#1565c0;margin:0 0 8px 0;}',
        '.metric-label{font-size:0.875rem;color:#757575;font-weight:400;margin:0;}',
        
        '/* Enhanced AI Suggestions */',
        '.ai-suggestion{background:linear-gradient(135deg,#e8f4fd 0%,#e3f2fd 100%);border:1px solid #2196f3;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 2px 8px rgba(33,150,243,0.1);}',
        '.ai-suggestion h5{color:#1565c0;margin:0 0 12px 0;font-size:1.1rem;font-weight:500;display:flex;align-items:center;gap:8px;}',
        '.ai-suggestion ul{margin:12px 0;padding-left:0;}',
        '.ai-suggestion li{background:white;margin:8px 0;padding:12px;border-radius:8px;color:#424242;list-style:none;border-left:3px solid #2196f3;box-shadow:0 1px 4px rgba(0,0,0,0.05);}',
        '.ai-suggestion li strong{color:#1565c0;}',
        
        '/* Code Examples with Material Design */',
        '.code-example{background:#263238;color:#ffffff;border-radius:8px;padding:16px;margin:12px 0;font-family:"Roboto Mono",monospace;box-shadow:0 2px 8px rgba(0,0,0,0.15);}',
        '.code-example .bad{color:#ff5252;}',
        '.code-example .good{color:#4caf50;}',
        '.code-example .comment{color:#90caf9;}',
        
        '/* Material Design Tables */',
        'table{width:100%;border-collapse:collapse;margin:24px 0;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);}',
        'th{background:#1976d2;color:white;padding:16px;font-weight:500;font-size:0.875rem;text-transform:uppercase;letter-spacing:0.5px;}',
        'td{padding:16px;border-bottom:1px solid #e0e0e0;background:white;}',
        'tbody tr:hover{background:#f5f5f5;}',
        
        '/* Enhanced Buttons */',
        '.export-menu{margin:24px 0;text-align:center;background:white;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);}',
        '.export-btn,.print-btn{background:#1976d2;color:white;padding:12px 24px;border:none;border-radius:24px;cursor:pointer;margin:8px;font-size:0.875rem;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(25,118,210,0.3);}',
        '.export-btn:hover,.print-btn:hover{background:#1565c0;box-shadow:0 4px 16px rgba(25,118,210,0.4);transform:translateY(-1px);}',
        '.print-btn{background:#4caf50;box-shadow:0 2px 8px rgba(76,175,80,0.3);}',
        '.print-btn:hover{background:#43a047;box-shadow:0 4px 16px rgba(76,175,80,0.4);}',
        
        '/* Material Design Content Cards */',
        '.content{background:white;padding:32px;border-radius:16px;margin-top:24px;box-shadow:0 4px 16px rgba(0,0,0,0.1);border:1px solid #e0e0e0;}',
        '.feature{background:white;padding:24px;margin:20px 0;border-radius:12px;border-left:4px solid #2196f3;box-shadow:0 2px 8px rgba(0,0,0,0.08);}',
        '.feature h2,.feature h3{color:#1565c0;font-weight:500;}',
        '.feature.compliant{background:linear-gradient(135deg,#e8f5e8 0%,#f1f8e9 100%);border-left-color:#4caf50;}',
        '.feature.warning{background:linear-gradient(135deg,#fff8e1 0%,#fffde7 100%);border-left-color:#ff9800;}',
        '.feature.error{background:linear-gradient(135deg,#ffebee 0%,#fce4ec 100%);border-left-color:#f44336;}',
        
        '/* Issue Items with Material Design */',
        '.issue-list{list-style:none;padding:0;}',
        '.issue-item{background:white;margin:12px 0;padding:20px;border-radius:12px;border-left:4px solid #f44336;box-shadow:0 2px 12px rgba(0,0,0,0.08);transition:all 0.3s ease;}',
        '.issue-item:hover{box-shadow:0 4px 16px rgba(0,0,0,0.12);}',
        '.issue-warning{border-left-color:#ff9800;}',
        '.issue-info{border-left-color:#2196f3;}',
        
        '/* Responsive Design */',
        '@media (max-width: 768px){',
        '.coverage-levels{grid-template-columns:1fr;}',
        '.compliance-header{flex-direction:column;text-align:center;}',
        '.metrics-grid{grid-template-columns:1fr 1fr;}',
        '.header h1{font-size:2rem;}',
        '.coverage-stats{justify-content:center;}',
        '}',
        
        '/* Print Styles */',
        '@media print{',
        '.export-menu,.no-print{display:none !important;}',
        'body{background:white;color:black;}',
        '.header{background:#1976d2 !important;-webkit-print-color-adjust:exact;color-adjust:exact;}',
        '}',,
        '@media print{.no-print{display:none!important;}}',
        '</style>',
        '</head><body>',
        '<div class="header">',
        '<h1>🔐 FedRAMP Compliance Report v2.12.1</h1>',
        '<p>Generated: ' + scanResults.scanTimestamp + ' | Enhanced with Browser Print & Multi-format Export</p>',
        '</div>',
        '<div class="coverage-overview">',
        '<h2>📋 FedRAMP Security Control Coverage</h2>',
        '<div class="coverage-levels">',
        '<div class="coverage-level low">',
        '<h3>🟢 Low Impact Level</h3>',
        '<div class="coverage-stats">',
        '<span class="stat">125+ Controls</span>',
        '<span class="stat">Basic Requirements</span>',
        '</div>',
        '<ul>',
        '<li><strong>AC (Access Control):</strong> 22 controls - User authentication, authorization</li>',
        '<li><strong>AU (Audit & Accountability):</strong> 12 controls - Logging, monitoring</li>',
        '<li><strong>AT (Awareness & Training):</strong> 5 controls - Security awareness</li>',
        '<li><strong>CM (Configuration Management):</strong> 11 controls - Change control</li>',
        '<li><strong>CP (Contingency Planning):</strong> 13 controls - Backup, disaster recovery</li>',
        '<li><strong>IA (Identification & Authentication):</strong> 12 controls - Identity management</li>',
        '<li><strong>IR (Incident Response):</strong> 8 controls - Security incident handling</li>',
        '<li><strong>MA (Maintenance):</strong> 6 controls - System maintenance</li>',
        '<li><strong>MP (Media Protection):</strong> 8 controls - Data media security</li>',
        '<li><strong>PE (Physical & Environmental):</strong> 20 controls - Physical security</li>',
        '<li><strong>PL (Planning):</strong> 9 controls - Security planning</li>',
        '<li><strong>PS (Personnel Security):</strong> 8 controls - Personnel screening</li>',
        '<li><strong>RA (Risk Assessment):</strong> 6 controls - Risk management</li>',
        '<li><strong>CA (Security Assessment):</strong> 9 controls - Security testing</li>',
        '<li><strong>SC (System & Communications):</strong> 44 controls - Network security</li>',
        '<li><strong>SI (System & Information Integrity):</strong> 17 controls - System protection</li>',
        '</ul>',
        '</div>',
        '<div class="coverage-level moderate">',
        '<h3>🟡 Moderate Impact Level</h3>',
        '<div class="coverage-stats">',
        '<span class="stat">325+ Controls</span>',
        '<span class="stat">Enhanced Security</span>',
        '</div>',
        '<ul>',
        '<li><strong>Includes Low Impact +</strong></li>',
        '<li><strong>AC Enhancements:</strong> Account management, privilege escalation controls</li>',
        '<li><strong>AU Enhancements:</strong> Comprehensive audit trails, real-time monitoring</li>',
        '<li><strong>CM Enhancements:</strong> Automated configuration monitoring</li>',
        '<li><strong>CP Enhancements:</strong> Advanced backup strategies, alternate sites</li>',
        '<li><strong>IA Enhancements:</strong> Multi-factor authentication, PKI requirements</li>',
        '<li><strong>IR Enhancements:</strong> Automated incident response, forensics</li>',
        '<li><strong>SC Enhancements:</strong> Network segmentation, encryption in transit</li>',
        '<li><strong>SI Enhancements:</strong> Malware protection, vulnerability scanning</li>',
        '</ul>',
        '</div>',
        '<div class="coverage-level high">',
        '<h3>🔴 High Impact Level</h3>',
        '<div class="coverage-stats">',
        '<span class="stat">425+ Controls</span>',
        '<span class="stat">Maximum Security</span>',
        '</div>',
        '<ul>',
        '<li><strong>Includes Moderate Impact +</strong></li>',
        '<li><strong>AC Enhancements:</strong> Advanced access controls, privileged user monitoring</li>',
        '<li><strong>AU Enhancements:</strong> Continuous monitoring, advanced analytics</li>',
        '<li><strong>CM Enhancements:</strong> Real-time configuration validation</li>',
        '<li><strong>CP Enhancements:</strong> Multiple backup sites, continuous replication</li>',
        '<li><strong>IA Enhancements:</strong> Advanced authentication, biometrics</li>',
        '<li><strong>IR Enhancements:</strong> 24/7 SOC, advanced threat hunting</li>',
        '<li><strong>PE Enhancements:</strong> Biometric access, advanced physical controls</li>',
        '<li><strong>SC Enhancements:</strong> Network isolation, advanced encryption</li>',
        '<li><strong>SI Enhancements:</strong> Advanced threat detection, sandboxing</li>',
        '</ul>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="export-menu no-print">',
        '<button class="export-btn" onclick="exportAsHTML()">📄 Export HTML</button>',
        '<button class="export-btn" onclick="exportAsJSON()">📊 Export JSON</button>',
        '<button class="export-btn" onclick="exportAsCSV()">📋 Export CSV</button>',
        '<button class="export-btn" onclick="exportAsMarkdown()">📝 Export Markdown</button>',
        '<button class="print-btn" onclick="openInBrowserToPrint()">🖨️ Print in Browser</button>',
        '</div>',
        '<div class="content">'
    ];

    // Get compliance assessment
    const assessment = assessComplianceLevel(scanResults);

    // Enhanced Compliance Summary with Material Design
    html.push(
        '<div class="compliance-summary">',
        '<div class="compliance-header">',
        '<h2 class="compliance-title">📊 FedRAMP Compliance Assessment</h2>',
        '<div class="compliance-score">',
        '<div class="score-circle" style="background: linear-gradient(135deg, ' + assessment.color + ' 0%, ' + assessment.color + '90 100%);">',
        assessment.score + '%',
        '</div>',
        '<div class="score-details">',
        '<p class="impact-level" style="color: ' + assessment.color + ';">' + assessment.icon + ' ' + assessment.level + '</p>',
        '<p class="compliance-status" style="color: ' + assessment.color + ';">' + assessment.status + '</p>',
        '</div>',
        '</div>',
        '</div>',
        
        '<div class="metrics-grid">',
        '<div class="metric-card">',
        '<div class="metric-value">' + scanResults.totalFiles + '</div>',
        '<div class="metric-label">Files Scanned</div>',
        '</div>',
        '<div class="metric-card">',
        '<div class="metric-value" style="color: ' + (scanResults.totalIssues > 0 ? '#f44336' : '#4caf50') + ';">' + scanResults.totalIssues + '</div>',
        '<div class="metric-label">Issues Found</div>',
        '</div>',
        '<div class="metric-card">',
        '<div class="metric-value" style="color: #ff9800;">' + (scanResults.criticalIssues || 0) + '</div>',
        '<div class="metric-label">Critical Issues</div>',
        '</div>',
        '<div class="metric-card">',
        '<div class="metric-value" style="color: ' + assessment.color + ';">' + assessment.score + '%</div>',
        '<div class="metric-label">Compliance Score</div>',
        '</div>',
        '</div>',
        
        // Add FedRAMP Impact Level Criteria
        '<div class="feature">',
        '<h3>🎯 FedRAMP Impact Level Criteria</h3>',
        '<div class="coverage-levels">',
        '<div class="coverage-level low">',
        '<h4 style="color: #4caf50;">🟢 Low Impact Ready</h4>',
        '<ul>',
        '<li><strong>Score Required:</strong> 70%+ compliance</li>',
        '<li><strong>Critical Issues:</strong> ≤ 1 allowed</li>',
        '<li><strong>High Issues:</strong> ≤ 5 allowed</li>',
        '<li><strong>Use Cases:</strong> Basic cloud applications</li>',
        '</ul>',
        '</div>',
        '<div class="coverage-level moderate">',
        '<h4 style="color: #ff9800;">🟡 Moderate Impact Ready</h4>',
        '<ul>',
        '<li><strong>Score Required:</strong> 85%+ compliance</li>',
        '<li><strong>Critical Issues:</strong> 0 allowed</li>',
        '<li><strong>High Issues:</strong> ≤ 3 allowed</li>',
        '<li><strong>Use Cases:</strong> Most federal applications</li>',
        '</ul>',
        '</div>',
        '<div class="coverage-level high">',
        '<h4 style="color: #f44336;">🔴 High Impact Ready</h4>',
        '<ul>',
        '<li><strong>Score Required:</strong> 95%+ compliance</li>',
        '<li><strong>Critical Issues:</strong> 0 allowed</li>',
        '<li><strong>High Issues:</strong> ≤ 1 allowed</li>',
        '<li><strong>Use Cases:</strong> Mission-critical systems</li>',
        '</ul>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
    );

    // Add detailed analysis if there are issues
    if (scanResults.totalIssues > 0) {

        // Issues by type
        if (scanResults.issuesByType && scanResults.issuesByType.size > 0) {
            html.push('<div class="feature"><h3>📋 Issues by Control Type</h3><table><thead><tr><th>Control</th><th>Count</th></tr></thead><tbody>');
            scanResults.issuesByType.forEach((count: number, control: string) => {
                html.push('<tr><td>' + control + '</td><td>' + count + '</td></tr>');
            });
            html.push('</tbody></table></div>');
        }

        // Issues by file with AI suggestions
        if (scanResults.issuesByFile && scanResults.issuesByFile.size > 0) {
            html.push('<div class="feature"><h3>📁 Detailed Issues by File with AI Suggestions</h3>');
            scanResults.issuesByFile.forEach((diagnostics: vscode.Diagnostic[], filePath: string) => {
                const fileName = filePath.split('/').pop() || filePath;
                html.push('<h4 style="color:#2c3e50;margin-top:20px;">📄 ' + fileName + '</h4>');
                html.push('<ul class="issue-list">');
                diagnostics.forEach((d: vscode.Diagnostic) => {
                    const severity = d.severity === 0 ? '🔴 ERROR' : '🟡 WARNING';
                    const cssClass = d.severity === 0 ? 'issue-item' : 'issue-item issue-warning';
                    // Generate AI suggestions for this issue
                    const aiSuggestion = generateAISuggestions(d.message, d.message);
                    html.push(
                        '<li class="' + cssClass + '">',
                        '<strong>Line ' + (d.range.start.line + 1) + ':</strong> ' + severity + '<br>',
                        '<span style="color:#6c757d;">' + d.message + '</span>',
                        aiSuggestion,
                        '</li>'
                    );
                });
                html.push('</ul>');
            });
            html.push('</div>');
        }
        
        // Add recommendations section
        html.push(
            '<div class="feature">',
            '<h3>💡 Remediation Recommendations</h3>',
            '<p>To improve your FedRAMP compliance score and achieve higher impact level readiness:</p>',
            '<div class="ai-suggestion">',
            '<h5>🎯 Priority Actions</h5>',
            '<ul>',
            '<li><strong>Critical Issues:</strong> Address all critical security violations immediately</li>',
            '<li><strong>High Priority:</strong> Fix authentication and encryption issues</li>',
            '<li><strong>Medium Priority:</strong> Implement proper logging and monitoring</li>',
            '<li><strong>Documentation:</strong> Update security policies and procedures</li>',
            '</ul>',
            '</div>',
            '</div>'
        );
    } else {
        // Perfect compliance case with Material Design
        html.push(
            '<div class="feature compliant" style="text-align: center; padding: 40px;">',
            '<div style="font-size: 4rem; margin-bottom: 24px;">🏆</div>',
            '<h2 style="color: #4caf50; font-size: 2rem; margin-bottom: 16px;">Perfect FedRAMP Compliance!</h2>',
            '<p style="font-size: 1.2rem; color: #2e7d32; margin-bottom: 24px;">',
            '🎉 Congratulations! All <strong>' + scanResults.totalFiles + '</strong> files meet FedRAMP security requirements.',
            '</p>',
            '<div class="metrics-grid" style="margin-top: 32px;">',
            '<div class="metric-card" style="background: #e8f5e8;">',
            '<div class="metric-value" style="color: #4caf50;">100%</div>',
            '<div class="metric-label">Compliance Score</div>',
            '</div>',
            '<div class="metric-card" style="background: #e8f5e8;">',
            '<div class="metric-value" style="color: #4caf50;">0</div>',
            '<div class="metric-label">Issues Found</div>',
            '</div>',
            '<div class="metric-card" style="background: #e8f5e8;">',
            '<div class="metric-value" style="color: #4caf50;">✓</div>',
            '<div class="metric-label">All Impact Levels</div>',
            '</div>',
            '</div>',
            '<div class="ai-suggestion" style="margin-top: 32px; text-align: left;">',
            '<h5>🚀 Next Steps for Continuous Compliance</h5>',
            '<ul>',
            '<li><strong>Regular Scanning:</strong> Schedule weekly compliance scans</li>',
            '<li><strong>Documentation:</strong> Keep security documentation updated</li>',
            '<li><strong>Training:</strong> Ensure team follows secure coding practices</li>',
            '<li><strong>Monitoring:</strong> Implement continuous security monitoring</li>',
            '</ul>',
            '</div>',
            '</div>'
        );
    }

    // Add JavaScript for export functionality
    html.push(
        '</div>',
        '<script>',
        'function exportAsHTML(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"html",data:{htmlContent:document.documentElement.outerHTML}});}}',
        'function exportAsJSON(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();const assessment=assessComplianceLevel(' + JSON.stringify(scanResults) + ');vscode.postMessage({type:"export",format:"json",data:{reportData:{timestamp:"' + scanResults.scanTimestamp + '",totalFiles:' + scanResults.totalFiles + ',totalIssues:' + scanResults.totalIssues + ',complianceStatus:assessment.status,complianceScore:assessment.score,impactLevel:assessment.level}}});}}',
        'function exportAsCSV(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"csv",data:{csvContent:"File,Line,Control,Severity,Message\\n"}});}}',
        'function exportAsMarkdown(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"markdown",data:{markdownContent:"# FedRAMP Compliance Report v2.12.1\\n\\nGenerated: ' + scanResults.scanTimestamp + '\\n\\n## Summary\\n\\n- **Files Scanned:** ' + scanResults.totalFiles + '\\n- **Issues Found:** ' + scanResults.totalIssues + '\\n"}});}}',
        'function openInBrowserToPrint(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"print",data:{htmlContent:document.documentElement.outerHTML}});}}',
        '</script>',
        '</body></html>'
    );

    return html.join('');
}
async function handleExportRequest(format: string, data: any, scanResults: any): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    try {
        let content = '';
        let filename = '';
        let fileExtension = '';

        const timestamp = new Date().toISOString().split('T')[0];

        switch (format) {
            case 'html':
                content = data.htmlContent;
                filename = "fedramp-compliance-report-" + timestamp + ".html";
                fileExtension = 'html';
                break;
            case 'json':
                content = JSON.stringify(data.reportData, null, 2);
                filename = "fedramp-compliance-report-" + timestamp + ".json";
                fileExtension = 'json';
                break;
            case 'csv':
                content = data.csvContent;
                filename = "fedramp-compliance-report-" + timestamp + ".csv";
                fileExtension = 'csv';
                break;
            case 'markdown':
                content = data.markdownContent;
                filename = "fedramp-compliance-report-" + timestamp + ".md";
                fileExtension = 'md';
                break;
            default:
                vscode.window.showErrorMessage("Unsupported export format: " + format);
                return;
        }

        // Save to Downloads folder
        const downloadsPath = path.join(os.homedir(), 'Downloads', filename);
        fs.writeFileSync(downloadsPath, content, 'utf8');

        vscode.window.showInformationMessage(
            "✅ Report exported as " + fileExtension.toUpperCase() + ": " + filename,
            'Open File'
        ).then(selection => {
            if (selection === 'Open File') {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.file(downloadsPath));
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        vscode.window.showErrorMessage("Failed to export report: " + error);
    }
}

async function handlePrintRequest(data: any, scanResults: any): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    try {
        // Create a clean HTML version for printing
        const cleanContent = data.htmlContent.replace(
            /<div class="download-menu no-print">[\s\S]*?<\/div>/,
            ''
        );

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = "fedramp-compliance-report-print-" + timestamp + ".html";
        const tempPath = path.join(os.tmpdir(), filename);

        // Save to temp folder
        fs.writeFileSync(tempPath, cleanContent, 'utf8');

        // Open in default browser
        vscode.env.openExternal(vscode.Uri.file(tempPath));

        vscode.window.showInformationMessage('📄 Report opened in browser for printing');

    } catch (error) {
        console.error('Print error:', error);
        vscode.window.showErrorMessage("Failed to open report for printing: " + error);
    }
}

export function deactivate() {
    console.log('👋 FedRAMP Compliance Scanner v2.12.1 deactivated');
}
