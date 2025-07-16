# Copilot Instructions for FedRAMP Compliance Scanner Extension

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Overview
This VS Code extension is designed to scan Infrastructure as Code (IaC) files and Git repositories for FedRAMP compliance. The extension should provide:

1. **FedRAMP Compliance Scanning**: Analyze IaC files (Terraform, CloudFormation, Kubernetes YAML, etc.) for compliance with FedRAMP security controls
2. **Compliance Level Selection**: Allow users to select Low, Medium, or High FedRAMP impact levels
3. **Report Generation**: Generate detailed compliance reports using Copilot AI
4. **Git Repository Integration**: Scan entire repositories for compliance issues
5. **VS Code Integration**: Provide commands, views, and user interface elements

## Key Features to Implement
- Command palette commands for scanning
- Tree view for displaying compliance results
- Webview panels for detailed reports
- Configuration settings for compliance levels
- File decorations and diagnostics for compliance issues
- Integration with Git for repository-wide scanning

## FedRAMP Security Controls to Check
- Access Control (AC)
- Audit and Accountability (AU)
- Configuration Management (CM)
- Contingency Planning (CP)
- Identification and Authentication (IA)
- Incident Response (IR)
- Risk Assessment (RA)
- System and Communications Protection (SC)
- System and Information Integrity (SI)

## Technologies
- TypeScript
- VS Code Extension API
- Node.js for file system operations
- Git integration for repository scanning
- Copilot API for report generation
