// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ComplianceScanner } from './scanner';
import { ComplianceTreeProvider } from './treeProvider';
import { ReportGenerator } from './reportGenerator';
import { IndividualReportGenerator } from './individualReportGenerator';
import { FedRAMPLevel } from './types';

let complianceScanner: ComplianceScanner;
let complianceTreeProvider: ComplianceTreeProvider;
let reportGenerator: ReportGenerator;
let individualReportGenerator: IndividualReportGenerator;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('FedRAMP Compliance Scanner extension is now active!');

	// Initialize components
	complianceScanner = new ComplianceScanner();
	complianceTreeProvider = new ComplianceTreeProvider();
	reportGenerator = new ReportGenerator();
	individualReportGenerator = new IndividualReportGenerator(reportGenerator);

	// Register tree view
	const treeView = vscode.window.createTreeView('fedrampCompliance', {
		treeDataProvider: complianceTreeProvider,
		showCollapseAll: true
	});

	// Register commands
	
	// Scan workspace command
	const scanWorkspaceCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanWorkspace', async () => {
		try {
			vscode.window.showInformationMessage('Starting FedRAMP compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			complianceTreeProvider.updateReport(report);
			
			const message = `Scan completed! Found ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.info} info items.`;
			vscode.window.showInformationMessage(message);
		} catch (error) {
			vscode.window.showErrorMessage(`Scan failed: ${error}`);
		}
	});

	// Scan current file command
	const scanFileCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanFile', async (uri?: vscode.Uri) => {
		try {
			const fileUri = uri || vscode.window.activeTextEditor?.document.uri;
			if (!fileUri) {
				vscode.window.showErrorMessage('No file selected for scanning');
				return;
			}

			const result = await complianceScanner.scanFile(fileUri.fsPath);
			const message = `Scan completed for ${fileUri.fsPath}! Found ${result.issues.length} issues.`;
			vscode.window.showInformationMessage(message);
		} catch (error) {
			vscode.window.showErrorMessage(`File scan failed: ${error}`);
		}
	});

	// Generate report command
	const generateReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateReport', async () => {
		try {
			const report = await complianceScanner.scanWorkspace();
			await reportGenerator.generateReport(report);
		} catch (error) {
			vscode.window.showErrorMessage(`Report generation failed: ${error}`);
		}
	});

	// Generate compliance report only command
	const generateComplianceReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateComplianceReport', async () => {
		try {
			const report = await complianceScanner.scanWorkspace();
			await reportGenerator.generateComplianceOnlyReport(report);
		} catch (error) {
			vscode.window.showErrorMessage(`Compliance report generation failed: ${error}`);
		}
	});

	// Generate security report only command
	const generateSecurityReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateSecurityReport', async () => {
		try {
			const report = await complianceScanner.scanWorkspace();
			await reportGenerator.generateSecurityOnlyReport(report);
		} catch (error) {
			vscode.window.showErrorMessage(`Security report generation failed: ${error}`);
		}
	});

	// Security scan only command
	const securityScanCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.securityScan', async () => {
		try {
			vscode.window.showInformationMessage('Starting security vulnerability scan...');
			
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			const config = vscode.workspace.getConfiguration('fedrampCompliance');
			const includePatterns = config.get<string[]>('includePatterns', ['**/*.tf', '**/*.yaml', '**/*.yml', '**/*.json']);
			const excludePatterns = config.get<string[]>('excludePatterns', ['**/node_modules/**', '**/vendor/**', '**/.git/**']);
			
			let totalVulnerabilities = 0;
			
			for (const folder of workspaceFolders) {
				for (const pattern of includePatterns) {
					const files = await vscode.workspace.findFiles(
						new vscode.RelativePattern(folder, pattern),
						new vscode.RelativePattern(folder, `{${excludePatterns.join(',')}}`)
					);

					for (const file of files) {
						try {
							const securityResult = await complianceScanner['securityScanner'].scanFileForVulnerabilities(file.fsPath);
							totalVulnerabilities += securityResult.vulnerabilities.length;
							complianceScanner['securityScanner'].updateDiagnostics(file, securityResult.vulnerabilities);
						} catch (error) {
							console.error(`Error scanning ${file.fsPath}:`, error);
						}
					}
				}
			}

			const message = `Security scan completed! Found ${totalVulnerabilities} vulnerabilities.`;
			vscode.window.showInformationMessage(message);
		} catch (error) {
			vscode.window.showErrorMessage(`Security scan failed: ${error}`);
		}
	});

	// Set compliance level command
	const setComplianceLevelCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.setComplianceLevel', async () => {
		const levels = Object.values(FedRAMPLevel);
		const selected = await vscode.window.showQuickPick(levels, {
			placeHolder: 'Select FedRAMP compliance level'
		});

		if (selected) {
			const config = vscode.workspace.getConfiguration('fedrampCompliance');
			await config.update('level', selected, vscode.ConfigurationTarget.Workspace);
			vscode.window.showInformationMessage(`FedRAMP compliance level set to: ${selected}`);
		}
	});

	// Select compliance standards command
	const selectComplianceStandardsCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.selectComplianceStandards', async () => {
		interface ComplianceStandardItem extends vscode.QuickPickItem {
			id: string;
		}

		const standardOptions: ComplianceStandardItem[] = [
			{ label: 'FedRAMP', description: 'Federal Risk and Authorization Management Program', id: 'FedRAMP' },
			{ label: 'GDPR', description: 'General Data Protection Regulation (EU)', id: 'GDPR' },
			{ label: 'HIPAA', description: 'Health Insurance Portability and Accountability Act (US)', id: 'HIPAA' },
			{ label: 'DPDP', description: 'Digital Personal Data Protection Act (India)', id: 'DPDP' },
			{ label: 'PCI-DSS', description: 'Payment Card Industry Data Security Standard', id: 'PCI-DSS' },
			{ label: 'ISO-27001', description: 'Information Security Management Systems', id: 'ISO-27001' },
			{ label: 'ISO-27002', description: 'Information Security Controls', id: 'ISO-27002' },
			{ label: 'SOC-2', description: 'Service Organization Control 2', id: 'SOC-2' },
			{ label: 'NIST-CSF', description: 'NIST Cybersecurity Framework', id: 'NIST-CSF' }
		];
		
		const config = vscode.workspace.getConfiguration('fedrampCompliance');
		const currentStandards = config.get<string[]>('complianceStandards', ['FedRAMP']);

		// Create a multi-step quick pick
		const quickPick = vscode.window.createQuickPick<ComplianceStandardItem>();
		quickPick.items = standardOptions;
		quickPick.selectedItems = standardOptions.filter(std => currentStandards.includes(std.id));
		quickPick.canSelectMany = true;
		quickPick.placeholder = 'Select compliance standards to check against';
		quickPick.title = 'Compliance Standards Selection';

		quickPick.show();

		quickPick.onDidAccept(() => {
			const selected = quickPick.selectedItems;
			if (selected && selected.length > 0) {
				const selectedIds = selected.map(item => item.id);
				config.update('complianceStandards', selectedIds, vscode.ConfigurationTarget.Workspace).then(() => {
					vscode.window.showInformationMessage(`Compliance standards set to: ${selectedIds.join(', ')}`);
					
					// Clear previous results and prompt for new scan
					complianceTreeProvider.clear();
					complianceScanner.clearDiagnostics();
					
					vscode.window.showInformationMessage(
						'Compliance standards updated. Would you like to run a new scan?',
						'Yes', 'No'
					).then(shouldScan => {
						if (shouldScan === 'Yes') {
							vscode.commands.executeCommand('fedramp-compliance-scanner.scanWorkspace');
						}
					});
				});
			}
			quickPick.hide();
		});

		quickPick.onDidHide(() => quickPick.dispose());
	});

	// Refresh compliance command
	const refreshComplianceCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.refreshCompliance', async () => {
		try {
			complianceTreeProvider.clear();
			complianceScanner.clearDiagnostics();
			vscode.window.showInformationMessage('Compliance data cleared. Run scan to refresh.');
		} catch (error) {
			vscode.window.showErrorMessage(`Refresh failed: ${error}`);
		}
	});

	// Auto-scan on file save (if enabled)
	const onSaveAutoScan = vscode.workspace.onDidSaveTextDocument(async (document) => {
		const config = vscode.workspace.getConfiguration('fedrampCompliance');
		const autoScanEnabled = config.get<boolean>('enableAutoScan', false);
		
		if (autoScanEnabled) {
			const fileExtension = document.fileName.split('.').pop()?.toLowerCase();
			const supportedExtensions = ['tf', 'yaml', 'yml', 'json', 'hcl'];
			
			if (fileExtension && supportedExtensions.includes(fileExtension)) {
				try {
					await complianceScanner.scanFile(document.fileName);
				} catch (error) {
					console.error('Auto-scan error:', error);
				}
			}
		}
	});

	// Individual compliance standard report commands
	const generateIndividualReportsCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateIndividualReports', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for individual reports...');
				lastReport = await complianceScanner.scanWorkspace();
				if (lastReport) {
					reportGenerator.storeReport(lastReport);
				}
			}
			
			if (lastReport) {
				await individualReportGenerator.generateIndividualReports(lastReport);
			} else {
				vscode.window.showErrorMessage('Failed to generate scan data for individual reports');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Individual reports generation failed: ${error}`);
		}
	});

	const generateGDPRReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateGDPRReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for GDPR report...');
				// Scan workspace and store the result directly without opening webview
				lastReport = await complianceScanner.scanWorkspace();
				if (lastReport) {
					// Store the report without opening a webview panel
					reportGenerator.storeReport(lastReport);
				}
			}
			
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'GDPR');
			} else {
				vscode.window.showErrorMessage('Failed to generate scan data for GDPR report');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`GDPR report generation failed: ${error}`);
			console.error('GDPR report error:', error);
		}
	});

	const generateHIPAAReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateHIPAAReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for HIPAA report...');
				lastReport = await complianceScanner.scanWorkspace();
				if (lastReport) {
					reportGenerator.storeReport(lastReport);
				}
			}
			
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'HIPAA');
			} else {
				vscode.window.showErrorMessage('Failed to generate scan data for HIPAA report');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`HIPAA report generation failed: ${error}`);
		}
	});

	const generatePCIDSSReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generatePCIDSSReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for PCI-DSS report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'PCI-DSS');
		} catch (error) {
			vscode.window.showErrorMessage(`PCI-DSS report generation failed: ${error}`);
		}
	});

	const generateISO27001ReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateISO27001Report', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for ISO-27001 report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'ISO-27001');
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27001 report generation failed: ${error}`);
		}
	});

	const generateFedRAMPOnlyReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateFedRAMPOnlyReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for FedRAMP report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'FedRAMP');
		} catch (error) {
			vscode.window.showErrorMessage(`FedRAMP report generation failed: ${error}`);
		}
	});

	const generateDPDPReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateDPDPReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for DPDP report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'DPDP');
		} catch (error) {
			vscode.window.showErrorMessage(`DPDP report generation failed: ${error}`);
		}
	});

	const generateISO27002ReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateISO27002Report', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for ISO-27002 report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'ISO-27002');
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27002 report generation failed: ${error}`);
		}
	});

	const generateSOC2ReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateSOC2Report', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for SOC-2 report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'SOC-2');
		} catch (error) {
			vscode.window.showErrorMessage(`SOC-2 report generation failed: ${error}`);
		}
	});

	const generateNISTCSFReportCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.generateNISTCSFReport', async () => {
		try {
			let lastReport = reportGenerator.getLastReport();
			if (!lastReport) {
				vscode.window.showInformationMessage('Running compliance scan for NIST-CSF report...');
				lastReport = await complianceScanner.scanWorkspace();
			}
			await individualReportGenerator.generateStandardSpecificReport(lastReport, 'NIST-CSF');
		} catch (error) {
			vscode.window.showErrorMessage(`NIST-CSF report generation failed: ${error}`);
		}
	});

	// Separated Scan Commands for Each Compliance Standard
	const scanGDPRCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanGDPR', async () => {
		try {
			vscode.window.showInformationMessage('Starting GDPR compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const gdprViolations = report.issues.filter(issue => 
					issue.control.includes('GDPR') || 
					issue.message.toLowerCase().includes('gdpr') ||
					issue.message.toLowerCase().includes('personal data') ||
					issue.message.toLowerCase().includes('data protection')
				);
				vscode.window.showInformationMessage(`GDPR scan completed! Found ${gdprViolations.length} GDPR-related issues. Use 'Generate GDPR Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('GDPR scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`GDPR scan failed: ${error}`);
		}
	});

	const reportGDPRCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportGDPR', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'GDPR');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for GDPR Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`GDPR report generation failed: ${error}`);
		}
	});

	const scanHIPAACommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanHIPAA', async () => {
		try {
			vscode.window.showInformationMessage('Starting HIPAA compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const hipaaViolations = report.issues.filter(issue => 
					issue.control.includes('HIPAA') || 
					issue.message.toLowerCase().includes('hipaa') ||
					issue.message.toLowerCase().includes('health') ||
					issue.message.toLowerCase().includes('medical')
				);
				vscode.window.showInformationMessage(`HIPAA scan completed! Found ${hipaaViolations.length} HIPAA-related issues. Use 'Generate HIPAA Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('HIPAA scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`HIPAA scan failed: ${error}`);
		}
	});

	const reportHIPAACommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportHIPAA', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'HIPAA');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for HIPAA Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`HIPAA report generation failed: ${error}`);
		}
	});

	const scanPCIDSSCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanPCIDSS', async () => {
		try {
			vscode.window.showInformationMessage('Starting PCI-DSS compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const pciViolations = report.issues.filter(issue => 
					issue.control.includes('PCI-DSS') || 
					issue.message.toLowerCase().includes('pci') ||
					issue.message.toLowerCase().includes('payment') ||
					issue.message.toLowerCase().includes('credit card')
				);
				vscode.window.showInformationMessage(`PCI-DSS scan completed! Found ${pciViolations.length} PCI-DSS-related issues. Use 'Generate PCI-DSS Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('PCI-DSS scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`PCI-DSS scan failed: ${error}`);
		}
	});

	const reportPCIDSSCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportPCIDSS', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'PCI-DSS');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for PCI-DSS Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`PCI-DSS report generation failed: ${error}`);
		}
	});

	const scanISO27001Command = vscode.commands.registerCommand('fedramp-compliance-scanner.scanISO27001', async () => {
		try {
			vscode.window.showInformationMessage('Starting ISO-27001 compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const iso27001Violations = report.issues.filter(issue => 
					issue.control.includes('ISO-27001') || 
					issue.message.toLowerCase().includes('iso') ||
					issue.message.toLowerCase().includes('information security')
				);
				vscode.window.showInformationMessage(`ISO-27001 scan completed! Found ${iso27001Violations.length} ISO-27001-related issues. Use 'Generate ISO-27001 Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('ISO-27001 scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27001 scan failed: ${error}`);
		}
	});

	const reportISO27001Command = vscode.commands.registerCommand('fedramp-compliance-scanner.reportISO27001', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'ISO-27001');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for ISO-27001 Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27001 report generation failed: ${error}`);
		}
	});

	const scanFedRAMPCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanFedRAMP', async () => {
		try {
			vscode.window.showInformationMessage('Starting FedRAMP compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const fedrampViolations = report.issues.filter(issue => 
					issue.control.includes('FedRAMP') || 
					issue.message.toLowerCase().includes('fedramp') ||
					issue.message.toLowerCase().includes('federal')
				);
				vscode.window.showInformationMessage(`FedRAMP scan completed! Found ${fedrampViolations.length} FedRAMP-related issues. Use 'Generate FedRAMP Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('FedRAMP scan failed to generate results');
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

	const scanDPDPCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanDPDP', async () => {
		try {
			vscode.window.showInformationMessage('Starting DPDP compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const dpdpViolations = report.issues.filter(issue => 
					issue.control.includes('DPDP') || 
					issue.message.toLowerCase().includes('dpdp') ||
					issue.message.toLowerCase().includes('data protection')
				);
				vscode.window.showInformationMessage(`DPDP scan completed! Found ${dpdpViolations.length} DPDP-related issues. Use 'Generate DPDP Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('DPDP scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`DPDP scan failed: ${error}`);
		}
	});

	const reportDPDPCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportDPDP', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'DPDP');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for DPDP Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`DPDP report generation failed: ${error}`);
		}
	});

	const scanISO27002Command = vscode.commands.registerCommand('fedramp-compliance-scanner.scanISO27002', async () => {
		try {
			vscode.window.showInformationMessage('Starting ISO-27002 compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const iso27002Violations = report.issues.filter(issue => 
					issue.control.includes('ISO-27002') || 
					issue.message.toLowerCase().includes('iso-27002') ||
					issue.message.toLowerCase().includes('security controls')
				);
				vscode.window.showInformationMessage(`ISO-27002 scan completed! Found ${iso27002Violations.length} ISO-27002-related issues. Use 'Generate ISO-27002 Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('ISO-27002 scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27002 scan failed: ${error}`);
		}
	});

	const reportISO27002Command = vscode.commands.registerCommand('fedramp-compliance-scanner.reportISO27002', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'ISO-27002');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for ISO-27002 Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`ISO-27002 report generation failed: ${error}`);
		}
	});

	const scanSOC2Command = vscode.commands.registerCommand('fedramp-compliance-scanner.scanSOC2', async () => {
		try {
			vscode.window.showInformationMessage('Starting SOC-2 compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const soc2Violations = report.issues.filter(issue => 
					issue.control.includes('SOC-2') || 
					issue.message.toLowerCase().includes('soc') ||
					issue.message.toLowerCase().includes('service organization')
				);
				vscode.window.showInformationMessage(`SOC-2 scan completed! Found ${soc2Violations.length} SOC-2-related issues. Use 'Generate SOC-2 Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('SOC-2 scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`SOC-2 scan failed: ${error}`);
		}
	});

	const reportSOC2Command = vscode.commands.registerCommand('fedramp-compliance-scanner.reportSOC2', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'SOC-2');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for SOC-2 Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`SOC-2 report generation failed: ${error}`);
		}
	});

	const scanNISTCSFCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.scanNISTCSF', async () => {
		try {
			vscode.window.showInformationMessage('Starting NIST-CSF compliance scan...');
			const report = await complianceScanner.scanWorkspace();
			if (report) {
				reportGenerator.storeReport(report);
				const nistViolations = report.issues.filter(issue => 
					issue.control.includes('NIST-CSF') || 
					issue.message.toLowerCase().includes('nist') ||
					issue.message.toLowerCase().includes('cybersecurity framework')
				);
				vscode.window.showInformationMessage(`NIST-CSF scan completed! Found ${nistViolations.length} NIST-CSF-related issues. Use 'Generate NIST-CSF Report' to view details.`);
			} else {
				vscode.window.showErrorMessage('NIST-CSF scan failed to generate results');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`NIST-CSF scan failed: ${error}`);
		}
	});

	const reportNISTCSFCommand = vscode.commands.registerCommand('fedramp-compliance-scanner.reportNISTCSF', async () => {
		try {
			const lastReport = reportGenerator.getLastReport();
			if (lastReport) {
				await individualReportGenerator.generateStandardSpecificReport(lastReport, 'NIST-CSF');
			} else {
				vscode.window.showWarningMessage('No scan data found. Please run "Scan for NIST-CSF Compliance" first.');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`NIST-CSF report generation failed: ${error}`);
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
		treeView,
		onSaveAutoScan,
		complianceScanner,
		generateIndividualReportsCommand,
		generateGDPRReportCommand,
		generateHIPAAReportCommand,
		generatePCIDSSReportCommand,
		generateISO27001ReportCommand,
		generateFedRAMPOnlyReportCommand,
		generateDPDPReportCommand,
		generateISO27002ReportCommand,
		generateSOC2ReportCommand,
		generateNISTCSFReportCommand,
		selectComplianceStandardsCommand,
		scanGDPRCommand,
		reportGDPRCommand,
		scanHIPAACommand,
		reportHIPAACommand,
		scanPCIDSSCommand,
		reportPCIDSSCommand,
		scanISO27001Command,
		reportISO27001Command,
		scanFedRAMPCommand,
		reportFedRAMPCommand,
		scanDPDPCommand,
		reportDPDPCommand,
		scanISO27002Command,
		reportISO27002Command,
		scanSOC2Command,
		reportSOC2Command,
		scanNISTCSFCommand,
		reportNISTCSFCommand
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

// This method is called when your extension is deactivated
export function deactivate() {
	if (complianceScanner) {
		complianceScanner.dispose();
	}
}
