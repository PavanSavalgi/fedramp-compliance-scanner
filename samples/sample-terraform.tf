# Sample Terraform Configuration with FedRAMP Compliance Issues
# This file contains intentional compliance violations for testing

# AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket with compliance issues
resource "aws_s3_bucket" "example" {
  bucket = "my-fedramp-test-bucket"
}

# Issue: No encryption at rest (SC-28 violation)
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
      # Should use KMS for FedRAMP compliance
    }
  }
}

# Issue: Public access allowed (AC-3 violation)
resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id

  block_public_acls       = false  # Should be true
  block_public_policy     = false  # Should be true
  ignore_public_acls      = false  # Should be true
  restrict_public_buckets = false  # Should be true
}

# Security Group with overly permissive rules
resource "aws_security_group" "web" {
  name_prefix = "web-sg"
  description = "Security group for web servers"

  # Issue: Allows access from anywhere (AC-3, SC-7 violation)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Too permissive
  }

  # Issue: SSH access from anywhere (AC-3 violation)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Should be restricted
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Instance without proper encryption
resource "aws_db_instance" "example" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine              = "mysql"
  engine_version      = "8.0"
  instance_class      = "db.t3.micro"
  db_name             = "testdb"
  username            = "admin"
  password            = "password123"  # Issue: Hardcoded password (IA-2 violation)
  
  # Issue: Storage not encrypted (SC-28 violation)
  storage_encrypted = false
  
  # Issue: Public access allowed (AC-3 violation)
  publicly_accessible = true
  
  skip_final_snapshot = true
}

# Load Balancer without SSL/TLS
resource "aws_lb" "example" {
  name               = "example-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets           = ["subnet-12345", "subnet-67890"]

  enable_deletion_protection = false
}

# Issue: HTTP listener instead of HTTPS (SC-8 violation)
resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.example.arn
  port              = "80"
  protocol          = "HTTP"  # Should be HTTPS

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_target_group" "web" {
  name     = "example-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = "vpc-12345"
}

# CloudWatch Log Group without proper retention
resource "aws_cloudwatch_log_group" "example" {
  name = "/aws/ec2/example"
  
  # Issue: No retention policy (AU-4 violation)
  # retention_in_days = 90  # Should be set for compliance
}

# IAM Role with overly broad permissions
resource "aws_iam_role" "example" {
  name = "example-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Issue: Overly permissive policy (AC-3 violation)
resource "aws_iam_role_policy" "example" {
  name = "example-policy"
  role = aws_iam_role.example.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "*"  # Too broad - should follow least privilege
        Resource = "*"
      }
    ]
  })
}
