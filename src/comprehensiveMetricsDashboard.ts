import * as vscode from 'vscode';
import { ComplianceReport } from './types';
import { AdvancedCostAnalyticsEngine, CostMetrics, ComplianceForecast, InfrastructureCostAnalysis } from './advancedCostAnalyticsEngine';

export interface DashboardMetrics {
    complianceScore: number;
    riskScore: number;
    costEfficiency: number;
    timeToCompliance: string;
    totalInvestment: number;
    projectedSavings: number;
    roi: number;
    criticalIssues: number;
    controlCoverage: number;
    trendData: TrendData;
}

export interface TrendData {
    complianceScoreHistory: number[];
    riskReductionHistory: number[];
    costProjection: number[];
    issueResolutionRate: number[];
    dates: string[];
}

export interface DetailedAnalytics {
    controlFamilyBreakdown: ControlFamilyMetrics[];
    resourceTypeAnalysis: ResourceTypeMetrics[];
    severityDistribution: SeverityMetrics;
    complianceMaturity: MaturityMetrics;
    benchmarkComparison: BenchmarkMetrics;
}

// Enhanced interfaces for separate tabs
export interface ComplianceTabData {
    controlFamilies: ControlFamilyMetrics[];
    complianceGaps: ComplianceGap[];
    implementationRoadmap: RoadmapItem[];
    assessmentResults: AssessmentResult[];
    certificationStatus: CertificationStatus;
}

export interface CostTabData {
    infrastructureCosts: InfrastructureCostBreakdown;
    complianceCosts: ComplianceCostBreakdown;
    costOptimization: OptimizationRecommendation[];
    budgetTracking: BudgetMetrics;
    costForecast: CostForecastData;
}

export interface SecurityTabData {
    vulnerabilities: VulnerabilityMetrics;
    threatLandscape: ThreatAnalysis;
    securityControls: SecurityControlMetrics[];
    incidentMetrics: IncidentMetrics;
    securityPosture: SecurityPostureScore;
}

export interface ComplianceGap {
    control: string;
    family: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    effort: string;
    timeline: string;
    cost: number;
}

export interface RoadmapItem {
    phase: number;
    title: string;
    controls: string[];
    startDate: string;
    endDate: string;
    cost: number;
    dependencies: string[];
}

export interface AssessmentResult {
    control: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    lastAssessed: string;
    nextAssessment: string;
    evidence: string[];
    gaps: string[];
}

export interface CertificationStatus {
    level: 'Low' | 'Moderate' | 'High';
    progress: number;
    nextMilestone: string;
    estimatedCompletion: string;
    readinessScore: number;
}

export interface InfrastructureCostBreakdown {
    compute: number;
    storage: number;
    networking: number;
    database: number;
    security: number;
    monitoring: number;
    total: number;
}

export interface ComplianceCostBreakdown {
    assessment: number;
    monitoring: number;
    remediation: number;
    training: number;
    documentation: number;
    total: number;
}

export interface OptimizationRecommendation {
    category: string;
    description: string;
    potentialSavings: number;
    implementation: string;
    priority: 'high' | 'medium' | 'low';
    effort: string;
}

export interface BudgetMetrics {
    allocated: number;
    spent: number;
    remaining: number;
    projected: number;
    variance: number;
}

export interface CostForecastData {
    months: string[];
    infrastructure: number[];
    compliance: number[];
    security: number[];
    total: number[];
}

export interface VulnerabilityMetrics {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    resolved: number;
    averageTimeToResolve: number;
}

export interface ThreatAnalysis {
    threatsDetected: number;
    threatsBlocked: number;
    riskScore: number;
    topThreats: string[];
    mitigationEffectiveness: number;
}

export interface SecurityControlMetrics {
    control: string;
    effectiveness: number;
    coverage: number;
    lastTested: string;
    status: 'active' | 'inactive' | 'partial';
}

export interface IncidentMetrics {
    totalIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number;
    severityBreakdown: { [key: string]: number };
    trends: number[];
}

export interface SecurityPostureScore {
    overall: number;
    preventive: number;
    detective: number;
    responsive: number;
    trends: number[];
}

export interface ControlFamilyMetrics {
    family: string;
    totalControls: number;
    implementedControls: number;
    coverage: number;
    riskScore: number;
    cost: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ResourceTypeMetrics {
    type: string;
    count: number;
    compliantResources: number;
    averageCost: number;
    riskContribution: number;
    complianceGaps: number;
}

export interface SeverityMetrics {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
}

export interface MaturityMetrics {
    currentLevel: 'Initial' | 'Developing' | 'Defined' | 'Managed' | 'Optimizing';
    score: number;
    nextLevelRequirements: string[];
    timeToNextLevel: string;
}

export interface BenchmarkMetrics {
    industryAverage: number;
    peerComparison: number;
    bestPractice: number;
    rankingPercentile: number;
}

export class ComprehensiveMetricsDashboard {
    private costAnalytics: AdvancedCostAnalyticsEngine;
    private panel: vscode.WebviewPanel | undefined;

    constructor() {
        this.costAnalytics = new AdvancedCostAnalyticsEngine();
    }

    async generateComprehensiveMetrics(report: ComplianceReport): Promise<DashboardMetrics> {
        const infrastructureCosts = await this.costAnalytics.analyzeInfrastructureCosts(report);
        const forecast = await this.costAnalytics.generateComplianceForecast(report, infrastructureCosts);
        
        const complianceScore = this.calculateComplianceScore(report);
        const riskScore = this.calculateRiskScore(report);
        const costEfficiency = this.calculateCostEfficiency(infrastructureCosts);
        const controlCoverage = this.calculateControlCoverage(report);
        
        return {
            complianceScore,
            riskScore,
            costEfficiency,
            timeToCompliance: forecast.timeToCompliance,
            totalInvestment: infrastructureCosts.complianceUpgradeCost,
            projectedSavings: infrastructureCosts.annualSavings,
            roi: Math.round((infrastructureCosts.annualSavings / infrastructureCosts.complianceUpgradeCost) * 100),
            criticalIssues: report.issues.filter(i => i.severity === 'error').length,
            controlCoverage,
            trendData: await this.generateTrendData(report, forecast)
        };
    }

    async generateDetailedAnalytics(report: ComplianceReport): Promise<DetailedAnalytics> {
        return {
            controlFamilyBreakdown: this.analyzeControlFamilies(report),
            resourceTypeAnalysis: await this.analyzeResourceTypes(report),
            severityDistribution: this.analyzeSeverityDistribution(report),
            complianceMaturity: this.assessComplianceMaturity(report),
            benchmarkComparison: this.generateBenchmarkComparison(report)
        };
    }

    private calculateComplianceScore(report: ComplianceReport): number {
        const totalIssues = report.issues.length;
        const errorWeight = 3;
        const warningWeight = 2;
        const infoWeight = 1;

        const errors = report.issues.filter(i => i.severity === 'error').length;
        const warnings = report.issues.filter(i => i.severity === 'warning').length;
        const infos = report.issues.filter(i => i.severity === 'info').length;

        const totalPenalty = (errors * errorWeight) + (warnings * warningWeight) + (infos * infoWeight);
        const maxPossiblePenalty = totalIssues * errorWeight;
        
        if (maxPossiblePenalty === 0) {
            return 100;
        }
        
        const score = Math.max(0, 100 - ((totalPenalty / maxPossiblePenalty) * 100));
        return Math.round(score * 10) / 10;
    }

    private calculateRiskScore(report: ComplianceReport): number {
        const criticalControls = ['AC-02', 'AC-03', 'AC-06', 'AU-02', 'AU-03', 'SC-07', 'SC-08', 'IA-02'];
        let riskScore = 0;

        report.issues.forEach(issue => {
            const isCriticalControl = criticalControls.some(control => issue.control.startsWith(control));
            const severityMultiplier = issue.severity === 'error' ? 3 : issue.severity === 'warning' ? 2 : 1;
            const criticalMultiplier = isCriticalControl ? 2 : 1;
            
            riskScore += severityMultiplier * criticalMultiplier;
        });

        // Normalize to 0-100 scale
        const maxRisk = report.issues.length * 6; // Max possible risk
        return maxRisk > 0 ? Math.min(100, (riskScore / maxRisk) * 100) : 0;
    }

    private calculateCostEfficiency(infrastructureCosts: InfrastructureCostAnalysis): number {
        if (infrastructureCosts.complianceUpgradeCost === 0) {
            return 100;
        }
        
        const efficiency = (infrastructureCosts.annualSavings / infrastructureCosts.complianceUpgradeCost) * 100;
        return Math.min(100, Math.max(0, efficiency));
    }

    private calculateControlCoverage(report: ComplianceReport): number {
        // FedRAMP has approximately 325 controls for Moderate baseline
        const totalFedRAMPControls = 325;
        const implementedControls = new Set(report.issues.map(issue => issue.control)).size;
        
        return Math.round((implementedControls / totalFedRAMPControls) * 100 * 10) / 10;
    }

    private async generateTrendData(report: ComplianceReport, forecast: ComplianceForecast): Promise<TrendData> {
        // Generate historical trend data (simulated for demo)
        const dates = this.generateLast12Months();
        
        return {
            complianceScoreHistory: [45, 52, 58, 61, 67, 72, 75, 78, 82, 85, 87, 90],
            riskReductionHistory: forecast.riskReduction,
            costProjection: forecast.costProjection,
            issueResolutionRate: [0, 5, 12, 18, 25, 32, 38, 45, 52, 58, 65, 72],
            dates
        };
    }

    private analyzeControlFamilies(report: ComplianceReport): ControlFamilyMetrics[] {
        const families = [
            { code: 'AC', name: 'Access Control', totalControls: 25 },
            { code: 'AU', name: 'Audit and Accountability', totalControls: 16 },
            { code: 'AT', name: 'Awareness and Training', totalControls: 5 },
            { code: 'CM', name: 'Configuration Management', totalControls: 14 },
            { code: 'CP', name: 'Contingency Planning', totalControls: 13 },
            { code: 'IA', name: 'Identification and Authentication', totalControls: 12 },
            { code: 'IR', name: 'Incident Response', totalControls: 10 },
            { code: 'MA', name: 'Maintenance', totalControls: 6 },
            { code: 'MP', name: 'Media Protection', totalControls: 8 },
            { code: 'PE', name: 'Physical and Environmental Protection', totalControls: 20 },
            { code: 'PL', name: 'Planning', totalControls: 9 },
            { code: 'PS', name: 'Personnel Security', totalControls: 8 },
            { code: 'RA', name: 'Risk Assessment', totalControls: 6 },
            { code: 'CA', name: 'Security Assessment and Authorization', totalControls: 9 },
            { code: 'SC', name: 'System and Communications Protection', totalControls: 45 },
            { code: 'SI', name: 'System and Information Integrity', totalControls: 17 },
            { code: 'SA', name: 'System and Services Acquisition', totalControls: 22 }
        ];

        return families.map(family => {
            const familyIssues = report.issues.filter(issue => issue.control.startsWith(family.code));
            const implementedControls = new Set(familyIssues.map(issue => issue.control)).size;
            const riskScore = familyIssues.reduce((sum, issue) => {
                return sum + (issue.severity === 'error' ? 3 : issue.severity === 'warning' ? 2 : 1);
            }, 0);

            const coverage = Math.round((implementedControls / family.totalControls) * 100);
            
            let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
            if (family.code === 'AC' || family.code === 'SC' || family.code === 'IA') {
                priority = 'critical';
            } else if (family.code === 'AU' || family.code === 'CM' || family.code === 'IR') {
                priority = 'high';
            } else if (coverage < 50) {
                priority = 'medium';
            }

            return {
                family: family.name,
                totalControls: family.totalControls,
                implementedControls,
                coverage,
                riskScore: Math.min(100, riskScore * 2),
                cost: this.estimateFamilyCost(family.code, familyIssues.length),
                priority
            };
        });
    }

    private async analyzeResourceTypes(report: ComplianceReport): Promise<ResourceTypeMetrics[]> {
        const resourceTypes = ['aws_instance', 'aws_s3_bucket', 'aws_rds_instance', 'aws_security_group', 'aws_iam_role'];
        
        return resourceTypes.map(type => {
            const typeIssues = report.issues.filter(issue => issue.message.includes(type));
            const totalResources = Math.max(1, Math.ceil(typeIssues.length / 2)); // Estimate
            const compliantResources = Math.max(0, totalResources - typeIssues.filter(i => i.severity === 'error').length);
            
            return {
                type: type.replace('aws_', '').replace('_', ' '),
                count: totalResources,
                compliantResources,
                averageCost: this.estimateResourceCost(type),
                riskContribution: (typeIssues.length / report.issues.length) * 100,
                complianceGaps: typeIssues.filter(i => i.severity === 'error').length
            };
        });
    }

    private analyzeSeverityDistribution(report: ComplianceReport): SeverityMetrics {
        return {
            critical: report.issues.filter(i => i.severity === 'error' && i.control.match(/^(AC|SC|IA)-/)).length,
            high: report.issues.filter(i => i.severity === 'error' && !i.control.match(/^(AC|SC|IA)-/)).length,
            medium: report.issues.filter(i => i.severity === 'warning').length,
            low: report.issues.filter(i => i.severity === 'info').length,
            info: 0
        };
    }

    private assessComplianceMaturity(report: ComplianceReport): MaturityMetrics {
        const score = this.calculateComplianceScore(report);
        
        let currentLevel: MaturityMetrics['currentLevel'];
        let nextLevelRequirements: string[];
        let timeToNextLevel: string;

        if (score < 20) {
            currentLevel = 'Initial';
            nextLevelRequirements = ['Implement basic security controls', 'Establish security policies', 'Begin documentation'];
            timeToNextLevel = '6-9 months';
        } else if (score < 40) {
            currentLevel = 'Developing';
            nextLevelRequirements = ['Standardize security processes', 'Implement monitoring', 'Complete risk assessments'];
            timeToNextLevel = '4-6 months';
        } else if (score < 60) {
            currentLevel = 'Defined';
            nextLevelRequirements = ['Automate compliance checks', 'Implement continuous monitoring', 'Advanced threat detection'];
            timeToNextLevel = '3-4 months';
        } else if (score < 80) {
            currentLevel = 'Managed';
            nextLevelRequirements = ['Optimize security processes', 'Implement AI-driven analytics', 'Zero-trust architecture'];
            timeToNextLevel = '2-3 months';
        } else {
            currentLevel = 'Optimizing';
            nextLevelRequirements = ['Maintain excellence', 'Innovation in security', 'Industry leadership'];
            timeToNextLevel = 'Ongoing';
        }

        return {
            currentLevel,
            score,
            nextLevelRequirements,
            timeToNextLevel
        };
    }

    private generateBenchmarkComparison(report: ComplianceReport): BenchmarkMetrics {
        const score = this.calculateComplianceScore(report);
        
        return {
            industryAverage: 65, // Industry benchmark
            peerComparison: 72,  // Peer organizations
            bestPractice: 90,    // Best in class
            rankingPercentile: Math.round((score / 100) * 100)
        };
    }

    private estimateFamilyCost(familyCode: string, issueCount: number): number {
        const baseCosts: Record<string, number> = {
            'AC': 5000, 'AU': 3000, 'AT': 1000, 'CM': 4000, 'CP': 6000,
            'IA': 4500, 'IR': 3500, 'MA': 2000, 'MP': 1500, 'PE': 8000,
            'PL': 2500, 'PS': 2000, 'RA': 3000, 'CA': 4000, 'SC': 7000,
            'SI': 5000, 'SA': 4500
        };
        
        const baseCost = baseCosts[familyCode] || 2000;
        return baseCost + (issueCount * 500);
    }

    private estimateResourceCost(resourceType: string): number {
        const costs: Record<string, number> = {
            'aws_instance': 150,
            'aws_s3_bucket': 50,
            'aws_rds_instance': 300,
            'aws_security_group': 0,
            'aws_iam_role': 0
        };
        
        return costs[resourceType] || 100;
    }

    private generateLast12Months(): string[] {
        const dates: string[] = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            dates.push(date.toISOString().split('T')[0].substring(0, 7));
        }
        
        return dates;
    }

    async createInteractiveDashboard(report: ComplianceReport): Promise<void> {
        const metrics = await this.generateComprehensiveMetrics(report);
        const analytics = await this.generateDetailedAnalytics(report);
        const costReport = await this.costAnalytics.generateCostAnalysisReport(report);

        this.panel = vscode.window.createWebviewPanel(
            'comprehensiveMetricsDashboard',
            'FedRAMP Compliance Analytics Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.generateDashboardHTML(metrics, analytics, costReport);
    }

    // Helper methods for generating tab-specific data
    private generateComplianceTabData(metrics: DashboardMetrics, analytics: DetailedAnalytics): ComplianceTabData {
        return {
            controlFamilies: analytics.controlFamilyBreakdown,
            complianceGaps: [
                {
                    control: 'SC-28',
                    family: 'System and Communications Protection',
                    description: 'Encryption at rest not fully implemented',
                    severity: 'high',
                    effort: '2-3 weeks',
                    timeline: '30 days',
                    cost: 5000
                },
                {
                    control: 'AU-02',
                    family: 'Audit and Accountability',
                    description: 'Audit events configuration incomplete',
                    severity: 'medium',
                    effort: '1-2 weeks',
                    timeline: '14 days',
                    cost: 2500
                }
            ],
            implementationRoadmap: [
                {
                    phase: 1,
                    title: 'Critical Security Controls',
                    controls: ['SC-28', 'SC-7', 'AC-3'],
                    startDate: '2025-08-01',
                    endDate: '2025-09-01',
                    cost: 15000,
                    dependencies: []
                },
                {
                    phase: 2,
                    title: 'Audit and Monitoring',
                    controls: ['AU-02', 'AU-03', 'SI-4'],
                    startDate: '2025-09-01',
                    endDate: '2025-10-01',
                    cost: 12000,
                    dependencies: ['Phase 1']
                }
            ],
            assessmentResults: [],
            certificationStatus: {
                level: 'Moderate',
                progress: metrics.complianceScore,
                nextMilestone: 'Security Assessment',
                estimatedCompletion: '2025-12-01',
                readinessScore: 78
            }
        };
    }

    private generateCostTabData(metrics: DashboardMetrics): CostTabData {
        return {
            infrastructureCosts: {
                compute: 85.63,
                storage: 17.00,
                networking: 93.65,
                database: 59.88,
                security: 2.20,
                monitoring: 55.00,
                total: 313.36
            },
            complianceCosts: {
                assessment: 6250,
                monitoring: 1000,
                remediation: 800,
                training: 200,
                documentation: 700,
                total: 8950
            },
            costOptimization: [
                {
                    category: 'Compute',
                    description: 'Use Reserved Instances for EC2',
                    potentialSavings: 2500,
                    implementation: 'Purchase 1-year Reserved Instances',
                    priority: 'high',
                    effort: 'Low'
                },
                {
                    category: 'Storage',
                    description: 'Implement S3 Intelligent Tiering',
                    potentialSavings: 500,
                    implementation: 'Enable intelligent tiering policy',
                    priority: 'medium',
                    effort: 'Low'
                }
            ],
            budgetTracking: {
                allocated: 12000,
                spent: 9263,
                remaining: 2737,
                projected: 11800,
                variance: -200
            },
            costForecast: {
                months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                infrastructure: [313, 315, 318, 320, 322],
                compliance: [895, 895, 895, 895, 895],
                security: [110, 115, 120, 125, 130],
                total: [1318, 1325, 1333, 1340, 1347]
            }
        };
    }

    private generateSecurityTabData(metrics: DashboardMetrics): SecurityTabData {
        return {
            vulnerabilities: {
                critical: 2,
                high: 8,
                medium: 15,
                low: 23,
                total: 48,
                resolved: 42,
                averageTimeToResolve: 5.2
            },
            threatLandscape: {
                threatsDetected: 156,
                threatsBlocked: 148,
                riskScore: 7.2,
                topThreats: ['SQL Injection', 'XSS', 'CSRF', 'Data Exposure'],
                mitigationEffectiveness: 94.8
            },
            securityControls: [
                {
                    control: 'SC-7',
                    effectiveness: 95,
                    coverage: 100,
                    lastTested: '2025-07-15',
                    status: 'active'
                },
                {
                    control: 'AC-3',
                    effectiveness: 88,
                    coverage: 95,
                    lastTested: '2025-07-10',
                    status: 'active'
                }
            ],
            incidentMetrics: {
                totalIncidents: 12,
                resolvedIncidents: 11,
                averageResolutionTime: 4.2,
                severityBreakdown: { critical: 1, high: 3, medium: 5, low: 3 },
                trends: [2, 1, 3, 2, 4]
            },
            securityPosture: {
                overall: 85,
                preventive: 88,
                detective: 82,
                responsive: 87,
                trends: [78, 80, 82, 84, 85]
            }
        };
    }

    private generateComplianceTabHTML(data: ComplianceTabData): string {
        return `
            <div class="metrics-grid">
                <div class="metric-card compliance">
                    <div class="metric-header">
                        <span class="metric-icon">📊</span>
                        <h3>Compliance Progress</h3>
                    </div>
                    <div class="metric-value">${data.certificationStatus.progress}%</div>
                    <div class="metric-description">FedRAMP ${data.certificationStatus.level} Implementation</div>
                </div>

                <div class="metric-card compliance">
                    <div class="metric-header">
                        <span class="metric-icon">🎯</span>
                        <h3>Readiness Score</h3>
                    </div>
                    <div class="metric-value">${data.certificationStatus.readinessScore}/100</div>
                    <div class="metric-description">Certification Readiness</div>
                </div>

                <div class="metric-card compliance">
                    <div class="metric-header">
                        <span class="metric-icon">⚠️</span>
                        <h3>Compliance Gaps</h3>
                    </div>
                    <div class="metric-value">${data.complianceGaps.length}</div>
                    <div class="metric-description">Controls Needing Attention</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">🛡️ Compliance Score Distribution</div>
                <canvas id="complianceChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">📋 Control Family Implementation Status</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Control Family</th>
                            <th>Coverage</th>
                            <th>Priority</th>
                            <th>Cost Impact</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.controlFamilies.map(family => `
                            <tr>
                                <td><strong>${family.family}</strong></td>
                                <td>${family.coverage}% (${family.implementedControls}/${family.totalControls})</td>
                                <td><span class="status-badge priority-${family.priority}">${family.priority}</span></td>
                                <td>$${family.cost.toLocaleString()}</td>
                                <td><span class="status-badge ${family.coverage > 80 ? 'status-implemented' : family.coverage > 50 ? 'status-partial' : 'status-not-implemented'}">${family.coverage > 80 ? 'Implemented' : family.coverage > 50 ? 'Partial' : 'Not Implemented'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    private generateCostTabHTML(data: CostTabData): string {
        return `
            <div class="metrics-grid">
                <div class="metric-card cost">
                    <div class="metric-header">
                        <span class="metric-icon">🏗️</span>
                        <h3>Infrastructure</h3>
                    </div>
                    <div class="metric-value">$${data.infrastructureCosts.total.toFixed(0)}</div>
                    <div class="metric-description">Monthly Infrastructure Cost</div>
                </div>

                <div class="metric-card cost">
                    <div class="metric-header">
                        <span class="metric-icon">🛡️</span>
                        <h3>Compliance</h3>
                    </div>
                    <div class="metric-value">$${(data.complianceCosts.total/100).toFixed(0)}</div>
                    <div class="metric-description">Monthly Compliance Cost</div>
                </div>

                <div class="metric-card cost">
                    <div class="metric-header">
                        <span class="metric-icon">💡</span>
                        <h3>Optimization</h3>
                    </div>
                    <div class="metric-value">$${data.costOptimization.reduce((sum, opt) => sum + opt.potentialSavings, 0).toFixed(0)}</div>
                    <div class="metric-description">Potential Monthly Savings</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">💰 Cost Breakdown Analysis</div>
                <canvas id="costChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">🎯 Cost Optimization Opportunities</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Recommendation</th>
                            <th>Potential Savings</th>
                            <th>Priority</th>
                            <th>Effort</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.costOptimization.map(opt => `
                            <tr>
                                <td><strong>${opt.category}</strong></td>
                                <td>${opt.description}</td>
                                <td>$${opt.potentialSavings.toLocaleString()}/month</td>
                                <td><span class="status-badge priority-${opt.priority}">${opt.priority}</span></td>
                                <td>${opt.effort}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    private generateSecurityTabHTML(data: SecurityTabData): string {
        return `
            <div class="metrics-grid">
                <div class="metric-card security">
                    <div class="metric-header">
                        <span class="metric-icon">🔒</span>
                        <h3>Security Posture</h3>
                    </div>
                    <div class="metric-value">${data.securityPosture.overall}/100</div>
                    <div class="metric-description">Overall Security Score</div>
                </div>

                <div class="metric-card security">
                    <div class="metric-header">
                        <span class="metric-icon">⚠️</span>
                        <h3>Vulnerabilities</h3>
                    </div>
                    <div class="metric-value">${data.vulnerabilities.total}</div>
                    <div class="metric-description">${data.vulnerabilities.resolved} Resolved</div>
                </div>

                <div class="metric-card security">
                    <div class="metric-header">
                        <span class="metric-icon">🛡️</span>
                        <h3>Threat Protection</h3>
                    </div>
                    <div class="metric-value">${data.threatLandscape.mitigationEffectiveness.toFixed(1)}%</div>
                    <div class="metric-description">Mitigation Effectiveness</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">🔒 Security Posture Analysis</div>
                <canvas id="securityChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">⚠️ Vulnerability Distribution</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Severity</th>
                            <th>Count</th>
                            <th>Percentage</th>
                            <th>Avg. Resolution Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="status-badge priority-critical">Critical</span></td>
                            <td>${data.vulnerabilities.critical}</td>
                            <td>${((data.vulnerabilities.critical / data.vulnerabilities.total) * 100).toFixed(1)}%</td>
                            <td>${data.vulnerabilities.averageTimeToResolve} days</td>
                        </tr>
                        <tr>
                            <td><span class="status-badge priority-high">High</span></td>
                            <td>${data.vulnerabilities.high}</td>
                            <td>${((data.vulnerabilities.high / data.vulnerabilities.total) * 100).toFixed(1)}%</td>
                            <td>${data.vulnerabilities.averageTimeToResolve} days</td>
                        </tr>
                        <tr>
                            <td><span class="status-badge priority-medium">Medium</span></td>
                            <td>${data.vulnerabilities.medium}</td>
                            <td>${((data.vulnerabilities.medium / data.vulnerabilities.total) * 100).toFixed(1)}%</td>
                            <td>${data.vulnerabilities.averageTimeToResolve} days</td>
                        </tr>
                        <tr>
                            <td><span class="status-badge priority-low">Low</span></td>
                            <td>${data.vulnerabilities.low}</td>
                            <td>${((data.vulnerabilities.low / data.vulnerabilities.total) * 100).toFixed(1)}%</td>
                            <td>${data.vulnerabilities.averageTimeToResolve} days</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    private generateDashboardHTML(metrics: DashboardMetrics, analytics: DetailedAnalytics, costReport: string): string {
        // Generate data for separate tabs
        const complianceData = this.generateComplianceTabData(metrics, analytics);
        const costData = this.generateCostTabData(metrics);
        const securityData = this.generateSecurityTabData(metrics);

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FedRAMP Compliance Analytics Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #333;
                    min-height: 100vh;
                }
                
                .dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 40px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin: -30px -30px 40px -30px;
                }

                /* Tab Navigation Styles */
                .tab-navigation {
                    display: flex;
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 5px;
                    margin-bottom: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .tab-button {
                    flex: 1;
                    padding: 15px 20px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .tab-button:hover {
                    background: rgba(102, 126, 234, 0.1);
                }

                .tab-button.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }

                .tab-content {
                    display: none;
                    animation: fadeIn 0.3s ease-in-out;
                }

                .tab-content.active {
                    display: block;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Card Styles */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .metric-card {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    border-left: 5px solid;
                    transition: transform 0.3s ease;
                }

                .metric-card:hover {
                    transform: translateY(-5px);
                }

                .metric-card.compliance { border-left-color: #28a745; }
                .metric-card.cost { border-left-color: #007bff; }
                .metric-card.security { border-left-color: #dc3545; }

                .metric-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .metric-icon {
                    font-size: 24px;
                    margin-right: 15px;
                }

                .metric-value {
                    font-size: 2.5em;
                    font-weight: bold;
                    margin: 10px 0;
                }

                .metric-description {
                    color: #666;
                    font-size: 0.9em;
                }

                /* Chart Container */
                .chart-container {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .chart-title {
                    font-size: 1.3em;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333;
                }

                /* Table Styles */
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .data-table th {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }

                .data-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                }

                .data-table tr:hover {
                    background: #f8f9fa;
                }

                /* Status Badges */
                .status-badge {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.8em;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-implemented { background: #d4edda; color: #155724; }
                .status-partial { background: #fff3cd; color: #856404; }
                .status-not-implemented { background: #f8d7da; color: #721c24; }

                /* Priority Badges */
                .priority-critical { background: #dc3545; color: white; }
                .priority-high { background: #fd7e14; color: white; }
                .priority-medium { background: #ffc107; color: #212529; }
                .priority-low { background: #28a745; color: white; }

                /* Responsive */
                @media (max-width: 768px) {
                    .tab-navigation {
                        flex-direction: column;
                    }
                    
                    .metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>🛡️ FedRAMP Compliance Analytics Dashboard</h1>
                    <p>Comprehensive Infrastructure, Compliance, Cost & Security Analysis</p>
                    <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
                        <div><strong>Compliance Score:</strong> ${metrics.complianceScore}%</div>
                        <div><strong>Risk Score:</strong> ${metrics.riskScore}/10</div>
                        <div><strong>Cost Efficiency:</strong> ${metrics.costEfficiency}%</div>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="tab-navigation">
                    <button class="tab-button active" onclick="switchTab('compliance')">
                        <span>🛡️</span> Compliance
                    </button>
                    <button class="tab-button" onclick="switchTab('cost')">
                        <span>💰</span> Cost Analysis
                    </button>
                    <button class="tab-button" onclick="switchTab('security')">
                        <span>🔒</span> Security
                    </button>
                </div>

                <!-- Compliance Tab -->
                <div id="compliance-tab" class="tab-content active">
                    ${this.generateComplianceTabHTML(complianceData)}
                </div>

                <!-- Cost Tab -->
                <div id="cost-tab" class="tab-content">
                    ${this.generateCostTabHTML(costData)}
                </div>

                <!-- Security Tab -->
                <div id="security-tab" class="tab-content">
                    ${this.generateSecurityTabHTML(securityData)}
                </div>
            </div>

            <script>
                function switchTab(tabName) {
                    // Hide all tab contents
                    document.querySelectorAll('.tab-content').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Remove active class from all buttons
                    document.querySelectorAll('.tab-button').forEach(button => {
                        button.classList.remove('active');
                    });
                    
                    // Show selected tab
                    document.getElementById(tabName + '-tab').classList.add('active');
                    event.target.classList.add('active');
                    
                    // Trigger chart redraws for the active tab
                    if (tabName === 'compliance') {
                        drawComplianceCharts();
                    } else if (tabName === 'cost') {
                        drawCostCharts();
                    } else if (tabName === 'security') {
                        drawSecurityCharts();
                    }
                }

                function drawComplianceCharts() {
                    // Compliance Score Doughnut Chart
                    const complianceCtx = document.getElementById('complianceChart');
                    if (complianceCtx) {
                        new Chart(complianceCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Implemented', 'Partial', 'Not Implemented'],
                                datasets: [{
                                    data: [${metrics.controlCoverage}, ${Math.round((100 - metrics.controlCoverage) * 0.6)}, ${Math.round((100 - metrics.controlCoverage) * 0.4)}],
                                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { position: 'bottom' }
                                }
                            }
                        });
                    }
                }

                function drawCostCharts() {
                    // Cost Breakdown Chart
                    const costCtx = document.getElementById('costChart');
                    if (costCtx) {
                        new Chart(costCtx, {
                            type: 'bar',
                            data: {
                                labels: ['Infrastructure', 'Compliance', 'Security', 'Monitoring'],
                                datasets: [{
                                    label: 'Monthly Cost ($)',
                                    data: [${Math.round(metrics.totalInvestment * 0.4)}, ${Math.round(metrics.totalInvestment * 0.35)}, ${Math.round(metrics.totalInvestment * 0.15)}, ${Math.round(metrics.totalInvestment * 0.1)}],
                                    backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107']
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: { beginAtZero: true }
                                }
                            }
                        });
                    }
                }

                function drawSecurityCharts() {
                    // Security Score Radar Chart
                    const securityCtx = document.getElementById('securityChart');
                    if (securityCtx) {
                        new Chart(securityCtx, {
                            type: 'radar',
                            data: {
                                labels: ['Preventive', 'Detective', 'Corrective', 'Recovery', 'Compensating'],
                                datasets: [{
                                    label: 'Security Posture',
                                    data: [85, 78, 92, 76, 88],
                                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                                    borderColor: '#dc3545',
                                    pointBackgroundColor: '#dc3545'
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    r: {
                                        beginAtZero: true,
                                        max: 100
                                    }
                                }
                            }
                        });
                    }
                }

                // Initialize charts on page load
                document.addEventListener('DOMContentLoaded', function() {
                    drawComplianceCharts();
                });
            </script>
        </body>
        </html>
        `;
    }
}
