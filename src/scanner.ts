import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FedRAMPLevel, ComplianceIssue, ComplianceReport, ScanResult, ComplianceStandard } from './types';
import { FEDRAMP_CONTROLS, getControlsByLevel } from './controls';
import { GlobalComplianceControls } from './globalComplianceControls';
import { SecurityScanner } from './securityScanner';
import { CombinedScanResult, VulnerabilityIssue } from './vulnerabilityTypes';

export class ComplianceScanner {
    private outputChannel: vscode.OutputChannel;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private securityScanner: SecurityScanner;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('FedRAMP Compliance');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
        this.securityScanner = new SecurityScanner();
    }

    async scanWorkspace(): Promise<ComplianceReport> {
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const level = config.get<FedRAMPLevel>('level', FedRAMPLevel.Moderate);
        const complianceStandards = config.get<ComplianceStandard[]>('complianceStandards', ['FedRAMP']);
        const includePatterns = config.get<string[]>('includePatterns', ['**/*.tf', '**/*.yaml', '**/*.yml', '**/*.json']);
        const excludePatterns = config.get<string[]>('excludePatterns', ['**/node_modules/**', '**/vendor/**', '**/.git/**']);
        const enableSecurityScan = config.get<boolean>('enableSecurityScan', true);

        this.outputChannel.appendLine(`Starting compliance scan for standards: ${complianceStandards.join(', ')} with security vulnerability detection...`);
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        const allIssues: ComplianceIssue[] = [];
        const allVulnerabilities: VulnerabilityIssue[] = [];
        let totalFiles = 0;
        let scannedFiles = 0;

        for (const folder of workspaceFolders) {
            for (const pattern of includePatterns) {
                const files = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folder, pattern),
                    new vscode.RelativePattern(folder, `{${excludePatterns.join(',')}}`)
                );

                totalFiles += files.length;

                for (const file of files) {
                    try {
                        // Run compliance scan for all selected standards
                        const complianceResult = await this.scanFile(file.fsPath, level, complianceStandards);
                        allIssues.push(...complianceResult.issues);
                        
                        // Run security vulnerability scan
                        if (enableSecurityScan) {
                            const securityResult = await this.securityScanner.scanFileForVulnerabilities(file.fsPath);
                            allVulnerabilities.push(...securityResult.vulnerabilities);
                            
                            // Update security diagnostics
                            this.securityScanner.updateDiagnostics(file, securityResult.vulnerabilities);
                        }
                        
                        scannedFiles++;
                        
                        // Update compliance diagnostics
                        this.updateDiagnostics(file, complianceResult.issues);
                    } catch (error) {
                        this.outputChannel.appendLine(`Error scanning ${file.fsPath}: ${error}`);
                    }
                }
            }
        }

        const report = this.generateCombinedReport(level, complianceStandards, totalFiles, scannedFiles, allIssues, allVulnerabilities);
        this.outputChannel.appendLine(`Scan completed. Found ${allIssues.length} compliance issues and ${allVulnerabilities.length} security vulnerabilities.`);
        
        return report;
    }

    async scanFile(filePath: string, level?: FedRAMPLevel, standards?: ComplianceStandard[]): Promise<ScanResult> {
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const complianceLevel = level || config.get<FedRAMPLevel>('level', FedRAMPLevel.Moderate);
        const complianceStandards = standards || config.get<ComplianceStandard[]>('complianceStandards', ['FedRAMP']);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const issues: ComplianceIssue[] = [];
        const fileExtension = path.extname(filePath);

        // Get controls for all selected standards
        for (const standard of complianceStandards) {
            let controls;
            
            if (standard === 'FedRAMP') {
                controls = getControlsByLevel(complianceLevel);
            } else {
                controls = GlobalComplianceControls.getControlsByStandard(standard);
            }

            for (const control of controls) {
                for (const check of control.checks) {
                    if (check.fileTypes && check.fileTypes.includes(fileExtension)) {
                        const checkIssues = this.performCheck(filePath, lines, control.id, check);
                        issues.push(...checkIssues);
                    }
                }
            }
        }

        return {
            file: filePath,
            issues,
            compliant: issues.filter(i => i.severity === 'error').length === 0
        };
    }

    private performCheck(filePath: string, lines: string[], controlId: string, check: any): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];

        if (check.pattern) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(check.pattern);
                
                if (match) {
                    // This is a simplified check - in a real implementation, you'd have more sophisticated rules
                    // For now, we'll create issues based on certain patterns that might indicate non-compliance
                    
                    // Example: Check for insecure configurations
                    if (this.isInsecureConfiguration(line, controlId)) {
                        issues.push({
                            control: controlId,
                            check: check.id,
                            file: filePath,
                            line: i + 1,
                            column: match.index || 0,
                            severity: check.severity,
                            message: `${check.description}: ${this.getIssueMessage(controlId, line)}`,
                            remediation: check.remediation
                        });
                    }
                }
            }
        }

        return issues;
    }

    private isInsecureConfiguration(line: string, controlId: string): boolean {
        const lowerLine = line.toLowerCase();
        
        switch (controlId) {
            case 'SC-8':
                // Check for HTTP instead of HTTPS
                return lowerLine.includes('http:') || lowerLine.includes('ssl = false') || lowerLine.includes('encryption = false');
            
            case 'SC-28':
                // Check for unencrypted storage
                return lowerLine.includes('encrypted = false') || lowerLine.includes('encryption: false');
            
            case 'AC-3':
                // Check for overly permissive access
                return lowerLine.includes('0.0.0.0/0') || lowerLine.includes('*');
            
            case 'IA-2':
                // Check for missing authentication
                return lowerLine.includes('anonymous') || lowerLine.includes('public');
            
            default:
                return false;
        }
    }

    private getIssueMessage(controlId: string, line: string): string {
        switch (controlId) {
            case 'SC-8':
                return 'Insecure transmission detected - use HTTPS/TLS';
            case 'SC-28':
                return 'Unencrypted storage detected - enable encryption at rest';
            case 'AC-3':
                return 'Overly permissive access detected - restrict access';
            case 'IA-2':
                return 'Anonymous or public access detected - implement authentication';
            default:
                return 'Potential compliance issue detected';
        }
    }

    private updateDiagnostics(fileUri: vscode.Uri, issues: ComplianceIssue[]) {
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            const range = new vscode.Range(
                issue.line - 1, 
                issue.column, 
                issue.line - 1, 
                issue.column + 10
            );

            const severity = issue.severity === 'error' ? vscode.DiagnosticSeverity.Error :
                           issue.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
                           vscode.DiagnosticSeverity.Information;

            const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
            diagnostic.source = 'FedRAMP Compliance';
            diagnostic.code = issue.control;
            
            return diagnostic;
        });

        this.diagnosticCollection.set(fileUri, diagnostics);
    }

    private generateCombinedReport(level: FedRAMPLevel, standards: ComplianceStandard[], totalFiles: number, scannedFiles: number, issues: ComplianceIssue[], vulnerabilities: VulnerabilityIssue[]): ComplianceReport {
        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;
        const info = issues.filter(i => i.severity === 'info').length;

        // Add security vulnerabilities as compliance issues for unified reporting
        const securityAsComplianceIssues: ComplianceIssue[] = vulnerabilities.map(vuln => ({
            control: `SEC-${vuln.vulnerability.category}`,
            check: vuln.vulnerability.id,
            file: vuln.file,
            line: vuln.line,
            column: vuln.column,
            severity: vuln.severity === 'critical' || vuln.severity === 'high' ? 'error' : 
                     vuln.severity === 'medium' ? 'warning' : 'info',
            message: `Security Vulnerability: ${vuln.message}`,
            remediation: vuln.remediation
        }));

        const allIssues = [...issues, ...securityAsComplianceIssues];
        const controlsCovered = new Set(allIssues.map(i => i.control)).size;
        
        // Calculate total controls across all selected standards
        let totalControls = 0;
        for (const standard of standards) {
            if (standard === 'FedRAMP') {
                totalControls += getControlsByLevel(level).length;
            } else {
                totalControls += GlobalComplianceControls.getControlsByStandard(standard).length;
            }
        }

        return {
            timestamp: new Date(),
            level,
            standards,
            totalFiles,
            scannedFiles,
            issues: allIssues,
            summary: {
                errors: errors + vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length,
                warnings: warnings + vulnerabilities.filter(v => v.severity === 'medium').length,
                info: info + vulnerabilities.filter(v => v.severity === 'low').length,
                controlsCovered,
                totalControls
            }
        };
    }

    private generateReport(level: FedRAMPLevel, standards: ComplianceStandard[], totalFiles: number, scannedFiles: number, issues: ComplianceIssue[]): ComplianceReport {
        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;
        const info = issues.filter(i => i.severity === 'info').length;

        const controlsCovered = new Set(issues.map(i => i.control)).size;
        
        // Calculate total controls across all selected standards
        let totalControls = 0;
        for (const standard of standards) {
            if (standard === 'FedRAMP') {
                totalControls += getControlsByLevel(level).length;
            } else {
                totalControls += GlobalComplianceControls.getControlsByStandard(standard).length;
            }
        }

        return {
            timestamp: new Date(),
            level,
            standards,
            totalFiles,
            scannedFiles,
            issues,
            summary: {
                errors,
                warnings,
                info,
                controlsCovered,
                totalControls
            }
        };
    }

    public clearDiagnostics() {
        this.diagnosticCollection.clear();
        this.securityScanner.clearDiagnostics();
    }

    public dispose() {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
        this.securityScanner.dispose();
    }
}
