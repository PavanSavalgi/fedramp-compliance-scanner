export enum FedRAMPLevel {
    Low = 'Low',
    Moderate = 'Moderate',
    High = 'High'
}

export type ComplianceStandard = 'FedRAMP' | 'GDPR' | 'HIPAA' | 'DPDP' | 'PCI-DSS' | 'ISO-27001' | 'ISO-27002' | 'SOC-2' | 'NIST-CSF';

export interface ComplianceControl {
    id: string;
    family: string;
    title: string;
    description: string;
    standard: ComplianceStandard;
    level?: FedRAMPLevel[];
    severity: 'error' | 'warning' | 'info';
    checks: ComplianceCheck[];
}

export interface ComplianceCheck {
    id?: string;
    description?: string;
    pattern?: RegExp;
    fileTypes?: string[];
    severity?: 'error' | 'warning' | 'info';
    message: string;
    remediation: string;
}

export interface ComplianceIssue {
    control: string;
    check: string;
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    remediation: string;
}

export interface ComplianceReport {
    timestamp: Date;
    level: FedRAMPLevel;
    standards: ComplianceStandard[];
    totalFiles: number;
    scannedFiles: number;
    issues: ComplianceIssue[];
    summary: {
        errors: number;
        warnings: number;
        info: number;
        controlsCovered: number;
        totalControls: number;
    };
}

export interface ScanResult {
    file: string;
    issues: ComplianceIssue[];
    compliant: boolean;
}
