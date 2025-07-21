# Test Terraform Configuration
resource "aws_security_group" "test" {
  name_description = "Test security group with hardcoded password"
  
  # FedRAMP AC-2 violation - hardcoded password
  password = "mypassword123"
  
  # FedRAMP SC-8 violation - unencrypted HTTP
  api_endpoint = "http://api.example.com"
  
  # FedRAMP AC-3 violation - overly permissive access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Too permissive
  }
  
  # FedRAMP SC-13 violation - encryption disabled
  encryption = false
}
