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
            }
        ];
    }
}
