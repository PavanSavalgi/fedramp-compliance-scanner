# DPDP (Digital Personal Data Protection) Act Violations Sample

resource "aws_dynamodb_table" "user_profiles" {
  name           = "indian-user-profiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  # DPDP VIOLATION: No encryption for personal data at rest
  server_side_encryption {
    enabled = false
  }
  
  # DPDP VIOLATION: No point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = false
  }
  
  tags = {
    # DPDP VIOLATION: No data localization compliance
    DataLocation = "us-east-1"  # Should be in India for Indian users
    PersonalData = "yes"
    DPDPCompliant = "no"
  }
}

# DPDP VIOLATION: Cross-border data transfer without consent
resource "aws_s3_bucket" "user_data_backup" {
  bucket = "indian-users-backup-us"
  
  # Data stored outside India without proper safeguards
}

resource "aws_s3_bucket_replication_configuration" "cross_region" {
  bucket = aws_s3_bucket.user_data_backup.id
  role   = aws_iam_role.replication.arn
  
  rule {
    id     = "replicate-to-singapore"
    status = "Enabled"
    
    destination {
      bucket = "arn:aws:s3:::backup-singapore"  # DPDP violation
    }
  }
}

# DPDP VIOLATION: No data fiduciary registration
resource "aws_lambda_function" "data_processor" {
  function_name = "process-indian-user-data"
  
  environment {
    variables = {
      # DPDP VIOLATION: No consent management
      CONSENT_REQUIRED = "false"
      
      # DPDP VIOLATION: No data minimization
      COLLECT_ALL_DATA = "true"
      
      # DPDP VIOLATION: No purpose limitation
      DATA_PURPOSE = "any"
      
      # DPDP VIOLATION: No retention period limit
      RETENTION_POLICY = "indefinite"
      
      # DPDP VIOLATION: Personal data in environment variables
      SAMPLE_AADHAAR = "1234-5678-9012"
      SAMPLE_PAN = "ABCDE1234F"
    }
  }
}

# DPDP VIOLATION: No data principal rights implementation
resource "aws_api_gateway_rest_api" "user_api" {
  name = "indian-user-data-api"
  
  # No endpoints for data principal rights:
  # - Right to access personal data
  # - Right to correction
  # - Right to erasure
  # - Right to grievance redressal
}

# DPDP VIOLATION: No data breach notification mechanism
resource "aws_sns_topic" "data_breach_alerts" {
  name = "data-breach-notifications"
  
  # No subscription for Data Protection Board notifications
  # No 72-hour breach notification process
}

# DPDP VIOLATION: No age verification for children's data
resource "aws_cognito_user_pool" "user_authentication" {
  name = "indian-users"
  
  schema {
    name                = "age"
    attribute_data_type = "Number"
    required            = false  # Should be required for DPDP compliance
  }
  
  # DPDP VIOLATION: No parental consent mechanism for children under 18
  policies {
    password_policy {
      minimum_length    = 6    # Weak password policy
      require_lowercase = false
      require_numbers   = false
      require_symbols   = false
      require_uppercase = false
    }
  }
}

# DPDP VIOLATION: No data protection officer appointment
resource "aws_iam_role" "data_processing_role" {
  name = "indian-data-processor"
  
  # No DPO role or responsibilities defined
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# DPDP VIOLATION: No consent withdrawal mechanism
resource "aws_dynamodb_table" "user_consents" {
  name         = "user-consents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  # DPDP VIOLATION: No easy consent withdrawal process
  tags = {
    ConsentWithdrawal = "not-implemented"
    GranularConsent = "no"
    ConsentRecords = "incomplete"
  }
}

# DPDP VIOLATION: No data localization for sensitive personal data
resource "aws_rds_instance" "financial_data" {
  identifier = "indian-user-financial-data"
  engine     = "mysql"
  
  # DPDP VIOLATION: Financial data stored outside India
  availability_zone = "us-east-1a"
  
  # DPDP VIOLATION: No encryption for sensitive personal data
  storage_encrypted = false
  
  # DPDP VIOLATION: No access logging for sensitive data
  enabled_cloudwatch_logs_exports = []
}
