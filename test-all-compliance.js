// Comprehensive test script for all compliance standards
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing All Compliance Standards Pattern Matching\n');
console.log('=' .repeat(60));

// Test data for each compliance standard
const complianceTests = [
    {
        name: 'HIPAA',
        file: 'hipaa-violations.tf',
        patterns: [
            {
                name: 'PHI in environment variables',
                pattern: /PATIENT_SSN\s*=|MEDICAL_ID\s*=/i,
                article: 'HIPAA-164-308: Administrative Safeguards'
            },
            {
                name: 'Storage encryption disabled',
                pattern: /storage_encrypted\s*=\s*false/i,
                article: 'HIPAA-164-312: Technical Safeguards'
            },
            {
                name: 'Public database access',
                pattern: /publicly_accessible\s*=\s*true/i,
                article: 'HIPAA-164-310: Physical Safeguards'
            },
            {
                name: 'PHI access logging disabled',
                pattern: /LOG_PHI_ACCESS\s*=\s*["']disabled["']/i,
                article: 'HIPAA-164-308: Administrative Safeguards'
            }
        ]
    },
    {
        name: 'PCI-DSS',
        file: 'pci-dss-violations.json',
        patterns: [
            {
                name: 'Cardholder data in environment',
                pattern: /"CREDIT_CARD_KEY":\s*"[\d-]+"/,
                article: 'PCI-REQ-3: Protect Stored Data'
            },
            {
                name: 'Overly permissive access',
                pattern: /"CidrIp":\s*"0\.0\.0\.0\/0"/,
                article: 'PCI-REQ-1: Firewall Configuration'
            },
            {
                name: 'Storage encryption disabled',
                pattern: /"StorageEncrypted":\s*false/,
                article: 'PCI-REQ-3: Data Protection'
            },
            {
                name: 'Data encryption disabled',
                pattern: /"ENCRYPT_DATA":\s*"false"/,
                article: 'PCI-REQ-4: Encrypt Transmission'
            }
        ]
    },
    {
        name: 'ISO-27001',
        file: 'iso-27001-violations.tf',
        patterns: [
            {
                name: 'Unclassified data',
                pattern: /DataClassification\s*=\s*"unclassified"/i,
                article: 'ISO-27001: Information Classification'
            },
            {
                name: 'Overprivileged policy',
                pattern: /Action\s*=\s*"\*"/i,
                article: 'ISO-27001: Access Control'
            },
            {
                name: 'Unknown data owner',
                pattern: /Owner\s*=\s*"unknown"/i,
                article: 'ISO-27001: Asset Management'
            },
            {
                name: 'Insecure development',
                pattern: /security_scanning\s*=\s*false/i,
                article: 'ISO-27001: Secure Development'
            }
        ]
    },
    {
        name: 'SOC-2',
        file: 'soc2-violations.yaml',
        patterns: [
            {
                name: 'Hardcoded credentials',
                pattern: /database-password:\s*[\w=]+/i,
                article: 'SOC-2: Security'
            },
            {
                name: 'No encryption in transit',
                pattern: /ENCRYPT_COMMUNICATION.*value:\s*"false"/i,
                article: 'SOC-2: Security'
            },
            {
                name: 'Audit logging disabled',
                pattern: /AUDIT_LOGGING.*value:\s*"disabled"/i,
                article: 'SOC-2: Availability'
            },
            {
                name: 'No access controls',
                pattern: /ACCESS_CONTROL.*value:\s*"none"/i,
                article: 'SOC-2: Confidentiality'
            }
        ]
    },
    {
        name: 'NIST-CSF',
        file: 'nist-csf-violations.tf',
        patterns: [
            {
                name: 'Overprivileged user',
                pattern: /policy_arn\s*=\s*"arn:aws:iam::aws:policy\/AdministratorAccess"/i,
                article: 'NIST-CSF: Protect (PR.AC-1)'
            },
            {
                name: 'Unencrypted protocols',
                pattern: /from_port\s*=\s*23.*# Telnet/i,
                article: 'NIST-CSF: Protect (PR.DS-2)'
            },
            {
                name: 'Global access allowed',
                pattern: /cidr_blocks\s*=\s*\[\s*"0\.0\.0\.0\/0"\s*\]/i,
                article: 'NIST-CSF: Protect (PR.AC-4)'
            },
            {
                name: 'No data versioning',
                pattern: /bucket\s*=\s*"corporate-financial-data"/i,
                article: 'NIST-CSF: Protect (PR.DS-1)'
            }
        ]
    },
    {
        name: 'DPDP',
        file: 'dpdp-violations.tf',
        patterns: [
            {
                name: 'Cross-border data transfer',
                pattern: /bucket\s*=\s*"indian-users-backup-us"/i,
                article: 'DPDP-SEC-8: Cross-border Transfer'
            },
            {
                name: 'No consent management',
                pattern: /CONSENT_REQUIRED\s*=\s*"false"/i,
                article: 'DPDP-SEC-11: Consent Management'
            },
            {
                name: 'Data to Singapore without consent',
                pattern: /arn:aws:s3:::backup-singapore/i,
                article: 'DPDP-SEC-8: International Transfer'
            },
            {
                name: 'No data fiduciary registration',
                pattern: /function_name\s*=\s*"process-indian-user-data"/i,
                article: 'DPDP-SEC-3: Data Fiduciary'
            }
        ]
    }
];

let totalTests = 0;
let totalMatches = 0;
let totalStandards = 0;

for (const test of complianceTests) {
    console.log(`\n📋 Testing ${test.name} Compliance`);
    console.log('-'.repeat(40));
    
    const filePath = path.join(__dirname, 'samples', test.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${test.file}`);
        continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let standardMatches = 0;
    
    for (const pattern of test.patterns) {
        totalTests++;
        console.log(`\n  Testing: ${pattern.name}`);
        
        if (pattern.pattern.test(content)) {
            const match = content.match(pattern.pattern);
            if (match) {
                console.log(`    ✅ MATCH: ${match[0]}`);
                console.log(`    📄 Article: ${pattern.article}`);
                totalMatches++;
                standardMatches++;
            }
        } else {
            console.log(`    ❌ NO MATCH for pattern: ${pattern.pattern}`);
        }
    }
    
    console.log(`\n  📊 ${test.name} Summary: ${standardMatches}/${test.patterns.length} violations detected`);
    if (standardMatches > 0) {
        totalStandards++;
    }
}

console.log('\n' + '='.repeat(60));
console.log(`📈 OVERALL COMPLIANCE TESTING SUMMARY`);
console.log('='.repeat(60));
console.log(`🎯 Standards Tested: ${complianceTests.length}`);
console.log(`✅ Standards with Violations Detected: ${totalStandards}`);
console.log(`🔍 Total Pattern Tests: ${totalTests}`);
console.log(`🎪 Total Violations Found: ${totalMatches}`);
console.log(`📊 Success Rate: ${((totalMatches/totalTests) * 100).toFixed(1)}%`);

if (totalStandards === complianceTests.length) {
    console.log('\n🎉 ALL COMPLIANCE STANDARDS ARE WORKING CORRECTLY!');
} else {
    console.log('\n⚠️  Some compliance standards need pattern adjustments.');
}
