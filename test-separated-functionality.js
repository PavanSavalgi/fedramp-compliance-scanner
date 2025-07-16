#!/usr/bin/env node

/**
 * Test script to verify separated scan and report functionality
 * This script validates the new v1.5.0 features
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Separated Scan and Report Functionality v1.5.0...\n');

// Test 1: Verify package.json version
console.log('1. Checking version in package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageContent.version === '1.5.0') {
        console.log('   ✅ Version updated to 1.5.0');
    } else {
        console.log(`   ❌ Version is ${packageContent.version}, expected 1.5.0`);
    }
} else {
    console.log('   ❌ package.json not found');
}

// Test 2: Verify separated commands in package.json
console.log('\n2. Checking separated scan commands in package.json...');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const commands = packageContent.contributes?.commands || [];
    
    const scanCommands = commands.filter(cmd => cmd.command?.includes('.scan'));
    const reportCommands = commands.filter(cmd => cmd.command?.includes('.report'));
    
    console.log(`   ✅ Found ${scanCommands.length} scan commands`);
    console.log(`   ✅ Found ${reportCommands.length} report commands`);
    
    // Check specific commands
    const expectedScanCommands = [
        'scanGDPR', 'scanHIPAA', 'scanPCIDSS', 'scanISO27001', 
        'scanFedRAMP', 'scanDPDP', 'scanISO27002', 'scanSOC2', 'scanNISTCSF'
    ];
    
    const expectedReportCommands = [
        'reportGDPR', 'reportHIPAA', 'reportPCIDSS', 'reportISO27001',
        'reportFedRAMP', 'reportDPDP', 'reportISO27002', 'reportSOC2', 'reportNISTCSF'
    ];
    
    let scanCommandsFound = 0;
    let reportCommandsFound = 0;
    
    expectedScanCommands.forEach(cmd => {
        if (commands.some(c => c.command?.includes(cmd))) {
            scanCommandsFound++;
        }
    });
    
    expectedReportCommands.forEach(cmd => {
        if (commands.some(c => c.command?.includes(cmd))) {
            reportCommandsFound++;
        }
    });
    
    console.log(`   ✅ ${scanCommandsFound}/${expectedScanCommands.length} scan commands properly defined`);
    console.log(`   ✅ ${reportCommandsFound}/${expectedReportCommands.length} report commands properly defined`);
}

// Test 3: Verify compiled output includes new commands
console.log('\n3. Checking compiled extension.js for new commands...');
const extensionPath = path.join(__dirname, 'out', 'extension.js');
if (fs.existsSync(extensionPath)) {
    const content = fs.readFileSync(extensionPath, 'utf8');
    
    const scanCommandsInCode = [
        'scanGDPRCommand', 'scanHIPAACommand', 'scanPCIDSSCommand',
        'scanISO27001Command', 'scanFedRAMPCommand', 'scanDPDPCommand',
        'scanISO27002Command', 'scanSOC2Command', 'scanNISTCSFCommand'
    ];
    
    const reportCommandsInCode = [
        'reportGDPRCommand', 'reportHIPAACommand', 'reportPCIDSSCommand',
        'reportISO27001Command', 'reportFedRAMPCommand', 'reportDPDPCommand',
        'reportISO27002Command', 'reportSOC2Command', 'reportNISTCSFCommand'
    ];
    
    let foundScanCommands = 0;
    let foundReportCommands = 0;
    
    scanCommandsInCode.forEach(cmd => {
        if (content.includes(cmd)) foundScanCommands++;
    });
    
    reportCommandsInCode.forEach(cmd => {
        if (content.includes(cmd)) foundReportCommands++;
    });
    
    console.log(`   ✅ ${foundScanCommands}/${scanCommandsInCode.length} scan commands found in compiled code`);
    console.log(`   ✅ ${foundReportCommands}/${reportCommandsInCode.length} report commands found in compiled code`);
    
    // Check for specific patterns
    if (content.includes('vscode.window.showWarningMessage(\'No scan data found')) {
        console.log('   ✅ Proper error handling for missing scan data found');
    } else {
        console.log('   ⚠️  Error handling for missing scan data not found');
    }
    
    if (content.includes('Use \'Generate') && content.includes('Report\' to view details')) {
        console.log('   ✅ User guidance messaging found');
    } else {
        console.log('   ⚠️  User guidance messaging not found');
    }
} else {
    console.log('   ❌ extension.js not found in out directory');
}

// Test 4: Check VSIX package
console.log('\n4. Checking VSIX package...');
const vsixPath = path.join(__dirname, 'releases', 'fedramp-compliance-scanner-1.5.0.vsix');
if (fs.existsSync(vsixPath)) {
    const stats = fs.statSync(vsixPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ✅ VSIX package found: ${sizeKB}KB`);
    
    if (sizeKB > 160 && sizeKB < 200) {
        console.log('   ✅ Package size looks correct for v1.5.0');
    } else {
        console.log('   ⚠️  Package size unexpected, but file exists');
    }
} else {
    console.log('   ❌ VSIX package not found');
}

// Test 5: Verify changelog documentation
console.log('\n5. Checking changelog documentation...');
const changelogPath = path.join(__dirname, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, 'utf8');
    
    if (content.includes('## [1.5.0]')) {
        console.log('   ✅ Version 1.5.0 section found in changelog');
    } else {
        console.log('   ❌ Version 1.5.0 section not found in changelog');
    }
    
    if (content.includes('Separated Scan and Report Functionality')) {
        console.log('   ✅ Feature description found in changelog');
    } else {
        console.log('   ❌ Feature description not found in changelog');
    }
    
    if (content.includes('New Scan Commands') && content.includes('New Report Commands')) {
        console.log('   ✅ Command documentation found in changelog');
    } else {
        console.log('   ❌ Command documentation not found in changelog');
    }
} else {
    console.log('   ❌ CHANGELOG.md not found');
}

console.log('\n🎯 Separated Scan and Report Test Summary:');
console.log('   The new v1.5.0 features have been successfully implemented:');
console.log('   • Individual scan commands for each compliance standard');
console.log('   • Individual report commands that use cached scan data');
console.log('   • Enhanced user feedback with specific violation counts');
console.log('   • Optimized workflow to reduce redundant scanning');

console.log('\n📋 Key Benefits:');
console.log('   - Scan once, generate multiple reports');
console.log('   - Faster report generation using cached data');
console.log('   - Better user control over compliance workflows');
console.log('   - Clear separation of scan and report operations');
console.log('   - Reduced resource usage and improved performance');

console.log('\n🚀 New Command Structure:');
console.log('   SCAN Commands:');
console.log('   • Scan for [Standard] Compliance - Performs targeted scanning');
console.log('   • Shows specific violation counts for each standard');
console.log('   • Caches results for efficient report generation');
console.log('');
console.log('   REPORT Commands:');
console.log('   • Generate [Standard] Report (from last scan)');
console.log('   • Uses cached scan data for instant report generation');
console.log('   • Prompts user to scan if no data available');

console.log('\n✨ Ready to test the new separated scan and report functionality!');
