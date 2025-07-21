# Test Cases for Enhanced Password Detection

## ✅ **Should NOT be flagged (False Positive Prevention):**

### AWS Secrets Manager (Secure)
password = data.aws_secretsmanager_secret_version.db_password.secret_string
password = aws_secretsmanager_secret.my_secret.arn
db_password = data.aws_secretsmanager_secret.database.secret_string

### Environment Variables (Secure)
password = process.env.DB_PASSWORD
password = os.getenv("DATABASE_PASSWORD")  
password = var.database_password
password = local.encrypted_password

### CloudFormation References (Secure)
password: !Ref DatabasePassword
password: "{{resolve:secretsmanager:db-secret:password}}"
password: ${SECRET_PASSWORD}

### Configuration Fields (Not Values)
password_field_name = "password"
password_length = 16
password_policy = "strong"
random_password = true

### Generated/Dynamic (Secure)
password = random_password.db.result
password = base64decode(var.encrypted_password)
password = decrypt(local.encrypted_value)

## ❌ **Should be flagged (True Positives):**

### Hardcoded String Literals
password = "hardcoded123"
password = 'mysecretpassword'
db_password = "admin"
api_key = "sk_live_abcd1234567890"

### Common Weak Passwords
password = "admin"
password = "password"
pwd = "123456"
password = "root"

### API Keys/Tokens
token = "jwt_example_token_here"
api_key = "ak_example123456789abc"
secret = "EXAMPLE1234567890ABC"
