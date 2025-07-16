import { ComplianceControl, FedRAMPLevel } from './types';

export const FEDRAMP_CONTROLS: ComplianceControl[] = [
    // Access Control (AC)
    {
        id: 'AC-2',
        family: 'AC',
        title: 'Account Management',
        description: 'Organizations must manage information system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.',
        standard: 'FedRAMP',
        severity: 'warning',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'AC-2-1',
                message: 'Check for proper user management configurations',
                pattern: /user|account|role|permission/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'warning',
                remediation: 'Implement proper user account management with role-based access control'
            }
        ]
    },
    {
        id: 'AC-3',
        family: 'AC',
        title: 'Access Enforcement',
        description: 'The information system enforces approved authorizations for logical access.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'AC-3-1',
                message: 'Verify access control policies are defined',
                pattern: /policy|allow|deny|grant|revoke/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Define explicit access control policies and enforcement mechanisms'
            }
        ]
    },
    // Audit and Accountability (AU)
    {
        id: 'AU-2',
        family: 'AU',
        title: 'Auditable Events',
        description: 'Organizations must determine what events are auditable and specify the frequency of auditing.',
        standard: 'FedRAMP',
        severity: 'warning',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'AU-2-1',
                message: 'Check for logging and monitoring configurations',
                pattern: /log|audit|monitor|event/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'warning',
                remediation: 'Configure comprehensive logging and monitoring for auditable events'
            }
        ]
    },
    {
        id: 'AU-4',
        family: 'AU',
        title: 'Audit Storage Capacity',
        description: 'Organizations must allocate audit storage capacity and configure auditing to reduce likelihood of capacity being exceeded.',
        standard: 'FedRAMP',
        severity: 'warning',
        level: [FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'AU-4-1',
                message: 'Verify audit storage capacity configuration',
                pattern: /storage|capacity|retention|size/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'warning',
                remediation: 'Configure adequate audit storage capacity with proper retention policies'
            }
        ]
    },
    // Configuration Management (CM)
    {
        id: 'CM-2',
        family: 'CM',
        title: 'Baseline Configuration',
        description: 'Organizations must develop, document, and maintain a current baseline configuration.',
        standard: 'FedRAMP',
        severity: 'info',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'CM-2-1',
                message: 'Check for configuration management practices',
                pattern: /version|baseline|configuration|template/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'info',
                remediation: 'Implement configuration management with version control and baseline documentation'
            }
        ]
    },
    {
        id: 'CM-6',
        family: 'CM',
        title: 'Configuration Settings',
        description: 'Organizations must establish and document configuration settings that reflect the most restrictive mode.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'CM-6-1',
                message: 'Verify secure configuration settings',
                pattern: /encrypt|ssl|tls|secure|setting/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Apply secure configuration settings with encryption and security best practices'
            }
        ]
    },
    // Identification and Authentication (IA)
    {
        id: 'IA-2',
        family: 'IA',
        title: 'Identification and Authentication',
        description: 'The information system uniquely identifies and authenticates organizational users.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'IA-2-1',
                message: 'Check for authentication mechanisms',
                pattern: /auth|authentication|identity|mfa|2fa/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Implement strong authentication mechanisms including multi-factor authentication'
            }
        ]
    },
    // System and Communications Protection (SC)
    {
        id: 'SC-7',
        family: 'SC',
        title: 'Boundary Protection',
        description: 'The information system monitors and controls communications at external boundaries.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'SC-7-1',
                message: 'Verify network boundary protection',
                pattern: /firewall|security_group|network_acl|boundary/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Configure proper network boundary protection with firewalls and security groups'
            }
        ]
    },
    {
        id: 'SC-8',
        family: 'SC',
        title: 'Transmission Confidentiality and Integrity',
        description: 'The information system protects the confidentiality and integrity of transmitted information.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'SC-8-1',
                message: 'Check for encryption in transit',
                pattern: /https|tls|ssl|encryption|certificate/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Implement encryption for data in transit using TLS/SSL protocols'
            }
        ]
    },
    {
        id: 'SC-28',
        family: 'SC',
        title: 'Protection of Information at Rest',
        description: 'The information system protects the confidentiality and integrity of information at rest.',
        standard: 'FedRAMP',
        severity: 'error',
        level: [FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'SC-28-1',
                message: 'Check for encryption at rest',
                pattern: /encrypt.*rest|kms|key.*management/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'error',
                remediation: 'Implement encryption for data at rest using appropriate key management'
            }
        ]
    },
    // System and Information Integrity (SI)
    {
        id: 'SI-4',
        family: 'SI',
        title: 'Information System Monitoring',
        description: 'The organization monitors the information system to detect attacks and indicators of potential attacks.',
        standard: 'FedRAMP',
        severity: 'warning',
        level: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        checks: [
            {
                id: 'SI-4-1',
                message: 'Verify monitoring and alerting configurations',
                pattern: /monitor|alert|intrusion|detection/i,
                fileTypes: ['.tf', '.yaml', '.yml', '.json'],
                severity: 'warning',
                remediation: 'Configure comprehensive monitoring and intrusion detection systems'
            }
        ]
    }
];

export function getControlsByLevel(level: FedRAMPLevel): ComplianceControl[] {
    return FEDRAMP_CONTROLS.filter(control => control.level && control.level.includes(level));
}
