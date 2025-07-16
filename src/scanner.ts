import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ComplianceReport, FedRAMPLevel, ComplianceIssue, ComplianceStandard } from './types';
import { FEDRAMP_CONTROLS, getControlsByLevel } from './controls';
import { SecurityScanner } from './securityScanner';
import { VulnerabilityIssue, SecurityScanResult } from './vulnerabilityTypes';
import { GlobalComplianceControls } from './globalComplianceControls';

// Performance optimizations interfaces
interface CacheEntry {
    content: string;
    lastModified: number;
    issues: ComplianceIssue[];
}

interface ScanResult {
    file?: string;
    issues: ComplianceIssue[];
    compliant: boolean;
}

export class ComplianceScanner {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private securityScanner: SecurityScanner;
    private globalControls: GlobalComplianceControls;
    private outputChannel: vscode.OutputChannel;
    // Performance optimizations
    private scanCache: Map<string, CacheEntry> = new Map();
    private readonly BATCH_SIZE = 10;
    // Regex pattern cache for improved performance
    private patternCache: Map<string, RegExp> = new Map();

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
        this.securityScanner = new SecurityScanner();
        this.globalControls = new GlobalComplianceControls();
        this.outputChannel = vscode.window.createOutputChannel('FedRAMP Compliance Scanner');
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

                // Use optimized batch scanning
                const batchResult = await this.scanFilesBatch(files, level, complianceStandards, enableSecurityScan);
                allIssues.push(...batchResult.allIssues);
                allVulnerabilities.push(...batchResult.allVulnerabilities);
                scannedFiles += batchResult.scannedFiles;
            }
        }

        const report = this.generateCombinedReport(level, complianceStandards, totalFiles, scannedFiles, allIssues, allVulnerabilities);
        this.outputChannel.appendLine(`Scan completed. Found ${allIssues.length} compliance issues and ${allVulnerabilities.length} security vulnerabilities.`);
        
        return report;
    }

    async scanWorkspaceWithStandards(complianceStandards: ComplianceStandard[], level?: FedRAMPLevel): Promise<ComplianceReport> {
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const complianceLevel = level || config.get<FedRAMPLevel>('level', FedRAMPLevel.Moderate);
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

        // Process each workspace folder
        for (const folder of workspaceFolders) {
            // Find files matching include patterns
            const files = await vscode.workspace.findFiles(
                `{${includePatterns.join(',')}}`,
                `{${excludePatterns.join(',')}}`
            );

            totalFiles += files.length;

            if (files.length === 0) {
                this.outputChannel.appendLine(`No files found matching patterns: ${includePatterns.join(', ')}`);
                continue;
            }

            this.outputChannel.appendLine(`Found ${files.length} files to scan in ${folder.name}`);

            // Scan files in batches with the specified standards
            const batchResult = await this.scanFilesBatchWithStandards(files, complianceLevel, complianceStandards, enableSecurityScan);
            allIssues.push(...batchResult.allIssues);
            allVulnerabilities.push(...batchResult.allVulnerabilities);
            scannedFiles += batchResult.scannedFiles;
        }

        const report = this.generateCombinedReport(complianceLevel, complianceStandards, totalFiles, scannedFiles, allIssues, allVulnerabilities);
        this.outputChannel.appendLine(`Scan completed. Found ${allIssues.length} compliance issues and ${allVulnerabilities.length} security vulnerabilities.`);
        
        return report;
    }

    async scanFile(filePath: string, level?: FedRAMPLevel, standards?: ComplianceStandard[]): Promise<ScanResult> {
        // Check cache first
        const cached = this.scanCache.get(filePath);
        if (cached && cached.lastModified >= fs.statSync(filePath).mtimeMs) {
            return {
                file: filePath,
                issues: cached.issues,
                compliant: cached.issues.filter(i => i.severity === 'error').length === 0
            };
        }

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
                    // Use optimized file type checking
                    if (this.shouldScanFile(filePath, check.fileTypes)) {
                        const checkIssues = this.performCheck(filePath, lines, control.id, check);
                        issues.push(...checkIssues);
                    }
                }
            }
        }

        // Update cache
        this.updateCache(filePath, content, issues);

        return {
            file: filePath,
            issues,
            compliant: issues.filter(i => i.severity === 'error').length === 0
        };
    }

    // Optimized parallel file scanning
    private async scanFilesBatch(files: vscode.Uri[], level: FedRAMPLevel, complianceStandards: ComplianceStandard[], enableSecurityScan: boolean): Promise<{
        allIssues: ComplianceIssue[];
        allVulnerabilities: VulnerabilityIssue[];
        scannedFiles: number;
    }> {
        const allIssues: ComplianceIssue[] = [];
        const allVulnerabilities: VulnerabilityIssue[] = [];
        let scannedFiles = 0;

        // Process files in batches for better performance
        for (let i = 0; i < files.length; i += this.BATCH_SIZE) {
            const batch = files.slice(i, i + this.BATCH_SIZE);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (file) => {
                try {
                    const complianceResult = await this.scanFile(file.fsPath, level, complianceStandards);
                    let securityResult: SecurityScanResult | null = null;
                    
                    if (enableSecurityScan) {
                        securityResult = await this.securityScanner.scanFileForVulnerabilities(file.fsPath);
                    }
                    
                    return { complianceResult, securityResult, file: file.fsPath };
                } catch (error) {
                    this.outputChannel.appendLine(`Error scanning ${file.fsPath}: ${error}`);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            
            for (const result of batchResults) {
                if (result) {
                    allIssues.push(...result.complianceResult.issues);
                    if (result.securityResult) {
                        allVulnerabilities.push(...result.securityResult.vulnerabilities);
                    }
                    scannedFiles++;
                }
            }

            // Progress reporting for large scans
            if (files.length > 50) {
                const progress = Math.round((i + batch.length) / files.length * 100);
                this.outputChannel.appendLine(`Scan progress: ${progress}% (${i + batch.length}/${files.length} files)`);
            }
        }

        return { allIssues, allVulnerabilities, scannedFiles };
    }

    // New method to scan files in batch with specific compliance standards
    private async scanFilesBatchWithStandards(files: vscode.Uri[], level: FedRAMPLevel, complianceStandards: ComplianceStandard[], enableSecurityScan: boolean): Promise<{
        allIssues: ComplianceIssue[];
        allVulnerabilities: VulnerabilityIssue[];
        scannedFiles: number;
    }> {
        const allIssues: ComplianceIssue[] = [];
        const allVulnerabilities: VulnerabilityIssue[] = [];
        let scannedFiles = 0;

        // Process files in batches for better performance
        for (let i = 0; i < files.length; i += this.BATCH_SIZE) {
            const batch = files.slice(i, i + this.BATCH_SIZE);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (file) => {
                try {
                    const complianceResult = await this.scanFile(file.fsPath, level, complianceStandards);
                    let securityResult: SecurityScanResult | null = null;
                    
                    if (enableSecurityScan) {
                        securityResult = await this.securityScanner.scanFileForVulnerabilities(file.fsPath);
                    }
                    
                    return { complianceResult, securityResult, file: file.fsPath };
                } catch (error) {
                    this.outputChannel.appendLine(`Error scanning ${file.fsPath}: ${error}`);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            
            for (const result of batchResults) {
                if (result) {
                    allIssues.push(...result.complianceResult.issues);
                    if (result.securityResult) {
                        allVulnerabilities.push(...result.securityResult.vulnerabilities);
                    }
                    scannedFiles++;
                }
            }

            // Progress reporting for large scans
            if (files.length > 50) {
                const progress = Math.round((i + batch.length) / files.length * 100);
                this.outputChannel.appendLine(`Scan progress: ${progress}% (${i + batch.length}/${files.length} files)`);
            }
        }

        return { allIssues, allVulnerabilities, scannedFiles };
    }

    // Enhanced cache management
    private updateCache(filePath: string, content: string, issues: ComplianceIssue[]): void {
        const stats = fs.statSync(filePath);
        this.scanCache.set(filePath, {
            content,
            lastModified: stats.mtimeMs,
            issues
        });

        // Cache cleanup - keep only recent entries
        if (this.scanCache.size > 1000) {
            const oldEntries = Array.from(this.scanCache.entries())
                .sort(([,a], [,b]) => b.lastModified - a.lastModified)
                .slice(500);
            
            this.scanCache.clear();
            oldEntries.forEach(([key, value]) => this.scanCache.set(key, value));
        }
    }

    // Optimized pattern matching with caching
    private getCompiledPattern(pattern: string | RegExp): RegExp {
        if (pattern instanceof RegExp) {
            return pattern;
        }
        
        if (!this.patternCache.has(pattern)) {
            this.patternCache.set(pattern, new RegExp(pattern, 'gi'));
        }
        
        return this.patternCache.get(pattern)!;
    }

    // Enhanced file type filtering
    private shouldScanFile(filePath: string, fileTypes?: string[]): boolean {
        if (!fileTypes || fileTypes.length === 0) {
            return true;
        }
        
        const extension = path.extname(filePath);
        return fileTypes.includes(extension);
    }

    private performCheck(filePath: string, lines: string[], controlId: string, check: any): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];

        if (check.pattern) {
            // Use cached compiled pattern for better performance
            const compiledPattern = this.getCompiledPattern(check.pattern);
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(compiledPattern);
                
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
        this.diagnosticCollection.dispose();
        this.securityScanner.dispose();
    }
}
