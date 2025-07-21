"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simple HTML generation function to replace the problematic one
function generateEnhancedReportHTML(scanResults) {
    return buildWorkingHTMLReport(scanResults);
}
function buildWorkingHTMLReport(scanResults) {
    const html = [
        '<!DOCTYPE html>',
        '<html><head>',
        '<meta charset="UTF-8">',
        '<title>FedRAMP Compliance Report v2.9.0</title>',
        '<style>',
        'body{font-family:Arial,sans-serif;margin:20px;background:#f8f9fa;}',
        '.header{background:#007ACC;color:white;padding:20px;border-radius:8px;text-align:center;}',
        '.content{background:white;padding:20px;border-radius:8px;margin-top:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}',
        '.export-menu{margin:20px 0;text-align:center;}',
        '.export-btn{background:#007ACC;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;margin:5px;font-size:14px;}',
        '.export-btn:hover{background:#005a9e;}',
        '.print-btn{background:#28a745;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;margin:5px;font-size:14px;}',
        '.print-btn:hover{background:#218838;}',
        '.feature{background:#f8f9fa;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #007ACC;}',
        '.compliant{background:linear-gradient(135deg,#d4edda,#c3e6cb);border-left:4px solid #28a745;}',
        'table{width:100%;border-collapse:collapse;margin:15px 0;}',
        'th,td{padding:12px;border:1px solid #dee2e6;text-align:left;}',
        'th{background:#e9ecef;font-weight:600;}',
        'tbody tr:nth-child(even){background:#f8f9fa;}',
        '.issue-list{list-style:none;padding:0;}',
        '.issue-item{background:white;margin:10px 0;padding:15px;border-radius:8px;border-left:4px solid #dc3545;box-shadow:0 1px 3px rgba(0,0,0,0.1);}',
        '.issue-warning{border-left-color:#ffc107;}',
        '@media print{.no-print{display:none!important;}}',
        '</style>',
        '</head><body>',
        '<div class="header">',
        '<h1>🔐 FedRAMP Compliance Report v2.9.0</h1>',
        '<p>Generated: ' + scanResults.scanTimestamp + ' | Enhanced with Browser Print & Multi-format Export</p>',
        '</div>',
        '<div class="export-menu no-print">',
        '<button class="export-btn" onclick="exportAsHTML()">📄 Export HTML</button>',
        '<button class="export-btn" onclick="exportAsJSON()">📊 Export JSON</button>',
        '<button class="export-btn" onclick="exportAsCSV()">📋 Export CSV</button>',
        '<button class="export-btn" onclick="exportAsMarkdown()">📝 Export Markdown</button>',
        '<button class="print-btn" onclick="openInBrowserToPrint()">🖨️ Print in Browser</button>',
        '</div>',
        '<div class="content">'
    ];
    // Add content based on scan results
    if (scanResults.totalIssues > 0) {
        html.push('<div class="feature">', '<h2>📊 Compliance Summary</h2>', '<p><strong>Files Scanned:</strong> ' + scanResults.totalFiles + '</p>', '<p><strong>Issues Found:</strong> ' + scanResults.totalIssues + '</p>', '<p><strong>Status:</strong> <span style="color:#dc3545;font-weight:bold;">⚠️ NON-COMPLIANT</span></p>', '</div>');
        // Issues by type
        if (scanResults.issuesByType && scanResults.issuesByType.size > 0) {
            html.push('<div class="feature"><h3>📋 Issues by Control Type</h3><table><thead><tr><th>Control</th><th>Count</th></tr></thead><tbody>');
            scanResults.issuesByType.forEach((count, control) => {
                html.push('<tr><td>' + control + '</td><td>' + count + '</td></tr>');
            });
            html.push('</tbody></table></div>');
        }
        // Issues by file
        if (scanResults.issuesByFile && scanResults.issuesByFile.size > 0) {
            html.push('<div class="feature"><h3>📁 Detailed Issues by File</h3>');
            scanResults.issuesByFile.forEach((diagnostics, filePath) => {
                const fileName = filePath.split('/').pop() || filePath;
                html.push('<h4 style="color:#2c3e50;margin-top:20px;">📄 ' + fileName + '</h4>');
                html.push('<ul class="issue-list">');
                diagnostics.forEach((d) => {
                    const severity = d.severity === 0 ? '🔴 ERROR' : '🟡 WARNING';
                    const cssClass = d.severity === 0 ? 'issue-item' : 'issue-item issue-warning';
                    html.push('<li class="' + cssClass + '">', '<strong>Line ' + (d.range.start.line + 1) + ':</strong> ' + severity + '<br>', '<span style="color:#6c757d;">' + d.message + '</span>', '</li>');
                });
                html.push('</ul>');
            });
            html.push('</div>');
        }
    }
    else {
        html.push('<div class="feature compliant">', '<h2>✅ Perfect Compliance!</h2>', '<p><strong>Scan Result:</strong> All ' + scanResults.totalFiles + ' files are fully FedRAMP compliant!</p>', '<div style="font-size:4em;text-align:center;margin:20px 0;">🏆</div>', '<p style="text-align:center;color:#155724;font-weight:bold;">Congratulations! Your infrastructure meets all FedRAMP security requirements.</p>', '</div>');
    }
    // Add JavaScript for export functionality
    html.push('</div>', '<script>', 'function exportAsHTML(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"html",data:{htmlContent:document.documentElement.outerHTML}});}}', 'function exportAsJSON(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"json",data:{reportData:{timestamp:"' + scanResults.scanTimestamp + '",totalFiles:' + scanResults.totalFiles + ',totalIssues:' + scanResults.totalIssues + ',complianceStatus:"' + (scanResults.totalIssues === 0 ? 'COMPLIANT' : 'NON-COMPLIANT') + '"}}});}}', 'function exportAsCSV(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"csv",data:{csvContent:"File,Line,Control,Severity,Message\\n"}});}}', 'function exportAsMarkdown(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"export",format:"markdown",data:{markdownContent:"# FedRAMP Compliance Report v2.9.0\\n\\nGenerated: ' + scanResults.scanTimestamp + '\\n\\n## Summary\\n\\n- **Files Scanned:** ' + scanResults.totalFiles + '\\n- **Issues Found:** ' + scanResults.totalIssues + '\\n"}});}}', 'function openInBrowserToPrint(){if(typeof acquireVsCodeApi!=="undefined"){const vscode=acquireVsCodeApi();vscode.postMessage({type:"print",data:{htmlContent:document.documentElement.outerHTML}});}}', '</script>', '</body></html>');
    return html.join('');
}
//# sourceMappingURL=temp_html_function.js.map