#!/usr/bin/env node

/**
 * Debug GDPR scanning issue
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging GDPR Scanning Issue...\n');

// Test 1: Check if GDPR controls are being retrieved correctly
console.log('1. Testing GDPR controls retrieval...');

// Simulate the GlobalComplianceControls.getControlsByStandard call
const { exec } = require('child_process');

exec('node -e "const { GlobalComplianceControls } = require(\'./out/globalComplianceControls\'); console.log(JSON.stringify(GlobalComplianceControls.getControlsByStandard(\'GDPR\'), null, 2));"', 
    { cwd: __dirname }, 
    (error, stdout, stderr) => {
        if (error) {
            console.log('   ❌ Error loading GDPR controls:', error.message);
            console.log('   Let me check the compiled output directly...');
            
            // Check compiled output for GDPR controls
            const globalControlsPath = path.join(__dirname, 'out', 'globalComplianceControls.js');
            if (fs.existsSync(globalControlsPath)) {
                const content = fs.readFileSync(globalControlsPath, 'utf8');
                
                if (content.includes('GDPR-ART-25') && content.includes('GDPR-ART-32') && content.includes('GDPR-ART-17')) {
                    console.log('   ✅ GDPR controls found in compiled output');
                } else {
                    console.log('   ❌ GDPR controls missing from compiled output');
                }
                
                if (content.includes('getControlsByStandard')) {
                    console.log('   ✅ getControlsByStandard method found');
                } else {
                    console.log('   ❌ getControlsByStandard method missing');
                }
            }
        } else {
            console.log('   ✅ Successfully retrieved GDPR controls:');
            const controls = JSON.parse(stdout);
            console.log(`   📊 Found ${controls.length} GDPR controls`);
            
            if (controls.length > 0) {
                console.log('   📋 Control IDs:', controls.map(c => c.id).join(', '));
            }
        }
    }
);

// Test 2: Check the scanWorkspaceWithStandards method implementation
setTimeout(() => {
    console.log('\n2. Checking scanWorkspaceWithStandards implementation...');
    
    const scannerPath = path.join(__dirname, 'out', 'scanner.js');
    if (fs.existsSync(scannerPath)) {
        const content = fs.readFileSync(scannerPath, 'utf8');
        
        if (content.includes('scanWorkspaceWithStandards')) {
            console.log('   ✅ scanWorkspaceWithStandards method found');
            
            // Check if it calls the right method for GDPR
            if (content.includes('GlobalComplianceControls.getControlsByStandard')) {
                console.log('   ✅ Calls GlobalComplianceControls.getControlsByStandard');
            } else {
                console.log('   ❌ Does not call GlobalComplianceControls.getControlsByStandard');
            }
        } else {
            console.log('   ❌ scanWorkspaceWithStandards method not found');
        }
    }
    
    // Test 3: Check extension command registration
    console.log('\n3. Checking extension command implementation...');
    
    const extensionPath = path.join(__dirname, 'out', 'extension.js');
    if (fs.existsSync(extensionPath)) {
        const content = fs.readFileSync(extensionPath, 'utf8');
        
        if (content.includes("scanWorkspaceWithStandards(['GDPR'])")) {
            console.log('   ✅ GDPR scan command properly configured');
        } else {
            console.log('   ❌ GDPR scan command not properly configured');
            
            // Look for any GDPR scan command
            if (content.includes('scanGDPR')) {
                console.log('   ℹ️  scanGDPR command found, checking implementation...');
                
                // Extract the scanGDPR implementation
                const gdprMatch = content.match(/scanGDPR[^}]+}/s);
                if (gdprMatch) {
                    console.log('   📝 GDPR command implementation snippet:');
                    console.log('      ', gdprMatch[0].substring(0, 200) + '...');
                }
            }
        }
    }
    
    console.log('\n🎯 Debugging Summary:');
    console.log('   If GDPR scanning is still showing 0 issues, the problem could be:');
    console.log('   1. Controls not being retrieved correctly from GlobalComplianceControls');
    console.log('   2. File patterns not matching the GDPR violation samples');
    console.log('   3. scanWorkspaceWithStandards not properly calling the controls');
    console.log('   4. Extension command not using the right parameters');
    
}, 1000);
