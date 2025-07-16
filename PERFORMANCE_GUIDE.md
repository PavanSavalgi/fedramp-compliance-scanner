# Performance Configuration Guide

## 📊 Extension Performance Settings

The FedRAMP Compliance Scanner v1.4.1 includes several performance optimizations that can be configured based on your workspace size and requirements.

### Settings in `settings.json`:

```json
{
  "fedrampCompliance": {
    // Performance optimizations
    "batchSize": 10,                    // Files to process in parallel (adjust based on CPU cores)
    "enableCaching": true,              // Enable result caching (recommended)
    "cacheSize": 1000,                  // Maximum cache entries
    "progressReporting": true,          // Show progress for large scans
    
    // Scanning scope
    "includePatterns": [
      "**/*.tf",                        // Terraform files
      "**/*.yaml", 
      "**/*.yml",                       // Kubernetes/YAML files
      "**/*.json"                       // CloudFormation/JSON files
    ],
    
    "excludePatterns": [
      "**/node_modules/**",             // Exclude dependencies
      "**/vendor/**",                   // Exclude vendor files
      "**/.git/**",                     // Exclude git metadata
      "**/dist/**",                     // Exclude build outputs
      "**/build/**",
      "**/.terraform/**"                // Exclude Terraform cache
    ],
    
    // Compliance standards (fewer = faster)
    "complianceStandards": [
      "FedRAMP",                        // Core FedRAMP compliance
      "NIST-CSF"                        // Add only needed standards
    ],
    
    // Security scanning
    "enableSecurityScan": true,         // Enable/disable security vulnerability detection
    "securityScanDepth": "standard"     // "quick", "standard", "thorough"
  }
}
```

## ⚡ Performance Tuning Guidelines

### For Small Repositories (<100 files):
```json
{
  "fedrampCompliance.batchSize": 5,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.progressReporting": false
}
```

### For Medium Repositories (100-1000 files):
```json
{
  "fedrampCompliance.batchSize": 10,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.progressReporting": true
}
```

### For Large Repositories (>1000 files):
```json
{
  "fedrampCompliance.batchSize": 20,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.progressReporting": true,
  "fedrampCompliance.cacheSize": 2000
}
```

### For Monorepos or CI/CD:
```json
{
  "fedrampCompliance.batchSize": 50,
  "fedrampCompliance.enableCaching": true,
  "fedrampCompliance.excludePatterns": [
    "**/node_modules/**",
    "**/vendor/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.terraform/**",
    "**/target/**",
    "**/.mvn/**"
  ]
}
```

## 🔧 Hardware-Specific Optimizations

### High-Performance Systems (8+ cores, 16GB+ RAM):
```json
{
  "fedrampCompliance.batchSize": 25,
  "fedrampCompliance.cacheSize": 3000,
  "fedrampCompliance.complianceStandards": ["FedRAMP", "GDPR", "HIPAA", "PCI-DSS", "SOC-2", "NIST-CSF", "ISO-27001"]
}
```

### Low-Resource Systems (2-4 cores, 8GB RAM):
```json
{
  "fedrampCompliance.batchSize": 3,
  "fedrampCompliance.cacheSize": 500,
  "fedrampCompliance.complianceStandards": ["FedRAMP"],
  "fedrampCompliance.enableSecurityScan": false
}
```

## 📈 Performance Monitoring

The extension provides built-in performance monitoring:

1. **Output Channel**: Check "FedRAMP Compliance Scanner" for timing information
2. **Progress Reports**: Enable for large repositories to track scan progress
3. **Cache Hit Rates**: Monitor in output for cache effectiveness

## 🚀 Advanced Optimizations

### Custom Ignore Patterns
Create a `.fedrampignore` file in your workspace root:
```
# Temporary files
*.tmp
*.log
*.cache

# Development files
*.local.*
.env.*

# Language-specific
__pycache__/
*.pyc
node_modules/
target/
```

### File Type Specific Scanning
```json
{
  "fedrampCompliance.fileTypeRules": {
    "terraform": {
      "patterns": ["**/*.tf", "**/*.tfvars"],
      "standards": ["FedRAMP", "NIST-CSF"]
    },
    "kubernetes": {
      "patterns": ["**/*.yaml", "**/*.yml"],
      "standards": ["FedRAMP", "PCI-DSS"]
    },
    "cloudformation": {
      "patterns": ["**/*.json", "**/*.template"],
      "standards": ["FedRAMP", "SOC-2"]
    }
  }
}
```

## 📊 Expected Performance Improvements

| Repository Size | Before (v1.3.2) | After (v1.4.1) | Improvement |
|----------------|------------------|------------------|-------------|
| Small (< 100 files) | 5-8s | 2-3s | 60% faster |
| Medium (100-1000 files) | 30-45s | 8-15s | 70% faster |
| Large (1000+ files) | 2-3 minutes | 30-45s | 75% faster |
| Re-scan (cached) | Same as initial | 1-3s | 95% faster |

## 🔍 Troubleshooting Performance Issues

### Slow Initial Scan
1. Check exclude patterns to avoid scanning unnecessary files
2. Reduce number of compliance standards if not all are needed
3. Increase batch size for high-performance systems

### High Memory Usage
1. Reduce cache size setting
2. Exclude large binary files or generated content
3. Restart VS Code to clear accumulated cache

### Cache Not Working
1. Verify `enableCaching` is set to `true`
2. Check file permissions for cache writes
3. Monitor output channel for cache-related errors

## 📝 Best Practices

1. **Start Small**: Begin with minimal standards and expand as needed
2. **Monitor Output**: Use the output channel to understand performance characteristics
3. **Tune Gradually**: Adjust batch size incrementally based on your system's performance
4. **Regular Cleanup**: Periodically clear cache if experiencing memory issues
5. **Profile Your Workspace**: Different codebases have different optimization needs
