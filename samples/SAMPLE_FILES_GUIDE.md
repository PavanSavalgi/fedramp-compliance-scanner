# Sample Compliance Violation Files

This directory contains sample Infrastructure as Code (IaC) files that demonstrate various compliance violations across different security and privacy standards. These files are designed to help test and demonstrate the compliance scanning capabilities of the Compliance Scanner extension.

## 📁 Sample Files Overview

### 1. **gdpr-violations.yaml**
**GDPR (General Data Protection Regulation) Violations**
- Personal data without consent mechanisms
- No data retention policies
- Cross-border data transfers without safeguards
- Missing data subject rights implementation
- No encryption for personal data in transit
- Disabled audit logging for data access

### 2. **hipaa-violations.tf**
**HIPAA (Health Insurance Portability and Accountability Act) Violations**
- No encryption at rest for PHI (Protected Health Information)
- PHI potentially accessible publicly
- Database accessible from internet
- PHI in environment variables
- No audit logging for PHI access
- Overly permissive access to PHI
- No minimum necessary access principle
- Missing data retention policy for PHI

### 3. **pci-dss-violations.json**
**PCI-DSS (Payment Card Industry Data Security Standard) Violations**
- Unencrypted payment data storage
- Public access to credit card data
- Hardcoded payment processing keys
- Weak security group configurations
- Overly permissive IAM policies
- No proper access controls for cardholder data
- Insecure payment processing environment

### 4. **iso-27001-violations.tf**
**ISO-27001 (Information Security Management) Violations**
- No information classification
- Missing access control policies
- Insecure development practices
- No incident management procedures
- Insufficient backup procedures
- No network security controls
- Missing vulnerability management
- No supplier relationship security

### 5. **soc2-violations.yaml**
**SOC-2 Type II Violations**
- Hardcoded credentials (Security criterion)
- No encryption in transit
- No audit logging (Availability/Monitoring)
- No data integrity checks (Processing Integrity)
- No access controls (Confidentiality)
- Service exposed without proper controls
- Sensitive customer data in ConfigMap
- No data retention policy (Privacy)
- Unencrypted backups

### 6. **nist-csf-violations.tf**
**NIST Cybersecurity Framework Violations**
- No asset inventory (ID.AM-1)
- No vulnerability assessment (ID.RA-1)
- No access control implementation (PR.AC-1)
- No data protection (PR.DS-1)
- No information protection processes (PR.IP-1)
- No anomaly detection (DE.AE-1)
- No incident response capability (RS.RP-1)
- No recovery planning (RC.RP-1)
- No continuous monitoring (DE.CM-1)
- No supply chain risk assessment (ID.SC-1)

### 7. **dpdp-violations.tf**
**DPDP (Digital Personal Data Protection) Act Violations**
- No data localization for Indian users
- Cross-border data transfer without consent
- No data fiduciary registration
- Missing consent management
- No data minimization principles
- No purpose limitation
- Missing age verification for children's data
- No data protection officer appointment
- No consent withdrawal mechanism

### 8. **multi-standard-violations.yaml**
**Multi-Standard Violations**
- Comprehensive violations across all supported standards
- Demonstrates overlapping compliance requirements
- Shows how single misconfigurations can violate multiple standards
- Includes security vulnerabilities alongside compliance issues

### 9. **vulnerable-terraform.tf** (Existing)
**Security Vulnerabilities and General Compliance Issues**
- Hardcoded passwords and secrets
- Weak encryption algorithms
- Excessive permissions
- Insecure protocols
- Command injection vulnerabilities
- Privilege escalation risks

## 🎯 How to Use These Files

### Testing Individual Standards
1. **Open a specific violation file** (e.g., `gdpr-violations.yaml`)
2. **Run the appropriate scan command**:
   - `Compliance Scanner: Scan Current File`
   - `Compliance Scanner: Generate GDPR Compliance Report`

### Testing Multi-Standard Scanning
1. **Open the multi-standard file** (`multi-standard-violations.yaml`)
2. **Run comprehensive scans**:
   - `Compliance Scanner: Scan Workspace`
   - `Compliance Scanner: Generate Individual Compliance Reports`

### Testing Workspace-Wide Scanning
1. **Open the entire workspace**
2. **Run workspace scanning**:
   - `Compliance Scanner: Scan Workspace`
   - Generate reports for specific standards you're interested in

## 🔍 What the Scanner Will Detect

### Compliance Violations
- **Data Protection**: Encryption, access controls, data classification
- **Privacy Rights**: Consent management, data subject rights, retention policies
- **Access Management**: Authentication, authorization, least privilege
- **Monitoring & Logging**: Audit trails, incident response, continuous monitoring
- **Data Governance**: Retention, localization, cross-border transfers

### Security Vulnerabilities
- **Hardcoded Credentials**: API keys, passwords, secrets in code
- **Weak Encryption**: Deprecated algorithms, unencrypted data
- **Access Control Issues**: Overly permissive policies, public access
- **Network Security**: Open ports, insecure protocols, network policies
- **Configuration Weaknesses**: Default settings, missing security controls

## 📊 Expected Results

When scanning these files, you should see:
- **High number of violations** across multiple standards
- **Severity classifications** (Error, Warning, Info)
- **Specific compliance control references** (e.g., AC-3, SC-28, etc.)
- **Remediation suggestions** for each violation
- **Cross-standard mapping** showing how issues affect multiple frameworks

## 🛠️ Remediation Examples

Each violation in these files represents a **real-world misconfiguration**. The scanner will provide:
1. **Clear descriptions** of what's wrong
2. **Compliance control references** 
3. **Specific remediation steps**
4. **Best practice recommendations**

## 📝 Adding Your Own Samples

To create additional test cases:
1. **Copy an existing file** as a template
2. **Add specific misconfigurations** for your use case
3. **Include comments** explaining the violations
4. **Test with the scanner** to ensure detection works

These sample files provide comprehensive coverage of compliance violations across all supported standards, making them ideal for testing, training, and demonstrating the Compliance Scanner's capabilities.
