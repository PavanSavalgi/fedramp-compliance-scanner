# Sample Infrastructure as Code files for testing FedRAMP Compliance Scanner

This directory contains sample IaC files that demonstrate various compliance issues that the FedRAMP Compliance Scanner can detect.

## Files

- `sample-terraform.tf` - Terraform configuration with various compliance issues
- `sample-cloudformation.yaml` - CloudFormation template with security concerns
- `sample-kubernetes.yaml` - Kubernetes deployment with compliance violations

## Testing the Extension

1. Open this workspace in VS Code
2. Run the command "FedRAMP: Scan Workspace" from the Command Palette
3. Review the issues found in the FedRAMP Compliance tree view
4. Generate a report using "FedRAMP: Generate Report"

## Expected Issues

The sample files contain intentional compliance violations to demonstrate the scanner's capabilities:

- Unencrypted storage
- Overly permissive network access
- Missing authentication
- Insecure transmission
- Insufficient logging/monitoring
