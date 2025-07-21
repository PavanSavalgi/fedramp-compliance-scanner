# Sample Terraform configuration with compliance issues for demonstration

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  
  # This will trigger AC-3 violation - overly permissive
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # This will trigger SC-8 violation - unencrypted HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier = "main-database"
  engine     = "mysql"
  
  # This will trigger SC-13 violation - encryption disabled
  storage_encrypted = false
  
  # This will trigger AC-2 violation - hardcoded password
  password = "mypassword123"
}

# Configuration pointing to unencrypted endpoint
variable "api_endpoint" {
  default = "http://api.example.com/v1"
}
