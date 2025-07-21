// Test script to validate false positive detection improvements
const fs = require('fs');
const path = require('path');

// Test cases that should NOT trigger warnings (false positives)
const testCases = [
    // HTTP in comments and documentation
    "# This is a comment about http://example.com",
    "// Documentation link: http://docs.example.com",
    "/* Block comment with http://internal.example.com */",
    "description = 'See http://example.com for more info'",
    
    // Variable names with HTTP
    "http_endpoint_url = var.endpoint_url",
    "my_http_config = local.http_settings",
    "service_http_port = 8080",
    
    // Network configurations that are legitimate
    "# public_ip configuration for load balancer",
    "variable 'public_ip' { description = 'Public IP for NAT gateway' }",
    "output 'instance_public_ip' { value = aws_instance.web.public_ip }",
    "data 'aws_eip' 'public_ip' { ... }",
    
    // Load balancer and health check configurations
    "health_check { protocol = 'HTTP', path = '/' }",
    "load_balancer_type = 'application'  # Requires 0.0.0.0/0 for public access",
    
    // Encryption in acceptable contexts
    "# encryption = false for development environment",
    "description = 'Set encryption to false for testing'",
    "example_encryption_disabled = false",
    "local_dev_encryption = false  # OK for local development",
];

// Test cases that SHOULD trigger warnings (true positives)
const shouldTrigger = [
    "password = 'hardcoded123'",
    "secret_key = 'abcd1234567890efgh'",
    "http://unsecure.example.com/api/data",  // Not in comment
    "cidr_blocks = ['0.0.0.0/0']",  // Not in acceptable context
    "encryption = false",  // Not in acceptable context
];

console.log('=== FALSE POSITIVE TEST CASES ===');
console.log('These should NOT trigger warnings:');
testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase}`);
});

console.log('\n=== TRUE POSITIVE TEST CASES ===');
console.log('These SHOULD trigger warnings:');
shouldTrigger.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase}`);
});

// Write test cases to a Terraform file for testing
const terraformContent = `
# False Positive Test Cases - These should NOT trigger warnings

${testCases.map((tc, i) => `# Test case ${i + 1}\n${tc}`).join('\n\n')}

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
`;

fs.writeFileSync(path.join(__dirname, 'test-validation.tf'), terraformContent);
console.log('\n✅ Created test-validation.tf for manual testing in VS Code');
console.log('📝 Open this file in VS Code to see if false positives are eliminated');
