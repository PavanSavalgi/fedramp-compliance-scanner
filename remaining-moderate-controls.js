#!/usr/bin/env node

/**
 * Add remaining FedRAMP Moderate controls - focusing on critical SC and SI families
 * This will complete the technical security controls for FedRAMP Moderate
 */

const additionalControls = [
    // System and Communications Protection (SC) - Critical Missing
    'SC-1', 'SC-2', 'SC-4', 'SC-5', 'SC-10', 'SC-12', 'SC-13', 'SC-15', 'SC-17', 'SC-18', 'SC-19', 'SC-20', 'SC-21', 'SC-22', 'SC-23', 'SC-39',
    
    // System and Information Integrity (SI) - Critical Missing  
    'SI-1', 'SI-2', 'SI-3', 'SI-5', 'SI-7', 'SI-8', 'SI-10', 'SI-11', 'SI-12', 'SI-16',
    
    // Incident Response (IR) - Missing
    'IR-2', 'IR-5', 'IR-7', 'IR-8',
    
    // Risk Assessment (RA) - Missing
    'RA-2',
    
    // Awareness and Training (AT) - All Missing
    'AT-1', 'AT-2', 'AT-3', 'AT-4',
    
    // Certification, Accreditation, and Security Assessments (CA) - All Missing
    'CA-1', 'CA-2', 'CA-3', 'CA-5', 'CA-6', 'CA-7', 'CA-9',
    
    // Maintenance (MA) - Missing
    'MA-1', 'MA-2', 'MA-3', 'MA-4', 'MA-5', 'MA-6',
    
    // Media Protection (MP) - Missing  
    'MP-1', 'MP-2', 'MP-3', 'MP-4', 'MP-5', 'MP-6', 'MP-7',
    
    // Physical and Environmental Protection (PE) - Missing
    'PE-1', 'PE-2', 'PE-3', 'PE-4', 'PE-5', 'PE-6', 'PE-8', 'PE-9', 'PE-10', 'PE-11', 'PE-12', 'PE-13', 'PE-14', 'PE-15', 'PE-16', 'PE-17',
    
    // Planning (PL) - Missing
    'PL-1', 'PL-2', 'PL-4', 'PL-8',
    
    // Personnel Security (PS) - Missing
    'PS-1', 'PS-2', 'PS-3', 'PS-4', 'PS-5', 'PS-6', 'PS-7', 'PS-8',
    
    // System and Services Acquisition (SA) - Missing
    'SA-1', 'SA-2', 'SA-3', 'SA-4', 'SA-5', 'SA-8', 'SA-9', 'SA-10', 'SA-11'
];

console.log('🎯 REMAINING FEDRAMP MODERATE CONTROLS TO IMPLEMENT');
console.log('='.repeat(60));
console.log(`Total Additional Controls Needed: ${additionalControls.length}`);

// Group by family
const byFamily = {};
additionalControls.forEach(control => {
    const family = control.split('-')[0];
    if (!byFamily[family]) {
        byFamily[family] = [];
    }
    byFamily[family].push(control);
});

console.log('\n📊 CONTROLS BY FAMILY:');
Object.entries(byFamily).forEach(([family, controls]) => {
    const priority = ['SC', 'SI', 'AC', 'AU'].includes(family) ? '🔴 HIGH' : 
                    ['IR', 'RA', 'CM', 'CP', 'IA'].includes(family) ? '🟡 MED' : '🟢 LOW';
    console.log(`${family}: ${controls.length} controls ${priority}`);
    console.log(`  ${controls.join(', ')}\n`);
});

console.log('🚀 IMPLEMENTATION PRIORITY:');
console.log('1. 🔴 CRITICAL: SC, SI families (core security)');
console.log('2. 🟡 IMPORTANT: IR, RA remaining controls');  
console.log('3. 🟢 ORGANIZATIONAL: AT, CA, MA, MP, PE, PL, PS, SA');

console.log('\n💡 QUICK WINS FOR MODERATE COVERAGE:');
console.log('• Add SC-1, SC-2, SC-4, SC-5, SC-12, SC-13 (system protection basics)');
console.log('• Add SI-1, SI-2, SI-3, SI-5 (integrity fundamentals)');
console.log('• Add IR-2, IR-5, IR-7, IR-8 (incident response core)');
console.log('• These 14 controls would bring Moderate to ~50% coverage');

module.exports = { additionalControls, byFamily };
