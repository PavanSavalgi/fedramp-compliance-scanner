import * as vscode from 'vscode';
import { ComplianceScanner } from './scanner';
import { ReportGenerator } from './reportGenerator';
import { IndividualReportGenerator } from './individualReportGenerator';
import { ComplianceTreeProvider } from './treeProvider';
import { AdvancedReportingFeatures } from './advancedReportingFeatures';
import { ComplianceStandard, FedRAMPLevel } from './types';

export function activate(context: vscode.ExtensionContext): void {
	const complianceScanner = new ComplianceScanner();
	const reportGenerator = new ReportGenerator();
	const individualReportGenerator = new IndividualReportGenerator(reportGenerator);
	const advancedReporting = new AdvancedReportingFeatures();

	// Tree view setup
	const treeDataProvider = new ComplianceTreeProvider();
	const treeView = vscode.window.createTreeView('fedRAMPCompliance', {
		treeDataProvider: treeDataProvider,
		showCollapseAll: true
	});

	// Helper function to convert ScanResult to ComplianceReport
	function createComplianceReport(scanResult: any): any {
		return {
			...scanResult,
			timestamp: new Date(),
			level: 'High' as FedRAMPLevel,
			standards: ['FedRAMP'] as ComplianceStandard[],
			totalFiles: scanResult.file ? 1 : 0,
			totalIssues: scanResult.issues.length,
			scannedFiles: scanResult.file ? [scanResult.file] : [],
			summary: {
				errors: scanResult.issues.filter((i: any) => i.severity === 'error').length,
				warnings: scanResult.issues.filter((i: any) => i.severity === 'warning').length,
				info: scanResult.issues.filter((i: any) => i.severity === 'info').length,
				controlsCovered: scanResult.summary?.controlsCovered || 0,
				totalControls: scanResult.summary?.totalControls || 0
			}
		};
	}

	// CORE COMMANDS
	const scanWorkspaceCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanWorkspace', async () => {
		try {
			vscode.window.showInformationMessage('Starting FedRAMP compliance scan...');
			const scanResult = await complianceScanner.scanWorkspace();
			if (scanResult) {
				const report = createComplianceReport(scanResult);
				reportGenerator.generateReport(report);
				vscode.window.showInformationMessage('FedRAMP compliance scan completed.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Scan failed: ${error}`);
		}
	});

	const scanFileCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanFile', async () => {
		try {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				vscode.window.showWarningMessage('No active file to scan.');
				return;
			}

			vscode.window.showInformationMessage('Scanning current file for FedRAMP compliance...');
			const scanResult = await complianceScanner.scanFile(activeEditor.document.uri.fsPath);
			if (scanResult) {
				const report = createComplianceReport(scanResult);
				reportGenerator.generateReport(report);
				vscode.window.showInformationMessage('File scan completed.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`File scan failed: ${error}`);
		}
	});

	const generateReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				reportGenerator.generateReport(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Report generation failed: ${error}`);
		}
	});

	const generateComplianceReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateComplianceReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				reportGenerator.generateComplianceReport(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Compliance report generation failed: ${error}`);
		}
	});

	const generateSecurityReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateSecurityReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				reportGenerator.generateSecurityReport(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Security report generation failed: ${error}`);
		}
	});

	const setComplianceLevelCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.setComplianceLevel', async () => {
		try {
			const level = await vscode.window.showQuickPick(['Low', 'Moderate', 'High'], {
				placeHolder: 'Select FedRAMP compliance level'
			});
			
			if (level) {
				const config = vscode.workspace.getConfiguration('fedrampCompliance');
				await config.update('complianceLevel', level, vscode.ConfigurationTarget.Workspace);
				vscode.window.showInformationMessage(`FedRAMP compliance level set to: ${level}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to set compliance level: ${error}`);
		}
	});

	const securityScanCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.securityScan', async () => {
		try {
			vscode.window.showInformationMessage('Starting security vulnerability scan...');
			const scanResult = await complianceScanner.scanWorkspace();
			if (scanResult) {
				const report = createComplianceReport(scanResult);
				reportGenerator.generateSecurityReport(report);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Security scan failed: ${error}`);
		}
	});

	const refreshComplianceCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.refresh', async () => {
		try {
			vscode.window.showInformationMessage('Refreshing FedRAMP compliance data...');
			const scanResult = await complianceScanner.scanWorkspace();
			if (scanResult) {
				vscode.window.showInformationMessage('Compliance data refreshed successfully.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Refresh failed: ${error}`);
		}
	});

	const showDashboardCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.showDashboard', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await advancedReporting.generateInteractiveDashboard(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Dashboard generation failed: ${error}`);
		}
	});

	const toggleRealTimeMonitoringCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.toggleRealTimeMonitoring', async () => {
		try {
			vscode.window.showInformationMessage('Real-time monitoring feature is in development.');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to toggle monitoring: ${error}`);
		}
	});

	const exportReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.exportReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
				return;
			}

			const format = await vscode.window.showQuickPick(['HTML', 'JSON'], {
				placeHolder: 'Select export format'
			});

			if (format) {
				if (format === 'HTML') {
					await advancedReporting.generateInteractiveDashboard(lastReport);
				} else {
					await reportGenerator.generateReport(lastReport);
				}
				vscode.window.showInformationMessage(`Report exported as ${format}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Export failed: ${error}`);
		}
	});

	// FEDRAMP-SPECIFIC COMMANDS
	const scanFedRAMPCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanFedRAMP', async () => {
		try {
			vscode.window.showInformationMessage('Starting FedRAMP compliance scan...');
			const scanResult = await complianceScanner.scanWorkspaceWithStandards(['FedRAMP'], undefined, false);
			if (scanResult) {
				const report = createComplianceReport(scanResult);
				reportGenerator.storeReport(report);
				reportGenerator.generateReport(report);
				vscode.window.showInformationMessage('FedRAMP scan completed.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`FedRAMP scan failed: ${error}`);
		}
	});

	const reportFedRAMPCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportFedRAMP', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'FedRAMP');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for FedRAMP Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`FedRAMP report generation failed: ${error}`);
		}
	});

	const generateFedRAMPOnlyReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateFedRAMPOnlyReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running FedRAMP compliance scan...');
				const scanResult = await complianceScanner.scanWorkspace();
				if (scanResult) {
					lastReport = createComplianceReport(scanResult);
					if (lastReport) {
						reportGenerator.storeReport(lastReport);
					}
				}
			}

			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'FedRAMP');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`FedRAMP report generation failed: ${error}`);
		}
	});

	// ADVANCED REPORTING COMMANDS
	const generateAdvancedDashboardCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateAdvancedDashboard', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await advancedReporting.generateInteractiveDashboard(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Advanced dashboard generation failed: ${error}`);
		}
	});

	const generateExecutiveSummaryCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateExecutiveSummary', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await advancedReporting.generateExecutiveSummary(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Executive summary generation failed: ${error}`);
		}
	});

	const generateTrendAnalysisCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateTrendAnalysis', async () => {
		try {
			vscode.window.showInformationMessage('Trend analysis requires multiple scan reports over time (feature in development).');
		} catch (error) {
			vscode.window.showErrorMessage(`Trend analysis generation failed: ${error}`);
		}
	});

	const generateInteractiveReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateInteractiveReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await advancedReporting.generateInteractiveDashboard(lastReport);
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Interactive report generation failed: ${error}`);
		}
	});

	const scheduleReportsCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scheduleReports', async () => {
		try {
			const frequency = await vscode.window.showQuickPick(['Daily', 'Weekly', 'Monthly'], {
				placeHolder: 'Select report frequency'
			});
			
			if (frequency) {
				vscode.window.showInformationMessage(`Reports will be scheduled to run ${frequency.toLowerCase()} (feature in development)`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Report scheduling failed: ${error}`);
		}
	});

	const exportAdvancedReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.exportAdvancedReport', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showWarningMessage('No scan data found. Please run a scan first.');
				return;
			}

			const format = await vscode.window.showQuickPick(
				['HTML Dashboard', 'JSON Data Export'], {
				placeHolder: 'Select advanced export format'
			});

			if (format) {
				if (format === 'HTML Dashboard') {
					await advancedReporting.generateInteractiveDashboard(lastReport);
				} else {
					await reportGenerator.generateReport(lastReport);
				}
				vscode.window.showInformationMessage(`Advanced report exported as ${format}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Advanced report export failed: ${error}`);
		}
	});

	// Register all disposables
	context.subscriptions.push(
		scanWorkspaceCommand,
		scanFileCommand,
		generateReportCommand,
		generateComplianceReportCommand,
		generateSecurityReportCommand,
		setComplianceLevelCommand,
		securityScanCommand,
		refreshComplianceCommand,
		showDashboardCommand,
		toggleRealTimeMonitoringCommand,
		exportReportCommand,
		treeView,
		generateFedRAMPOnlyReportCommand,
		scanFedRAMPCommand,
		reportFedRAMPCommand,
		// Advanced Reporting Features
		generateAdvancedDashboardCommand,
		generateExecutiveSummaryCommand,
		generateTrendAnalysisCommand,
		generateInteractiveReportCommand,
		scheduleReportsCommand,
		exportAdvancedReportCommand
	);

	// Show welcome message
	vscode.window.showInformationMessage(
		'FedRAMP Compliance Scanner is ready! Use the Command Palette to start scanning.',
		'Scan Workspace'
	).then(selection => {
		if (selection === 'Scan Workspace') {
			vscode.commands.executeCommand('fedramp-compliance-scanner.scanWorkspace');
		}
	});
}

export function deactivate(): void {
	// Cleanup code here
}
