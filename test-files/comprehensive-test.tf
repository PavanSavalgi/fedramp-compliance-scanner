# Comprehensive Test File - Security & Compliance Issues
# This file contains intentional security vulnerabilities and compliance violations

# Security Issue 1: Hardcoded credentials (CWE-798)
resource "aws_db_instance" "main" {
  identifier = "mydb"
  engine     = "mysql"
  username   = "admin"
  password   = "hardcoded123"  # Security vulnerability: hardcoded password
  
  # Compliance Issue: AC-02 - No multi-factor authentication
  publicly_accessible = true  # Security vulnerability: public database
  
  # Compliance Issue: SC-13 - Weak encryption
  storage_encrypted = false
}

# Security Issue 2: Weak cryptographic algorithm (CWE-327)
resource "aws_kms_key" "weak" {
  description = "Weak encryption key"
  key_usage   = "ENCRYPT_DECRYPT"
  # Missing key_spec - defaults to SYMMETRIC_DEFAULT which may be weak
}

# Security Issue 3: Injection vulnerability (CWE-89)
resource "aws_lambda_function" "vulnerable" {
  function_name = "vulnerable-function"
  runtime       = "python3.9"
  
  environment {
    variables = {
      # SQL injection risk - user input directly in query
      DB_QUERY = "SELECT * FROM users WHERE id = ${var.user_id}"
    }
  }
  
  # Compliance Issue: AU-03 - No logging configuration
  # Missing CloudWatch logs configuration
}

# Security Issue 4: Broken access control (CWE-284)
resource "aws_s3_bucket_policy" "open" {
  bucket = aws_s3_bucket.data.id
  
  policy = jsonencode({
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"  # Security vulnerability: wildcard principal
        Action = "s3:*"
        Resource = "*"   # Security vulnerability: wildcard resource
      }
    ]
  })
}

resource "aws_s3_bucket" "data" {
  bucket = "my-sensitive-data-bucket"
  
  # Compliance Issue: SC-28 - No encryption at rest
  # Missing server_side_encryption_configuration
}

# Security Issue 5: Security misconfiguration (CWE-16)
resource "aws_security_group" "permissive" {
  name = "permissive-sg"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Security vulnerability: SSH open to world
  }
  
  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Security vulnerability: RDP open to world
  }
  
  # Compliance Issue: SC-07 - Overly permissive network access
}

# Security Issue 6: Sensitive data exposure (CWE-200)
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.data.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.data.id}"
  }
  
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.data.id}"
    
    viewer_protocol_policy = "allow-all"  # Security vulnerability: allows HTTP
  }
  
  # Compliance Issue: SC-23 - No session protection
  enabled = true
}

# Security Issue 7: Vulnerable components (CWE-1104)
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "my-cluster"
  engine               = "redis"
  engine_version       = "5.0.0"  # Security vulnerability: outdated version
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  
  # Compliance Issue: IA-05 - No authentication
  # Missing auth_token for Redis AUTH
}

# Security Issue 8: Insufficient logging (CWE-778)
resource "aws_api_gateway_rest_api" "main" {
  name = "my-api"
  
  # Compliance Issue: AU-02 - No audit logging
  # Missing access logging configuration
}

# Compliance Issue: CM-08 - No resource tagging for inventory
# Most resources missing required tags

variable "user_id" {
  description = "User ID for database query"
  type        = string
  # Security issue: No input validation
}
