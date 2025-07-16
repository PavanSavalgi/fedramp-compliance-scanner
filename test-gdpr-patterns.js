// Test script to verify GDPR pattern matching
const fs = require('fs');
const path = require('path');

// Read the GDPR violations file
const gdprFile = path.join(__dirname, 'samples', 'gdpr-violations.yaml');
const content = fs.readFileSync(gdprFile, 'utf8');
const lines = content.split('\n');

console.log('Testing GDPR patterns against gdpr-violations.yaml...\n');

// Define the patterns from our updated GDPR controls
const patterns = [
    {
        name: 'DATA_ENCRYPTION check',
        pattern: /name:\s*DATA_ENCRYPTION[\s\S]*?value:\s*["']false["']/i,
        message: 'GDPR Article 25: Data encryption must be enabled by default'
    },
    {
        name: 'ANONYMIZE_DATA check',
        pattern: /name:\s*ANONYMIZE_DATA[\s\S]*?value:\s*["']false["']/i,
        message: 'GDPR Article 25: Data anonymization should be enabled for personal data'
    },
    {
        name: 'AUDIT_LOGGING check',
        pattern: /name:\s*AUDIT_LOGGING[\s\S]*?value:\s*["']disabled["']/i,
        message: 'GDPR Article 32: Audit logging must be enabled for data processing activities'
    },
    {
        name: 'Data processing location check',
        pattern: /data_processing_location:\s*["']us-east-1["']/i,
        message: 'GDPR Article 44: Cross-border data transfer requires adequate safeguards'
    },
    {
        name: 'Backup location check',
        pattern: /backup_location:\s*["']asia-south-1["']/i,
        message: 'GDPR Article 44: International backup storage requires GDPR compliance'
    },
    {
        name: 'Data deletion policy check',
        pattern: /data_deletion_policy:\s*["']never["']/i,
        message: 'GDPR Article 17: Data deletion policy must support right to erasure'
    },
    {
        name: 'Access request handler check',
        pattern: /access_request_handler:\s*["']disabled["']/i,
        message: 'GDPR Article 15: Data access request handling must be implemented'
    },
    {
        name: 'Personal data consent check',
        pattern: /user_emails:\s*\|[\s\S]*?@[\w.-]+/i,
        message: 'GDPR Article 6: Personal data processing requires lawful basis and consent'
    },
    {
        name: 'Customer profile check',
        pattern: /customer_profiles:[\s\S]*"email":/i,
        message: 'GDPR Article 6: Customer profile data requires explicit consent'
    }
];

let foundMatches = 0;

patterns.forEach(patternObj => {
    console.log(`Testing: ${patternObj.name}`);
    
    // For multi-line patterns, test against full content
    if (patternObj.name.includes('_ENCRYPTION') || patternObj.name.includes('_LOGGING') || patternObj.name.includes('_DATA') || patternObj.name.includes('Customer profile') || patternObj.name.includes('Personal data consent')) {
        const multiLineContent = content;
        if (patternObj.pattern.test(multiLineContent)) {
            const match = multiLineContent.match(patternObj.pattern);
            if (match) {
                console.log(`  ✅ MATCH found in content: ${match[0].replace(/\n/g, ' ').substring(0, 80)}...`);
                console.log(`     Message: ${patternObj.message}`);
                foundMatches++;
            }
        }
    } else {
        // For single-line patterns, test line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (patternObj.pattern.test(line)) {
                console.log(`  ✅ MATCH found at line ${i + 1}: ${line.trim()}`);
                console.log(`     Message: ${patternObj.message}`);
                foundMatches++;
                break;
            }
        }
    }
    
    console.log('');
});

console.log(`\n📊 Summary: Found ${foundMatches} GDPR compliance violations out of ${patterns.length} possible patterns.`);

if (foundMatches > 0) {
    console.log('✅ GDPR scanning patterns are working correctly!');
} else {
    console.log('❌ No GDPR violations detected - patterns may need adjustment.');
}
