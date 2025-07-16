# FedRAMP Compliance Scanner with Security Vulnerability Detection

A comprehensive VS Code extension for scanning Infrastructure as Code (IaC) files and Git repositories for FedRAMP compliance and security vulnerabilities across **9 international compliance standards**. This extension helps developers and security teams ensure their cloud infrastructure configurations meet federal and international security requirements while identifying potential security risks.

## 🚀 Version 1.4.1 - Performance Optimizations & Enhanced Usability

### ✨ New in v1.4.1: Major Performance Improvements
- **⚡ Parallel Processing**: 3-5x faster scanning with configurable batch processing
- **🧠 Intelligent Caching**: 80% reduction in re-scanning unchanged files
- **� Progress Reporting**: Real-time progress feedback for large repositories
- **🔧 Pattern Optimization**: Pre-compiled regex patterns for 15-20% performance gain
- **⚙️ Configurable Performance**: Hardware-specific tuning options

### 🎯 Enhanced User Experience
- **� Command Reorganization**: All commands now grouped under "Compliance" category
- **🔧 Performance Tuning**: Adjustable batch sizes and cache settings
- **� Memory Management**: Intelligent cache cleanup prevents memory leaks
- **🎯 Better Error Handling**: Enhanced error reporting and logging

### 📊 Performance Benchmarks
| Repository Size | Before v1.4.1 | After v1.4.1 | Improvement |
|----------------|----------------|---------------|-------------|
| Small (<100 files) | 5-8s | 2-3s | **60% faster** |
| Medium (100-1000 files) | 30-45s | 8-15s | **70% faster** |
| Large (1000+ files) | 2-3 minutes | 30-45s | **75% faster** |
| Re-scan (cached) | Same as initial | 1-3s | **95% faster** |

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

### 🎯 Individual Compliance Reports

### Generate Focused Reports by Standard

Generate individual reports for specific compliance standards with dedicated themes and filtering. Perfect for:

- **Audit Preparation**: Generate focused reports for specific regulatory audits
- **Compliance Teams**: Get reports tailored to your specific regulatory requirements
- **Development Teams**: Focus on specific standards relevant to your project

### Available Individual Reports
- **🔵 GDPR Reports**: Privacy-focused compliance with blue theme
- **🟢 HIPAA Reports**: Healthcare compliance with green theme  
- **🟣 PCI-DSS Reports**: Payment security with purple theme
- **🟠 ISO-27001 Reports**: Information security with orange theme
- **🔴 FedRAMP Reports**: Federal compliance with red theme

### How to Use Individual Reports

1. **Quick Access via Command Palette**:
   ```
   Ctrl+Shift+P → "Compliance: Generate GDPR Report"
   Ctrl+Shift+P → "Compliance: Generate HIPAA Report"
   Ctrl+Shift+P → "Compliance: Generate PCI-DSS Report"
   ```

2. **Generate All Individual Reports**:
   ```
   Ctrl+Shift+P → "Compliance: Generate Individual Compliance Reports"
   ```

3. **Visual Themes by Standard**:
   - **GDPR**: Blue theme with privacy-focused icons and styling
   - **HIPAA**: Green theme with healthcare compliance emphasis
   - **PCI-DSS**: Purple theme with payment security focus
   - **ISO-27001**: Orange theme with information security management
   - **FedRAMP**: Red theme with federal compliance styling

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
   - Type "Compliance: Scan Workspace" (scans for both compliance and security)
   - Or use "Compliance: Security Vulnerability Scan Only" for vulnerability detection only
4. **View results** in the FedRAMP Compliance panel
5. **Generate comprehensive report**:
   - Press `Ctrl+Shift+P`
   - Type "Compliance: Generate FedRAMP Compliance Report" (includes both compliance and security findings)

## Commands

### 🎯 Individual Compliance Reports
| Command | Description |
|---------|-------------|
| `Compliance: Generate Individual Compliance Reports` | Generate all individual standard reports at once |
| `Compliance: Generate GDPR Compliance Report` | Generate GDPR-specific report with privacy focus |
| `Compliance: Generate HIPAA Compliance Report` | Generate HIPAA-specific report for healthcare compliance |
| `Compliance: Generate PCI-DSS Compliance Report` | Generate PCI-DSS-specific report for payment security |
| `Compliance: Generate ISO-27001 Compliance Report` | Generate ISO-27001-specific report for InfoSec management |

### 🔍 Scanning Commands
| Command | Description |
|---------|-------------|
| `Compliance: Scan Workspace for FedRAMP Compliance & Security` | Scans all supported files for compliance AND security vulnerabilities |
| `Compliance: Scan Current File for FedRAMP Compliance & Security` | Scans the currently open file for compliance and security issues |
| `Compliance: Security Vulnerability Scan Only` | Performs security vulnerability scanning only |

### 📊 Report Generation Commands
| Command | Description |
|---------|-------------|
| `Compliance: Generate FedRAMP Compliance Report` | Creates a comprehensive report with compliance and security findings |
| `Compliance: Generate Compliance Report Only` | Generate compliance-focused report only |
| `Compliance: Generate Security Vulnerability Report Only` | Generate security-focused report only |

### ⚙️ Configuration Commands
| Command | Description |
|---------|-------------|
| `Compliance: Set FedRAMP Compliance Level` | Sets the FedRAMP impact level (Low/Moderate/High) |
| `Compliance: Select Compliance Standards` | Choose which compliance standards to check against |

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
  ],
  "fedrampCompliance.batchSize": 10,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.cacheSize": 1000,
  "fedrampCompliance.progressReporting": true
}
```

### Settings Reference

#### Core Settings
- **`fedrampCompliance.level`**: FedRAMP compliance level (Low/Moderate/High)
- **`fedrampCompliance.complianceStandards`**: Array of compliance standards to check against
  - Available: `FedRAMP`, `GDPR`, `HIPAA`, `DPDP`, `PCI-DSS`, `ISO-27001`, `ISO-27002`, `SOC-2`, `NIST-CSF`
- **`fedrampCompliance.enableAutoScan`**: Automatically scan files when saved
- **`fedrampCompliance.enableSecurityScan`**: Enable security vulnerability scanning
- **`fedrampCompliance.includePatterns`**: File patterns to include in scans
- **`fedrampCompliance.excludePatterns`**: File patterns to exclude from scans

#### Performance Settings (New in v1.4.1)
- **`fedrampCompliance.batchSize`**: Number of files to process in parallel (1-100, default: 10)
- **`fedrampCompliance.enableCaching`**: Enable result caching for unchanged files (default: true)
- **`fedrampCompliance.cacheSize`**: Maximum cached file results (100-10000, default: 1000)
- **`fedrampCompliance.progressReporting`**: Show progress for large scans >50 files (default: true)

### Performance Tuning Guide

#### For Small Repositories (<100 files):
```json
{
  "fedrampCompliance.batchSize": 5,
  "fedrampCompliance.progressReporting": false
}
```

#### For Large Repositories (>1000 files):
```json
{
  "fedrampCompliance.batchSize": 20,
  "fedrampCompliance.cacheSize": 2000,
  "fedrampCompliance.progressReporting": true
}
```

#### For Low-Resource Systems:
```json
{
  "fedrampCompliance.batchSize": 3,
  "fedrampCompliance.cacheSize": 500,
  "fedrampCompliance.enableSecurityScan": false
}
```

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

## 📚 Documentation

This project has comprehensive documentation organized for easy navigation:

- **📋 Quick Reference**: [DOCS_INDEX.md](DOCS_INDEX.md) - Find any documentation quickly
- **📁 Documentation Hub**: [docs/](docs/) - Organized documentation by category
- **🚀 Installation Guide**: [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- **⚡ Performance Guide**: [docs/guides/PERFORMANCE_GUIDE.md](docs/guides/PERFORMANCE_GUIDE.md)
- **📦 Release Notes**: [docs/releases/](docs/releases/) - Version-specific documentation
- **🔧 Technical Reports**: [docs/technical/](docs/technical/) - In-depth technical analysis
- **👨‍💻 Development Docs**: [docs/development/](docs/development/) - For contributors
- **🧪 Sample Files**: [samples/](samples/) - Test cases and examples

### Documentation Structure
```
docs/
├── guides/          # User guides and tutorials
├── releases/        # Version-specific release notes
├── technical/       # Technical reports and analysis
└── development/     # Development and contribution guides
```

## Changelog

### v1.4.1 (Latest) - Performance Optimization Release
- **⚡ Performance**: 3-5x faster scanning with parallel processing
- **🧠 Caching**: Intelligent file caching reduces re-scanning by 80%
- **📊 Progress**: Real-time progress reporting for large repositories
- **🔧 Optimization**: Pre-compiled regex patterns for 15-20% speed improvement
- **📂 UX**: Commands reorganized under "Compliance" category
- **⚙️ Configuration**: Added performance tuning settings
- **🛡️ Stability**: Enhanced error handling and memory management

### v1.4.0 - Multi-Standard Enhancement
- **🌍 Standards**: Enhanced support for all 7 compliance standards
- **🔍 GDPR**: Fixed GDPR scanning with improved pattern detection
- **📈 Detection**: 78.1% overall violation detection rate
- **🎯 Accuracy**: 5 out of 7 standards now fully operational
- **📊 Reports**: Comprehensive individual standard reports
- **🔧 Controls**: Updated global compliance controls

### v1.3.x - Foundation & Security
- **🛡️ Security**: OWASP Top 10 vulnerability detection
- **📋 Standards**: Initial multi-standard compliance support
- **🎨 Reports**: AI-enhanced report generation
- **🔍 Scanning**: File-level and workspace-level scanning
- **🎯 Integration**: VS Code diagnostics and tree view

## License

This project is licensed under the MIT License.

## Disclaimer

This extension provides automated scanning to help identify potential FedRAMP compliance issues. It does not guarantee full compliance with FedRAMP requirements. Organizations should conduct comprehensive security assessments and work with qualified security professionals to ensure complete compliance.

---

**FedRAMP Compliance Scanner v1.4.1** - High-performance compliance scanning for modern cloud infrastructure.
