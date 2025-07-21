/**
 * Advanced Compliance Analytics
 * FedRAMP Compliance Scanner v2.9.0 - Intelligence & Analytics Platform
 */

import * as vscode from 'vscode';
import {
    CloudComplianceReport, ComplianceIssue, ControlCoverage,
    DriftReport, MonitoringEvent
} from '../types/cloudTypes';

export interface ComplianceTrend {
    date: Date;
    complianceScore: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    newIssues: number;
    resolvedIssues: number;
}

export interface RiskAssessment {
    overallRiskScore: number; // 0-100 (100 = highest risk)
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    topRiskAreas: RiskArea[];
    riskTrends: RiskTrend[];
    mitigationPriorities: MitigationPriority[];
}

export interface RiskArea {
    category: string; // e.g., 'IAM', 'Network', 'Storage', 'Database'
    riskScore: number;
    issueCount: number;
    criticalIssues: number;
    affectedResources: number;
    businessImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    estimatedRemediationTime: number; // hours
}

export interface RiskTrend {
    date: Date;
    riskScore: number;
    category: string;
    changeFromPrevious: number; // +/- percentage
}

export interface MitigationPriority {
    issueId: string;
    priority: number; // 1-10 (1 = highest)
    estimatedImpact: number; // Risk reduction (0-100)
    estimatedEffort: number; // Hours to fix
    roi: number; // Return on investment score
    dependencies: string[]; // Other issues that depend on this fix
}

export interface ComplianceInsight {
    type: 'improvement' | 'degradation' | 'stable' | 'critical_alert';
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
    metrics: {
        before: number;
        after: number;
        change: number;
        changePercentage: number;
    };
    affectedControls: string[];
    confidence: number; // 0-100 (how confident we are in this insight)
}

export interface BenchmarkComparison {
    category: string;
    ourScore: number;
    industryAverage: number;
    bestInClass: number;
    percentile: number; // What percentile we're in (0-100)
    gap: number; // Points to industry average
    recommendations: string[];
}

export interface ComplianceForecast {
    targetDate: Date;
    currentTrajectory: {
        complianceScore: number;
        confidence: number;
    };
    projectedScore: number;
    requiredActions: ForecastAction[];
    milestones: ForecastMilestone[];
    riskFactors: string[];
}

export interface ForecastAction {
    action: string;
    priority: number;
    estimatedImpact: number; // Points improvement
    deadline: Date;
    dependencies: string[];
}

export interface ForecastMilestone {
    date: Date;
    description: string;
    targetScore: number;
    criticalPath: boolean;
}

export class ComplianceAnalytics {
    private historicalData: ComplianceTrend[] = [];
    private insightsCache: Map<string, ComplianceInsight[]> = new Map();
    private benchmarkData: BenchmarkComparison[] = [];

    constructor() {
        // Initialize with sample benchmark data
        this.initializeBenchmarkData();
    }

    /**
     * Analyze compliance report and generate advanced insights
     */
    async analyzeCompliance(
        currentReport: CloudComplianceReport,
        previousReports: CloudComplianceReport[] = []
    ): Promise<{
        riskAssessment: RiskAssessment;
        insights: ComplianceInsight[];
        trends: ComplianceTrend[];
        benchmarks: BenchmarkComparison[];
        forecast: ComplianceForecast;
    }> {
        // Update historical data
        await this.updateHistoricalData(currentReport, previousReports);

        // Generate risk assessment
        const riskAssessment = this.generateRiskAssessment(currentReport);

        // Generate insights
        const insights = await this.generateInsights(currentReport, previousReports);

        // Get trends
        const trends = this.getComplianceTrends();

        // Update benchmarks
        const benchmarks = this.getBenchmarkComparisons(currentReport);

        // Generate forecast
        const forecast = this.generateComplianceForecast(currentReport);

        return {
            riskAssessment,
            insights,
            trends,
            benchmarks,
            forecast
        };
    }

    /**
     * Generate comprehensive risk assessment
     */
    private generateRiskAssessment(report: CloudComplianceReport): RiskAssessment {
        const issues = report.issues;
        
        // Calculate overall risk score
        const riskWeights = {
            'CRITICAL': 25,
            'HIGH': 15,
            'MEDIUM': 8,
            'LOW': 3
        };

        const totalRiskPoints = issues.reduce((total, issue) => {
            return total + (riskWeights[issue.severity] || 0);
        }, 0);

        // Normalize to 0-100 scale (assuming max ~50 critical issues would be 100)
        const overallRiskScore = Math.min(100, Math.round((totalRiskPoints / 1250) * 100));

        const riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 
            overallRiskScore >= 75 ? 'CRITICAL' :
            overallRiskScore >= 50 ? 'HIGH' :
            overallRiskScore >= 25 ? 'MEDIUM' : 'LOW';

        // Analyze risk areas
        const riskAreas = this.analyzeRiskAreas(issues);

        // Generate risk trends
        const riskTrends = this.generateRiskTrends();

        // Generate mitigation priorities
        const mitigationPriorities = this.generateMitigationPriorities(issues);

        return {
            overallRiskScore,
            riskCategory,
            topRiskAreas: riskAreas,
            riskTrends,
            mitigationPriorities
        };
    }

    /**
     * Analyze risk areas by category
     */
    private analyzeRiskAreas(issues: ComplianceIssue[]): RiskArea[] {
        const categories = new Map<string, ComplianceIssue[]>();

        // Group issues by service/category
        issues.forEach(issue => {
            const category = this.categorizeIssue(issue);
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category)!.push(issue);
        });

        const riskAreas: RiskArea[] = [];

        categories.forEach((categoryIssues, category) => {
            const criticalIssues = categoryIssues.filter(i => i.severity === 'CRITICAL').length;
            const highIssues = categoryIssues.filter(i => i.severity === 'HIGH').length;
            
            // Calculate risk score for this category
            const riskScore = Math.min(100, 
                (criticalIssues * 25 + highIssues * 15 + 
                 categoryIssues.filter(i => i.severity === 'MEDIUM').length * 8 +
                 categoryIssues.filter(i => i.severity === 'LOW').length * 3) / 2
            );

            const businessImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 
                criticalIssues > 0 ? 'CRITICAL' :
                highIssues > 2 ? 'HIGH' :
                categoryIssues.length > 5 ? 'MEDIUM' : 'LOW';

            const estimatedRemediationTime = categoryIssues.reduce((total, issue) => {
                return total + this.estimateRemediationTime(issue);
            }, 0);

            riskAreas.push({
                category,
                riskScore,
                issueCount: categoryIssues.length,
                criticalIssues,
                affectedResources: new Set(categoryIssues.map(i => i.resource)).size,
                businessImpact,
                estimatedRemediationTime
            });
        });

        return riskAreas.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
    }

    /**
     * Categorize issue by AWS service or compliance area
     */
    private categorizeIssue(issue: ComplianceIssue): string {
        const resourceType = issue.resourceType;
        
        if (resourceType.startsWith('IAM')) {
            return 'Identity & Access Management';
        }
        if (resourceType.startsWith('EC2') || resourceType.includes('SecurityGroup')) {
            return 'Compute & Networking';
        }
        if (resourceType.startsWith('S3')) {
            return 'Storage & Data';
        }
        if (resourceType.startsWith('RDS')) {
            return 'Databases';
        }
        if (resourceType.startsWith('CloudTrail')) {
            return 'Audit & Monitoring';
        }
        if (resourceType.includes('VPC') || resourceType.includes('Network')) {
            return 'Network Security';
        }
        
        return 'Other';
    }

    /**
     * Estimate remediation time for an issue
     */
    private estimateRemediationTime(issue: ComplianceIssue): number {
        // Estimation based on issue type and severity (in hours)
        const baseTime = {
            'CRITICAL': 8,  // 1 business day
            'HIGH': 4,      // Half day
            'MEDIUM': 2,    // 2 hours
            'LOW': 1        // 1 hour
        };

        const complexityMultiplier = {
            'IAMUser': 1.5,
            'IAMPolicy': 2.0,
            'SecurityGroup': 1.2,
            'S3Bucket': 1.0,
            'RDSInstance': 2.5,
            'CloudTrail': 3.0
        };

        const base = baseTime[issue.severity] || 1;
        const multiplier = complexityMultiplier[issue.resourceType as keyof typeof complexityMultiplier] || 1;
        
        return Math.round(base * multiplier);
    }

    /**
     * Generate mitigation priorities using ROI analysis
     */
    private generateMitigationPriorities(issues: ComplianceIssue[]): MitigationPriority[] {
        const priorities: MitigationPriority[] = [];

        issues.forEach((issue, index) => {
            const estimatedEffort = this.estimateRemediationTime(issue);
            const riskReduction = issue.riskScore;
            const roi = riskReduction / Math.max(1, estimatedEffort); // Risk reduction per hour

            priorities.push({
                issueId: issue.id,
                priority: 0, // Will be calculated after sorting
                estimatedImpact: riskReduction,
                estimatedEffort,
                roi,
                dependencies: this.findDependencies(issue, issues)
            });
        });

        // Sort by ROI and assign priorities
        priorities.sort((a, b) => b.roi - a.roi);
        priorities.forEach((priority, index) => {
            priority.priority = index + 1;
        });

        return priorities.slice(0, 20); // Top 20 priorities
    }

    /**
     * Find dependencies between issues
     */
    private findDependencies(issue: ComplianceIssue, allIssues: ComplianceIssue[]): string[] {
        const dependencies: string[] = [];
        
        // Simple dependency logic - more sophisticated analysis could be added
        if (issue.control === 'AC-2' && issue.resourceType === 'IAMUser') {
            // User issues might depend on policy issues
            const policyIssues = allIssues.filter(i => 
                i.resourceType === 'IAMPolicy' && i.resource.includes(issue.resource)
            );
            dependencies.push(...policyIssues.map(i => i.id));
        }

        if (issue.resourceType === 'SecurityGroup') {
            // Security group issues might depend on VPC issues
            const vpcIssues = allIssues.filter(i => 
                i.resourceType === 'VPC' && issue.resourceArn?.includes(i.resource)
            );
            dependencies.push(...vpcIssues.map(i => i.id));
        }

        return dependencies;
    }

    /**
     * Generate actionable insights from compliance data
     */
    private async generateInsights(
        currentReport: CloudComplianceReport,
        previousReports: CloudComplianceReport[]
    ): Promise<ComplianceInsight[]> {
        const insights: ComplianceInsight[] = [];

        // Compare with previous report if available
        if (previousReports.length > 0) {
            const previousReport = previousReports[previousReports.length - 1];
            
            // Score improvement/degradation insight
            const scoreChange = currentReport.complianceScore - previousReport.complianceScore;
            if (Math.abs(scoreChange) > 5) {
                insights.push({
                    type: scoreChange > 0 ? 'improvement' : 'degradation',
                    title: scoreChange > 0 ? 'Compliance Score Improved' : 'Compliance Score Declined',
                    description: `Your compliance score ${scoreChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreChange)} points`,
                    impact: Math.abs(scoreChange) > 15 ? 'HIGH' : 'MEDIUM',
                    recommendation: scoreChange > 0 ? 
                        'Continue current remediation efforts and maintain momentum' :
                        'Immediate action required to address new compliance issues',
                    metrics: {
                        before: previousReport.complianceScore,
                        after: currentReport.complianceScore,
                        change: scoreChange,
                        changePercentage: Math.round((scoreChange / previousReport.complianceScore) * 100)
                    },
                    affectedControls: [],
                    confidence: 95
                });
            }

            // New critical issues insight
            const newCriticalIssues = currentReport.summary.critical - previousReport.summary.critical;
            if (newCriticalIssues > 0) {
                insights.push({
                    type: 'critical_alert',
                    title: 'New Critical Issues Detected',
                    description: `${newCriticalIssues} new critical compliance issues require immediate attention`,
                    impact: 'CRITICAL',
                    recommendation: 'Address critical issues within 24 hours to maintain compliance posture',
                    metrics: {
                        before: previousReport.summary.critical,
                        after: currentReport.summary.critical,
                        change: newCriticalIssues,
                        changePercentage: previousReport.summary.critical > 0 ? 
                            Math.round((newCriticalIssues / previousReport.summary.critical) * 100) : 100
                    },
                    affectedControls: this.getAffectedControls(currentReport.issues, 'CRITICAL'),
                    confidence: 100
                });
            }
        }

        // Resource growth insight
        if (currentReport.totalResources > 50) {
            const resourceGrowthRisk = Math.round((currentReport.nonCompliantResources / currentReport.totalResources) * 100);
            if (resourceGrowthRisk > 30) {
                insights.push({
                    type: 'degradation',
                    title: 'High Non-Compliance Rate in Large Environment',
                    description: `${resourceGrowthRisk}% of your ${currentReport.totalResources} resources are non-compliant`,
                    impact: 'HIGH',
                    recommendation: 'Consider implementing automated compliance policies and regular monitoring',
                    metrics: {
                        before: 0,
                        after: resourceGrowthRisk,
                        change: resourceGrowthRisk,
                        changePercentage: 100
                    },
                    affectedControls: [],
                    confidence: 85
                });
            }
        }

        // Security control concentration insight
        const controlIssues = new Map<string, number>();
        currentReport.issues.forEach(issue => {
            controlIssues.set(issue.control, (controlIssues.get(issue.control) || 0) + 1);
        });

        const topControl = Array.from(controlIssues.entries())
            .sort(([,a], [,b]) => b - a)[0];

        if (topControl && topControl[1] > 5) {
            insights.push({
                type: 'improvement',
                title: `Focus on ${topControl[0]} Control`,
                description: `${topControl[1]} issues found in ${topControl[0]} control - fixing these will significantly improve compliance`,
                impact: 'MEDIUM',
                recommendation: `Prioritize ${topControl[0]} remediation for maximum compliance improvement`,
                metrics: {
                    before: 0,
                    after: topControl[1],
                    change: topControl[1],
                    changePercentage: 100
                },
                affectedControls: [topControl[0]],
                confidence: 90
            });
        }

        return insights;
    }

    /**
     * Get affected controls for issues of specific severity
     */
    private getAffectedControls(issues: ComplianceIssue[], severity?: string): string[] {
        const controls = new Set<string>();
        
        issues
            .filter(issue => !severity || issue.severity === severity)
            .forEach(issue => controls.add(issue.control));
            
        return Array.from(controls);
    }

    /**
     * Generate compliance forecast
     */
    private generateComplianceForecast(currentReport: CloudComplianceReport): ComplianceForecast {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 3); // 3 months ahead

        // Simple linear projection based on trends
        const trends = this.getComplianceTrends();
        let projectedScore = currentReport.complianceScore;
        let confidence = 50;

        if (trends.length >= 3) {
            const recentTrends = trends.slice(-3);
            const averageChange = recentTrends.reduce((sum, trend, index) => {
                if (index === 0) {
                    return sum;
                }
                return sum + (trend.complianceScore - recentTrends[index - 1].complianceScore);
            }, 0) / (recentTrends.length - 1);

            projectedScore = Math.max(0, Math.min(100, currentReport.complianceScore + (averageChange * 3)));
            confidence = 75;
        }

        const requiredActions: ForecastAction[] = [
            {
                action: 'Fix all critical issues',
                priority: 1,
                estimatedImpact: 20,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                dependencies: []
            },
            {
                action: 'Address high severity issues',
                priority: 2,
                estimatedImpact: 15,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
                dependencies: ['Fix all critical issues']
            },
            {
                action: 'Implement monitoring automation',
                priority: 3,
                estimatedImpact: 10,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
                dependencies: []
            }
        ];

        const milestones: ForecastMilestone[] = [
            {
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                description: '80% compliance target',
                targetScore: 80,
                criticalPath: true
            },
            {
                date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                description: '90% compliance target',
                targetScore: 90,
                criticalPath: true
            },
            {
                date: targetDate,
                description: 'Full compliance target',
                targetScore: 95,
                criticalPath: true
            }
        ];

        return {
            targetDate,
            currentTrajectory: {
                complianceScore: projectedScore,
                confidence
            },
            projectedScore,
            requiredActions,
            milestones,
            riskFactors: [
                'Resource growth without compliance policies',
                'Manual processes prone to configuration drift',
                'Lack of automated monitoring'
            ]
        };
    }

    /**
     * Update historical compliance data
     */
    private async updateHistoricalData(
        currentReport: CloudComplianceReport,
        previousReports: CloudComplianceReport[]
    ): Promise<void> {
        // Convert reports to trend data
        const newTrend: ComplianceTrend = {
            date: currentReport.scanEndTime,
            complianceScore: currentReport.complianceScore,
            totalIssues: currentReport.issues.length,
            criticalIssues: currentReport.summary.critical,
            highIssues: currentReport.summary.high,
            mediumIssues: currentReport.summary.medium,
            lowIssues: currentReport.summary.low,
            newIssues: 0, // Would be calculated by comparing with previous
            resolvedIssues: 0 // Would be calculated by comparing with previous
        };

        // Calculate new/resolved issues if we have previous data
        if (previousReports.length > 0) {
            const previousReport = previousReports[previousReports.length - 1];
            newTrend.newIssues = Math.max(0, currentReport.issues.length - previousReport.issues.length);
            newTrend.resolvedIssues = Math.max(0, previousReport.issues.length - currentReport.issues.length);
        }

        this.historicalData.push(newTrend);

        // Keep only last 30 data points
        if (this.historicalData.length > 30) {
            this.historicalData = this.historicalData.slice(-30);
        }
    }

    /**
     * Get compliance trends
     */
    private getComplianceTrends(): ComplianceTrend[] {
        return [...this.historicalData];
    }

    /**
     * Generate risk trends
     */
    private generateRiskTrends(): RiskTrend[] {
        const trends: RiskTrend[] = [];
        const categories = ['IAM', 'Network', 'Storage', 'Database', 'Audit'];
        
        // Generate sample trend data - in real implementation, this would use historical data
        categories.forEach(category => {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i * 7); // Weekly data points
                
                trends.push({
                    date,
                    riskScore: Math.random() * 40 + 20, // Random scores between 20-60
                    category,
                    changeFromPrevious: (Math.random() - 0.5) * 20 // -10 to +10
                });
            }
        });

        return trends;
    }

    /**
     * Initialize benchmark data
     */
    private initializeBenchmarkData(): void {
        this.benchmarkData = [
            {
                category: 'Overall Compliance',
                ourScore: 0, // Will be updated
                industryAverage: 72,
                bestInClass: 95,
                percentile: 0, // Will be calculated
                gap: 0, // Will be calculated
                recommendations: [
                    'Focus on critical issue remediation',
                    'Implement automated compliance monitoring',
                    'Regular compliance training for team'
                ]
            },
            {
                category: 'Identity & Access Management',
                ourScore: 0,
                industryAverage: 78,
                bestInClass: 92,
                percentile: 0,
                gap: 0,
                recommendations: [
                    'Enforce MFA for all users',
                    'Regular access key rotation',
                    'Implement least privilege policies'
                ]
            },
            {
                category: 'Data Protection',
                ourScore: 0,
                industryAverage: 69,
                bestInClass: 89,
                percentile: 0,
                gap: 0,
                recommendations: [
                    'Enable encryption at rest for all data stores',
                    'Implement data classification policies',
                    'Regular backup testing'
                ]
            },
            {
                category: 'Network Security',
                ourScore: 0,
                industryAverage: 74,
                bestInClass: 91,
                percentile: 0,
                gap: 0,
                recommendations: [
                    'Review and tighten security group rules',
                    'Implement network segmentation',
                    'Enable VPC Flow Logs'
                ]
            }
        ];
    }

    /**
     * Get benchmark comparisons
     */
    private getBenchmarkComparisons(currentReport: CloudComplianceReport): BenchmarkComparison[] {
        const benchmarks = [...this.benchmarkData];
        
        // Update our scores based on current report
        benchmarks[0].ourScore = currentReport.complianceScore;
        
        // Calculate category-specific scores (simplified)
        const iamIssues = currentReport.issues.filter(i => i.control.startsWith('AC-') || i.resourceType.startsWith('IAM')).length;
        const dataIssues = currentReport.issues.filter(i => i.control.includes('SC-13') || i.resourceType.includes('S3') || i.resourceType.includes('RDS')).length;
        const networkIssues = currentReport.issues.filter(i => i.control.includes('SC-7') || i.resourceType.includes('SecurityGroup')).length;

        benchmarks[1].ourScore = Math.max(0, 100 - (iamIssues * 5)); // Simplified calculation
        benchmarks[2].ourScore = Math.max(0, 100 - (dataIssues * 6));
        benchmarks[3].ourScore = Math.max(0, 100 - (networkIssues * 7));

        // Calculate percentiles and gaps
        benchmarks.forEach(benchmark => {
            benchmark.gap = benchmark.industryAverage - benchmark.ourScore;
            
            // Simple percentile calculation
            if (benchmark.ourScore >= benchmark.bestInClass) {
                benchmark.percentile = 95;
            } else if (benchmark.ourScore >= benchmark.industryAverage) {
                benchmark.percentile = 50 + ((benchmark.ourScore - benchmark.industryAverage) / (benchmark.bestInClass - benchmark.industryAverage)) * 45;
            } else {
                benchmark.percentile = (benchmark.ourScore / benchmark.industryAverage) * 50;
            }
            benchmark.percentile = Math.round(benchmark.percentile);
        });

        return benchmarks;
    }

    /**
     * Export analytics data for reporting
     */
    async exportAnalyticsReport(analysisData: any): Promise<string> {
        const report = `
# Advanced Compliance Analytics Report
**Generated**: ${new Date().toISOString()}
**Report Type**: Comprehensive Risk & Compliance Analysis

## 📊 Executive Summary
- **Overall Risk Score**: ${analysisData.riskAssessment.overallRiskScore}/100 (${analysisData.riskAssessment.riskCategory})
- **Compliance Score**: ${analysisData.trends[analysisData.trends.length - 1]?.complianceScore || 'N/A'}
- **Critical Issues**: ${analysisData.trends[analysisData.trends.length - 1]?.criticalIssues || 0}
- **Projected 3-Month Score**: ${analysisData.forecast.projectedScore}

## 🚨 Top Risk Areas
${analysisData.riskAssessment.topRiskAreas.slice(0, 5).map((area: RiskArea) => 
    `- **${area.category}**: ${area.riskScore} risk score (${area.issueCount} issues, ${area.estimatedRemediationTime}h to fix)`
).join('\n')}

## 💡 Key Insights
${analysisData.insights.map((insight: ComplianceInsight) => 
    `### ${insight.title}
- **Impact**: ${insight.impact}
- **Description**: ${insight.description}
- **Recommendation**: ${insight.recommendation}`
).join('\n\n')}

## 📈 Industry Benchmarks
${analysisData.benchmarks.map((benchmark: BenchmarkComparison) => 
    `- **${benchmark.category}**: ${benchmark.ourScore} vs Industry Average ${benchmark.industryAverage} (${benchmark.percentile}th percentile)`
).join('\n')}

## 🎯 Next Actions (Top 5 Priorities)
${analysisData.riskAssessment.mitigationPriorities.slice(0, 5).map((priority: MitigationPriority, index: number) => 
    `${index + 1}. **Priority ${priority.priority}**: ${priority.estimatedImpact} risk reduction (${priority.estimatedEffort}h effort, ROI: ${priority.roi.toFixed(2)})`
).join('\n')}

---
*Report generated by FedRAMP Compliance Scanner v2.9.0 Advanced Analytics*
        `;

        return report;
    }
}
