# Test Global Compliance Standards

This file is used to test the global compliance scanning functionality.

## Test Infrastructure
```yaml
# Example Terraform-like configuration with potential compliance issues
resource "aws_s3_bucket" "test" {
  bucket = "test-bucket"
  
  # GDPR Issue: No encryption by default
  encryption = false
  
  # PCI-DSS Issue: Overly permissive access
  public_access = true
  
  # HIPAA Issue: No access logging
  access_logging = false
}

# ISO-27001 Issue: No security policy defined
security_policy = "undefined"

# SOC-2 Issue: No multi-factor authentication
multi_factor_auth = false

# NIST-CSF Issue: No asset inventory
asset_inventory = false
```

## Security Issues
- Hardcoded credentials (for security scanning)
- Weak authentication
- Missing encryption

This file should trigger multiple compliance and security issues when scanned.
