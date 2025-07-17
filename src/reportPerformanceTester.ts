import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue, FedRAMPLevel } from './types';
import { ReportGenerator } from './reportGenerator';

interface PerformanceMetrics {
    templateGeneration: number;
    memoryUsage: number;
    renderTime: number;
    searchTime: number;
    exportTime: number;
}

export class ReportPerformanceTester {
    private reportGenerator: ReportGenerator;
    
    constructor() {
        this.reportGenerator = new ReportGenerator();
    }

    async runPerformanceTests(): Promise<PerformanceMetrics> {
        console.log('🚀 Starting Report Performance Tests...');
        
        // Generate test data
        const testReport = this.generateTestReport(1000); // 1000 issues for testing
        
        // Test 1: Template Generation Performance
        const templateStart = performance.now();
        await this.reportGenerator.generateReport(testReport);
        const templateTime = performance.now() - templateStart;
        
        // Test 2: Memory Usage
        const memoryBefore = process.memoryUsage().heapUsed;
        await this.reportGenerator.generateReport(testReport);
        const memoryAfter = process.memoryUsage().heapUsed;
        const memoryUsed = (memoryAfter - memoryBefore) / 1024 / 1024; // MB
        
        // Test 3: Render Performance
        const renderStart = performance.now();
        const htmlContent = await this.generateTestHTML(testReport);
        const renderTime = performance.now() - renderStart;
        
        // Test 4: Search Performance (simulated)
        const searchStart = performance.now();
        const searchResults = this.simulateSearch(testReport.issues, 'security');
        const searchTime = performance.now() - searchStart;
        
        // Test 5: Export Performance
        const exportStart = performance.now();
        await this.simulateExport(testReport);
        const exportTime = performance.now() - exportStart;
        
        const metrics: PerformanceMetrics = {
            templateGeneration: templateTime,
            memoryUsage: memoryUsed,
            renderTime: renderTime,
            searchTime: searchTime,
            exportTime: exportTime
        };
        
        this.logPerformanceResults(metrics);
        return metrics;
    }

    private generateTestReport(issueCount: number): ComplianceReport {
        const issues: ComplianceIssue[] = [];
        const controls = ['AC-2', 'AU-3', 'SC-7', 'SI-4', 'IA-2', 'CM-2', 'PE-3', 'PS-3'];
        const severities: ('error' | 'warning' | 'info')[] = ['error', 'warning', 'info'];
        const fileTypes = ['.tf', '.yaml', '.json', '.py', '.js', '.ts'];
        
        for (let i = 0; i < issueCount; i++) {
            const control = controls[i % controls.length];
            const severity = severities[i % severities.length];
            const fileType = fileTypes[i % fileTypes.length];
            
            issues.push({
                control: `${control}-${Math.floor(i / controls.length) + 1}`,
                severity: severity,
                message: `Test compliance issue ${i + 1} for ${control}`,
                file: `test-file-${i}${fileType}`,
                line: Math.floor(Math.random() * 100) + 1,
                column: Math.floor(Math.random() * 50) + 1,
                check: `check-${i}`,
                remediation: `Remediation guidance for ${control} issue ${i + 1}`
            });
        }
        
        return {
            level: FedRAMPLevel.Moderate,
            standards: ['FedRAMP'],
            timestamp: new Date(),
            totalFiles: Math.floor(issueCount / 2),
            scannedFiles: Math.floor(issueCount / 3),
            issues: issues,
            summary: {
                errors: issues.filter(i => i.severity === 'error').length,
                warnings: issues.filter(i => i.severity === 'warning').length,
                info: issues.filter(i => i.severity === 'info').length,
                controlsCovered: new Set(issues.map(i => i.control)).size,
                totalControls: controls.length
            }
        };
    }

    private async generateTestHTML(report: ComplianceReport): Promise<string> {
        // Simulate HTML generation for testing
        return `
        <html>
        <head><title>Test Report</title></head>
        <body>
            <h1>Test Report - ${report.issues.length} issues</h1>
            ${report.issues.slice(0, 50).map(issue => `
                <div class="issue">${issue.control}: ${issue.message}</div>
            `).join('')}
        </body>
        </html>
        `;
    }

    private simulateSearch(issues: ComplianceIssue[], query: string): ComplianceIssue[] {
        const searchTerm = query.toLowerCase();
        return issues.filter(issue =>
            issue.message.toLowerCase().includes(searchTerm) ||
            issue.control.toLowerCase().includes(searchTerm) ||
            issue.file.toLowerCase().includes(searchTerm)
        );
    }

    private async simulateExport(report: ComplianceReport): Promise<void> {
        // Simulate export processing
        const jsonData = JSON.stringify(report, null, 2);
        const markdownData = this.generateMarkdown(report);
        
        // Simulate file operations
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return Promise.resolve();
    }

    private generateMarkdown(report: ComplianceReport): string {
        return `# Compliance Report
        
## Summary
- Total Issues: ${report.issues.length}
- Errors: ${report.summary.errors}
- Warnings: ${report.summary.warnings}
- Information: ${report.summary.info}

## Issues
${report.issues.slice(0, 10).map(issue => `
### ${issue.control}
- **Message**: ${issue.message}
- **File**: ${issue.file}:${issue.line}
- **Severity**: ${issue.severity}
`).join('\n')}
        `;
    }

    private logPerformanceResults(metrics: PerformanceMetrics): void {
        console.log('\n📊 Performance Test Results:');
        console.log('=====================================');
        console.log(`🎨 Template Generation: ${metrics.templateGeneration.toFixed(2)}ms`);
        console.log(`💾 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`);
        console.log(`🖼️  Render Time: ${metrics.renderTime.toFixed(2)}ms`);
        console.log(`🔍 Search Time: ${metrics.searchTime.toFixed(2)}ms`);
        console.log(`📤 Export Time: ${metrics.exportTime.toFixed(2)}ms`);
        console.log('=====================================');
        
        // Performance thresholds (optimization targets)
        const thresholds = {
            templateGeneration: 1000, // 1 second
            memoryUsage: 75, // 75MB
            renderTime: 500, // 500ms
            searchTime: 100, // 100ms
            exportTime: 2000 // 2 seconds
        };
        
        console.log('\n✅ Performance Analysis:');
        console.log('=====================================');
        
        Object.entries(metrics).forEach(([key, value]) => {
            const threshold = thresholds[key as keyof PerformanceMetrics];
            const status = value <= threshold ? '✅ PASS' : '❌ NEEDS OPTIMIZATION';
            const percentage = Math.round((threshold - value) / threshold * 100);
            
            console.log(`${key}: ${status} (${percentage}% under threshold)`);
        });
        
        const overallScore = Object.entries(metrics).reduce((score, [key, value]) => {
            const threshold = thresholds[key as keyof PerformanceMetrics];
            return score + (value <= threshold ? 1 : 0);
        }, 0);
        
        console.log('=====================================');
        console.log(`🏆 Overall Performance Score: ${overallScore}/5 tests passed`);
        
        if (overallScore === 5) {
            console.log('🎉 EXCELLENT: All performance targets met!');
        } else if (overallScore >= 3) {
            console.log('✅ GOOD: Most performance targets met');
        } else {
            console.log('⚠️ NEEDS IMPROVEMENT: Several performance targets missed');
        }
    }

    async runBenchmarkComparison(): Promise<void> {
        console.log('\n🔥 Running Benchmark Comparison...');
        
        const testSizes = [100, 500, 1000, 5000];
        
        for (const size of testSizes) {
            console.log(`\n📊 Testing with ${size} issues:`);
            
            const testReport = this.generateTestReport(size);
            
            const start = performance.now();
            await this.reportGenerator.generateReport(testReport);
            const totalTime = performance.now() - start;
            
            const averageTimePerIssue = totalTime / size;
            
            console.log(`  Total Time: ${totalTime.toFixed(2)}ms`);
            console.log(`  Avg Time/Issue: ${averageTimePerIssue.toFixed(2)}ms`);
            console.log(`  Throughput: ${Math.round(size / (totalTime / 1000))} issues/second`);
            
            // Memory check
            const memoryUsage = process.memoryUsage();
            console.log(`  Memory Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
        }
    }
}

// Performance test command
export async function runReportPerformanceTests(): Promise<void> {
    const tester = new ReportPerformanceTester();
    
    try {
        console.log('🚀 Starting FedRAMP Report Performance Tests...\n');
        
        // Basic performance tests
        await tester.runPerformanceTests();
        
        // Benchmark comparison
        await tester.runBenchmarkComparison();
        
        console.log('\n🎉 Performance testing completed successfully!');
        
        vscode.window.showInformationMessage(
            '📊 Report performance tests completed! Check console for detailed results.'
        );
        
    } catch (error) {
        console.error('❌ Performance testing failed:', error);
        vscode.window.showErrorMessage(`Performance testing failed: ${error}`);
    }
}
