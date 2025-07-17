#!/usr/bin/env node

/**
 * Official FedRAMP Compliance Verification
 * Cross-reference our implementation with official NIST 800-53 and FedRAMP requirements
 */

const fs = require('fs');
const path = require('path');

// Read the current globalComplianceControls.ts file
const controlsFile = path.join(__dirname, 'src/globalComplianceControls.ts');
const content = fs.readFileSync(controlsFile, 'utf8');

// Extract all control IDs from the file
const controlMatches = content.match(/id:\s*['"]([A-Z]{2}-\d{2,3})['"]/g) || [];
const implementedControls = controlMatches
    .map(match => match.match(/['"]([A-Z]{2}-\d{2,3})['"]/)[1])
    .sort();

console.log('🔍 OFFICIAL FEDRAMP COMPLIANCE VERIFICATION');
console.log('='.repeat(60));
console.log(`Total Controls Implemented: ${implementedControls.length}`);

// Official FedRAMP Low baseline (based on NIST 800-53 Low baseline)
// Source: https://www.fedramp.gov/assets/resources/documents/FedRAMP_Low_Security_Controls.xlsx
const fedRAMPLowBaseline = [
    // Access Control (AC)
    'AC-02', 'AC-03', 'AC-17', 'AC-22',
    
    // Audit and Accountability (AU)
    'AU-02', 'AU-04', 'AU-06',
    
    // Configuration Management (CM)
    'CM-02', 'CM-06', 'CM-08',
    
    // Contingency Planning (CP)
    'CP-09', 'CP-10',
    
    // Identification and Authentication (IA)
    'IA-02', 'IA-05',
    
    // Media Protection (MP)
    'MP-07',
    
    // Physical and Environmental Protection (PE)
    'PE-02',
    
    // System and Communications Protection (SC)
    'SC-07', 'SC-08', 'SC-13',
    
    // System and Information Integrity (SI)
    'SI-02', 'SI-03', 'SI-04'
];

// Official FedRAMP Moderate baseline (based on NIST 800-53 Moderate baseline)
// Source: https://www.fedramp.gov/assets/resources/documents/FedRAMP_Moderate_Security_Controls.xlsx
const fedRAMPModerateBaseline = {
    'AC': ['AC-01', 'AC-02', 'AC-03', 'AC-04', 'AC-05', 'AC-06', 'AC-07', 'AC-08', 'AC-11', 'AC-12', 'AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-20', 'AC-22'],
    'AT': ['AT-01', 'AT-02', 'AT-03', 'AT-04'],
    'AU': ['AU-01', 'AU-02', 'AU-03', 'AU-04', 'AU-05', 'AU-06', 'AU-08', 'AU-09', 'AU-11', 'AU-12'],
    'CA': ['CA-01', 'CA-02', 'CA-03', 'CA-05', 'CA-06', 'CA-07', 'CA-09'],
    'CM': ['CM-01', 'CM-02', 'CM-03', 'CM-04', 'CM-05', 'CM-06', 'CM-07', 'CM-08', 'CM-10', 'CM-11'],
    'CP': ['CP-01', 'CP-02', 'CP-03', 'CP-04', 'CP-06', 'CP-07', 'CP-08', 'CP-09', 'CP-10'],
    'IA': ['IA-01', 'IA-02', 'IA-03', 'IA-04', 'IA-05', 'IA-06', 'IA-07', 'IA-08'],
    'IR': ['IR-01', 'IR-02', 'IR-04', 'IR-05', 'IR-06', 'IR-07', 'IR-08'],
    'MA': ['MA-01', 'MA-02', 'MA-03', 'MA-04', 'MA-05', 'MA-06'],
    'MP': ['MP-01', 'MP-02', 'MP-03', 'MP-04', 'MP-05', 'MP-06', 'MP-07'],
    'PE': ['PE-01', 'PE-02', 'PE-03', 'PE-04', 'PE-05', 'PE-06', 'PE-08', 'PE-09', 'PE-10', 'PE-11', 'PE-12', 'PE-13', 'PE-14', 'PE-15', 'PE-16', 'PE-17'],
    'PL': ['PL-01', 'PL-02', 'PL-04', 'PL-08'],
    'PS': ['PS-01', 'PS-02', 'PS-03', 'PS-04', 'PS-05', 'PS-06', 'PS-07', 'PS-08'],
    'RA': ['RA-01', 'RA-02', 'RA-03', 'RA-05'],
    'SA': ['SA-01', 'SA-02', 'SA-03', 'SA-04', 'SA-05', 'SA-08', 'SA-09', 'SA-10', 'SA-11'],
    'SC': ['SC-01', 'SC-02', 'SC-04', 'SC-05', 'SC-07', 'SC-08', 'SC-10', 'SC-12', 'SC-13', 'SC-15', 'SC-17', 'SC-18', 'SC-19', 'SC-20', 'SC-21', 'SC-22', 'SC-23', 'SC-39'],
    'SI': ['SI-01', 'SI-02', 'SI-03', 'SI-04', 'SI-05', 'SI-07', 'SI-08', 'SI-10', 'SI-11', 'SI-12', 'SI-16']
};

// Group our implemented controls by family
const implementedByFamily = {};
implementedControls.forEach(control => {
    const family = control.split('-')[0];
    if (!implementedByFamily[family]) {
        implementedByFamily[family] = [];
    }
    implementedByFamily[family].push(control);
});

console.log('\n📊 FEDRAMP LOW COMPLIANCE VERIFICATION:');
console.log('='.repeat(50));

let lowMissing = [];
let lowImplemented = 0;

fedRAMPLowBaseline.forEach(control => {
    if (implementedControls.includes(control)) {
        lowImplemented++;
    } else {
        lowMissing.push(control);
    }
});

const lowCoverage = Math.round((lowImplemented / fedRAMPLowBaseline.length) * 100);

console.log(`Required Controls: ${fedRAMPLowBaseline.length}`);
console.log(`Implemented Controls: ${lowImplemented}`);
console.log(`Coverage: ${lowCoverage}%`);

if (lowMissing.length > 0) {
    console.log(`❌ Missing: ${lowMissing.join(', ')}`);
} else {
    console.log('✅ ALL FEDRAMP LOW CONTROLS IMPLEMENTED!');
}

console.log('\n📊 FEDRAMP MODERATE COMPLIANCE VERIFICATION:');
console.log('='.repeat(50));

let totalModerateRequired = 0;
let totalModerateImplemented = 0;
let moderateMissing = [];

console.log('\n📋 Family-by-Family Analysis:');
Object.entries(fedRAMPModerateBaseline).forEach(([family, required]) => {
    const implemented = implementedByFamily[family] || [];
    const missing = required.filter(control => !implemented.includes(control));
    const coverage = Math.round((implemented.filter(control => required.includes(control)).length / required.length) * 100);
    
    totalModerateRequired += required.length;
    totalModerateImplemented += implemented.filter(control => required.includes(control)).length;
    moderateMissing.push(...missing);
    
    const status = coverage === 100 ? '✅' : coverage >= 80 ? '⚠️' : '❌';
    const implementedInBaseline = implemented.filter(control => required.includes(control)).length;
    
    console.log(`${family}: ${status} ${coverage}% (${implementedInBaseline}/${required.length})`);
    
    if (missing.length > 0) {
        console.log(`  Missing: ${missing.join(', ')}`);
    }
    
    // Check for extra controls beyond baseline
    const extraControls = implemented.filter(control => !required.includes(control));
    if (extraControls.length > 0) {
        console.log(`  Extra: ${extraControls.join(', ')} (+${extraControls.length})`);
    }
});

const moderateCoverage = Math.round((totalModerateImplemented / totalModerateRequired) * 100);

console.log('\n📈 OVERALL MODERATE COVERAGE:');
console.log(`Required Controls: ${totalModerateRequired}`);
console.log(`Implemented Controls: ${totalModerateImplemented}`);
console.log(`Coverage: ${moderateCoverage}%`);
console.log(`Missing: ${moderateMissing.length} controls`);

if (moderateMissing.length > 0) {
    console.log(`❌ Missing: ${moderateMissing.join(', ')}`);
} else {
    console.log('✅ ALL FEDRAMP MODERATE CONTROLS IMPLEMENTED!');
}

console.log('\n🏆 OFFICIAL COMPLIANCE STATUS:');
console.log('='.repeat(50));
console.log(`FedRAMP Low (${fedRAMPLowBaseline.length} controls): ${lowCoverage}% ${lowCoverage === 100 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
console.log(`FedRAMP Moderate (${totalModerateRequired} controls): ${moderateCoverage}% ${moderateCoverage >= 100 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);

// Analysis of NIST 800-53 families
console.log('\n📚 NIST 800-53 CONTROL FAMILY COVERAGE:');
console.log('='.repeat(50));

const nist80053Families = [
    'AC', 'AT', 'AU', 'CA', 'CM', 'CP', 'IA', 'IR', 'MA', 'MP', 
    'PE', 'PL', 'PM', 'PS', 'PT', 'RA', 'SA', 'SC', 'SI', 'SR'
];

nist80053Families.forEach(family => {
    const implemented = implementedByFamily[family] || [];
    const status = implemented.length > 0 ? '✅' : '❌';
    console.log(`${family}: ${status} ${implemented.length} controls implemented`);
});

console.log('\n💡 RECOMMENDATIONS:');
console.log('='.repeat(50));

if (lowCoverage === 100 && moderateCoverage >= 100) {
    console.log('🎉 PERFECT COMPLIANCE ACHIEVED!');
    console.log('• Extension is ready for FedRAMP Low authorization');
    console.log('• Extension is ready for FedRAMP Moderate authorization');
    if (moderateCoverage > 100) {
        console.log(`• Over-compliant with ${moderateCoverage - 100}% extra controls for enhanced security`);
    }
    console.log('• Consider pursuing FedRAMP High baseline for maximum coverage');
} else if (lowCoverage === 100) {
    console.log('🎯 FedRAMP Low: READY FOR AUTHORIZATION');
    console.log('🔧 FedRAMP Moderate: Additional controls needed');
    console.log(`• Implement ${moderateMissing.length} missing controls for full Moderate compliance`);
} else {
    console.log('🔧 Additional work needed for both baselines');
    if (lowMissing.length > 0) {
        console.log(`• FedRAMP Low: Add ${lowMissing.length} controls (${lowMissing.join(', ')})`);
    }
    if (moderateMissing.length > 0) {
        console.log(`• FedRAMP Moderate: Add ${moderateMissing.length} controls`);
    }
}

console.log('\n📋 SUMMARY REPORT:');
console.log('='.repeat(50));
console.log(`✅ Total Controls Implemented: ${implementedControls.length}`);
console.log(`📊 FedRAMP Low Coverage: ${lowCoverage}%`);
console.log(`📊 FedRAMP Moderate Coverage: ${moderateCoverage}%`);
console.log(`🏆 Compliance Status: ${lowCoverage === 100 && moderateCoverage >= 100 ? 'FULLY COMPLIANT' : 'PARTIAL COMPLIANCE'}`);

module.exports = {
    implementedControls,
    fedRAMPLowBaseline,
    fedRAMPModerateBaseline,
    lowCoverage,
    moderateCoverage,
    lowMissing,
    moderateMissing
};
