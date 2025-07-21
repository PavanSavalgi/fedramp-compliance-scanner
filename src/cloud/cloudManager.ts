/**
 * Cloud Infrastructure Manager
 * FedRAMP Compliance Scanner v2.7.0 - Cloud Integration Manager
 */

import * as vscode from 'vscode';
import { AWSCloudScanner } from './awsScanner';
import {
    CloudScanner, CloudCredentials, AWSCredentials, CloudComplianceReport,
    ComplianceIssue, ConnectionStatus, MonitoringEvent, MonitoringOptions,
    DriftReport
} from '../types/cloudTypes';

export class CloudInfrastructureManager {
    private awsScanner: AWSCloudScanner;
    private activeScanner?: CloudScanner;
    private monitoringInterval?: NodeJS.Timeout;
    private monitoringOptions: MonitoringOptions;

    constructor() {
        this.awsScanner = new AWSCloudScanner();
        this.monitoringOptions = {
            enabled: false,
            checkInterval: 30, // 30 minutes default
            notificationLevel: 'high',
            enableWebhooks: false
        };
    }

    /**
     * Connect to a cloud provider
     */
    async connectToCloud(provider: 'aws', credentials?: any): Promise<boolean> {
        try {
            switch (provider) {
                case 'aws':
                    const awsCredentials = await this.getAWSCredentials(credentials);
                    if (awsCredentials) {
                        const connected = await this.awsScanner.connect(awsCredentials);
                        if (connected) {
                            this.activeScanner = this.awsScanner;
                            await this.updateCloudConnectionStatus();
                            return true;
                        }
                    }
                    break;
                default:
                    throw new Error(`Unsupported cloud provider: ${provider}`);
            }
            return false;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to connect to ${provider}: ${error}`);
            return false;
        }
    }

    /**
     * Disconnect from current cloud provider
     */
    async disconnectFromCloud(): Promise<void> {
        if (this.activeScanner) {
            await this.activeScanner.disconnect();
            this.activeScanner = undefined;
            this.stopMonitoring();
            await this.updateCloudConnectionStatus();
        }
    }

    /**
     * Get AWS credentials from user input or configuration
     */
    private async getAWSCredentials(providedCredentials?: any): Promise<AWSCredentials | undefined> {
        const config = vscode.workspace.getConfiguration('fedrampCompliance.cloud.aws');
        
        // Use provided credentials if available
        if (providedCredentials) {
            return {
                provider: 'aws',
                accessKeyId: providedCredentials.accessKeyId,
                secretAccessKey: providedCredentials.secretAccessKey,
                sessionToken: providedCredentials.sessionToken,
                region: providedCredentials.region || config.get('region', 'us-east-1'),
                profile: providedCredentials.profile || config.get('profile', 'default')
            };
        }

        // Get credentials through VS Code input
        const authMethod = await vscode.window.showQuickPick([
            { label: 'AWS Profile', detail: 'Use AWS credentials profile (~/.aws/credentials)' },
            { label: 'Access Keys', detail: 'Enter AWS Access Key ID and Secret Access Key' },
            { label: 'Environment Variables', detail: 'Use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY' }
        ], {
            placeHolder: 'Select AWS authentication method',
            title: 'AWS Authentication'
        });

        if (!authMethod) {
            return undefined;
        }

        const region = await vscode.window.showInputBox({
            prompt: 'Enter AWS region',
            value: config.get('region', 'us-east-1'),
            placeHolder: 'us-east-1'
        });

        if (!region) {
            return undefined;
        }

        switch (authMethod.label) {
            case 'AWS Profile':
                const profile = await vscode.window.showInputBox({
                    prompt: 'Enter AWS profile name',
                    value: config.get('profile', 'default'),
                    placeHolder: 'default'
                });

                return {
                    provider: 'aws',
                    region,
                    profile: profile || 'default'
                };

            case 'Access Keys':
                const accessKeyId = await vscode.window.showInputBox({
                    prompt: 'Enter AWS Access Key ID',
                    placeHolder: 'AKIA...',
                    password: false
                });

                if (!accessKeyId) {
                    return undefined;
                }

                const secretAccessKey = await vscode.window.showInputBox({
                    prompt: 'Enter AWS Secret Access Key',
                    placeHolder: 'Secret Access Key',
                    password: true
                });

                if (!secretAccessKey) {
                    return undefined;
                }

                const sessionToken = await vscode.window.showInputBox({
                    prompt: 'Enter AWS Session Token (optional)',
                    placeHolder: 'Leave empty if not using temporary credentials',
                    password: true
                });

                return {
                    provider: 'aws',
                    accessKeyId,
                    secretAccessKey,
                    sessionToken: sessionToken || undefined,
                    region
                };

            case 'Environment Variables':
                return {
                    provider: 'aws',
                    region
                };

            default:
                return undefined;
        }
    }

    /**
     * Check if connected to any cloud provider
     */
    isConnected(): boolean {
        return this.activeScanner?.isConnected() || false;
    }

    /**
     * Get connection status
     */
    getConnectionStatus(): ConnectionStatus {
        if (this.activeScanner) {
            return this.activeScanner.getConnectionStatus();
        }
        return { connected: false };
    }

    /**
     * Scan cloud infrastructure for compliance issues
     */
    async scanCloudInfrastructure(): Promise<CloudComplianceReport | undefined> {
        if (!this.activeScanner || !this.isConnected()) {
            vscode.window.showWarningMessage('Not connected to any cloud provider. Please connect first.');
            return undefined;
        }

        try {
            const progressOptions = {
                location: vscode.ProgressLocation.Notification,
                title: 'Scanning Cloud Infrastructure',
                cancellable: true
            };

            return await vscode.window.withProgress(progressOptions, async (progress, token) => {
                progress.report({ increment: 0, message: 'Initializing cloud scan...' });

                const report = await this.activeScanner!.scanInfrastructure();

                progress.report({ increment: 100, message: 'Scan complete!' });

                // Update VS Code problems panel with cloud issues
                await this.updateProblemsPanel(report.issues);

                return report;
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Cloud infrastructure scan failed: ${error}`);
            return undefined;
        }
    }

    /**
     * Update VS Code problems panel with cloud compliance issues
     */
    private async updateProblemsPanel(issues: ComplianceIssue[]): Promise<void> {
        // Get or create diagnostic collection for cloud issues
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-cloud-compliance');
        diagnosticCollection.clear();

        // Group issues by resource for better organization
        const resourceIssues = new Map<string, vscode.Diagnostic[]>();

        for (const issue of issues) {
            // Create a virtual URI for the cloud resource
            const resourceUri = vscode.Uri.parse(`cloud-resource:/${issue.resourceType}/${issue.resource}`);
            
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `[${issue.control}] ${issue.description}`,
                this.mapSeverityToVSCode(issue.severity)
            );

            diagnostic.source = 'FedRAMP Cloud Compliance';
            diagnostic.code = {
                value: issue.control,
                target: vscode.Uri.parse(`https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=${issue.control}`)
            };

            if (!resourceIssues.has(resourceUri.toString())) {
                resourceIssues.set(resourceUri.toString(), []);
            }
            resourceIssues.get(resourceUri.toString())!.push(diagnostic);
        }

        // Set diagnostics for each resource
        for (const [uriString, diagnostics] of resourceIssues) {
            diagnosticCollection.set(vscode.Uri.parse(uriString), diagnostics);
        }

        // Show problems panel if there are issues
        if (issues.length > 0) {
            vscode.commands.executeCommand('workbench.panel.markers.view.focus');
        }
    }

    /**
     * Map compliance issue severity to VS Code diagnostic severity
     */
    private mapSeverityToVSCode(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'CRITICAL':
            case 'HIGH':
                return vscode.DiagnosticSeverity.Error;
            case 'MEDIUM':
                return vscode.DiagnosticSeverity.Warning;
            case 'LOW':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }

    /**
     * Start real-time monitoring of cloud resources
     */
    async startMonitoring(options?: Partial<MonitoringOptions>): Promise<void> {
        if (!this.isConnected()) {
            vscode.window.showWarningMessage('Not connected to any cloud provider.');
            return;
        }

        // Update monitoring options
        this.monitoringOptions = { ...this.monitoringOptions, ...options };
        this.monitoringOptions.enabled = true;

        // Stop existing monitoring if running
        this.stopMonitoring();

        const intervalMs = this.monitoringOptions.checkInterval * 60 * 1000; // Convert minutes to milliseconds

        this.monitoringInterval = setInterval(async () => {
            try {
                await this.performMonitoringCheck();
            } catch (error) {
                console.error('Monitoring check failed:', error);
            }
        }, intervalMs);

        vscode.window.showInformationMessage(
            `🔍 Started cloud monitoring with ${this.monitoringOptions.checkInterval}-minute intervals`
        );
    }

    /**
     * Stop real-time monitoring
     */
    stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        
        this.monitoringOptions.enabled = false;
        vscode.window.showInformationMessage('⏹️ Stopped cloud monitoring');
    }

    /**
     * Perform a monitoring check
     */
    private async performMonitoringCheck(): Promise<void> {
        if (!this.activeScanner) {
            return;
        }

        try {
            // Perform a quick scan to detect changes
            const report = await this.activeScanner.scanInfrastructure();
            
            // Check for high-severity issues based on notification level
            const criticalIssues = report.issues.filter(issue => {
                switch (this.monitoringOptions.notificationLevel) {
                    case 'high':
                        return issue.severity === 'CRITICAL' || issue.severity === 'HIGH';
                    case 'medium':
                        return issue.severity !== 'LOW';
                    case 'all':
                        return true;
                    default:
                        return issue.severity === 'CRITICAL';
                }
            });

            if (criticalIssues.length > 0) {
                // Send notifications for new issues
                await this.sendMonitoringNotifications(criticalIssues);
            }

        } catch (error) {
            console.error('Monitoring check failed:', error);
        }
    }

    /**
     * Send notifications for monitoring events
     */
    private async sendMonitoringNotifications(issues: ComplianceIssue[]): Promise<void> {
        const highestSeverity = this.getHighestSeverity(issues);
        const message = `🚨 Found ${issues.length} new compliance issue(s) in cloud infrastructure (Highest: ${highestSeverity})`;

        // Show VS Code notification
        const action = await vscode.window.showWarningMessage(
            message,
            'View Issues',
            'Open Dashboard',
            'Disable Monitoring'
        );

        switch (action) {
            case 'View Issues':
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
                break;
            case 'Open Dashboard':
                // This would open a cloud compliance dashboard - to be implemented
                vscode.window.showInformationMessage('Cloud dashboard coming soon!');
                break;
            case 'Disable Monitoring':
                this.stopMonitoring();
                break;
        }

        // Send webhook if enabled
        if (this.monitoringOptions.enableWebhooks && this.monitoringOptions.webhookUrl) {
            await this.sendWebhookNotification(issues);
        }
    }

    /**
     * Send webhook notification
     */
    private async sendWebhookNotification(issues: ComplianceIssue[]): Promise<void> {
        if (!this.monitoringOptions.webhookUrl) {
            return;
        }

        try {
            const payload = {
                timestamp: new Date().toISOString(),
                provider: this.getConnectionStatus().provider,
                accountId: this.getConnectionStatus().accountId,
                issuesFound: issues.length,
                highestSeverity: this.getHighestSeverity(issues),
                issues: issues.slice(0, 10) // Send up to 10 issues to avoid payload size limits
            };

            // Note: In a real implementation, you'd use a proper HTTP client
            // For now, this is just a placeholder
            console.log('Webhook payload:', JSON.stringify(payload, null, 2));

        } catch (error) {
            console.error('Failed to send webhook notification:', error);
        }
    }

    /**
     * Get highest severity level from issues
     */
    private getHighestSeverity(issues: ComplianceIssue[]): string {
        const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        
        for (const severity of severityOrder) {
            if (issues.some(issue => issue.severity === severity)) {
                return severity;
            }
        }
        
        return 'LOW';
    }

    /**
     * Update cloud connection status in VS Code status bar
     */
    private async updateCloudConnectionStatus(): Promise<void> {
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            100
        );

        const status = this.getConnectionStatus();
        
        if (status.connected) {
            statusBarItem.text = `$(cloud) ${status.provider?.toUpperCase()} Connected`;
            statusBarItem.tooltip = `Connected to ${status.provider} (${status.region}) - Account: ${status.accountId}`;
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        } else {
            statusBarItem.text = '$(cloud-offline) Not Connected';
            statusBarItem.tooltip = 'Not connected to any cloud provider';
        }

        statusBarItem.command = 'fedramp.cloudSettings';
        statusBarItem.show();
    }

    /**
     * Export cloud compliance report
     */
    async exportCloudReport(format: 'html' | 'json' | 'csv' | 'pdf' = 'html'): Promise<void> {
        const report = await this.scanCloudInfrastructure();
        
        if (!report) {
            return;
        }

        // This would integrate with the existing export functionality
        // For now, just show the report summary
        const summary = `
# Cloud Compliance Report

**Provider**: ${report.provider.toUpperCase()}
**Account ID**: ${report.accountId}
**Scan Date**: ${report.scanStartTime.toISOString()}
**Compliance Score**: ${report.complianceScore}%

## Summary
- Total Resources: ${report.totalResources}
- Compliant Resources: ${report.compliantResources}
- Non-Compliant Resources: ${report.nonCompliantResources}

## Issues by Severity
- Critical: ${report.summary.critical}
- High: ${report.summary.high}
- Medium: ${report.summary.medium}
- Low: ${report.summary.low}

## Top Issues
${report.issues.slice(0, 5).map(issue => 
    `- [${issue.control}] ${issue.resource}: ${issue.description}`
).join('\n')}
        `;

        // Create and show report in new editor
        const doc = await vscode.workspace.openTextDocument({
            content: summary,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
        
        vscode.window.showInformationMessage(
            `Cloud compliance report generated with ${report.issues.length} issues found`
        );
    }

    /**
     * Get resource count from active cloud provider
     */
    async getResourceCount(): Promise<number> {
        if (this.activeScanner) {
            return await this.activeScanner.getResourceCount();
        }
        return 0;
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        this.stopMonitoring();
        if (this.activeScanner) {
            this.activeScanner.disconnect();
        }
    }
}
