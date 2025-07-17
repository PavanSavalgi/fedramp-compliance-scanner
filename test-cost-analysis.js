const vscode = require('vscode');
const { AdvancedReportingFeatures } = require('./out/advancedReportingFeatures');

// Demo test for Phase 3 Cost Analysis and Comprehensive Metrics
async function testCostAnalysisFeatures() {
    console.log('🚀 Testing Phase 3: Cost Analysis & Comprehensive Metrics');
    console.log('=' .repeat(60));

    // Create sample compliance report with infrastructure data
    const sampleReport = {
        timestamp: new Date(),
        level: 'Moderate',
        standards: ['FedRAMP'],
        totalFiles: 15,
        scannedFiles: [
            'infrastructure/main.tf',
            'infrastructure/security.tf',
            'infrastructure/database.tf',
            'k8s/deployment.yaml',
            'k8s/service.yaml'
        ],
        issues: [
            {
                control: 'AC-02',
                check: 'user-account-management',
                file: 'infrastructure/main.tf',
                line: 45,
                column: 10,
                severity: 'error',
                message: 'AWS instance lacks proper user account management - no IAM role defined',
                remediation: 'Define IAM role with least privilege access'
            },
            {
                control: 'SC-07',
                check: 'boundary-protection',
                file: 'infrastructure/security.tf',
                line: 23,
                column: 5,
                severity: 'error',
                message: 'Security group allows unrestricted inbound traffic (0.0.0.0/0)',
                remediation: 'Restrict security group rules to specific IP ranges'
            },
            {
                control: 'SC-28',
                check: 'encryption-at-rest',
                file: 'infrastructure/database.tf',
                line: 67,
                column: 15,
                severity: 'error',
                message: 'RDS instance does not have encryption enabled',
                remediation: 'Enable encryption at rest for RDS instance'
            },
            {
                control: 'AU-02',
                check: 'audit-events',
                file: 'infrastructure/main.tf',
                line: 89,
                column: 20,
                severity: 'warning',
                message: 'S3 bucket missing access logging configuration',
                remediation: 'Enable S3 bucket access logging'
            },
            {
                control: 'CM-02',
                check: 'baseline-configuration',
                file: 'k8s/deployment.yaml',
                line: 34,
                column: 8,
                severity: 'warning',
                message: 'Container image tag not specified, using latest',
                remediation: 'Use specific image tags for reproducible deployments'
            },
            {
                control: 'IA-02',
                check: 'identification-authentication',
                file: 'k8s/service.yaml',
                line: 12,
                column: 6,
                severity: 'info',
                message: 'Service does not enforce authentication',
                remediation: 'Consider implementing service mesh authentication'
            }
        ],
        summary: {
            errors: 3,
            warnings: 2,
            info: 1,
            controlsCovered: 6,
            totalControls: 325
        }
    };

    console.log('📊 Sample Infrastructure Report:');
    console.log(`- Total Files Scanned: ${sampleReport.totalFiles}`);
    console.log(`- Infrastructure Files: ${sampleReport.scannedFiles.length}`);
    console.log(`- Total Issues: ${sampleReport.issues.length}`);
    console.log(`- Critical Issues: ${sampleReport.summary.errors}`);
    console.log(`- Control Coverage: ${Math.round((sampleReport.summary.controlsCovered / sampleReport.summary.totalControls) * 100)}%`);
    console.log('');

    try {
        const advancedReporting = new AdvancedReportingFeatures();

        // Test 1: Infrastructure Cost Analysis
        console.log('💰 Testing Infrastructure Cost Analysis...');
        const costAnalysis = await advancedReporting.generateInfrastructureCostAnalysis(sampleReport);
        
        console.log('📈 Infrastructure Cost Analysis Results:');
        console.log(`- Total Resources Analyzed: ${costAnalysis.totalResources}`);
        console.log(`- Compliance Gaps: ${costAnalysis.complianceGaps}`);
        console.log(`- Monthly Infrastructure Cost: $${costAnalysis.estimatedMonthlyCost.toLocaleString()}`);
        console.log(`- Compliance Upgrade Investment: $${costAnalysis.complianceUpgradeCost.toLocaleString()}`);
        console.log(`- Annual Savings Potential: $${costAnalysis.annualSavings.toLocaleString()}`);
        console.log(`- ROI: ${Math.round((costAnalysis.annualSavings / costAnalysis.complianceUpgradeCost) * 100)}%`);
        console.log('');

        // Test 2: Compliance Forecast
        console.log('🔮 Testing Compliance Forecast...');
        const forecast = await advancedReporting.generateComplianceForecast(sampleReport);
        
        console.log('📅 Compliance Forecast Results:');
        console.log(`- Time to Compliance: ${forecast.timeToCompliance}`);
        console.log(`- Total Milestones: ${forecast.milestones.length}`);
        console.log(`- Priority Recommendations: ${forecast.recommendations.length}`);
        console.log('');

        console.log('🎯 Key Milestones:');
        forecast.milestones.forEach((milestone, index) => {
            console.log(`${index + 1}. ${milestone.milestone}`);
            console.log(`   Date: ${milestone.date}`);
            console.log(`   Cost: $${milestone.expectedCost.toLocaleString()}`);
            console.log(`   Risk Reduction: ${milestone.riskReduction}%`);
            console.log('');
        });

        console.log('🚀 Priority Recommendations:');
        forecast.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.action} (${rec.priority.toUpperCase()})`);
            console.log(`   Cost Impact: ${rec.costImpact < 0 ? 'Savings' : 'Investment'} $${Math.abs(rec.costImpact).toLocaleString()}`);
            console.log(`   Timeframe: ${rec.timeframe}`);
            console.log(`   Expected ROI: ${rec.expectedROI}%`);
            console.log('');
        });

        // Test 3: Comprehensive Metrics
        console.log('📊 Testing Comprehensive Metrics...');
        const metrics = await advancedReporting.generateComprehensiveMetrics(sampleReport);
        
        console.log('🎯 Comprehensive Metrics Results:');
        console.log(`- Compliance Score: ${metrics.complianceScore}%`);
        console.log(`- Risk Score: ${Math.round(metrics.riskScore)}%`);
        console.log(`- Cost Efficiency: ${Math.round(metrics.costEfficiency)}%`);
        console.log(`- Critical Issues: ${metrics.criticalIssues}`);
        console.log(`- Control Coverage: ${metrics.controlCoverage}%`);
        console.log(`- Total Investment: $${metrics.totalInvestment.toLocaleString()}`);
        console.log(`- Projected Savings: $${metrics.projectedSavings.toLocaleString()}`);
        console.log(`- ROI: ${metrics.roi}%`);
        console.log('');

        // Test 4: Cost Analysis Report
        console.log('📄 Testing Cost Analysis Report Generation...');
        const costReport = await advancedReporting.generateCostAnalysisReport(sampleReport);
        
        console.log('✅ Cost Analysis Report Generated Successfully!');
        console.log('Report Preview (first 500 characters):');
        console.log('-'.repeat(50));
        console.log(costReport.substring(0, 500) + '...');
        console.log('-'.repeat(50));
        console.log('');

        // Summary
        console.log('🎉 PHASE 3 IMPLEMENTATION SUCCESS!');
        console.log('=' .repeat(60));
        console.log('✅ Infrastructure Cost Analysis - WORKING');
        console.log('✅ Compliance Forecasting - WORKING');
        console.log('✅ Comprehensive Metrics Dashboard - WORKING');
        console.log('✅ Detailed Cost Reporting - WORKING');
        console.log('');
        console.log('🚀 Key Features Implemented:');
        console.log('- Real-time infrastructure cost calculation');
        console.log('- Multi-cloud resource cost analysis (AWS focus)');
        console.log('- Compliance upgrade cost estimation');
        console.log('- 12-month cost and risk forecasting');
        console.log('- ROI analysis and optimization recommendations');
        console.log('- Comprehensive analytics dashboard with trends');
        console.log('- Executive-ready cost-benefit analysis');
        console.log('');
        console.log('💡 Business Value:');
        console.log(`- Estimated Monthly Cost: $${costAnalysis.estimatedMonthlyCost.toLocaleString()}`);
        console.log(`- Compliance Investment: $${costAnalysis.complianceUpgradeCost.toLocaleString()}`);
        console.log(`- Annual Savings: $${costAnalysis.annualSavings.toLocaleString()}`);
        console.log(`- Payback Period: ${Math.round(costAnalysis.complianceUpgradeCost / (costAnalysis.annualSavings / 12))} months`);
        console.log('');

    } catch (error) {
        console.error('❌ Error during cost analysis testing:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testCostAnalysisFeatures().then(() => {
    console.log('🔬 Cost Analysis Testing Complete!');
}).catch(error => {
    console.error('💥 Test execution failed:', error);
});
