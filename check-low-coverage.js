#!/usr/bin/env node

/**
 * Quick check for FedRAMP Low compliance coverage
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

// FedRAMP Low baseline (16 controls)
const lowBaseline = [
    'AC-02', 'AC-03', 'AC-17', 'AC-22',
    'AU-02', 'AU-04', 'AU-06',
    'CM-02', 'CM-06', 'CM-08',
    'CP-09', 'CP-10',
    'IA-02', 'IA-05',
    'MP-07',
    'PE-02',
    'SC-07', 'SC-08', 'SC-13',
    'SI-02', 'SI-03', 'SI-04'
];

console.log('🔍 FedRAMP LOW COMPLIANCE CHECK');
console.log('='.repeat(40));
console.log(`Total Controls Implemented: ${implementedControls.length}`);

let missingLow = [];
let implementedLow = 0;

lowBaseline.forEach(control => {
    if (implementedControls.includes(control)) {
        implementedLow++;
    } else {
        missingLow.push(control);
    }
});

const lowCoverage = Math.round((implementedLow / lowBaseline.length) * 100);

console.log(`\n📈 FedRAMP LOW COVERAGE:`);
console.log(`Required Controls: ${lowBaseline.length}`);
console.log(`Implemented Controls: ${implementedLow}`);
console.log(`Coverage: ${lowCoverage}%`);

if (missingLow.length > 0) {
    console.log(`Missing: ${missingLow.join(', ')}`);
} else {
    console.log('✅ All FedRAMP Low controls implemented!');
}

console.log(`\n🎉 FedRAMP Low: ${lowCoverage}% coverage`);
