# Sample with Security Vulnerabilities and Compliance Issues

resource "aws_db_instance" "vulnerable_db" {
  identifier = "vulnerable-db"
  engine     = "mysql"
  
  # SECURITY VULNERABILITY: Hardcoded password (CWE-798)
  password = "hardcodedpassword123"
  
  # SECURITY VULNERABILITY: Weak encryption (deprecated algorithm)
  kms_key_id = "alias/deprecated-des-key"
  
  # COMPLIANCE ISSUE: No encryption at rest (SC-28)
  storage_encrypted = false
  
  # SECURITY VULNERABILITY: Excessive permissions (publicly accessible)
  publicly_accessible = true
}

resource "aws_security_group" "vulnerable_sg" {
  name_prefix = "vulnerable-sg"
  
  ingress {
    # SECURITY VULNERABILITY & COMPLIANCE ISSUE: Excessive permissions (AC-3)
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allows SSH from anywhere
  }
  
  ingress {
    # SECURITY VULNERABILITY: Insecure protocol (HTTP instead of HTTPS)
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_s3_bucket" "vulnerable_bucket" {
  bucket = "my-vulnerable-bucket"
  
  # SECURITY VULNERABILITY: Weak encryption algorithm
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "DES"  # Deprecated encryption
      }
    }
  }
}

resource "aws_iam_user" "vulnerable_user" {
  name = "admin"
  
  # SECURITY VULNERABILITY: Default/weak credential
  password = "admin"  # Weak password
}

resource "aws_lambda_function" "vulnerable_lambda" {
  function_name = "vulnerable-function"
  
  environment {
    variables = {
      # SECURITY VULNERABILITY: Hardcoded API key
      API_KEY = "sk-1234567890abcdef"
      
      # SECURITY VULNERABILITY: Hardcoded secret
      DATABASE_PASSWORD = "supersecretpassword"
      
      # SECURITY VULNERABILITY: Command injection potential
      SHELL_COMMAND = "exec(${user_input})"
    }
  }
}

# SECURITY VULNERABILITY: Insecure protocol configuration
resource "aws_lb_listener" "vulnerable_listener" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"  # Should be HTTPS
  
  default_action {
    type = "redirect"
    redirect {
      protocol    = "HTTP"  # Insecure redirect
      port        = "80"
      status_code = "HTTP_301"
    }
  }
}
