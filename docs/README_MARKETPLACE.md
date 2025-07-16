# FedRAMP Compliance Scanner

A comprehensive VS Code extension for scanning Infrastructure as Code (IaC) files and Git repositories for FedRAMP compliance and security vulnerabilities across 9 international compliance standards.

## Features

- **Multi-Standard Compliance**: Support for FedRAMP, GDPR, HIPAA, PCI-DSS, ISO-27001, and more
- **Individual Reports**: Generate focused reports for specific compliance standards
- **Security Scanning**: Comprehensive vulnerability detection based on OWASP Top 10
- **Visual Themes**: Each compliance standard has its own unique color theme
- **Export Options**: HTML, JSON, and Markdown formats

## Quick Start

1. Install the extension
2. Open a workspace with IaC files (Terraform, CloudFormation, Kubernetes)
3. Use `Ctrl+Shift+P` and type "FedRAMP: Scan Workspace"
4. Generate reports with "FedRAMP: Generate [Standard] Report"

## Supported File Types

- Terraform (.tf, .hcl)
- CloudFormation (.yaml, .yml, .json)
- Kubernetes manifests
- Docker configurations

## License

MIT License - see LICENSE file for details.
