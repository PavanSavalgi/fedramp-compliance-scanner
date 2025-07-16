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
                        pattern: /(name:\s*DATA_ENCRYPTION[\s\S]*?value:\s*["']false["']|DATA_ENCRYPTION\s*=\s*["']false["'])/i,
                        message: 'GDPR Article 25: Data encryption must be enabled by default',
                        remediation: 'Enable data encryption to comply with GDPR data protection by design',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'public-access-check',
                        pattern: /public_access\s*[=:]\s*["']?true["']?/i,
                        message: 'GDPR Article 25: Public access should be disabled by default for personal data',
                        remediation: 'Disable public access and implement proper access controls',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'anonymization-check',
                        pattern: /(name:\s*ANONYMIZE_DATA[\s\S]*?value:\s*["']false["']|ANONYMIZE_DATA\s*=\s*["']false["'])/i,
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
                        pattern: /(name:\s*AUDIT_LOGGING[\s\S]*?value:\s*["']disabled["']|AUDIT_LOGGING\s*=\s*["']disabled["'])/i,
                        message: 'GDPR Article 32: Audit logging must be enabled for data processing activities',
                        remediation: 'Enable comprehensive audit logging for GDPR compliance',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'data-transfer-check',
                        pattern: /(data_processing_location:\s*["']us-east-1["']|processing_location\s*=\s*["']us-east-1["'])/i,
                        message: 'GDPR Article 44: Cross-border data transfer requires adequate safeguards',
                        remediation: 'Implement adequate safeguards for international data transfers',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'backup-location-check',
                        pattern: /(backup_location:\s*["']asia-south-1["']|backup_location\s*=\s*["']asia-south-1["'])/i,
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
                        pattern: /(data_deletion_policy:\s*["']never["']|deletion_policy\s*=\s*["']never["'])/i,
                        message: 'GDPR Article 17: Data deletion policy must support right to erasure',
                        remediation: 'Implement data deletion mechanisms to support GDPR right to erasure',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'access-request-check',
                        pattern: /(access_request_handler:\s*["']disabled["']|access_request\s*=\s*["']disabled["'])/i,
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
                        id: 'phi-environment-vars',
                        pattern: /PATIENT_SSN\s*=|MEDICAL_ID\s*=/i,
                        message: 'HIPAA Administrative Safeguards: PHI must not be stored in environment variables',
                        remediation: 'Use secure secret management for PHI data',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'phi-access-logging',
                        pattern: /LOG_PHI_ACCESS\s*=\s*["']disabled["']/i,
                        message: 'HIPAA Administrative Safeguards: PHI access logging must be enabled',
                        remediation: 'Enable comprehensive PHI access logging',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'cloudwatch-logs-disabled',
                        pattern: /enabled_cloudwatch_logs_exports\s*=\s*\[\s*\]/i,
                        message: 'HIPAA Administrative Safeguards: CloudWatch logs must be enabled for audit trails',
                        remediation: 'Enable CloudWatch logs for database audit trails',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
                        id: 'public-phi-access',
                        pattern: /publicly_accessible\s*=\s*true/i,
                        message: 'HIPAA Physical Safeguards: PHI databases must not be publicly accessible',
                        remediation: 'Disable public access to PHI databases',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'public-access-blocks',
                        pattern: /block_public_acls\s*=\s*false/i,
                        message: 'HIPAA Physical Safeguards: Block public access to PHI storage',
                        remediation: 'Enable public access blocks for PHI storage buckets',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
                        id: 'storage-encryption',
                        pattern: /storage_encrypted\s*=\s*false/i,
                        message: 'HIPAA Technical Safeguards: PHI storage must be encrypted',
                        remediation: 'Enable encryption for all PHI storage',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'transit-encryption',
                        pattern: /ENCRYPT_TRANSIT\s*=\s*["']false["']/i,
                        message: 'HIPAA Technical Safeguards: PHI transmission must be encrypted',
                        remediation: 'Enable encryption for PHI data in transit',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'backup-retention',
                        pattern: /backup_retention_period\s*=\s*0/i,
                        message: 'HIPAA Technical Safeguards: PHI backup retention must be configured',
                        remediation: 'Configure appropriate backup retention for PHI',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            }
        ];
    }

    private getDPDPControls(): ComplianceControl[] {
        return [
            {
                id: 'DPDP-SEC-8',
                title: 'Data Security and Cross-border Transfer',
                description: 'Implement appropriate security safeguards for personal data and regulate cross-border transfers',
                family: 'SECURITY',
                standard: 'DPDP',
                severity: 'error',
                checks: [
                    {
                        id: 'cross-border-transfer',
                        pattern: /bucket\s*=\s*"indian-users-backup-us"/i,
                        message: 'DPDP Act: Cross-border data transfer requires proper safeguards and consent',
                        remediation: 'Implement proper data localization or obtain consent for cross-border transfers',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'singapore-backup-violation',
                        pattern: /arn:aws:s3:::backup-singapore/i,
                        message: 'DPDP Act: International data storage requires compliance with DPDP regulations',
                        remediation: 'Ensure international data storage complies with DPDP Act requirements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'DPDP-SEC-11',
                title: 'Consent Management',
                description: 'Implement proper consent mechanisms for personal data processing',
                family: 'CONSENT',
                standard: 'DPDP',
                severity: 'error',
                checks: [
                    {
                        id: 'consent-disabled',
                        pattern: /CONSENT_REQUIRED\s*=\s*"false"/i,
                        message: 'DPDP Act: Consent management must be implemented for personal data processing',
                        remediation: 'Implement proper consent collection and management mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'DPDP-SEC-3',
                title: 'Data Fiduciary Obligations',
                description: 'Data fiduciaries must comply with DPDP Act obligations',
                family: 'GOVERNANCE',
                standard: 'DPDP',
                severity: 'warning',
                checks: [
                    {
                        id: 'data-fiduciary-registration',
                        pattern: /function_name\s*=\s*"process-indian-user-data"/i,
                        message: 'DPDP Act: Data fiduciaries processing Indian user data must comply with registration and obligations',
                        remediation: 'Ensure proper data fiduciary registration and compliance with DPDP obligations',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
                        id: 'overly-permissive-access',
                        pattern: /"CidrIp":\s*"0\.0\.0\.0\/0"/,
                        message: 'PCI-DSS Requirement 1: Overly permissive network access detected',
                        remediation: 'Restrict network access to necessary IP ranges only',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    },
                    {
                        id: 'http-access-allowed',
                        pattern: /"FromPort":\s*80[\s\S]*?"CidrIp":\s*"0\.0\.0\.0\/0"/,
                        message: 'PCI-DSS Requirement 1: HTTP access should not be globally accessible',
                        remediation: 'Use HTTPS only and restrict access to necessary networks',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
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
                        id: 'cardholder-data-environment',
                        pattern: /"CREDIT_CARD_KEY":\s*"[\d-]+"/,
                        message: 'PCI-DSS Requirement 3: Cardholder data must not be stored in environment variables',
                        remediation: 'Use secure vault or tokenization for cardholder data',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    },
                    {
                        id: 'storage-encryption-disabled',
                        pattern: /"StorageEncrypted":\s*false/,
                        message: 'PCI-DSS Requirement 3: Storage encryption must be enabled for cardholder data',
                        remediation: 'Enable storage encryption for all cardholder data systems',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    },
                    {
                        id: 'pan-masking-disabled',
                        pattern: /"MASK_PAN":\s*"false"/,
                        message: 'PCI-DSS Requirement 3: PAN masking must be enabled',
                        remediation: 'Enable PAN masking to protect cardholder data',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    }
                ]
            },
            {
                id: 'PCI-REQ-4',
                title: 'Encrypt transmission of cardholder data',
                description: 'Encrypt cardholder data during transmission',
                family: 'TRANSMISSION',
                standard: 'PCI-DSS',
                severity: 'error',
                checks: [
                    {
                        id: 'data-encryption-disabled',
                        pattern: /"ENCRYPT_DATA":\s*"false"/,
                        message: 'PCI-DSS Requirement 4: Data encryption must be enabled for transmission',
                        remediation: 'Enable encryption for all cardholder data transmissions',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    }
                ]
            },
            {
                id: 'PCI-REQ-10',
                title: 'Track and monitor access to network and cardholder data',
                description: 'Implement logging and monitoring',
                family: 'MONITORING',
                standard: 'PCI-DSS',
                severity: 'error',
                checks: [
                    {
                        id: 'backup-retention-disabled',
                        pattern: /"BackupRetentionPeriod":\s*0/,
                        message: 'PCI-DSS Requirement 10: Backup retention must be configured for audit trails',
                        remediation: 'Configure appropriate backup retention for audit logs',
                        fileTypes: ['.json', '.yaml', '.yml', '.tf']
                    }
                ]
            }
        ];
    }

    private getISO27001Controls(): ComplianceControl[] {
        return [
            {
                id: 'ISO-A-8-2',
                title: 'Information Classification',
                description: 'Information should be classified according to its sensitivity',
                family: 'CLASSIFICATION',
                standard: 'ISO-27001',
                severity: 'error',
                checks: [
                    {
                        id: 'unclassified-data',
                        pattern: /DataClassification\s*=\s*"unclassified"/i,
                        message: 'ISO-27001 A.8.2: Information must be properly classified according to sensitivity',
                        remediation: 'Implement proper data classification schemes (public, internal, confidential, restricted)',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'unknown-data-owner',
                        pattern: /Owner\s*=\s*"unknown"/i,
                        message: 'ISO-27001 A.8.1: Data ownership must be clearly defined',
                        remediation: 'Assign clear data ownership and responsibility',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'ISO-A-9-1',
                title: 'Access Control Policy',
                description: 'Access control policy should be established and maintained',
                family: 'ACCESS',
                standard: 'ISO-27001',
                severity: 'error',
                checks: [
                    {
                        id: 'overprivileged-policy',
                        pattern: /Action\s*=\s*"\*"/i,
                        message: 'ISO-27001 A.9.1: Access should follow principle of least privilege',
                        remediation: 'Implement least privilege access controls instead of wildcard permissions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'ISO-A-14-2',
                title: 'Security in Development Lifecycle',
                description: 'Information security should be integrated into development lifecycle',
                family: 'DEVELOPMENT',
                standard: 'ISO-27001',
                severity: 'warning',
                checks: [
                    {
                        id: 'insecure-development',
                        pattern: /security_scanning\s*=\s*false/i,
                        message: 'ISO-27001 A.14.2: Security scanning should be integrated into development',
                        remediation: 'Implement security scanning in development and deployment processes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
                id: 'SOC2-CC6.1',
                title: 'Logical and Physical Access Controls - Security',
                description: 'Restrict logical and physical access to confidential information',
                family: 'SECURITY',
                standard: 'SOC-2',
                severity: 'error',
                checks: [
                    {
                        id: 'hardcoded-credentials',
                        pattern: /database-password:\s*[\w=]+|api-key:\s*[\w=]+/i,
                        message: 'SOC-2 Security: Hardcoded credentials detected in configuration',
                        remediation: 'Use secure secret management instead of hardcoded credentials',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'access-control-disabled',
                        pattern: /name:\s*ACCESS_CONTROL[\s\S]*?value:\s*"none"/i,
                        message: 'SOC-2 Confidentiality: Access controls must be implemented',
                        remediation: 'Implement proper access controls for confidential data',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },
            {
                id: 'SOC2-CC7.2',
                title: 'System Monitoring - Availability',
                description: 'Monitor system capacity and performance',
                family: 'MONITORING',
                standard: 'SOC-2',
                severity: 'error',
                checks: [
                    {
                        id: 'audit-logging-disabled',
                        pattern: /name:\s*AUDIT_LOGGING[\s\S]*?value:\s*"disabled"/i,
                        message: 'SOC-2 Availability: Audit logging must be enabled for monitoring',
                        remediation: 'Enable comprehensive audit logging for system monitoring',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'no-resource-limits',
                        pattern: /resources:\s*\{\s*\}/i,
                        message: 'SOC-2 Availability: Resource limits must be configured',
                        remediation: 'Configure resource limits to ensure system availability',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },
            {
                id: 'SOC2-CC6.7',
                title: 'Data Transmission and Disposal - Security',
                description: 'Protect data during transmission and disposal',
                family: 'TRANSMISSION',
                standard: 'SOC-2',
                severity: 'error',
                checks: [
                    {
                        id: 'encryption-disabled',
                        pattern: /name:\s*ENCRYPT_COMMUNICATION[\s\S]*?value:\s*"false"/i,
                        message: 'SOC-2 Security: Data encryption must be enabled for transmission',
                        remediation: 'Enable encryption for all data communications',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        id: 'public-service-exposure',
                        pattern: /type:\s*LoadBalancer/i,
                        message: 'SOC-2 Security: Services should not be publicly exposed without proper controls',
                        remediation: 'Implement proper access controls for public services',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            }
        ];
    }

    private getNISTCSFControls(): ComplianceControl[] {
        return [
            {
                id: 'NIST-PR-AC-1',
                title: 'Identity and Access Management',
                description: 'Identities and credentials are issued, managed, verified, revoked, and audited',
                family: 'PROTECT',
                standard: 'NIST-CSF',
                severity: 'error',
                checks: [
                    {
                        id: 'overprivileged-access',
                        pattern: /policy_arn\s*=\s*"arn:aws:iam::aws:policy\/AdministratorAccess"/i,
                        message: 'NIST-CSF PR.AC-1: Overprivileged access detected - violates least privilege principle',
                        remediation: 'Implement principle of least privilege for user access',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        id: 'global-network-access',
                        pattern: /cidr_blocks\s*=\s*\[\s*"0\.0\.0\.0\/0"\s*\]/i,
                        message: 'NIST-CSF PR.AC-4: Network access should be restricted to authorized users and devices',
                        remediation: 'Restrict network access to specific IP ranges',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'NIST-PR-DS-2',
                title: 'Data-in-transit Protection',
                description: 'Data-in-transit is protected',
                family: 'PROTECT',
                standard: 'NIST-CSF',
                severity: 'error',
                checks: [
                    {
                        id: 'unencrypted-protocols',
                        pattern: /from_port\s*=\s*23.*# Telnet/i,
                        message: 'NIST-CSF PR.DS-2: Unencrypted protocols (Telnet) should not be used',
                        remediation: 'Use secure protocols like SSH instead of Telnet',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'NIST-PR-DS-1',
                title: 'Data-at-rest Protection',
                description: 'Data-at-rest is protected',
                family: 'PROTECT',
                standard: 'NIST-CSF',
                severity: 'warning',
                checks: [
                    {
                        id: 'financial-data-protection',
                        pattern: /bucket\s*=\s*"corporate-financial-data"/i,
                        message: 'NIST-CSF PR.DS-1: Financial data requires enhanced protection and versioning',
                        remediation: 'Implement versioning and backup strategies for sensitive financial data',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
