# Documentation Structure

This document outlines the organized documentation structure for the FedRAMP Compliance Scanner extension.

## 📁 Folder Structure

```
fedramp-compliance-scanner/
├── README.md                          # Main project documentation
├── CHANGELOG.md                       # Version history and changes
├── LICENSE                           # MIT License
├── package.json                      # Extension manifest
│
├── 📁 docs/                          # Documentation hub
│   ├── README_MARKETPLACE.md         # VS Code Marketplace description
│   ├── README_NEW.md                 # Alternative README versions
│   │
│   ├── 📁 releases/                  # Release documentation
│   │   ├── RELEASE_NOTES_v1.0.0.md  # v1.0.0 release notes
│   │   ├── RELEASE_NOTES_v1.2.0.md  # v1.2.0 release notes
│   │   ├── RELEASE_NOTES_v1.3.0.md  # v1.3.0 release notes
│   │   ├── RELEASE_NOTES_v1.4.0.md  # v1.4.0 release notes
│   │   └── RELEASE_NOTES_v1.4.1.md  # v1.4.1 release notes
│   │
│   ├── 📁 guides/                    # User guides and tutorials
│   │   ├── INSTALLATION.md          # Installation and setup guide
│   │   └── PERFORMANCE_GUIDE.md     # Performance optimization guide
│   │
│   ├── 📁 technical/                 # Technical documentation
│   │   ├── OPTIMIZATION_REPORT_v1.4.1.md     # Performance optimization analysis
│   │   ├── OPTIMIZATION_SUMMARY.md            # Optimization summary
│   │   ├── BUG_FIX_REPORT.md                 # Bug fix documentation
│   │   ├── PROJECT_SUMMARY.md                # Project overview
│   │   └── DOCUMENTATION_UPDATE_SUMMARY.md   # Documentation changes
│   │
│   └── 📁 development/               # Development documentation
│       ├── vsc-extension-quickstart.md       # VS Code extension development guide
│       ├── VERSION_1.0.0_SUMMARY.md          # Version 1.0.0 development summary
│       ├── SEPARATE_REPORTING_FEATURE.md     # Feature development notes
│       └── SAMPLE_FILES_SUMMARY.md           # Sample files documentation
│
├── 📁 samples/                       # Sample files for testing
│   ├── README.md                     # Sample files overview
│   ├── SAMPLE_FILES_GUIDE.md        # Guide to using sample files
│   ├── gdpr-violations.yaml          # GDPR compliance test cases
│   ├── hipaa-violations.tf           # HIPAA compliance test cases
│   ├── pci-dss-violations.json       # PCI-DSS compliance test cases
│   ├── iso-27001-violations.tf       # ISO-27001 compliance test cases
│   ├── nist-csf-violations.tf        # NIST-CSF compliance test cases
│   ├── soc2-violations.yaml          # SOC-2 compliance test cases
│   ├── dpdp-violations.tf            # DPDP compliance test cases
│   ├── multi-standard-violations.yaml # Multi-standard test cases
│   ├── sample-terraform.tf           # Basic Terraform example
│   ├── sample-cloudformation.yaml    # CloudFormation example
│   ├── sample-kubernetes.yaml        # Kubernetes example
│   └── vulnerable-terraform.tf       # Security vulnerability examples
│
├── 📁 releases/                      # Release packages
│   ├── fedramp-compliance-scanner-0.0.1.vsix
│   ├── fedramp-compliance-scanner-1.0.0.vsix
│   ├── fedramp-compliance-scanner-1.1.0.vsix
│   ├── fedramp-compliance-scanner-1.2.0.vsix
│   ├── fedramp-compliance-scanner-1.3.0.vsix
│   ├── fedramp-compliance-scanner-1.3.1.vsix
│   ├── fedramp-compliance-scanner-1.3.2.vsix
│   ├── fedramp-compliance-scanner-1.4.0.vsix
│   └── fedramp-compliance-scanner-1.4.1.vsix (latest)
│
├── 📁 test/                          # Test files and configurations
│   ├── test-compliance.md            # Compliance testing documentation
│   ├── test-config.json             # Test configuration
│   ├── test-terraform.tf            # Test Terraform file
│   └── 📁 test-files/               # Additional test files
│
├── 📁 src/                          # Source code
├── 📁 out/                          # Compiled output
├── 📁 .github/                      # GitHub configuration
├── 📁 .vscode/                      # VS Code workspace settings
└── 📁 node_modules/                 # Dependencies
```

## 📚 Documentation Categories

### 🎯 **User Documentation**
- **README.md**: Primary project documentation and getting started guide
- **docs/guides/INSTALLATION.md**: Detailed installation and setup instructions
- **docs/guides/PERFORMANCE_GUIDE.md**: Performance optimization and tuning guide

### 📋 **Release Documentation**
- **CHANGELOG.md**: Comprehensive version history
- **docs/releases/**: Individual release notes for each version
  - Detailed feature descriptions
  - Performance improvements
  - Breaking changes and migration guides

### 🔧 **Technical Documentation**
- **docs/technical/**: In-depth technical analysis and reports
  - Performance optimization reports
  - Bug fix documentation
  - Architecture and design decisions

### 👨‍💻 **Development Documentation**
- **docs/development/**: Development-focused documentation
  - Extension development guides
  - Feature development notes
  - Code contribution guidelines

### 🧪 **Testing Documentation**
- **samples/**: Compliance violation examples for testing
- **test/**: Test configurations and documentation

## 🗂️ Documentation Management Guidelines

### File Naming Conventions
- **Release Notes**: `RELEASE_NOTES_v{version}.md`
- **Guides**: `{TOPIC}_GUIDE.md`
- **Reports**: `{TOPIC}_REPORT_v{version}.md`
- **Summaries**: `{TOPIC}_SUMMARY.md`

### Content Organization
1. **User-Facing**: Keep in root or docs/guides/
2. **Technical**: Place in docs/technical/
3. **Development**: Place in docs/development/
4. **Release-Specific**: Place in docs/releases/

### Maintenance
- Update README.md for major changes
- Add release notes for each version
- Keep guides current with latest features
- Archive old technical reports when superseded

## 🔍 Quick Navigation

### For Users:
- **Getting Started**: README.md
- **Installation**: docs/guides/INSTALLATION.md
- **Performance Tuning**: docs/guides/PERFORMANCE_GUIDE.md
- **Latest Changes**: CHANGELOG.md

### For Developers:
- **Development Setup**: docs/development/vsc-extension-quickstart.md
- **Technical Details**: docs/technical/
- **Sample Files**: samples/
- **Testing**: test/

### For Contributors:
- **Project Overview**: docs/technical/PROJECT_SUMMARY.md
- **Recent Changes**: docs/technical/DOCUMENTATION_UPDATE_SUMMARY.md
- **Development Notes**: docs/development/

## 📈 Benefits of This Structure

1. **Clear Separation**: User vs. developer vs. technical documentation
2. **Easy Navigation**: Logical folder hierarchy
3. **Version Management**: Organized release documentation
4. **Maintenance**: Easier to find and update specific documentation
5. **Scalability**: Structure supports future growth
6. **Professional**: Enterprise-ready documentation organization
