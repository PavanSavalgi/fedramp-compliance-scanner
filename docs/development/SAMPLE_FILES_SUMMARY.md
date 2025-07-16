# Sample Compliance Violation Files Created

## 🎉 **Comprehensive Sample Files Created Successfully!**

I've created a comprehensive set of sample files that demonstrate various compliance violations across all supported standards. These files are designed to test and showcase the capabilities of the Compliance Scanner extension.

## 📁 **Created Sample Files (9 New Files)**

### 1. **gdpr-violations.yaml** (Kubernetes)
- **Format**: Kubernetes YAML
- **Focus**: GDPR violations
- **Key Issues**: Personal data without consent, cross-border transfers, no data retention policies
- **Use Case**: Testing GDPR compliance scanning

### 2. **hipaa-violations.tf** (Terraform)
- **Format**: Terraform HCL
- **Focus**: HIPAA violations  
- **Key Issues**: Unencrypted PHI, public access to health data, no audit logging
- **Use Case**: Healthcare compliance testing

### 3. **pci-dss-violations.json** (CloudFormation)
- **Format**: AWS CloudFormation JSON
- **Focus**: PCI-DSS violations
- **Key Issues**: Unencrypted payment data, hardcoded card processing keys, weak access controls
- **Use Case**: Payment industry compliance testing

### 4. **iso-27001-violations.tf** (Terraform)
- **Format**: Terraform HCL
- **Focus**: ISO-27001 violations
- **Key Issues**: No information classification, missing access controls, insecure development
- **Use Case**: Information security management testing

### 5. **soc2-violations.yaml** (Kubernetes)
- **Format**: Kubernetes YAML
- **Focus**: SOC-2 Type II violations
- **Key Issues**: Hardcoded credentials, no encryption in transit, missing audit controls
- **Use Case**: Service organization compliance testing

### 6. **nist-csf-violations.tf** (Terraform)
- **Format**: Terraform HCL
- **Focus**: NIST Cybersecurity Framework violations
- **Key Issues**: No asset inventory, missing vulnerability management, no incident response
- **Use Case**: Cybersecurity framework compliance testing

### 7. **dpdp-violations.tf** (Terraform)
- **Format**: Terraform HCL
- **Focus**: DPDP (Digital Personal Data Protection) violations
- **Key Issues**: No data localization, missing consent management, cross-border transfers
- **Use Case**: Indian data protection law compliance testing

### 8. **multi-standard-violations.yaml** (Kubernetes)
- **Format**: Kubernetes YAML
- **Focus**: Multiple standard violations in one file
- **Key Issues**: Violations across all supported standards simultaneously
- **Use Case**: Comprehensive multi-standard compliance testing

### 9. **SAMPLE_FILES_GUIDE.md**
- **Format**: Markdown documentation
- **Purpose**: Comprehensive guide explaining all sample files
- **Content**: Usage instructions, expected results, remediation examples

## 🎯 **Testing Scenarios Covered**

### **Individual Standard Testing**
Each file targets specific compliance violations for:
- ✅ **GDPR** - Privacy and data protection
- ✅ **HIPAA** - Healthcare data security
- ✅ **PCI-DSS** - Payment card security
- ✅ **ISO-27001** - Information security management
- ✅ **SOC-2** - Service organization controls
- ✅ **NIST CSF** - Cybersecurity framework
- ✅ **DPDP** - Indian data protection
- ✅ **FedRAMP** - Federal compliance (in multi-standard file)

### **File Format Coverage**
- ✅ **Terraform (.tf)** - 4 files
- ✅ **Kubernetes YAML (.yaml)** - 3 files  
- ✅ **CloudFormation JSON (.json)** - 1 file
- ✅ **Documentation (.md)** - 1 guide

### **Violation Types Demonstrated**
- ✅ **Data Protection**: Encryption, access controls, classification
- ✅ **Privacy Rights**: Consent, data subject rights, retention
- ✅ **Access Management**: Authentication, authorization, least privilege
- ✅ **Security Controls**: Network security, vulnerability management
- ✅ **Monitoring & Logging**: Audit trails, incident response
- ✅ **Data Governance**: Localization, cross-border transfers

## 🔍 **How to Test These Files**

### **Quick Testing**
1. **Open any sample file** in VS Code
2. **Run**: `Ctrl+Shift+P` → "Compliance Scanner: Scan Current File"
3. **Generate specific report**: "Compliance Scanner: Generate [Standard] Report"

### **Comprehensive Testing**
1. **Open workspace** with all sample files
2. **Run**: "Compliance Scanner: Scan Workspace" 
3. **Generate**: "Compliance Scanner: Generate Individual Compliance Reports"

### **Individual Standard Focus**
1. **Open specific violation file** (e.g., `gdpr-violations.yaml`)
2. **Run**: "Compliance Scanner: Generate GDPR Compliance Report"
3. **Review**: Standard-specific violations and remediation

## 📊 **Expected Results**

When scanning these files, you'll see:
- **High violation counts** across all standards
- **Specific compliance control references** (AC-3, SC-28, etc.)
- **Severity classifications** (Error, Warning, Info)
- **Cross-standard mappings** showing overlapping requirements
- **Detailed remediation guidance** for each violation

## 🎨 **Visual Testing**

Each compliance standard report will show:
- **🔵 GDPR**: Blue privacy-focused theme
- **🟢 HIPAA**: Green healthcare theme
- **🟣 PCI-DSS**: Purple payment security theme  
- **🟠 ISO-27001**: Orange information security theme
- **🔴 FedRAMP**: Red federal compliance theme

## 🛠️ **Real-World Value**

These sample files represent **actual misconfigurations** commonly found in:
- **Enterprise environments**
- **Government systems** 
- **Healthcare organizations**
- **Financial services**
- **SaaS platforms**

Perfect for:
- ✅ **Testing the scanner's detection capabilities**
- ✅ **Training teams on compliance requirements**
- ✅ **Demonstrating violation patterns**
- ✅ **Validating remediation approaches**

The sample files are now ready to thoroughly test all compliance scanning features of the Compliance Scanner extension! 🚀
