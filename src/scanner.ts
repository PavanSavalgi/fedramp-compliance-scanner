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
        const includePatterns = config.get<string[]>('includePatterns', ['**/*.tf', '**/*.yaml', '**/*.yml', '**/*.json', '**/*.md', '**/*.txt', '**/*.sh', '**/*.py', '**/*.js', '**/*.ts']);
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

    async scanWorkspaceWithStandards(complianceStandards: ComplianceStandard[], level?: FedRAMPLevel, enableSecurityScan?: boolean): Promise<ComplianceReport> {
        console.log('\n🔍 DEBUG: scanWorkspaceWithStandards called');
        console.log('📋 DEBUG: Standards requested:', JSON.stringify(complianceStandards));
        console.log('📊 DEBUG: Level:', level);
        console.log('🔒 DEBUG: Security scan enabled:', enableSecurityScan);
        
        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const complianceLevel = level || config.get<FedRAMPLevel>('level', FedRAMPLevel.Moderate);
        const includePatterns = config.get<string[]>('includePatterns', ['**/*.tf', '**/*.yaml', '**/*.yml', '**/*.json', '**/*.md', '**/*.txt', '**/*.sh', '**/*.py', '**/*.js', '**/*.ts']);
        const excludePatterns = config.get<string[]>('excludePatterns', ['**/node_modules/**', '**/vendor/**', '**/.git/**']);
        
        // If enableSecurityScan is explicitly provided, use that; otherwise use config default
        const shouldEnableSecurityScan = enableSecurityScan !== undefined ? enableSecurityScan : config.get<boolean>('enableSecurityScan', true);

        console.log('📁 DEBUG: Include patterns:', includePatterns);
        console.log('🚫 DEBUG: Exclude patterns:', excludePatterns);
        console.log('🔐 DEBUG: Final security scan setting:', shouldEnableSecurityScan);

        this.outputChannel.appendLine(`Starting compliance scan for standards: ${complianceStandards.join(', ')}${shouldEnableSecurityScan ? ' with security vulnerability detection' : ' (compliance only)'}...`);
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.error('❌ DEBUG: No workspace folder found');
            throw new Error('No workspace folder found');
        }

        console.log('📂 DEBUG: Workspace folders:', workspaceFolders.map(f => f.uri.fsPath));

        const allIssues: ComplianceIssue[] = [];
        const allVulnerabilities: VulnerabilityIssue[] = [];
        let totalFiles = 0;
        let scannedFiles = 0;

        // Process each workspace folder
        for (const folder of workspaceFolders) {
            console.log(`📁 DEBUG: Processing workspace folder: ${folder.uri.fsPath}`);
            
            // Find files matching include patterns
            const files = await vscode.workspace.findFiles(
                `{${includePatterns.join(',')}}`,
                `{${excludePatterns.join(',')}}`
            );

            console.log(`📄 DEBUG: Found ${files.length} files in workspace folder`);
            
            // Check specifically for test-compliance.md
            const testFile = files.find(f => f.fsPath.includes('test-compliance.md'));
            if (testFile) {
                console.log('🎯 DEBUG: *** FOUND test-compliance.md file:', testFile.fsPath);
            } else {
                console.log('❌ DEBUG: test-compliance.md NOT found in file list');
                console.log('📄 DEBUG: Files found:');
                files.slice(0, 10).forEach(f => console.log(`  - ${f.fsPath}`));
                if (files.length > 10) {
                    console.log(`  ... and ${files.length - 10} more files`);
                }
            }

            totalFiles += files.length;

            if (files.length === 0) {
                this.outputChannel.appendLine(`No files found matching patterns: ${includePatterns.join(', ')}`);
                continue;
            }

            this.outputChannel.appendLine(`Found ${files.length} files to scan in ${folder.name}`);

            // Scan files in batches with the specified standards
            const batchResult = await this.scanFilesBatchWithStandards(files, complianceLevel, complianceStandards, shouldEnableSecurityScan);
            allIssues.push(...batchResult.allIssues);
            allVulnerabilities.push(...batchResult.allVulnerabilities);
            scannedFiles += batchResult.scannedFiles;
        }

        const report = this.generateCombinedReport(complianceLevel, complianceStandards, totalFiles, scannedFiles, allIssues, allVulnerabilities);
        this.outputChannel.appendLine(`Scan completed. Found ${allIssues.length} compliance issues and ${allVulnerabilities.length} security vulnerabilities.`);
        
        return report;
    }

    async scanFile(filePath: string, level?: FedRAMPLevel, standards?: ComplianceStandard[]): Promise<ScanResult> {
        console.log(`🔍 DEBUG: scanFile called for: ${filePath}`);
        
        // Check cache first
        const cached = this.scanCache.get(filePath);
        if (cached && cached.lastModified >= fs.statSync(filePath).mtimeMs) {
            console.log(`💾 DEBUG: Using cached result for ${filePath}`);
            return {
                file: filePath,
                issues: cached.issues,
                compliant: cached.issues.filter(i => i.severity === 'error').length === 0
            };
        }

        const config = vscode.workspace.getConfiguration('fedrampCompliance');
        const complianceLevel = level || config.get<FedRAMPLevel>('level', FedRAMPLevel.Moderate);
        const complianceStandards = standards || config.get<ComplianceStandard[]>('complianceStandards', ['FedRAMP']);
        
        console.log(`📊 DEBUG: scanFile - level: ${complianceLevel}, standards: ${JSON.stringify(complianceStandards)}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const issues: ComplianceIssue[] = [];
        const fileExtension = path.extname(filePath);
        
        console.log(`📄 DEBUG: File content length: ${content.length}, lines: ${lines.length}, extension: ${fileExtension}`);
        
        if (filePath.includes('test-compliance.md')) {
            console.log('🎯 DEBUG: *** Scanning test-compliance.md file ***');
            console.log(`📋 DEBUG: First 200 chars of content: ${content.substring(0, 200)}...`);
        }

        // Get controls for all selected standards
        for (const standard of complianceStandards) {
            console.log(`🔧 DEBUG: Processing standard: ${standard}`);
            let controls;
            
            if (standard === 'FedRAMP') {
                controls = getControlsByLevel(complianceLevel);
                console.log(`📊 DEBUG: FedRAMP controls count: ${controls.length}`);
            } else {
                // Use instance method for consistency
                controls = this.globalControls.getControlsForStandards([standard]);
                console.log(`📊 DEBUG: ${standard} controls count: ${controls.length}`);
            }

            for (const control of controls) {
                console.log(`🎯 DEBUG: Checking control: ${control.id} with ${control.checks.length} checks`);
                
                for (const check of control.checks) {
                    // Use optimized file type checking
                    const shouldScan = this.shouldScanFile(filePath, check.fileTypes);
                    console.log(`🔍 DEBUG: Control ${control.id}, check: ${check.description}, shouldScan: ${shouldScan}, fileTypes: ${JSON.stringify(check.fileTypes)}`);
                    
                    if (shouldScan) {
                        const checkIssues = this.performCheck(filePath, lines, control.id, check);
                        console.log(`📊 DEBUG: Control ${control.id} generated ${checkIssues.length} issues`);
                        
                        if (filePath.includes('test-compliance.md') && checkIssues.length > 0) {
                            console.log(`🎯 DEBUG: *** test-compliance.md issues from control ${control.id}: ***`);
                            checkIssues.forEach((issue, index) => {
                                console.log(`  ${index + 1}. Line ${issue.line}: ${issue.message}`);
                            });
                        }
                        
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
        console.log(`📄 DEBUG: scanFilesBatchWithStandards called with ${files.length} files`);
        console.log('📋 DEBUG: Standards for batch:', complianceStandards);
        console.log('📊 DEBUG: Level for batch:', level);
        console.log('🔒 DEBUG: Security scan enabled for batch:', enableSecurityScan);
        
        const allIssues: ComplianceIssue[] = [];
        const allVulnerabilities: VulnerabilityIssue[] = [];
        let scannedFiles = 0;

        // Check for test file in this batch
        const testFile = files.find(f => f.fsPath.includes('test-compliance.md'));
        if (testFile) {
            console.log('🎯 DEBUG: *** test-compliance.md found in current batch ***');
        }

        // Process files in batches for better performance
        for (let i = 0; i < files.length; i += this.BATCH_SIZE) {
            const batch = files.slice(i, i + this.BATCH_SIZE);
            console.log(`📦 DEBUG: Processing batch ${Math.floor(i/this.BATCH_SIZE) + 1} with ${batch.length} files`);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (file) => {
                try {
                    console.log(`🔍 DEBUG: Scanning file: ${file.fsPath}`);
                    const complianceResult = await this.scanFile(file.fsPath, level, complianceStandards);
                    console.log(`📊 DEBUG: File ${file.fsPath} generated ${complianceResult.issues.length} compliance issues`);
                    
                    if (file.fsPath.includes('test-compliance.md') && complianceResult.issues.length > 0) {
                        console.log('🎯 DEBUG: *** test-compliance.md generated issues! ***');
                        complianceResult.issues.forEach((issue, index) => {
                            console.log(`  ${index + 1}. ${issue.control}: ${issue.message}`);
                        });
                    }
                    
                    let securityResult: SecurityScanResult | null = null;
                    
                    if (enableSecurityScan) {
                        console.log(`🔐 DEBUG: Running security scan for ${file.fsPath}`);
                        securityResult = await this.securityScanner.scanFileForVulnerabilities(file.fsPath);
                        console.log(`🛡️ DEBUG: Security scan found ${securityResult?.vulnerabilities?.length || 0} vulnerabilities`);
                    } else {
                        console.log(`⏭️ DEBUG: Skipping security scan for ${file.fsPath} (disabled for compliance-only scan)`);
                    }
                    
                    return { complianceResult, securityResult, file: file.fsPath };
                } catch (error) {
                    console.error(`❌ DEBUG: Error scanning ${file.fsPath}:`, error);
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
            try {
                this.patternCache.set(pattern, new RegExp(pattern, 'gi'));
            } catch (error) {
                console.error(`❌ Invalid regex pattern: "${pattern}"`);
                console.error(`Error: ${error}`);
                // Return a safe fallback pattern that won't match anything
                this.patternCache.set(pattern, new RegExp('(?!.*)'));
            }
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
            try {
                console.log(`🔍 DEBUG: Processing pattern for ${controlId}/${check.id}`);
                console.log(`📋 DEBUG: Pattern type: ${typeof check.pattern}`);
                console.log(`📋 DEBUG: Pattern value: ${check.pattern}`);
                
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
            } catch (error) {
                console.error(`❌ DEBUG: Error processing pattern for ${controlId}/${check.id}:`, error);
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
                totalControls += this.globalControls.getControlsForStandards([standard]).length;
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
                totalControls += this.globalControls.getControlsForStandards([standard]).length;
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
