# Test Global Compliance Standards

This file is used to test the global compliance scanning functionality.

## Test Infrastructure
```yaml
# Example Terraform-like configuration with potential compliance issues
resource "aws_s3_bucket" "test" {
  bucket = "test-bucket"
  
  # GDPR Issue: No encryption by default (updated to match pattern)
  DATA_ENCRYPTION = "false"
  
  # GDPR Issue: Overly permissive access (updated to match pattern)
  public_access = "true"
  
  # HIPAA Issue: No access logging
  access_logging = false
}

# GDPR Issues - Additional patterns to trigger violations
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-data-config
data:
  # GDPR VIOLATION: Personal data without consent (matches pattern)
  user_emails: |
    john.doe@company.com,jane.smith@company.com
  
  # GDPR VIOLATION: Customer profiles with email data
  customer_profiles: |
    {
      "users": [
        {
          "id": 1,
          "name": "John Doe", 
          "email": "john@example.com"
        }
      ]
    }

  # GDPR VIOLATION: Cross-border data transfer
  data_processing_location: "us-east-1"
  backup_location: "asia-south-1"
  
  # GDPR VIOLATION: No data subject rights
  data_deletion_policy: "never"
  access_request_handler: "disabled"

# ISO-27001 Issue: No security policy defined
security_policy = "undefined"

# SOC-2 Issue: No multi-factor authentication
multi_factor_auth = false

# NIST-CSF Issue: No asset inventory
asset_inventory = false
```

## Environment Variables with GDPR Issues
```bash
# GDPR violations in environment format
export DATA_ENCRYPTION="false"
export ANONYMIZE_DATA="false"  
export AUDIT_LOGGING="disabled"
```

## Security Issues
- Hardcoded credentials (for security scanning)
- Weak authentication
- Missing encryption

This file should trigger multiple compliance and security issues when scanned.
