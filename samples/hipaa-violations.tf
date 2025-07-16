# HIPAA Compliance Violations Sample

resource "aws_s3_bucket" "patient_data" {
  bucket = "patient-health-records"
  
  # HIPAA VIOLATION: No encryption at rest for PHI
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"  # Should use KMS for HIPAA
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "patient_data" {
  bucket = aws_s3_bucket.patient_data.id
  
  # HIPAA VIOLATION: PHI potentially accessible publicly
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_rds_instance" "patient_db" {
  identifier = "patient-database"
  engine     = "mysql"
  
  # HIPAA VIOLATION: No encryption for PHI database
  storage_encrypted = false
  
  # HIPAA VIOLATION: No backup encryption
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  
  # HIPAA VIOLATION: Database accessible from internet
  publicly_accessible = true
  
  # HIPAA VIOLATION: No audit logging for PHI access
  enabled_cloudwatch_logs_exports = []
}

resource "aws_lambda_function" "phi_processor" {
  function_name = "process-patient-data"
  
  environment {
    variables = {
      # HIPAA VIOLATION: PHI in environment variables
      PATIENT_SSN = "123-45-6789"
      MEDICAL_ID = "MED-123456"
      
      # HIPAA VIOLATION: No encryption for data in transit
      ENCRYPT_TRANSIT = "false"
      
      # HIPAA VIOLATION: No access logging
      LOG_PHI_ACCESS = "disabled"
    }
  }
}

resource "aws_security_group" "phi_access" {
  name = "phi-database-access"
  
  ingress {
    # HIPAA VIOLATION: Overly permissive access to PHI
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Should be restricted
  }
}

resource "aws_iam_role" "phi_role" {
  name = "phi-access-role"
  
  # HIPAA VIOLATION: No minimum necessary access principle
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "*"  # Should be specific services only
        }
      }
    ]
  })
}

# HIPAA VIOLATION: No data retention policy for PHI
resource "aws_s3_bucket_lifecycle_configuration" "patient_data_lifecycle" {
  bucket = aws_s3_bucket.patient_data.id
  
  rule {
    id     = "delete_old_data"
    status = "Disabled"  # Should have active retention policy
  }
}
