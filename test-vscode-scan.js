#!/usr/bin/env node

/**
 * Test script to verify VS Code extension GDPR scanning
 * This simulates what happens when the VS Code command is executed
 */

const path = require('path');
const fs = require('fs');

// Mock VS Code workspace API
const mockWorkspace = {
    workspaceFolders: [{
        uri: {
            fsPath: __dirname
        }
    }],
    getConfiguration: (section) => ({
        get: (key, defaultValue) => {
            if (key === 'complianceStandards') return ['GDPR'];
            if (key === 'level') return 'Moderate';
            if (key === 'includePatterns') return ['**/*.{tf,yaml,yml,json,md}'];
            if (key === 'excludePatterns') return ['**/node_modules/**', '**/dist/**'];
            return defaultValue;
        }
    })
};

// Mock VS Code API
global.vscode = {
    workspace: mockWorkspace,
    Uri: {
        file: (filePath) => ({ fsPath: filePath })
    }
};

console.log('🧪 Testing VS Code Extension GDPR Scan Simulation');
console.log('================================================');

// Import and test the scanner
console.log('📦 Loading scanner...');
const { ComplianceScanner } = require('./out/scanner');
const { GlobalComplianceControls } = require('./out/globalComplianceControls');

async function testVSCodeScan() {
    try {
        console.log('🔧 Creating scanner instance...');
        const scanner = new ComplianceScanner();
        
        console.log('🔍 Getting GDPR controls...');
        const globalControls = new GlobalComplianceControls();
        const gdprControls = globalControls.getControlsForStandards(['GDPR']);
        console.log(`📊 Found ${gdprControls.length} GDPR controls`);
        
        // Test scanning the test file directly
        const testFilePath = path.join(__dirname, 'test-compliance.md');
        console.log(`🎯 Testing direct file scan: ${testFilePath}`);
        
        if (fs.existsSync(testFilePath)) {
            console.log('✅ Test file exists');
            const result = await scanner.scanFile(testFilePath, 'Moderate', ['GDPR']);
            console.log(`📊 Direct scan result: ${result.issues.length} issues found`);
            
            if (result.issues.length > 0) {
                console.log('🎯 Issues found:');
                result.issues.forEach((issue, index) => {
                    console.log(`  ${index + 1}. ${issue.control}: ${issue.message} (Line ${issue.line})`);
                });
            } else {
                console.log('❌ No issues found in direct scan');
            }
        } else {
            console.log('❌ Test file not found');
        }
        
        // Test workspace scanning
        console.log('\n🌐 Testing workspace scan...');
        const workspaceResult = await scanner.scanWorkspaceWithStandards(
            ['GDPR'],
            'Moderate',
            false, // enableSecurityScan
            ['**/*.{tf,yaml,yml,json,md}'], // includePatterns
            ['**/node_modules/**', '**/dist/**'] // excludePatterns
        );
        
        console.log(`📊 Workspace scan result: ${workspaceResult.issues.length} total issues found`);
        
        // Filter for GDPR issues
        const gdprIssues = workspaceResult.issues.filter(issue => 
            issue.control && issue.control.startsWith('GDPR')
        );
        
        console.log(`📊 GDPR-specific issues: ${gdprIssues.length}`);
        
        if (gdprIssues.length > 0) {
            console.log('🎯 GDPR Issues found:');
            gdprIssues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue.control}: ${issue.message} (${issue.file}:${issue.line})`);
            });
        } else {
            console.log('❌ No GDPR issues found in workspace scan');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testVSCodeScan().then(() => {
    console.log('\n✅ Test completed');
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
