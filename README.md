# FedRAMP Compliance Scanner

[![Version](https://img.shields.io/visual-studio-marketplace/v/fedramp-compliance.fedramp-compliance-scanner.svg)](https://marketplace.visualstudio.com/items?itemName=fedramp-compliance.fedramp-compliance-scanner)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/fedramp-compliance.fedramp-compliance-scanner.svg)](https://marketplace.visualstudio.com/items?itemName=fedramp-compliance.fedramp-compliance-scanner)
[![License](https://img.shields.io/github/license/PavanSavalgi/fedramp-compliance-scanner.svg)](https://github.com/PavanSavalgi/fedramp-compliance-scanner/blob/main/LICENSE)

A high-performance VS Code extension for scanning Infrastructure as Code (IaC) files and Git repositories for FedRAMP compliance and security vulnerabilities with AI-enhanced reporting, cost analysis, and comprehensive metrics.

## 🚀 Features

### Core Compliance Scanning
- **FedRAMP Security Controls**: Complete coverage of Low, Moderate, and High impact levels
- **Multi-Format Support**: Terraform, CloudFormation, Kubernetes YAML, Docker, and more
- **Real-time Analysis**: Instant feedback as you code
- **Git Repository Scanning**: Comprehensive repository-wide compliance analysis

### Advanced Analytics & Reporting
- **AI-Enhanced Reports**: Intelligent compliance analysis with recommendations
- **Cost Analysis Engine**: Infrastructure cost estimation and optimization
- **Comprehensive Metrics**: Detailed compliance scoring and trending
- **Interactive Dashboard**: Real-time compliance status visualization

### Security & Vulnerability Detection
- **Multi-layered Security Scanning**: Infrastructure, configuration, and code analysis
- **Vulnerability Database**: Up-to-date security vulnerability detection
- **Auto-remediation**: Automated fixes for common compliance issues
- **Risk Assessment**: Priority-based vulnerability scoring

## 📋 FedRAMP Controls Coverage

### Currently Supported (185+ Controls)
- **Access Control (AC)**: 24 controls
- **Audit and Accountability (AU)**: 12 controls
- **Configuration Management (CM)**: 11 controls
- **Contingency Planning (CP)**: 13 controls
- **Identification and Authentication (IA)**: 12 controls
- **System and Communications Protection (SC)**: 45 controls
- **System and Information Integrity (SI)**: 17 controls
- And many more...

## 🎯 Quick Start

### Installation
1. Install from VS Code Marketplace: `fedramp-compliance-scanner`
2. Or via command line: `code --install-extension fedramp-compliance.fedramp-compliance-scanner`

### Basic Usage
1. Open any IaC file (`.tf`, `.yaml`, `.json`)
2. Run command: `FedRAMP: Scan Current File`
3. View results in the FedRAMP Compliance panel
4. Generate detailed reports with `FedRAMP: Generate Compliance Report`

### Scanning Repository
1. Open your project in VS Code
2. Run command: `FedRAMP: Scan Repository`
3. View comprehensive compliance dashboard
4. Export results in multiple formats (PDF, JSON, HTML)

## 🔧 Configuration

Configure the extension via VS Code settings:

```json
{
  "fedrampCompliance.impactLevel": "moderate",
  "fedrampCompliance.enableRealTimeScanning": true,
  "fedrampCompliance.enableCostAnalysis": true,
  "fedrampCompliance.excludePatterns": [
    "**/node_modules/**",
    "**/test/**"
  ]
}
```

## 📊 Commands

| Command | Description |
|---------|-------------|
| `FedRAMP: Scan Current File` | Scan active file for compliance |
| `FedRAMP: Scan Repository` | Comprehensive repository scan |
| `FedRAMP: Generate Compliance Report` | Create detailed compliance report |
| `FedRAMP: Open Compliance Dashboard` | Interactive compliance dashboard |
| `FedRAMP: Analyze Infrastructure Costs` | Cost analysis and optimization |
| `FedRAMP: Export Results` | Export results in various formats |

## 🎨 Dashboard Features

### Compliance Overview
- Real-time compliance scoring
- Control family coverage heatmap
- Trend analysis and historical data
- Risk prioritization matrix

### Cost Analytics
- Infrastructure cost estimation
- Resource optimization recommendations
- Budget forecasting and alerts
- Cost allocation by compliance requirements

### Reporting Engine
- Executive summary reports
- Technical implementation guides
- Compliance gap analysis
- Remediation roadmaps

## 🔄 Supported File Types

- **Terraform**: `.tf`, `.tfvars`
- **CloudFormation**: `.yaml`, `.yml`, `.json`
- **Kubernetes**: `.yaml`, `.yml`
- **Docker**: `Dockerfile`, `docker-compose.yml`
- **Ansible**: `.yaml`, `.yml`
- **ARM Templates**: `.json`
- **Pulumi**: `.ts`, `.js`, `.py`

## 🚨 Compliance Levels

### FedRAMP Low (147 controls)
Basic security controls for low-impact systems

### FedRAMP Moderate (325 controls)
Enhanced security for moderate-impact systems

### FedRAMP High (421 controls)
Comprehensive security for high-impact systems

## 🛠️ Development

### Requirements
- VS Code 1.102.0 or higher
- Node.js 18.x or higher
- TypeScript 5.x

### Building from Source
```bash
git clone https://github.com/PavanSavalgi/fedramp-compliance-scanner.git
cd fedramp-compliance-scanner
npm install
npm run compile
npm run package
```

### Testing
```bash
npm test
npm run lint
```

## 📈 Performance

- **Scan Speed**: Up to 1000 files/minute
- **Memory Usage**: Optimized for large repositories
- **Real-time**: Sub-second analysis for single files
- **Scalability**: Handles repositories with 10,000+ files

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- Additional compliance frameworks
- New file format support
- Performance optimizations
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues)
- **Documentation**: [Wiki](https://github.com/PavanSavalgi/fedramp-compliance-scanner/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/PavanSavalgi/fedramp-compliance-scanner/discussions)

## 🏆 Changelog

### v1.9.1 (Latest)
- **Cleanup Release**: Removed temporary files and optimized package
- **Performance**: Improved scan performance and memory usage
- **Documentation**: Updated comprehensive documentation

### v1.9.0
- **Phase 3 Complete**: Advanced cost analytics and comprehensive metrics
- **AI Reporting**: Enhanced AI-powered compliance reporting
- **Dashboard**: Interactive compliance dashboard

### v1.8.1
- **Bug Fixes**: Resolved critical scanning issues
- **Performance**: Optimized report generation
- **UI**: Enhanced user interface

[View Full Changelog](CHANGELOG.md)

---

**Made with ❤️ for Federal Compliance**

*Ensuring your cloud infrastructure meets the highest security standards*
