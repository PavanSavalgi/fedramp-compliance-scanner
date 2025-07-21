
# False Positive Test Cases - These should NOT trigger warnings

# Test case 1
# This is a comment about http://example.com

# Test case 2
// Documentation link: http://docs.example.com

# Test case 3
/* Block comment with http://internal.example.com */

# Test case 4
description = 'See http://example.com for more info'

# Test case 5
http_endpoint_url = var.endpoint_url

# Test case 6
my_http_config = local.http_settings

# Test case 7
service_http_port = 8080

# Test case 8
# public_ip configuration for load balancer

# Test case 9
variable 'public_ip' { description = 'Public IP for NAT gateway' }

# Test case 10
output 'instance_public_ip' { value = aws_instance.web.public_ip }

# Test case 11
data 'aws_eip' 'public_ip' { ... }

# Test case 12
health_check { protocol = 'HTTP', path = '/' }

# Test case 13
load_balancer_type = 'application'  # Requires 0.0.0.0/0 for public access

# Test case 14
# encryption = false for development environment

# Test case 15
description = 'Set encryption to false for testing'

# Test case 16
example_encryption_disabled = false

# Test case 17
local_dev_encryption = false  # OK for local development

# True Positive Test Cases - These SHOULD trigger warnings
resource "aws_instance" "test" {
  # Actual security issues that should be flagged
  password = "hardcoded123"
  secret_key = "abcd1234567890efgh"
  
  # Unencrypted HTTP (not in comment)
  health_check_url = "http://unsecure.example.com/health"
  
  # Overly permissive network access (not in acceptable context)
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Encryption disabled (not in acceptable context)
  root_block_device {
    encrypted = false
  }
}
