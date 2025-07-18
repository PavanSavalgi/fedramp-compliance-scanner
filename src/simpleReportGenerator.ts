import * as vscode from 'vscode';
import { LiveComplianceScanner } from './liveComplianceScanner';

export interface ComplianceSummary {
    totalFiles: number;
    scannedFiles: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    complianceScore: number;
    topIssues: string[];
}

export class SimpleReportGenerator {
    private scanner: LiveComplianceScanner;

    constructor(scanner: LiveComplianceScanner) {
        this.scanner = scanner;
    }

    public async generateReport(): Promise<void> {
        try {
            const summary = await this.collectSummaryData();
            const reportContent = this.generateReportHTML(summary);
            
            // Create webview panel
            const panel = vscode.window.createWebviewPanel(
                'fedRAMPReport',
                'FedRAMP Compliance Report',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = reportContent;

        } catch (error) {
            console.error('Error generating report:', error);
            vscode.window.showErrorMessage('Failed to generate compliance report');
        }
    }

    private async collectSummaryData(): Promise<ComplianceSummary> {
        // Collect all compliance-related files
        const files = await vscode.workspace.findFiles(
            '**/*.{tf,yaml,yml,json,hcl,py,js,ts,md,sh,dockerfile,Dockerfile}',
            '**/node_modules/**'
        );

        let totalIssues = 0;
        let errorCount = 0;
        let warningCount = 0;
        let infoCount = 0;
        const issueTypes = new Map<string, number>();

        // Analyze diagnostics from the scanner
        files.forEach(file => {
            const diagnostics = this.scanner['diagnosticCollection'].get(file);
            if (diagnostics) {
                totalIssues += diagnostics.length;
                
                diagnostics.forEach((diagnostic: vscode.Diagnostic) => {
                    switch (diagnostic.severity) {
                        case vscode.DiagnosticSeverity.Error:
                            errorCount++;
                            break;
                        case vscode.DiagnosticSeverity.Warning:
                            warningCount++;
                            break;
                        case vscode.DiagnosticSeverity.Information:
                            infoCount++;
                            break;
                    }

                    // Track issue types
                    const issueType = String(diagnostic.code) || 'Unknown';
                    issueTypes.set(issueType, (issueTypes.get(issueType) || 0) + 1);
                });
            }
        });

        // Calculate compliance score
        const complianceScore = this.calculateComplianceScore(totalIssues, files.length);

        // Get top issues
        const topIssues = Array.from(issueTypes.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => `${type}: ${count} issues`);

        return {
            totalFiles: files.length,
            scannedFiles: files.length,
            totalIssues,
            errorCount,
            warningCount,
            infoCount,
            complianceScore,
            topIssues
        };
    }

    private calculateComplianceScore(totalIssues: number, totalFiles: number): number {
        if (totalFiles === 0) {
            return 100;
        }
        
        // Simple scoring: start at 100, subtract points for issues
        let score = 100;
        score -= (totalIssues / totalFiles) * 10; // 10 points per issue per file on average
        
        return Math.max(0, Math.round(score));
    }

    private generateReportHTML(summary: ComplianceSummary): string {
        const getScoreColor = (score: number) => {
            if (score >= 90) {
                return '#4CAF50';
            }
            if (score >= 70) {
                return '#FF9800';
            }
            return '#F44336';
        };

        const getScoreGrade = (score: number) => {
            if (score >= 90) {
                return 'A';
            }
            if (score >= 80) {
                return 'B';
            }
            if (score >= 70) {
                return 'C';
            }
            if (score >= 60) {
                return 'D';
            }
            return 'F';
        };

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>FedRAMP Compliance Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
        }
        .score-section {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .score-circle {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            font-weight: bold;
            color: white;
            background: ${getScoreColor(summary.complianceScore)};
            position: relative;
        }
        .score-grade {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.6em;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .error { color: #F44336; }
        .warning { color: #FF9800; }
        .info { color: #2196F3; }
        .success { color: #4CAF50; }
        .issues-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
        }
        .issues-list {
            list-style: none;
            padding: 0;
        }
        .issues-list li {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .recommendations {
            background: #e8f5e8;
            border: 1px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
        }
        .recommendations h3 {
            color: #2e7d32;
            margin-top: 0;
        }
        .recommendations ul {
            list-style-type: none;
            padding: 0;
        }
        .recommendations li {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .recommendations li:before {
            content: "✓ ";
            color: #4CAF50;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ FedRAMP Compliance Report</h1>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
        </div>
        
        <div class="content">
            <div class="score-section">
                <div class="score-circle">
                    ${summary.complianceScore}%
                    <div class="score-grade">${getScoreGrade(summary.complianceScore)}</div>
                </div>
                <h2>Compliance Score</h2>
                <p>${this.getScoreDescription(summary.complianceScore)}</p>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value success">${summary.totalFiles}</div>
                    <div class="metric-label">Files Scanned</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.totalIssues}</div>
                    <div class="metric-label">Total Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value error">${summary.errorCount}</div>
                    <div class="metric-label">Critical Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value warning">${summary.warningCount}</div>
                    <div class="metric-label">Warnings</div>
                </div>
            </div>

            ${summary.topIssues.length > 0 ? `
            <div class="issues-section">
                <h3>🔍 Top Compliance Issues</h3>
                <ul class="issues-list">
                    ${summary.topIssues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="recommendations">
                <h3>📋 Recommendations</h3>
                <ul>
                    ${this.getRecommendations(summary).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    private getScoreDescription(score: number): string {
        if (score >= 90) {
            return 'Excellent compliance posture with minimal issues';
        }
        if (score >= 80) {
            return 'Good compliance with some areas for improvement';
        }
        if (score >= 70) {
            return 'Moderate compliance requiring attention';
        }
        if (score >= 60) {
            return 'Poor compliance with significant issues';
        }
        return 'Critical compliance failures requiring immediate action';
    }

    private getRecommendations(summary: ComplianceSummary): string[] {
        const recommendations: string[] = [];
        
        if (summary.errorCount > 0) {
            recommendations.push('Address critical security violations immediately');
        }
        
        if (summary.warningCount > 10) {
            recommendations.push('Review and remediate warning-level compliance issues');
        }
        
        if (summary.complianceScore < 80) {
            recommendations.push('Implement automated compliance monitoring');
            recommendations.push('Establish security policies and procedures');
        }
        
        recommendations.push('Regular compliance audits and reviews');
        recommendations.push('Staff training on FedRAMP requirements');
        
        return recommendations;
    }
}
