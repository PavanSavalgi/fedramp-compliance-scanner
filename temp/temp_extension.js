"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const cloudManager_1 = require("./cloud/cloudManager");
const analyticsDashboard_1 = require("./analytics/analyticsDashboard");
function activate(context) {
    console.log('🚀 FedRAMP Compliance Scanner v2.12.1 activated with advanced cloud infrastructure analytics!');
    // Create diagnostic collection for problems
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('fedramp-compliance');
    // Initialize cloud infrastructure manager
    const cloudManager = new cloudManager_1.CloudInfrastructureManager();
    // Initialize analytics dashboard
    const analyticsDashboard = new analyticsDashboard_1.AnalyticsDashboard(context);
    // Command 1: Test Command
    console.log('📋 Registering test command...');
    const testCmd = vscode.commands.registerCommand('fedramp.test', () => {
        console.log('🧪 Test command executed successfully!');
        vscode.window.showInformationMessage('🧪 FedRAMP Extension v2.12.1 is working perfectly with cloud integration!');
    });
    // Command 2: Scan Workspace Command
    console.log('📁 Registering scan workspace command...');
    const scanWorkspaceCmd = vscode.commands.registerCommand('fedramp.scanWorkspace', async () => {
        console.log('📁 Scan workspace command executed!');
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open to scan');
            return;
        }
        vscode.window.showInformationMessage('🔍 Scanning workspace for FedRAMP compliance...');
        try {
            // Clear previous diagnostics
            diagnosticCollection.clear();
            // Scan all supported files in workspace
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const supportedExtensions = ['.tf', '.yaml', '.yml', '.json', '.hcl', '.md'];
            let scannedFiles = 0;
            let issuesFound = 0;
            for (const ext of supportedExtensions) {
                const pattern = new vscode.RelativePattern(workspaceFolder, `**/*${ext}`);
                const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
                for (const file of files) {
                    const issues = await scanFile(file);
                    if (issues.length > 0) {
                        diagnosticCollection.set(file, issues);
                        issuesFound += issues.length;
                    }
                    scannedFiles++;
                }
            }
            vscode.window.showInformationMessage(`✅ Workspace scan complete! ${scannedFiles} files scanned, ${issuesFound} compliance issues found`);
            if (issuesFound > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ Workspace scan failed: ${error}`);
        }
    });
    // Command 3: Scan Current File Command
    console.log('📄 Registering scan current file command...');
    const scanCurrentFileCmd = vscode.commands.registerCommand('fedramp.scanCurrentFile', async () => {
        console.log('📄 Scan current file command executed!');
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to scan');
            return;
        }
        vscode.window.showInformationMessage('🔍 Scanning current file for FedRAMP compliance...');
        try {
            const issues = await scanFile(activeEditor.document.uri);
            diagnosticCollection.set(activeEditor.document.uri, issues);
            vscode.window.showInformationMessage(`✅ File scan complete! ${issues.length} compliance issues found`);
            if (issues.length > 0) {
                vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            }
        }
        finally {
        }
    });
}
//# sourceMappingURL=temp_extension.js.map