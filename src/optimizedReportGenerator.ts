import * as vscode from 'vscode';
import { ComplianceReport, ComplianceIssue, ComplianceStandard } from './types';

interface TemplateCache {
    baseTemplate: string | null;
    stylesTemplate: string | null;
    issueTemplate: string | null;
    lastModified: number;
}

interface ReportChunk {
    chunkId: string;
    startIndex: number;
    endIndex: number;
    issues: ComplianceIssue[];
    html: string;
}

interface OptimizedReportConfig {
    chunkSize: number;
    enableVirtualization: boolean;
    enableProgressiveLoading: boolean;
    templateCaching: boolean;
    lazyLoadCharts: boolean;
}

export class OptimizedReportGenerator {
    private templateCache: TemplateCache;
    private reportChunks: Map<string, ReportChunk>;
    private config: OptimizedReportConfig;
    private lastReport: ComplianceReport | null = null;
    private reportHistory: ComplianceReport[] = [];

    constructor() {
        this.templateCache = {
            baseTemplate: null,
            stylesTemplate: null,
            issueTemplate: null,
            lastModified: 0
        };
        this.reportChunks = new Map();
        this.config = {
            chunkSize: 100,
            enableVirtualization: true,
            enableProgressiveLoading: true,
            templateCaching: true,
            lazyLoadCharts: true
        };
        this.loadReportHistory();
    }

    async generateOptimizedReport(report: ComplianceReport): Promise<void> {
        await this.saveReportToHistory(report);
        this.setLastReport(report);
        
        const standardsText = report.standards && report.standards.length > 0 
            ? report.standards.join(', ')
            : `FedRAMP ${report.level}`;
            
        const panel = vscode.window.createWebviewPanel(
            'optimizedComplianceReport',
            `📊 ${standardsText} Compliance Report (Optimized)`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            }
        );

        // Generate optimized content with progressive loading
        panel.webview.html = await this.generateOptimizedWebviewContent(report);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'loadChunk':
                        await this.loadReportChunk(report, message.chunkId, panel);
                        break;
                    case 'generateAIReport':
                        await this.generateAIEnhancedReport(report, panel);
                        break;
                    case 'exportReport':
                        await this.exportOptimizedReport(report, message.format);
                        break;
                    case 'applyFilter':
                        await this.applyReportFilter(report, message.filter, panel);
                        break;
                    case 'searchIssues':
                        await this.searchReportIssues(report, message.query, panel);
                        break;
                    case 'loadChart':
                        await this.loadChart(report, message.chartType, panel);
                        break;
                }
            }
        );
    }

    private async generateOptimizedWebviewContent(report: ComplianceReport): Promise<string> {
        const baseTemplate = await this.getBaseTemplate();
        const styles = await this.getOptimizedStyles();
        
        const reportSummary = this.generateReportSummary(report);
        const initialChunk = this.generateInitialChunk(report);
        const chartPlaceholders = this.generateChartPlaceholders(report);
        
        return baseTemplate
            .replace('{{STYLES}}', styles)
            .replace('{{REPORT_TITLE}}', this.getReportTitle(report))
            .replace('{{REPORT_SUMMARY}}', reportSummary)
            .replace('{{INITIAL_CONTENT}}', initialChunk)
            .replace('{{CHART_PLACEHOLDERS}}', chartPlaceholders)
            .replace('{{REPORT_DATA}}', JSON.stringify(this.prepareReportData(report)))
            .replace('{{OPTIMIZATION_CONFIG}}', JSON.stringify(this.config));
    }

    private async getBaseTemplate(): Promise<string> {
        if (this.config.templateCaching && this.templateCache.baseTemplate) {
            return this.templateCache.baseTemplate;
        }

        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{REPORT_TITLE}}</title>
    <style>{{STYLES}}</style>
</head>
<body>
    <div class="report-container">
        <!-- Report Header -->
        <header class="report-header">
            <h1>{{REPORT_TITLE}}</h1>
            <div class="report-controls">
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="🔍 Search issues..." />
                    <button id="searchBtn">Search</button>
                </div>
                <div class="filter-container">
                    <select id="severityFilter">
                        <option value="">All Severities</option>
                        <option value="error">Errors</option>
                        <option value="warning">Warnings</option>
                        <option value="info">Information</option>
                    </select>
                    <select id="standardFilter">
                        <option value="">All Standards</option>
                    </select>
                </div>
                <div class="export-container">
                    <button class="btn" onclick="exportReport('html')">📄 HTML</button>
                    <button class="btn" onclick="exportReport('pdf')">📕 PDF</button>
                    <button class="btn" onclick="exportReport('json')">📊 JSON</button>
                </div>
            </div>
        </header>

        <!-- Report Summary Dashboard -->
        <section class="summary-dashboard">
            {{REPORT_SUMMARY}}
        </section>

        <!-- Analytics Charts (Lazy Loaded) -->
        <section class="analytics-section">
            {{CHART_PLACEHOLDERS}}
        </section>

        <!-- Issues Content (Virtualized) -->
        <section class="issues-section">
            <div class="issues-header">
                <h2>📋 Compliance Issues</h2>
                <div class="issues-stats">
                    <span class="total-count">Total: <span id="totalCount">0</span></span>
                    <span class="filtered-count">Showing: <span id="filteredCount">0</span></span>
                </div>
            </div>
            
            <div class="virtual-scroll-container" id="virtualScrollContainer">
                <div class="scroll-content" id="scrollContent">
                    {{INITIAL_CONTENT}}
                </div>
                <div class="scroll-loading" id="scrollLoading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>Loading more issues...</span>
                </div>
            </div>
        </section>

        <!-- Recommendations Section -->
        <section class="recommendations-section">
            <h2>💡 AI-Powered Recommendations</h2>
            <div id="recommendationsContent">
                <button class="btn primary" onclick="generateAIReport()">
                    🤖 Generate Smart Recommendations
                </button>
            </div>
        </section>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay" style="display: none;">
        <div class="loading-content">
            <div class="loading-spinner large"></div>
            <h3>Generating Report...</h3>
            <p id="loadingStatus">Initializing...</p>
        </div>
    </div>

    <script>
        // Embedded report data
        window.reportData = {{REPORT_DATA}};
        window.config = {{OPTIMIZATION_CONFIG}};
        
        {{JAVASCRIPT_CODE}}
    </script>
</body>
</html>`;

        if (this.config.templateCaching) {
            this.templateCache.baseTemplate = template;
            this.templateCache.lastModified = Date.now();
        }

        return template;
    }

    private async getOptimizedStyles(): Promise<string> {
        if (this.config.templateCaching && this.templateCache.stylesTemplate) {
            return this.templateCache.stylesTemplate;
        }

        const styles = `
        /* Optimized CSS with CSS Grid and Flexbox */
        :root {
            --primary-color: var(--vscode-textLink-foreground, #007acc);
            --success-color: var(--vscode-testing-iconPassed, #22863a);
            --warning-color: var(--vscode-list-warningForeground, #f6ad55);
            --error-color: var(--vscode-list-errorForeground, #e53e3e);
            --background: var(--vscode-editor-background, #1e1e1e);
            --surface: var(--vscode-editor-inactiveSelectionBackground, #2d2d30);
            --text: var(--vscode-editor-foreground, #cccccc);
            --border: var(--vscode-panel-border, #464647);
            --shadow: 0 2px 8px rgba(0,0,0,0.15);
            --border-radius: 8px;
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--background);
            overflow-x: hidden;
        }

        .report-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: var(--spacing-lg);
            display: grid;
            gap: var(--spacing-lg);
            grid-template-rows: auto auto auto 1fr auto;
            min-height: 100vh;
        }

        /* Header Optimizations */
        .report-header {
            background: linear-gradient(135deg, var(--primary-color), #1e3a8a);
            color: white;
            padding: var(--spacing-lg);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }

        .report-header h1 {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: var(--spacing-md);
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .report-controls {
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: var(--spacing-md);
            align-items: center;
        }

        @media (max-width: 768px) {
            .report-controls {
                grid-template-columns: 1fr;
                gap: var(--spacing-sm);
            }
        }

        /* Search & Filter Optimizations */
        .search-container {
            display: flex;
            gap: var(--spacing-sm);
            align-items: center;
        }

        .search-container input {
            flex: 1;
            padding: var(--spacing-sm) var(--spacing-md);
            border: none;
            border-radius: var(--border-radius);
            background: rgba(255,255,255,0.9);
            color: #333;
            font-size: 0.9rem;
        }

        .filter-container {
            display: flex;
            gap: var(--spacing-sm);
        }

        .filter-container select {
            padding: var(--spacing-sm) var(--spacing-md);
            border: none;
            border-radius: var(--border-radius);
            background: rgba(255,255,255,0.9);
            color: #333;
            font-size: 0.9rem;
        }

        /* Button Optimizations */
        .btn {
            padding: var(--spacing-sm) var(--spacing-md);
            border: none;
            border-radius: var(--border-radius);
            background: var(--primary-color);
            color: white;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn.primary {
            background: var(--primary-color);
        }

        .btn.secondary {
            background: var(--surface);
            color: var(--text);
            border: 1px solid var(--border);
        }

        /* Dashboard Cards */
        .summary-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-md);
        }

        .summary-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--border-radius);
            padding: var(--spacing-lg);
            box-shadow: var(--shadow);
            text-align: center;
            transition: transform 0.2s ease;
        }

        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .summary-card h3 {
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
            font-size: 1rem;
            font-weight: 600;
        }

        .summary-card .number {
            font-size: 2.5rem;
            font-weight: bold;
            margin: var(--spacing-sm) 0;
        }

        .summary-card.errors .number { color: var(--error-color); }
        .summary-card.warnings .number { color: var(--warning-color); }
        .summary-card.success .number { color: var(--success-color); }
        .summary-card.info .number { color: var(--primary-color); }

        /* Virtual Scroll Optimizations */
        .virtual-scroll-container {
            height: 600px;
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: var(--border-radius);
            background: var(--surface);
        }

        .scroll-content {
            padding: var(--spacing-md);
        }

        .issue-item {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--border-radius);
            margin-bottom: var(--spacing-md);
            padding: var(--spacing-md);
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .issue-item:hover {
            border-color: var(--primary-color);
            box-shadow: var(--shadow);
        }

        .issue-item.error { border-left: 4px solid var(--error-color); }
        .issue-item.warning { border-left: 4px solid var(--warning-color); }
        .issue-item.info { border-left: 4px solid var(--primary-color); }

        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
        }

        .issue-title {
            font-weight: 600;
            color: var(--primary-color);
            font-size: 1.1rem;
        }

        .issue-severity {
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .issue-severity.error { background: var(--error-color); color: white; }
        .issue-severity.warning { background: var(--warning-color); color: white; }
        .issue-severity.info { background: var(--primary-color); color: white; }

        .issue-meta {
            color: var(--text);
            opacity: 0.8;
            font-size: 0.9rem;
            margin-bottom: var(--spacing-sm);
        }

        .issue-remediation {
            background: rgba(var(--primary-color), 0.1);
            padding: var(--spacing-md);
            border-radius: var(--border-radius);
            border-left: 3px solid var(--primary-color);
            margin-top: var(--spacing-sm);
        }

        /* Chart Placeholders */
        .chart-placeholder {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--border-radius);
            padding: var(--spacing-lg);
            text-align: center;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chart-placeholder:hover {
            border-color: var(--primary-color);
            box-shadow: var(--shadow);
        }

        .chart-placeholder .icon {
            font-size: 3rem;
            margin-bottom: var(--spacing-md);
            opacity: 0.6;
        }

        /* Loading States */
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border);
            border-top: 2px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-spinner.large {
            width: 40px;
            height: 40px;
            border-width: 4px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .loading-content {
            background: var(--surface);
            padding: var(--spacing-xl);
            border-radius: var(--border-radius);
            text-align: center;
            min-width: 300px;
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Print Styles */
        @media print {
            .report-controls,
            .loading-overlay,
            .btn {
                display: none !important;
            }
            
            .virtual-scroll-container {
                height: auto !important;
                overflow: visible !important;
            }
        }
        `;

        if (this.config.templateCaching) {
            this.templateCache.stylesTemplate = styles;
        }

        return styles;
    }

    private generateReportSummary(report: ComplianceReport): string {
        const complianceScore = this.calculateComplianceScore(report);
        const criticalIssues = report.issues.filter(i => i.severity === 'error').length;
        const warningIssues = report.issues.filter(i => i.severity === 'warning').length;
        const infoIssues = report.issues.filter(i => i.severity === 'info').length;

        return `
        <div class="summary-card success">
            <h3>📊 Compliance Score</h3>
            <div class="number">${complianceScore}%</div>
            <p>Overall compliance rating</p>
        </div>
        <div class="summary-card errors">
            <h3>🚨 Critical Issues</h3>
            <div class="number">${criticalIssues}</div>
            <p>Require immediate attention</p>
        </div>
        <div class="summary-card warnings">
            <h3>⚠️ Warnings</h3>
            <div class="number">${warningIssues}</div>
            <p>Should be addressed</p>
        </div>
        <div class="summary-card info">
            <h3>ℹ️ Information</h3>
            <div class="number">${infoIssues}</div>
            <p>Good to know items</p>
        </div>
        <div class="summary-card">
            <h3>📁 Files Scanned</h3>
            <div class="number">${report.scannedFiles}</div>
            <p>Out of ${report.totalFiles} total</p>
        </div>
        <div class="summary-card">
            <h3>🛡️ Controls Covered</h3>
            <div class="number">${report.summary.controlsCovered}</div>
            <p>Compliance controls checked</p>
        </div>
        `;
    }

    private generateInitialChunk(report: ComplianceReport): string {
        const initialIssues = report.issues.slice(0, this.config.chunkSize);
        return this.renderIssueChunk(initialIssues, 0);
    }

    private renderIssueChunk(issues: ComplianceIssue[], startIndex: number): string {
        return issues.map((issue, index) => `
        <div class="issue-item ${issue.severity}" data-index="${startIndex + index}">
            <div class="issue-header">
                <div class="issue-title">${issue.control}: ${issue.message}</div>
                <span class="issue-severity ${issue.severity}">${issue.severity}</span>
            </div>
            <div class="issue-meta">
                <strong>📁 File:</strong> ${issue.file}:${issue.line}<br>
                <strong>🏷️ Control:</strong> ${issue.control}
            </div>
            <div class="issue-remediation">
                <strong>💡 Remediation:</strong> ${issue.remediation}
            </div>
        </div>
        `).join('');
    }

    private generateChartPlaceholders(report: ComplianceReport): string {
        return `
        <div class="analytics-section">
            <h2>📈 Compliance Analytics</h2>
            <div class="charts-grid">
                <div class="chart-placeholder" onclick="loadChart('compliance-trend')" data-chart="compliance-trend">
                    <div class="icon">📈</div>
                    <h3>Compliance Trends</h3>
                    <p>Click to load trend analysis</p>
                </div>
                <div class="chart-placeholder" onclick="loadChart('control-distribution')" data-chart="control-distribution">
                    <div class="icon">🥧</div>
                    <h3>Control Distribution</h3>
                    <p>Click to load control breakdown</p>
                </div>
                <div class="chart-placeholder" onclick="loadChart('severity-matrix')" data-chart="severity-matrix">
                    <div class="icon">🔥</div>
                    <h3>Severity Matrix</h3>
                    <p>Click to load severity analysis</p>
                </div>
                <div class="chart-placeholder" onclick="loadChart('file-heatmap')" data-chart="file-heatmap">
                    <div class="icon">🗺️</div>
                    <h3>File Heatmap</h3>
                    <p>Click to load file analysis</p>
                </div>
            </div>
        </div>
        `;
    }

    private prepareReportData(report: ComplianceReport) {
        return {
            totalIssues: report.issues.length,
            chunkSize: this.config.chunkSize,
            summary: report.summary,
            standards: report.standards,
            level: report.level,
            timestamp: report.timestamp,
            metadata: {
                loadedChunks: [0],
                totalChunks: Math.ceil(report.issues.length / this.config.chunkSize)
            }
        };
    }

    private getReportTitle(report: ComplianceReport): string {
        const standardsText = report.standards && report.standards.length > 0 
            ? report.standards.join(', ')
            : `FedRAMP ${report.level}`;
        return `${standardsText} Compliance Report`;
    }

    private calculateComplianceScore(report: ComplianceReport): number {
        if (report.issues.length === 0) {
            return 100;
        }
        
        const totalWeight = report.issues.length;
        const errorWeight = report.issues.filter(i => i.severity === 'error').length * 3;
        const warningWeight = report.issues.filter(i => i.severity === 'warning').length * 2;
        const infoWeight = report.issues.filter(i => i.severity === 'info').length * 1;
        
        const totalPenalty = errorWeight + warningWeight + infoWeight;
        const maxPossiblePenalty = totalWeight * 3;
        
        return Math.max(0, Math.round(100 - (totalPenalty / maxPossiblePenalty) * 100));
    }

    // Additional optimization methods would be implemented here...
    
    async generateReport(report: ComplianceReport): Promise<void> {
        // Fallback to optimized report generation
        return this.generateOptimizedReport(report);
    }

    async generateComplianceReport(report: ComplianceReport): Promise<void> {
        return this.generateOptimizedReport(report);
    }

    async generateSecurityReport(report: ComplianceReport): Promise<void> {
        return this.generateOptimizedReport(report);
    }

    getLastReport(): ComplianceReport | null {
        return this.lastReport;
    }

    storeReport(report: ComplianceReport): void {
        this.setLastReport(report);
        this.saveReportToHistory(report);
    }

    private setLastReport(report: ComplianceReport): void {
        this.lastReport = report;
    }

    private async saveReportToHistory(report: ComplianceReport): Promise<void> {
        this.reportHistory.push(report);
        this.reportHistory = this.reportHistory.slice(-10); // Keep only last 10
        
        try {
            const config = vscode.workspace.getConfiguration('fedramp-compliance-scanner');
            await config.update('reportHistory', this.reportHistory, vscode.ConfigurationTarget.Workspace);
        } catch (error) {
            console.log('Failed to save report history:', error);
        }
    }

    private async loadReportHistory(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('fedramp-compliance-scanner');
            const history = config.get<ComplianceReport[]>('reportHistory', []);
            this.reportHistory = history.slice(-10);
        } catch (error) {
            console.log('No previous report history found');
            this.reportHistory = [];
        }
    }

    // Placeholder methods for advanced features
    private async loadReportChunk(report: ComplianceReport, chunkId: string, panel: vscode.WebviewPanel): Promise<void> {
        // Implementation for loading additional chunks
    }

    private async generateAIEnhancedReport(report: ComplianceReport, panel: vscode.WebviewPanel): Promise<void> {
        // Implementation for AI-enhanced reporting
    }

    private async exportOptimizedReport(report: ComplianceReport, format: string): Promise<void> {
        // Implementation for optimized export
    }

    private async applyReportFilter(report: ComplianceReport, filter: any, panel: vscode.WebviewPanel): Promise<void> {
        // Implementation for real-time filtering
    }

    private async searchReportIssues(report: ComplianceReport, query: string, panel: vscode.WebviewPanel): Promise<void> {
        // Implementation for real-time search
    }

    private async loadChart(report: ComplianceReport, chartType: string, panel: vscode.WebviewPanel): Promise<void> {
        // Implementation for lazy-loaded charts
    }
}
