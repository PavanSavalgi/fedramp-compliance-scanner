# Change Log

All notable changes to the "fedramp-compliance-scanner" extension will be documented in this file.

## [1.3.2] - 2025-07-16

### 🔗 Repository & Links Updates

#### GitHub Repository
- **UPDATED**: Repository URLs updated to point to https://github.com/PavanSavalgi
- **LINKS**: Bug reports and homepage now reference the correct GitHub profile
- **METADATA**: Extension now properly links to Pavan Savalgi's GitHub repository

#### Package Information
- **VERSION**: Incremented to 1.3.2 for repository URL update
- **PACKAGE**: New VSIX package generated with updated metadata
- **SIZE**: Package now includes comprehensive sample files (101.4 KB)

## [1.3.1] - 2025-07-16

### 📝 Documentation & Metadata Updates

#### Author Information
- **UPDATED**: Extension author updated to "Pavan Savalgi"
- **METADATA**: Package metadata reflects proper authorship credit

#### Maintenance
- **VERSION**: Incremented to 1.3.1 for authorship update
- **PACKAGE**: New VSIX package generated with updated metadata

## [1.3.0] - 2025-07-16

### 🎯 Major Updates - Focused FedRAMP Experience

#### Rebranding
- **NEW**: Extension display name changed to "Compliance Scanner" for broader appeal
- **ENHANCED**: Simplified branding while maintaining comprehensive functionality

#### FedRAMP-Specific Features
- **NEW**: `Generate FedRAMP Compliance Only Report` - Dedicated FedRAMP-only compliance report
- **FOCUSED**: Streamlined FedRAMP compliance reporting separate from multi-standard reports
- **ENHANCED**: Better distinction between comprehensive multi-standard and FedRAMP-specific analysis

#### User Experience Improvements
- **Simplified Commands**: Clear separation between general compliance and FedRAMP-specific features
- **Better Organization**: Commands now logically grouped by function and standard
- **Enhanced Clarity**: More intuitive command naming for better discoverability

## [1.2.0] - 2025-07-16

### 🚀 Major Features Added - Individual Compliance Standard Reports

#### Individual Compliance Standard Reports
- **NEW**: Separate report generation for each compliance standard
- **NEW**: Standard-specific filtering and scoring system
- **NEW**: Unique visual themes for each compliance standard
- **NEW**: Individual export capabilities (HTML, JSON, Markdown)

#### New Commands Added
- `Generate Individual Compliance Reports` - Bulk generation for all standards
- `Generate GDPR Compliance Report` - GDPR-specific report with blue privacy theme
- `Generate HIPAA Compliance Report` - HIPAA-specific report with green healthcare theme
- `Generate PCI-DSS Compliance Report` - PCI-DSS-specific report with purple security theme
- `Generate ISO-27001 Compliance Report` - ISO-27001-specific report with orange InfoSec theme

#### 🎨 Visual Enhancements
- **Standard-Specific Themes**: Each compliance standard has its own color scheme and styling
- **Enhanced Report UI**: Improved webview layouts with better visual hierarchy
- **Progress Indicators**: Loading states and better user feedback

#### 🔧 Technical Improvements
- **New Architecture**: Introduced `IndividualReportGenerator` class for modular report handling
- **Enhanced Filtering**: Smart filtering of compliance issues by applicable standards
- **Improved Type Safety**: Better TypeScript implementation with comprehensive error handling
- **Performance Optimization**: Reduced memory usage for large-scale report generation

#### 📊 Enhanced Analytics
- **Standard-Specific Scoring**: Individual compliance percentages per standard
- **Issue Classification**: Better categorization of compliance violations by standard
- **Export Flexibility**: Multiple format support for each individual report

#### 🐛 Bug Fixes
- Fixed TypeScript compilation errors in report generation pipeline
- Resolved method visibility issues in ReportGenerator class
- Corrected import dependencies for compliance types
- Fixed property naming inconsistencies in compliance issue handling

## [1.1.0] - 2025-07-15

### 🌍 Global Compliance Standards Support
- **NEW**: Support for 9 international compliance standards
- **NEW**: Separate compliance and security reporting
- **ENHANCED**: Multi-standard configuration system

## [1.0.0] - 2025-07-16

### 🎉 Major Release - Advanced Security & Compliance Platform

#### ✨ New Features
- **Security Vulnerability Scanning**: Comprehensive OWASP Top 10 based vulnerability detection
- **Compliance Roadmap**: Strategic planning tool with phased remediation approach
- **Trend Analysis**: Historical compliance tracking and improvement monitoring
- **Benchmark Reporting**: Industry comparison and performance ranking
- **Enhanced AI Reports**: More detailed analysis with security and compliance integration
- **Report History**: Automatic tracking of scan results for trend analysis

#### 🛡️ Security Enhancements
- Added 8 vulnerability types covering common security weaknesses
- Integrated CWE (Common Weakness Enumeration) mapping
- Context-aware security checks for Terraform, CloudFormation, and Kubernetes
- Enhanced threat detection for hardcoded credentials, weak encryption, and access control issues

#### 📊 Reporting Improvements
- Interactive compliance roadmap with timeline and priorities
- Performance benchmarking against industry standards
- Historical trend analysis with visual progress indicators
- Advanced export options with comprehensive documentation

#### 🔧 Technical Improvements
- Enhanced TypeScript implementation with better error handling
- Improved diagnostics integration with VS Code Problems panel
- Optimized scanning performance for large repositories
- Better file type detection and context-aware analysis

#### 📋 Compliance Framework Updates
- Complete FedRAMP control family coverage (AC, AU, CM, IA, SC, SI)
- 81 total compliance checks across Low, Moderate, and High impact levels
- Enhanced control mapping and remediation guidance
- Industry-standard compliance scoring methodology

### Breaking Changes
- Updated extension API for enhanced security scanning
- Modified report structure to include security vulnerability data
- Enhanced configuration options for advanced features

### Bug Fixes
- Fixed compilation issues with TypeScript strict mode
- Resolved webview display issues in VS Code
- Improved file scanning reliability for edge cases
- Enhanced error reporting and user feedback

---

## [0.0.1] - 2025-07-15

### Initial Development
- Basic FedRAMP compliance scanning framework
- Tree view integration prototype
- Simple report generation
- Command palette integration