"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = deactivate;
async function handleExportRequest(format, data, scanResults) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    try {
        let content = '';
        let filename = '';
        let fileExtension = '';
        const timestamp = new Date().toISOString().split('T')[0];
        switch (format) {
            case 'html':
                content = data.htmlContent;
                filename = "fedramp-compliance-report-" + timestamp + ".html";
                fileExtension = 'html';
                break;
            case 'json':
                content = JSON.stringify(data.reportData, null, 2);
                filename = "fedramp-compliance-report-" + timestamp + ".json";
                fileExtension = 'json';
                break;
            case 'csv':
                content = data.csvContent;
                filename = "fedramp-compliance-report-" + timestamp + ".csv";
                fileExtension = 'csv';
                break;
            case 'markdown':
                content = data.markdownContent;
                filename = "fedramp-compliance-report-" + timestamp + ".md";
                fileExtension = 'md';
                break;
            default:
                vscode.window.showErrorMessage("Unsupported export format: " + format);
                return;
        }
        // Save to Downloads folder
        const downloadsPath = path.join(os.homedir(), 'Downloads', filename);
        fs.writeFileSync(downloadsPath, content, 'utf8');
        vscode.window.showInformationMessage("✅ Report exported as " + fileExtension.toUpperCase() + ": " + filename, 'Open File').then(selection => {
            if (selection === 'Open File') {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.file(downloadsPath));
            }
        });
    }
    catch (error) {
        console.error('Export error:', error);
        vscode.window.showErrorMessage("Failed to export report: " + error);
    }
}
async function handlePrintRequest(data, scanResults) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    try {
        // Create a clean HTML version for printing
        const cleanContent = data.htmlContent.replace(/<div class="download-menu no-print">[\s\S]*?<\/div>/, '');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = "fedramp-compliance-report-print-" + timestamp + ".html";
        const tempPath = path.join(os.tmpdir(), filename);
        // Save to temp folder
        fs.writeFileSync(tempPath, cleanContent, 'utf8');
        // Open in default browser
        vscode.env.openExternal(vscode.Uri.file(tempPath));
        vscode.window.showInformationMessage('📄 Report opened in browser for printing');
    }
    catch (error) {
        console.error('Print error:', error);
        vscode.window.showErrorMessage("Failed to open report for printing: " + error);
    }
}
function deactivate() {
    console.log('👋 FedRAMP Compliance Scanner v2.9.0 deactivated');
}
//# sourceMappingURL=temp_part2.js.map