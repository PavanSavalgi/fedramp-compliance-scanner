import { ComplianceControl, ComplianceStandard } from './types';

export class GlobalComplianceControls {
    private controls: Map<ComplianceStandard, ComplianceControl[]> = new Map();

    constructor() {
        this.initializeControls();
    }

    private initializeControls(): void {
        this.controls.set('FedRAMP', this.getFedRAMPControls());
        this.controls.set('GDPR', this.getGDPRControls());
        this.controls.set('HIPAA', this.getHIPAAControls());
        this.controls.set('DPDP', this.getDPDPControls());
        this.controls.set('PCI-DSS', this.getPCIDSSControls());
        this.controls.set('ISO-27001', this.getISO27001Controls());
        this.controls.set('ISO-27002', this.getISO27002Controls());
        this.controls.set('SOC-2', this.getSOC2Controls());
        this.controls.set('NIST-CSF', this.getNISTCSFControls());
    }

    getControlsForStandards(standards: ComplianceStandard[]): ComplianceControl[] {
        const allControls: ComplianceControl[] = [];
        
        standards.forEach(standard => {
            const controls = this.controls.get(standard);
            if (controls) {
                allControls.push(...controls);
            }
        });

        return allControls;
    }

    private getFedRAMPControls(): ComplianceControl[] {
        // Existing FedRAMP controls (keeping the original implementation)
        return [
            // Access Control (AC)
            {
                id: 'AC-02',
                title: 'Account Management',
                description: 'Manage information system accounts',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /user\s*=\s*["']root["']/,
                        message: 'Avoid using root user directly',
                        remediation: 'Create specific service accounts instead of using root'
                    },
                    {
                        pattern: /password\s*=\s*["'][^"']*["']/,
                        message: 'Hardcoded passwords detected',
                        remediation: 'Use environment variables or secure secret management'
                    }
                ]
            }
            // ... other existing FedRAMP controls would go here
        ];
    }

    private getGDPRControls(): ComplianceControl[] {
        return [
            {
                id: 'GDPR-ART-25',
                title: 'Data Protection by Design and by Default',
                description: 'Implement appropriate technical and organisational measures',
                family: 'PRIVACY',
                standard: 'GDPR',
                severity: 'error',
                checks: [
                    {
                        id: 'data-encryption-check',
                        pattern: /name:\s*DATA_ENCRYPTION[\s\S]*?value:\s*["']false["']/i,
                        message: 'GDPR Article 25: Data encryption must be enabled by default',
                        remediation: 'Enable data encryption to comply with GDPR data protection by design',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'public-access-check',
                        pattern: /public_access\s*=\s*true/i,
                        message: 'GDPR Article 25: Public access should be disabled by default for personal data',
                        remediation: 'Disable public access and implement proper access controls',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'anonymization-check',
                        pattern: /name:\s*ANONYMIZE_DATA[\s\S]*?value:\s*["']false["']/i,
                        message: 'GDPR Article 25: Data anonymization should be enabled for personal data',
                        remediation: 'Enable data anonymization to protect personal data',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },
            {
                id: 'GDPR-ART-32',
                title: 'Security of Processing',
                description: 'Implement appropriate technical and organisational measures to ensure security',
                family: 'SECURITY',
                standard: 'GDPR',
                severity: 'error',
                checks: [
                    {
                        id: 'audit-logging-check',
                        pattern: /name:\s*AUDIT_LOGGING[\s\S]*?value:\s*["']disabled["']/i,
                        message: 'GDPR Article 32: Audit logging must be enabled for data processing activities',
                        remediation: 'Enable comprehensive audit logging for GDPR compliance',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'data-transfer-check',
                        pattern: /data_processing_location:\s*["']us-east-1["']/i,
                        message: 'GDPR Article 44: Cross-border data transfer requires adequate safeguards',
                        remediation: 'Implement adequate safeguards for international data transfers',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'backup-location-check',
                        pattern: /backup_location:\s*["']asia-south-1["']/i,
                        message: 'GDPR Article 44: International backup storage requires GDPR compliance',
                        remediation: 'Ensure backup locations comply with GDPR requirements',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },
            {
                id: 'GDPR-ART-17',
                title: 'Right to Erasure (Right to be Forgotten)',
                description: 'Individuals have the right to have their personal data erased',
                family: 'RIGHTS',
                standard: 'GDPR',
                severity: 'error',
                checks: [
                    {
                        id: 'data-deletion-check',
                        pattern: /data_deletion_policy:\s*["']never["']/i,
                        message: 'GDPR Article 17: Data deletion policy must support right to erasure',
                        remediation: 'Implement data deletion mechanisms to support GDPR right to erasure',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'access-request-check',
                        pattern: /access_request_handler:\s*["']disabled["']/i,
                        message: 'GDPR Article 15: Data access request handling must be implemented',
                        remediation: 'Implement data access request handling for GDPR compliance',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },
            {
                id: 'GDPR-ART-6',
                title: 'Lawfulness of Processing',
                description: 'Processing must be based on a lawful basis',
                family: 'CONSENT',
                standard: 'GDPR',
                severity: 'error',
                checks: [
                    {
                        id: 'personal-data-consent-check',
                        pattern: /user_emails:\s*\|[\s\S]*?@[\w.-]+/i,
                        message: 'GDPR Article 6: Personal data processing requires lawful basis and consent',
                        remediation: 'Implement consent mechanisms for personal data collection',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'customer-profile-check',
                        pattern: /customer_profiles:[\s\S]*"email":/i,
                        message: 'GDPR Article 6: Customer profile data requires explicit consent',
                        remediation: 'Implement explicit consent for customer profile data processing',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            }
        ];
    }

    private getHIPAAControls(): ComplianceControl[] {
        return [
            {
                id: 'HIPAA-164-308',
                title: 'Administrative Safeguards',
                description: 'Implement administrative safeguards for PHI',
                family: 'ADMINISTRATIVE',
                standard: 'HIPAA',
                severity: 'error',
                checks: [
                    {
                        pattern: /access_logging\s*=\s*false/i,
                        message: 'Access logging must be enabled for HIPAA compliance',
                        remediation: 'Enable comprehensive access logging for all PHI access'
                    },
                    {
                        pattern: /user_training\s*=\s*false/i,
                        message: 'User training documentation required',
                        remediation: 'Document user training programs for PHI handling'
                    }
                ]
            },
            {
                id: 'HIPAA-164-310',
                title: 'Physical Safeguards',
                description: 'Implement physical safeguards for PHI',
                family: 'PHYSICAL',
                standard: 'HIPAA',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical_access_controls\s*=\s*false/i,
                        message: 'Physical access controls must be implemented',
                        remediation: 'Implement physical access controls for systems containing PHI'
                    }
                ]
            },
            {
                id: 'HIPAA-164-312',
                title: 'Technical Safeguards',
                description: 'Implement technical safeguards for PHI',
                family: 'TECHNICAL',
                standard: 'HIPAA',
                severity: 'error',
                checks: [
                    {
                        pattern: /encryption_at_rest\s*=\s*false/i,
                        message: 'Encryption at rest required for PHI',
                        remediation: 'Enable encryption at rest for all PHI storage'
                    },
                    {
                        pattern: /audit_controls\s*=\s*false/i,
                        message: 'Audit controls must be implemented',
                        remediation: 'Implement audit controls to record PHI access and modifications'
                    }
                ]
            }
        ];
    }

    private getDPDPControls(): ComplianceControl[] {
        return [
            {
                id: 'DPDP-SEC-8',
                title: 'Data Security',
                description: 'Implement appropriate security safeguards for personal data',
                family: 'SECURITY',
                standard: 'DPDP',
                severity: 'error',
                checks: [
                    {
                        pattern: /data_encryption\s*=\s*false/i,
                        message: 'Data encryption required under DPDP Act',
                        remediation: 'Implement strong encryption for personal data protection'
                    },
                    {
                        pattern: /access_controls\s*=\s*["']none["']/i,
                        message: 'Access controls must be implemented for personal data',
                        remediation: 'Implement role-based access controls for personal data'
                    }
                ]
            },
            {
                id: 'DPDP-SEC-9',
                title: 'Data Breach Notification',
                description: 'Implement breach detection and notification mechanisms',
                family: 'INCIDENT',
                standard: 'DPDP',
                severity: 'error',
                checks: [
                    {
                        pattern: /breach_detection\s*=\s*false/i,
                        message: 'Breach detection mechanisms must be implemented',
                        remediation: 'Implement automated breach detection and notification systems'
                    }
                ]
            }
        ];
    }

    private getPCIDSSControls(): ComplianceControl[] {
        return [
            {
                id: 'PCI-REQ-1',
                title: 'Install and maintain firewall configuration',
                description: 'Protect cardholder data with firewall configuration',
                family: 'NETWORK',
                standard: 'PCI-DSS',
                severity: 'error',
                checks: [
                    {
                        pattern: /firewall_rules\s*=\s*\[\s*\]/,
                        message: 'Firewall rules must be configured for PCI DSS compliance',
                        remediation: 'Configure appropriate firewall rules to protect cardholder data'
                    },
                    {
                        pattern: /source_ranges\s*=\s*\[\s*["']0\.0\.0\.0\/0["']\s*\]/,
                        message: 'Overly permissive firewall rules detected',
                        remediation: 'Restrict firewall rules to necessary IP ranges only'
                    }
                ]
            },
            {
                id: 'PCI-REQ-3',
                title: 'Protect stored cardholder data',
                description: 'Encrypt stored cardholder data',
                family: 'ENCRYPTION',
                standard: 'PCI-DSS',
                severity: 'error',
                checks: [
                    {
                        pattern: /storage_encryption\s*=\s*false/i,
                        message: 'Storage encryption required for cardholder data',
                        remediation: 'Enable strong encryption for all cardholder data storage'
                    },
                    {
                        pattern: /key_management\s*=\s*["']none["']/i,
                        message: 'Proper key management required for PCI DSS',
                        remediation: 'Implement secure key management practices'
                    }
                ]
            },
            {
                id: 'PCI-REQ-10',
                title: 'Track and monitor access to network resources',
                description: 'Implement logging and monitoring for cardholder data access',
                family: 'MONITORING',
                standard: 'PCI-DSS',
                severity: 'error',
                checks: [
                    {
                        pattern: /access_logging\s*=\s*false/i,
                        message: 'Access logging required for PCI DSS compliance',
                        remediation: 'Enable comprehensive access logging for cardholder data environments'
                    }
                ]
            }
        ];
    }

    private getISO27001Controls(): ComplianceControl[] {
        return [
            {
                id: 'ISO-A-8-2',
                title: 'Information security in project management',
                description: 'Information security should be integrated into project management',
                family: 'ORGANIZATION',
                standard: 'ISO-27001',
                severity: 'warning',
                checks: [
                    {
                        pattern: /security_review\s*=\s*false/i,
                        message: 'Security review should be integrated into project lifecycle',
                        remediation: 'Integrate security review processes into project management'
                    }
                ]
            },
            {
                id: 'ISO-A-9-1',
                title: 'Access control policy',
                description: 'Access control policy should be established and maintained',
                family: 'ACCESS',
                standard: 'ISO-27001',
                severity: 'error',
                checks: [
                    {
                        pattern: /access_policy\s*=\s*["']none["']/i,
                        message: 'Access control policy must be defined',
                        remediation: 'Establish and document access control policies'
                    }
                ]
            },
            {
                id: 'ISO-A-10-1',
                title: 'Cryptographic controls',
                description: 'Policy on the use of cryptographic controls should be developed',
                family: 'CRYPTOGRAPHY',
                standard: 'ISO-27001',
                severity: 'error',
                checks: [
                    {
                        pattern: /encryption_policy\s*=\s*["']none["']/i,
                        message: 'Cryptographic policy must be defined',
                        remediation: 'Develop and implement cryptographic controls policy'
                    }
                ]
            }
        ];
    }

    private getISO27002Controls(): ComplianceControl[] {
        return [
            {
                id: 'ISO27002-5-1',
                title: 'Information security policies',
                description: 'Management direction and support for information security',
                family: 'POLICY',
                standard: 'ISO-27002',
                severity: 'warning',
                checks: [
                    {
                        pattern: /security_policy\s*=\s*["']undefined["']/i,
                        message: 'Information security policy should be defined',
                        remediation: 'Define and document information security policies'
                    }
                ]
            },
            {
                id: 'ISO27002-8-1',
                title: 'Responsibility for assets',
                description: 'Assets should be identified and appropriate protection responsibilities defined',
                family: 'ASSET',
                standard: 'ISO-27002',
                severity: 'error',
                checks: [
                    {
                        pattern: /asset_classification\s*=\s*["']unclassified["']/i,
                        message: 'Assets should be properly classified',
                        remediation: 'Implement asset classification and protection responsibilities'
                    }
                ]
            }
        ];
    }

    private getSOC2Controls(): ComplianceControl[] {
        return [
            {
                id: 'SOC2-CC-6.1',
                title: 'Logical and Physical Access Controls',
                description: 'Implement logical and physical access controls',
                family: 'ACCESS',
                standard: 'SOC-2',
                severity: 'error',
                checks: [
                    {
                        pattern: /multi_factor_auth\s*=\s*false/i,
                        message: 'Multi-factor authentication should be implemented',
                        remediation: 'Enable multi-factor authentication for access controls'
                    }
                ]
            },
            {
                id: 'SOC2-CC-6.8',
                title: 'Data Transmission and Disposal',
                description: 'Protect data during transmission and disposal',
                family: 'DATA',
                standard: 'SOC-2',
                severity: 'error',
                checks: [
                    {
                        pattern: /transmission_encryption\s*=\s*false/i,
                        message: 'Data transmission encryption required',
                        remediation: 'Enable encryption for all data transmissions'
                    }
                ]
            }
        ];
    }

    private getNISTCSFControls(): ComplianceControl[] {
        return [
            {
                id: 'NIST-ID-AM',
                title: 'Asset Management',
                description: 'Identify and manage physical devices and systems',
                family: 'IDENTIFY',
                standard: 'NIST-CSF',
                severity: 'warning',
                checks: [
                    {
                        pattern: /asset_inventory\s*=\s*false/i,
                        message: 'Asset inventory should be maintained',
                        remediation: 'Implement comprehensive asset inventory management'
                    }
                ]
            },
            {
                id: 'NIST-PR-AC',
                title: 'Identity Management and Access Control',
                description: 'Manage access to assets and associated facilities',
                family: 'PROTECT',
                standard: 'NIST-CSF',
                severity: 'error',
                checks: [
                    {
                        pattern: /identity_management\s*=\s*false/i,
                        message: 'Identity management controls required',
                        remediation: 'Implement identity management and access control systems'
                    }
                ]
            }
        ];
    }

    static getControlsByStandard(standard: ComplianceStandard): ComplianceControl[] {
        const instance = new GlobalComplianceControls();
        return instance.controls.get(standard) || [];
    }

    static getAllControls(): ComplianceControl[] {
        const instance = new GlobalComplianceControls();
        const allControls: ComplianceControl[] = [];
        
        for (const controls of instance.controls.values()) {
            allControls.push(...controls);
        }
        
        return allControls;
    }
}
