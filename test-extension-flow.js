#!/usr/bin/env node

/**
 * Extension Environment Test - Simulates VS Code Extension GDPR Scan
 * This tests the exact same flow that the VS Code extension uses
 */

const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

console.log('🧪 Extension Environment GDPR Scan Test');
console.log('=========================================');

async function testGDPRScanFlow() {
    try {
        console.log('📦 Loading extension modules...');
        
        // Import the scanner and controls (should be already compiled)
        const { ComplianceScanner } = require('./out/scanner');
        const { GlobalComplianceControls } = require('./out/globalComplianceControls');
        
        console.log('✅ Modules loaded successfully');
        
        // Test 1: Verify GDPR controls are available
        console.log('\n🔍 Test 1: Checking GDPR controls availability');
        const globalControls = new GlobalComplianceControls();
        const gdprControls = globalControls.getControlsForStandards(['GDPR']);
        console.log(`📊 Found ${gdprControls.length} GDPR controls`);
        
        if (gdprControls.length === 0) {
            console.error('❌ No GDPR controls found - this is the problem!');
            return;
        }
        
        gdprControls.forEach((control, index) => {
            console.log(`  ${index + 1}. ${control.id}: ${control.title} (${control.checks.length} checks)`);
        });
        
        // Test 2: Create scanner instance
        console.log('\n🔧 Test 2: Creating scanner instance');
        const scanner = new ComplianceScanner();
        console.log('✅ Scanner created');
        
        // Test 3: Check workspace configuration simulation
        console.log('\n⚙️ Test 3: Testing workspace configuration');
        
        // Get current workspace folders
        const workspaceFolders = vscode.workspace.workspaceFolders;
        console.log(`📁 Workspace folders: ${workspaceFolders ? workspaceFolders.length : 0}`);
        
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('⚠️ No workspace folders - extension may not work correctly');
            return;
        }
        
        // Test 4: Check if test file exists and is accessible
        console.log('\n📄 Test 4: Checking test file accessibility');
        const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'test-compliance.md');
        console.log(`🎯 Test file path: ${testFilePath}`);
        
        if (fs.existsSync(testFilePath)) {
            console.log('✅ Test file exists');
            const content = fs.readFileSync(testFilePath, 'utf8');
            console.log(`📊 File size: ${content.length} bytes`);
            console.log(`📋 Lines: ${content.split('\n').length}`);
            
            // Show first few lines for verification
            const firstLines = content.split('\n').slice(0, 5).join('\n');
            console.log('📝 First 5 lines:');
            console.log(firstLines);
        } else {
            console.error('❌ Test file not found!');
            return;
        }
        
        // Test 5: Run the actual scan flow (same as VS Code command)
        console.log('\n🚀 Test 5: Running GDPR scan flow (same as VS Code extension)');
        
        console.log('📞 Calling scanWorkspaceWithStandards with ["GDPR"]...');
        const report = await scanner.scanWorkspaceWithStandards(['GDPR']);
        
        console.log('📊 Scan completed!');
        console.log(`📈 Total issues found: ${report.issues.length}`);
        console.log(`📁 Files scanned: ${report.scannedFiles}`);
        console.log(`⚡ Vulnerabilities: ${report.vulnerabilities.length}`);
        
        if (report.issues.length > 0) {
            console.log('\n🎯 Issues found:');
            report.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue.control}: ${issue.message}`);
                console.log(`      File: ${issue.file}:${issue.line}`);
                console.log(`      Severity: ${issue.severity}`);
            });
        } else {
            console.log('\n❌ No issues found - this matches the bug!');
            console.log('🔍 The scan completed but found 0 issues despite test file containing violations');
        }
        
        // Test 6: Test direct file scan for comparison
        console.log('\n🔬 Test 6: Direct file scan for comparison');
        const directResult = await scanner.scanFile(testFilePath, 'Moderate', ['GDPR']);
        console.log(`📊 Direct scan result: ${directResult.issues.length} issues`);
        
        if (directResult.issues.length > 0) {
            console.log('🎯 Direct scan found issues:');
            directResult.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue.control}: ${issue.message} (Line ${issue.line})`);
            });
        } else {
            console.log('❌ Direct scan also found 0 issues');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testGDPRScanFlow().then(() => {
    console.log('\n✅ Test completed');
}).catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
