# Test Terraform file for compliance scanning
resource "aws_s3_bucket" "example" {
  bucket = "my-test-bucket"
  
  # Missing encryption configuration - should trigger compliance issues
}

resource "aws_ec2_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  
  # Missing security group configuration
  # Missing encrypted storage
  
  tags = {
    Name = "TestInstance"
  }
}

# Missing VPC configuration
# Missing IAM policies
# Missing logging configuration
