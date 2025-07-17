#!/usr/bin/env node

/**
 * Check FedRAMP Moderate compliance coverage
 * Analyze current controls vs FedRAMP Moderate baseline
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

console.log('🔍 FedRAMP MODERATE COMPLIANCE ANALYSIS');
console.log('='.repeat(50));
console.log(`Total Controls Implemented: ${implementedControls.length}`);

// Group by control family
const byFamily = {};
implementedControls.forEach(control => {
    const family = control.split('-')[0];
    if (!byFamily[family]) {
        byFamily[family] = [];
    }
    byFamily[family].push(control);
});

console.log('\n📊 IMPLEMENTED CONTROLS BY FAMILY:');
Object.entries(byFamily)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([family, controls]) => {
        console.log(`${family}: ${controls.length} controls`);
        console.log(`  ${controls.join(', ')}`);
    });

// FedRAMP Moderate baseline (approximate - core controls)
const moderateBaseline = {
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

console.log('\n🎯 FEDRAMP MODERATE COVERAGE ANALYSIS:');

let totalRequired = 0;
let totalImplemented = 0;
let missingControls = [];

Object.entries(moderateBaseline).forEach(([family, required]) => {
    const implemented = byFamily[family] || [];
    const missing = required.filter(control => !implemented.includes(control));
    const coverage = Math.round((implemented.length / required.length) * 100);
    
    totalRequired += required.length;
    totalImplemented += implemented.filter(control => required.includes(control)).length;
    missingControls.push(...missing);
    
    const status = coverage >= 80 ? '✅' : coverage >= 50 ? '⚠️' : '❌';
    console.log(`${family}: ${status} ${coverage}% (${implemented.filter(control => required.includes(control)).length}/${required.length})`);
    
    if (missing.length > 0) {
        console.log(`  Missing: ${missing.join(', ')}`);
    }
});

const overallCoverage = Math.round((totalImplemented / totalRequired) * 100);

console.log('\n📈 OVERALL MODERATE COVERAGE:');
console.log(`Required Controls: ${totalRequired}`);
console.log(`Implemented Controls: ${totalImplemented}`);
console.log(`Coverage: ${overallCoverage}%`);
console.log(`Missing: ${missingControls.length} controls`);

console.log('\n🚨 TOP MISSING CONTROL FAMILIES:');
const missingByFamily = {};
missingControls.forEach(control => {
    const family = control.split('-')[0];
    if (!missingByFamily[family]) {
        missingByFamily[family] = [];
    }
    missingByFamily[family].push(control);
});

Object.entries(missingByFamily)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 5)
    .forEach(([family, controls]) => {
        console.log(`${family}: ${controls.length} missing (${controls.join(', ')})`);
    });

console.log('\n💡 NEXT STEPS FOR MODERATE COMPLIANCE:');
console.log('1. 🔴 Priority: Implement missing SC and SI controls');
console.log('2. 🟡 Important: Complete IR, RA, and organizational controls');
console.log('3. 🟢 Final: Add remaining AT, CA, MA, MP, PE, PL, PS controls');

console.log(`\n✨ Summary: ${overallCoverage}% FedRAMP Moderate coverage achieved!`);
