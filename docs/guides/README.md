# User Guides

This folder contains comprehensive guides for users of the FedRAMP Compliance Scanner extension.

## 📚 Available Guides

### Getting Started
- **[Installation Guide](INSTALLATION.md)** - Complete setup and installation instructions
- **[Performance Guide](PERFORMANCE_GUIDE.md)** - Optimization and tuning for different environments

## 🎯 Guide Overview

### Installation Guide
**Audience**: New users, system administrators  
**Content**:
- Installation options (VSIX, development mode, VS Code marketplace)
- Quick start workflow
- Initial configuration
- Command examples with latest v1.4.1 command structure
- Multi-standard compliance setup

**Key Features Covered**:
- Latest v1.4.1 performance improvements
- Command reorganization ("Compliance:" category)
- Multi-standard selection workflow
- Progress monitoring

### Performance Guide  
**Audience**: Users with large repositories, system administrators, performance-conscious users  
**Content**:
- Hardware-specific optimization recommendations
- Configuration examples for different repository sizes
- Performance troubleshooting
- Cache management strategies
- Best practices for enterprise environments

**Key Features Covered**:
- Batch size tuning (`fedrampCompliance.batchSize`)
- Intelligent caching configuration
- Progress reporting settings
- Memory management
- System-specific optimizations

## 🔧 Configuration Quick Reference

### Basic Configuration
```json
{
  "fedrampCompliance.level": "Moderate",
  "fedrampCompliance.complianceStandards": ["FedRAMP", "GDPR"],
  "fedrampCompliance.enableSecurityScan": true
}
```

### Performance Configuration (v1.4.1)
```json
{
  "fedrampCompliance.batchSize": 10,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.cacheSize": 1000,
  "fedrampCompliance.progressReporting": true
}
```

## 🎯 Choosing the Right Guide

### For New Users:
1. Start with **Installation Guide**
2. Follow the quick start workflow
3. Configure basic compliance standards
4. Run your first scan

### For Performance Optimization:
1. Review **Performance Guide**
2. Assess your repository size and hardware
3. Apply recommended settings
4. Monitor performance improvements

### For Enterprise Deployment:
1. **Installation Guide** for setup procedures
2. **Performance Guide** for enterprise-scale optimization
3. Consider batch processing and caching for large teams

## 📊 Performance Benchmarks (v1.4.1)

| Repository Size | Before | After | Guide Section |
|----------------|--------|-------|---------------|
| Small (<100 files) | 5-8s | 2-3s | Performance Guide - Small Repos |
| Medium (100-1000 files) | 30-45s | 8-15s | Performance Guide - Medium Repos |
| Large (1000+ files) | 2-3min | 30-45s | Performance Guide - Large Repos |
| Re-scan (cached) | Same time | 1-3s | Performance Guide - Caching |

## 🔍 Guide Features

### Step-by-Step Instructions
- Clear, numbered procedures
- Screenshots and code examples
- Command-line instructions
- Configuration examples

### Troubleshooting Sections
- Common issues and solutions
- Performance problem diagnosis
- Configuration validation
- Error resolution

### Best Practices
- Security considerations
- Performance optimization strategies
- Workflow recommendations
- Enterprise deployment guidance

## 🆕 Latest Updates (v1.4.1)

### Installation Guide Updates
- Updated command examples to use "Compliance:" category
- Added multi-standard selection workflow
- Enhanced quick start procedures
- Progress monitoring guidance

### Performance Guide Updates
- New performance optimization settings
- Hardware-specific recommendations
- Cache management strategies
- Troubleshooting for performance issues

## 📈 Usage Scenarios

### Development Teams
- **Installation**: Quick setup for development environments
- **Performance**: Optimize for fast iteration cycles

### Security Teams
- **Installation**: Multi-standard compliance configuration
- **Performance**: Enterprise-scale scanning optimization

### DevOps/CI-CD
- **Installation**: Automated deployment procedures
- **Performance**: High-throughput scanning configuration

### Compliance Officers
- **Installation**: Comprehensive standard selection
- **Performance**: Large-scale repository analysis

## 📞 Support

If these guides don't answer your questions:
1. Check the [main README](../../README.md)
2. Review [technical documentation](../technical/)
3. Search [GitHub Issues](https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues)
4. Create a new issue with specific guide feedback

## 🔄 Guide Maintenance

These guides are actively maintained to reflect:
- Latest feature updates
- Performance improvements
- User feedback and common questions
- Best practices evolution

**Last Updated**: July 17, 2025 (v1.4.1)
**Next Review**: With each minor version release
