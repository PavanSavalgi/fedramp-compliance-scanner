# FedRAMP Compliance Scanner with Security Vulnerability Detection

A comprehensive VS Code extension for scanning Infrastructure as Code (IaC) files and Git repositories for FedRAMP compliance and security vulnerabilities across **9 international compliance standards**. This extension helps developers and security teams ensure their cloud infrastructure configurations meet federal and international security requirements while identifying potential security risks.

## 🚀 Version 1.2.0 - Individual Compliance Standard Reports

### ✨ New in v1.2.0: Individual Compliance Reports
Generate focused reports for specific compliance standards with dedicated themes and filtering:

- **🔵 GDPR Reports**: Privacy-focused compliance with blue theme
- **🟢 HIPAA Reports**: Healthcare compliance with green theme  
- **🟣 PCI-DSS Reports**: Payment security with purple theme
- **🟠 ISO-27001 Reports**: Information security with orange theme
- **🔴 FedRAMP Reports**: Federal compliance with red theme

## Features

### 🌍 Multi-Standard Compliance Support
Support for **9 international compliance standards**:
- **FedRAMP** (Federal Risk and Authorization Management Program)
- **GDPR** (General Data Protection Regulation)
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **DPDP** (Digital Personal Data Protection)
- **PCI-DSS** (Payment Card Industry Data Security Standard)
- **ISO-27001** (Information Security Management)
- **ISO-27002** (Information Security Controls)
- **SOC-2** (Service Organization Control 2)
- **NIST-CSF** (NIST Cybersecurity Framework)

### 🔍 Advanced Scanning Capabilities
- **Individual Standard Reports**: Generate focused reports for specific compliance requirements
- **Bulk Report Generation**: Create all individual reports at once
- **Standard-Specific Filtering**: See only issues relevant to your target compliance standard
- **Multi-format Support**: Scans Terraform (.tf), CloudFormation (.yaml/.json), Kubernetes manifests, and other IaC files

### 🛡️ Security Vulnerability Coverage
- **OWASP Top 10 Vulnerabilities**: Detection based on industry-standard security risks
- **CWE (Common Weakness Enumeration)**: Mapped to standard weakness categories
- **CVE References**: Links to known vulnerabilities where applicable
- **Vulnerability Categories**:
  - Injection vulnerabilities (SQL, Command, etc.)
  - Cryptographic failures and weak encryption
  - Broken authentication and access control
  - Security misconfigurations
  - Sensitive data exposure
  - Vulnerable dependencies
  - Insufficient logging and monitoring

### 📊 Compliance Level Selection
Choose from three FedRAMP impact levels:
- **Low**: Basic security requirements for low-impact systems
- **Moderate**: Enhanced security for moderate-impact systems  
- **High**: Stringent security for high-impact systems

### 📈 AI-Enhanced Reporting
- **Copilot Integration**: Generates detailed compliance reports using AI assistance
- **Executive Summaries**: High-level overviews suitable for management
- **Risk Assessment**: Prioritized findings with risk levels
- **Remediation Plans**: Step-by-step guidance for fixing compliance issues
- **Export Options**: Save reports in JSON or Markdown format

### 🎯 Developer-Friendly Interface
- **Tree View**: Visual representation of compliance status in the Explorer panel
- **Diagnostics Integration**: Issues appear in VS Code's Problems panel
- **Quick Actions**: Right-click context menus for scanning specific files
- **Auto-scanning**: Optional automatic scanning on file save

## 🎯 Individual Compliance Reports

### Generate Focused Reports by Standard

The v1.2.0 release introduces the ability to generate individual reports for specific compliance standards. This is perfect for:

- **Audit Preparation**: Generate focused reports for specific regulatory audits
- **Compliance Teams**: Get reports tailored to your specific regulatory requirements
- **Development Teams**: Focus on specific standards relevant to your project

### How to Use Individual Reports

1. **Quick Access via Command Palette**:
   ```
   Ctrl+Shift+P → "FedRAMP: Generate GDPR Report"
   Ctrl+Shift+P → "FedRAMP: Generate HIPAA Report"
   Ctrl+Shift+P → "FedRAMP: Generate PCI-DSS Report"
   ```

2. **Generate All Individual Reports**:
   ```
   Ctrl+Shift+P → "FedRAMP: Generate Individual Compliance Reports"
   ```

3. **Visual Themes by Standard**:
   - **GDPR**: Blue theme with privacy-focused icons and styling
   - **HIPAA**: Green theme with healthcare compliance emphasis
   - **PCI-DSS**: Purple theme with payment security focus
   - **ISO-27001**: Orange theme with information security management
   - **FedRAMP**: Red theme with federal compliance styling

### Individual Report Features

- **Standard-Specific Filtering**: Only shows issues relevant to the selected standard
- **Compliance Scoring**: Individual percentage scores for each standard
- **Export Options**: HTML, JSON, and Markdown formats available
- **Visual Clarity**: Each standard has unique colors and styling for easy identification

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "FedRAMP Compliance Scanner"
4. Click Install

## Quick Start

1. **Open a workspace** containing IaC files
2. **Set compliance level**: 
   - Press `Ctrl+Shift+P`
   - Type "FedRAMP: Set Compliance Level"
   - Choose Low, Moderate, or High
3. **Scan your workspace**:
   - Press `Ctrl+Shift+P`
   - Type "FedRAMP: Scan Workspace" (scans for both compliance and security)
   - Or use "FedRAMP: Scan Security Only" for vulnerability detection only
4. **View results** in the FedRAMP Compliance panel
5. **Generate comprehensive report**:
   - Press `Ctrl+Shift+P`
   - Type "FedRAMP: Generate Report" (includes both compliance and security findings)

## Commands

### 🎯 Individual Compliance Reports (NEW in v1.2.0)
| Command | Description |
|---------|-------------|
| `FedRAMP: Generate Individual Compliance Reports` | Generate all individual standard reports at once |
| `FedRAMP: Generate GDPR Compliance Report` | Generate GDPR-specific report with privacy focus |
| `FedRAMP: Generate HIPAA Compliance Report` | Generate HIPAA-specific report for healthcare compliance |
| `FedRAMP: Generate PCI-DSS Compliance Report` | Generate PCI-DSS-specific report for payment security |
| `FedRAMP: Generate ISO-27001 Compliance Report` | Generate ISO-27001-specific report for InfoSec management |

### 🔍 Scanning Commands
| Command | Description |
|---------|-------------|
| `FedRAMP: Scan Workspace` | Scans all supported files for compliance AND security vulnerabilities |
| `FedRAMP: Scan Current File` | Scans the currently open file for compliance and security issues |
| `FedRAMP: Scan Security Only` | Performs security vulnerability scanning only |

### 📊 Report Generation Commands
| Command | Description |
|---------|-------------|
| `FedRAMP: Generate Report` | Creates a comprehensive report with compliance and security findings |
| `FedRAMP: Generate Compliance Report Only` | Generate compliance-focused report only |
| `FedRAMP: Generate Security Vulnerability Report Only` | Generate security-focused report only |

### ⚙️ Configuration Commands
| Command | Description |
|---------|-------------|
| `FedRAMP: Set Compliance Level` | Sets the FedRAMP impact level (Low/Moderate/High) |
| `FedRAMP: Select Compliance Standards` | Choose which compliance standards to check against |

## Configuration

Configure the extension through VS Code settings (`Ctrl+,`):

```json
{
  "fedrampCompliance.level": "Moderate",
  "fedrampCompliance.complianceStandards": [
    "FedRAMP",
    "GDPR", 
    "HIPAA",
    "PCI-DSS",
    "ISO-27001"
  ],
  "fedrampCompliance.enableAutoScan": false,
  "fedrampCompliance.enableSecurityScan": true,
  "fedrampCompliance.includePatterns": [
    "**/*.tf",
    "**/*.yaml", 
    "**/*.yml",
    "**/*.json",
    "**/*.hcl"
  ],
  "fedrampCompliance.excludePatterns": [
    "**/node_modules/**",
    "**/vendor/**",
    "**/.git/**"
  ]
}
```

### Settings Reference

- **`fedrampCompliance.level`**: FedRAMP compliance level (Low/Moderate/High)
- **`fedrampCompliance.complianceStandards`**: Array of compliance standards to check against
  - Available: `FedRAMP`, `GDPR`, `HIPAA`, `DPDP`, `PCI-DSS`, `ISO-27001`, `ISO-27002`, `SOC-2`, `NIST-CSF`
- **`fedrampCompliance.enableAutoScan`**: Automatically scan files when saved
- **`fedrampCompliance.enableSecurityScan`**: Enable security vulnerability scanning
- **`fedrampCompliance.includePatterns`**: File patterns to include in scans
- **`fedrampCompliance.excludePatterns`**: File patterns to exclude from scans

## Supported File Types

- **Terraform**: `.tf`, `.hcl`
- **CloudFormation**: `.yaml`, `.yml`, `.json`
- **Kubernetes**: `.yaml`, `.yml`
- **Docker Compose**: `.yaml`, `.yml`
- **Ansible**: `.yaml`, `.yml`

## FedRAMP Controls Covered

### Access Control (AC)
- AC-2: Account Management
- AC-3: Access Enforcement

### Audit and Accountability (AU)
- AU-2: Auditable Events
- AU-4: Audit Storage Capacity

### Configuration Management (CM)
- CM-2: Baseline Configuration
- CM-6: Configuration Settings

### Identification and Authentication (IA)
- IA-2: Identification and Authentication

### System and Communications Protection (SC)
- SC-7: Boundary Protection
- SC-8: Transmission Confidentiality and Integrity
- SC-28: Protection of Information at Rest

### System and Information Integrity (SI)
- SI-4: Information System Monitoring

## Example Issues Detected

### Critical Issues (Errors)
- Unencrypted data transmission (HTTP instead of HTTPS)
- Missing encryption at rest
- Overly permissive access controls (0.0.0.0/0)
- Anonymous or public access enabled

### Warnings
- Missing logging configurations
- Insufficient monitoring setup
- Weak authentication mechanisms

### Information
- Configuration management recommendations
- Security best practices suggestions

## AI-Enhanced Reports

The extension integrates with GitHub Copilot to generate comprehensive compliance reports including:

- **Executive Summary**: High-level compliance status
- **Risk Assessment**: Prioritized security risks  
- **Remediation Plans**: Step-by-step fix instructions
- **Compliance Metrics**: Quantitative compliance scores
- **Next Steps**: Actionable recommendations

## Development

### Prerequisites
- Node.js 18+
- VS Code 1.102.0+

### Building from Source
```bash
git clone <repository-url>
cd fedramp-compliance-scanner
npm install
npm run compile
```

### Testing
```bash
npm test
```

## License

This project is licensed under the MIT License.

## Disclaimer

This extension provides automated scanning to help identify potential FedRAMP compliance issues. It does not guarantee full compliance with FedRAMP requirements. Organizations should conduct comprehensive security assessments and work with qualified security professionals to ensure complete compliance.

---

**FedRAMP Compliance Scanner** - Ensuring your cloud infrastructure meets federal security standards.
