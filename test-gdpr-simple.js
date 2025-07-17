// Simple test to check GDPR patterns without VS Code dependency
const fs = require('fs');
const path = require('path');

// Mock VS Code workspace
const mockWorkspace = {
  findFiles: () => Promise.resolve([
    { fsPath: path.join(__dirname, 'samples/gdpr-violations.yaml') }
  ])
};

// Load globalComplianceControls directly
const { GlobalComplianceControls } = require('./out/globalComplianceControls');

async function testGDPRPatterns() {
  console.log('Testing GDPR patterns...');
  
  try {
    const controls = new GlobalComplianceControls();
    const gdprControls = controls.getControlsForStandards(['GDPR']);
    
    console.log(`Found ${gdprControls.length} GDPR controls`);
    
    // Read the sample file
    const sampleFile = path.join(__dirname, 'samples/gdpr-violations.yaml');
    const content = fs.readFileSync(sampleFile, 'utf8');
    
    console.log('Sample file content length:', content.length);
    
    let totalIssues = 0;
    gdprControls.forEach(control => {
      console.log(`\nTesting control: ${control.id} - ${control.title}`);
      console.log('Control structure:', Object.keys(control));
      
      if (control.checks && Array.isArray(control.checks)) {
        control.checks.forEach(check => {
          const regex = new RegExp(check.pattern, check.flags || 'gi');
          const matches = content.match(regex);
          if (matches) {
            console.log(`  Found ${matches.length} matches for pattern: ${check.pattern}`);
            totalIssues += matches.length;
          }
        });
      } else {
        console.log('  No checks found for this control');
      }
    });
    
    console.log(`\nTotal GDPR issues found: ${totalIssues}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGDPRPatterns();
