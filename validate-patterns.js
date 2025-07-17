#!/usr/bin/env node

/**
 * Pattern Validation Test - Check all regex patterns for validity
 */

console.log('🔍 Validating Regex Patterns in GlobalComplianceControls');
console.log('======================================================');

try {
    // Import the GlobalComplianceControls module
    const { GlobalComplianceControls } = require('./out/globalComplianceControls');
    
    console.log('✅ Module loaded successfully');
    
    const globalControls = new GlobalComplianceControls();
    
    // Test all standards
    const standards = ['GDPR', 'HIPAA', 'SOC2', 'ISO27001', 'NIST', 'DPDP'];
    
    for (const standard of standards) {
        console.log(`\n🔍 Testing ${standard} patterns...`);
        
        try {
            const controls = globalControls.getControlsForStandards([standard]);
            console.log(`📊 Found ${controls.length} controls for ${standard}`);
            
            for (const control of controls) {
                console.log(`  🎯 Control: ${control.id}`);
                
                for (const check of control.checks) {
                    try {
                        if (check.pattern) {
                            // Test if the pattern is valid by creating a regex from it
                            let testPattern;
                            
                            if (check.pattern instanceof RegExp) {
                                testPattern = check.pattern;
                            } else if (typeof check.pattern === 'string') {
                                console.log(`⚠️  Warning: String pattern found: ${check.pattern}`);
                                testPattern = new RegExp(check.pattern, 'gi');
                            } else {
                                console.log(`❌ Invalid pattern type: ${typeof check.pattern}`);
                                continue;
                            }
                            
                            // Test the pattern with a sample string
                            const testResult = testPattern.test('test string DATA_ENCRYPTION = "false"');
                            console.log(`    ✅ Pattern valid: ${check.id} (${testResult ? 'matched test' : 'no match'})`);
                        } else {
                            console.log(`    ⚠️  No pattern found for check: ${check.id}`);
                        }
                    } catch (patternError) {
                        console.error(`    ❌ Invalid pattern in ${control.id}/${check.id}: ${patternError.message}`);
                        console.error(`       Pattern: ${check.pattern}`);
                        return false;
                    }
                }
            }
        } catch (controlError) {
            console.error(`❌ Error loading ${standard} controls: ${controlError.message}`);
            return false;
        }
    }
    
    console.log('\n✅ All patterns validated successfully!');
    return true;
    
} catch (error) {
    console.error('❌ Failed to load or validate patterns:', error.message);
    console.error('Stack:', error.stack);
    return false;
}
