# GDPR Test File for Compliance Scanner

This file contains specific GDPR violations that should be detected:

## Data Protection by Design (ART-25)
```yaml
DATA_ENCRYPTION = "false"
public_access = true
ANONYMIZE_DATA = "false"
```

## Security of Processing (ART-32)
```json
{
  "AUDIT_LOGGING": "disabled",
  "data_processing_location": "us-east-1",
  "backup_location": "asia-south-1"
}
```
AUDIT_LOGGING = "disabled"
data_processing_location: "us-east-1"
backup_location: "asia-south-1"

## Right to Erasure (ART-17)
```terraform
data_deletion_policy = "never"
access_request = "disabled"
```

## Lawfulness of Processing (ART-6)
```yaml
user_emails: |
  user1@example.com
  user2@example.com
customer_profiles:
  - "email": "test@example.com"
```
