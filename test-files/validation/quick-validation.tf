# Quick False Positive Validation Test

# These HTTP patterns should NOT trigger warnings:
# See documentation at http://example.com/docs
description = "API endpoint: http://internal.service.com"
http_endpoint_config = var.endpoint_url
health_check_url = "http://localhost:8080/health"

# These network patterns should NOT trigger warnings:
variable "public_ip" {
  description = "Public IP for load balancer"
}
output "instance_public_ip" {
  value = aws_instance.web.public_ip
}
# Load balancer requires 0.0.0.0/0 for public access

# These encryption patterns should NOT trigger warnings:
# encryption = false for development testing
description = "Set encryption to false for local development"
dev_encryption_disabled = false

# ===================================================================
# THESE SHOULD STILL TRIGGER WARNINGS (True Positives):

resource "aws_instance" "bad_example" {
  # This should trigger a credential warning
  password = "hardcoded123456"
  
  # This should trigger HTTP warning (not in comment)
  api_endpoint = "http://unsecure-api.example.com"
  
  # This should trigger network warning (not in acceptable context)
  ingress {
    from_port = 22
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # This should trigger encryption warning (not in acceptable context)  
  root_block_device {
    encrypted = false
  }
}
