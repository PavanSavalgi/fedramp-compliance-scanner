import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { 
    SecurityVulnerability, 
    VulnerabilityIssue, 
    SecurityScanResult, 
    CombinedScanResult 
} from './vulnerabilityTypes';
import { VULNERABILITY_CHECKS } from './vulnerabilityDatabase';
import { ComplianceIssue } from './types';

export class SecurityScanner {
    private outputChannel: vscode.OutputChannel;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Security Scanner');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('security-vulnerabilities');
    }

    async scanFileForVulnerabilities(filePath: string): Promise<SecurityScanResult> {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const vulnerabilities: VulnerabilityIssue[] = [];
        const fileExtension = path.extname(filePath);

        // Get applicable vulnerability checks for this file type
        const applicableChecks = VULNERABILITY_CHECKS.filter(check => 
            check.fileTypes.includes(fileExtension)
        );

        for (const check of applicableChecks) {
            const checkVulnerabilities = this.performVulnerabilityCheck(filePath, lines, check);
            vulnerabilities.push(...checkVulnerabilities);
        }

        // Perform additional context-aware checks
        const contextVulnerabilities = this.performContextAwareChecks(filePath, content, fileExtension);
        vulnerabilities.push(...contextVulnerabilities);

        const riskScore = this.calculateRiskScore(vulnerabilities);

        return {
            file: filePath,
            vulnerabilities,
            riskScore
        };
    }

    private performVulnerabilityCheck(filePath: string, lines: string[], check: any): VulnerabilityIssue[] {
        const issues: VulnerabilityIssue[] = [];

        if (check.pattern) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(check.pattern);
                
                if (match) {
                    // Additional validation to reduce false positives
                    if (this.isValidVulnerability(line, check.vulnerability.id, filePath)) {
                        issues.push({
                            vulnerability: check.vulnerability,
                            file: filePath,
                            line: i + 1,
                            column: match.index || 0,
                            severity: check.vulnerability.severity,
                            message: this.generateVulnerabilityMessage(check.vulnerability, line),
                            context: line.trim(),
                            remediation: check.vulnerability.remediation,
                            cweId: check.vulnerability.cwe,
                            cveId: check.vulnerability.cve
                        });
                    }
                }
            }
        }

        return issues;
    }

    private isValidVulnerability(line: string, vulnerabilityId: string, filePath: string): boolean {
        const lowerLine = line.toLowerCase();
        
        switch (vulnerabilityId) {
            case 'HARDCODED_SECRETS':
                // Exclude common false positives
                return !this.isLikelyFalsePositiveSecret(line);
            
            case 'WEAK_ENCRYPTION':
                // Exclude references in comments or documentation
                return !lowerLine.includes('//') && !lowerLine.includes('#');
            
            case 'EXCESSIVE_PERMISSIONS':
                // Check for actual permission grants, not just mentions
                return lowerLine.includes('=') || lowerLine.includes(':');
            
            case 'INSECURE_PROTOCOLS':
                // Exclude documentation or comments
                return !lowerLine.includes('//') && !lowerLine.includes('#') && !lowerLine.includes('example');
            
            default:
                return true;
        }
    }

    private isLikelyFalsePositiveSecret(line: string): boolean {
        const lowerLine = line.toLowerCase();
        
        // Common false positives for secret detection
        const falsePositives = [
            'example', 'sample', 'test', 'demo', 'placeholder', 'changeme',
            'your_password', 'your_key', 'your_token', 'replace_me',
            'todo', 'fixme', 'xxx', 'yyy', 'zzz'
        ];
        
        return falsePositives.some(fp => lowerLine.includes(fp));
    }

    private performContextAwareChecks(filePath: string, content: string, fileExtension: string): VulnerabilityIssue[] {
        const issues: VulnerabilityIssue[] = [];
        
        // Terraform-specific checks
        if (fileExtension === '.tf' || fileExtension === '.hcl') {
            issues.push(...this.checkTerraformVulnerabilities(filePath, content));
        }
        
        // Kubernetes-specific checks
        if (fileExtension === '.yaml' || fileExtension === '.yml') {
            if (this.isKubernetesFile(content)) {
                issues.push(...this.checkKubernetesVulnerabilities(filePath, content));
            }
        }
        
        return issues;
    }

    private checkTerraformVulnerabilities(filePath: string, content: string): VulnerabilityIssue[] {
        const issues: VulnerabilityIssue[] = [];
        const lines = content.split('\n');
        
        // Check for S3 bucket public access
        if (content.includes('aws_s3_bucket_public_access_block')) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('false') && 
                   (line.includes('block_public_acls') || 
                    line.includes('block_public_policy') ||
                    line.includes('ignore_public_acls') ||
                    line.includes('restrict_public_buckets'))) {
                    
                    const vulnerability = VULNERABILITY_CHECKS.find(c => c.id === 'excessive_permissions')?.vulnerability;
                    if (vulnerability) {
                        issues.push({
                            vulnerability,
                            file: filePath,
                            line: i + 1,
                            column: 0,
                            severity: 'high',
                            message: 'S3 bucket allows public access',
                            context: line.trim(),
                            remediation: 'Set all public access block settings to true'
                        });
                    }
                }
            }
        }
        
        return issues;
    }

    private checkKubernetesVulnerabilities(filePath: string, content: string): VulnerabilityIssue[] {
        const issues: VulnerabilityIssue[] = [];
        const lines = content.split('\n');
        
        // Check for privileged containers
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('privileged: true')) {
                const vulnerability = VULNERABILITY_CHECKS.find(c => c.id === 'excessive_permissions')?.vulnerability;
                if (vulnerability) {
                    issues.push({
                        vulnerability,
                        file: filePath,
                        line: i + 1,
                        column: 0,
                        severity: 'critical',
                        message: 'Container running in privileged mode',
                        context: line.trim(),
                        remediation: 'Remove privileged access or use specific capabilities instead'
                    });
                }
            }
            
            // Check for root user
            if (line.includes('runAsUser: 0')) {
                const vulnerability = VULNERABILITY_CHECKS.find(c => c.id === 'excessive_permissions')?.vulnerability;
                if (vulnerability) {
                    issues.push({
                        vulnerability,
                        file: filePath,
                        line: i + 1,
                        column: 0,
                        severity: 'high',
                        message: 'Container running as root user',
                        context: line.trim(),
                        remediation: 'Use a non-root user ID'
                    });
                }
            }
        }
        
        return issues;
    }

    private isKubernetesFile(content: string): boolean {
        return content.includes('apiVersion:') && 
               (content.includes('kind:') || content.includes('metadata:'));
    }

    private generateVulnerabilityMessage(vulnerability: SecurityVulnerability, context: string): string {
        return `${vulnerability.title}: ${vulnerability.description}`;
    }

    private calculateRiskScore(vulnerabilities: VulnerabilityIssue[]): number {
        let score = 0;
        const weights = {
            critical: 25,
            high: 15,
            medium: 8,
            low: 3
        };
        
        for (const vuln of vulnerabilities) {
            score += weights[vuln.severity];
        }
        
        return Math.min(100, score);
    }

    public updateDiagnostics(fileUri: vscode.Uri, vulnerabilities: VulnerabilityIssue[]) {
        const diagnostics: vscode.Diagnostic[] = vulnerabilities.map(vuln => {
            const range = new vscode.Range(
                vuln.line - 1, 
                vuln.column, 
                vuln.line - 1, 
                vuln.column + 20
            );

            const severity = vuln.severity === 'critical' ? vscode.DiagnosticSeverity.Error :
                           vuln.severity === 'high' ? vscode.DiagnosticSeverity.Error :
                           vuln.severity === 'medium' ? vscode.DiagnosticSeverity.Warning :
                           vscode.DiagnosticSeverity.Information;

            const diagnostic = new vscode.Diagnostic(range, vuln.message, severity);
            diagnostic.source = 'Security Scanner';
            diagnostic.code = vuln.cweId || vuln.vulnerability.id;
            
            return diagnostic;
        });

        this.diagnosticCollection.set(fileUri, diagnostics);
    }

    public clearDiagnostics() {
        this.diagnosticCollection.clear();
    }

    public dispose() {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
    }
}
