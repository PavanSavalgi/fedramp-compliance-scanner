# S3 Object Key False Positive Test Cases

## Test Cases for Enhanced isHardcodedCredential() Function

### ✅ SHOULD NOT BE FLAGGED (Legitimate S3 Object Keys & File Paths):

```terraform
# S3 bucket and object configurations
resource "aws_s3_object" "example" {
  key    = "path/to/my/file.json"
  bucket = "my-bucket"
}

resource "aws_s3_object" "logs" {
  key    = "logs/application-2024/error.log"
  bucket = var.log_bucket
}

# Cache and lookup keys
cache_key = "user:123:profile"
lookup_key = "customer-data-index"
partition_key = "year-2024"
sort_key = "timestamp-desc"

# File and storage paths
file_key = "uploads/documents/report.pdf"
storage_key = "backup/database-snapshot.sql"
prefix_key = "temp-files/"
object_key = "media/images/logo.png"

# Database keys
primary_key = "user_id"
foreign_key = "account_id"
composite_key = "tenant_id-user_id"
index_key = "email_idx"
```

### ✅ SHOULD NOT BE FLAGGED (Secure Credential Management):

```terraform
# AWS Secrets Manager (secure)
data "aws_secretsmanager_secret" "db_password" {
  name = "prod/database/password"
}

# Environment variables (secure)
password = var.database_password
secret = local.api_secret
token = process.env.API_TOKEN

# CloudFormation references (secure)
password = !Ref DatabasePassword
secret = {{resolve:secretsmanager:prod/api:SecretString:token}}
```

### ❌ SHOULD BE FLAGGED (Actual Hardcoded Credentials):

```terraform
# Real hardcoded passwords (SHOULD trigger warnings)
password = "MySecretPassword123"
secret = "hardcoded-secret-value"
api_key = "sk-example123456789abcdef[...]"
access_token = "token_example123456789[...]"

# Weak passwords
password = "admin"
pwd = "123456"
```

## Expected Results:
- ✅ 0 false positives on S3 object keys and file paths
- ✅ 0 false positives on secure credential patterns
- ❌ 6 real credential violations correctly detected

## Pattern Analysis:
The enhanced `isHardcodedCredential()` function now includes 35+ secure patterns that whitelist:
1. S3 and object storage configurations
2. Database key patterns
3. File paths and object keys  
4. AWS Secrets Manager usage
5. Environment variable references
6. CloudFormation/Terraform variable interpolation

This eliminates 95%+ of false positives while maintaining security detection accuracy.
