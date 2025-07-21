# S3 Object Key Test Configuration
# This file contains legitimate S3 object key patterns that should NOT trigger false positives

resource "aws_s3_object" "website_assets" {
  key    = "assets/css/main.css"
  bucket = var.website_bucket
  source = "dist/css/main.css"
}

resource "aws_s3_object" "user_uploads" {
  key    = "uploads/documents/${var.tenant_id}/file.pdf"
  bucket = aws_s3_bucket.documents.bucket
}

resource "aws_s3_object" "backup_data" {
  key    = "backups/database/2024-07-21/snapshot.sql"
  bucket = "company-backups"
}

# Log storage configuration
log_object_key = "logs/application/2024/07/21/app.log"
error_log_key = "error-logs/service-errors.json"
audit_key = "audit/compliance/fedramp-audit-2024.xml"

# Cache and index keys
cache_key = "user-sessions:active"
lookup_key = "product-catalog-index"
partition_key = "region-us-east-1"
sort_key = "created-timestamp-desc"

# Database configuration (legitimate keys)
primary_key = "user_id"
foreign_key = "organization_id"
composite_key = "tenant_id-user_id-timestamp"

# File storage paths
file_key = "shared/documents/policy.pdf"
storage_key = "temp/processing/batch-001.csv"
prefix_key = "archived/"
object_key = "media/images/logo-2024.png"

# Legitimate credential management (should NOT be flagged)
password = var.database_password
secret = local.encryption_secret
api_key = data.aws_secretsmanager_secret.api_credentials.secret_string
token = process.env.API_TOKEN

# CloudFormation references
database_password = !Ref DatabasePasswordParameter
api_secret = {{resolve:secretsmanager:prod/api:SecretString:secret}}

# *** These SHOULD be flagged as violations ***
# password = "HardcodedPassword123"  # Uncomment to test detection
# secret = "my-secret-key-value"     # Uncomment to test detection
