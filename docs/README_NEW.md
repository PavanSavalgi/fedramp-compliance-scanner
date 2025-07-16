# FedRAMP Compliance Scanner

A comprehensive VS Code extension for scanning Infrastructure as Code (IaC) files and Git repositories for FedRAMP (Federal Risk and Authorization Management Program) compliance. This extension helps developers and security teams ensure their cloud infrastructure configurations meet FedRAMP security requirements.

## Features

### 🔍 Comprehensive Compliance Scanning
- **Multi-format Support**: Scans Terraform (.tf), CloudFormation (.yaml/.json), Kubernetes manifests, and other IaC files
- **FedRAMP Control Coverage**: Implements checks for key FedRAMP security controls including:
  - Access Control (AC)
  - Audit and Accountability (AU)
  - Configuration Management (CM)
  - Identification and Authentication (IA)
  - System and Communications Protection (SC)
  - System and Information Integrity (SI)

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
   - Type "FedRAMP: Scan Workspace"
4. **View results** in the FedRAMP Compliance panel
5. **Generate report**:
   - Press `Ctrl+Shift+P`
   - Type "FedRAMP: Generate Report"

## Commands

| Command | Description |
|---------|-------------|
| `FedRAMP: Scan Workspace` | Scans all supported files in the workspace |
| `FedRAMP: Scan Current File` | Scans the currently open file |
| `FedRAMP: Generate Report` | Creates a comprehensive compliance report |
| `FedRAMP: Set Compliance Level` | Sets the FedRAMP impact level (Low/Moderate/High) |

## Configuration

Configure the extension through VS Code settings (`Ctrl+,`):

```json
{
  "fedrampCompliance.level": "Moderate",
  "fedrampCompliance.enableAutoScan": false,
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
- **`fedrampCompliance.enableAutoScan`**: Automatically scan files when saved
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
