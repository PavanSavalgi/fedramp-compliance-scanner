import { ComplianceControl, ComplianceStandard } from './types';

export class GlobalComplianceControls {
    private controls: Map<ComplianceStandard, ComplianceControl[]> = new Map();

    constructor() {
        this.initializeControls();
    }

    private initializeControls(): void {
        this.controls.set('FedRAMP', this.getFedRAMPControls());
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
        return [
            // EXISTING CONTROLS (Enhanced)
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
                        message: 'FedRAMP AC-2: Avoid using root user directly',
                        remediation: 'Create specific service accounts instead of using root',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /password\s*=\s*["'][^"']*["']/,
                        message: 'FedRAMP AC-2: Hardcoded passwords detected',
                        remediation: 'Use environment variables or secure secret management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // NEW CRITICAL MISSING FEDRAMP CONTROLS
            {
                id: 'AC-01',
                title: 'Access Control Policy and Procedures',
                description: 'The organization develops, documents, and disseminates access control policy and procedures.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /access[_-]?control[_-]?policy|security[_-]?policy|rbac[_-]?policy/i,
                        message: 'FedRAMP AC-1: Check for documented access control policies',
                        remediation: 'Document formal access control policies and procedures',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /policy[_-]?review|annual[_-]?review|policy[_-]?update/i,
                        message: 'FedRAMP AC-1: Verify policy review and update procedures',
                        remediation: 'Establish regular policy review and update procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Access Control
            {
                id: 'AC-03',
                title: 'Access Enforcement',
                description: 'The information system enforces approved authorizations for logical access.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /access[_-]?enforcement|access[_-]?control[_-]?enforcement|authorization[_-]?enforcement/i,
                        message: 'FedRAMP AC-3: Check for access enforcement mechanisms',
                        remediation: 'Implement access enforcement for all system resources',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /rbac|abac|access[_-]?control[_-]?list|permission[_-]?enforcement/i,
                        message: 'FedRAMP AC-3: Verify access control enforcement mechanisms',
                        remediation: 'Deploy RBAC, ABAC, or ACL-based access enforcement',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-04',
                title: 'Information Flow Enforcement',
                description: 'The information system controls information flows within and between system components.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /network[_-]?segmentation|traffic[_-]?control|subnet|security[_-]?group/i,
                        message: 'FedRAMP AC-4: Check for network segmentation and traffic control',
                        remediation: 'Implement network segmentation and information flow controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /data[_-]?flow|security[_-]?domain|cross[_-]?domain|dmz/i,
                        message: 'FedRAMP AC-4: Verify data flow restrictions between security domains',
                        remediation: 'Configure proper data flow restrictions and security domains',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-06',
                title: 'Least Privilege',
                description: 'The organization employs the principle of least privilege.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /AdministratorAccess|\*:\*|Action\s*=\s*\"\*\"|root[_-]?access|sudo[_-]?all/i,
                        message: 'FedRAMP AC-6: Check for overprivileged access patterns',
                        remediation: 'Apply least privilege principle - restrict excessive permissions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /privilege[_-]?escalation|sudo[_-]?access|admin[_-]?rights/i,
                        message: 'FedRAMP AC-6: Verify privilege escalation controls',
                        remediation: 'Implement controlled privilege escalation mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-17',
                title: 'Remote Access',
                description: 'The organization establishes usage restrictions and implementation guidance for remote access.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /vpn|remote[_-]?access|ssh|rdp|bastion[_-]?host/i,
                        message: 'FedRAMP AC-17: Check for secure remote access configurations',
                        remediation: 'Configure secure remote access with proper authentication',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /remote[_-]?session[_-]?log|vpn[_-]?monitoring|access[_-]?audit/i,
                        message: 'FedRAMP AC-17: Verify remote access monitoring and logging',
                        remediation: 'Enable comprehensive remote access monitoring and logging',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // AUDIT AND ACCOUNTABILITY (AU) FAMILY
            {
                id: 'AU-01',
                title: 'Audit and Accountability Policy and Procedures',
                description: 'The organization develops, documents, and disseminates audit and accountability policy.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?policy|logging[_-]?policy|accountability[_-]?policy/i,
                        message: 'FedRAMP AU-1: Check for documented audit policies',
                        remediation: 'Document formal audit and accountability policies',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /audit[_-]?procedure|log[_-]?management|event[_-]?monitoring/i,
                        message: 'FedRAMP AU-1: Verify audit procedure documentation',
                        remediation: 'Document audit procedures and log management practices',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-02',
                title: 'Audit Events',
                description: 'The organization determines that the information system is capable of auditing events.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?events|auditable[_-]?events|security[_-]?events/i,
                        message: 'FedRAMP AU-2: Check for audit event identification',
                        remediation: 'Define and implement auditable security events',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /event[_-]?logging|security[_-]?logging|audit[_-]?logging/i,
                        message: 'FedRAMP AU-2: Verify audit event logging capabilities',
                        remediation: 'Enable comprehensive audit event logging',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-03',
                title: 'Content of Audit Records',
                description: 'The information system generates audit records with specific content requirements.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?format|log[_-]?format|event[_-]?details|timestamp|user[_-]?id/i,
                        message: 'FedRAMP AU-3: Check for comprehensive audit record content',
                        remediation: 'Configure audit records to include required content elements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /source[_-]?ip|event[_-]?type|outcome|resource[_-]?accessed/i,
                        message: 'FedRAMP AU-3: Verify audit record completeness',
                        remediation: 'Ensure audit records contain all required information',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-04',
                title: 'Audit Storage Capacity',
                description: 'The organization allocates audit record storage capacity.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?storage|log[_-]?storage|audit[_-]?capacity/i,
                        message: 'FedRAMP AU-4: Check for audit storage capacity planning',
                        remediation: 'Allocate sufficient audit record storage capacity',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /log[_-]?retention|audit[_-]?retention|storage[_-]?capacity/i,
                        message: 'FedRAMP AU-4: Verify audit storage and retention settings',
                        remediation: 'Configure appropriate audit storage and retention policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-06',
                title: 'Audit Review, Analysis, and Reporting',
                description: 'The organization reviews and analyzes information system audit records.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /audit[_-]?analysis|log[_-]?review|siem|security[_-]?monitoring/i,
                        message: 'FedRAMP AU-6: Check for audit analysis and review processes',
                        remediation: 'Implement automated audit analysis and review processes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /audit[_-]?report|compliance[_-]?report|security[_-]?dashboard/i,
                        message: 'FedRAMP AU-6: Verify audit reporting mechanisms',
                        remediation: 'Configure automated audit reporting and alerting',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-09',
                title: 'Protection of Audit Information',
                description: 'The information system protects audit information and audit tools.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /log[_-]?encryption|audit[_-]?integrity|log[_-]?backup/i,
                        message: 'FedRAMP AU-9: Check for audit log protection mechanisms',
                        remediation: 'Implement encryption and integrity protection for audit logs',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /audit[_-]?tool[_-]?access|log[_-]?admin|audit[_-]?permission/i,
                        message: 'FedRAMP AU-9: Verify audit tool access controls',
                        remediation: 'Restrict access to audit tools and audit information',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // CONFIGURATION MANAGEMENT (CM) FAMILY
            {
                id: 'CM-01',
                title: 'Configuration Management Policy and Procedures',
                description: 'The organization develops, documents, and disseminates configuration management policy.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /configuration[_-]?management[_-]?policy|change[_-]?control[_-]?policy/i,
                        message: 'FedRAMP CM-1: Check for documented configuration management policies',
                        remediation: 'Document formal configuration management policies and procedures',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /config[_-]?control|baseline[_-]?management|change[_-]?procedure/i,
                        message: 'FedRAMP CM-1: Verify configuration control procedures',
                        remediation: 'Establish configuration control and change management procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-02',
                title: 'Baseline Configuration',
                description: 'The organization develops, documents, and maintains baseline configurations.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /baseline[_-]?configuration|configuration[_-]?baseline|system[_-]?baseline/i,
                        message: 'FedRAMP CM-2: Check for baseline configuration management',
                        remediation: 'Establish and maintain baseline configurations for all systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /configuration[_-]?management|config[_-]?baseline|standard[_-]?configuration/i,
                        message: 'FedRAMP CM-2: Verify configuration management processes',
                        remediation: 'Implement configuration management and baseline maintenance',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-03',
                title: 'Configuration Change Control',
                description: 'The organization determines the types of changes that are configuration-controlled.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /change[_-]?control|approval[_-]?process|change[_-]?request/i,
                        message: 'FedRAMP CM-3: Check for change control processes',
                        remediation: 'Implement formal change control processes for system configurations',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        pattern: /change[_-]?testing|config[_-]?validation|test[_-]?environment/i,
                        message: 'FedRAMP CM-3: Verify configuration change testing',
                        remediation: 'Test configuration changes before production deployment',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },

            {
                id: 'CM-06',
                title: 'Configuration Settings',
                description: 'The organization establishes and documents configuration settings.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /configuration[_-]?settings|security[_-]?configuration|hardening[_-]?configuration/i,
                        message: 'FedRAMP CM-6: Check for security configuration settings',
                        remediation: 'Establish and document security configuration settings',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cis[_-]?benchmark|security[_-]?hardening|configuration[_-]?guide/i,
                        message: 'FedRAMP CM-6: Verify security hardening standards',
                        remediation: 'Apply security hardening and configuration guides',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-07',
                title: 'Least Functionality',
                description: 'The organization configures the information system to provide only essential capabilities.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /unnecessary[_-]?service|unused[_-]?port|default[_-]?service|demo[_-]?application/i,
                        message: 'FedRAMP CM-7: Check for unnecessary services and functionality',
                        remediation: 'Disable unnecessary services and functionality',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /minimal[_-]?install|hardened[_-]?image|stripped[_-]?down/i,
                        message: 'FedRAMP CM-7: Verify minimal system configuration',
                        remediation: 'Configure systems with minimal necessary functionality',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-08',
                title: 'Information System Component Inventory',
                description: 'The organization develops and documents an inventory of information system components.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /component[_-]?inventory|asset[_-]?inventory|system[_-]?catalog/i,
                        message: 'FedRAMP CM-8: Check for system component inventory',
                        remediation: 'Maintain current inventory of all system components',
                        fileTypes: ['.yaml', '.yml', '.json', '.csv', '.txt']
                    },
                    {
                        pattern: /inventory[_-]?update|asset[_-]?tracking|component[_-]?register/i,
                        message: 'FedRAMP CM-8: Verify inventory update processes',
                        remediation: 'Implement automated inventory tracking and updates',
                        fileTypes: ['.yaml', '.yml', '.json']
                    }
                ]
            },

            // CONTINGENCY PLANNING (CP) FAMILY
            {
                id: 'CP-01',
                title: 'Contingency Planning Policy and Procedures',
                description: 'The organization develops, documents, and disseminates contingency planning policy.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /contingency[_-]?plan|disaster[_-]?recovery[_-]?policy|business[_-]?continuity[_-]?policy/i,
                        message: 'FedRAMP CP-1: Check for documented contingency planning policies',
                        remediation: 'Document formal contingency planning policies and procedures',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /emergency[_-]?response|incident[_-]?procedure|recovery[_-]?procedure/i,
                        message: 'FedRAMP CP-1: Verify emergency response procedures',
                        remediation: 'Document emergency response and recovery procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CP-02',
                title: 'Contingency Plan',
                description: 'The organization develops a contingency plan for the information system.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /contingency[_-]?plan|disaster[_-]?recovery[_-]?plan|business[_-]?continuity[_-]?plan/i,
                        message: 'FedRAMP CP-2: Check for comprehensive contingency plan',
                        remediation: 'Develop comprehensive contingency plan for system recovery',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /plan[_-]?testing|recovery[_-]?test|contingency[_-]?exercise/i,
                        message: 'FedRAMP CP-2: Verify plan testing and updates',
                        remediation: 'Regularly test and update contingency plans',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CP-09',
                title: 'Information System Backup',
                description: 'The organization conducts backups of user-level and system-level information.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /backup[_-]?system|automated[_-]?backup|backup[_-]?schedule/i,
                        message: 'FedRAMP CP-9: Check for automated backup systems',
                        remediation: 'Implement automated backup systems for critical data',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /backup[_-]?test|restore[_-]?test|backup[_-]?validation/i,
                        message: 'FedRAMP CP-9: Verify backup testing and restoration',
                        remediation: 'Regularly test backup and restoration procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // IDENTIFICATION AND AUTHENTICATION (IA) FAMILY
            {
                id: 'IA-02',
                title: 'Identification and Authentication (Organizational Users)',
                description: 'The information system uniquely identifies and authenticates organizational users.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /user[_-]?identification|user[_-]?authentication|organizational[_-]?users/i,
                        message: 'FedRAMP IA-2: Check for user identification and authentication',
                        remediation: 'Implement unique identification and authentication for all users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /unique[_-]?identifier|user[_-]?account|authentication[_-]?mechanism/i,
                        message: 'FedRAMP IA-2: Verify unique user identification mechanisms',
                        remediation: 'Ensure unique identifiers and authentication for each user',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // INCIDENT RESPONSE (IR) FAMILY
            {
                id: 'IR-01',
                title: 'Incident Response Policy and Procedures',
                description: 'The organization develops, documents, and disseminates incident response policy.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?policy|security[_-]?incident[_-]?policy/i,
                        message: 'FedRAMP IR-1: Check for documented incident response policies',
                        remediation: 'Document formal incident response policies and procedures',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?handling|response[_-]?procedure|escalation[_-]?procedure/i,
                        message: 'FedRAMP IR-1: Verify incident handling procedures',
                        remediation: 'Document incident handling and escalation procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IR-04',
                title: 'Incident Handling',
                description: 'The organization implements an incident handling capability.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?detection|security[_-]?monitoring|alert[_-]?system/i,
                        message: 'FedRAMP IR-4: Check for incident detection and analysis capabilities',
                        remediation: 'Implement incident detection and analysis capabilities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?containment|threat[_-]?eradication|security[_-]?response/i,
                        message: 'FedRAMP IR-4: Verify incident containment and eradication',
                        remediation: 'Configure incident containment and eradication mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IR-06',
                title: 'Incident Reporting',
                description: 'The organization reports security incidents to appropriate authorities.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?reporting|security[_-]?notification|alert[_-]?escalation/i,
                        message: 'FedRAMP IR-6: Check for incident reporting mechanisms',
                        remediation: 'Configure automated incident reporting and notification',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /external[_-]?reporting|regulatory[_-]?notification|authority[_-]?contact/i,
                        message: 'FedRAMP IR-6: Verify external reporting requirements',
                        remediation: 'Implement reporting to appropriate external authorities',
                        fileTypes: ['.yaml', '.yml', '.json']
                    }
                ]
            },

            // RISK ASSESSMENT (RA) FAMILY
            {
                id: 'RA-01',
                title: 'Risk Assessment Policy and Procedures',
                description: 'The organization develops, documents, and disseminates risk assessment policy.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /risk[_-]?assessment[_-]?policy|risk[_-]?management[_-]?policy/i,
                        message: 'FedRAMP RA-1: Check for documented risk assessment policies',
                        remediation: 'Document formal risk assessment policies and procedures',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /risk[_-]?procedure|assessment[_-]?methodology|risk[_-]?framework/i,
                        message: 'FedRAMP RA-1: Verify risk assessment procedures',
                        remediation: 'Document risk assessment procedures and methodologies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'RA-03',
                title: 'Risk Assessment',
                description: 'The organization conducts risk assessments of the information system.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /risk[_-]?assessment|threat[_-]?analysis|vulnerability[_-]?assessment/i,
                        message: 'FedRAMP RA-3: Check for documented risk assessments',
                        remediation: 'Conduct and document comprehensive risk assessments',
                        fileTypes: ['.md', '.txt', '.pdf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /risk[_-]?update|assessment[_-]?review|risk[_-]?reassessment/i,
                        message: 'FedRAMP RA-3: Verify risk assessment updates',
                        remediation: 'Regularly update and review risk assessments',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'RA-05',
                title: 'Vulnerability Scanning',
                description: 'The organization scans for vulnerabilities in the information system.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /vulnerability[_-]?scan|security[_-]?scan|penetration[_-]?test/i,
                        message: 'FedRAMP RA-5: Check for vulnerability scanning implementation',
                        remediation: 'Implement regular vulnerability scanning and assessment',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /vulnerability[_-]?remediation|scan[_-]?report|security[_-]?dashboard/i,
                        message: 'FedRAMP RA-5: Verify remediation tracking and reporting',
                        remediation: 'Track and report on vulnerability remediation activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SYSTEM AND COMMUNICATIONS PROTECTION (SC) FAMILY
            {
                id: 'SC-07',
                title: 'Boundary Protection',
                description: 'The information system monitors and controls communications at external boundaries.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /boundary[_-]?protection|network[_-]?boundary|perimeter[_-]?security/i,
                        message: 'FedRAMP SC-7: Check for boundary protection controls',
                        remediation: 'Implement boundary protection and perimeter security controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /firewall|network[_-]?segmentation|security[_-]?gateway/i,
                        message: 'FedRAMP SC-7: Verify firewall and network segmentation',
                        remediation: 'Deploy firewalls and network segmentation for boundary protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-08',
                title: 'Transmission Confidentiality and Integrity',
                description: 'The information system protects the confidentiality and integrity of transmitted information.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /transmission[_-]?confidentiality|transmission[_-]?integrity|data[_-]?in[_-]?transit/i,
                        message: 'FedRAMP SC-8: Check for transmission protection',
                        remediation: 'Protect confidentiality and integrity of data in transit',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /tls|ssl|encrypted[_-]?transmission|secure[_-]?communication/i,
                        message: 'FedRAMP SC-8: Verify encrypted transmission protocols',
                        remediation: 'Use TLS/SSL for all data transmissions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-12',
                title: 'Cryptographic Key Establishment and Management',
                description: 'The organization establishes and manages cryptographic keys.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /key[_-]?management|cryptographic[_-]?key|key[_-]?establishment/i,
                        message: 'FedRAMP SC-12: Check for cryptographic key management',
                        remediation: 'Implement comprehensive cryptographic key management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /key[_-]?rotation|key[_-]?generation|key[_-]?distribution/i,
                        message: 'FedRAMP SC-12: Verify key lifecycle management',
                        remediation: 'Implement key rotation and lifecycle management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-13',
                title: 'Cryptographic Protection',
                description: 'The information system implements cryptographic mechanisms.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /cryptographic[_-]?protection|encryption[_-]?algorithm|crypto[_-]?mechanism/i,
                        message: 'FedRAMP SC-13: Check for cryptographic protection mechanisms',
                        remediation: 'Implement approved cryptographic algorithms and mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /aes|fips[_-]?approved|nist[_-]?approved|crypto[_-]?standards/i,
                        message: 'FedRAMP SC-13: Verify FIPS-approved cryptographic standards',
                        remediation: 'Use only FIPS-approved cryptographic algorithms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-28',
                title: 'Protection of Information at Rest',
                description: 'The information system protects the confidentiality and integrity of information at rest.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /data[_-]?at[_-]?rest|encryption[_-]?at[_-]?rest|storage[_-]?encryption/i,
                        message: 'FedRAMP SC-28: Check for data at rest protection',
                        remediation: 'Implement encryption for data at rest',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /disk[_-]?encryption|database[_-]?encryption|file[_-]?encryption/i,
                        message: 'FedRAMP SC-28: Verify storage encryption mechanisms',
                        remediation: 'Enable disk, database, and file system encryption',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SYSTEM AND INFORMATION INTEGRITY (SI) FAMILY
            {
                id: 'SI-02',
                title: 'Flaw Remediation',
                description: 'The organization identifies, reports, and corrects information system flaws.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /flaw[_-]?remediation|patch[_-]?management|vulnerability[_-]?remediation/i,
                        message: 'FedRAMP SI-2: Check for flaw remediation processes',
                        remediation: 'Implement systematic flaw identification and remediation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /security[_-]?patches|system[_-]?updates|patch[_-]?deployment/i,
                        message: 'FedRAMP SI-2: Verify patch deployment mechanisms',
                        remediation: 'Deploy security patches and system updates promptly',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-03',
                title: 'Malicious Code Protection',
                description: 'The organization implements malicious code protection mechanisms.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /malicious[_-]?code|antivirus|anti[_-]?malware/i,
                        message: 'FedRAMP SI-3: Check for malicious code protection',
                        remediation: 'Implement comprehensive malicious code protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /virus[_-]?scanning|malware[_-]?detection|endpoint[_-]?protection/i,
                        message: 'FedRAMP SI-3: Verify malware detection capabilities',
                        remediation: 'Deploy anti-malware and endpoint protection solutions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-04',
                title: 'Information System Monitoring',
                description: 'The organization monitors the information system to detect attacks and indicators of potential attacks.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?monitoring|security[_-]?monitoring|intrusion[_-]?detection/i,
                        message: 'FedRAMP SI-4: Check for information system monitoring',
                        remediation: 'Implement comprehensive information system monitoring',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /siem|ids|ips|security[_-]?event[_-]?monitoring/i,
                        message: 'FedRAMP SI-4: Verify security monitoring systems',
                        remediation: 'Deploy SIEM, IDS/IPS, and security event monitoring',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ============================================
            // RESTORE COMPLETE FEDRAMP CONTROL SET 
            // ============================================
            // Missing ACCESS CONTROL (AC) controls to complete the family
            {
                id: 'AC-05',
                title: 'Separation of Duties',
                description: 'The organization separates duties of individuals to reduce the risk of malevolent activity.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /single[_-]?user[_-]?admin|root[_-]?only|admin[_-]?user.*=.*admin/i,
                        message: 'FedRAMP AC-5: Avoid single user performing all administrative functions',
                        remediation: 'Implement separation of duties for administrative functions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /sudo.*ALL.*ALL|privilege.*escalation.*unrestricted/i,
                        message: 'FedRAMP AC-5: Check for unrestricted privilege escalation',
                        remediation: 'Implement role-based access with separated duties',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.sh']
                    }
                ]
            },
            {
                id: 'AC-07',
                title: 'Unsuccessful Logon Attempts',
                description: 'The information system enforces a limit of consecutive invalid logon attempts.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /max[_-]?login[_-]?attempts|failed[_-]?login[_-]?limit|lockout[_-]?threshold/i,
                        message: 'FedRAMP AC-7: Configure limits for unsuccessful logon attempts',
                        remediation: 'Set maximum failed login attempts and account lockout policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /account[_-]?lockout|login[_-]?lockout|user[_-]?lockout/i,
                        message: 'FedRAMP AC-7: Implement account lockout mechanisms',
                        remediation: 'Configure automatic account lockout after failed attempts',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-08',
                title: 'System Use Notification',
                description: 'The information system displays an approved system use notification message.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /banner|login[_-]?message|system[_-]?use[_-]?notification/i,
                        message: 'FedRAMP AC-8: Configure system use notification banner',
                        remediation: 'Display approved system use notification message',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /motd|message[_-]?of[_-]?the[_-]?day|warning[_-]?banner/i,
                        message: 'FedRAMP AC-8: Verify system use warning banner',
                        remediation: 'Implement message of the day with legal notices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-11',
                title: 'Session Lock',
                description: 'The information system prevents further access by initiating a session lock.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /session[_-]?timeout|idle[_-]?timeout|auto[_-]?lock/i,
                        message: 'FedRAMP AC-11: Configure session lock mechanisms',
                        remediation: 'Implement automatic session lock after inactivity',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /screen[_-]?saver|session[_-]?lock|idle[_-]?disconnect/i,
                        message: 'FedRAMP AC-11: Verify session lock implementation',
                        remediation: 'Enable automatic screen lock and session termination',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-12',
                title: 'Session Termination',
                description: 'The information system automatically terminates a user session.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /session[_-]?timeout|auto[_-]?logout|session[_-]?termination/i,
                        message: 'FedRAMP AC-12: Configure automatic session termination',
                        remediation: 'Implement automatic session termination policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /max[_-]?session[_-]?duration|session[_-]?limit|connection[_-]?timeout/i,
                        message: 'FedRAMP AC-12: Set maximum session duration limits',
                        remediation: 'Define and enforce maximum session durations',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-14',
                title: 'Permitted Actions without Identification or Authentication',
                description: 'The organization identifies and documents specific user actions that can be performed without identification or authentication.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /anonymous[_-]?access|public[_-]?access|unauthenticated[_-]?access/i,
                        message: 'FedRAMP AC-14: Review anonymous/public access permissions',
                        remediation: 'Document and justify any unauthenticated access',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /guest[_-]?user|anonymous[_-]?user|public[_-]?read/i,
                        message: 'FedRAMP AC-14: Verify permitted actions without authentication',
                        remediation: 'Minimize and document unauthenticated access',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-18',
                title: 'Wireless Access',
                description: 'The organization establishes configuration requirements, connection requirements, and implementation guidance for wireless access.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /wireless|wifi|bluetooth|802\.11/i,
                        message: 'FedRAMP AC-18: Review wireless access configuration',
                        remediation: 'Implement secure wireless access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /wpa|wpa2|wpa3|wireless[_-]?encryption/i,
                        message: 'FedRAMP AC-18: Verify wireless encryption settings',
                        remediation: 'Use strong wireless encryption (WPA2/WPA3)',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-19',
                title: 'Access Control for Mobile Devices',
                description: 'The organization establishes configuration requirements, connection requirements, and implementation guidance for organization-controlled mobile devices.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /mobile[_-]?device|byod|device[_-]?management|mdm/i,
                        message: 'FedRAMP AC-19: Review mobile device access controls',
                        remediation: 'Implement mobile device management and access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /device[_-]?encryption|mobile[_-]?encryption|device[_-]?security/i,
                        message: 'FedRAMP AC-19: Verify mobile device security settings',
                        remediation: 'Enable encryption and security controls on mobile devices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-20',
                title: 'Use of External Information Systems',
                description: 'The organization establishes terms and conditions for authorized individuals to use external information systems.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /external[_-]?system|third[_-]?party[_-]?system|partner[_-]?system/i,
                        message: 'FedRAMP AC-20: Review external system access controls',
                        remediation: 'Define terms and conditions for external system use',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cloud[_-]?service|saas|external[_-]?service/i,
                        message: 'FedRAMP AC-20: Verify external service security agreements',
                        remediation: 'Establish security agreements for external services',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-21',
                title: 'Information Sharing',
                description: 'The organization facilitates information sharing by enabling authorized users to determine whether access authorizations assigned to the sharing partner match the access restrictions on the information.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /data[_-]?sharing|information[_-]?sharing|data[_-]?exchange/i,
                        message: 'FedRAMP AC-21: Review information sharing controls',
                        remediation: 'Implement controls for information sharing with partners',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /sharing[_-]?agreement|data[_-]?agreement|information[_-]?agreement/i,
                        message: 'FedRAMP AC-21: Verify information sharing agreements',
                        remediation: 'Establish formal information sharing agreements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AC-22',
                title: 'Publicly Accessible Content',
                description: 'The organization ensures that publicly accessible content does not contain nonpublic information.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /public[_-]?content|publicly[_-]?accessible|public[_-]?website/i,
                        message: 'FedRAMP AC-22: Review publicly accessible content',
                        remediation: 'Ensure public content does not contain sensitive information',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.html', '.js']
                    },
                    {
                        pattern: /sensitive[_-]?data.*public|confidential.*public|private.*public/i,
                        message: 'FedRAMP AC-22: Check for sensitive data in public content',
                        remediation: 'Remove sensitive information from public-facing content',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.html', '.js']
                    }
                ]
            },

            // AWARENESS AND TRAINING (AT) - Complete family (4 controls)
            {
                id: 'AT-01',
                title: 'Security Awareness and Training Policy and Procedures',
                description: 'The organization develops, documents, and disseminates security awareness and training policy and procedures.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /training[_-]?policy|awareness[_-]?policy|security[_-]?training[_-]?policy/i,
                        message: 'FedRAMP AT-1: Implement security awareness and training policy',
                        remediation: 'Develop and document security awareness and training policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /training[_-]?procedure|awareness[_-]?procedure|security[_-]?education/i,
                        message: 'FedRAMP AT-1: Define security training procedures',
                        remediation: 'Establish procedures for security awareness and training',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'AT-02',
                title: 'Security Awareness Training',
                description: 'The organization provides basic security awareness training to information system users.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?awareness|security[_-]?training|awareness[_-]?program/i,
                        message: 'FedRAMP AT-2: Implement security awareness training program',
                        remediation: 'Provide basic security awareness training to all users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /phishing[_-]?training|social[_-]?engineering[_-]?training|security[_-]?education/i,
                        message: 'FedRAMP AT-2: Include phishing and social engineering awareness',
                        remediation: 'Implement comprehensive security awareness curriculum',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AT-03',
                title: 'Role-Based Security Training',
                description: 'The organization provides role-based security training to personnel with assigned security roles and responsibilities.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /role[_-]?based[_-]?training|specialized[_-]?training|position[_-]?specific[_-]?training/i,
                        message: 'FedRAMP AT-3: Implement role-based security training',
                        remediation: 'Provide specialized training based on security roles',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /admin[_-]?training|privileged[_-]?user[_-]?training|security[_-]?role[_-]?training/i,
                        message: 'FedRAMP AT-3: Verify role-specific security training',
                        remediation: 'Ensure training matches assigned security responsibilities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AT-04',
                title: 'Security Training Records',
                description: 'The organization documents and monitors individual information system security training activities.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /training[_-]?record|training[_-]?documentation|training[_-]?tracking/i,
                        message: 'FedRAMP AT-4: Maintain security training records',
                        remediation: 'Document and track all security training activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /training[_-]?completion|training[_-]?certificate|training[_-]?audit/i,
                        message: 'FedRAMP AT-4: Track training completion and compliance',
                        remediation: 'Monitor and audit security training compliance',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // AUDIT AND ACCOUNTABILITY (AU) - Complete missing controls
            {
                id: 'AU-05',
                title: 'Response to Audit Processing Failures',
                description: 'The information system alerts personnel in the event of an audit processing failure.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?failure|audit[_-]?alert|audit[_-]?processing[_-]?failure/i,
                        message: 'FedRAMP AU-5: Configure audit processing failure alerts',
                        remediation: 'Implement alerts for audit processing failures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /log[_-]?failure|logging[_-]?error|audit[_-]?error[_-]?handling/i,
                        message: 'FedRAMP AU-5: Handle audit processing errors appropriately',
                        remediation: 'Define response procedures for audit failures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AU-08',
                title: 'Time Stamps',
                description: 'The information system uses internal system clocks to generate time stamps for audit records.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /ntp|time[_-]?sync|time[_-]?server|timestamp/i,
                        message: 'FedRAMP AU-8: Configure time synchronization and timestamps',
                        remediation: 'Implement NTP time synchronization for accurate timestamps',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /utc|gmt|timezone|time[_-]?zone/i,
                        message: 'FedRAMP AU-8: Verify time zone configuration for audit records',
                        remediation: 'Use coordinated universal time (UTC) for audit timestamps',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AU-11',
                title: 'Audit Record Retention',
                description: 'The organization retains audit records for a minimum of 90 days.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?retention|log[_-]?retention|retention[_-]?period/i,
                        message: 'FedRAMP AU-11: Configure audit record retention policies',
                        remediation: 'Set audit record retention to minimum 90 days',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /archive[_-]?policy|backup[_-]?retention|log[_-]?archive/i,
                        message: 'FedRAMP AU-11: Implement audit record archival',
                        remediation: 'Establish long-term audit record archival procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'AU-12',
                title: 'Audit Generation',
                description: 'The information system provides audit record generation capability for auditable events.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?generation|log[_-]?generation|audit[_-]?capability/i,
                        message: 'FedRAMP AU-12: Enable audit record generation',
                        remediation: 'Configure systems to generate audit records for all events',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /auditable[_-]?event|audit[_-]?event|security[_-]?event[_-]?logging/i,
                        message: 'FedRAMP AU-12: Define auditable events for logging',
                        remediation: 'Specify auditable events and configure logging',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SECURITY ASSESSMENT AND AUTHORIZATION (CA) - Complete family (7 controls)
            {
                id: 'CA-01',
                title: 'Security Assessment and Authorization Policy and Procedures',
                description: 'The organization develops, documents, and disseminates security assessment and authorization policy and procedures.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?assessment[_-]?policy|authorization[_-]?policy|ca[_-]?policy/i,
                        message: 'FedRAMP CA-1: Implement security assessment and authorization policy',
                        remediation: 'Develop security assessment and authorization policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /assessment[_-]?procedure|authorization[_-]?procedure|security[_-]?evaluation/i,
                        message: 'FedRAMP CA-1: Define security assessment procedures',
                        remediation: 'Establish security assessment and authorization procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'CA-02',
                title: 'Security Assessments',
                description: 'The organization develops a security assessment plan and conducts security assessments.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?assessment|assessment[_-]?plan|security[_-]?evaluation/i,
                        message: 'FedRAMP CA-2: Conduct regular security assessments',
                        remediation: 'Develop and implement security assessment plans',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /vulnerability[_-]?assessment|penetration[_-]?test|security[_-]?audit/i,
                        message: 'FedRAMP CA-2: Include vulnerability and penetration testing',
                        remediation: 'Perform comprehensive security assessments',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CA-03',
                title: 'System Interconnections',
                description: 'The organization authorizes connections from the information system to other information systems.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?interconnection|system[_-]?connection|interface[_-]?control/i,
                        message: 'FedRAMP CA-3: Document and authorize system interconnections',
                        remediation: 'Define and authorize all system interconnections',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /api[_-]?connection|network[_-]?connection|external[_-]?interface/i,
                        message: 'FedRAMP CA-3: Review external connections and interfaces',
                        remediation: 'Document security requirements for external connections',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CA-05',
                title: 'Plan of Action and Milestones',
                description: 'The organization develops and implements a plan of action and milestones for the information system.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /plan[_-]?of[_-]?action|poam|milestone[_-]?plan|remediation[_-]?plan/i,
                        message: 'FedRAMP CA-5: Maintain plan of action and milestones (POA&M)',
                        remediation: 'Develop and maintain POA&M for security weaknesses',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /weakness[_-]?tracking|vulnerability[_-]?tracking|security[_-]?finding/i,
                        message: 'FedRAMP CA-5: Track security weaknesses and remediation',
                        remediation: 'Implement tracking for security findings and remediation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CA-06',
                title: 'Security Authorization',
                description: 'The organization assigns a senior-level executive or manager as the authorizing official.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /authorizing[_-]?official|security[_-]?authorization|ato|authorization[_-]?package/i,
                        message: 'FedRAMP CA-6: Designate authorizing official for security authorization',
                        remediation: 'Assign senior executive as authorizing official',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /authorization[_-]?decision|security[_-]?accreditation|system[_-]?authorization/i,
                        message: 'FedRAMP CA-6: Obtain formal security authorization',
                        remediation: 'Complete formal security authorization process',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CA-07',
                title: 'Continuous Monitoring',
                description: 'The organization develops a continuous monitoring strategy and implements a continuous monitoring program.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /continuous[_-]?monitoring|ongoing[_-]?monitoring|security[_-]?monitoring[_-]?strategy/i,
                        message: 'FedRAMP CA-7: Implement continuous monitoring strategy',
                        remediation: 'Develop and implement continuous monitoring program',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /monitoring[_-]?frequency|assessment[_-]?frequency|control[_-]?monitoring/i,
                        message: 'FedRAMP CA-7: Define monitoring frequency and procedures',
                        remediation: 'Establish frequency for continuous monitoring activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CA-09',
                title: 'Internal System Connections',
                description: 'The organization authorizes internal connections of information system components or classes of components.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /internal[_-]?connection|system[_-]?component[_-]?connection|internal[_-]?interface/i,
                        message: 'FedRAMP CA-9: Document and authorize internal system connections',
                        remediation: 'Define authorization requirements for internal connections',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /component[_-]?authorization|internal[_-]?authorization|system[_-]?component[_-]?security/i,
                        message: 'FedRAMP CA-9: Verify internal component authorization',
                        remediation: 'Ensure all internal connections are properly authorized',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // CONFIGURATION MANAGEMENT (CM) - Complete missing controls
            {
                id: 'CM-04',
                title: 'Security Impact Analysis',
                description: 'The organization analyzes changes to the information system to determine potential security impacts.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?impact[_-]?analysis|change[_-]?impact[_-]?analysis|security[_-]?assessment[_-]?change/i,
                        message: 'FedRAMP CM-4: Conduct security impact analysis for changes',
                        remediation: 'Analyze security impacts before implementing changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /change[_-]?security[_-]?review|impact[_-]?assessment|security[_-]?change[_-]?control/i,
                        message: 'FedRAMP CM-4: Review security implications of changes',
                        remediation: 'Implement security review process for all changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CM-05',
                title: 'Access Restrictions for Change',
                description: 'The organization defines, documents, approves, and enforces physical and logical access restrictions associated with changes.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /change[_-]?access[_-]?control|change[_-]?authorization|privileged[_-]?change[_-]?access/i,
                        message: 'FedRAMP CM-5: Restrict access for configuration changes',
                        remediation: 'Implement access controls for configuration changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /change[_-]?approval|change[_-]?privilege|configuration[_-]?privilege/i,
                        message: 'FedRAMP CM-5: Require approval for configuration changes',
                        remediation: 'Establish formal approval process for changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CM-10',
                title: 'Software Usage Restrictions',
                description: 'The organization uses software and associated documentation in accordance with contract agreements and copyright laws.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /software[_-]?license|license[_-]?compliance|software[_-]?usage[_-]?restriction/i,
                        message: 'FedRAMP CM-10: Ensure software license compliance',
                        remediation: 'Implement software license management and compliance',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /unauthorized[_-]?software|unlicensed[_-]?software|software[_-]?whitelist/i,
                        message: 'FedRAMP CM-10: Prevent unauthorized software usage',
                        remediation: 'Maintain authorized software inventory and restrictions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CM-11',
                title: 'User-Installed Software',
                description: 'The organization establishes policies governing the installation of software by users.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /user[_-]?installed[_-]?software|software[_-]?installation[_-]?policy|user[_-]?software[_-]?restriction/i,
                        message: 'FedRAMP CM-11: Control user-installed software',
                        remediation: 'Establish policies for user software installation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /software[_-]?approval|installation[_-]?approval|user[_-]?privilege[_-]?software/i,
                        message: 'FedRAMP CM-11: Require approval for user software installation',
                        remediation: 'Implement approval process for user software installation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // CONTINGENCY PLANNING (CP) - Complete missing controls
            {
                id: 'CP-03',
                title: 'Contingency Training',
                description: 'The organization provides contingency training to information system users.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /contingency[_-]?training|disaster[_-]?recovery[_-]?training|emergency[_-]?training/i,
                        message: 'FedRAMP CP-3: Provide contingency training to users',
                        remediation: 'Implement contingency training program',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /backup[_-]?training|recovery[_-]?training|continuity[_-]?training/i,
                        message: 'FedRAMP CP-3: Train personnel on backup and recovery procedures',
                        remediation: 'Provide training on contingency procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CP-04',
                title: 'Contingency Plan Testing',
                description: 'The organization tests the contingency plan for the information system.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /contingency[_-]?test|disaster[_-]?recovery[_-]?test|backup[_-]?test/i,
                        message: 'FedRAMP CP-4: Test contingency plans regularly',
                        remediation: 'Conduct regular contingency plan testing',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /recovery[_-]?test|failover[_-]?test|continuity[_-]?test/i,
                        message: 'FedRAMP CP-4: Verify recovery and failover procedures',
                        remediation: 'Test all recovery and continuity procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CP-06',
                title: 'Alternate Storage Site',
                description: 'The organization establishes an alternate storage site and initiates necessary agreements.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?storage|offsite[_-]?storage|backup[_-]?site/i,
                        message: 'FedRAMP CP-6: Establish alternate storage site',
                        remediation: 'Implement alternate storage site for backup data',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /geographic[_-]?separation|remote[_-]?storage|distributed[_-]?backup/i,
                        message: 'FedRAMP CP-6: Ensure geographic separation for storage',
                        remediation: 'Maintain geographically separated backup storage',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CP-07',
                title: 'Alternate Processing Site',
                description: 'The organization establishes an alternate processing site and initiates necessary agreements.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?processing|disaster[_-]?recovery[_-]?site|hot[_-]?site|cold[_-]?site/i,
                        message: 'FedRAMP CP-7: Establish alternate processing site',
                        remediation: 'Implement alternate processing site for disaster recovery',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /failover[_-]?site|recovery[_-]?site|backup[_-]?datacenter/i,
                        message: 'FedRAMP CP-7: Configure failover processing capabilities',
                        remediation: 'Establish failover capabilities at alternate site',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CP-08',
                title: 'Telecommunications Services',
                description: 'The organization establishes alternate telecommunications services including necessary agreements.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?telecommunications|backup[_-]?communications|redundant[_-]?network/i,
                        message: 'FedRAMP CP-8: Establish alternate telecommunications services',
                        remediation: 'Implement redundant telecommunications capabilities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /network[_-]?redundancy|communication[_-]?backup|telecom[_-]?failover/i,
                        message: 'FedRAMP CP-8: Verify telecommunications redundancy',
                        remediation: 'Ensure redundant network and communication paths',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'CP-10',
                title: 'Information System Recovery and Reconstitution',
                description: 'The organization provides for the recovery and reconstitution of the information system.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?recovery|system[_-]?reconstitution|recovery[_-]?procedure/i,
                        message: 'FedRAMP CP-10: Implement system recovery procedures',
                        remediation: 'Develop system recovery and reconstitution procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /restoration[_-]?procedure|reconstitution[_-]?plan|recovery[_-]?plan/i,
                        message: 'FedRAMP CP-10: Define system restoration procedures',
                        remediation: 'Establish procedures for system restoration',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // IDENTIFICATION AND AUTHENTICATION (IA) - Complete missing controls
            {
                id: 'IA-01',
                title: 'Identification and Authentication Policy and Procedures',
                description: 'The organization develops, documents, and disseminates identification and authentication policy and procedures.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /identification[_-]?policy|authentication[_-]?policy|ia[_-]?policy/i,
                        message: 'FedRAMP IA-1: Implement identification and authentication policy',
                        remediation: 'Develop identification and authentication policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /identity[_-]?procedure|authentication[_-]?procedure|access[_-]?procedure/i,
                        message: 'FedRAMP IA-1: Define identification and authentication procedures',
                        remediation: 'Establish identification and authentication procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'IA-03',
                title: 'Device Identification and Authentication',
                description: 'The information system uniquely identifies and authenticates devices before establishing a connection.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /device[_-]?authentication|device[_-]?identification|device[_-]?certificate/i,
                        message: 'FedRAMP IA-3: Implement device identification and authentication',
                        remediation: 'Configure unique device identification and authentication',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /machine[_-]?authentication|computer[_-]?authentication|device[_-]?identity/i,
                        message: 'FedRAMP IA-3: Verify device authentication mechanisms',
                        remediation: 'Ensure all devices are uniquely identified and authenticated',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IA-04',
                title: 'Identifier Management',
                description: 'The organization manages information system identifiers for users and devices.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /identifier[_-]?management|user[_-]?id[_-]?management|account[_-]?identifier/i,
                        message: 'FedRAMP IA-4: Implement identifier management procedures',
                        remediation: 'Establish procedures for managing user and device identifiers',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /unique[_-]?identifier|userid[_-]?policy|identifier[_-]?reuse/i,
                        message: 'FedRAMP IA-4: Ensure unique identifier assignment',
                        remediation: 'Prevent identifier reuse and ensure uniqueness',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IA-05',
                title: 'Authenticator Management',
                description: 'The organization manages information system authenticators for users and devices.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /authenticator[_-]?management|password[_-]?management|credential[_-]?management/i,
                        message: 'FedRAMP IA-5: Implement authenticator management procedures',
                        remediation: 'Establish procedures for managing authenticators',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /password[_-]?policy|authenticator[_-]?policy|credential[_-]?policy/i,
                        message: 'FedRAMP IA-5: Define authenticator policies and requirements',
                        remediation: 'Implement strong authenticator policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IA-06',
                title: 'Authenticator Feedback',
                description: 'The information system obscures feedback of authentication information during the authentication process.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /password[_-]?masking|authentication[_-]?feedback|credential[_-]?obscuring/i,
                        message: 'FedRAMP IA-6: Obscure authentication feedback',
                        remediation: 'Implement authentication feedback obscuring mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /login[_-]?masking|password[_-]?hiding|authentication[_-]?obscuring/i,
                        message: 'FedRAMP IA-6: Verify authentication information is obscured',
                        remediation: 'Ensure authentication information is not displayed in clear text',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IA-07',
                title: 'Cryptographic Module Authentication',
                description: 'The information system implements mechanisms for authentication to a cryptographic module.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /cryptographic[_-]?module[_-]?authentication|crypto[_-]?module[_-]?auth|hsm[_-]?authentication/i,
                        message: 'FedRAMP IA-7: Implement cryptographic module authentication',
                        remediation: 'Configure authentication for cryptographic modules',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /fips[_-]?140|crypto[_-]?module|hardware[_-]?security[_-]?module/i,
                        message: 'FedRAMP IA-7: Verify FIPS 140-2 compliance for crypto modules',
                        remediation: 'Use FIPS 140-2 validated cryptographic modules',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IA-08',
                title: 'Identification and Authentication (Non-Organizational Users)',
                description: 'The information system uniquely identifies and authenticates non-organizational users.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /non[_-]?organizational[_-]?user|external[_-]?user[_-]?authentication|guest[_-]?authentication/i,
                        message: 'FedRAMP IA-8: Implement authentication for non-organizational users',
                        remediation: 'Configure authentication for external and guest users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /federated[_-]?authentication|external[_-]?identity|partner[_-]?authentication/i,
                        message: 'FedRAMP IA-8: Verify federated authentication for external users',
                        remediation: 'Implement federated identity management for external users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // INCIDENT RESPONSE (IR) - Complete missing controls
            {
                id: 'IR-02',
                title: 'Incident Response Training',
                description: 'The organization provides incident response training to information system users.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?training|ir[_-]?training|security[_-]?incident[_-]?training/i,
                        message: 'FedRAMP IR-2: Provide incident response training',
                        remediation: 'Implement incident response training program',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?handling[_-]?training|emergency[_-]?response[_-]?training|security[_-]?training/i,
                        message: 'FedRAMP IR-2: Train personnel on incident handling procedures',
                        remediation: 'Provide training on incident response procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IR-03',
                title: 'Incident Response Testing',
                description: 'The organization tests the incident response capability for the information system.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?test|ir[_-]?test|incident[_-]?simulation/i,
                        message: 'FedRAMP IR-3: Test incident response capabilities',
                        remediation: 'Conduct regular incident response testing',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /tabletop[_-]?exercise|incident[_-]?drill|response[_-]?exercise/i,
                        message: 'FedRAMP IR-3: Perform incident response exercises',
                        remediation: 'Execute tabletop exercises and incident drills',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IR-05',
                title: 'Incident Monitoring',
                description: 'The organization tracks and documents information system security incidents.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?monitoring|incident[_-]?tracking|security[_-]?incident[_-]?monitoring/i,
                        message: 'FedRAMP IR-5: Implement incident monitoring and tracking',
                        remediation: 'Establish incident monitoring and tracking procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?documentation|incident[_-]?log|security[_-]?event[_-]?tracking/i,
                        message: 'FedRAMP IR-5: Document and track security incidents',
                        remediation: 'Maintain documentation for all security incidents',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IR-07',
                title: 'Incident Response Assistance',
                description: 'The organization provides an incident response support resource that offers advice and assistance.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?assistance|ir[_-]?support|incident[_-]?help/i,
                        message: 'FedRAMP IR-7: Provide incident response assistance',
                        remediation: 'Establish incident response support resources',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?support[_-]?team|response[_-]?assistance|security[_-]?support/i,
                        message: 'FedRAMP IR-7: Verify incident response support availability',
                        remediation: 'Ensure incident response support is available 24/7',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'IR-08',
                title: 'Incident Response Plan',
                description: 'The organization develops and implements an incident response plan.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?plan|ir[_-]?plan|security[_-]?incident[_-]?plan/i,
                        message: 'FedRAMP IR-8: Develop and maintain incident response plan',
                        remediation: 'Create comprehensive incident response plan',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /incident[_-]?procedure|response[_-]?procedure|emergency[_-]?procedure/i,
                        message: 'FedRAMP IR-8: Define incident response procedures',
                        remediation: 'Establish detailed incident response procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },

            // MAINTENANCE (MA) - Complete family (6 controls)
            {
                id: 'MA-01',
                title: 'System Maintenance Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system maintenance policy and procedures.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?policy|system[_-]?maintenance[_-]?policy|ma[_-]?policy/i,
                        message: 'FedRAMP MA-1: Implement system maintenance policy',
                        remediation: 'Develop system maintenance policies and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    },
                    {
                        pattern: /maintenance[_-]?procedure|system[_-]?maintenance[_-]?procedure|maintenance[_-]?schedule/i,
                        message: 'FedRAMP MA-1: Define system maintenance procedures',
                        remediation: 'Establish system maintenance procedures and schedules',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'MA-02',
                title: 'Controlled Maintenance',
                description: 'The organization schedules, performs, and documents maintenance and repairs on information system components.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /controlled[_-]?maintenance|scheduled[_-]?maintenance|maintenance[_-]?control/i,
                        message: 'FedRAMP MA-2: Implement controlled maintenance procedures',
                        remediation: 'Establish controlled maintenance scheduling and documentation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /maintenance[_-]?documentation|maintenance[_-]?record|system[_-]?maintenance[_-]?log/i,
                        message: 'FedRAMP MA-2: Document all maintenance activities',
                        remediation: 'Maintain records of all system maintenance activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MA-03',
                title: 'Maintenance Tools',
                description: 'The organization approves, controls, and monitors information system maintenance tools.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?tool|system[_-]?maintenance[_-]?tool|maintenance[_-]?equipment/i,
                        message: 'FedRAMP MA-3: Control and monitor maintenance tools',
                        remediation: 'Implement controls for maintenance tools and equipment',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /tool[_-]?approval|maintenance[_-]?tool[_-]?authorization|tool[_-]?inventory/i,
                        message: 'FedRAMP MA-3: Approve and inventory maintenance tools',
                        remediation: 'Maintain approved inventory of maintenance tools',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MA-04',
                title: 'Nonlocal Maintenance',
                description: 'The organization approves and monitors nonlocal maintenance and diagnostic activities.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /nonlocal[_-]?maintenance|remote[_-]?maintenance|remote[_-]?diagnostic/i,
                        message: 'FedRAMP MA-4: Control nonlocal maintenance activities',
                        remediation: 'Implement controls for remote maintenance and diagnostics',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /remote[_-]?access[_-]?maintenance|remote[_-]?support|external[_-]?maintenance/i,
                        message: 'FedRAMP MA-4: Monitor remote maintenance access',
                        remediation: 'Monitor and control remote maintenance activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MA-05',
                title: 'Maintenance Personnel',
                description: 'The organization establishes a process for maintenance personnel authorization and escorts uncleared personnel.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?personnel|maintenance[_-]?authorization|maintenance[_-]?clearance/i,
                        message: 'FedRAMP MA-5: Control maintenance personnel authorization',
                        remediation: 'Establish maintenance personnel authorization procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /escort[_-]?procedure|uncleared[_-]?personnel|maintenance[_-]?supervision/i,
                        message: 'FedRAMP MA-5: Escort uncleared maintenance personnel',
                        remediation: 'Implement escort procedures for uncleared personnel',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MA-06',
                title: 'Timely Maintenance',
                description: 'The organization obtains maintenance support and spare parts for information system components within defined time periods.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /timely[_-]?maintenance|maintenance[_-]?timeline|maintenance[_-]?sla/i,
                        message: 'FedRAMP MA-6: Ensure timely maintenance support',
                        remediation: 'Establish maintenance timeline and SLA requirements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /spare[_-]?parts|maintenance[_-]?support|vendor[_-]?maintenance/i,
                        message: 'FedRAMP MA-6: Verify maintenance support availability',
                        remediation: 'Ensure availability of maintenance support and spare parts',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // MEDIA PROTECTION (MP) - Complete family (7 controls)
            {
                id: 'MP-01',
                title: 'Media Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates media protection policy and procedures.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?protection[_-]?policy|mp[_-]?policy|media[_-]?handling[_-]?policy/i,
                        message: 'FedRAMP MP-1: Implement media protection policy',
                        remediation: 'Develop media protection policies and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'MP-02',
                title: 'Media Access',
                description: 'The organization restricts access to digital and non-digital media to authorized individuals.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?access|media[_-]?restriction|media[_-]?authorization/i,
                        message: 'FedRAMP MP-2: Restrict media access to authorized individuals',
                        remediation: 'Implement media access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MP-03',
                title: 'Media Marking',
                description: 'The organization marks information system media indicating the distribution limitations.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /media[_-]?marking|media[_-]?labeling|classification[_-]?marking/i,
                        message: 'FedRAMP MP-3: Mark media with appropriate classification',
                        remediation: 'Implement media marking and labeling procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MP-04',
                title: 'Media Storage',
                description: 'The organization physically controls and securely stores digital and non-digital media.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?storage|secure[_-]?storage|media[_-]?security/i,
                        message: 'FedRAMP MP-4: Implement secure media storage',
                        remediation: 'Establish secure media storage procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MP-05',
                title: 'Media Transport',
                description: 'The organization protects and controls digital and non-digital media during transport outside of controlled areas.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?transport|media[_-]?shipping|media[_-]?transfer/i,
                        message: 'FedRAMP MP-5: Control media transport and shipping',
                        remediation: 'Implement secure media transport procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MP-06',
                title: 'Media Sanitization',
                description: 'The organization sanitizes digital and non-digital media prior to disposal, release, or reuse.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?sanitization|data[_-]?destruction|media[_-]?wiping/i,
                        message: 'FedRAMP MP-6: Implement media sanitization procedures',
                        remediation: 'Establish media sanitization and destruction procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'MP-07',
                title: 'Media Use',
                description: 'The organization restricts the use of portable storage devices in organizational information systems.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /portable[_-]?storage|usb[_-]?restriction|removable[_-]?media/i,
                        message: 'FedRAMP MP-7: Restrict portable storage device usage',
                        remediation: 'Implement controls for portable storage devices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // PHYSICAL AND ENVIRONMENTAL PROTECTION (PE) - Complete family (16 controls)
            {
                id: 'PE-01',
                title: 'Physical and Environmental Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates physical and environmental protection policy.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?protection[_-]?policy|environmental[_-]?protection[_-]?policy|pe[_-]?policy/i,
                        message: 'FedRAMP PE-1: Implement physical and environmental protection policy',
                        remediation: 'Develop physical and environmental protection policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PE-02',
                title: 'Physical Access Authorizations',
                description: 'The organization develops, approves, and maintains a list of individuals with authorized access.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?access[_-]?authorization|access[_-]?list|authorized[_-]?personnel/i,
                        message: 'FedRAMP PE-2: Maintain physical access authorization list',
                        remediation: 'Establish physical access authorization procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-03',
                title: 'Physical Access Control',
                description: 'The organization enforces physical access authorizations at all physical access points.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?access[_-]?control|access[_-]?point[_-]?control|physical[_-]?security/i,
                        message: 'FedRAMP PE-3: Implement physical access controls',
                        remediation: 'Establish physical access control mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-04',
                title: 'Access Control for Transmission Medium',
                description: 'The organization controls physical access to information system distribution and transmission lines.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /transmission[_-]?medium[_-]?access|cable[_-]?access[_-]?control|network[_-]?cable[_-]?protection/i,
                        message: 'FedRAMP PE-4: Control access to transmission medium',
                        remediation: 'Implement transmission medium access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-05',
                title: 'Access Control for Output Devices',
                description: 'The organization controls physical access to information system output devices.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /output[_-]?device[_-]?access|printer[_-]?access[_-]?control|display[_-]?access[_-]?control/i,
                        message: 'FedRAMP PE-5: Control access to output devices',
                        remediation: 'Implement output device access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-06',
                title: 'Monitoring Physical Access',
                description: 'The organization monitors physical access to the facility where the information system resides.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?access[_-]?monitoring|facility[_-]?monitoring|access[_-]?logging/i,
                        message: 'FedRAMP PE-6: Monitor physical access to facilities',
                        remediation: 'Implement physical access monitoring systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-08',
                title: 'Visitor Access Records',
                description: 'The organization maintains visitor access records to the facility where the information system resides.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /visitor[_-]?access[_-]?record|visitor[_-]?log|guest[_-]?access[_-]?log/i,
                        message: 'FedRAMP PE-8: Maintain visitor access records',
                        remediation: 'Implement visitor access logging and record keeping',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-09',
                title: 'Power Equipment and Power Cabling',
                description: 'The organization protects power equipment and power cabling for the information system.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /power[_-]?equipment[_-]?protection|power[_-]?cabling[_-]?protection|electrical[_-]?protection/i,
                        message: 'FedRAMP PE-9: Protect power equipment and cabling',
                        remediation: 'Implement power equipment protection measures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-10',
                title: 'Emergency Shutoff',
                description: 'The organization provides the capability of shutting off power to the information system.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /emergency[_-]?shutoff|emergency[_-]?power[_-]?off|epo[_-]?switch/i,
                        message: 'FedRAMP PE-10: Implement emergency shutoff capability',
                        remediation: 'Install emergency power shutoff mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-11',
                title: 'Emergency Power',
                description: 'The organization provides a short-term uninterruptible power supply.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /emergency[_-]?power|ups|uninterruptible[_-]?power[_-]?supply|backup[_-]?power/i,
                        message: 'FedRAMP PE-11: Implement emergency power systems',
                        remediation: 'Install uninterruptible power supply systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-12',
                title: 'Emergency Lighting',
                description: 'The organization employs and maintains automatic emergency lighting.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /emergency[_-]?lighting|backup[_-]?lighting|automatic[_-]?lighting/i,
                        message: 'FedRAMP PE-12: Implement emergency lighting systems',
                        remediation: 'Install automatic emergency lighting',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-13',
                title: 'Fire Protection',
                description: 'The organization employs and maintains fire suppression and detection devices/systems.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /fire[_-]?protection|fire[_-]?suppression|fire[_-]?detection|fire[_-]?alarm/i,
                        message: 'FedRAMP PE-13: Implement fire protection systems',
                        remediation: 'Install fire suppression and detection systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-14',
                title: 'Temperature and Humidity Controls',
                description: 'The organization maintains temperature and humidity levels within acceptable ranges.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /temperature[_-]?control|humidity[_-]?control|hvac|environmental[_-]?control/i,
                        message: 'FedRAMP PE-14: Implement temperature and humidity controls',
                        remediation: 'Maintain environmental controls for temperature and humidity',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-15',
                title: 'Water Damage Protection',
                description: 'The organization protects the information system from damage resulting from water leakage.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /water[_-]?damage[_-]?protection|leak[_-]?detection|water[_-]?sensor/i,
                        message: 'FedRAMP PE-15: Implement water damage protection',
                        remediation: 'Install water leak detection and protection systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-16',
                title: 'Delivery and Removal',
                description: 'The organization authorizes, monitors, and controls information system components entering and exiting the facility.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /delivery[_-]?control|component[_-]?delivery|equipment[_-]?removal/i,
                        message: 'FedRAMP PE-16: Control delivery and removal of system components',
                        remediation: 'Implement controls for component delivery and removal',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-17',
                title: 'Alternate Work Site',
                description: 'The organization employs security controls for alternate work sites.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?work[_-]?site|remote[_-]?work|telework[_-]?security/i,
                        message: 'FedRAMP PE-17: Implement alternate work site security controls',
                        remediation: 'Establish security controls for remote work locations',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // PLANNING (PL) - Complete family (4 controls)
            {
                id: 'PL-01',
                title: 'Security Planning Policy and Procedures',
                description: 'The organization develops, documents, and disseminates security planning policy and procedures.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?planning[_-]?policy|planning[_-]?policy|pl[_-]?policy/i,
                        message: 'FedRAMP PL-1: Implement security planning policy',
                        remediation: 'Develop security planning policies and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PL-02',
                title: 'System Security Plan',
                description: 'The organization develops a security plan for the information system.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?security[_-]?plan|ssp|security[_-]?plan/i,
                        message: 'FedRAMP PL-2: Develop and maintain system security plan (SSP)',
                        remediation: 'Create comprehensive system security plan',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PL-04',
                title: 'Rules of Behavior',
                description: 'The organization establishes and makes readily available to individuals rules of behavior.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /rules[_-]?of[_-]?behavior|user[_-]?agreement|acceptable[_-]?use[_-]?policy/i,
                        message: 'FedRAMP PL-4: Establish rules of behavior for system users',
                        remediation: 'Develop and communicate rules of behavior',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PL-08',
                title: 'Information Security Architecture',
                description: 'The organization develops an information security architecture for the information system.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?architecture|information[_-]?security[_-]?architecture|security[_-]?design/i,
                        message: 'FedRAMP PL-8: Develop information security architecture',
                        remediation: 'Create comprehensive security architecture documentation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },

            // PERSONNEL SECURITY (PS) - Complete family (8 controls)
            {
                id: 'PS-01',
                title: 'Personnel Security Policy and Procedures',
                description: 'The organization develops, documents, and disseminates personnel security policy and procedures.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?security[_-]?policy|ps[_-]?policy|staff[_-]?security[_-]?policy/i,
                        message: 'FedRAMP PS-1: Implement personnel security policy',
                        remediation: 'Develop personnel security policies and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PS-02',
                title: 'Position Risk Designation',
                description: 'The organization assigns a risk designation to all organizational positions.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /position[_-]?risk[_-]?designation|risk[_-]?level|position[_-]?sensitivity/i,
                        message: 'FedRAMP PS-2: Assign risk designations to organizational positions',
                        remediation: 'Establish position risk designation procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PS-03',
                title: 'Personnel Screening',
                description: 'The organization screens individuals prior to authorizing access to the information system.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?screening|background[_-]?check|security[_-]?clearance/i,
                        message: 'FedRAMP PS-3: Implement personnel screening procedures',
                        remediation: 'Establish personnel screening and background check requirements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PS-04',
                title: 'Personnel Termination',
                description: 'The organization terminates information system access for individuals upon termination of employment.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?termination|access[_-]?termination|employment[_-]?termination/i,
                        message: 'FedRAMP PS-4: Implement personnel termination procedures',
                        remediation: 'Establish access termination procedures for departing personnel',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PS-05',
                title: 'Personnel Transfer',
                description: 'The organization reviews and confirms ongoing operational need for current logical and physical access authorizations.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /personnel[_-]?transfer|access[_-]?review|role[_-]?change/i,
                        message: 'FedRAMP PS-5: Review access authorizations during personnel transfers',
                        remediation: 'Implement access review procedures for personnel transfers',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PS-06',
                title: 'Access Agreements',
                description: 'The organization ensures that individuals requiring access to organizational information sign appropriate access agreements.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /access[_-]?agreement|confidentiality[_-]?agreement|nda/i,
                        message: 'FedRAMP PS-6: Require access agreements for system access',
                        remediation: 'Implement access agreement requirements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'PS-07',
                title: 'Third-Party Personnel Security',
                description: 'The organization establishes personnel security requirements for third-party providers.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /third[_-]?party[_-]?personnel|contractor[_-]?security|vendor[_-]?personnel[_-]?security/i,
                        message: 'FedRAMP PS-7: Establish third-party personnel security requirements',
                        remediation: 'Implement security requirements for third-party personnel',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PS-08',
                title: 'Personnel Sanctions',
                description: 'The organization employs a formal sanctions process for individuals failing to comply with established information security policies.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /personnel[_-]?sanctions|security[_-]?violation[_-]?sanctions|disciplinary[_-]?action/i,
                        message: 'FedRAMP PS-8: Implement personnel sanctions for security violations',
                        remediation: 'Establish formal sanctions process for security policy violations',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },

            // RISK ASSESSMENT (RA) - Complete family (4 controls) 
            {
                id: 'RA-02',
                title: 'Security Categorization',
                description: 'The organization categorizes information and the information system in accordance with applicable federal laws.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?categorization|fips[_-]?199|impact[_-]?level/i,
                        message: 'FedRAMP RA-2: Perform security categorization per FIPS 199',
                        remediation: 'Categorize information system according to FIPS 199',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },

            // SYSTEM AND SERVICES ACQUISITION (SA) - Complete family (9 controls)
            {
                id: 'SA-01',
                title: 'System and Services Acquisition Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and services acquisition policy.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /acquisition[_-]?policy|system[_-]?acquisition[_-]?policy|sa[_-]?policy/i,
                        message: 'FedRAMP SA-1: Implement system and services acquisition policy',
                        remediation: 'Develop system and services acquisition policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'SA-02',
                title: 'Allocation of Resources',
                description: 'The organization determines information security requirements for the information system in mission/business process planning.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /resource[_-]?allocation|security[_-]?resource|budget[_-]?security/i,
                        message: 'FedRAMP SA-2: Allocate resources for information security',
                        remediation: 'Include security requirements in resource planning',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SA-03',
                title: 'System Development Life Cycle',
                description: 'The organization manages the information system using a system development life cycle methodology.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /sdlc|system[_-]?development[_-]?life[_-]?cycle|development[_-]?methodology/i,
                        message: 'FedRAMP SA-3: Implement system development life cycle methodology',
                        remediation: 'Establish SDLC methodology with security integration',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'SA-04',
                title: 'Acquisition Process',
                description: 'The organization includes security requirements and security specifications in information system acquisition contracts.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /acquisition[_-]?process|contract[_-]?security[_-]?requirements|procurement[_-]?security/i,
                        message: 'FedRAMP SA-4: Include security requirements in acquisition contracts',
                        remediation: 'Integrate security requirements into acquisition processes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SA-05',
                title: 'Information System Documentation',
                description: 'The organization obtains administrator documentation for the information system that describes secure configuration.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /system[_-]?documentation|administrator[_-]?documentation|security[_-]?documentation/i,
                        message: 'FedRAMP SA-5: Obtain system documentation with security configuration',
                        remediation: 'Ensure availability of comprehensive system documentation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'SA-08',
                title: 'Security Engineering Principles',
                description: 'The organization applies information system security engineering principles in the specification, design, development, implementation, and modification.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?engineering|secure[_-]?design|security[_-]?by[_-]?design/i,
                        message: 'FedRAMP SA-8: Apply security engineering principles',
                        remediation: 'Integrate security engineering principles in system development',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SA-09',
                title: 'External Information System Services',
                description: 'The organization requires that providers of external information system services comply with organizational information security requirements.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /external[_-]?service|third[_-]?party[_-]?service|cloud[_-]?service[_-]?security/i,
                        message: 'FedRAMP SA-9: Ensure external services comply with security requirements',
                        remediation: 'Establish security requirements for external service providers',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SA-10',
                title: 'Developer Configuration Management',
                description: 'The organization requires the developer of the information system to perform configuration management.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /developer[_-]?configuration[_-]?management|development[_-]?cm|developer[_-]?cm/i,
                        message: 'FedRAMP SA-10: Require developer configuration management',
                        remediation: 'Ensure developers implement configuration management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SA-11',
                title: 'Developer Security Testing and Evaluation',
                description: 'The organization requires the developer of the information system to create and implement a security assessment plan.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /developer[_-]?security[_-]?testing|development[_-]?security[_-]?testing|security[_-]?assessment[_-]?plan/i,
                        message: 'FedRAMP SA-11: Require developer security testing and evaluation',
                        remediation: 'Ensure developers perform security testing and evaluation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SYSTEM AND COMMUNICATIONS PROTECTION (SC) - Complete missing controls
            {
                id: 'SC-01',
                title: 'System and Communications Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and communications protection policy.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /communications[_-]?protection[_-]?policy|sc[_-]?policy|system[_-]?protection[_-]?policy/i,
                        message: 'FedRAMP SC-1: Implement system and communications protection policy',
                        remediation: 'Develop system and communications protection policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'SC-02',
                title: 'Application Partitioning',
                description: 'The information system separates user functionality from information system management functionality.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /application[_-]?partitioning|user[_-]?management[_-]?separation|privilege[_-]?separation/i,
                        message: 'FedRAMP SC-2: Implement application partitioning',
                        remediation: 'Separate user functionality from management functionality',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-04',
                title: 'Information in Shared Resources',
                description: 'The information system prevents unauthorized and unintended information transfer via shared system resources.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /shared[_-]?resource[_-]?protection|memory[_-]?protection|resource[_-]?isolation/i,
                        message: 'FedRAMP SC-4: Protect information in shared resources',
                        remediation: 'Implement protection for information in shared system resources',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-05',
                title: 'Denial of Service Protection',
                description: 'The information system protects against or limits the effects of denial of service attacks.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /denial[_-]?of[_-]?service[_-]?protection|dos[_-]?protection|ddos[_-]?protection/i,
                        message: 'FedRAMP SC-5: Implement denial of service protection',
                        remediation: 'Deploy DoS/DDoS protection mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-15',
                title: 'Collaborative Computing Devices',
                description: 'The information system prohibits remote activation of collaborative computing devices.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /collaborative[_-]?computing|remote[_-]?activation[_-]?prohibition|camera[_-]?microphone[_-]?control/i,
                        message: 'FedRAMP SC-15: Control collaborative computing devices',
                        remediation: 'Implement controls for collaborative computing devices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-20',
                title: 'Secure Name/Address Resolution Service (Authoritative Source)',
                description: 'The information system provides additional data origin authentication and integrity verification artifacts.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /dns[_-]?security|dnssec|name[_-]?resolution[_-]?security/i,
                        message: 'FedRAMP SC-20: Implement secure name/address resolution',
                        remediation: 'Deploy DNSSEC and secure name resolution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-21',
                title: 'Secure Name/Address Resolution Service (Recursive or Caching Resolver)',
                description: 'The information system requests and performs data origin authentication and data integrity verification.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /dns[_-]?caching[_-]?security|recursive[_-]?dns[_-]?security|dns[_-]?resolver[_-]?security/i,
                        message: 'FedRAMP SC-21: Secure DNS caching and recursive resolution',
                        remediation: 'Implement secure DNS caching and recursive resolution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-22',
                title: 'Architecture and Provisioning for Name/Address Resolution Service',
                description: 'The information systems that collectively provide name/address resolution service are fault-tolerant.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /dns[_-]?architecture|name[_-]?resolution[_-]?architecture|dns[_-]?fault[_-]?tolerance/i,
                        message: 'FedRAMP SC-22: Implement fault-tolerant name resolution architecture',
                        remediation: 'Deploy fault-tolerant DNS architecture',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SC-39',
                title: 'Process Isolation',
                description: 'The information system maintains a separate execution domain for each executing process.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /process[_-]?isolation|execution[_-]?domain[_-]?separation|process[_-]?separation/i,
                        message: 'FedRAMP SC-39: Implement process isolation',
                        remediation: 'Maintain separate execution domains for processes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SYSTEM AND INFORMATION INTEGRITY (SI) - Complete missing controls
            {
                id: 'SI-01',
                title: 'System and Information Integrity Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and information integrity policy.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /information[_-]?integrity[_-]?policy|si[_-]?policy|system[_-]?integrity[_-]?policy/i,
                        message: 'FedRAMP SI-1: Implement system and information integrity policy',
                        remediation: 'Develop system and information integrity policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'SI-05',
                title: 'Security Alerts, Advisories, and Directives',
                description: 'The organization receives information system security alerts, advisories, and directives from external organizations.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /security[_-]?alert|security[_-]?advisory|security[_-]?directive/i,
                        message: 'FedRAMP SI-5: Receive and act on security alerts and advisories',
                        remediation: 'Establish procedures for receiving and acting on security alerts',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-07',
                title: 'Software, Firmware, and Information Integrity',
                description: 'The organization employs integrity verification tools to detect unauthorized changes.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /integrity[_-]?verification|software[_-]?integrity|firmware[_-]?integrity/i,
                        message: 'FedRAMP SI-7: Implement software and firmware integrity verification',
                        remediation: 'Deploy integrity verification tools and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-08',
                title: 'Spam Protection',
                description: 'The information system implements spam protection mechanisms at information system entry and exit points.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /spam[_-]?protection|anti[_-]?spam|email[_-]?filtering/i,
                        message: 'FedRAMP SI-8: Implement spam protection mechanisms',
                        remediation: 'Deploy spam protection at system entry and exit points',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-10',
                title: 'Information Input Validation',
                description: 'The information system checks the validity of information inputs.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /input[_-]?validation|data[_-]?validation|information[_-]?input[_-]?validation/i,
                        message: 'FedRAMP SI-10: Implement information input validation',
                        remediation: 'Validate all information inputs to the system',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-11',
                title: 'Error Handling',
                description: 'The information system generates error messages that provide information necessary for corrective actions.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /error[_-]?handling|error[_-]?message[_-]?handling|exception[_-]?handling/i,
                        message: 'FedRAMP SI-11: Implement secure error handling',
                        remediation: 'Generate secure error messages without sensitive information disclosure',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-12',
                title: 'Information Handling and Retention',
                description: 'The organization handles and retains information within the information system and information output.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /information[_-]?handling|data[_-]?retention|information[_-]?retention/i,
                        message: 'FedRAMP SI-12: Implement information handling and retention procedures',
                        remediation: 'Establish information handling and retention policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Additional FedRAMP controls to complete 156 total
            {
                id: 'RA-01',
                title: 'Risk Assessment Policy and Procedures',
                description: 'The organization develops, documents, and disseminates risk assessment policy and procedures.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /risk[_-]?assessment[_-]?policy|ra[_-]?policy|risk[_-]?management[_-]?policy/i,
                        message: 'FedRAMP RA-1: Implement risk assessment policy and procedures',
                        remediation: 'Develop comprehensive risk assessment policies and procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'RA-03',
                title: 'Risk Assessment',
                description: 'The organization conducts an assessment of risk arising from the operation of the information system.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /risk[_-]?assessment|security[_-]?risk[_-]?assessment|system[_-]?risk[_-]?assessment/i,
                        message: 'FedRAMP RA-3: Conduct comprehensive risk assessments',
                        remediation: 'Perform regular risk assessments of the information system',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json', '.md']
                    }
                ]
            },
            {
                id: 'RA-05',
                title: 'Vulnerability Scanning',
                description: 'The organization scans for vulnerabilities in the information system and hosted applications.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /vulnerability[_-]?scanning|vuln[_-]?scan|security[_-]?scanning/i,
                        message: 'FedRAMP RA-5: Implement vulnerability scanning',
                        remediation: 'Deploy automated vulnerability scanning tools',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'PE-07',
                title: 'Visitor Control',
                description: 'The organization controls physical access to the information system by escorting visitors.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'warning',
                checks: [
                    {
                        pattern: /visitor[_-]?control|visitor[_-]?escort|guest[_-]?control/i,
                        message: 'FedRAMP PE-7: Implement visitor control and escort procedures',
                        remediation: 'Establish visitor control and escort procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },
            {
                id: 'SI-16',
                title: 'Memory Protection',
                description: 'The information system implements organization-defined security safeguards to protect its memory.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /memory[_-]?protection|memory[_-]?safeguards|memory[_-]?security/i,
                        message: 'FedRAMP SI-16: Implement memory protection safeguards',
                        remediation: 'Deploy memory protection mechanisms',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            }
        ];
    }
}