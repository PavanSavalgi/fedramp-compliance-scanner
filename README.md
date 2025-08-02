# FedRAMP Compliance Scanner VS Code Extension

A comprehensive compliance scanner for Infrastructure as Code (IaC) files and Git repositories, supporting multiple compliance frameworks including FedRAMP, CIS, NIST, and PCI DSS standards.

## Supported Compliance Frameworks

### 1. FedRAMP (Federal Risk and Authorization Management Program) - r4
- **Low Impact Level**: Basic security controls for low-risk systems
- **Moderate Impact Level**: Enhanced controls for moderate-risk systems  
- **High Impact Level**: Comprehensive controls for high-risk systems
- **Covers**: 325+ security controls across 17 control families

### 2. CIS AWS Benchmark v1.4
- **Level 1**: Basic security hardening controls
- **Level 2**: Advanced security controls for high-security environments
- **Covers**: AWS-specific security recommendations and best practices

### 3. NIST SP 800-171 r2 (Protecting Controlled Unclassified Information)
- **Covers**: 110 security requirements across 14 control families
- **Focus**: Protection of Controlled Unclassified Information (CUI) in nonfederal systems

### 4. NIST SP 800-53 r5 (Security Controls for Federal Information Systems)
- **Covers**: Comprehensive catalog of security and privacy controls
- **Focus**: Federal information systems and organizations

### 5. PCI DSS v3.2.1 (Payment Card Industry Data Security Standard)
- **Covers**: 12 requirements across 6 main categories
- **Focus**: Protection of cardholder data and payment processing security

## Features

### Core Functionality
- **Multi-Framework Scanning**: Scan files against multiple compliance frameworks simultaneously
- **Live Compliance Monitoring**: Real-time compliance checking as you edit files
- **Comprehensive Reporting**: Generate detailed compliance reports using AI
- **Git Repository Integration**: Scan entire repositories for compliance issues
- **File Type Support**: Terraform (.tf), CloudFormation (.yaml/.yml/.json), Kubernetes manifests, and more

### VS Code Integration
- **Command Palette Commands**: Easy access to all scanning functions
- **Tree View**: Organized display of compliance results by framework
- **Webview Panels**: Detailed interactive compliance reports
- **File Decorations**: Visual indicators for compliance issues
- **Diagnostics Integration**: Compliance issues shown in Problems panel
- **Configuration Settings**: Customizable compliance levels and frameworks

### Compliance Controls Coverage

#### FedRAMP Control Families
- Access Control (AC)
- Audit and Accountability (AU)
- Configuration Management (CM)
- Contingency Planning (CP)
- Identification and Authentication (IA)
- Incident Response (IR)
- Risk Assessment (RA)
- System and Communications Protection (SC)
- System and Information Integrity (SI)
- And 8 additional control families

#### CIS AWS Benchmark Categories
- Identity and Access Management
- Logging and Monitoring
- Storage Security
- Networking Security
- Database Security
- And more AWS-specific controls

#### NIST 800-171 Families
- Access Control (3.1.x)
- Audit and Accountability (3.3.x)
- Configuration Management (3.4.x)
- System and Communications Protection (3.13.x)
- And 10 additional requirement families

#### PCI DSS Requirements
- Build and Maintain a Secure Network
- Protect Stored Cardholder Data
- Protect Cardholder Data in Transit
- Implement Strong Access Control Measures
- Regularly Monitor and Test Networks
- Maintain an Information Security Policy

## Installation

1. Install from the VS Code Extensions Marketplace
2. Search for "FedRAMP Compliance Scanner"
3. Click Install

## Usage

### Quick Start
1. Open a folder containing IaC files
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run "FedRAMP: Scan Current File" or "FedRAMP: Scan Repository"
4. Select desired compliance framework(s)
5. Choose appropriate compliance level
6. Review results in the Compliance Tree View

### Commands

#### Scanning Commands
- `FedRAMP: Scan Current File` - Scan the currently open file
- `FedRAMP: Scan Repository` - Scan entire Git repository
- `FedRAMP: Scan Workspace` - Scan all files in workspace
- `FedRAMP: Quick Compliance Check` - Fast scan with basic checks

#### Framework Selection
- `FedRAMP: Select Compliance Framework` - Choose which frameworks to scan against
- `FedRAMP: Set Compliance Level` - Set FedRAMP impact level (Low/Moderate/High)
- `FedRAMP: Set CIS Level` - Set CIS benchmark level (Level 1/Level 2)

#### Reporting
- `FedRAMP: Generate Compliance Report` - Create detailed AI-powered report
- `FedRAMP: Export Results` - Export scan results to JSON/CSV
- `FedRAMP: View Compliance Dashboard` - Open interactive dashboard

#### Configuration
- `FedRAMP: Open Settings` - Access extension configuration
- `FedRAMP: Reset to Defaults` - Reset all settings to defaults

### Configuration

#### Workspace Settings
```json
{
    "fedramp.compliance.frameworks": [
        "FedRAMP-r4",
        "CIS-AWS-Benchmark-v1.4",
        "NIST-SP-800-171-r2",
        "NIST-SP-800-53-r5",
        "PCI-DSS-v3.2.1"
    ],
    "fedramp.compliance.level": "Moderate",
    "fedramp.compliance.cisLevel": "Level1",
    "fedramp.compliance.autoScan": true,
    "fedramp.compliance.showDecorations": true,
    "fedramp.compliance.excludePatterns": [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**"
    ]
}
```

#### User Settings
- **Compliance Frameworks**: Select which frameworks to scan against
- **Compliance Levels**: Set appropriate security levels for each framework
- **Auto-Scan**: Enable/disable automatic scanning on file changes
- **File Decorations**: Show/hide visual compliance indicators
- **Exclude Patterns**: Define patterns for files/folders to exclude from scanning

## File Type Support

### Infrastructure as Code
- **Terraform**: `.tf` files
- **CloudFormation**: `.yaml`, `.yml`, `.json` templates
- **Kubernetes**: `.yaml`, `.yml` manifests
- **Docker**: `Dockerfile`, `.dockerfile`
- **Ansible**: `.yaml`, `.yml` playbooks

### Configuration Files
- **Environment**: `.env` files
- **JSON**: `.json` configuration files
- **YAML**: `.yaml`, `.yml` configuration files
- **Properties**: `.properties` files

### Documentation
- **Markdown**: `.md` files for policy documentation
- **Text**: `.txt` files for procedures and standards

## Compliance Checking Features

### Security Control Validation
- **Access Controls**: IAM policies, user management, privilege escalation
- **Encryption**: Data at rest and in transit encryption requirements
- **Logging**: Audit trail and monitoring configurations
- **Network Security**: Firewall rules, network segmentation, VPC configuration
- **Data Protection**: Sensitive data handling and storage controls

### Policy Enforcement
- **Automated Checks**: Real-time validation against compliance requirements
- **Best Practices**: Industry-standard security configurations
- **Risk Assessment**: Severity-based prioritization of compliance issues
- **Remediation Guidance**: Specific instructions for fixing compliance violations

### Reporting Capabilities
- **Executive Summaries**: High-level compliance status overview
- **Detailed Technical Reports**: Control-by-control analysis
- **Trend Analysis**: Compliance improvements over time
- **Gap Analysis**: Identification of missing controls
- **Remediation Plans**: Prioritized action items with timelines

## Architecture

### Core Components
- **Compliance Engine**: Multi-framework rule processing
- **Live Scanner**: Real-time file monitoring and analysis
- **Report Generator**: AI-powered report creation using GitHub Copilot
- **Tree View Provider**: VS Code UI integration
- **Webview Provider**: Interactive dashboard and detailed reports

### Extension Structure
```
src/
├── extension.ts              # Main extension activation
├── types.ts                  # TypeScript type definitions
├── globalComplianceControls.ts # Compliance rules and controls
├── liveComplianceScanner.ts  # Real-time scanning engine
├── complianceTreeProvider.ts # Tree view implementation
├── webviewProvider.ts        # Dashboard and reports
└── utils/
    ├── fileScanner.ts        # File system scanning utilities
    ├── reportGenerator.ts    # Report generation logic
    └── configManager.ts      # Configuration management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add compliance controls for new frameworks
4. Test with sample IaC files
5. Submit a pull request

### Adding New Compliance Frameworks
1. Update `types.ts` with new framework definitions
2. Add control definitions to `globalComplianceControls.ts`
3. Update documentation and README
4. Add test cases for new controls

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Comprehensive guides in the docs/ folder
- **Community**: Join discussions in GitHub Discussions
- **Enterprise Support**: Contact for enterprise licensing and support

## Changelog

### Version 2.0.0
- **Multi-Framework Support**: Added CIS, NIST 800-171, NIST 800-53, and PCI DSS
- **Enhanced Reporting**: AI-powered compliance reports
- **Improved UI**: Better tree view and dashboard
- **Performance**: Faster scanning and real-time monitoring

### Version 1.0.0
- **Initial Release**: FedRAMP compliance scanning
- **Basic Features**: File scanning, tree view, simple reporting
- **Core Infrastructure**: Extension framework and basic compliance engine

---

**Stay Compliant. Stay Secure. Code with Confidence.**
