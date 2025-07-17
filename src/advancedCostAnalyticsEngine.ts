import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue } from './types';

export interface CostMetrics {
    totalComplianceCost: number;
    remediationCost: number;
    preventionCost: number;
    auditCost: number;
    downgradeRisk: number;
    potentialSavings: number;
    costBreakdown: CostBreakdown;
}

export interface CostBreakdown {
    infrastructure: number;
    personnel: number;
    tools: number;
    certification: number;
    maintenance: number;
    riskMitigation: number;
}

export interface ResourceCostAnalysis {
    resourceType: string;
    resourceName: string;
    monthlyInstanceCost: number;
    complianceUpgradeCost: number;
    securityEnhancementCost: number;
    estimatedSavings: number;
    riskScore: number;
}

export interface ComplianceForecast {
    timeToCompliance: string;
    costProjection: number[];
    riskReduction: number[];
    milestones: ComplianceMilestone[];
    recommendations: ForecastRecommendation[];
}

export interface ComplianceMilestone {
    date: string;
    milestone: string;
    expectedCost: number;
    riskReduction: number;
    controlsCovered: string[];
}

export interface ForecastRecommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    costImpact: number;
    timeframe: string;
    expectedROI: number;
}

export interface InfrastructureCostAnalysis {
    totalResources: number;
    complianceGaps: number;
    estimatedMonthlyCost: number;
    complianceUpgradeCost: number;
    annualSavings: number;
    resourceAnalysis: ResourceCostAnalysis[];
}

export class AdvancedCostAnalyticsEngine {
    private costDatabase: Map<string, any> = new Map();
    private regionCostMultipliers: Map<string, number> = new Map();

    constructor() {
        this.initializeCostDatabase();
        this.initializeRegionMultipliers();
    }

    private initializeCostDatabase(): void {
        // AWS Resource Base Costs (monthly USD)
        this.costDatabase.set('aws_instance', {
            't2.micro': 8.5,
            't2.small': 17.0,
            't2.medium': 34.0,
            't3.medium': 31.68,
            'm5.large': 69.12,
            'c5.xlarge': 122.4
        });

        this.costDatabase.set('aws_s3_bucket', {
            'standard': 0.023, // per GB
            'encryption_upgrade': 0.002, // additional per GB
            'versioning': 0.023, // per GB for versions
            'logging': 0.004 // per 1000 requests
        });

        this.costDatabase.set('aws_rds', {
            'db.t2.micro': 12.41,
            'db.t2.small': 24.82,
            'db.t3.medium': 48.38,
            'encryption_upgrade': 1.2, // multiplier
            'backup_cost': 0.095 // per GB
        });

        this.costDatabase.set('compliance_tools', {
            'security_monitoring': 500, // monthly
            'vulnerability_scanning': 300,
            'audit_logging': 200,
            'encryption_management': 400,
            'access_control': 350
        });

        this.costDatabase.set('personnel_costs', {
            'security_engineer': 12000, // monthly
            'compliance_analyst': 8000,
            'devops_engineer': 10000,
            'audit_consultant': 15000
        });
    }

    private initializeRegionMultipliers(): void {
        this.regionCostMultipliers.set('us-east-1', 1.0);
        this.regionCostMultipliers.set('us-west-2', 1.05);
        this.regionCostMultipliers.set('eu-west-1', 1.15);
        this.regionCostMultipliers.set('ap-southeast-1', 1.20);
        this.regionCostMultipliers.set('ap-northeast-1', 1.25);
    }

    async analyzeInfrastructureCosts(report: ComplianceReport): Promise<InfrastructureCostAnalysis> {
        const resourceAnalysis = await this.analyzeResourceCosts(report);
        const complianceGaps = this.identifyComplianceGaps(report);
        
        const totalMonthlyCost = resourceAnalysis.reduce((sum, resource) => 
            sum + resource.monthlyInstanceCost, 0);
        
        const totalUpgradeCost = resourceAnalysis.reduce((sum, resource) => 
            sum + resource.complianceUpgradeCost, 0);
        
        const annualSavings = this.calculateAnnualSavings(resourceAnalysis, complianceGaps);

        return {
            totalResources: resourceAnalysis.length,
            complianceGaps: complianceGaps.length,
            estimatedMonthlyCost: totalMonthlyCost,
            complianceUpgradeCost: totalUpgradeCost,
            annualSavings: annualSavings,
            resourceAnalysis: resourceAnalysis
        };
    }

    private async analyzeResourceCosts(report: ComplianceReport): Promise<ResourceCostAnalysis[]> {
        const resourceAnalysis: ResourceCostAnalysis[] = [];
        
        // Analyze Terraform/CloudFormation resources from scanned files
        const scannedFiles = Array.isArray(report.scannedFiles) ? report.scannedFiles : [];
        for (const file of scannedFiles) {
            if (file.endsWith('.tf') || file.endsWith('.json') || file.endsWith('.yaml')) {
                const resources = await this.extractResourcesFromFile(file);
                
                for (const resource of resources) {
                    const costAnalysis = this.calculateResourceCost(resource, report.issues);
                    resourceAnalysis.push(costAnalysis);
                }
            }
        }

        return resourceAnalysis;
    }

    private async extractResourcesFromFile(filePath: string): Promise<any[]> {
        // Mock resource extraction - in real implementation, parse IaC files
        return [
            {
                type: 'aws_instance',
                name: 'web_server',
                instanceType: 't3.medium',
                region: 'us-east-1',
                encrypted: false,
                monitoring: false
            },
            {
                type: 'aws_s3_bucket',
                name: 'data_bucket',
                region: 'us-east-1',
                encrypted: false,
                versioning: false,
                logging: false
            },
            {
                type: 'aws_rds_instance',
                name: 'database',
                instanceClass: 'db.t3.medium',
                encrypted: false,
                backupRetention: 7
            }
        ];
    }

    private calculateResourceCost(resource: any, issues: ComplianceIssue[]): ResourceCostAnalysis {
        const baseCost = this.getBaseCost(resource);
        const regionMultiplier = this.regionCostMultipliers.get(resource.region) || 1.0;
        const monthlyInstanceCost = baseCost * regionMultiplier;

        // Calculate compliance upgrade costs
        const complianceUpgradeCost = this.calculateComplianceUpgrades(resource);
        const securityEnhancementCost = this.calculateSecurityEnhancements(resource, issues);
        const estimatedSavings = this.calculatePotentialSavings(resource);
        const riskScore = this.calculateResourceRiskScore(resource, issues);

        return {
            resourceType: resource.type,
            resourceName: resource.name,
            monthlyInstanceCost: Math.round(monthlyInstanceCost * 100) / 100,
            complianceUpgradeCost: Math.round(complianceUpgradeCost * 100) / 100,
            securityEnhancementCost: Math.round(securityEnhancementCost * 100) / 100,
            estimatedSavings: Math.round(estimatedSavings * 100) / 100,
            riskScore: Math.round(riskScore * 10) / 10
        };
    }

    private getBaseCost(resource: any): number {
        const resourceCosts = this.costDatabase.get(resource.type);
        if (!resourceCosts) {
            return 0;
        }

        if (resource.type === 'aws_instance') {
            return resourceCosts[resource.instanceType] || 0;
        } else if (resource.type === 'aws_s3_bucket') {
            return resourceCosts['standard'] * 100; // Assume 100GB
        } else if (resource.type === 'aws_rds_instance') {
            return resourceCosts[resource.instanceClass] || 0;
        }

        return 0;
    }

    private calculateComplianceUpgrades(resource: any): number {
        let upgradeCost = 0;

        if (resource.type === 'aws_instance' && !resource.encrypted) {
            upgradeCost += 10; // EBS encryption cost
        }

        if (resource.type === 'aws_s3_bucket') {
            if (!resource.encrypted) {
                upgradeCost += this.costDatabase.get('aws_s3_bucket')!['encryption_upgrade'] * 100;
            }
            if (!resource.versioning) {
                upgradeCost += this.costDatabase.get('aws_s3_bucket')!['versioning'] * 100;
            }
            if (!resource.logging) {
                upgradeCost += this.costDatabase.get('aws_s3_bucket')!['logging'] * 100;
            }
        }

        if (resource.type === 'aws_rds_instance' && !resource.encrypted) {
            const baseCost = this.costDatabase.get('aws_rds')![resource.instanceClass];
            upgradeCost += baseCost * (this.costDatabase.get('aws_rds')!['encryption_upgrade'] - 1);
        }

        return upgradeCost;
    }

    private calculateSecurityEnhancements(resource: any, issues: ComplianceIssue[]): number {
        let enhancementCost = 0;
        const resourceIssues = issues.filter(issue => 
            issue.message.includes(resource.name) || 
            issue.message.includes(resource.type)
        );

        // Cost for security monitoring tools
        if (resourceIssues.some(issue => issue.control.includes('AU'))) {
            enhancementCost += this.costDatabase.get('compliance_tools')!['security_monitoring'] * 0.1;
        }

        // Cost for vulnerability scanning
        if (resourceIssues.some(issue => issue.severity === 'error')) {
            enhancementCost += this.costDatabase.get('compliance_tools')!['vulnerability_scanning'] * 0.1;
        }

        return enhancementCost;
    }

    private calculatePotentialSavings(resource: any): number {
        let savings = 0;

        // Right-sizing savings
        if (resource.type === 'aws_instance') {
            savings += resource.monthlyInstanceCost * 0.15; // 15% optimization potential
        }

        // Reserved instance savings
        if (resource.type === 'aws_instance' || resource.type === 'aws_rds_instance') {
            savings += resource.monthlyInstanceCost * 0.30; // 30% RI savings
        }

        return savings;
    }

    private calculateResourceRiskScore(resource: any, issues: ComplianceIssue[]): number {
        let riskScore = 0;
        const resourceIssues = issues.filter(issue => 
            issue.message.includes(resource.name) || 
            issue.message.includes(resource.type)
        );

        riskScore += resourceIssues.filter(i => i.severity === 'error').length * 3;
        riskScore += resourceIssues.filter(i => i.severity === 'warning').length * 2;
        riskScore += resourceIssues.filter(i => i.severity === 'info').length * 1;

        // Normalize to 0-10 scale
        return Math.min(10, riskScore);
    }

    private identifyComplianceGaps(report: ComplianceReport): ComplianceIssue[] {
        return report.issues.filter(issue => 
            issue.severity === 'error' && 
            (issue.control.startsWith('AC') || 
             issue.control.startsWith('SC') || 
             issue.control.startsWith('AU'))
        );
    }

    private calculateAnnualSavings(resourceAnalysis: ResourceCostAnalysis[], complianceGaps: ComplianceIssue[]): number {
        const monthlySavings = resourceAnalysis.reduce((sum, resource) => 
            sum + resource.estimatedSavings, 0);
        
        // Additional savings from avoiding compliance penalties
        const penaltyAvoidance = complianceGaps.length * 5000; // $5k per critical gap avoided
        
        return (monthlySavings * 12) + penaltyAvoidance;
    }

    async generateComplianceForecast(report: ComplianceReport, infrastructureCosts: InfrastructureCostAnalysis): Promise<ComplianceForecast> {
        const totalIssues = report.issues.length;
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        
        // Calculate time to compliance based on issue complexity
        const timeToCompliance = this.calculateTimeToCompliance(totalIssues, criticalIssues);
        
        // Generate 12-month cost projection
        const costProjection = this.generateCostProjection(infrastructureCosts, timeToCompliance);
        
        // Generate risk reduction curve
        const riskReduction = this.generateRiskReduction(criticalIssues, timeToCompliance);
        
        // Generate milestones
        const milestones = this.generateComplianceMilestones(report, infrastructureCosts);
        
        // Generate recommendations
        const recommendations = this.generateForecastRecommendations(report, infrastructureCosts);

        return {
            timeToCompliance,
            costProjection,
            riskReduction,
            milestones,
            recommendations
        };
    }

    private calculateTimeToCompliance(totalIssues: number, criticalIssues: number): string {
        // Base time calculation
        let months = Math.ceil(totalIssues * 0.5); // 0.5 months per issue
        months += criticalIssues * 1; // Additional month per critical issue
        
        // Minimum 3 months, maximum 18 months
        months = Math.max(3, Math.min(18, months));
        
        return `${months} months`;
    }

    private generateCostProjection(infrastructureCosts: InfrastructureCostAnalysis, timeToCompliance: string): number[] {
        const months = parseInt(timeToCompliance.split(' ')[0]);
        const projection: number[] = [];
        
        const initialCost = infrastructureCosts.complianceUpgradeCost;
        const monthlyCost = infrastructureCosts.estimatedMonthlyCost * 0.1; // 10% additional for compliance
        
        for (let i = 0; i < 12; i++) {
            if (i === 0) {
                projection.push(initialCost + monthlyCost);
            } else if (i < months) {
                projection.push(monthlyCost * (1 + (months - i) / months * 0.5));
            } else {
                projection.push(monthlyCost * 0.8); // Reduced costs after compliance
            }
        }
        
        return projection.map(cost => Math.round(cost * 100) / 100);
    }

    private generateRiskReduction(criticalIssues: number, timeToCompliance: string): number[] {
        const months = parseInt(timeToCompliance.split(' ')[0]);
        const riskReduction: number[] = [];
        
        const initialRisk = criticalIssues * 10; // Risk score
        
        for (let i = 0; i < 12; i++) {
            if (i < months) {
                const reduction = (i / months) * 85; // 85% risk reduction when compliant
                riskReduction.push(Math.round((initialRisk - reduction) * 10) / 10);
            } else {
                riskReduction.push(Math.round(initialRisk * 0.15 * 10) / 10); // 15% residual risk
            }
        }
        
        return riskReduction;
    }

    private generateComplianceMilestones(report: ComplianceReport, infrastructureCosts: InfrastructureCostAnalysis): ComplianceMilestone[] {
        const criticalControls = ['AC-02', 'SC-07', 'AU-02', 'IA-02', 'CM-02'];
        const milestones: ComplianceMilestone[] = [];
        
        // Month 1: Initial assessment and planning
        milestones.push({
            date: this.addMonths(new Date(), 1).toISOString().split('T')[0],
            milestone: 'Complete Security Assessment & Planning',
            expectedCost: infrastructureCosts.complianceUpgradeCost * 0.2,
            riskReduction: 10,
            controlsCovered: ['RA-03', 'PL-02']
        });

        // Month 3: Critical controls implementation
        milestones.push({
            date: this.addMonths(new Date(), 3).toISOString().split('T')[0],
            milestone: 'Implement Critical Security Controls',
            expectedCost: infrastructureCosts.complianceUpgradeCost * 0.5,
            riskReduction: 40,
            controlsCovered: criticalControls.slice(0, 3)
        });

        // Month 6: Full implementation
        milestones.push({
            date: this.addMonths(new Date(), 6).toISOString().split('T')[0],
            milestone: 'Complete FedRAMP Control Implementation',
            expectedCost: infrastructureCosts.complianceUpgradeCost * 0.8,
            riskReduction: 70,
            controlsCovered: criticalControls
        });

        // Month 9: Testing and documentation
        milestones.push({
            date: this.addMonths(new Date(), 9).toISOString().split('T')[0],
            milestone: 'Security Testing & Documentation Complete',
            expectedCost: infrastructureCosts.complianceUpgradeCost * 0.95,
            riskReduction: 85,
            controlsCovered: ['CA-02', 'SA-11', 'SI-02']
        });

        return milestones;
    }

    private generateForecastRecommendations(report: ComplianceReport, infrastructureCosts: InfrastructureCostAnalysis): ForecastRecommendation[] {
        const recommendations: ForecastRecommendation[] = [];
        
        // High-impact, low-cost recommendations
        if (infrastructureCosts.complianceGaps > 5) {
            recommendations.push({
                priority: 'critical',
                action: 'Implement automated security monitoring and logging',
                costImpact: 500,
                timeframe: '1 month',
                expectedROI: 300
            });
        }

        // Infrastructure optimization
        if (infrastructureCosts.annualSavings > 10000) {
            recommendations.push({
                priority: 'high',
                action: 'Optimize resource utilization and implement reserved instances',
                costImpact: -infrastructureCosts.annualSavings * 0.3,
                timeframe: '2 months',
                expectedROI: 250
            });
        }

        // Encryption upgrades
        const encryptionIssues = report.issues.filter(issue => 
            issue.message.toLowerCase().includes('encrypt')
        );
        if (encryptionIssues.length > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Enable encryption at rest for all data stores',
                costImpact: 200,
                timeframe: '1 month',
                expectedROI: 400
            });
        }

        // Access control improvements
        const accessIssues = report.issues.filter(issue => 
            issue.control.startsWith('AC') || issue.control.startsWith('IA')
        );
        if (accessIssues.length > 3) {
            recommendations.push({
                priority: 'medium',
                action: 'Implement centralized identity and access management',
                costImpact: 1000,
                timeframe: '3 months',
                expectedROI: 200
            });
        }

        return recommendations;
    }

    private addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    async generateCostAnalysisReport(report: ComplianceReport): Promise<string> {
        const infrastructureCosts = await this.analyzeInfrastructureCosts(report);
        const forecast = await this.generateComplianceForecast(report, infrastructureCosts);

        return `
        # 💰 FedRAMP Compliance Cost Analysis Report
        
        ## 📊 Executive Summary
        
        **Total Compliance Investment**: $${infrastructureCosts.complianceUpgradeCost.toLocaleString()}
        **Annual Savings Potential**: $${infrastructureCosts.annualSavings.toLocaleString()}
        **ROI**: ${Math.round((infrastructureCosts.annualSavings / infrastructureCosts.complianceUpgradeCost) * 100)}%
        **Time to Compliance**: ${forecast.timeToCompliance}
        
        ## 🏗️ Infrastructure Analysis
        
        - **Resources Analyzed**: ${infrastructureCosts.totalResources}
        - **Compliance Gaps**: ${infrastructureCosts.complianceGaps}
        - **Current Monthly Cost**: $${infrastructureCosts.estimatedMonthlyCost.toLocaleString()}
        - **Compliance Upgrade Cost**: $${infrastructureCosts.complianceUpgradeCost.toLocaleString()}
        
        ## 📈 Cost Projection (12 months)
        
        ${forecast.costProjection.map((cost, index) => 
            `Month ${index + 1}: $${cost.toLocaleString()}`
        ).join('\n')}
        
        ## 🎯 Key Milestones
        
        ${forecast.milestones.map(milestone => `
        **${milestone.milestone}**
        - Date: ${milestone.date}
        - Cost: $${milestone.expectedCost.toLocaleString()}
        - Risk Reduction: ${milestone.riskReduction}%
        - Controls: ${milestone.controlsCovered.join(', ')}
        `).join('\n')}
        
        ## 🚀 Priority Recommendations
        
        ${forecast.recommendations.map(rec => `
        **${rec.action}** (${rec.priority.toUpperCase()})
        - Cost Impact: ${rec.costImpact < 0 ? 'Savings' : 'Investment'} $${Math.abs(rec.costImpact).toLocaleString()}
        - Timeframe: ${rec.timeframe}
        - Expected ROI: ${rec.expectedROI}%
        `).join('\n')}
        
        ## 📋 Resource-Level Analysis
        
        ${infrastructureCosts.resourceAnalysis.map(resource => `
        **${resource.resourceName}** (${resource.resourceType})
        - Monthly Cost: $${resource.monthlyInstanceCost}
        - Compliance Upgrade: $${resource.complianceUpgradeCost}
        - Potential Savings: $${resource.estimatedSavings}
        - Risk Score: ${resource.riskScore}/10
        `).join('\n')}
        
        ---
        *Report generated on ${new Date().toISOString().split('T')[0]}*
        `;
    }
}
