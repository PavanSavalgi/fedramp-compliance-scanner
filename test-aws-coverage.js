#!/usr/bin/env node

/**
 * Test script to demonstrate AWS Config Conformance Pack Coverage Analysis
 * Run this to see the coverage analysis output
 */

const { 
    generateCoverageReport, 
    analyzeConformancePackCoverage, 
    COVERAGE_SUMMARY,
    FedRAMPLevel 
} = require('./out/awsConformancePackAnalysis');

console.log('🔍 AWS Config Conformance Pack Coverage Analysis for FedRAMP\n');
console.log('=' .repeat(80));

// Display quick summary
console.log('\n📊 QUICK COVERAGE SUMMARY\n');
Object.values(FedRAMPLevel || { Low: 'Low', Moderate: 'Moderate', High: 'High' }).forEach(level => {
    try {
        const coverage = analyzeConformancePackCoverage(level);
        console.log(`${level.toUpperCase()} Impact Level:`);
        console.log(`  📈 Overall Coverage: ${coverage.coveragePercentage}%`);
        console.log(`  📋 Controls: ${coverage.coveredControls}/${coverage.totalControls}`);
        console.log(`  ⚠️  Critical Gaps: ${coverage.criticalGaps.length}\n`);
    } catch (error) {
        console.log(`Error analyzing ${level} level: ${error.message}\n`);
    }
});

// Display detailed report
console.log('\n📖 DETAILED COVERAGE REPORT\n');
console.log('=' .repeat(80));

try {
    const detailedReport = generateCoverageReport();
    console.log(detailedReport);
} catch (error) {
    console.error('Error generating detailed report:', error.message);
}

console.log('\n✅ Analysis Complete!');
console.log('\nTo view this in VS Code:');
console.log('1. Open the Command Palette (Cmd+Shift+P)');
console.log('2. Search for "FedRAMP: Show AWS Config Conformance Pack Coverage"');
console.log('3. Execute the command to see the interactive report\n');
