# False Positive Test Cases for FedRAMP Compliance Scanner

## Test scenarios that should NOT trigger warnings

### 1. HTTP in Comments and Documentation
# This is a comment about http://example.com - should not trigger SC-8
<!-- Documentation referencing http://internal-docs.com -->
* See http://company-wiki.com for more details

### 2. HTTP in Variable Names and Configuration Keys
http_timeout = 30
http_proxy_enabled = false
http_client_version = "2.1"
httpd_config_path = "/etc/httpd"

### 3. Legitimate Network Configuration
# Public IP for load balancer
public_ip_range = "203.0.113.0/24"  # Specific public range
public_ip_allocation = "static"
# Default route for internet access
default_route = "0.0.0.0/0"
internet_gateway_route = "0.0.0.0/0"

### 4. Encryption Configuration Examples
encryption_at_rest = false  # Legacy system exception
enable_encryption = false   # Development environment
# Documented exception: encryption = false for performance testing

### 5. Legitimate File Paths and Object Names
object_key = "logs/app/2024/http_access.log"
file_path = "http-client/src/main.go"
cache_key = "http_responses_cache"

### 6. Environment and Configuration References  
database_password = var.db_password
api_secret = data.aws_secretsmanager_secret.api.secret_string
auth_token = process.env.AUTH_TOKEN

### 7. Documentation and Field Names
password_field = "user_password"
password_policy_name = "strong_passwords"
password_complexity_rules = ["uppercase", "numbers"]
