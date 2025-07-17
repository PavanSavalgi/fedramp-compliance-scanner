import * as vscode from 'vscode';
import { ComplianceIssue } from './types';

export interface RemediationSuggestion {
    id: string;
    title: string;
    description: string;
    autoFixable: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    codeAction?: vscode.CodeAction;
    terraformFix?: string;
    yamlFix?: string;
    jsonFix?: string;
    documentationUrl?: string;
    priority: 'high' | 'medium' | 'low';
}

export class AutoRemediationEngine {
    private remediationTemplates: Map<string, RemediationSuggestion> = new Map();

    constructor() {
        this.initializeRemediationTemplates();
    }

    private initializeRemediationTemplates(): void {
        // FedRAMP Access Control Remediations
        this.remediationTemplates.set('root-user-usage', {
            id: 'root-user-usage',
            title: 'Replace root user with service account',
            description: 'Using root user directly violates FedRAMP AC-2 (Account Management). Create dedicated service accounts.',
            autoFixable: true,
            difficulty: 'easy',
            estimatedTime: '5 minutes',
            priority: 'high',
            terraformFix: `
# Replace root user with dedicated service account
resource "aws_iam_user" "service_account" {
  name = "application-service-user"
  path = "/service-accounts/"
  
  tags = {
    Purpose = "Application Service Account"
    Compliance = "FedRAMP-AC-2"
  }
}

resource "aws_iam_user_policy" "service_policy" {
  name = "service-account-policy"
  user = aws_iam_user.service_account.name
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          # Specify only required permissions (least privilege)
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "\${aws_s3_bucket.example.arn}/*"
        ]
      }
    ]
  })
}`,
            documentationUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'
        });

        this.remediationTemplates.set('hardcoded-password', {
            id: 'hardcoded-password',
            title: 'Remove hardcoded passwords',
            description: 'Hardcoded passwords violate FedRAMP AC-2 and IA-2. Use AWS Secrets Manager or environment variables.',
            autoFixable: true,
            difficulty: 'medium',
            estimatedTime: '10 minutes',
            priority: 'high',
            terraformFix: `
# Use AWS Secrets Manager for sensitive data
resource "aws_secretsmanager_secret" "db_password" {
  name = "application/database/password"
  description = "Database password for application"
  
  tags = {
    Compliance = "FedRAMP-IA-2"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    password = var.database_password  # Use variable instead of hardcoded value
  })
}

# Reference the secret in your resource
resource "aws_db_instance" "example" {
  # ... other configuration ...
  password = jsondecode(aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}`,
            documentationUrl: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html'
        });

        this.remediationTemplates.set('unencrypted-storage', {
            id: 'unencrypted-storage',
            title: 'Enable encryption at rest',
            description: 'Storage encryption is required by FedRAMP SC-28 (Protection of Information at Rest).',
            autoFixable: true,
            difficulty: 'easy',
            estimatedTime: '5 minutes',
            priority: 'high',
            terraformFix: `
# Enable S3 bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.example.arn
    }
    bucket_key_enabled = true
  }
}

# Create KMS key for encryption
resource "aws_kms_key" "example" {
  description             = "KMS key for S3 bucket encryption"
  deletion_window_in_days = 7
  
  tags = {
    Compliance = "FedRAMP-SC-28"
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/s3/latest/userguide/bucket-encryption.html'
        });

        this.remediationTemplates.set('overprivileged-access', {
            id: 'overprivileged-access',
            title: 'Apply least privilege principle',
            description: 'Overprivileged access violates FedRAMP AC-6 (Least Privilege). Restrict permissions to minimum required.',
            autoFixable: true,
            difficulty: 'medium',
            estimatedTime: '15 minutes',
            priority: 'high',
            terraformFix: `
# Replace overprivileged policy with specific permissions
resource "aws_iam_policy" "least_privilege_policy" {
  name        = "application-specific-policy"
  description = "Least privilege policy for application"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          # Specify only required actions instead of "*"
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          # Limit to specific resources
          "\${aws_s3_bucket.app_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.app_bucket.arn
        ]
      }
    ]
  })
  
  tags = {
    Compliance = "FedRAMP-AC-6"
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege'
        });

        this.remediationTemplates.set('missing-audit-logging', {
            id: 'missing-audit-logging',
            title: 'Enable comprehensive audit logging',
            description: 'Audit logging is required by FedRAMP AU-2 (Auditable Events) and AU-3 (Content of Audit Records).',
            autoFixable: true,
            difficulty: 'medium',
            estimatedTime: '10 minutes',
            priority: 'high',
            terraformFix: `
# Enable CloudTrail for API logging
resource "aws_cloudtrail" "audit_trail" {
  name           = "fedramp-audit-trail"
  s3_bucket_name = aws_s3_bucket.audit_logs.bucket

  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true

  event_selector {
    read_write_type                 = "All"
    include_management_events       = true
    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::*/*"]
    }
  }

  tags = {
    Compliance = "FedRAMP-AU-2"
  }
}

# S3 bucket for audit logs
resource "aws_s3_bucket" "audit_logs" {
  bucket        = "fedramp-audit-logs-\${random_id.bucket_suffix.hex}"
  force_destroy = false
}

resource "aws_s3_bucket_versioning" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html'
        });

        this.remediationTemplates.set('unencrypted-transit', {
            id: 'unencrypted-transit',
            title: 'Enable encryption in transit',
            description: 'Data transmission encryption is required by FedRAMP SC-8 (Transmission Confidentiality and Integrity).',
            autoFixable: true,
            difficulty: 'easy',
            estimatedTime: '5 minutes',
            priority: 'high',
            terraformFix: `
# Enable HTTPS for ALB
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.example.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.example.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.example.arn
  }
}

# Redirect HTTP to HTTPS
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.example.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html'
        });

        this.remediationTemplates.set('weak-network-security', {
            id: 'weak-network-security',
            title: 'Strengthen network security',
            description: 'Network boundary protection is required by FedRAMP SC-7 (Boundary Protection).',
            autoFixable: true,
            difficulty: 'medium',
            estimatedTime: '10 minutes',
            priority: 'high',
            terraformFix: `
# Restrictive security group instead of allowing all traffic
resource "aws_security_group" "app_sg" {
  name_prefix = "fedramp-app-sg"
  vpc_id      = aws_vpc.main.id

  # Allow HTTPS from specific sources only
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # Restrict to private networks
    description = "HTTPS from private networks"
  }

  # Allow SSH from bastion host only
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "SSH from bastion host"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Compliance = "FedRAMP-SC-7"
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html'
        });

        this.remediationTemplates.set('missing-backup', {
            id: 'missing-backup',
            title: 'Implement automated backup',
            description: 'Data backup is required by FedRAMP CP-9 (Information System Backup).',
            autoFixable: true,
            difficulty: 'medium',
            estimatedTime: '15 minutes',
            priority: 'medium',
            terraformFix: `
# Enable automated EBS snapshots
resource "aws_dlm_lifecycle_policy" "ebs_backup" {
  description        = "EBS snapshot lifecycle policy"
  execution_role_arn = aws_iam_role.dlm_lifecycle_role.arn
  state              = "ENABLED"

  policy_details {
    resource_types   = ["VOLUME"]
    target_tags = {
      Backup = "Required"
    }

    schedule {
      name = "Daily Snapshots"

      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["03:00"]
      }

      retain_rule {
        count = 30  # Retain snapshots for 30 days
      }

      copy_tags = true

      tags_to_add = {
        Compliance = "FedRAMP-CP-9"
        AutomatedBackup = "True"
      }
    }
  }

  tags = {
    Compliance = "FedRAMP-CP-9"
  }
}`,
            documentationUrl: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/snapshot-lifecycle.html'
        });
    }

    public suggestFix(violation: ComplianceIssue): RemediationSuggestion | null {
        // Map violation patterns to remediation templates
        const violationKey = this.mapViolationToKey(violation);
        
        if (this.remediationTemplates.has(violationKey)) {
            return this.remediationTemplates.get(violationKey)!;
        }

        // Generate generic remediation if no specific template exists
        return this.generateGenericRemediation(violation);
    }

    private mapViolationToKey(violation: ComplianceIssue): string {
        const message = violation.message?.toLowerCase() || '';
        const control = violation.control?.toLowerCase() || '';

        if (message.includes('root user') || message.includes('root access')) {
            return 'root-user-usage';
        }
        if (message.includes('hardcoded password') || message.includes('password')) {
            return 'hardcoded-password';
        }
        if (message.includes('encryption') && message.includes('rest')) {
            return 'unencrypted-storage';
        }
        if (message.includes('administratoraccess') || message.includes('overprivileged')) {
            return 'overprivileged-access';
        }
        if (message.includes('audit') && message.includes('log')) {
            return 'missing-audit-logging';
        }
        if (message.includes('encryption') && message.includes('transit')) {
            return 'unencrypted-transit';
        }
        if (message.includes('security group') || message.includes('0.0.0.0/0')) {
            return 'weak-network-security';
        }
        if (message.includes('backup') || control.includes('cp-9')) {
            return 'missing-backup';
        }

        return 'generic';
    }

    private generateGenericRemediation(violation: ComplianceIssue): RemediationSuggestion {
        return {
            id: 'generic-remediation',
            title: `Fix ${violation.control} violation`,
            description: violation.remediation || `Address compliance violation: ${violation.message}`,
            autoFixable: false,
            difficulty: 'medium',
            estimatedTime: '30 minutes',
            priority: violation.severity === 'error' ? 'high' : 'medium',
            documentationUrl: `https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=${violation.control}`
        };
    }

    public createCodeAction(violation: ComplianceIssue, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | null {
        const remediation = this.suggestFix(violation);
        if (!remediation || !remediation.autoFixable) {
            return null;
        }

        const action = new vscode.CodeAction(
            `🔧 ${remediation.title}`,
            vscode.CodeActionKind.QuickFix
        );

        action.diagnostics = [];
        action.isPreferred = remediation.priority === 'high';

        // Determine the appropriate fix based on file type
        let fixCode = '';
        const fileName = document.fileName.toLowerCase();
        
        if (fileName.endsWith('.tf') && remediation.terraformFix) {
            fixCode = remediation.terraformFix;
        } else if ((fileName.endsWith('.yaml') || fileName.endsWith('.yml')) && remediation.yamlFix) {
            fixCode = remediation.yamlFix;
        } else if (fileName.endsWith('.json') && remediation.jsonFix) {
            fixCode = remediation.jsonFix;
        }

        if (fixCode) {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, range, fixCode);
            action.edit = edit;
        }

        return action;
    }

    public async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): Promise<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source === 'FedRAMP Compliance') {
                // Create a mock violation from the diagnostic
                const violation: ComplianceIssue = {
                    control: diagnostic.code?.toString() || '',
                    check: diagnostic.code?.toString() || '',
                    message: diagnostic.message,
                    severity: this.mapDiagnosticSeverity(diagnostic.severity),
                    file: document.fileName,
                    line: range.start.line + 1,
                    column: range.start.character,
                    remediation: diagnostic.relatedInformation?.[0]?.message.replace('Remediation: ', '') || ''
                };

                const codeAction = this.createCodeAction(violation, document, range);
                if (codeAction) {
                    actions.push(codeAction);
                }

                // Add "Learn More" action
                const learnMoreAction = new vscode.CodeAction(
                    '📚 Learn More',
                    vscode.CodeActionKind.Empty
                );
                
                const remediation = this.suggestFix(violation);
                if (remediation?.documentationUrl) {
                    learnMoreAction.command = {
                        title: 'Open Documentation',
                        command: 'vscode.open',
                        arguments: [vscode.Uri.parse(remediation.documentationUrl)]
                    };
                    actions.push(learnMoreAction);
                }
            }
        }

        return actions;
    }

    private mapDiagnosticSeverity(severity: vscode.DiagnosticSeverity): 'error' | 'warning' | 'info' {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'error';
            case vscode.DiagnosticSeverity.Warning:
                return 'warning';
            case vscode.DiagnosticSeverity.Information:
                return 'info';
            default:
                return 'info';
        }
    }

    public getAllRemediations(): RemediationSuggestion[] {
        return Array.from(this.remediationTemplates.values());
    }

    public getRemediationsByPriority(priority: 'high' | 'medium' | 'low'): RemediationSuggestion[] {
        return this.getAllRemediations().filter(r => r.priority === priority);
    }

    public getAutoFixableRemediations(): RemediationSuggestion[] {
        return this.getAllRemediations().filter(r => r.autoFixable);
    }
}

// Code Action Provider for VS Code
export class ComplianceCodeActionProvider implements vscode.CodeActionProvider {
    private remediationEngine: AutoRemediationEngine;

    constructor() {
        this.remediationEngine = new AutoRemediationEngine();
    }

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        return this.remediationEngine.provideCodeActions(document, range, context);
    }
}

// Function to register the code action provider
export function registerAutoRemediation(context: vscode.ExtensionContext): void {
    const provider = new ComplianceCodeActionProvider();
    
    const registration = vscode.languages.registerCodeActionsProvider(
        [
            { language: 'terraform', scheme: 'file' },
            { language: 'yaml', scheme: 'file' },
            { language: 'json', scheme: 'file' },
            { language: 'hcl', scheme: 'file' }
        ],
        provider,
        {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }
    );

    context.subscriptions.push(registration);

    // Register command to show all available remediations
    const showRemediationsCommand = vscode.commands.registerCommand(
        'fedramp.showRemediations',
        () => {
            const engine = new AutoRemediationEngine();
            const remediations = engine.getAllRemediations();
            
            const items = remediations.map(r => ({
                label: r.title,
                description: r.description,
                detail: `${r.difficulty} • ${r.estimatedTime} • ${r.autoFixable ? 'Auto-fixable' : 'Manual'}`,
                remediation: r
            }));

            vscode.window.showQuickPick(items, {
                placeHolder: 'Select a remediation to learn more',
                matchOnDescription: true
            }).then(selected => {
                if (selected && selected.remediation.documentationUrl) {
                    vscode.env.openExternal(vscode.Uri.parse(selected.remediation.documentationUrl));
                }
            });
        }
    );

    context.subscriptions.push(showRemediationsCommand);
}
