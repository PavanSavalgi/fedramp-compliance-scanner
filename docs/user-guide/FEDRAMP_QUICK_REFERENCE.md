# 🎯 FedRAMP Dashboard Quick Reference Card

## ⚡ **Quick Commands**
| Action | Command |
|--------|---------|
| 🔍 **Scan for FedRAMP** | `Ctrl+Shift+P` → `FedRAMP: Scan Workspace for FedRAMP Compliance` |
| 📊 **Open Dashboard** | `Ctrl+Shift+P` → `FedRAMP: Generate Advanced Dashboard` |
| 👔 **Executive Report** | `Ctrl+Shift+P` → `FedRAMP: Generate Executive Summary` |
| 🤖 **Auto Remediation** | `Ctrl+Shift+P` → `FedRAMP: Generate Remediation Plan` |
| 📈 **Trend Analysis** | `Ctrl+Shift+P` → `FedRAMP: Generate Trend Analysis` |
| 📤 **Export Dashboard** | `Ctrl+Shift+P` → `FedRAMP: Export Report` |
| ⏰ **Schedule Reports** | `Ctrl+Shift+P` → `FedRAMP: Schedule Report` |

## 📊 **Understanding Your Scores**

### **FedRAMP Compliance Score**
- **95%+** 🟢 **ATO Ready** - Full authorization possible
- **85-94%** 🟡 **P-ATO Ready** - Provisional authorization possible  
- **60-84%** 🟠 **In Progress** - Significant work needed
- **<60%** 🔴 **Not Started** - Major compliance gaps

### **Authorization Status**
- 🟢 **ATO** - Authority to Operate (95%+ score, 0 critical issues)
- 🟡 **P-ATO** - Provisional Authority (85%+ score, ≤2 critical issues)  
- 🔵 **In Process** - Working toward authorization (60%+ score)
- ⚫ **Not Started** - Authorization not initiated (<60% score)

## 🛡️ **FedRAMP Control Families Priority**

### **🔴 Critical (Immediate Attention)**
- **AC** - Access Control (15% weight)
- **SC** - System Communications Protection (15% weight)

### **🟡 High Priority** 
- **AU** - Audit and Accountability (12% weight)
- **SI** - System and Information Integrity (12% weight)
- **IA** - Identification and Authentication (10% weight)

### **🟢 Medium Priority**
- **CM** - Configuration Management (8% weight)
- **CP** - Contingency Planning (6% weight)
- **IR** - Incident Response (6% weight)
- **RA** - Risk Assessment (6% weight)

### **🔵 Lower Priority**
- **SA** - System and Services Acquisition (5% weight)
- **CA** - Security Assessment and Authorization (5% weight)

## 🎯 **ATO Pathway Steps**

```
Step 1: Documentation (60%+) → Step 2: Assessment (75%+) → Step 3: P-ATO (85%+) → Step 4: ATO (95%+)
```

## 🚨 **Immediate Actions by Score**

### **If Score < 60%** 🔴
1. Focus on **AC** and **SC** control families first
2. Address all critical severity issues
3. Review sample files for implementation patterns
4. Set up basic audit logging (AU family)

### **If Score 60-84%** 🟠  
1. Complete missing control implementations
2. Enhance documentation for all families
3. Focus on reducing warning-level issues
4. Prepare for security assessment

### **If Score 85-94%** 🟡
1. Address remaining critical issues (aim for 0)
2. Fine-tune control implementations
3. Prepare P-ATO documentation
4. Engage with 3PAO for assessment

### **If Score 95%+** 🟢
1. Maintain current compliance level
2. Prepare full ATO documentation  
3. Schedule official security assessment
4. Implement continuous monitoring

## 🤖 **Smart Remediation Priority**

### **Always Start With:**
1. **AC-2** Account Management (Critical)
2. **SC-7** Boundary Protection (Critical)  
3. **AU-2** Audit Events (High)
4. **IA-2** Multi-Factor Authentication (Critical)

### **Automation Levels:**
- ✅ **Automated** - Can be fixed automatically
- 🔄 **Semi-Auto** - Partially automated, requires review
- 👤 **Manual** - Requires manual implementation

## 📋 **Dashboard Navigation**

### **Top Metrics Bar**
- **Large Blue Card** = FedRAMP Compliance Score (most important)
- **Status Badge** = Current authorization status
- **Impact Level** = FedRAMP Low/Moderate/High designation

### **Control Family Grid**  
- **Green Cards** (≥90%) = Excellent compliance
- **Yellow Cards** (75-89%) = Good compliance
- **Orange Cards** (60-74%) = Needs improvement  
- **Red Cards** (<60%) = Critical attention required

### **ATO Progress Tracker**
- **Completed Steps** = Green with checkmarks
- **Current Step** = Blue with progress indicator
- **Pending Steps** = Gray with clock icons

## 📤 **Export Options**

| Format | Best For | Contains |
|--------|----------|----------|
| **PDF** | Executives, Stakeholders | Professional reports, charts |
| **Excel** | Technical Teams | Detailed control mappings, data |
| **JSON** | Integration, APIs | Raw compliance data |
| **HTML** | Sharing, Presentations | Interactive dashboard |

## 🔧 **Troubleshooting Quick Fixes**

| Issue | Quick Fix |
|-------|-----------|
| Dashboard not loading | `Ctrl+Shift+P` → `Developer: Reload Window` |
| Scores seem wrong | Run fresh scan first |
| Missing control families | Check file types (.tf, .yaml, .yml, .json) |
| Extension not working | Check Extensions panel, ensure enabled |

## 📞 **Need Help?**

1. **Check Documentation**: `/docs/user-guide/` folder
2. **Review Samples**: `/samples/` directory for examples  
3. **Executive Summary**: Generate for stakeholder communication
4. **Technical Details**: Check `/docs/technical/` folder

---

**🎯 Remember**: Focus on the **FedRAMP Compliance Score** (large blue card) as your primary metric for ATO readiness!
