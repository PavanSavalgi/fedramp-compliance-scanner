# Sample Terraform configuration with compliance issues

resource "aws_s3_bucket" "example" {
  bucket = "my-example-bucket"
}

# This will trigger AC-2 violation - hardcoded password
variable "database_password" {
  default = "password123"  # Hardcoded password detected
}

# This will trigger SC-8 violation - HTTP connection
resource "aws_api_gateway_rest_api" "example" {
  name = "example-api"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "example" {
  rest_api_id = aws_api_gateway_rest_api.example.id
  
  # Unencrypted HTTP connection
  stage_name = "dev"
  
  variables = {
    api_url = "http://api.example.com"  # HTTP instead of HTTPS
  }
}

# This will trigger AC-3 violation - overly permissive access
resource "aws_security_group" "web" {
  name_prefix = "web-"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Overly permissive network access
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Another overly permissive rule
  }
}

# This will trigger SC-13 violation - encryption disabled
resource "aws_rds_instance" "example" {
  allocated_storage    = 10
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  name                 = "mydb"
  username             = "foo"
  password             = var.database_password
  storage_encrypted    = false  # Encryption disabled
  skip_final_snapshot  = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
