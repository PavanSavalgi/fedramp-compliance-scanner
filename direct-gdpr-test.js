#!/usr/bin/env node

/**
 * GDPR Scanner Test - Direct pattern testing
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GDPR Scanner Direct Test');
console.log('============================');

try {
    // Load the compiled GlobalComplianceControls
    const { GlobalComplianceControls } = require('./out/globalComplianceControls');
    
    console.log('✅ Loaded GlobalComplianceControls');
    
    const globalControls = new GlobalComplianceControls();
    const gdprControls = globalControls.getControlsForStandards(['GDPR']);
    
    console.log(`📊 Found ${gdprControls.length} GDPR controls`);
    
    // Read test file
    const testFile = path.join(__dirname, 'test-compliance.md');
    const content = fs.readFileSync(testFile, 'utf8');
    const lines = content.split('\n');
    
    console.log(`📄 Test file: ${lines.length} lines`);
    console.log('');
    
    let totalMatches = 0;
    
    // Test each control
    for (const control of gdprControls) {
        console.log(`🎯 Testing control: ${control.id} - ${control.title}`);
        
        for (const check of control.checks) {
            console.log(`  📋 Check: ${check.id}`);
            console.log(`  🔍 Pattern: ${check.pattern}`);
            
            let checkMatches = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                try {
                    const match = line.match(check.pattern);
                    if (match) {
                        checkMatches++;
                        totalMatches++;
                        console.log(`    ✅ MATCH on line ${i + 1}: "${match[0]}"`);
                        console.log(`       Full line: ${line.trim()}`);
                    }
                } catch (error) {
                    console.error(`    ❌ Pattern error: ${error.message}`);
                }
            }
            
            if (checkMatches === 0) {
                console.log(`    ⚪ No matches found`);
            }
            console.log('');
        }
    }
    
    console.log(`📈 SUMMARY: Found ${totalMatches} total GDPR violations`);
    
    if (totalMatches > 0) {
        console.log('✅ SUCCESS: GDPR patterns are working and detecting violations!');
        console.log('🔍 Issue must be in VS Code extension pipeline, not pattern matching');
    } else {
        console.log('❌ FAILURE: No violations detected - patterns may need adjustment');
    }
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
}
