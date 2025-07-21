import { EnhancedReportGenerator } from './enhancedReportGenerator';
import { ComplianceReport, FedRAMPLevel } from './types';

// Test the enhanced report generator with sample data
async function testEnhancedReports() {
    const reportGenerator = new EnhancedReportGenerator();
    
    // Create sample report data
    const sampleReport: ComplianceReport = {
        issues: [
            {
                control: 'AC-01',
                check: 'access-control-policy',
                file: 'test.tf',
                line: 10,
                column: 1,
                severity: 'error',
                message: 'Test error message',
                remediation: 'Fix the access control issue'
            },
            {
                control: 'SC-07',
                check: 'boundary-protection',
                file: 'test.yaml',
                line: 15,
                column: 1,
                severity: 'warning',
                message: 'Test warning message',
                remediation: 'Implement boundary protection'
            }
        ],
        timestamp: new Date(),
        level: FedRAMPLevel.Moderate,
        standards: ['FedRAMP'],
        totalFiles: 100,
        scannedFiles: 95,
        summary: {
            errors: 1,
            warnings: 1,
            info: 0,
            controlsCovered: 159,
            totalControls: 161
        }
    };

    console.log('Testing Enhanced Report Generator...');
    
    try {
        // Test 1: Workspace Report
        console.log('1. Testing Workspace Report...');
        await reportGenerator.generateWorkspaceReport(sampleReport);
        console.log('✅ Workspace Report generated successfully');
        
        // Test 2: Compliance Only Report
        console.log('2. Testing Compliance Only Report...');
        await reportGenerator.generateComplianceOnlyReport(sampleReport);
        console.log('✅ Compliance Only Report generated successfully');
        
        // Test 3: Vulnerability Only Report
        console.log('3. Testing Vulnerability Only Report...');
        await reportGenerator.generateVulnerabilityOnlyReport(sampleReport);
        console.log('✅ Vulnerability Only Report generated successfully');
        
        // Test 4: Advanced Dashboard
        console.log('4. Testing Advanced Dashboard...');
        await reportGenerator.generateAdvancedDashboard(sampleReport);
        console.log('✅ Advanced Dashboard generated successfully');
        
        console.log('\n🎉 All enhanced reports tested successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testEnhancedReports();
