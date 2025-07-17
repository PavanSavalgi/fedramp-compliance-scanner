#!/usr/bin/env node

/**
 * FedRAMP Compliance Coverage Analysis
 * Comprehensive analysis of current implementation vs FedRAMP Moderate requirements
 */

const fs = require('fs');
const path = require('path');

// Extract all currently implemented controls from the codebase
function extractImplementedControls() {
    const implementedControls = new Set();
    
    // Pattern to match control IDs like AC-01, SC-07, etc.
    const controlPattern = /id:\s*['"]([A-Z]{2}-\d{2})['"]/g;
    
    try {
        // Check globalComplianceControls.ts
        const globalControlsPath = './src/globalComplianceControls.ts';
        if (fs.existsSync(globalControlsPath)) {
            const content = fs.readFileSync(globalControlsPath, 'utf8');
            let match;
            while ((match = controlPattern.exec(content)) !== null) {
                implementedControls.add(match[1].replace('-', '-'));
            }
        }
        
        // Check enhancedFedRAMPControls.ts
        const enhancedControlsPath = './src/enhancedFedRAMPControls.ts';
        if (fs.existsSync(enhancedControlsPath)) {
            const content = fs.readFileSync(enhancedControlsPath, 'utf8');
            const enhancedPattern = /id:\s*['"]([A-Z]{2}-\d+)['"]/g;
            let match;
            while ((match = enhancedPattern.exec(content)) !== null) {
                implementedControls.add(match[1]);
            }
        }
        
        // Check basic controls.ts
        const basicControlsPath = './src/controls.ts';
        if (fs.existsSync(basicControlsPath)) {
            const content = fs.readFileSync(basicControlsPath, 'utf8');
            let match;
            while ((match = controlPattern.exec(content)) !== null) {
                implementedControls.add(match[1]);
            }
        }
        
    } catch (error) {
        console.error('Error reading control files:', error.message);
    }
    
    return Array.from(implementedControls).sort();
}

// FedRAMP Moderate baseline controls (complete list)
const fedRAMPModerateControls = [
    // Access Control (AC) - 24 controls
    'AC-01', 'AC-02', 'AC-03', 'AC-04', 'AC-05', 'AC-06', 'AC-07', 'AC-08', 
    'AC-11', 'AC-12', 'AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-20', 'AC-21', 
    'AC-22', 'AC-23', 'AC-24', 'AC-25',
    
    // Audit and Accountability (AU) - 12 controls
    'AU-01', 'AU-02', 'AU-03', 'AU-04', 'AU-05', 'AU-06', 'AU-07', 'AU-08', 
    'AU-09', 'AU-11', 'AU-12',
    
    // Configuration Management (CM) - 11 controls
    'CM-01', 'CM-02', 'CM-03', 'CM-04', 'CM-05', 'CM-06', 'CM-07', 'CM-08', 
    'CM-09', 'CM-10', 'CM-11',
    
    // Contingency Planning (CP) - 13 controls
    'CP-01', 'CP-02', 'CP-03', 'CP-04', 'CP-06', 'CP-07', 'CP-08', 'CP-09', 
    'CP-10', 'CP-11', 'CP-12', 'CP-13',
    
    // Identification and Authentication (IA) - 12 controls
    'IA-01', 'IA-02', 'IA-03', 'IA-04', 'IA-05', 'IA-06', 'IA-07', 'IA-08', 
    'IA-09', 'IA-10', 'IA-11',
    
    // Incident Response (IR) - 8 controls
    'IR-01', 'IR-02', 'IR-04', 'IR-05', 'IR-06', 'IR-07', 'IR-08',
    
    // Risk Assessment (RA) - 5 controls
    'RA-01', 'RA-02', 'RA-03', 'RA-04', 'RA-05',
    
    // System and Communications Protection (SC) - 28 controls
    'SC-01', 'SC-02', 'SC-04', 'SC-05', 'SC-07', 'SC-08', 'SC-10', 'SC-12', 
    'SC-13', 'SC-15', 'SC-17', 'SC-18', 'SC-19', 'SC-20', 'SC-21', 'SC-22', 
    'SC-23', 'SC-28', 'SC-39',
    
    // System and Information Integrity (SI) - 16 controls
    'SI-01', 'SI-02', 'SI-03', 'SI-04', 'SI-05', 'SI-07', 'SI-08', 'SI-10', 
    'SI-11', 'SI-12', 'SI-16',
    
    // Awareness and Training (AT) - 4 controls
    'AT-01', 'AT-02', 'AT-03', 'AT-04',
    
    // Certification, Accreditation, and Security Assessments (CA) - 7 controls
    'CA-01', 'CA-02', 'CA-03', 'CA-05', 'CA-06', 'CA-07', 'CA-09',
    
    // Maintenance (MA) - 6 controls
    'MA-01', 'MA-02', 'MA-03', 'MA-04', 'MA-05', 'MA-06',
    
    // Media Protection (MP) - 7 controls
    'MP-01', 'MP-02', 'MP-03', 'MP-04', 'MP-05', 'MP-06', 'MP-07',
    
    // Physical and Environmental Protection (PE) - 16 controls
    'PE-01', 'PE-02', 'PE-03', 'PE-04', 'PE-05', 'PE-06', 'PE-08', 'PE-09', 
    'PE-10', 'PE-11', 'PE-12', 'PE-13', 'PE-14', 'PE-15', 'PE-16', 'PE-17',
    
    // Planning (PL) - 4 controls
    'PL-01', 'PL-02', 'PL-04', 'PL-08',
    
    // Personnel Security (PS) - 8 controls
    'PS-01', 'PS-02', 'PS-03', 'PS-04', 'PS-05', 'PS-06', 'PS-07', 'PS-08',
    
    // System and Services Acquisition (SA) - 9 controls
    'SA-01', 'SA-02', 'SA-03', 'SA-04', 'SA-05', 'SA-08', 'SA-09', 'SA-10', 'SA-11'
];

function analyzeCompliance() {
    console.log('🛡️  FEDRAMP MODERATE COMPLIANCE COVERAGE ANALYSIS');
    console.log('='.repeat(70));
    
    const implementedControls = extractImplementedControls();
    const totalRequired = fedRAMPModerateControls.length;
    const totalImplemented = implementedControls.length;
    const coveragePercentage = ((totalImplemented / totalRequired) * 100).toFixed(1);
    
    console.log(`📊 OVERALL COVERAGE:`);
    console.log(`   Total FedRAMP Moderate Controls: ${totalRequired}`);
    console.log(`   Currently Implemented: ${totalImplemented}`);
    console.log(`   Coverage Percentage: ${coveragePercentage}%`);
    console.log('');
    
    // Group controls by family
    const familyStats = {};
    const implementedSet = new Set(implementedControls);
    
    fedRAMPModerateControls.forEach(control => {
        const family = control.split('-')[0];
        if (!familyStats[family]) {
            familyStats[family] = { total: 0, implemented: 0, missing: [] };
        }
        familyStats[family].total++;
        
        if (implementedSet.has(control)) {
            familyStats[family].implemented++;
        } else {
            familyStats[family].missing.push(control);
        }
    });
    
    console.log('📋 FAMILY-BY-FAMILY BREAKDOWN:');
    console.log('-'.repeat(70));
    
    Object.entries(familyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([family, stats]) => {
            const percentage = ((stats.implemented / stats.total) * 100).toFixed(1);
            const status = percentage >= 80 ? '✅' : percentage >= 50 ? '🟡' : '❌';
            
            console.log(`${family}: ${stats.implemented}/${stats.total} (${percentage}%) ${status}`);
            if (stats.missing.length > 0) {
                console.log(`   Missing: ${stats.missing.join(', ')}`);
            }
            console.log('');
        });
    
    // Find missing controls
    const missingControls = fedRAMPModerateControls.filter(
        control => !implementedSet.has(control)
    );
    
    console.log('🎯 PRIORITY IMPLEMENTATION GAPS:');
    console.log('-'.repeat(70));
    
    const criticalFamilies = ['SC', 'SI', 'AC', 'AU'];
    const importantFamilies = ['IR', 'RA', 'CM', 'CP', 'IA'];
    
    const criticalMissing = missingControls.filter(c => 
        criticalFamilies.includes(c.split('-')[0])
    );
    const importantMissing = missingControls.filter(c => 
        importantFamilies.includes(c.split('-')[0])
    );
    const organizationalMissing = missingControls.filter(c => 
        !criticalFamilies.includes(c.split('-')[0]) && 
        !importantFamilies.includes(c.split('-')[0])
    );
    
    if (criticalMissing.length > 0) {
        console.log(`🔴 CRITICAL (${criticalMissing.length} controls):`);
        console.log(`   ${criticalMissing.join(', ')}`);
        console.log('');
    }
    
    if (importantMissing.length > 0) {
        console.log(`🟡 IMPORTANT (${importantMissing.length} controls):`);
        console.log(`   ${importantMissing.join(', ')}`);
        console.log('');
    }
    
    if (organizationalMissing.length > 0) {
        console.log(`🟢 ORGANIZATIONAL (${organizationalMissing.length} controls):`);
        console.log(`   ${organizationalMissing.join(', ')}`);
        console.log('');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    console.log('-'.repeat(70));
    
    if (criticalMissing.length > 0) {
        console.log('1. 🔴 IMMEDIATE PRIORITY: Implement critical missing controls');
        console.log('   Focus on SC and SI families for core security functionality');
    }
    
    if (importantMissing.length > 0) {
        console.log('2. 🟡 NEAR-TERM: Add important controls for comprehensive coverage');
        console.log('   Incident Response and Risk Assessment controls');
    }
    
    if (organizationalMissing.length > 0) {
        console.log('3. 🟢 LONG-TERM: Implement organizational controls');
        console.log('   Policy, training, and physical security controls');
    }
    
    console.log('');
    console.log('🚀 NEXT STEPS TO IMPROVE COVERAGE:');
    const quickWins = ['SC-01', 'SC-02', 'SC-04', 'SC-05', 'SI-01', 'SI-02', 'SI-03', 'SI-05'];
    const implementableQuickWins = quickWins.filter(c => !implementedSet.has(c));
    
    if (implementableQuickWins.length > 0) {
        console.log(`   • Quick wins: ${implementableQuickWins.join(', ')}`);
        console.log(`   • These ${implementableQuickWins.length} controls would improve coverage significantly`);
    }
    
    const targetCoverage = Math.min(80, totalImplemented + 15);
    console.log(`   • Target: Reach ${targetCoverage}% coverage by implementing top priority controls`);
    console.log(`   • Current status: ${coveragePercentage}% - ${coveragePercentage >= 70 ? 'Good progress!' : 'Needs improvement'}`);
}

// Run the analysis
analyzeCompliance();
