# NIST Cybersecurity Framework Violations Sample

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# NIST CSF VIOLATION: No asset inventory (ID.AM-1)
resource "aws_instance" "untracked_instance" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  
  # No tags for asset management
  tags = {}
}

# NIST CSF VIOLATION: No vulnerability assessment (ID.RA-1)
resource "aws_security_group" "vulnerable_sg" {
  name = "high-risk-sg"
  
  ingress {
    # Known vulnerable port configuration
    from_port   = 1433  # SQL Server
    to_port     = 1433
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    # Unencrypted protocols
    from_port   = 23    # Telnet
    to_port     = 23
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# NIST CSF VIOLATION: No access control implementation (PR.AC-1)
resource "aws_iam_user" "overprivileged_user" {
  name = "admin-user"
  
  # No MFA requirement
  force_destroy = true
}

resource "aws_iam_user_policy_attachment" "admin_policy" {
  user       = aws_iam_user.overprivileged_user.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# NIST CSF VIOLATION: No data protection (PR.DS-1)
resource "aws_s3_bucket" "sensitive_data" {
  bucket = "corporate-financial-data"
  
  # No versioning for data protection
}

resource "aws_s3_bucket_versioning" "sensitive_data_versioning" {
  bucket = aws_s3_bucket.sensitive_data.id
  versioning_configuration {
    status = "Disabled"  # Should be enabled for data protection
  }
}

# NIST CSF VIOLATION: No information protection processes (PR.IP-1)
resource "aws_lambda_function" "data_processor" {
  function_name = "process-sensitive-data"
  runtime       = "python3.8"  # Outdated runtime
  
  environment {
    variables = {
      # Sensitive data in environment variables
      DATABASE_PASSWORD = "plaintext_password"
      API_SECRET       = "hardcoded_secret_123"
      
      # No data loss prevention
      DLP_ENABLED = "false"
      
      # No data classification
      DATA_CLASSIFICATION = "none"
    }
  }
}

# NIST CSF VIOLATION: No anomaly detection (DE.AE-1)
resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "/aws/lambda/data-processor"
  retention_in_days = 1  # Insufficient for anomaly detection
}

# NIST CSF VIOLATION: No incident response capability (RS.RP-1)
resource "aws_sns_topic" "security_alerts" {
  name = "security-incidents"
  
  # No subscribers configured for incident response
}

# NIST CSF VIOLATION: No recovery planning (RC.RP-1)
resource "aws_rds_instance" "critical_database" {
  identifier = "business-critical-db"
  engine     = "mysql"
  
  # No automated backups
  backup_retention_period = 0
  
  # No multi-AZ for recovery
  multi_az = false
  
  # No point-in-time recovery
  backup_window = ""
}

# NIST CSF VIOLATION: No continuous monitoring (DE.CM-1)
resource "aws_config_configuration_recorder" "recorder" {
  name     = "security-recorder"
  role_arn = aws_iam_role.config_role.arn
  
  recording_group {
    all_supported                 = false  # Should monitor all resources
    include_global_resource_types = false  # Should include global resources
  }
}

resource "aws_iam_role" "config_role" {
  name = "aws-config-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
      }
    ]
  })
}

# NIST CSF VIOLATION: No supply chain risk assessment (ID.SC-1)
resource "aws_ecr_repository" "app_repo" {
  name = "vulnerable-app"
  
  image_scanning_configuration {
    scan_on_push = false  # Should scan for vulnerabilities
  }
  
  encryption_configuration {
    encryption_type = "AES256"  # Should use KMS for better key management
  }
}
