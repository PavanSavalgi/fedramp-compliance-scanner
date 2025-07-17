import * as vscode from 'vscode';
import { ComplianceReport } from './types';

export class ReportGenerator {
    private lastReport: ComplianceReport | null = null;

    async generateReport(report: ComplianceReport): Promise<void> {
        this.setLastReport(report);
        vscode.window.showInformationMessage('Report generated with ' + report.issues.length + ' issues found.');
    }

    async generateComplianceReport(report: ComplianceReport): Promise<void> {
        this.generateReport(report);
    }

    async generateSecurityReport(report: ComplianceReport): Promise<void> {
        vscode.window.showInformationMessage('Security report: ' + report.issues.length + ' issues found.');
    }

    getLastReport(): ComplianceReport | null {
        return this.lastReport;
    }

    storeReport(report: ComplianceReport): void {
        this.setLastReport(report);
        this.saveReportToHistory(report);
    }

    private setLastReport(report: ComplianceReport): void {
        this.lastReport = report;
    }

    private saveReportToHistory(report: ComplianceReport): void {
        // Minimal implementation
    }
}
