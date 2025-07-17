# 📚 FedRAMP Compliance Scanner - Documentation Index

Welcome to the comprehensive documentation for the FedRAMP Compliance Scanner extension. This index helps you quickly find the information you need.

## 🚀 Quick Start

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Main project overview and getting started | Everyone |
| [Installation Guide](docs/guides/INSTALLATION.md) | Setup and installation instructions | Users |
| [Performance Guide](docs/guides/PERFORMANCE_GUIDE.md) | Optimization and tuning | Users/Admins |

## 📋 Release Information

| Version | Release Notes | Key Features |
|---------|---------------|--------------|
| **v1.4.1** | [Release Notes](docs/releases/RELEASE_NOTES_v1.4.1.md) | Performance optimization, command reorganization |
| v1.4.0 | [Release Notes](docs/releases/RELEASE_NOTES_v1.4.0.md) | Multi-standard enhancement, GDPR fixes |
| v1.3.0 | [Release Notes](docs/releases/RELEASE_NOTES_v1.3.0.md) | FedRAMP-focused experience |
| v1.2.0 | [Release Notes](docs/releases/RELEASE_NOTES_v1.2.0.md) | Individual compliance reports |
| v1.0.0 | [Release Notes](docs/releases/RELEASE_NOTES_v1.0.0.md) | Major release with security scanning |

**Latest Changes**: [CHANGELOG.md](CHANGELOG.md)

## 🔧 Technical Documentation

| Document | Purpose |
|----------|---------|
| [Optimization Report v1.4.1](docs/technical/OPTIMIZATION_REPORT_v1.4.1.md) | Detailed performance analysis |
| [Optimization Summary](docs/technical/OPTIMIZATION_SUMMARY.md) | Executive summary of improvements |
| [Bug Fix Report](docs/technical/BUG_FIX_REPORT.md) | Bug fixes and resolutions |
| [Project Summary](docs/technical/PROJECT_SUMMARY.md) | Technical project overview |
| [Documentation Updates](docs/technical/DOCUMENTATION_UPDATE_SUMMARY.md) | Documentation change tracking |

## 👨‍💻 Development Resources

| Document | Purpose |
|----------|---------|
| [Extension Development Guide](docs/development/vsc-extension-quickstart.md) | VS Code extension development |
| [Feature Development Notes](docs/development/SEPARATE_REPORTING_FEATURE.md) | Feature implementation details |
| [Sample Files Guide](docs/development/SAMPLE_FILES_SUMMARY.md) | Testing resources documentation |
| [Version 1.0.0 Summary](docs/development/VERSION_1.0.0_SUMMARY.md) | Development milestone summary |

## 🧪 Testing & Examples

| Resource | Purpose |
|----------|---------|
| [Sample Files](samples/) | Compliance violation examples for testing |
| [Sample Files Guide](samples/SAMPLE_FILES_GUIDE.md) | How to use test cases |
| [Test Documentation](test/) | Testing configurations and files |

## 📦 Release Packages

All release packages are available in the [`releases/`](releases/) folder:

- **Latest**: fedramp-compliance-scanner-1.4.1.vsix
- **Previous Versions**: v1.4.0, v1.3.2, v1.3.1, v1.3.0, v1.2.0, v1.1.0, v1.0.0, v0.0.1

## 🎯 Documentation by Audience

### 👤 **End Users**
1. Start with [README.md](README.md)
2. Follow [Installation Guide](docs/guides/INSTALLATION.md)
3. Optimize with [Performance Guide](docs/guides/PERFORMANCE_GUIDE.md)
4. Check [Latest Changes](CHANGELOG.md)

### 👨‍💻 **Developers**
1. Review [Project Summary](docs/technical/PROJECT_SUMMARY.md)
2. Read [Extension Development Guide](docs/development/vsc-extension-quickstart.md)
3. Explore [Sample Files](samples/)
4. Check [Technical Reports](docs/technical/)

### 🏢 **Enterprise/Admins**
1. Review [README.md](README.md) for overview
2. Study [Performance Guide](docs/guides/PERFORMANCE_GUIDE.md)
3. Check [Optimization Report](docs/technical/OPTIMIZATION_REPORT_v1.4.1.md)
4. Review [Release Notes](docs/releases/) for compliance

### 🔍 **Auditors/Compliance**
1. Review compliance standards in [README.md](README.md)
2. Check [Sample Files](samples/) for test cases
3. Review [Release Notes](docs/releases/) for feature history
4. Study [Technical Documentation](docs/technical/)

## 📱 Quick Reference

### Commands (v1.4.1)
All commands are now under the **"Compliance"** category:
- `Compliance: Scan Workspace for FedRAMP Compliance & Security`
- `Compliance: Generate GDPR Compliance Report`
- `Compliance: Generate HIPAA Compliance Report`
- `Compliance: Set FedRAMP Compliance Level`
- `Compliance: Select Compliance Standards`

### Supported Standards
- FedRAMP (Federal Risk and Authorization Management Program)
- GDPR (General Data Protection Regulation)
- HIPAA (Health Insurance Portability and Accountability Act)
- PCI-DSS (Payment Card Industry Data Security Standard)
- ISO-27001 (Information Security Management)
- SOC-2 (Service Organization Control 2)
- NIST-CSF (NIST Cybersecurity Framework)
- DPDP (Digital Personal Data Protection)

### Performance Settings (New in v1.4.1)
```json
{
  "fedrampCompliance.batchSize": 10,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.cacheSize": 1000,
  "fedrampCompliance.progressReporting": true
}
```

## 🔗 External Links

- **GitHub Repository**: https://github.com/PavanSavalgi/fedramp-compliance-scanner
- **Issues**: https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues
- **VS Code Marketplace**: [Search for "FedRAMP Compliance Scanner"]

## 📞 Support

For questions, issues, or contributions:
1. Check existing documentation first
2. Search [GitHub Issues](https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues)
3. Create a new issue with detailed information
4. Reference relevant documentation in your issue

---

**Last Updated**: July 17, 2025 (v1.4.1)  
**Documentation Version**: 1.4.1  
**Maintained by**: Pavan Savalgi
