# FedRAMP Compliance Scanner - Live Tracking System

## 🚀 Fresh Start

This is a completely rebuilt FedRAMP Compliance Scanner with:
- **Clean codebase** - All old reporting complexity removed
- **Live tracking** - Real-time compliance monitoring
- **VS Code Problems integration** - Issues appear directly in Problems panel
- **Simple commands** - Streamlined user experience

## ✨ Features

### 🔍 Live Compliance Scanning
- **Automatic file scanning** when you open, edit, or save files
- **Real-time feedback** in VS Code's Problems panel
- **Status bar indicator** showing compliance status
- **File type detection** for relevant compliance checks

### 📊 Simple Reporting
- **One clean report** with compliance score and metrics
- **Visual dashboard** with color-coded status
- **Actionable recommendations** based on findings
- **No complex cost calculations** - focus on compliance only

### 🎯 Smart Detection
The scanner automatically detects and applies relevant checks for:
- **Infrastructure as Code**: Terraform, YAML, JSON files
- **Source Code**: Python, JavaScript, TypeScript files  
- **Configuration**: Docker, environment, config files
- **Documentation**: Markdown, text files

## 🛠️ Commands

Access via **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `FedRAMP: Scan Workspace` | Scan all files in workspace |
| `FedRAMP: Scan Current File` | Scan the currently open file |
| `FedRAMP: Toggle Live Scanning` | Enable/disable real-time monitoring |
| `FedRAMP: Generate Report` | Create compliance report |
| `FedRAMP: Show Problems` | Open Problems panel |
| `FedRAMP: Clear Problems` | Clear all compliance issues |

## 🔄 Live Tracking

### Problems Panel Integration
- Compliance issues appear in **VS Code's Problems panel**
- **Click any issue** to jump to the problematic line
- **Error/Warning/Info** severity levels
- **Remediation suggestions** in issue details

### Status Bar
- **Green shield**: No issues found
- **Orange shield**: Warnings detected  
- **Red shield**: Critical issues found
- **Gray shield**: Scanner disabled

### Real-time Updates
- **File changes** trigger automatic rescanning
- **Debounced scanning** (1 second delay) to avoid spam
- **Background monitoring** of file system changes

## 📈 Reporting

### Compliance Score
- **0-100 scale** based on issue density
- **Letter grades** (A, B, C, D, F)
- **Color coding** for quick visual assessment

### Metrics Tracked
- Total files scanned
- Issues by severity level
- Top compliance violations
- Remediation recommendations

## ⚙️ Configuration

Add to your VS Code `settings.json`:

```json
{
  "fedrampCompliance.complianceLevel": "Moderate",
  "fedrampCompliance.autoScanOnActivation": true,
  "fedrampCompliance.enableRealTimeMonitoring": true
}
```

## 🚀 Quick Start

1. **Install** the extension
2. **Open** a project with infrastructure files
3. **Watch** as issues appear in Problems panel
4. **Click** issues to navigate and fix
5. **Generate report** for compliance overview

## 🎯 Key Benefits

- ✅ **Real-time feedback** - See issues as you type
- ✅ **Native VS Code integration** - Uses Problems panel
- ✅ **Clean interface** - No complex reporting overhead  
- ✅ **Smart scanning** - Only relevant checks per file type
- ✅ **Actionable insights** - Clear remediation guidance
- ✅ **Live status** - Always know your compliance posture

---

**Perfect for**: DevSecOps teams, compliance officers, and developers working with FedRAMP requirements who want immediate feedback without complex reporting overhead.
