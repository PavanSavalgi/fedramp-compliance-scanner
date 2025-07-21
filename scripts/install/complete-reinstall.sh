#!/bin/bash

echo "🔧 FedRAMP Extension Complete Reinstall v2.1.1"
echo "==============================================="

# Step 1: Check current directory
echo "📁 Current directory: $(pwd)"
echo "📦 Available packages:"
ls -la *.vsix 2>/dev/null || echo "❌ No VSIX files found"

# Step 2: Check if VS Code command is available
if command -v code &> /dev/null; then
    echo "✅ VS Code CLI available"
    
    # Step 3: List currently installed extensions
    echo ""
    echo "🔍 Currently installed extensions (filtering for 'fedramp'):"
    code --list-extensions | grep -i fedramp || echo "❌ No FedRAMP extensions found"
    
    # Step 4: Force install new version
    if [ -f "fedramp-compliance-scanner-2.1.1.vsix" ]; then
        echo ""
        echo "🚀 Installing FedRAMP Compliance Scanner v2.1.1..."
        code --install-extension fedramp-compliance-scanner-2.1.1.vsix --force
        
        if [ $? -eq 0 ]; then
            echo "✅ Extension installed successfully!"
        else
            echo "❌ Extension installation failed!"
        fi
    else
        echo "❌ Extension package fedramp-compliance-scanner-2.1.1.vsix not found!"
    fi
    
else
    echo "❌ VS Code CLI not available"
    echo "   Please ensure VS Code is installed and 'code' command is in PATH"
    echo "   On macOS: CMD+SHIFT+P -> 'Shell Command: Install code command in PATH'"
fi

echo ""
echo "📋 Manual Installation Steps if CLI fails:"
echo "1. Open VS Code"
echo "2. Go to Extensions (CMD+SHIFT+X)"
echo "3. Click '...' menu -> 'Install from VSIX...'"
echo "4. Select: fedramp-compliance-scanner-2.1.1.vsix"
echo "5. After installation: CMD+SHIFT+P -> 'Developer: Restart Extension Host'"

echo ""
echo "🧪 Testing Commands:"
echo "1. CMD+SHIFT+P"
echo "2. Type 'FedRAMP' - you should see:"
echo "   - FedRAMP Compliance: Test Extension"
echo "   - FedRAMP Compliance: Generate Compliance Report"
echo "   - FedRAMP Compliance: Scan Workspace"
echo "   - ... and 4 more commands"

echo ""
echo "🛡️ Extension v2.1.1 Features:"
echo "- ✅ Fixed report generation command"
echo "- ✅ Added test command for verification"
echo "- ✅ Enhanced error handling and logging"
echo "- ✅ Standalone HTML report generation"

echo ""
echo "🚨 If issues persist:"
echo "1. Check Developer Console: Help -> Toggle Developer Tools"
echo "2. Look for: '🚀 FedRAMP Compliance Scanner v2.1.1 activated'"
echo "3. Try test command first: 'FedRAMP Compliance: Test Extension'"
