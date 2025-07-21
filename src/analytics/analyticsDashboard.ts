/**
 * Compliance Analytics Dashboard
 * Advanced visualization and reporting for FedRAMP compliance
 */

import * as vscode from 'vscode';
import { ComplianceAnalytics, RiskAssessment, ComplianceInsight, BenchmarkComparison, ComplianceForecast } from './complianceAnalytics';
import { CloudComplianceReport } from '../types/cloudTypes';

export interface DashboardData {
    riskAssessment: RiskAssessment;
    insights: ComplianceInsight[];
    benchmarks: BenchmarkComparison[];
    forecast: ComplianceForecast;
    lastScanTime: Date;
    environmentInfo: {
        totalResources: number;
        complianceScore: number;
        riskCategory: string;
        nextScanRecommended: Date;
    };
}

export class AnalyticsDashboard {
    private panel: vscode.WebviewPanel | undefined;
    private analytics: ComplianceAnalytics;
    private lastDashboardData: DashboardData | undefined;

    constructor(private context: vscode.ExtensionContext) {
        this.analytics = new ComplianceAnalytics();
    }

    /**
     * Show or update the analytics dashboard
     */
    async showDashboard(complianceReport?: CloudComplianceReport, historicalReports?: CloudComplianceReport[]): Promise<void> {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'fedrampAnalytics',
                'FedRAMP Compliance Analytics',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(this.context.extensionUri, 'resources'),
                        vscode.Uri.joinPath(this.context.extensionUri, 'out')
                    ]
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });

            // Handle messages from the webview
            this.panel.webview.onDidReceiveMessage(
                message => this.handleWebviewMessage(message),
                undefined,
                this.context.subscriptions
            );
        }

        // Update dashboard content
        if (complianceReport) {
            await this.updateDashboard(complianceReport, historicalReports || []);
        } else if (this.lastDashboardData) {
            // Refresh with existing data
            this.panel.webview.html = this.generateDashboardHtml(this.lastDashboardData);
        } else {
            // Show loading state
            this.panel.webview.html = this.generateLoadingHtml();
        }
    }

    /**
     * Update dashboard with new compliance data
     */
    private async updateDashboard(report: CloudComplianceReport, historicalReports: CloudComplianceReport[]): Promise<void> {
        try {
            // Analyze the compliance data
            const analysisResult = await this.analytics.analyzeCompliance(report, historicalReports);

            // Prepare dashboard data
            const dashboardData: DashboardData = {
                riskAssessment: analysisResult.riskAssessment,
                insights: analysisResult.insights,
                benchmarks: analysisResult.benchmarks,
                forecast: analysisResult.forecast,
                lastScanTime: report.scanEndTime,
                environmentInfo: {
                    totalResources: report.totalResources,
                    complianceScore: report.complianceScore,
                    riskCategory: analysisResult.riskAssessment.riskCategory,
                    nextScanRecommended: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
                }
            };

            this.lastDashboardData = dashboardData;

            if (this.panel) {
                this.panel.webview.html = this.generateDashboardHtml(dashboardData);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate analytics dashboard: ${error}`);
            console.error('Dashboard update error:', error);
        }
    }

    /**
     * Handle messages from the webview
     */
    private async handleWebviewMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'exportReport':
                await this.exportAnalyticsReport();
                break;
            case 'refreshData':
                await this.refreshDashboard();
                break;
            case 'drillDown':
                await this.showDrillDownDetails(message.data);
                break;
            case 'scheduleScan':
                await this.scheduleScan();
                break;
        }
    }

    /**
     * Generate the dashboard HTML
     */
    private generateDashboardHtml(data: DashboardData): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FedRAMP Compliance Analytics</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--vscode-panel-border);
        }
        
        .dashboard-title {
            font-size: 28px;
            font-weight: bold;
            color: var(--vscode-titleBar-activeForeground);
        }
        
        .dashboard-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .metric-label {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .metric-trend {
            font-size: 12px;
            margin-top: 5px;
        }
        
        .trend-up { color: #4CAF50; }
        .trend-down { color: #F44336; }
        .trend-stable { color: var(--vscode-descriptionForeground); }
        
        .risk-critical { color: #F44336; }
        .risk-high { color: #FF9800; }
        .risk-medium { color: #FFC107; }
        .risk-low { color: #4CAF50; }
        
        .dashboard-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--vscode-titleBar-activeForeground);
        }
        
        .insights-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .insight-card {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid var(--vscode-charts-blue);
        }
        
        .insight-critical { border-left-color: #F44336; }
        .insight-high { border-left-color: #FF9800; }
        .insight-medium { border-left-color: #FFC107; }
        .insight-low { border-left-color: #4CAF50; }
        .insight-improvement { border-left-color: #2196F3; }
        
        .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .insight-title {
            font-weight: bold;
            font-size: 16px;
        }
        
        .insight-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        .badge-critical { background-color: #F44336; color: white; }
        .badge-high { background-color: #FF9800; color: white; }
        .badge-medium { background-color: #FFC107; color: black; }
        .badge-low { background-color: #4CAF50; color: white; }
        
        .insight-description {
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .insight-recommendation {
            font-style: italic;
            color: var(--vscode-descriptionForeground);
            border-left: 3px solid var(--vscode-textPreformat-foreground);
            padding-left: 10px;
        }
        
        .risk-areas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .risk-area-card {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
        }
        
        .risk-area-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .risk-score {
            font-weight: bold;
            font-size: 18px;
        }
        
        .risk-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
            font-size: 12px;
        }
        
        .benchmark-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .benchmark-card {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
        }
        
        .benchmark-scores {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 14px;
        }
        
        .score-bar {
            width: 100%;
            height: 8px;
            background-color: var(--vscode-panel-border);
            border-radius: 4px;
            margin: 5px 0;
            overflow: hidden;
        }
        
        .score-fill {
            height: 100%;
            background-color: var(--vscode-charts-blue);
            transition: width 0.3s ease;
        }
        
        .forecast-container {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .forecast-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .forecast-score {
            font-size: 48px;
            font-weight: bold;
            color: var(--vscode-charts-green);
        }
        
        .forecast-timeline {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .milestone-card {
            text-align: center;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
        }
        
        .milestone-date {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
        }
        
        .milestone-score {
            font-size: 24px;
            font-weight: bold;
        }
        
        .milestone-critical {
            border-left: 4px solid var(--vscode-charts-red);
        }
        
        .last-updated {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        
        .loading {
            text-align: center;
            padding: 50px;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--vscode-panel-border);
            border-top: 4px solid var(--vscode-charts-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="dashboard-header">
        <h1 class="dashboard-title">🛡️ FedRAMP Compliance Analytics</h1>
        <div class="dashboard-actions">
            <button class="btn btn-secondary" onclick="refreshData()">🔄 Refresh</button>
            <button class="btn" onclick="exportReport()">📊 Export Report</button>
            <button class="btn" onclick="scheduleScan()">⏰ Schedule Scan</button>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value ${this.getRiskColorClass(data.environmentInfo.riskCategory)}">${data.environmentInfo.complianceScore}%</div>
            <div class="metric-label">Compliance Score</div>
            <div class="metric-trend trend-stable">Current Score</div>
        </div>
        <div class="metric-card">
            <div class="metric-value ${this.getRiskColorClass(data.riskAssessment.riskCategory)}">${data.riskAssessment.overallRiskScore}</div>
            <div class="metric-label">Risk Score</div>
            <div class="metric-trend">${data.environmentInfo.riskCategory} Risk</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${data.environmentInfo.totalResources}</div>
            <div class="metric-label">Total Resources</div>
            <div class="metric-trend trend-stable">Under Management</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${data.insights.length}</div>
            <div class="metric-label">Active Insights</div>
            <div class="metric-trend trend-up">Action Items</div>
        </div>
    </div>

    <!-- Key Insights -->
    <div class="dashboard-section">
        <h2 class="section-title">💡 Key Insights</h2>
        <div class="insights-container">
            ${data.insights.slice(0, 5).map(insight => `
                <div class="insight-card insight-${insight.impact.toLowerCase()}">
                    <div class="insight-header">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-badge badge-${insight.impact.toLowerCase()}">${insight.impact}</div>
                    </div>
                    <div class="insight-description">${insight.description}</div>
                    <div class="insight-recommendation">💡 ${insight.recommendation}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Risk Areas -->
    <div class="dashboard-section">
        <h2 class="section-title">🎯 Top Risk Areas</h2>
        <div class="risk-areas-grid">
            ${data.riskAssessment.topRiskAreas.slice(0, 6).map(area => `
                <div class="risk-area-card">
                    <div class="risk-area-header">
                        <div><strong>${area.category}</strong></div>
                        <div class="risk-score ${this.getRiskColorClass(area.businessImpact)}">${area.riskScore}</div>
                    </div>
                    <div class="risk-details">
                        <div><strong>Issues:</strong> ${area.issueCount}</div>
                        <div><strong>Critical:</strong> ${area.criticalIssues}</div>
                        <div><strong>Resources:</strong> ${area.affectedResources}</div>
                        <div><strong>Fix Time:</strong> ${area.estimatedRemediationTime}h</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Benchmarks -->
    <div class="dashboard-section">
        <h2 class="section-title">📊 Industry Benchmarks</h2>
        <div class="benchmark-grid">
            ${data.benchmarks.map(benchmark => `
                <div class="benchmark-card">
                    <h3>${benchmark.category}</h3>
                    <div class="benchmark-scores">
                        <span>Our Score: <strong>${benchmark.ourScore}</strong></span>
                        <span>Industry Avg: <strong>${benchmark.industryAverage}</strong></span>
                    </div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${benchmark.ourScore}%"></div>
                    </div>
                    <div style="font-size: 12px; margin-top: 8px;">
                        ${benchmark.percentile}th percentile
                        ${benchmark.gap > 0 ? `(${benchmark.gap} points below average)` : '(Above average!)'}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Forecast -->
    <div class="dashboard-section">
        <h2 class="section-title">🔮 Compliance Forecast</h2>
        <div class="forecast-container">
            <div class="forecast-header">
                <div style="font-size: 16px; margin-bottom: 10px;">Projected Score (3 months)</div>
                <div class="forecast-score">${data.forecast.projectedScore}%</div>
                <div style="font-size: 14px; color: var(--vscode-descriptionForeground);">
                    Confidence: ${data.forecast.currentTrajectory.confidence}%
                </div>
            </div>
            
            <div class="forecast-timeline">
                ${data.forecast.milestones.map(milestone => `
                    <div class="milestone-card ${milestone.criticalPath ? 'milestone-critical' : ''}">
                        <div class="milestone-date">${milestone.date.toLocaleDateString()}</div>
                        <div class="milestone-score">${milestone.targetScore}%</div>
                        <div style="font-size: 12px; margin-top: 5px;">${milestone.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="last-updated">
        Last updated: ${data.lastScanTime.toLocaleString()} | 
        Next scan recommended: ${data.environmentInfo.nextScanRecommended.toLocaleDateString()}
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function exportReport() {
            vscode.postMessage({ command: 'exportReport' });
        }

        function refreshData() {
            vscode.postMessage({ command: 'refreshData' });
        }

        function scheduleScan() {
            vscode.postMessage({ command: 'scheduleScan' });
        }

        function drillDown(data) {
            vscode.postMessage({ command: 'drillDown', data: data });
        }
    </script>
</body>
</html>`;
    }

    /**
     * Generate loading HTML
     */
    private generateLoadingHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FedRAMP Compliance Analytics</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        .loading { text-align: center; padding: 50px; }
        .loading-spinner {
            width: 40px; height: 40px;
            border: 4px solid var(--vscode-panel-border);
            border-top: 4px solid var(--vscode-charts-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="loading-spinner"></div>
        <h2>Loading Analytics Dashboard...</h2>
        <p>Analyzing compliance data and generating insights...</p>
    </div>
</body>
</html>`;
    }

    /**
     * Get CSS class for risk level coloring
     */
    private getRiskColorClass(riskLevel: string): string {
        switch (riskLevel.toUpperCase()) {
            case 'CRITICAL': return 'risk-critical';
            case 'HIGH': return 'risk-high';
            case 'MEDIUM': return 'risk-medium';
            case 'LOW': return 'risk-low';
            default: return 'risk-medium';
        }
    }

    /**
     * Export analytics report
     */
    private async exportAnalyticsReport(): Promise<void> {
        if (!this.lastDashboardData) {
            vscode.window.showWarningMessage('No analytics data available to export');
            return;
        }

        try {
            const report = await this.analytics.exportAnalyticsReport(this.lastDashboardData);
            
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`compliance-analytics-${new Date().toISOString().split('T')[0]}.md`),
                filters: {
                    'Markdown': ['md'],
                    'All Files': ['*']
                }
            });

            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(report, 'utf8'));
                vscode.window.showInformationMessage(`Analytics report exported to ${uri.fsPath}`);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export analytics report: ${error}`);
        }
    }

    /**
     * Refresh dashboard data
     */
    private async refreshDashboard(): Promise<void> {
        vscode.window.showInformationMessage('Refreshing compliance analytics...');
        vscode.commands.executeCommand('fedramp.scanCloudCompliance');
    }

    /**
     * Show drill-down details
     */
    private async showDrillDownDetails(data: any): Promise<void> {
        // Implementation for showing detailed views of specific metrics or insights
        vscode.window.showInformationMessage(`Drill-down feature coming soon: ${JSON.stringify(data)}`);
    }

    /**
     * Schedule compliance scan
     */
    private async scheduleScan(): Promise<void> {
        const options = ['Daily', 'Weekly', 'Monthly'];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select scan frequency'
        });

        if (selected) {
            vscode.window.showInformationMessage(`Scheduled ${selected.toLowerCase()} compliance scans (feature coming soon)`);
        }
    }

    /**
     * Dispose of the dashboard
     */
    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
    }
}
