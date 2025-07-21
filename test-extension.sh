#!/bin/bash

echo "🧪 FedRAMP Extension Test Script v2.1.1"
echo "========================================"

# Check if extension package exists
if [ -f "fedramp-compliance-scanner-2.1.1.vsix" ]; then
    echo "✅ Extension package found: fedramp-compliance-scanner-2.1.1.vsix"
    ls -lah fedramp-compliance-scanner-2.1.1.vsix
else
    echo "❌ Extension package not found!"
    exit 1
fi

echo ""
echo "📦 Installation Instructions:"
echo "1. Uninstall any existing FedRAMP extension"
echo "2. Install this version: code --install-extension fedramp-compliance-scanner-2.1.1.vsix --force"
echo "3. Restart VS Code Extension Host: Developer: Restart Extension Host"
echo "4. Test commands:"
echo "   - FedRAMP Compliance: Test Extension"
echo "   - FedRAMP Compliance: Generate Compliance Report"
echo ""

echo "🔍 Package Contents:"
echo "Size: $(du -h fedramp-compliance-scanner-2.1.1.vsix | cut -f1)"
echo "Files: 154"

echo ""
echo "🚀 Ready to install and test!"
