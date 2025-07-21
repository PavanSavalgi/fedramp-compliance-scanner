resource "aws_s3_bucket" "example" {
  bucket = "my-test-bucket"
}

# This Terraform file contains intentional FedRAMP compliance violations for testing:

# Violation 1: Missing encryption at rest (SC-13)
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id
  # Missing encryption configuration - FedRAMP violation
}

# Violation 2: Hardcoded credentials (AC-2) 
resource "aws_db_instance" "example" {
  username = "admin"
  password = "hardcoded_password_123"  # FedRAMP violation
  port     = 3306
}

# Violation 3: Unencrypted communications (SC-8)
resource "aws_load_balancer_listener" "example" {
  port     = "80"
  protocol = "HTTP"  # Should be HTTPS for FedRAMP compliance
}

# Violation 4: Missing access logging (AU-2)
resource "aws_cloudtrail" "example" {
  name = "example-trail"
  # Missing logging configuration - FedRAMP violation
}

# Violation 5: Overly permissive access (AC-3)
resource "aws_iam_policy" "example" {
  policy = jsonencode({
    Statement = [{
      Effect = "Allow"
      Action = "*"  # Too permissive for FedRAMP
      Resource = "*"
    }]
  })
}
