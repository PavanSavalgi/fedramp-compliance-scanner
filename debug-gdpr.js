const { GlobalComplianceControls } = require('./out/globalComplianceControls');

console.log('🔍 Testing GDPR Controls...');

try {
    const globalControls = new GlobalComplianceControls();
    const gdprControls = globalControls.getControlsForStandards(['GDPR']);

    console.log(`📊 Found ${gdprControls.length} GDPR controls`);

    gdprControls.forEach((control, index) => {
        console.log(`\n${index + 1}. Control: ${control.id}`);
        console.log(`   Title: ${control.title}`);
        console.log(`   Standard: ${control.standard}`);
        console.log(`   Checks: ${control.checks?.length || 0}`);
        
        if (control.checks) {
            control.checks.forEach((check, checkIndex) => {
                console.log(`     ${checkIndex + 1}. Pattern: ${check.pattern}`);
                console.log(`        Message: ${check.message}`);
                console.log(`        Severity: ${check.severity}`);
            });
        }
    });

    // Test against your exact test-compliance.md content
    const testContent = `# Test Global Compliance Standards

This file is used to test the global compliance scanning functionality.

## Test Infrastructure
\`\`\`yaml
# Example Terraform-like configuration with potential compliance issues
resource "aws_s3_bucket" "test" {
  bucket = "test-bucket"
  
  # GDPR Issue: No encryption by default (updated to match pattern)
  DATA_ENCRYPTION = "false"
  
  # GDPR Issue: Overly permissive access (updated to match pattern)
  public_access = "true"
  
  # HIPAA Issue: No access logging
  access_logging = false
}

# GDPR Issues - Additional patterns to trigger violations
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-data-config
data:
  # GDPR VIOLATION: Personal data without consent (matches pattern)
  user_emails: |
    john.doe@company.com,jane.smith@company.com
  
  # GDPR VIOLATION: Customer profiles with email data
  customer_profiles: |
    {
      "users": [
        {
          "id": 1,
          "name": "John Doe", 
          "email": "john@example.com"
        }
      ]
    }

  # GDPR VIOLATION: Cross-border data transfer
  data_processing_location: "us-east-1"
  backup_location: "asia-south-1"
  
  # GDPR VIOLATION: No data subject rights
  data_deletion_policy: "never"
  access_request_handler: "disabled"

# ISO-27001 Issue: No security policy defined
security_policy = "undefined"

# SOC-2 Issue: No multi-factor authentication
multi_factor_auth = false

# NIST-CSF Issue: No asset inventory
asset_inventory = false
\`\`\`

## Environment Variables with GDPR Issues
\`\`\`bash
# GDPR violations in environment format
export DATA_ENCRYPTION="false"
export ANONYMIZE_DATA="false"  
export AUDIT_LOGGING="disabled"
\`\`\`

## Security Issues
- Hardcoded credentials (for security scanning)
- Weak authentication
- Missing encryption

This file should trigger multiple compliance and security issues when scanned.`;

    console.log('\n🧪 Testing patterns against test-compliance.md content...');
    console.log(`📄 Test content length: ${testContent.length} characters`);

    let totalMatches = 0;
    let detailedResults = [];

    gdprControls.forEach(control => {
        console.log(`\n🔍 Testing control: ${control.id} - ${control.title}`);
        if (control.checks) {
            control.checks.forEach((check, checkIndex) => {
                console.log(`  Testing pattern ${checkIndex + 1}: ${check.pattern}`);
                try {
                    const regex = new RegExp(check.pattern, check.flags || 'gi');
                    const matches = testContent.match(regex);
                    if (matches) {
                        totalMatches++;
                        console.log(`  ✅ MATCH FOUND!`);
                        console.log(`     Pattern: ${check.pattern}`);
                        console.log(`     Match: "${matches[0]}"`);
                        console.log(`     Message: ${check.message}`);
                        console.log(`     Severity: ${check.severity}`);
                        
                        detailedResults.push({
                            control: control.id,
                            pattern: check.pattern.toString(),
                            match: matches[0],
                            message: check.message,
                            severity: check.severity
                        });
                    } else {
                        console.log(`  ❌ No match`);
                    }
                } catch (patternError) {
                    console.log(`  ⚠️ Pattern error: ${patternError.message}`);
                }
            });
        }
    });

    console.log(`\n📈 Summary: Found ${totalMatches} total pattern matches`);
    
    if (totalMatches > 0) {
        console.log('\n✅ SUCCESS: GDPR patterns are working correctly!');
        console.log('📋 Detailed results:');
        detailedResults.forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.control}: "${result.match}" (${result.severity})`);
        });
        
        console.log('\n🎯 Expected GDPR violations in your test file:');
        console.log('  - DATA_ENCRYPTION = "false" (encryption issues)');
        console.log('  - user_emails with personal data (data processing)');
        console.log('  - data_deletion_policy: "never" (right to erasure)');
        console.log('  - access_request_handler: "disabled" (data subject rights)');
        console.log('  - Cross-border data processing locations');
        
    } else {
        console.log('\n🚨 No matches found! This indicates a pattern mismatch issue.');
        
        // Test specific patterns manually
        console.log('\n🔬 Manual pattern testing:');
        const manualTests = [
            { name: 'DATA_ENCRYPTION false', pattern: /DATA_ENCRYPTION\s*=\s*["']false["']/i },
            { name: 'user_emails pattern', pattern: /user_emails:\s*\|/i },
            { name: 'data_deletion_policy never', pattern: /data_deletion_policy:\s*["']never["']/i },
            { name: 'access_request_handler disabled', pattern: /access_request_handler:\s*["']disabled["']/i },
            { name: 'customer_profiles', pattern: /customer_profiles:\s*\|/i },
            { name: 'data_processing_location', pattern: /data_processing_location:\s*["']us-east-1["']/i }
        ];
        
        manualTests.forEach(({ name, pattern }) => {
            const matches = testContent.match(pattern);
            console.log(`  ${name}: ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
            if (matches) {
                console.log(`    Found: "${matches[0]}"`);
            }
        });
    }

    // Check if GlobalComplianceControls is returning the right structure
    console.log('\n🔍 Debug: GDPR Controls Structure');
    if (gdprControls.length > 0) {
        const firstControl = gdprControls[0];
        console.log('📋 First GDPR control structure:');
        console.log('  - id:', firstControl.id);
        console.log('  - title:', firstControl.title);
        console.log('  - standard:', firstControl.standard);
        console.log('  - checks:', firstControl.checks ? 'exists' : 'missing');
        
        if (firstControl.checks && firstControl.checks.length > 0) {
            console.log('  - first check pattern:', firstControl.checks[0].pattern);
            console.log('  - first check message:', firstControl.checks[0].message);
        }
    }

} catch (error) {
    console.error('❌ Error testing GDPR controls:', error);
    console.error('Stack trace:', error.stack);
    
    // Additional debugging
    console.log('\n🔍 Additional debugging:');
    console.log('  - Current working directory:', process.cwd());
    console.log('  - Node.js version:', process.version);
    
    // Check if the compiled files exist
    const fs = require('fs');
    const path = require('path');
    
    const outDir = path.join(__dirname, 'out');
    console.log('  - Out directory exists:', fs.existsSync(outDir));
    
    if (fs.existsSync(outDir)) {
        const files = fs.readdirSync(outDir);
        console.log('  - Files in out directory:', files);
        
        const globalControlsFile = path.join(outDir, 'globalComplianceControls.js');
        console.log('  - globalComplianceControls.js exists:', fs.existsSync(globalControlsFile));
    }
}
