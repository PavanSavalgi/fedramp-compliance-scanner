import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue } from './types';
import { ComprehensiveMetricsDashboard } from './comprehensiveMetricsDashboard';

export interface DashboardMetrics {
    complianceScore: number;
    fedRAMPComplianceScore: number;
    securityScore: number;
    trendDirection: 'up' | 'down' | 'stable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    remedationProgress: number;
    timeToCompliance: string;
    criticalIssues: number;
    resolvedIssues: number;
    newIssues: number;
    fedRAMPLevel: 'Low' | 'Moderate' | 'High';
    controlFamilyScores: { [family: string]: number };
    authorizationStatus: 'ATO' | 'P-ATO' | 'In Process' | 'Not Started';
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
        fill?: boolean;
    }>;
}

export interface RiskHeatMapData {
    control: string;
    riskScore: number;
    impact: number;
    likelihood: number;
    category: string;
    remedationEffort: 'low' | 'medium' | 'high';
}

export interface ExecutiveSummary {
    overallStatus: 'compliant' | 'at-risk' | 'non-compliant';
    keyFindings: string[];
    criticalActions: string[];
    businessImpact: string;
    timeline: string;
    effortImpact: string;
    recommendations: string[];
}

export interface RemediationSuggestion {
    issueId: string;
    control: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    automationType: 'automated' | 'semi-automated' | 'manual';
    steps: string[];
    estimatedTime: string;
    requiredSkills: string[];
    dependencies: string[];
    riskReduction: number;
}

export interface TrendAnalysis {
    period: string;
    complianceScores: number[];
    issueVolumes: number[];
    categories: string[];
    predictions: {
        nextQuarter: number;
        riskAreas: string[];
        recommendedActions: string[];
    };
}

export class AdvancedReportingFeatures {
    private static instance: AdvancedReportingFeatures;
    private metricsDashboard: ComprehensiveMetricsDashboard;
    private reportHistory: ComplianceReport[] = [];
    private apiEndpoints: Map<string, string> = new Map();
    private scheduledExports: Map<string, any> = new Map();

    constructor() {
        this.metricsDashboard = new ComprehensiveMetricsDashboard();
        this.initializeAPIs();
    }

    public static getInstance(): AdvancedReportingFeatures {
        if (!AdvancedReportingFeatures.instance) {
            AdvancedReportingFeatures.instance = new AdvancedReportingFeatures();
        }
        return AdvancedReportingFeatures.instance;
    }

    private initializeAPIs(): void {
        this.apiEndpoints.set('nist', 'https://csrc.nist.gov/api/controls');
        this.apiEndpoints.set('fedramp', 'https://www.fedramp.gov/api/compliance');
        this.apiEndpoints.set('cis', 'https://www.cisecurity.org/api/controls');
    }

    // Advanced Dashboard Generation
    async generateInteractiveDashboard(report: ComplianceReport): Promise<void> {
        try {
            const metrics = this.calculateDashboardMetrics(report);
            const chartData = this.generateChartData(report);
            const heatMapData = this.generateRiskHeatMap(report);

            // Create webview panel
            const panel = vscode.window.createWebviewPanel(
                'fedRAMPDashboard',
                '🎯 FedRAMP Advanced Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Set the webview content
            panel.webview.html = this.generateDashboardHTML(metrics, chartData, heatMapData, report);
            
            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'refreshDashboard':
                            // Refresh dashboard data
                            break;
                        case 'exportDashboard':
                            vscode.window.showInformationMessage('Dashboard export functionality not yet implemented');
                            break;
                    }
                }
            );

            vscode.window.showInformationMessage('🎯 FedRAMP Advanced Dashboard opened successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate dashboard: ${error}`);
            console.error('Dashboard generation error:', error);
        }
    }

    async generateComprehensiveMetrics(report: ComplianceReport) {
        return await this.metricsDashboard.generateComprehensiveMetrics(report);
    }

    async generateComprehensiveAnalyticsDashboard(report: ComplianceReport): Promise<void> {
        try {
            const metrics = await this.metricsDashboard.generateComprehensiveMetrics(report);
            vscode.window.showInformationMessage('📊 Comprehensive Analytics Dashboard generated successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate analytics dashboard: ${error}`);
            console.error('Analytics dashboard generation error:', error);
        }
    }

    private generateDashboardHTML(metrics: DashboardMetrics, chartData: ChartData, heatMapData: any, report: ComplianceReport): string {

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎯 Advanced Compliance Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="https://d3js.org/d3.v7.min.js"></script>
            <style>
                ${this.getDashboardCSS()}
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <!-- Header with Real-time Metrics -->
                <header class="dashboard-header">
                    <h1>🎯 FedRAMP Compliance Dashboard</h1>
                    <div class="fedramp-status">
                        <div class="status-badge ${metrics.authorizationStatus.toLowerCase().replace(' ', '-')}">
                            ${metrics.authorizationStatus}
                        </div>
                        <div class="fedrAMP-level">FedRAMP ${metrics.fedRAMPLevel} Impact</div>
                    </div>
                    <div class="live-metrics">
                        <div class="metric-card fedramp-score primary">
                            <div class="metric-value">${metrics.fedRAMPComplianceScore}%</div>
                            <div class="metric-label">FedRAMP Compliance Score</div>
                            <div class="metric-trend ${metrics.trendDirection}">
                                ${this.getTrendIcon(metrics.trendDirection)}
                            </div>
                        </div>
                        <div class="metric-card overall-score">
                            <div class="metric-value">${metrics.complianceScore}%</div>
                            <div class="metric-label">Overall Compliance</div>
                            <div class="metric-risk ${metrics.riskLevel}">${metrics.riskLevel.toUpperCase()}</div>
                        </div>
                        <div class="metric-card security-score">
                            <div class="metric-value">${metrics.securityScore}%</div>
                            <div class="metric-label">Security Score</div>
                            <div class="critical-issues">${metrics.criticalIssues} Critical</div>
                        </div>
                        <div class="metric-card progress">
                            <div class="metric-value">${metrics.remedationProgress}%</div>
                            <div class="metric-label">Remediation Progress</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${metrics.remedationProgress}%"></div>
                            </div>
                        </div>
                        <div class="metric-card timeline">
                            <div class="metric-value">${metrics.timeToCompliance}</div>
                            <div class="metric-label">Time to ATO</div>
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard Grid -->
                <div class="dashboard-grid">
                    <!-- FedRAMP Control Family Scores -->
                    <div class="dashboard-card chart-card">
                        <h3>🏛️ FedRAMP Control Family Performance</h3>
                        <canvas id="fedRAMPControlChart"></canvas>
                        <div class="control-family-scores">
                            ${this.generateControlFamilyScoresHTML(metrics.controlFamilyScores)}
                        </div>
                    </div>

                    <!-- FedRAMP Authorization Progress -->
                    <div class="dashboard-card progress-card">
                        <h3>� FedRAMP Authorization Progress</h3>
                        <div class="authorization-progress">
                            <div class="ato-pathway">
                                <div class="step ${metrics.fedRAMPComplianceScore >= 60 ? 'completed' : 'pending'}">
                                    <span class="step-number">1</span>
                                    <span class="step-name">Documentation</span>
                                </div>
                                <div class="step ${metrics.fedRAMPComplianceScore >= 75 ? 'completed' : 'pending'}">
                                    <span class="step-number">2</span>
                                    <span class="step-name">Security Assessment</span>
                                </div>
                                <div class="step ${metrics.fedRAMPComplianceScore >= 85 ? 'completed' : 'pending'}">
                                    <span class="step-number">3</span>
                                    <span class="step-name">P-ATO</span>
                                </div>
                                <div class="step ${metrics.fedRAMPComplianceScore >= 95 ? 'completed' : 'pending'}">
                                    <span class="step-number">4</span>
                                    <span class="step-name">ATO</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Risk Heat Map -->
                    <div class="dashboard-card heatmap-card">
                        <h3>� FedRAMP Control Risk Heat Map</h3>
                        <div id="riskHeatMap"></div>
                    </div>

                    <!-- Issue Distribution by Control Family -->
                    <div class="dashboard-card chart-card">
                        <h3>� Issues by FedRAMP Control Family</h3>
                        <canvas id="issueDistributionChart"></canvas>
                    </div>

                    <!-- FedRAMP Executive Summary -->
                    <div class="dashboard-card summary-card">
                        <h3>👔 FedRAMP Executive Summary</h3>
                        <div id="executiveSummary">
                            ${this.generateFedRAMPExecutiveSummaryHTML(report, metrics)}
                        </div>
                    </div>

                    <!-- FedRAMP Automated Remediation -->
                    <div class="dashboard-card remediation-card">
                        <h3>🤖 FedRAMP Smart Remediation</h3>
                        <div id="remediationSuggestions">
                            ${this.generateFedRAMPRemediationHTML(report)}
                        </div>
                    </div>
                </div>

                <!-- Interactive Controls -->
                <div class="dashboard-controls">
                    <button class="btn primary" onclick="refreshDashboard()">🔄 Refresh Data</button>
                    <button class="btn secondary" onclick="exportDashboard()">📤 Export Dashboard</button>
                    <button class="btn secondary" onclick="scheduleReport()">⏰ Schedule Reports</button>
                    <button class="btn secondary" onclick="generateExecutiveReport()">👔 Executive Report</button>
                    <button class="btn secondary" onclick="showTrendAnalysis()">📈 Trend Analysis</button>
                </div>
            </div>

            <script>
                ${this.getDashboardJavaScript(chartData, heatMapData)}
            </script>
        </body>
        </html>
        `;
    }

    private calculateDashboardMetrics(report: ComplianceReport): DashboardMetrics {
        const totalIssues = report.issues.length;
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        const resolvedIssues = Math.floor(totalIssues * 0.3); // Mock resolved issues
        const newIssues = Math.floor(totalIssues * 0.1); // Mock new issues

        const complianceScore = this.calculateComplianceScore(report);
        const fedRAMPComplianceScore = this.calculateFedRAMPComplianceScore(report);
        const securityScore = this.calculateSecurityScore(report);
        const controlFamilyScores = this.calculateControlFamilyScores(report);
        const fedRAMPLevel = this.determineFedRAMPLevel(report);
        const authorizationStatus = this.determineAuthorizationStatus(fedRAMPComplianceScore, criticalIssues);
        
        return {
            complianceScore,
            fedRAMPComplianceScore,
            securityScore,
            trendDirection: fedRAMPComplianceScore > 75 ? 'up' : fedRAMPComplianceScore > 50 ? 'stable' : 'down',
            riskLevel: criticalIssues > 10 ? 'critical' : criticalIssues > 5 ? 'high' : criticalIssues > 2 ? 'medium' : 'low',
            remedationProgress: Math.min(100, (resolvedIssues / totalIssues) * 100),
            timeToCompliance: this.calculateTimeToCompliance(report),
            criticalIssues,
            resolvedIssues,
            newIssues,
            fedRAMPLevel,
            controlFamilyScores,
            authorizationStatus
        };
    }

    private generateChartData(report: ComplianceReport): ChartData {
        const fedRAMPFamilies = this.getFedRAMPControlFamilies();
        const familyNames = this.getFedRAMPControlFamilyNames();
        const familyScores = fedRAMPFamilies.map(family => {
            const familyIssues = report.issues.filter(issue => issue.control.startsWith(family + '-'));
            const errorCount = familyIssues.filter(i => i.severity === 'error').length;
            const warningCount = familyIssues.filter(i => i.severity === 'warning').length;
            return Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
        });

        return {
            labels: fedRAMPFamilies.map(family => `${family} - ${familyNames[family]}`),
            datasets: [{
                label: 'FedRAMP Control Family Compliance Score',
                data: familyScores,
                backgroundColor: [
                    '#2E7D32', '#1976D2', '#F57C00', '#D32F2F', '#7B1FA2',
                    '#00796B', '#5D4037', '#455A64', '#F9A825', '#C2185B',
                    '#0288D1'
                ],
                borderColor: ['#ffffff'],
                fill: false
            }]
        };
    }

    private generateRiskHeatMap(report: ComplianceReport): RiskHeatMapData[] {
        const fedRAMPFamilies = this.getFedRAMPControlFamilies();
        const familyNames = this.getFedRAMPControlFamilyNames();
        
        return fedRAMPFamilies.map(family => {
            const familyIssues = report.issues.filter(issue => issue.control.startsWith(family + '-'));
            const criticalCount = familyIssues.filter(i => i.severity === 'error').length;
            const warningCount = familyIssues.filter(i => i.severity === 'warning').length;
            
            // FedRAMP-specific risk scoring
            let riskScore = 0;
            if (family === 'AC' || family === 'SC' || family === 'AU') { // Critical families
                riskScore = Math.min(100, (criticalCount * 25) + (warningCount * 10));
            } else {
                riskScore = Math.min(100, (criticalCount * 20) + (warningCount * 8));
            }
            
            return {
                control: `${family} - ${familyNames[family]}`,
                riskScore,
                impact: Math.min(10, criticalCount + Math.floor(warningCount / 2) + 3),
                likelihood: Math.min(10, Math.floor(familyIssues.length / 2) + 2),
                category: this.getFedRAMPCategoryFromFamily(family),
                remedationEffort: criticalCount > 3 ? 'high' : criticalCount > 1 ? 'medium' : 'low'
            };
        });
    }

    // Executive Summary Generation
    async generateExecutiveSummary(report: ComplianceReport): Promise<ExecutiveSummary> {
        const complianceScore = this.calculateComplianceScore(report);
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        
        const overallStatus = complianceScore >= 90 ? 'compliant' : 
                             complianceScore >= 70 ? 'at-risk' : 'non-compliant';

        return {
            overallStatus,
            keyFindings: [
                `${criticalIssues} critical compliance gaps identified`,
                `${Math.round(complianceScore)}% overall compliance achieved`,
                `${this.getTopRiskAreas(report).join(', ')} require immediate attention`,
                `Estimated ${this.calculateTimeToCompliance(report)} to achieve full compliance`
            ],
            criticalActions: [
                'Address all critical security vulnerabilities within 30 days',
                'Implement missing access controls for high-risk systems',
                'Complete security awareness training for all personnel',
                'Establish continuous monitoring procedures'
            ],
            businessImpact: `Current compliance gaps pose ${criticalIssues > 5 ? 'HIGH' : 'MEDIUM'} business risk with potential regulatory penalties and operational disruptions.`,
            timeline: this.calculateTimeToCompliance(report),
            effortImpact: this.estimateEffortImpact(report),
            recommendations: [
                'Prioritize automated remediation for configuration issues',
                'Implement DevSecOps practices for continuous compliance',
                'Establish regular compliance monitoring and reporting',
                'Consider third-party security assessment for validation'
            ]
        };
    }

    // Automated Remediation Suggestions
    async generateRemediationSuggestions(report: ComplianceReport): Promise<RemediationSuggestion[]> {
        const suggestions: RemediationSuggestion[] = [];
        
        // Group issues by type for smart suggestions
        const issueGroups = this.groupIssuesByType(report.issues);
        
        for (const [type, issues] of issueGroups.entries()) {
            const suggestion = this.createRemediationSuggestion(type, issues);
            suggestions.push(suggestion);
        }

        // Sort by impact and priority
        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // Trend Analysis
    async generateTrendAnalysis(reports: ComplianceReport[]): Promise<TrendAnalysis> {
        const sortedReports = reports.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        return {
            period: 'Last 6 months',
            complianceScores: sortedReports.map(r => this.calculateComplianceScore(r)),
            issueVolumes: sortedReports.map(r => r.issues.length),
            categories: this.getControlFamilies(sortedReports[sortedReports.length - 1]),
            predictions: {
                nextQuarter: this.predictNextQuarterScore(sortedReports),
                riskAreas: this.identifyRiskAreas(sortedReports),
                recommendedActions: this.generatePredictiveRecommendations(sortedReports)
            }
        };
    }

    // Integration with External APIs
    async fetchExternalComplianceData(standard: string): Promise<any> {
        const endpoint = this.apiEndpoints.get(standard.toLowerCase());
        if (!endpoint) {
            throw new Error(`No API endpoint configured for ${standard}`);
        }

        try {
            // Mock API call - in real implementation, this would be an actual HTTP request
            return {
                controls: this.getMockControlData(standard),
                updates: this.getMockUpdateData(standard),
                benchmarks: this.getMockBenchmarkData(standard)
            };
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch ${standard} data: ${error}`);
            return null;
        }
    }

    // Scheduled Export Management
    async scheduleReportExport(config: {
        frequency: 'daily' | 'weekly' | 'monthly';
        format: 'html' | 'pdf' | 'json' | 'xlsx';
        recipients: string[];
        includeCharts: boolean;
        customTemplate?: string;
    }): Promise<string> {
        const scheduleId = `schedule_${Date.now()}`;
        
        this.scheduledExports.set(scheduleId, {
            ...config,
            nextRun: this.calculateNextRun(config.frequency),
            status: 'active'
        });

        vscode.window.showInformationMessage(
            `📅 Report export scheduled: ${config.frequency} ${config.format.toUpperCase()} reports to ${config.recipients.join(', ')}`
        );

        return scheduleId;
    }

    // Multi-format Export with Advanced Options
    async exportAdvancedReport(report: ComplianceReport, options: {
        format: 'html' | 'pdf' | 'xlsx' | 'docx' | 'json';
        includeCharts: boolean;
        includeDashboard: boolean;
        includeExecutiveSummary: boolean;
        includeRemediationPlan: boolean;
        template?: string;
        branding?: { logo: string; colors: string[] };
    }): Promise<void> {
        try {
            let content: string;
            
            switch (options.format) {
                case 'html':
                    content = await this.generateAdvancedHTMLReport(report, options);
                    break;
                case 'pdf':
                    content = await this.generatePDFReport(report, options);
                    break;
                case 'xlsx':
                    content = await this.generateExcelReport(report, options);
                    break;
                case 'docx':
                    content = await this.generateWordReport(report, options);
                    break;
                default:
                    content = JSON.stringify(report, null, 2);
            }

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`advanced_compliance_report_${new Date().toISOString().split('T')[0]}.${options.format}`),
                filters: {
                    'Report Files': [options.format]
                }
            });

            if (uri) {
                const fs = require('fs');
                fs.writeFileSync(uri.fsPath, content);
                vscode.window.showInformationMessage(`📊 Advanced report exported to ${uri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export advanced report: ${error}`);
        }
    }

    // Helper Methods
    private calculateComplianceScore(report: ComplianceReport): number {
        if (!report.issues.length) {
            return 100;
        }
        
        const totalPossiblePoints = 100;
        const errorPenalty = report.issues.filter(i => i.severity === 'error').length * 10;
        const warningPenalty = report.issues.filter(i => i.severity === 'warning').length * 5;
        const infoPenalty = report.issues.filter(i => i.severity === 'info').length * 2;
        
        return Math.max(0, totalPossiblePoints - errorPenalty - warningPenalty - infoPenalty);
    }

    private calculateSecurityScore(report: ComplianceReport): number {
        const securityIssues = report.issues.filter(issue => 
            issue.control.includes('SEC-') || 
            issue.control.includes('AC-') || 
            issue.control.includes('IA-') ||
            issue.control.includes('SC-')
        );
        
        if (!securityIssues.length) {
            return 100;
        }
        
        const criticalSecurity = securityIssues.filter(i => i.severity === 'error').length;
        return Math.max(0, 100 - (criticalSecurity * 15));
    }

    private getControlFamilies(report: ComplianceReport): string[] {
        const families = new Set<string>();
        report.issues.forEach(issue => {
            const family = issue.control.split('-')[0];
            families.add(family);
        });
        return Array.from(families);
    }

    private calculateTimeToCompliance(report: ComplianceReport): string {
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        const totalIssues = report.issues.length;
        
        const estimatedWeeks = Math.ceil((criticalIssues * 2) + (totalIssues * 0.5));
        
        if (estimatedWeeks <= 4) {
            return `${estimatedWeeks} weeks`;
        }
        if (estimatedWeeks <= 12) {
            return `${Math.ceil(estimatedWeeks / 4)} months`;
        }
        return `${Math.ceil(estimatedWeeks / 12)} quarters`;
    }

    private getTopRiskAreas(report: ComplianceReport): string[] {
        const familyCounts = new Map<string, number>();
        
        report.issues.forEach(issue => {
            const family = issue.control.split('-')[0];
            familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
        });

        return Array.from(familyCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([family]) => family);
    }

    private estimateEffortImpact(report: ComplianceReport): string {
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        const totalIssues = report.issues.length;
        
        const baseEffort = 4; // Base weeks for compliance
        const criticalEffort = criticalIssues * 2;
        const totalWeeks = baseEffort + criticalEffort + Math.floor(totalIssues * 0.5);
        
        if (totalWeeks <= 4) {
            return "1 month";
        }
        if (totalWeeks <= 12) {
            return "3 months";
        }
        if (totalWeeks <= 24) {
            return "6 months";
        }
        return "12+ months";
    }

    private groupIssuesByType(issues: ComplianceIssue[]): Map<string, ComplianceIssue[]> {
        const groups = new Map<string, ComplianceIssue[]>();
        
        issues.forEach(issue => {
            const type = this.classifyIssueType(issue);
            if (!groups.has(type)) {
                groups.set(type, []);
            }
            groups.get(type)!.push(issue);
        });
        
        return groups;
    }

    private classifyIssueType(issue: ComplianceIssue): string {
        if (issue.control.includes('AC-')) {
            return 'Access Control';
        }
        if (issue.control.includes('AU-')) {
            return 'Audit and Accountability';
        }
        if (issue.control.includes('SC-')) {
            return 'System Communications Protection';
        }
        if (issue.control.includes('SI-')) {
            return 'System and Information Integrity';
        }
        if (issue.control.includes('IA-')) {
            return 'Identification and Authentication';
        }
        return 'Configuration Management';
    }

    private createRemediationSuggestion(type: string, issues: ComplianceIssue[]): RemediationSuggestion {
        const criticalCount = issues.filter(i => i.severity === 'error').length;
        
        return {
            issueId: `remediation_${type.replace(/\s+/g, '_').toLowerCase()}`,
            control: type,
            priority: criticalCount > 3 ? 'critical' : criticalCount > 1 ? 'high' : 'medium',
            effort: issues.length > 10 ? 'high' : issues.length > 5 ? 'medium' : 'low',
            impact: criticalCount > 0 ? 'high' : 'medium',
            automationType: this.getAutomationType(type),
            steps: this.getRemediationSteps(type),
            estimatedTime: this.estimateRemediationTime(issues.length, criticalCount),
            requiredSkills: this.getRequiredSkills(type),
            dependencies: this.getDependencies(type),
            riskReduction: Math.min(95, criticalCount * 20 + issues.length * 5)
        };
    }

    private getAutomationType(type: string): 'automated' | 'semi-automated' | 'manual' {
        const automatedTypes = ['Configuration Management', 'System Communications Protection'];
        const semiAutomatedTypes = ['Access Control', 'Audit and Accountability'];
        
        if (automatedTypes.includes(type)) {
            return 'automated';
        }
        if (semiAutomatedTypes.includes(type)) {
            return 'semi-automated';
        }
        return 'manual';
    }

    private getRemediationSteps(type: string): string[] {
        const stepMap: Record<string, string[]> = {
            'Access Control': [
                'Review current access control policies',
                'Implement role-based access control (RBAC)',
                'Configure multi-factor authentication',
                'Set up automated access reviews',
                'Document access control procedures'
            ],
            'Configuration Management': [
                'Establish configuration baselines',
                'Implement automated configuration scanning',
                'Deploy configuration management tools',
                'Create change control procedures',
                'Set up continuous monitoring'
            ],
            'Audit and Accountability': [
                'Configure comprehensive logging',
                'Set up centralized log management',
                'Implement log analysis tools',
                'Establish audit procedures',
                'Create incident response workflows'
            ]
        };
        
        return stepMap[type] || [
            'Assess current implementation',
            'Design remediation approach',
            'Implement necessary controls',
            'Test and validate changes',
            'Document and monitor'
        ];
    }

    private estimateRemediationTime(issueCount: number, criticalCount: number): string {
        const baseHours = issueCount * 2;
        const criticalHours = criticalCount * 8;
        const totalHours = baseHours + criticalHours;
        
        if (totalHours <= 40) {
            return `${totalHours} hours`;
        }
        if (totalHours <= 160) {
            return `${Math.ceil(totalHours / 40)} weeks`;
        }
        return `${Math.ceil(totalHours / 160)} months`;
    }

    private getRequiredSkills(type: string): string[] {
        const skillMap: Record<string, string[]> = {
            'Access Control': ['Identity Management', 'RBAC Configuration', 'Security Policies'],
            'Configuration Management': ['System Administration', 'Automation Tools', 'Security Hardening'],
            'Audit and Accountability': ['Log Analysis', 'SIEM Configuration', 'Compliance Framework']
        };
        
        return skillMap[type] || ['General Security', 'System Administration'];
    }

    private getDependencies(type: string): string[] {
        const depMap: Record<string, string[]> = {
            'Access Control': ['Identity Provider Setup', 'Directory Services', 'Policy Framework'],
            'Configuration Management': ['Baseline Establishment', 'Tool Deployment', 'Process Definition'],
            'Audit and Accountability': ['Log Infrastructure', 'Storage Setup', 'Analysis Tools']
        };
        
        return depMap[type] || ['Infrastructure Setup', 'Tool Configuration'];
    }

    private predictNextQuarterScore(reports: ComplianceReport[]): number {
        if (reports.length < 2) {
            return this.calculateComplianceScore(reports[reports.length - 1]);
        }
        
        const scores = reports.map(r => this.calculateComplianceScore(r));
        const trend = scores[scores.length - 1] - scores[scores.length - 2];
        
        return Math.min(100, Math.max(0, scores[scores.length - 1] + (trend * 3)));
    }

    private identifyRiskAreas(reports: ComplianceReport[]): string[] {
        const allFamilies = new Set<string>();
        const familyTrends = new Map<string, number[]>();
        
        reports.forEach(report => {
            const familyCounts = new Map<string, number>();
            report.issues.forEach(issue => {
                const family = issue.control.split('-')[0];
                allFamilies.add(family);
                familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
            });
            
            allFamilies.forEach(family => {
                if (!familyTrends.has(family)) {
                    familyTrends.set(family, []);
                }
                familyTrends.get(family)!.push(familyCounts.get(family) || 0);
            });
        });
        
        return Array.from(familyTrends.entries())
            .filter(([_, trends]) => trends[trends.length - 1] > trends[0]) // Increasing trend
            .map(([family]) => family)
            .slice(0, 3);
    }

    private generatePredictiveRecommendations(reports: ComplianceReport[]): string[] {
        return [
            'Implement automated compliance monitoring',
            'Focus on preventive controls rather than detective',
            'Establish continuous security training program',
            'Deploy infrastructure as code for consistent configurations',
            'Create compliance feedback loops in development processes'
        ];
    }

    private getMockControlData(standard: string): any {
        return {
            totalControls: standard === 'FedRAMP' ? 325 : 150,
            implementedControls: standard === 'FedRAMP' ? 280 : 120,
            criticalControls: standard === 'FedRAMP' ? 45 : 30
        };
    }

    private getMockUpdateData(standard: string): any {
        return {
            lastUpdate: new Date().toISOString(),
            changes: [`${standard} baseline updated`, 'New control guidance available'],
            notifications: [`${standard} assessment deadline approaching`]
        };
    }

    private getMockBenchmarkData(standard: string): any {
        return {
            industryAverage: 78,
            topPerformers: 92,
            yourScore: this.calculateComplianceScore(this.reportHistory[this.reportHistory.length - 1] || {} as ComplianceReport)
        };
    }

    private calculateNextRun(frequency: string): Date {
        const now = new Date();
        switch (frequency) {
            case 'daily':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
    }

    private async generateAdvancedHTMLReport(report: ComplianceReport, options: any): Promise<string> {
        const metrics = this.calculateDashboardMetrics(report);
        const chartData = this.generateChartData(report);
        const heatMapData = this.generateRiskHeatMap(report);
        
        let content = this.generateDashboardHTML(metrics, chartData, heatMapData, report);
        
        if (options.includeExecutiveSummary) {
            const summary = await this.generateExecutiveSummary(report);
            content += this.renderExecutiveSummaryHTML(summary);
        }
        
        if (options.includeRemediationPlan) {
            const suggestions = await this.generateRemediationSuggestions(report);
            content += this.renderRemediationPlanHTML(suggestions);
        }
        
        return content;
    }

    private async generatePDFReport(report: ComplianceReport, options: any): Promise<string> {
        // Mock PDF generation - in real implementation, would use PDF library
        return `PDF Report Content for ${report.level} compliance`;
    }

    private async generateExcelReport(report: ComplianceReport, options: any): Promise<string> {
        // Mock Excel generation - in real implementation, would use Excel library
        return `Excel Report Content for ${report.level} compliance`;
    }

    private async generateWordReport(report: ComplianceReport, options: any): Promise<string> {
        // Mock Word generation - in real implementation, would use Word library
        return `Word Report Content for ${report.level} compliance`;
    }

    private renderExecutiveSummaryHTML(summary: ExecutiveSummary): string {
        return `
        <div class="executive-summary">
            <h2>👔 Executive Summary</h2>
            <div class="summary-content">
                <div class="status-indicator ${summary.overallStatus}">
                    ${summary.overallStatus.toUpperCase()}
                </div>
                <div class="key-findings">
                    <h3>Key Findings</h3>
                    <ul>${summary.keyFindings.map(f => `<li>${f}</li>`).join('')}</ul>
                </div>
                <div class="recommendations">
                    <h3>Recommendations</h3>
                    <ul>${summary.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
        `;
    }

    private renderRemediationPlanHTML(suggestions: RemediationSuggestion[]): string {
        return `
        <div class="remediation-plan">
            <h2>🔧 Automated Remediation Plan</h2>
            <div class="suggestions-grid">
                ${suggestions.map(s => `
                    <div class="suggestion-card ${s.priority}">
                        <h3>${s.control}</h3>
                        <div class="suggestion-meta">
                            <span class="priority">${s.priority.toUpperCase()}</span>
                            <span class="effort">${s.effort} effort</span>
                            <span class="automation">${s.automationType}</span>
                        </div>
                        <div class="steps">
                            <ol>${s.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                        </div>
                        <div class="timeline">Estimated time: ${s.estimatedTime}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    private generateExecutiveSummaryHTML(report: ComplianceReport): string {
        const summary = {
            complianceScore: this.calculateComplianceScore(report),
            criticalIssues: report.issues.filter(i => i.severity === 'error').length,
            keyRisks: this.getTopRiskAreas(report),
            timeToCompliance: this.calculateTimeToCompliance(report)
        };

        return `
        <div class="executive-summary-widget">
            <div class="summary-metrics">
                <div class="metric">
                    <span class="value">${summary.complianceScore}%</span>
                    <span class="label">Compliance</span>
                </div>
                <div class="metric">
                    <span class="value">${summary.criticalIssues}</span>
                    <span class="label">Critical Issues</span>
                </div>
                <div class="metric">
                    <span class="value">${summary.timeToCompliance}</span>
                    <span class="label">To Compliance</span>
                </div>
            </div>
            <div class="risk-areas">
                <h4>Top Risk Areas:</h4>
                <div class="risk-tags">
                    ${summary.keyRisks.map(risk => `<span class="risk-tag">${risk}</span>`).join('')}
                </div>
            </div>
        </div>
        `;
    }

    private generateRemediationSuggestionsHTML(report: ComplianceReport): string {
        const suggestions = [
            { title: 'Configure MFA', effort: 'Low', impact: 'High', automation: '✅ Automated' },
            { title: 'Update Access Policies', effort: 'Medium', impact: 'High', automation: '🔄 Semi-Auto' },
            { title: 'Enable Audit Logging', effort: 'Low', impact: 'Medium', automation: '✅ Automated' }
        ];

        return `
        <div class="remediation-suggestions-widget">
            ${suggestions.map(s => `
                <div class="suggestion-item">
                    <div class="suggestion-title">${s.title}</div>
                    <div class="suggestion-meta">
                        <span class="effort">${s.effort}</span>
                        <span class="impact">${s.impact} Impact</span>
                        <span class="automation">${s.automation}</span>
                    </div>
                </div>
            `).join('')}
            <button class="btn small" onclick="showFullRemediationPlan()">View Full Plan</button>
        </div>
        `;
    }

    // FedRAMP-Specific HTML Generation Methods
    private generateControlFamilyScoresHTML(controlFamilyScores: { [family: string]: number }): string {
        const familyNames = this.getFedRAMPControlFamilyNames();
        
        return `
        <div class="control-family-grid">
            ${Object.entries(controlFamilyScores).map(([family, score]) => {
                const status = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'critical';
                return `
                    <div class="family-score-card ${status}">
                        <div class="family-code">${family}</div>
                        <div class="family-name">${familyNames[family] || family}</div>
                        <div class="family-score">${score}%</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${score}%"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        `;
    }

    private generateFedRAMPExecutiveSummaryHTML(report: ComplianceReport, metrics: DashboardMetrics): string {
        const criticalControls = report.issues.filter(i => 
            i.severity === 'error' && (i.control.startsWith('AC-') || i.control.startsWith('SC-') || i.control.startsWith('AU-'))
        ).length;

        return `
        <div class="fedramp-executive-summary">
            <div class="authorization-status">
                <div class="status-indicator ${metrics.authorizationStatus.toLowerCase().replace(' ', '-')}">
                    <span class="status-icon">🏛️</span>
                    <span class="status-text">${metrics.authorizationStatus}</span>
                </div>
            </div>
            
            <div class="summary-metrics">
                <div class="metric primary">
                    <span class="value">${metrics.fedRAMPComplianceScore}%</span>
                    <span class="label">FedRAMP Compliance</span>
                </div>
                <div class="metric">
                    <span class="value">${metrics.fedRAMPLevel}</span>
                    <span class="label">Impact Level</span>
                </div>
                <div class="metric">
                    <span class="value">${criticalControls}</span>
                    <span class="label">Critical Controls</span>
                </div>
            </div>

            <div class="key-findings">
                <h4>Key FedRAMP Findings:</h4>
                <ul>
                    <li>System requires ${metrics.fedRAMPLevel} impact level authorization</li>
                    <li>${metrics.criticalIssues} critical control deficiencies identified</li>
                    <li>Current authorization status: ${metrics.authorizationStatus}</li>
                    <li>Estimated time to ATO: ${metrics.timeToCompliance}</li>
                </ul>
            </div>
        </div>
        `;
    }

    private generateFedRAMPRemediationHTML(report: ComplianceReport): string {
        const fedRAMPPriorities = [
            { control: 'AC-2', title: 'Account Management', effort: 'Medium', impact: 'Critical', automation: '🔄 Semi-Auto' },
            { control: 'SC-7', title: 'Boundary Protection', effort: 'High', impact: 'Critical', automation: '✅ Automated' },
            { control: 'AU-2', title: 'Audit Events', effort: 'Low', impact: 'High', automation: '✅ Automated' },
            { control: 'IA-2', title: 'Multi-Factor Authentication', effort: 'Medium', impact: 'Critical', automation: '🔄 Semi-Auto' }
        ];

        return `
        <div class="fedramp-remediation-widget">
            ${fedRAMPPriorities.map(item => {
                const hasIssue = report.issues.some(issue => issue.control.startsWith(item.control));
                return `
                    <div class="remediation-item ${hasIssue ? 'has-issue' : 'compliant'}">
                        <div class="control-info">
                            <span class="control-id">${item.control}</span>
                            <span class="control-title">${item.title}</span>
                            ${hasIssue ? '<span class="issue-indicator">⚠️</span>' : '<span class="compliant-indicator">✅</span>'}
                        </div>
                        <div class="remediation-meta">
                            <span class="effort">${item.effort}</span>
                            <span class="impact">${item.impact}</span>
                            <span class="automation">${item.automation}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        `;
    }

    private getDashboardCSS(): string {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            line-height: 1.6;
        }
        
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .dashboard-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .live-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: var(--vscode-sidebar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .metric-value {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .compliance-score .metric-value { color: #4CAF50; }
        .security-score .metric-value { color: #2196F3; }
        .progress .metric-value { color: #FF9800; }
        .timeline .metric-value { color: #9C27B0; }
        
        .metric-label {
            font-size: 1.1em;
            opacity: 0.8;
            margin-bottom: 10px;
        }
        
        .metric-trend {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 1.5em;
        }
        
        .metric-trend.up { color: #4CAF50; }
        .metric-trend.down { color: #F44336; }
        .metric-trend.stable { color: #FF9800; }
        
        .metric-risk {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .metric-risk.low { background: #4CAF50; color: white; }
        .metric-risk.medium { background: #FF9800; color: white; }
        .metric-risk.high { background: #F44336; color: white; }
        .metric-risk.critical { background: #B71C1C; color: white; }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--vscode-progressBar-background);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.8s ease;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .dashboard-card {
            background: var(--vscode-sidebar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 12px;
            padding: 25px;
            min-height: 300px;
        }
        
        .dashboard-card h3 {
            margin-bottom: 20px;
            font-size: 1.3em;
            color: var(--vscode-textLink-foreground);
        }
        
        .chart-card canvas {
            max-height: 250px;
        }
        
        .summary-card, .remediation-card {
            grid-column: span 2;
        }
        
        .dashboard-controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-widget-border);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .executive-summary-widget {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .summary-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .summary-metrics .metric {
            text-align: center;
        }
        
        .summary-metrics .value {
            font-size: 2em;
            font-weight: bold;
            display: block;
        }
        
        .summary-metrics .label {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .risk-areas h4 {
            margin-bottom: 10px;
        }
        
        .risk-tags {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .risk-tag {
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .remediation-suggestions-widget .suggestion-item {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .suggestion-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .suggestion-meta {
            display: flex;
            gap: 10px;
            font-size: 0.9em;
        }
        
        .suggestion-meta span {
            padding: 2px 8px;
            border-radius: 12px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        
        .btn.small {
            padding: 8px 16px;
            font-size: 12px;
            margin-top: 10px;
        }
        
        #riskHeatMap {
            min-height: 200px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 5px;
        }
        
        .heatmap-cell {
            padding: 10px;
            text-align: center;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .heatmap-cell:hover {
            transform: scale(1.05);
        }
        
        .risk-0 { background: #4CAF50; color: white; }
        .risk-1 { background: #8BC34A; color: white; }
        .risk-2 { background: #CDDC39; color: black; }
        .risk-3 { background: #FFEB3B; color: black; }
        .risk-4 { background: #FFC107; color: black; }
        .risk-5 { background: #FF9800; color: white; }
        .risk-6 { background: #FF5722; color: white; }
        .risk-7 { background: #F44336; color: white; }
        .risk-8 { background: #E91E63; color: white; }
        .risk-9 { background: #9C27B0; color: white; }

        /* FedRAMP-Specific Styles */
        .fedramp-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        }

        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .status-badge.ato { background: #4CAF50; color: white; }
        .status-badge.p-ato { background: #FF9800; color: white; }
        .status-badge.in-process { background: #2196F3; color: white; }
        .status-badge.not-started { background: #757575; color: white; }

        .fedramp-level {
            background: linear-gradient(135deg, #1976D2, #0D47A1);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
        }

        .metric-card.fedramp-score.primary {
            border: 3px solid #1976D2;
            background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(13, 71, 161, 0.1));
        }

        .metric-card.fedramp-score .metric-value {
            color: #1976D2;
            font-size: 3.5em;
        }

        .critical-issues {
            color: #F44336;
            font-weight: bold;
            font-size: 0.9em;
        }

        .control-family-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .family-score-card {
            background: var(--vscode-sidebar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }

        .family-score-card.excellent { border-left: 4px solid #4CAF50; }
        .family-score-card.good { border-left: 4px solid #8BC34A; }
        .family-score-card.warning { border-left: 4px solid #FF9800; }
        .family-score-card.critical { border-left: 4px solid #F44336; }

        .family-code {
            font-weight: bold;
            font-size: 1.2em;
            color: #1976D2;
        }

        .family-name {
            font-size: 0.8em;
            opacity: 0.8;
            margin: 5px 0;
        }

        .family-score {
            font-size: 1.5em;
            font-weight: bold;
            margin: 10px 0;
        }

        .score-bar {
            background: var(--vscode-widget-border);
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        }

        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #F44336 0%, #FF9800 50%, #4CAF50 100%);
            transition: width 0.3s ease;
        }

        .authorization-progress {
            margin: 20px 0;
        }

        .ato-pathway {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }

        .ato-pathway::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--vscode-widget-border);
            z-index: 1;
        }

        .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: var(--vscode-editor-background);
            padding: 10px;
            border-radius: 8px;
            position: relative;
            z-index: 2;
        }

        .step.completed {
            background: #4CAF50;
            color: white;
        }

        .step.pending {
            background: var(--vscode-widget-border);
            color: var(--vscode-foreground);
        }

        .step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: currentColor;
            color: var(--vscode-editor-background);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .step-name {
            font-size: 0.8em;
            text-align: center;
        }

        .fedramp-executive-summary {
            background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }

        .authorization-status {
            text-align: center;
            margin-bottom: 20px;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.2);
            font-weight: bold;
        }

        .status-icon {
            font-size: 1.2em;
        }

        .fedramp-remediation-widget .remediation-item {
            background: var(--vscode-sidebar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }

        .remediation-item.has-issue {
            border-left: 4px solid #F44336;
        }

        .remediation-item.compliant {
            border-left: 4px solid #4CAF50;
        }

        .control-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .control-id {
            background: #1976D2;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8em;
        }

        .control-title {
            font-weight: bold;
            flex-grow: 1;
        }

        .issue-indicator {
            color: #F44336;
        }

        .compliant-indicator {
            color: #4CAF50;
        }

        .remediation-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .remediation-meta span {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }

        .effort {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .impact {
            background: var(--vscode-errorForeground);
            color: white;
        }

        .automation {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        `;
    }

    private getDashboardJavaScript(chartData: ChartData, heatMapData: RiskHeatMapData[]): string {
        return `
        const vscode = acquireVsCodeApi();
        
        // Initialize Charts
        document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();
            initializeHeatMap();
            setupInteractivity();
        });
        
        function initializeCharts() {
            // Compliance Trend Chart
            const trendCtx = document.getElementById('complianceTrendChart');
            if (trendCtx) {
                new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Compliance Score',
                            data: [65, 70, 75, 80, 85, 90],
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true, max: 100 }
                        }
                    }
                });
            }
            
            // Issue Distribution Chart
            const distCtx = document.getElementById('issueDistributionChart');
            if (distCtx) {
                new Chart(distCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Critical', 'High', 'Medium', 'Low'],
                        datasets: [{
                            data: [12, 25, 45, 18],
                            backgroundColor: ['#F44336', '#FF9800', '#FFC107', '#4CAF50']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
            
            // Control Family Chart
            const familyCtx = document.getElementById('controlFamilyChart');
            if (familyCtx) {
                new Chart(familyCtx, {
                    type: 'bar',
                    data: ${JSON.stringify(chartData)},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true, max: 100 }
                        }
                    }
                });
            }
        }
        
        function initializeHeatMap() {
            const heatMapContainer = document.getElementById('riskHeatMap');
            const heatMapData = ${JSON.stringify(heatMapData)};
            
            heatMapData.forEach(item => {
                const cell = document.createElement('div');
                cell.className = \`heatmap-cell risk-\${Math.floor(item.riskScore / 10)}\`;
                cell.textContent = item.control;
                cell.title = \`Risk Score: \${item.riskScore}, Impact: \${item.impact}, Likelihood: \${item.likelihood}\`;
                cell.onclick = () => showControlDetails(item);
                heatMapContainer.appendChild(cell);
            });
        }
        
        function setupInteractivity() {
            // Auto-refresh every 30 seconds
            setInterval(updateMetrics, 30000);
        }
        
        function refreshDashboard() {
            vscode.postMessage({ command: 'refreshDashboard' });
            showLoading();
        }
        
        function exportDashboard() {
            vscode.postMessage({ command: 'exportDashboard' });
        }
        
        function scheduleReport() {
            vscode.postMessage({ command: 'scheduleReport' });
        }
        
        function generateExecutiveReport() {
            vscode.postMessage({ command: 'generateExecutiveReport' });
        }
        
        function showTrendAnalysis() {
            vscode.postMessage({ command: 'showTrendAnalysis' });
        }
        
        function showFullRemediationPlan() {
            vscode.postMessage({ command: 'showRemediationPlan' });
        }
        
        function showControlDetails(control) {
            vscode.postMessage({ 
                command: 'showControlDetails', 
                control: control 
            });
        }
        
        function updateMetrics() {
            // Simulate real-time updates
            const scoreElement = document.querySelector('.compliance-score .metric-value');
            if (scoreElement) {
                const currentScore = parseInt(scoreElement.textContent);
                const newScore = currentScore + Math.floor(Math.random() * 3) - 1;
                scoreElement.textContent = Math.max(0, Math.min(100, newScore)) + '%';
            }
        }
        
        function showLoading() {
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-overlay';
            loadingDiv.innerHTML = '<div class="spinner">⟳</div><p>Refreshing dashboard...</p>';
            document.body.appendChild(loadingDiv);
            
            setTimeout(() => {
                document.body.removeChild(loadingDiv);
            }, 2000);
        }
        `;
    }

    private getTrendIcon(direction: string): string {
        switch (direction) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    }

    private getCategoryFromFamily(family: string): string {
        const categoryMap: Record<string, string> = {
            'AC': 'Access Control',
            'AU': 'Audit',
            'SC': 'System Protection',
            'SI': 'System Integrity',
            'IA': 'Authentication',
            'CM': 'Configuration'
        };
        return categoryMap[family] || 'General';
    }

    // FedRAMP-Specific Helper Methods
    private calculateFedRAMPComplianceScore(report: ComplianceReport): number {
        if (!report.issues.length) {
            return 100;
        }

        // FedRAMP control families with their weights
        const fedRAMPFamilies = {
            'AC': 15, // Access Control - Critical
            'AU': 12, // Audit and Accountability
            'SC': 15, // System and Communications Protection - Critical
            'SI': 12, // System and Information Integrity
            'IA': 10, // Identification and Authentication
            'CM': 8,  // Configuration Management
            'CP': 6,  // Contingency Planning
            'IR': 6,  // Incident Response
            'RA': 6,  // Risk Assessment
            'SA': 5,  // System and Services Acquisition
            'CA': 5   // Security Assessment and Authorization
        };

        let totalWeight = 0;
        let achievedScore = 0;

        Object.entries(fedRAMPFamilies).forEach(([family, weight]) => {
            totalWeight += weight;
            const familyIssues = report.issues.filter(issue => issue.control.startsWith(family + '-'));
            const errorCount = familyIssues.filter(i => i.severity === 'error').length;
            const warningCount = familyIssues.filter(i => i.severity === 'warning').length;
            
            // Calculate family score (0-100)
            const familyScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
            achievedScore += (familyScore * weight) / 100;
        });

        return Math.round((achievedScore / totalWeight) * 100);
    }

    private calculateControlFamilyScores(report: ComplianceReport): { [family: string]: number } {
        const fedRAMPFamilies = ['AC', 'AU', 'SC', 'SI', 'IA', 'CM', 'CP', 'IR', 'RA', 'SA', 'CA'];
        const scores: { [family: string]: number } = {};

        fedRAMPFamilies.forEach(family => {
            const familyIssues = report.issues.filter(issue => issue.control.startsWith(family + '-'));
            const errorCount = familyIssues.filter(i => i.severity === 'error').length;
            const warningCount = familyIssues.filter(i => i.severity === 'warning').length;
            
            scores[family] = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
        });

        return scores;
    }

    private determineFedRAMPLevel(report: ComplianceReport): 'Low' | 'Moderate' | 'High' {
        // Determine based on control complexity and security requirements
        const criticalControls = report.issues.filter(issue => 
            issue.control.match(/SC-7|SC-8|SC-28|AC-2|AC-3|AU-2|IA-2|SI-4/));
        
        const errorCount = report.issues.filter(i => i.severity === 'error').length;
        
        if (criticalControls.length > 20 || errorCount > 15) {
            return 'High';
        }
        if (criticalControls.length > 10 || errorCount > 8) {
            return 'Moderate';
        }
        return 'Low';
    }

    private determineAuthorizationStatus(complianceScore: number, criticalIssues: number): 'ATO' | 'P-ATO' | 'In Process' | 'Not Started' {
        if (complianceScore >= 95 && criticalIssues === 0) {
            return 'ATO'; // Authority to Operate
        }
        if (complianceScore >= 85 && criticalIssues <= 2) {
            return 'P-ATO'; // Provisional Authority to Operate
        }
        if (complianceScore >= 60) {
            return 'In Process';
        }
        return 'Not Started';
    }

    private getFedRAMPControlFamilies(): string[] {
        return ['AC', 'AU', 'SC', 'SI', 'IA', 'CM', 'CP', 'IR', 'RA', 'SA', 'CA'];
    }

    private getFedRAMPControlFamilyNames(): { [key: string]: string } {
        return {
            'AC': 'Access Control',
            'AU': 'Audit and Accountability', 
            'SC': 'System and Communications Protection',
            'SI': 'System and Information Integrity',
            'IA': 'Identification and Authentication',
            'CM': 'Configuration Management',
            'CP': 'Contingency Planning',
            'IR': 'Incident Response',
            'RA': 'Risk Assessment',
            'SA': 'System and Services Acquisition',
            'CA': 'Security Assessment and Authorization'
        };
    }

    private getFedRAMPCategoryFromFamily(family: string): string {
        const categories: { [key: string]: string } = {
            'AC': 'Identity & Access',
            'AU': 'Audit & Accountability',
            'SC': 'Security Controls',
            'SI': 'System Integrity',
            'IA': 'Authentication',
            'CM': 'Configuration',
            'CP': 'Contingency',
            'IR': 'Incident Response',
            'RA': 'Risk Management',
            'SA': 'Acquisition',
            'CA': 'Assessment'
        };
        return categories[family] || 'Other';
    }
}
