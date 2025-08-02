export enum FedRAMPLevel {
    Low = 'Low',
    Moderate = 'Moderate',
    High = 'High'
}

export enum CISLevel {
    Level1 = 'Level 1',
    Level2 = 'Level 2'
}

export enum PCILevel {
    Level1 = 'Level 1 Merchant',
    Level2 = 'Level 2 Merchant',
    Level3 = 'Level 3 Merchant',
    Level4 = 'Level 4 Merchant',
    ServiceProvider = 'Service Provider'
}

export type ComplianceStandard = 'FedRAMP' | 'CIS-AWS-Benchmark-v1.4' | 'NIST-SP-800-171-r2' | 'NIST-SP-800-53-r5' | 'PCI-DSS-v3.2.1';

export interface ComplianceControl {
    id: string;
    family: string;
    title: string;
    description: string;
    standard: ComplianceStandard;
    level?: FedRAMPLevel[] | CISLevel[] | PCILevel[];
    severity: 'error' | 'warning' | 'info';
    checks: ComplianceCheck[];
    references?: string[];
    tags?: string[];
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
