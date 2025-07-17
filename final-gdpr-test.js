const fs = require('fs');
const path = require('path');

// Load the compiled GDPR controls
const { GlobalComplianceControls } = require('./out/globalComplianceControls');

console.log('🔍 FINAL GDPR PATTERN TEST');
console.log('='.repeat(50));

// Create instance and get GDPR controls
const globalControls = new GlobalComplianceControls();
const gdrpControls = globalControls.getControlsForStandards(['GDPR']);

console.log(`📋 Found ${gdrpControls.length} GDPR controls`);

// Test with our test file
const testFile = './test-gdpr-scan.md';
if (fs.existsSync(testFile)) {
    const content = fs.readFileSync(testFile, 'utf8');
    console.log(`\n📄 Testing file: ${testFile}`);
    console.log(`📝 File size: ${content.length} characters`);
    
    let totalViolations = 0;
    
    gdrpControls.forEach((control, index) => {
        console.log(`\n🛡️  Control ${index + 1}: ${control.id} - ${control.title}`);
        console.log(`📋 Description: ${control.description}`);
        
        let violations = 0;
        control.checks.forEach((check, checkIndex) => {
            console.log(`\n   Check ${checkIndex + 1}: ${check.description}`);
            console.log(`   Pattern: ${check.pattern}`);
            
            const regex = new RegExp(check.pattern, 'gi');
            const matches = content.match(regex);
            
            if (matches) {
                violations += matches.length;
                totalViolations += matches.length;
                console.log(`   ✅ Found ${matches.length} violation(s): ${matches.join(', ')}`);
            } else {
                console.log(`   ❌ No matches found`);
            }
        });
        
        console.log(`   Total violations for this control: ${violations}`);
    });
    
    console.log(`\n🎯 TOTAL GDPR VIOLATIONS FOUND: ${totalViolations}`);
} else {
    console.log(`❌ Test file not found: ${testFile}`);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Pattern test complete');
