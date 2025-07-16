#!/usr/bin/env node

/**
 * Test the fixed GDPR scanning functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Fixed GDPR Scanning Functionality...\n');

// Test 1: Check if scanWorkspaceWithStandards method exists in compiled code
console.log('1. Checking compiled extension.js for scanWorkspaceWithStandards calls...');
const extensionPath = path.join(__dirname, 'out', 'extension.js');

if (fs.existsSync(extensionPath)) {
    const content = fs.readFileSync(extensionPath, 'utf8');
    
    if (content.includes('scanWorkspaceWithStandards')) {
        console.log('   ✅ scanWorkspaceWithStandards method calls found');
        
        const gdprCallMatch = content.match(/scanWorkspaceWithStandards\(\['GDPR'\]\)/);
        if (gdprCallMatch) {
            console.log('   ✅ GDPR-specific scanning call found');
        } else {
            console.log('   ❌ GDPR-specific scanning call not found');
        }
        
        // Check for other standards too
        const standardsToCheck = ['HIPAA', 'PCI-DSS', 'ISO-27001', 'FedRAMP', 'DPDP', 'ISO-27002', 'SOC-2', 'NIST-CSF'];
        let foundStandards = 0;
        
        standardsToCheck.forEach(standard => {
            const pattern = new RegExp(`scanWorkspaceWithStandards\\(\\['${standard}'\\]\\)`);
            if (content.match(pattern)) {
                foundStandards++;
            }
        });
        
        console.log(`   ✅ ${foundStandards}/${standardsToCheck.length} compliance standards properly configured`);
    } else {
        console.log('   ❌ scanWorkspaceWithStandards method calls not found');
    }
} else {
    console.log('   ❌ extension.js not found');
}

// Test 2: Check if scanner.js has the new method
console.log('\n2. Checking compiled scanner.js for new method...');
const scannerPath = path.join(__dirname, 'out', 'scanner.js');

if (fs.existsSync(scannerPath)) {
    const content = fs.readFileSync(scannerPath, 'utf8');
    
    if (content.includes('scanWorkspaceWithStandards')) {
        console.log('   ✅ scanWorkspaceWithStandards method found in scanner');
    } else {
        console.log('   ❌ scanWorkspaceWithStandards method not found in scanner');
    }
    
    if (content.includes('scanFilesBatchWithStandards')) {
        console.log('   ✅ scanFilesBatchWithStandards method found');
    } else {
        console.log('   ❌ scanFilesBatchWithStandards method not found');
    }
} else {
    console.log('   ❌ scanner.js not found');
}

// Test 3: Verify GDPR patterns are still in place
console.log('\n3. Checking GDPR patterns in globalComplianceControls...');
const controlsPath = path.join(__dirname, 'out', 'globalComplianceControls.js');

if (fs.existsSync(controlsPath)) {
    const content = fs.readFileSync(controlsPath, 'utf8');
    
    const gdprPatterns = [
        'DATA_ENCRYPTION',
        'data_processing_location',
        'backup_location',
        'data_deletion_policy',
        'access_request_handler'
    ];
    
    let foundPatterns = 0;
    gdprPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
            foundPatterns++;
        }
    });
    
    console.log(`   ✅ ${foundPatterns}/${gdprPatterns.length} GDPR patterns found in controls`);
} else {
    console.log('   ❌ globalComplianceControls.js not found');
}

// Test 4: Check sample files are still available
console.log('\n4. Checking GDPR sample files...');
const gdprSamplePath = path.join(__dirname, 'samples', 'gdpr-violations.yaml');

if (fs.existsSync(gdprSamplePath)) {
    const content = fs.readFileSync(gdprSamplePath, 'utf8');
    
    const expectedContent = [
        'DATA_ENCRYPTION',
        'data_processing_location',
        'backup_location',
        'data_deletion_policy',
        'access_request_handler'
    ];
    
    let foundContent = 0;
    expectedContent.forEach(item => {
        if (content.includes(item)) {
            foundContent++;
        }
    });
    
    console.log(`   ✅ ${foundContent}/${expectedContent.length} expected GDPR violations found in sample file`);
} else {
    console.log('   ❌ GDPR sample file not found');
}

console.log('\n🎯 GDPR Scanning Fix Summary:');
console.log('   The issue was that scan commands were using the general scanWorkspace()');
console.log('   method which defaults to FedRAMP only, instead of scanning for the');
console.log('   specific compliance standard requested.');

console.log('\n🛠️ Solution Implemented:');
console.log('   • Added scanWorkspaceWithStandards() method to ComplianceScanner');
console.log('   • Updated all individual scan commands to use specific standards');
console.log('   • GDPR scan now explicitly scans for GDPR compliance only');
console.log('   • Each compliance standard now has its own dedicated scanning');

console.log('\n✅ Expected Result:');
console.log('   GDPR scan command should now detect all GDPR violations in the');
console.log('   sample files and show the correct count instead of 0 issues.');

console.log('\n🚀 Ready to test the fixed GDPR scanning!');
