import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue, ComplianceStandard } from './types';

export class ComplianceDashboard {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async createDashboard(report: ComplianceReport): Promise<void> {
        // Create or show the dashboard panel
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'complianceDashboard',
                'FedRAMP Compliance Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'resources')]
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        // Set the dashboard content
        this.panel.webview.html = this.generateDashboardHTML(report);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'exportReport':
                        this.exportReport(report, message.format);
                        break;
                    case 'scanWorkspace':
                        vscode.commands.executeCommand('fedramp.scanWorkspace');
                        break;
                    case 'generateReport':
                        vscode.commands.executeCommand('fedramp.generateReport');
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private generateDashboardHTML(report: ComplianceReport): string {
        const complianceScore = this.calculateComplianceScore(report);
        const riskDistribution = this.analyzeRiskDistribution(report);
        const controlFamilyAnalysis = this.analyzeControlFamilies(report);
        const trendData = this.generateTrendData(report);

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FedRAMP Compliance Dashboard</title>
            <style>
                ${this.getCSS()}
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
            <div class="dashboard-container">
                <!-- Header -->
                <div class="dashboard-header">
                    <h1><span class="icon">🛡️</span> FedRAMP Compliance Dashboard</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="scanWorkspace()">
                            <span class="icon">🔍</span> Scan Workspace
                        </button>
                        <button class="btn btn-secondary" onclick="generateReport()">
                            <span class="icon">📄</span> Generate Report
                        </button>
                        <div class="export-dropdown">
                            <button class="btn btn-outline">Export ▼</button>
                            <div class="dropdown-content">
                                <a href="#" onclick="exportReport('html')">HTML Report</a>
                                <a href="#" onclick="exportReport('json')">JSON Data</a>
                                <a href="#" onclick="exportReport('csv')">CSV Summary</a>
                                <a href="#" onclick="exportReport('pdf')">PDF Report</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Executive Summary -->
                <div class="executive-summary">
                    <div class="summary-card">
                        <div class="score-display">
                            <div class="score-circle ${this.getScoreClass(complianceScore)}">
                                <span class="score-number">${complianceScore}%</span>
                            </div>
                            <div class="score-label">Compliance Score</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="metric">
                            <div class="metric-number">${report.issues?.length || 0}</div>
                            <div class="metric-label">Total Issues</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="metric">
                            <div class="metric-number error">${this.countBySeverity(report, 'error')}</div>
                            <div class="metric-label">Critical</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="metric">
                            <div class="metric-number warning">${this.countBySeverity(report, 'warning')}</div>
                            <div class="metric-label">Warnings</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="metric">
                            <div class="metric-number info">${this.countBySeverity(report, 'info')}</div>
                            <div class="metric-label">Info</div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="charts-row">
                    <!-- Risk Heat Map -->
                    <div class="chart-container">
                        <h3>Risk Distribution</h3>
                        <canvas id="riskChart"></canvas>
                    </div>
                    
                    <!-- Control Family Analysis -->
                    <div class="chart-container">
                        <h3>Control Family Analysis</h3>
                        <canvas id="familyChart"></canvas>
                    </div>
                    
                    <!-- Compliance Trend -->
                    <div class="chart-container">
                        <h3>Compliance Trend</h3>
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>

                <!-- Detailed Analysis -->
                <div class="detailed-analysis">
                    <!-- Top Violations -->
                    <div class="analysis-section">
                        <h3>🔥 Top Priority Issues</h3>
                        <div class="violations-list">
                            ${this.generateTopViolations(report)}
                        </div>
                    </div>
                    
                    <!-- Control Family Breakdown -->
                    <div class="analysis-section">
                        <h3>📊 Control Family Breakdown</h3>
                        <div class="family-breakdown">
                            ${this.generateFamilyBreakdown(controlFamilyAnalysis)}
                        </div>
                    </div>
                    
                    <!-- Recommendations -->
                    <div class="analysis-section">
                        <h3>💡 Recommendations</h3>
                        <div class="recommendations">
                            ${this.generateRecommendations(report)}
                        </div>
                    </div>
                </div>
            </div>

            <script>
                ${this.getJavaScript(riskDistribution, controlFamilyAnalysis, trendData)}
            </script>
        </body>
        </html>
        `;
    }

    private getCSS(): string {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #333;
                line-height: 1.6;
            }

            .dashboard-container {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }

            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                padding: 20px 30px;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .dashboard-header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #2c3e50;
            }

            .icon {
                margin-right: 8px;
            }

            .header-actions {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
            }

            .btn-primary {
                background: #3498db;
                color: white;
            }

            .btn-primary:hover {
                background: #2980b9;
                transform: translateY(-2px);
            }

            .btn-secondary {
                background: #2ecc71;
                color: white;
            }

            .btn-secondary:hover {
                background: #27ae60;
                transform: translateY(-2px);
            }

            .btn-outline {
                background: transparent;
                color: #3498db;
                border: 2px solid #3498db;
            }

            .btn-outline:hover {
                background: #3498db;
                color: white;
            }

            .export-dropdown {
                position: relative;
                display: inline-block;
            }

            .dropdown-content {
                display: none;
                position: absolute;
                background: white;
                min-width: 160px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                border-radius: 8px;
                z-index: 1;
                right: 0;
            }

            .dropdown-content a {
                color: #333;
                padding: 12px 16px;
                text-decoration: none;
                display: block;
            }

            .dropdown-content a:hover {
                background: #f1f1f1;
            }

            .export-dropdown:hover .dropdown-content {
                display: block;
            }

            .executive-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .summary-card {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                transition: transform 0.3s ease;
            }

            .summary-card:hover {
                transform: translateY(-5px);
            }

            .score-circle {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px;
                position: relative;
            }

            .score-circle.excellent {
                background: linear-gradient(135deg, #2ecc71, #27ae60);
            }

            .score-circle.good {
                background: linear-gradient(135deg, #f39c12, #e67e22);
            }

            .score-circle.poor {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
            }

            .score-number {
                font-size: 24px;
                font-weight: bold;
                color: white;
            }

            .score-label {
                font-size: 14px;
                color: #666;
                font-weight: 600;
            }

            .metric-number {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 8px;
            }

            .metric-number.error {
                color: #e74c3c;
            }

            .metric-number.warning {
                color: #f39c12;
            }

            .metric-number.info {
                color: #3498db;
            }

            .metric-label {
                font-size: 14px;
                color: #666;
                font-weight: 600;
            }

            .charts-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .chart-container {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .chart-container h3 {
                margin-bottom: 20px;
                color: #2c3e50;
                font-weight: 600;
            }

            .detailed-analysis {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
            }

            .analysis-section {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }

            .analysis-section h3 {
                margin-bottom: 20px;
                color: #2c3e50;
                font-weight: 600;
            }

            .violation-item {
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 12px;
                border-left: 4px solid #e74c3c;
            }

            .violation-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .violation-description {
                font-size: 14px;
                color: #666;
            }

            .family-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #eee;
            }

            .family-name {
                font-weight: 600;
                color: #2c3e50;
            }

            .family-score {
                font-weight: bold;
                padding: 4px 12px;
                border-radius: 20px;
                color: white;
            }

            .family-score.excellent {
                background: #2ecc71;
            }

            .family-score.good {
                background: #f39c12;
            }

            .family-score.poor {
                background: #e74c3c;
            }

            .recommendation-item {
                padding: 15px;
                background: #e8f5e8;
                border-radius: 8px;
                margin-bottom: 12px;
                border-left: 4px solid #2ecc71;
            }

            .recommendation-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .recommendation-description {
                font-size: 14px;
                color: #666;
            }
        `;
    }

    private getJavaScript(riskDistribution: any, controlFamilyAnalysis: any, trendData: any): string {
        return `
            const vscode = acquireVsCodeApi();

            function scanWorkspace() {
                vscode.postMessage({ command: 'scanWorkspace' });
            }

            function generateReport() {
                vscode.postMessage({ command: 'generateReport' });
            }

            function exportReport(format) {
                vscode.postMessage({ command: 'exportReport', format: format });
            }

            // Initialize charts
            window.onload = function() {
                // Risk Distribution Chart
                const riskCtx = document.getElementById('riskChart').getContext('2d');
                new Chart(riskCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Critical', 'High', 'Medium', 'Low'],
                        datasets: [{
                            data: [${riskDistribution.critical}, ${riskDistribution.high}, ${riskDistribution.medium}, ${riskDistribution.low}],
                            backgroundColor: ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });

                // Control Family Chart
                const familyCtx = document.getElementById('familyChart').getContext('2d');
                new Chart(familyCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(controlFamilyAnalysis.labels)},
                        datasets: [{
                            label: 'Issues',
                            data: ${JSON.stringify(controlFamilyAnalysis.data)},
                            backgroundColor: 'rgba(52, 152, 219, 0.8)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });

                // Trend Chart
                const trendCtx = document.getElementById('trendChart').getContext('2d');
                new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(trendData.labels)},
                        datasets: [{
                            label: 'Compliance Score',
                            data: ${JSON.stringify(trendData.scores)},
                            borderColor: '#2ecc71',
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            };
        `;
    }

    private calculateComplianceScore(report: ComplianceReport): number {
        if (!report.issues || report.issues.length === 0) {
            return 100;
        }

        const totalIssues = report.issues.length;
        const criticalIssues = this.countBySeverity(report, 'error') * 3;
        const warningIssues = this.countBySeverity(report, 'warning') * 2;
        const infoIssues = this.countBySeverity(report, 'info') * 1;

        const weightedScore = Math.max(0, 100 - (criticalIssues + warningIssues + infoIssues));
        return Math.round(weightedScore);
    }

    private countBySeverity(report: ComplianceReport, severity: string): number {
        return report.issues?.filter(issue => issue.severity === severity).length || 0;
    }

    private getScoreClass(score: number): string {
        if (score >= 80) {
            return 'excellent';
        }
        if (score >= 60) {
            return 'good';
        }
        return 'poor';
    }

    private analyzeRiskDistribution(report: ComplianceReport): any {
        return {
            critical: this.countBySeverity(report, 'error'),
            high: Math.floor(this.countBySeverity(report, 'warning') * 0.6),
            medium: Math.floor(this.countBySeverity(report, 'warning') * 0.4),
            low: this.countBySeverity(report, 'info')
        };
    }

    private analyzeControlFamilies(report: ComplianceReport): any {
        const families: { [key: string]: number } = {};
        
        report.issues?.forEach(issue => {
            const family = issue.control?.split('-')[0] || 'Unknown';
            families[family] = (families[family] || 0) + 1;
        });

        return {
            labels: Object.keys(families),
            data: Object.values(families)
        };
    }

    private generateTrendData(report: ComplianceReport): any {
        // Generate mock trend data for demonstration
        const labels = ['Last Month', '3 Weeks Ago', '2 Weeks Ago', 'Last Week', 'Today'];
        const scores = [65, 72, 78, 82, this.calculateComplianceScore(report)];
        
        return { labels, scores };
    }

    private generateTopViolations(report: ComplianceReport): string {
        const topViolations = report.issues?.slice(0, 5) || [];
        
        return topViolations.map(issue => `
            <div class="violation-item">
                <div class="violation-title">${issue.control}: ${issue.message}</div>
                <div class="violation-description">
                    File: ${issue.file} | Line: ${issue.line}
                    ${issue.remediation ? `<br>Fix: ${issue.remediation}` : ''}
                </div>
            </div>
        `).join('');
    }

    private generateFamilyBreakdown(analysis: any): string {
        return analysis.labels.map((family: string, index: number) => {
            const count = analysis.data[index];
            const score = Math.max(0, 100 - (count * 10));
            const scoreClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'poor';
            
            return `
                <div class="family-item">
                    <span class="family-name">${family} Family</span>
                    <span class="family-score ${scoreClass}">${score}%</span>
                </div>
            `;
        }).join('');
    }

    private generateRecommendations(report: ComplianceReport): string {
        const recommendations = [
            {
                title: 'Implement Access Controls',
                description: 'Review and strengthen access control mechanisms to reduce security risks.'
            },
            {
                title: 'Enable Audit Logging',
                description: 'Configure comprehensive audit logging for all system activities.'
            },
            {
                title: 'Update Security Policies',
                description: 'Document and regularly review security policies and procedures.'
            }
        ];

        return recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
            </div>
        `).join('');
    }

    private async exportReport(report: ComplianceReport, format: string): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `fedramp-compliance-report-${timestamp}.${format}`;
            
            let content: string;
            
            switch (format) {
                case 'html':
                    content = this.generateDashboardHTML(report);
                    break;
                case 'json':
                    content = JSON.stringify(report, null, 2);
                    break;
                case 'csv':
                    content = this.generateCSV(report);
                    break;
                case 'pdf':
                    vscode.window.showInformationMessage('PDF export will be available in the next release');
                    return;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.joinPath(workspaceFolders[0].uri, fileName),
                filters: {
                    [format.toUpperCase()]: [format]
                }
            });

            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                vscode.window.showInformationMessage(`Report exported to ${uri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export report: ${error}`);
        }
    }

    private generateCSV(report: ComplianceReport): string {
        const headers = ['Control', 'Severity', 'Message', 'File', 'Line', 'Remediation'];
        const rows = report.issues?.map(issue => [
            issue.control || '',
            issue.severity || '',
            `"${issue.message || ''}"`,
            issue.file || '',
            issue.line?.toString() || '',
            `"${issue.remediation || ''}"`
        ]) || [];

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
}
