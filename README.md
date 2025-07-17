# FedRAMP Compliance Scanner

A specialized VS Code extension for scanning Infrastructure as Code and Git repositories specifically for **FedRAMP compliance** and security vulnerabilities with AI-enhanced reporting and intelligent caching.

## 🚀 Features

### Core Scanning
- **FedRAMP-Specific Compliance Scanning**: Deep analysis against FedRAMP Low, Moderate, and High baseline controls
- **Infrastructure as Code Support**: Terraform, CloudFormation, Kubernetes, Docker, and other IaC files
- **Security Vulnerability Detection**: OWASP Top 10, CWE patterns, and common security misconfigurations
- **Real-time Monitoring**: Continuous compliance checking as you code
- **Intelligent Caching**: High-performance scanning with smart result caching

### Advanced Reporting
- **Interactive FedRAMP Dashboard**: Comprehensive visual compliance overview
- **Executive Summaries**: High-level compliance status for stakeholders
- **Control Family Analysis**: Detailed breakdown by FedRAMP control families (AC, AU, CM, IA, SC, SI, etc.)
- **Remediation Suggestions**: AI-powered recommendations for compliance issues
- **Trend Analysis**: Track compliance improvements over time
- **Multi-format Export**: HTML, JSON, PDF, and Excel reports

### FedRAMP-Specific Features
- **Authorization Level Support**: Low, Moderate, and High impact levels
- **Control Mapping**: Automatic mapping to NIST SP 800-53 controls
- **ATO Pathway Tracking**: Monitor progress toward Authority to Operate
- **Weighted Scoring**: Priority-based scoring system for FedRAMP controls
- **Compliance Metrics**: Real-time compliance scoring and metrics

## 📋 Requirements

- VS Code 1.102.0 or higher
- Node.js 20.x or higher (for development)

## 🛠️ Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "FedRAMP Compliance Scanner"
4. Click Install

### From Source
```bash
git clone https://github.com/PavanSavalgi/fedramp-compliance-scanner.git
cd fedramp-compliance-scanner
npm install
npm run compile
```

## 🚀 Quick Start

1. **Open your project** in VS Code
2. **Open Command Palette** (Ctrl+Shift+P)
3. **Run scan**: Type "FedRAMP" and select:
   - `Scan Workspace for FedRAMP Compliance & Security`
   - `Scan Current File for FedRAMP Compliance & Security`

## 📊 Commands

### Core Scanning Commands
- `Scan Workspace for FedRAMP Compliance & Security` - Full workspace scan
- `Scan Current File for FedRAMP Compliance & Security` - Single file scan
- `Security Vulnerability Scan Only` - Security-focused scan
- `Refresh Compliance Data` - Update compliance results

### Report Generation
- `Generate FedRAMP Compliance Report` - Standard compliance report
- `Generate FedRAMP Compliance Only Report` - FedRAMP-specific report
- `Generate Security Vulnerability Report Only` - Security-focused report
- `Export FedRAMP Compliance Report` - Export in multiple formats

### Advanced Reporting
- `Generate Advanced FedRAMP Dashboard` - Interactive visual dashboard
- `Generate Executive Summary` - High-level compliance overview
- `Generate Trend Analysis` - Historical compliance trends
- `Generate Interactive Report` - Web-based interactive report
- `Export Advanced Report` - Multi-format advanced export

### Configuration
- `Set FedRAMP Compliance Level` - Configure Low/Moderate/High level
- `Toggle Real-time Monitoring` - Enable/disable live monitoring
- `Schedule Automatic Reports` - Set up recurring reports

## ⚙️ Configuration

### Settings
Access via File → Preferences → Settings → Extensions → FedRAMP Compliance Scanner

```json
{
  "fedrampCompliance.enabled": true,
  "fedrampCompliance.complianceLevel": "Moderate",
  "fedrampCompliance.autoScanOnSave": false,
  "fedrampCompliance.realTimeMonitoring": false,
  "fedrampCompliance.maxConcurrentScans": 4,
  "fedrampCompliance.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ],
  "fedrampCompliance.cacheEnabled": true,
  "fedrampCompliance.cacheTTL": 3600,
  "fedrampCompliance.enableDiagnostics": true,
  "fedrampCompliance.reportFormat": "html",
  "fedrampCompliance.enableAdvancedReporting": true
}
```

### FedRAMP Compliance Levels

#### Low Impact Level
- Basic security controls
- Suitable for public information systems
- Minimal security requirements

#### Moderate Impact Level (Default)
- Enhanced security controls
- Standard government cloud systems
- Balanced security and functionality

#### High Impact Level
- Maximum security controls
- High-value government systems
- Stringent security requirements

## 📈 FedRAMP Control Families

The scanner analyzes compliance across all FedRAMP control families:

- **AC (Access Control)**: User access management and authorization
- **AU (Audit and Accountability)**: Security event logging and monitoring
- **CA (Security Assessment and Authorization)**: Security testing and authorization
- **CM (Configuration Management)**: System configuration and change management
- **CP (Contingency Planning)**: Business continuity and disaster recovery
- **IA (Identification and Authentication)**: User identity verification
- **IR (Incident Response)**: Security incident handling procedures
- **MA (Maintenance)**: System maintenance and repairs
- **MP (Media Protection)**: Removable media and data protection
- **PE (Physical and Environmental Protection)**: Physical security controls
- **PL (Planning)**: Security planning and procedures
- **PS (Personnel Security)**: Personnel screening and training
- **RA (Risk Assessment)**: Security risk management
- **SA (System and Services Acquisition)**: Secure development practices
- **SC (System and Communications Protection)**: Network and data protection
- **SI (System and Information Integrity)**: System monitoring and malware protection

## 🎯 Supported File Types

- **Terraform**: .tf, .tfvars
- **CloudFormation**: .yaml, .yml, .json (CFT templates)
- **Kubernetes**: .yaml, .yml (K8s manifests)
- **Docker**: Dockerfile, docker-compose.yml
- **Ansible**: .yaml, .yml (playbooks)
- **Helm**: Chart.yaml, values.yaml
- **AWS CDK**: .ts, .js, .py (CDK code)
- **Configuration Files**: .json, .yaml, .yml, .toml, .ini
- **Scripts**: .sh, .ps1, .py, .js, .ts

## 📖 Example Reports

### Sample Dashboard Output
```
FedRAMP Compliance Dashboard
============================

Overall Compliance Score: 87%
Compliance Level: Moderate
Last Scan: 2024-01-15 10:30:00

Control Family Performance:
┌─────────────────┬───────┬────────┬────────┐
│ Family          │ Score │ Issues │ Status │
├─────────────────┼───────┼────────┼────────┤
│ Access Control  │ 92%   │ 3      │ ✓      │
│ Audit & Account │ 89%   │ 5      │ ✓      │
│ Config Mgmt     │ 76%   │ 8      │ ⚠      │
│ Identification  │ 94%   │ 2      │ ✓      │
│ System Protect  │ 81%   │ 6      │ ⚠      │
└─────────────────┴───────┴────────┴────────┘

Top Issues to Address:
1. Missing encryption at rest (SC-28)
2. Inadequate access logging (AU-2)
3. Weak password policy (IA-5)
```

## 🔧 Development

### Building from Source
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test

# Package extension
vsce package
```

### Project Structure
```
src/
├── extension.ts              # Main extension entry point
├── scanner.ts               # Core compliance scanner
├── reportGenerator.ts       # Report generation engine
├── advancedReportingFeatures.ts  # Advanced reporting
├── individualReportGenerator.ts  # FedRAMP-specific reports
├── globalComplianceControls.ts   # FedRAMP control definitions
├── types.ts                 # TypeScript type definitions
└── treeProvider.ts          # VS Code tree view provider
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- Additional FedRAMP control checks
- Enhanced reporting features
- Performance optimizations
- Documentation improvements
- Bug fixes and testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issue Reporting

Found a bug or want to request a feature? Please use our [GitHub Issues](https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues).

## 📞 Support

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides and examples
- **Community**: Join our discussions for help and tips

## 🏆 Recognition

This extension helps organizations achieve FedRAMP compliance more efficiently by:
- Reducing manual compliance checking time by 80%
- Providing real-time compliance feedback
- Generating audit-ready compliance reports
- Accelerating ATO (Authority to Operate) processes

---

**🎯 Ready to enhance your FedRAMP compliance journey? Install the FedRAMP Compliance Scanner today!**
