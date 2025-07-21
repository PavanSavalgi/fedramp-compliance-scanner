import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue, FedRAMPLevel } from './types';

export interface ReportScore {
    overall: number;
    compliance: number;
    security: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface VulnerabilityMetrics {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    totalVulnerabilities: number;
    riskScore: number;
}

export interface ComplianceMetrics {
    fedrampLowCompliance: number;
    fedrampModerateCompliance: number;
    fedrampHighCompliance: number;
    controlsCovered: number;
    totalControls: number;
    complianceGaps: string[];
    complianceScore: number;
}

export interface WorkspaceMetrics {
    totalFiles: number;
    scannedFiles: number;
    skippedFiles: number;
    fileTypes: Record<string, number>;
    scanDuration: number;
    lastScanTime: Date;
    issuesByFamily: Record<string, number>;
    trendsData: {
        previous: number;
        current: number;
        improvement: number;
    };
}

export interface EnhancedComplianceReport extends ComplianceReport {
    reportId: string;
    reportType: 'workspace' | 'compliance' | 'vulnerability' | 'dashboard';
    score: ReportScore;
    vulnerabilityMetrics: VulnerabilityMetrics;
    complianceMetrics: ComplianceMetrics;
    workspaceMetrics: WorkspaceMetrics;
    recommendations: string[];
    actionItems: {
        priority: 'Critical' | 'High' | 'Medium' | 'Low';
        description: string;
        estimatedTime: string;
        impact: string;
    }[];
}

export class EnhancedReportGenerator {
    private reportHistory: EnhancedComplianceReport[] = [];
    private currentReport: EnhancedComplianceReport | null = null;

    constructor() {
        this.loadReportHistory();
    }

    async generateWorkspaceReport(report: ComplianceReport): Promise<void> {
        const enhancedReport = await this.enhanceReport(report, 'workspace');
        await this.displayReport(enhancedReport, '🌐 Workspace Compliance Report');
    }

    async generateComplianceOnlyReport(report: ComplianceReport): Promise<void> {
        const enhancedReport = await this.enhanceReport(report, 'compliance');
        await this.displayReport(enhancedReport, '✅ Compliance Analysis Report');
    }

    async generateVulnerabilityOnlyReport(report: ComplianceReport): Promise<void> {
        const enhancedReport = await this.enhanceReport(report, 'vulnerability');
        await this.displayReport(enhancedReport, '🔒 Vulnerability Assessment Report');
    }

    async generateAdvancedDashboard(report: ComplianceReport): Promise<void> {
        const enhancedReport = await this.enhanceReport(report, 'dashboard');
        await this.displayReport(enhancedReport, '📊 Advanced Compliance Dashboard');
    }

    private async enhanceReport(report: ComplianceReport, reportType: EnhancedComplianceReport['reportType']): Promise<EnhancedComplianceReport> {
        const reportId = this.generateReportId();
        const score = this.calculateReportScore(report);
        const vulnerabilityMetrics = this.calculateVulnerabilityMetrics(report);
        const complianceMetrics = this.calculateComplianceMetrics(report);
        const workspaceMetrics = this.calculateWorkspaceMetrics(report);
        const recommendations = this.generateRecommendations(report, score);
        const actionItems = this.generateActionItems(report);

        const enhancedReport: EnhancedComplianceReport = {
            ...report,
            reportId,
            reportType,
            score,
            vulnerabilityMetrics,
            complianceMetrics,
            workspaceMetrics,
            recommendations,
            actionItems
        };

        this.currentReport = enhancedReport;
        this.reportHistory.push(enhancedReport);
        await this.saveReportHistory();

        return enhancedReport;
    }

    private calculateReportScore(report: ComplianceReport): ReportScore {
        const totalIssues = report.issues.length;
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        const warningIssues = report.issues.filter(i => i.severity === 'warning').length;
        
        // Calculate compliance score (0-100)
        const complianceRate = report.summary.controlsCovered / report.summary.totalControls;
        const compliance = Math.round(complianceRate * 100);
        
        // Calculate security score based on issue severity
        const securityPenalty = (criticalIssues * 10) + (warningIssues * 5) + (report.summary.info * 1);
        const security = Math.max(0, 100 - (securityPenalty / Math.max(1, report.scannedFiles)));
        
        // Overall score
        const overall = Math.round((compliance * 0.6) + (security * 0.4));
        
        // Determine risk level
        let riskLevel: ReportScore['riskLevel'];
        if (overall >= 90) {
            riskLevel = 'Low';
        } else if (overall >= 70) {
            riskLevel = 'Medium';
        } else if (overall >= 50) {
            riskLevel = 'High';
        } else {
            riskLevel = 'Critical';
        }
        
        // Determine grade
        let grade: ReportScore['grade'];
        if (overall >= 90) {
            grade = 'A';
        } else if (overall >= 80) {
            grade = 'B';
        } else if (overall >= 70) {
            grade = 'C';
        } else if (overall >= 60) {
            grade = 'D';
        } else {
            grade = 'F';
        }

        return {
            overall,
            compliance,
            security: Math.round(security),
            riskLevel,
            grade
        };
    }

    private calculateVulnerabilityMetrics(report: ComplianceReport): VulnerabilityMetrics {
        const critical = report.issues.filter(i => i.severity === 'error').length;
        const high = Math.floor(critical * 0.7); // Estimate high severity
        const medium = report.issues.filter(i => i.severity === 'warning').length;
        const low = Math.floor(medium * 0.5); // Estimate low severity
        const info = report.issues.filter(i => i.severity === 'info').length;
        const totalVulnerabilities = critical + high + medium + low + info;
        
        // Calculate risk score (0-100, higher is more risky)
        const riskScore = Math.min(100, 
            (critical * 25) + (high * 15) + (medium * 8) + (low * 3) + (info * 1)
        );

        return {
            critical,
            high,
            medium,
            low,
            info,
            totalVulnerabilities,
            riskScore
        };
    }

    private calculateComplianceMetrics(report: ComplianceReport): ComplianceMetrics {
        const totalControls = report.summary.totalControls;
        const controlsCovered = report.summary.controlsCovered;
        
        // FedRAMP compliance calculations (based on control coverage)
        const fedrampLowCompliance = Math.round((controlsCovered / Math.max(1, totalControls)) * 100);
        const fedrampModerateCompliance = Math.round((controlsCovered / Math.max(1, totalControls * 1.5)) * 100);
        const fedrampHighCompliance = Math.round((controlsCovered / Math.max(1, totalControls * 2)) * 100);
        
        const complianceScore = fedrampLowCompliance; // Base on Low level
        
        // Identify compliance gaps
        const complianceGaps: string[] = [];
        if (fedrampLowCompliance < 100) {
            complianceGaps.push('FedRAMP Low baseline gaps detected');
        }
        if (fedrampModerateCompliance < 100) {
            complianceGaps.push('FedRAMP Moderate baseline gaps detected');
        }
        if (report.issues.filter(i => i.severity === 'error').length > 0) {
            complianceGaps.push('Critical compliance violations found');
        }

        return {
            fedrampLowCompliance,
            fedrampModerateCompliance,
            fedrampHighCompliance,
            controlsCovered,
            totalControls,
            complianceGaps,
            complianceScore
        };
    }

    private calculateWorkspaceMetrics(report: ComplianceReport): WorkspaceMetrics {
        const previousReport = this.reportHistory[this.reportHistory.length - 1];
        
        // Group issues by control family
        const issuesByFamily: Record<string, number> = {};
        report.issues.forEach(issue => {
            const family = issue.control.split('-')[0];
            issuesByFamily[family] = (issuesByFamily[family] || 0) + 1;
        });

        // Calculate file type distribution
        const fileTypes: Record<string, number> = {};
        report.issues.forEach(issue => {
            const ext = issue.file.split('.').pop() || 'unknown';
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        });

        return {
            totalFiles: report.totalFiles,
            scannedFiles: report.scannedFiles,
            skippedFiles: report.totalFiles - report.scannedFiles,
            fileTypes,
            scanDuration: 0, // Will be set by scanner
            lastScanTime: report.timestamp,
            issuesByFamily,
            trendsData: {
                previous: previousReport?.issues.length || 0,
                current: report.issues.length,
                improvement: previousReport ? 
                    ((previousReport.issues.length - report.issues.length) / Math.max(1, previousReport.issues.length)) * 100 : 0
            }
        };
    }

    private generateRecommendations(report: ComplianceReport, score: ReportScore): string[] {
        const recommendations: string[] = [];
        
        if (score.overall < 70) {
            recommendations.push('🚨 Immediate action required: Overall compliance score is below acceptable threshold');
        }
        
        if (score.compliance < 90) {
            recommendations.push('📋 Focus on implementing missing FedRAMP controls to improve compliance coverage');
        }
        
        if (report.issues.filter(i => i.severity === 'error').length > 0) {
            recommendations.push('🔴 Address all critical security violations as highest priority');
        }
        
        if (score.riskLevel === 'High' || score.riskLevel === 'Critical') {
            recommendations.push('⚠️ Implement comprehensive security review and remediation plan');
        }
        
        recommendations.push('📈 Establish continuous monitoring for ongoing compliance maintenance');
        recommendations.push('🎯 Consider implementing additional controls for enhanced security posture');
        
        return recommendations;
    }

    private generateActionItems(report: ComplianceReport): EnhancedComplianceReport['actionItems'] {
        const actionItems: EnhancedComplianceReport['actionItems'] = [];
        
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        if (criticalIssues > 0) {
            actionItems.push({
                priority: 'Critical',
                description: `Remediate ${criticalIssues} critical security violations`,
                estimatedTime: `${criticalIssues * 8} hours`,
                impact: 'High - Reduces security risk and improves compliance score'
            });
        }
        
        const warningIssues = report.issues.filter(i => i.severity === 'warning').length;
        if (warningIssues > 0) {
            actionItems.push({
                priority: 'High',
                description: `Address ${warningIssues} compliance warnings`,
                estimatedTime: `${warningIssues * 2} hours`,
                impact: 'Medium - Improves overall compliance posture'
            });
        }
        
        if (report.summary.controlsCovered < report.summary.totalControls) {
            const missingControls = report.summary.totalControls - report.summary.controlsCovered;
            actionItems.push({
                priority: 'Medium',
                description: `Implement ${missingControls} missing FedRAMP controls`,
                estimatedTime: `${missingControls * 4} hours`,
                impact: 'High - Achieves full FedRAMP compliance'
            });
        }
        
        return actionItems;
    }

    private async displayReport(report: EnhancedComplianceReport, title: string): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'enhancedComplianceReport',
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = await this.getReportContent(report);
        
        // Handle webview messages
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'exportReport':
                        await this.exportReport(report, message.format);
                        break;
                    case 'switchReportType':
                        await this.switchReportType(report, message.reportType, panel);
                        break;
                    case 'refreshData':
                        // Trigger new scan and refresh
                        vscode.commands.executeCommand('fedramp-compliance.scanWorkspace');
                        break;
                }
            }
        );
    }

    private async getReportContent(report: EnhancedComplianceReport): Promise<string> {
        switch (report.reportType) {
            case 'workspace':
                return this.getWorkspaceReportContent(report);
            case 'compliance':
                return this.getComplianceReportContent(report);
            case 'vulnerability':
                return this.getVulnerabilityReportContent(report);
            case 'dashboard':
                return this.getDashboardContent(report);
            default:
                return this.getWorkspaceReportContent(report);
        }
    }

    private getWorkspaceReportContent(report: EnhancedComplianceReport): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workspace Compliance Report</title>
    <style>
        ${this.getBaseStyles()}
        .workspace-overview { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="report-header">
            <h1>🌐 Workspace Compliance Report</h1>
            <div class="report-meta">
                <span>Generated: ${report.timestamp.toLocaleString()}</span>
                <span>Report ID: ${report.reportId}</span>
                <span class="score-badge grade-${report.score.grade}">${report.score.grade}</span>
            </div>
        </header>

        <div class="workspace-overview">
            <div class="metric-card">
                <div class="metric-value">${report.workspaceMetrics.totalFiles}</div>
                <div class="metric-label">Total Files</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.workspaceMetrics.scannedFiles}</div>
                <div class="metric-label">Scanned Files</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.score.overall}%</div>
                <div class="metric-label">Overall Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.issues.length}</div>
                <div class="metric-label">Total Issues</div>
            </div>
        </div>

        ${this.getScoreSection(report)}
        ${this.getComplianceOverview(report)}
        ${this.getVulnerabilityOverview(report)}
        ${this.getFileTypesChart(report)}
        ${this.getRecommendationsSection(report)}
        ${this.getActionItemsSection(report)}
        ${this.getReportControls(report)}
    </div>
</body>
</html>`;
    }

    private getComplianceReportContent(report: EnhancedComplianceReport): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Analysis Report</title>
    <style>
        ${this.getBaseStyles()}
        .compliance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .compliance-level {
            padding: 20px;
            border-radius: 12px;
            background: var(--vscode-editor-background);
            border: 2px solid var(--vscode-panel-border);
        }
        .compliance-percentage {
            font-size: 2em;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="report-header">
            <h1>✅ Compliance Analysis Report</h1>
            <div class="report-meta">
                <span>Generated: ${report.timestamp.toLocaleString()}</span>
                <span class="score-badge grade-${report.score.grade}">Compliance Grade: ${report.score.grade}</span>
            </div>
        </header>

        <div class="compliance-grid">
            <div class="compliance-level">
                <h3>FedRAMP Low</h3>
                <div class="compliance-percentage">${report.complianceMetrics.fedrampLowCompliance}%</div>
                <p>Controls Covered: ${report.complianceMetrics.controlsCovered}/${report.complianceMetrics.totalControls}</p>
            </div>
            <div class="compliance-level">
                <h3>FedRAMP Moderate</h3>
                <div class="compliance-percentage">${report.complianceMetrics.fedrampModerateCompliance}%</div>
                <p>Enhanced security requirements</p>
            </div>
            <div class="compliance-level">
                <h3>FedRAMP High</h3>
                <div class="compliance-percentage">${report.complianceMetrics.fedrampHighCompliance}%</div>
                <p>Maximum security requirements</p>
            </div>
        </div>

        ${this.getComplianceGapsSection(report)}
        ${this.getControlFamilyBreakdown(report)}
        ${this.getComplianceRecommendations(report)}
        ${this.getReportControls(report)}
    </div>
</body>
</html>`;
    }

    private getVulnerabilityReportContent(report: EnhancedComplianceReport): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vulnerability Assessment Report</title>
    <style>
        ${this.getBaseStyles()}
        .vuln-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .vuln-card {
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .vuln-critical { background-color: #ff4444; color: white; }
        .vuln-high { background-color: #ff8800; color: white; }
        .vuln-medium { background-color: #ffcc00; color: black; }
        .vuln-low { background-color: #44ff44; color: black; }
        .vuln-info { background-color: #4488ff; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <header class="report-header">
            <h1>🔒 Vulnerability Assessment Report</h1>
            <div class="report-meta">
                <span>Risk Score: ${report.vulnerabilityMetrics.riskScore}/100</span>
                <span class="risk-badge risk-${report.score.riskLevel.toLowerCase()}">${report.score.riskLevel} Risk</span>
            </div>
        </header>

        <div class="vuln-summary">
            <div class="vuln-card vuln-critical">
                <div class="metric-value">${report.vulnerabilityMetrics.critical}</div>
                <div class="metric-label">Critical</div>
            </div>
            <div class="vuln-card vuln-high">
                <div class="metric-value">${report.vulnerabilityMetrics.high}</div>
                <div class="metric-label">High</div>
            </div>
            <div class="vuln-card vuln-medium">
                <div class="metric-value">${report.vulnerabilityMetrics.medium}</div>
                <div class="metric-label">Medium</div>
            </div>
            <div class="vuln-card vuln-low">
                <div class="metric-value">${report.vulnerabilityMetrics.low}</div>
                <div class="metric-label">Low</div>
            </div>
            <div class="vuln-card vuln-info">
                <div class="metric-value">${report.vulnerabilityMetrics.info}</div>
                <div class="metric-label">Info</div>
            </div>
        </div>

        ${this.getVulnerabilityDetailsSection(report)}
        ${this.getSecurityRecommendations(report)}
        ${this.getReportControls(report)}
    </div>
</body>
</html>`;
    }

    private getDashboardContent(report: EnhancedComplianceReport): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Compliance Dashboard</title>
    <style>
        ${this.getBaseStyles()}
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .dashboard-widget {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 12px;
            padding: 20px;
        }
        .widget-large { grid-column: span 6; }
        .widget-medium { grid-column: span 4; }
        .widget-small { grid-column: span 3; }
        .widget-full { grid-column: span 12; }
    </style>
</head>
<body>
    <div class="container">
        <header class="report-header">
            <h1>📊 Advanced Compliance Dashboard</h1>
            <div class="report-meta">
                <span>Last Updated: ${report.timestamp.toLocaleString()}</span>
                <button onclick="refreshDashboard()" class="btn btn-primary">🔄 Refresh</button>
            </div>
        </header>

        <div class="dashboard-grid">
            <div class="dashboard-widget widget-medium">
                ${this.getScoreWidget(report)}
            </div>
            <div class="dashboard-widget widget-medium">
                ${this.getComplianceWidget(report)}
            </div>
            <div class="dashboard-widget widget-medium">
                ${this.getVulnerabilityWidget(report)}
            </div>
            <div class="dashboard-widget widget-large">
                ${this.getTrendsWidget(report)}
            </div>
            <div class="dashboard-widget widget-full">
                ${this.getActionItemsWidget(report)}
            </div>
        </div>

        ${this.getDashboardControls(report)}
    </div>

    <script>
        function refreshDashboard() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'refreshData' });
        }
        
        function switchReport(reportType) {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'switchReportType', reportType: reportType });
        }
    </script>
</body>
</html>`;
    }

    // Helper methods for content sections
    private getBaseStyles(): string {
        return `
        :root {
            --primary-color: #007acc;
            --success-color: #4CAF50;
            --warning-color: #ff9800;
            --error-color: #f44336;
            --info-color: #2196F3;
        }
        
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .report-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, #005a9e 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .report-header h1 {
            margin: 0 0 15px 0;
            font-size: 2.5em;
        }
        
        .report-meta {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .score-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .grade-A { background-color: var(--success-color); }
        .grade-B { background-color: #8BC34A; }
        .grade-C { background-color: var(--warning-color); }
        .grade-D { background-color: #FF5722; }
        .grade-F { background-color: var(--error-color); }
        
        .risk-badge {
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 0.8em;
        }
        
        .risk-low { background-color: var(--success-color); }
        .risk-medium { background-color: var(--warning-color); }
        .risk-high { background-color: #FF5722; }
        .risk-critical { background-color: var(--error-color); }
        
        .section {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .section h2 {
            margin-top: 0;
            color: var(--primary-color);
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .metric-label {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: var(--vscode-progressBar-background);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--success-color) 0%, var(--primary-color) 100%);
            transition: width 0.3s ease;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .table th {
            background-color: var(--vscode-list-hoverBackground);
            font-weight: bold;
        }
        `;
    }

    private getScoreSection(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>📊 Compliance Score</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="text-align: center;">
                    <div class="metric-value">${report.score.overall}%</div>
                    <div class="metric-label">Overall Score</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.score.overall}%"></div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div class="metric-value">${report.score.compliance}%</div>
                    <div class="metric-label">Compliance</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.score.compliance}%"></div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div class="metric-value">${report.score.security}%</div>
                    <div class="metric-label">Security</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.score.security}%"></div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div class="metric-value score-badge grade-${report.score.grade}">${report.score.grade}</div>
                    <div class="metric-label">Grade</div>
                    <div class="risk-badge risk-${report.score.riskLevel.toLowerCase()}">${report.score.riskLevel} Risk</div>
                </div>
            </div>
        </section>`;
    }

    // Continue with other helper methods...
    private getComplianceOverview(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>✅ Compliance Overview</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <h4>FedRAMP Low</h4>
                    <div class="metric-value" style="color: var(--success-color);">${report.complianceMetrics.fedrampLowCompliance}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.complianceMetrics.fedrampLowCompliance}%"></div>
                    </div>
                </div>
                <div>
                    <h4>FedRAMP Moderate</h4>
                    <div class="metric-value" style="color: var(--warning-color);">${report.complianceMetrics.fedrampModerateCompliance}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.complianceMetrics.fedrampModerateCompliance}%"></div>
                    </div>
                </div>
                <div>
                    <h4>Controls Covered</h4>
                    <div class="metric-value">${report.complianceMetrics.controlsCovered}/${report.complianceMetrics.totalControls}</div>
                    <div class="metric-label">Implementation Progress</div>
                </div>
            </div>
        </section>`;
    }

    private getVulnerabilityOverview(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>🔒 Vulnerability Overview</h2>
            <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
                <div style="margin: 10px;">
                    <div class="metric-value" style="color: var(--error-color);">${report.vulnerabilityMetrics.critical}</div>
                    <div class="metric-label">Critical</div>
                </div>
                <div style="margin: 10px;">
                    <div class="metric-value" style="color: #ff8800;">${report.vulnerabilityMetrics.high}</div>
                    <div class="metric-label">High</div>
                </div>
                <div style="margin: 10px;">
                    <div class="metric-value" style="color: var(--warning-color);">${report.vulnerabilityMetrics.medium}</div>
                    <div class="metric-label">Medium</div>
                </div>
                <div style="margin: 10px;">
                    <div class="metric-value" style="color: var(--success-color);">${report.vulnerabilityMetrics.low}</div>
                    <div class="metric-label">Low</div>
                </div>
                <div style="margin: 10px;">
                    <div class="metric-value" style="color: var(--info-color);">${report.vulnerabilityMetrics.info}</div>
                    <div class="metric-label">Info</div>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <div class="risk-badge risk-${report.score.riskLevel.toLowerCase()}">Risk Score: ${report.vulnerabilityMetrics.riskScore}/100</div>
            </div>
        </section>`;
    }

    private getFileTypesChart(report: EnhancedComplianceReport): string {
        const fileTypes = Object.entries(report.workspaceMetrics.fileTypes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Top 5 file types

        return `
        <section class="section">
            <h2>📁 File Types Analysis</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                ${fileTypes.map(([type, count]) => `
                    <div style="text-align: center; padding: 10px; background: var(--vscode-list-hoverBackground); border-radius: 6px;">
                        <div class="metric-value" style="font-size: 1.5em;">${count}</div>
                        <div class="metric-label">.${type} files</div>
                    </div>
                `).join('')}
            </div>
        </section>`;
    }

    private getRecommendationsSection(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>💡 Recommendations</h2>
            <ul style="list-style: none; padding: 0;">
                ${report.recommendations.map(rec => `
                    <li style="margin: 10px 0; padding: 15px; background: var(--vscode-list-hoverBackground); border-radius: 6px; border-left: 4px solid var(--primary-color);">
                        ${rec}
                    </li>
                `).join('')}
            </ul>
        </section>`;
    }

    private getActionItemsSection(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>🎯 Action Items</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Description</th>
                        <th>Time</th>
                        <th>Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.actionItems.map(item => `
                        <tr>
                            <td><span class="risk-badge risk-${item.priority.toLowerCase()}">${item.priority}</span></td>
                            <td>${item.description}</td>
                            <td>${item.estimatedTime}</td>
                            <td>${item.impact}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>`;
    }

    private getReportControls(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>📊 Report Actions</h2>
            <div style="text-align: center; margin: 20px 0;">
                <button onclick="switchReport('workspace')" class="btn btn-secondary">🌐 Workspace</button>
                <button onclick="switchReport('compliance')" class="btn btn-secondary">✅ Compliance</button>
                <button onclick="switchReport('vulnerability')" class="btn btn-secondary">🔒 Vulnerability</button>
                <button onclick="switchReport('dashboard')" class="btn btn-secondary">📊 Dashboard</button>
                <button onclick="exportReport('pdf')" class="btn btn-primary">📄 Export PDF</button>
                <button onclick="exportReport('excel')" class="btn btn-primary">📊 Export Excel</button>
            </div>
        </section>

        <script>
            const vscode = acquireVsCodeApi();
            
            function switchReport(reportType) {
                vscode.postMessage({ command: 'switchReportType', reportType: reportType });
            }
            
            function exportReport(format) {
                vscode.postMessage({ command: 'exportReport', format: format });
            }
        </script>`;
    }

    // Additional helper methods for other report types...
    private getComplianceGapsSection(report: EnhancedComplianceReport): string {
        return `
        <section class="section">
            <h2>⚠️ Compliance Gaps</h2>
            ${report.complianceMetrics.complianceGaps.length > 0 ? `
                <ul>
                    ${report.complianceMetrics.complianceGaps.map(gap => `<li style="margin: 8px 0; color: var(--warning-color);">${gap}</li>`).join('')}
                </ul>
            ` : '<p style="color: var(--success-color);">✅ No compliance gaps detected!</p>'}
        </section>`;
    }

    private getControlFamilyBreakdown(report: EnhancedComplianceReport): string {
        const families = Object.entries(report.workspaceMetrics.issuesByFamily)
            .sort(([,a], [,b]) => b - a);

        return `
        <section class="section">
            <h2>📋 Control Family Breakdown</h2>
            <table class="table">
                <thead>
                    <tr><th>Family</th><th>Issues</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${families.map(([family, count]) => `
                        <tr>
                            <td><strong>${family}</strong></td>
                            <td>${count}</td>
                            <td>${count === 0 ? '<span style="color: var(--success-color);">✅ Compliant</span>' : '<span style="color: var(--warning-color);">⚠️ Issues Found</span>'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>`;
    }

    // Placeholder methods for additional content sections
    private getComplianceRecommendations(report: EnhancedComplianceReport): string { return ''; }
    private getVulnerabilityDetailsSection(report: EnhancedComplianceReport): string { return ''; }
    private getSecurityRecommendations(report: EnhancedComplianceReport): string { return ''; }
    private getScoreWidget(report: EnhancedComplianceReport): string { return ''; }
    private getComplianceWidget(report: EnhancedComplianceReport): string { return ''; }
    private getVulnerabilityWidget(report: EnhancedComplianceReport): string { return ''; }
    private getTrendsWidget(report: EnhancedComplianceReport): string { return ''; }
    private getActionItemsWidget(report: EnhancedComplianceReport): string { return ''; }
    private getDashboardControls(report: EnhancedComplianceReport): string { return ''; }

    private generateReportId(): string {
        return 'RPT-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    }

    private async loadReportHistory(): Promise<void> {
        // Load from workspace state or file
    }

    private async saveReportHistory(): Promise<void> {
        // Save to workspace state or file
    }

    private async exportReport(report: EnhancedComplianceReport, format: string): Promise<void> {
        vscode.window.showInformationMessage(`Exporting report in ${format} format...`);
        // Implementation for export functionality
    }

    private async switchReportType(report: EnhancedComplianceReport, reportType: string, panel: vscode.WebviewPanel): Promise<void> {
        const newReport = { ...report, reportType: reportType as EnhancedComplianceReport['reportType'] };
        panel.webview.html = await this.getReportContent(newReport);
    }
}
