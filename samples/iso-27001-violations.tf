# ISO-27001 Information Security Management Violations

resource "aws_s3_bucket" "corporate_data" {
  bucket = "corporate-sensitive-data"
  
  # ISO-27001 VIOLATION: No information classification (A.8.2.1)
  tags = {
    DataClassification = "unclassified"  # Should be properly classified
    Owner             = "unknown"       # Should have clear ownership
  }
}

# ISO-27001 VIOLATION: No access control policy (A.9.1.1)
resource "aws_iam_policy" "overprivileged_policy" {
  name = "full-access-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "*"           # Violates principle of least privilege
        Resource = "*"
      }
    ]
  })
}

# ISO-27001 VIOLATION: No secure development practices (A.14.2.1)
resource "aws_codebuild_project" "insecure_build" {
  name = "production-build"
  
  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:5.0"  # Outdated image
    type         = "LINUX_CONTAINER"
    
    environment_variable {
      name  = "API_KEY"
      value = "hardcoded-api-key-123"  # Hardcoded secrets
    }
    
    environment_variable {
      name  = "SKIP_SECURITY_SCAN"
      value = "true"                   # No security testing
    }
  }
}

# ISO-27001 VIOLATION: No incident management (A.16.1.1)
resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/aws/security/incidents"
  retention_in_days = 1                        # Insufficient log retention
}

# ISO-27001 VIOLATION: No backup procedures (A.12.3.1)
resource "aws_rds_instance" "critical_db" {
  identifier = "critical-business-db"
  engine     = "postgres"
  
  backup_retention_period = 0     # No backups
  delete_automated_backups = true # Auto-delete backups
  deletion_protection     = false # No deletion protection
}

# ISO-27001 VIOLATION: No network security controls (A.13.1.1)
resource "aws_security_group" "wide_open_sg" {
  name = "all-access-sg"
  
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # All ports open to internet
  }
  
  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Unrestricted outbound access
  }
}

# ISO-27001 VIOLATION: No vulnerability management (A.12.6.1)
resource "aws_instance" "vulnerable_server" {
  ami           = "ami-outdated-2020"  # Outdated AMI
  instance_type = "t2.micro"
  
  user_data = <<-EOF
    #!/bin/bash
    # No security updates
    yum update --security --assumeno
    
    # Disable security features
    systemctl stop firewalld
    systemctl disable firewalld
    setenforce 0
  EOF
  
  # No monitoring or logging
  monitoring = false
}

# ISO-27001 VIOLATION: No supplier relationship security (A.15.1.1)
resource "aws_iam_role" "third_party_access" {
  name = "external-vendor-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "*"  # Any AWS account can assume this role
        }
      }
    ]
  })
}
