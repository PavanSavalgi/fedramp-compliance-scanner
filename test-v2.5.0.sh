#!/bin/bash

# FedRAMP Compliance Scanner v2.5.0 - Installation & Test Script

echo "🚀 FedRAMP Compliance Scanner v2.5.0 - Installation & Test"
echo "==========================================================="

# Check current directory
echo "📁 Current directory: $(pwd)"

# Check if v2.5.0 package exists
if [ -f "fedramp-compliance-scanner-2.5.0.vsix" ]; then
    echo "✅ Found v2.5.0 package: fedramp-compliance-scanner-2.5.0.vsix"
    ls -la fedramp-compliance-scanner-2.5.0.vsix
else
    echo "❌ v2.5.0 package not found!"
    echo "Available packages:"
    ls -la *.vsix
    exit 1
fi

echo ""
echo "🔧 Installation Instructions:"
echo "1. Open VS Code"
echo "2. Go to Extensions (Ctrl+Shift+X)"
echo "3. Click '...' menu → Install from VSIX"
echo "4. Select: fedramp-compliance-scanner-2.5.0.vsix"
echo ""
echo "Or use command line:"
echo "code --install-extension fedramp-compliance-scanner-2.5.0.vsix"

echo ""
echo "📝 Test Files Available:"
echo "- samples/terraform-example.tf (Infrastructure as Code)"
echo "- samples/python-example.py (Application code)"

echo ""
echo "🧪 Testing Steps:"
echo "1. Install the extension using instructions above"
echo "2. Open one of the sample files"
echo "3. Run: FedRAMP: Scan Current File"
echo "4. Open the compliance report"
echo "5. Test the export menu (📥 Export Report ▼)"
echo "6. Try different export formats:"
echo "   - PDF (for official reports)"
echo "   - HTML (for web sharing)" 
echo "   - JSON (for tool integration)"
echo "   - CSV (for Excel analysis)"
echo "   - Markdown (for documentation)"

echo ""
echo "✨ Expected Results:"
echo "- Extension shows version 2.5.0"
echo "- Compliance issues are detected in sample files"
echo "- AI suggestions appear for each issue"
echo "- Export menu works with all 5 formats"
echo "- PDF export opens in new window"
echo "- Other formats download as files"

echo ""
echo "🏁 Ready to test FedRAMP Compliance Scanner v2.5.0!"
