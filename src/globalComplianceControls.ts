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

            // ADDITIONAL FEDRAMP MODERATE CONTROLS - COMPREHENSIVE COVERAGE

            // Access Control (AC) - Missing Controls for Moderate
            {
                id: 'AC-05',
                title: 'Separation of Duties',
                description: 'The organization separates duties of individuals to reduce risk.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /role[_-]?separation|duty[_-]?separation|segregation[_-]?of[_-]?duties/i,
                        message: 'FedRAMP AC-5: Check for separation of duties implementation',
                        remediation: 'Implement role-based separation of duties',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /admin[_-]?role.*user[_-]?role|dual[_-]?control|approval[_-]?workflow/i,
                        message: 'FedRAMP AC-5: Verify dual control mechanisms',
                        remediation: 'Implement dual control and approval workflows',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
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
                        pattern: /max[_-]?login[_-]?attempts|lockout[_-]?threshold|failed[_-]?attempts/i,
                        message: 'FedRAMP AC-7: Check for login attempt limits',
                        remediation: 'Configure maximum failed login attempts and account lockout',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /account[_-]?lockout|lockout[_-]?duration|unlock[_-]?policy/i,
                        message: 'FedRAMP AC-7: Verify account lockout mechanisms',
                        remediation: 'Implement automatic account lockout after failed attempts',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-08',
                title: 'System Use Notification',
                description: 'The information system displays system use notification message.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /banner[_-]?message|login[_-]?banner|system[_-]?use[_-]?notification/i,
                        message: 'FedRAMP AC-8: Check for system use notification banner',
                        remediation: 'Display appropriate system use notification before login',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /consent[_-]?message|warning[_-]?banner|unauthorized[_-]?use/i,
                        message: 'FedRAMP AC-8: Verify consent and warning messages',
                        remediation: 'Include consent and warning text in system banners',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-11',
                title: 'Session Lock',
                description: 'The information system prevents further access by initiating session lock.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /session[_-]?timeout|idle[_-]?timeout|session[_-]?lock/i,
                        message: 'FedRAMP AC-11: Check for session timeout and lock mechanisms',
                        remediation: 'Configure automatic session lock after period of inactivity',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /screen[_-]?lock|auto[_-]?lock|inactivity[_-]?timeout/i,
                        message: 'FedRAMP AC-11: Verify automatic screen lock configuration',
                        remediation: 'Implement automatic screen lock for inactive sessions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-12',
                title: 'Session Termination',
                description: 'The information system automatically terminates sessions.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /session[_-]?termination|auto[_-]?logout|session[_-]?expiry/i,
                        message: 'FedRAMP AC-12: Check for automatic session termination',
                        remediation: 'Configure automatic session termination policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /logout[_-]?timeout|session[_-]?cleanup|connection[_-]?timeout/i,
                        message: 'FedRAMP AC-12: Verify session cleanup mechanisms',
                        remediation: 'Implement proper session cleanup and resource deallocation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-14',
                title: 'Permitted Actions without Identification or Authentication',
                description: 'The organization identifies user actions that can be performed without identification.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /anonymous[_-]?access|public[_-]?access|unauthenticated[_-]?access/i,
                        message: 'FedRAMP AC-14: Check for anonymous access controls',
                        remediation: 'Document and restrict anonymous access to authorized functions only',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /guest[_-]?access|no[_-]?auth|bypass[_-]?authentication/i,
                        message: 'FedRAMP AC-14: Verify guest access restrictions',
                        remediation: 'Limit guest access to essential functions only',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-18',
                title: 'Wireless Access',
                description: 'The organization establishes usage restrictions and configuration requirements for wireless access.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /wireless[_-]?access|wifi[_-]?config|wireless[_-]?security/i,
                        message: 'FedRAMP AC-18: Check for wireless access controls',
                        remediation: 'Implement strong wireless access restrictions and encryption',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /wpa|wep|wireless[_-]?encryption|802\.11/i,
                        message: 'FedRAMP AC-18: Verify wireless encryption standards',
                        remediation: 'Use WPA2/WPA3 encryption for wireless networks',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-19',
                title: 'Access Control for Mobile Devices',
                description: 'The organization establishes usage restrictions and configuration requirements for mobile devices.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /mobile[_-]?device|byod|device[_-]?management|mdm/i,
                        message: 'FedRAMP AC-19: Check for mobile device management',
                        remediation: 'Implement mobile device management and access controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /device[_-]?encryption|mobile[_-]?security|device[_-]?policy/i,
                        message: 'FedRAMP AC-19: Verify mobile device security policies',
                        remediation: 'Enforce mobile device encryption and security policies',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AC-20',
                title: 'Use of External Information Systems',
                description: 'The organization establishes terms and conditions for authorized use of external systems.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /external[_-]?system|third[_-]?party[_-]?access|vendor[_-]?access/i,
                        message: 'FedRAMP AC-20: Check for external system access controls',
                        remediation: 'Document and control access to external information systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cloud[_-]?provider|saas[_-]?access|external[_-]?integration/i,
                        message: 'FedRAMP AC-20: Verify external system integration controls',
                        remediation: 'Implement security controls for external system integrations',
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
                        pattern: /public[_-]?content|publicly[_-]?accessible|content[_-]?review/i,
                        message: 'FedRAMP AC-22: Check for public content controls',
                        remediation: 'Review and control publicly accessible content',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /data[_-]?classification|sensitive[_-]?data|information[_-]?disclosure/i,
                        message: 'FedRAMP AC-22: Verify data classification for public content',
                        remediation: 'Classify data and prevent sensitive information disclosure',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Audit and Accountability (AU) - Missing Controls for Moderate
            {
                id: 'AU-05',
                title: 'Response to Audit Processing Failures',
                description: 'The information system alerts designated personnel in the event of audit processing failure.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?failure|audit[_-]?alert|audit[_-]?monitoring/i,
                        message: 'FedRAMP AU-5: Check for audit failure response mechanisms',
                        remediation: 'Implement audit failure detection and alerting',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /log[_-]?failure|audit[_-]?overflow|audit[_-]?capacity/i,
                        message: 'FedRAMP AU-5: Verify audit capacity and overflow handling',
                        remediation: 'Configure audit capacity management and overflow protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-08',
                title: 'Time Stamps',
                description: 'The information system includes time stamps in audit records.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /timestamp|time[_-]?stamp|audit[_-]?time/i,
                        message: 'FedRAMP AU-8: Check for time stamps in audit records',
                        remediation: 'Include accurate time stamps in all audit records',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /ntp|time[_-]?sync|clock[_-]?sync/i,
                        message: 'FedRAMP AU-8: Verify time synchronization mechanisms',
                        remediation: 'Implement NTP time synchronization for accurate timestamps',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-11',
                title: 'Audit Record Retention',
                description: 'The organization retains audit records for a specified time period.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?retention|log[_-]?retention|retention[_-]?policy/i,
                        message: 'FedRAMP AU-11: Check for audit record retention policies',
                        remediation: 'Implement audit record retention for required time periods',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /archive[_-]?policy|log[_-]?archival|audit[_-]?backup/i,
                        message: 'FedRAMP AU-11: Verify audit record archival processes',
                        remediation: 'Configure audit record archival and backup procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AU-12',
                title: 'Audit Generation',
                description: 'The information system provides audit record generation capability.',
                family: 'AU',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /audit[_-]?generation|log[_-]?generation|audit[_-]?capability/i,
                        message: 'FedRAMP AU-12: Check for audit generation capabilities',
                        remediation: 'Implement comprehensive audit record generation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /audit[_-]?events|auditable[_-]?events|event[_-]?logging/i,
                        message: 'FedRAMP AU-12: Verify auditable event configuration',
                        remediation: 'Configure audit generation for all required events',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Configuration Management (CM) - Missing Controls for Moderate
            {
                id: 'CM-04',
                title: 'Security Impact Analysis',
                description: 'The organization analyzes changes to the information system to determine potential security impacts.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?impact|impact[_-]?analysis|change[_-]?impact/i,
                        message: 'FedRAMP CM-4: Check for security impact analysis processes',
                        remediation: 'Implement security impact analysis for system changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /risk[_-]?assessment|change[_-]?review|security[_-]?analysis/i,
                        message: 'FedRAMP CM-4: Verify change risk assessment procedures',
                        remediation: 'Conduct risk assessment before implementing changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-05',
                title: 'Access Restrictions for Change',
                description: 'The organization defines, documents, approves, and enforces access restrictions associated with changes.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /change[_-]?access|change[_-]?control|change[_-]?approval/i,
                        message: 'FedRAMP CM-5: Check for change access restrictions',
                        remediation: 'Implement access controls for system changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /approval[_-]?workflow|change[_-]?authorization|privileged[_-]?access/i,
                        message: 'FedRAMP CM-5: Verify change approval workflows',
                        remediation: 'Establish formal approval processes for changes',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CM-10',
                title: 'Software Usage Restrictions',
                description: 'The organization uses software and associated documentation in accordance with contract agreements.',
                family: 'CM',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /software[_-]?license|license[_-]?compliance|software[_-]?usage/i,
                        message: 'FedRAMP CM-10: Check for software license compliance',
                        remediation: 'Track and manage software license compliance',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /unauthorized[_-]?software|software[_-]?inventory|license[_-]?tracking/i,
                        message: 'FedRAMP CM-10: Verify unauthorized software controls',
                        remediation: 'Prevent installation of unauthorized software',
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
                        pattern: /user[_-]?installed|software[_-]?installation|installation[_-]?policy/i,
                        message: 'FedRAMP CM-11: Check for user software installation policies',
                        remediation: 'Establish policies for user software installation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /software[_-]?approval|installation[_-]?restriction|admin[_-]?rights/i,
                        message: 'FedRAMP CM-11: Verify software installation restrictions',
                        remediation: 'Restrict user ability to install unauthorized software',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Contingency Planning (CP) - Missing Controls for Moderate
            {
                id: 'CP-03',
                title: 'Contingency Training',
                description: 'The organization provides contingency plan training to information system users.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /contingency[_-]?training|disaster[_-]?training|emergency[_-]?training/i,
                        message: 'FedRAMP CP-3: Check for contingency plan training',
                        remediation: 'Provide training on contingency and emergency procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /training[_-]?schedule|drill[_-]?schedule|exercise[_-]?plan/i,
                        message: 'FedRAMP CP-3: Verify training schedule and exercises',
                        remediation: 'Schedule regular contingency training and drills',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /contingency[_-]?test|disaster[_-]?test|plan[_-]?testing/i,
                        message: 'FedRAMP CP-4: Check for contingency plan testing',
                        remediation: 'Conduct regular testing of contingency plans',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /test[_-]?results|test[_-]?documentation|recovery[_-]?test/i,
                        message: 'FedRAMP CP-4: Verify test documentation and results',
                        remediation: 'Document contingency plan test results and improvements',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CP-06',
                title: 'Alternate Storage Site',
                description: 'The organization establishes an alternate storage site.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?storage|backup[_-]?site|offsite[_-]?storage/i,
                        message: 'FedRAMP CP-6: Check for alternate storage site',
                        remediation: 'Establish alternate storage site for backup data',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /geographic[_-]?separation|remote[_-]?backup|disaster[_-]?recovery[_-]?site/i,
                        message: 'FedRAMP CP-6: Verify geographic separation of storage',
                        remediation: 'Ensure adequate geographic separation of backup sites',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CP-07',
                title: 'Alternate Processing Site',
                description: 'The organization establishes an alternate processing site.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?processing|backup[_-]?datacenter|failover[_-]?site/i,
                        message: 'FedRAMP CP-7: Check for alternate processing site',
                        remediation: 'Establish alternate processing site for disaster recovery',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /hot[_-]?site|warm[_-]?site|cold[_-]?site|recovery[_-]?center/i,
                        message: 'FedRAMP CP-7: Verify alternate site capabilities',
                        remediation: 'Configure appropriate alternate processing capabilities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CP-08',
                title: 'Telecommunications Services',
                description: 'The organization establishes alternate telecommunications services.',
                family: 'CP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?telecommunications|backup[_-]?communications|redundant[_-]?network/i,
                        message: 'FedRAMP CP-8: Check for alternate telecommunications',
                        remediation: 'Establish redundant telecommunications services',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /network[_-]?redundancy|communication[_-]?backup|telecom[_-]?failover/i,
                        message: 'FedRAMP CP-8: Verify telecommunications redundancy',
                        remediation: 'Implement network redundancy and failover capabilities',
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
                        pattern: /system[_-]?recovery|recovery[_-]?procedures|reconstitution/i,
                        message: 'FedRAMP CP-10: Check for system recovery procedures',
                        remediation: 'Develop comprehensive system recovery procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /recovery[_-]?time|rto|rpo|recovery[_-]?objectives/i,
                        message: 'FedRAMP CP-10: Verify recovery time objectives',
                        remediation: 'Define and implement recovery time and point objectives',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // Identification and Authentication (IA) - Missing Controls for Moderate
            {
                id: 'IA-01',
                title: 'Identification and Authentication Policy and Procedures',
                description: 'The organization develops and maintains identification and authentication policies.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /authentication[_-]?policy|identity[_-]?policy|ia[_-]?policy/i,
                        message: 'FedRAMP IA-1: Check for identification and authentication policies',
                        remediation: 'Develop comprehensive authentication policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /password[_-]?policy|authentication[_-]?procedure|identity[_-]?management/i,
                        message: 'FedRAMP IA-1: Verify authentication procedures',
                        remediation: 'Document authentication and identity management procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IA-03',
                title: 'Device Identification and Authentication',
                description: 'The information system uniquely identifies and authenticates devices.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /device[_-]?authentication|device[_-]?identity|device[_-]?certificate/i,
                        message: 'FedRAMP IA-3: Check for device identification and authentication',
                        remediation: 'Implement unique device identification and authentication',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /machine[_-]?authentication|device[_-]?registration|endpoint[_-]?authentication/i,
                        message: 'FedRAMP IA-3: Verify device authentication mechanisms',
                        remediation: 'Configure device authentication before network access',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IA-04',
                title: 'Identifier Management',
                description: 'The organization manages information system identifiers.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /identifier[_-]?management|user[_-]?id|account[_-]?management/i,
                        message: 'FedRAMP IA-4: Check for identifier management processes',
                        remediation: 'Implement systematic identifier management procedures',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /unique[_-]?identifier|id[_-]?assignment|identifier[_-]?policy/i,
                        message: 'FedRAMP IA-4: Verify unique identifier assignment',
                        remediation: 'Assign unique identifiers to users and entities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IA-05',
                title: 'Authenticator Management',
                description: 'The organization manages information system authenticators.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /authenticator[_-]?management|password[_-]?management|credential[_-]?management/i,
                        message: 'FedRAMP IA-5: Check for authenticator management',
                        remediation: 'Implement comprehensive authenticator management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /password[_-]?complexity|password[_-]?strength|authenticator[_-]?strength/i,
                        message: 'FedRAMP IA-5: Verify authenticator strength requirements',
                        remediation: 'Enforce strong authenticator requirements',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IA-06',
                title: 'Authenticator Feedback',
                description: 'The information system obscures feedback of authentication information.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /password[_-]?masking|authenticator[_-]?feedback|credential[_-]?obscure/i,
                        message: 'FedRAMP IA-6: Check for authenticator feedback obscuring',
                        remediation: 'Obscure authentication information during entry',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /echo[_-]?off|password[_-]?hiding|credential[_-]?protection/i,
                        message: 'FedRAMP IA-6: Verify password obscuring mechanisms',
                        remediation: 'Implement password masking and credential protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IA-07',
                title: 'Cryptographic Module Authentication',
                description: 'The information system implements mechanisms for authentication to cryptographic modules.',
                family: 'IA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /cryptographic[_-]?module|crypto[_-]?authentication|hsm[_-]?authentication/i,
                        message: 'FedRAMP IA-7: Check for cryptographic module authentication',
                        remediation: 'Implement authentication to cryptographic modules',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /fips[_-]?140|crypto[_-]?module|hardware[_-]?security/i,
                        message: 'FedRAMP IA-7: Verify FIPS 140-2 compliant modules',
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
                        pattern: /external[_-]?user|non[_-]?organizational|guest[_-]?authentication/i,
                        message: 'FedRAMP IA-8: Check for non-organizational user authentication',
                        remediation: 'Implement authentication for external users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /federated[_-]?identity|external[_-]?identity|third[_-]?party[_-]?auth/i,
                        message: 'FedRAMP IA-8: Verify federated identity management',
                        remediation: 'Configure federated identity for external users',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // CRITICAL SYSTEM AND COMMUNICATIONS PROTECTION (SC) CONTROLS
            {
                id: 'SC-01',
                title: 'System and Communications Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and communications protection policy.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?protection[_-]?policy|communications[_-]?protection|sc[_-]?policy/i,
                        message: 'FedRAMP SC-1: Check for system protection policies',
                        remediation: 'Develop system and communications protection policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /network[_-]?policy|communication[_-]?policy|system[_-]?security[_-]?policy/i,
                        message: 'FedRAMP SC-1: Verify communications protection procedures',
                        remediation: 'Document communications and system protection procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-02',
                title: 'Application Partitioning',
                description: 'The information system separates user functionality from system management functionality.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /application[_-]?partitioning|user[_-]?separation|management[_-]?separation/i,
                        message: 'FedRAMP SC-2: Check for application partitioning',
                        remediation: 'Implement separation between user and management functions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /privilege[_-]?separation|administrative[_-]?separation|function[_-]?isolation/i,
                        message: 'FedRAMP SC-2: Verify functional separation',
                        remediation: 'Separate administrative and user functions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-04',
                title: 'Information in Shared Resources',
                description: 'The information system prevents unauthorized access to information in shared resources.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /shared[_-]?resources|memory[_-]?protection|resource[_-]?isolation/i,
                        message: 'FedRAMP SC-4: Check for shared resource protection',
                        remediation: 'Implement protection for information in shared resources',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /data[_-]?isolation|tenant[_-]?isolation|multi[_-]?tenancy/i,
                        message: 'FedRAMP SC-4: Verify data isolation mechanisms',
                        remediation: 'Ensure proper data isolation in shared environments',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-05',
                title: 'Denial of Service Protection',
                description: 'The information system protects against denial of service attacks.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /ddos[_-]?protection|denial[_-]?of[_-]?service|dos[_-]?protection/i,
                        message: 'FedRAMP SC-5: Check for denial of service protection',
                        remediation: 'Implement DDoS and denial of service protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /rate[_-]?limiting|throttling|bandwidth[_-]?control/i,
                        message: 'FedRAMP SC-5: Verify rate limiting and throttling',
                        remediation: 'Configure rate limiting and bandwidth controls',
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

            // CRITICAL SYSTEM AND INFORMATION INTEGRITY (SI) CONTROLS
            {
                id: 'SI-01',
                title: 'System and Information Integrity Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and information integrity policy.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /information[_-]?integrity[_-]?policy|system[_-]?integrity|si[_-]?policy/i,
                        message: 'FedRAMP SI-1: Check for system integrity policies',
                        remediation: 'Develop system and information integrity policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /integrity[_-]?procedure|data[_-]?integrity|system[_-]?integrity[_-]?procedure/i,
                        message: 'FedRAMP SI-1: Verify integrity procedures',
                        remediation: 'Document system and information integrity procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

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
                id: 'SI-05',
                title: 'Security Alerts, Advisories, and Directives',
                description: 'The organization receives system security alerts and advisories.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?alerts|security[_-]?advisories|threat[_-]?intelligence/i,
                        message: 'FedRAMP SI-5: Check for security alert mechanisms',
                        remediation: 'Implement security alert and advisory monitoring',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cve[_-]?monitoring|security[_-]?feeds|threat[_-]?feeds/i,
                        message: 'FedRAMP SI-5: Verify threat intelligence feeds',
                        remediation: 'Subscribe to security advisories and threat intelligence',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL INCIDENT RESPONSE CONTROLS
            {
                id: 'IR-02',
                title: 'Incident Response Training',
                description: 'The organization provides incident response training to information system users.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?training|security[_-]?incident[_-]?training/i,
                        message: 'FedRAMP IR-2: Check for incident response training',
                        remediation: 'Provide incident response training to system users',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?handling[_-]?training|response[_-]?procedures[_-]?training/i,
                        message: 'FedRAMP IR-2: Verify training on incident handling',
                        remediation: 'Train personnel on incident handling procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        message: 'FedRAMP IR-5: Check for incident monitoring capabilities',
                        remediation: 'Implement incident monitoring and tracking systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?documentation|incident[_-]?logging|security[_-]?event[_-]?tracking/i,
                        message: 'FedRAMP IR-5: Verify incident documentation processes',
                        remediation: 'Document and track all security incidents',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'IR-07',
                title: 'Incident Response Assistance',
                description: 'The organization provides incident response support resources.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?assistance|incident[_-]?support|security[_-]?support/i,
                        message: 'FedRAMP IR-7: Check for incident response assistance',
                        remediation: 'Provide incident response assistance and support resources',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /help[_-]?desk|incident[_-]?contact|emergency[_-]?contact/i,
                        message: 'FedRAMP IR-7: Verify incident response contact information',
                        remediation: 'Maintain current incident response contact information',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /incident[_-]?response[_-]?plan|security[_-]?incident[_-]?plan|emergency[_-]?response[_-]?plan/i,
                        message: 'FedRAMP IR-8: Check for incident response plan',
                        remediation: 'Develop comprehensive incident response plan',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?procedures|response[_-]?procedures|escalation[_-]?procedures/i,
                        message: 'FedRAMP IR-8: Verify incident response procedures',
                        remediation: 'Document detailed incident response procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL RISK ASSESSMENT CONTROL
            {
                id: 'RA-02',
                title: 'Security Categorization',
                description: 'The organization categorizes information and the information system.',
                family: 'RA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?categorization|data[_-]?classification|information[_-]?categorization/i,
                        message: 'FedRAMP RA-2: Check for security categorization',
                        remediation: 'Implement security categorization for information and systems',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /fips[_-]?199|impact[_-]?level|confidentiality[_-]?level/i,
                        message: 'FedRAMP RA-2: Verify FIPS 199 categorization',
                        remediation: 'Apply FIPS 199 security categorization standards',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING CRITICAL SC CONTROLS FOR FEDRAMP MODERATE
            {
                id: 'SC-10',
                title: 'Network Disconnect',
                description: 'The information system terminates network connections at the end of sessions.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /network[_-]?disconnect|session[_-]?termination|connection[_-]?timeout/i,
                        message: 'FedRAMP SC-10: Check for network disconnect controls',
                        remediation: 'Implement automatic network disconnection after session timeout',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /idle[_-]?timeout|session[_-]?timeout|auto[_-]?logout/i,
                        message: 'FedRAMP SC-10: Verify session timeout configuration',
                        remediation: 'Configure automatic session termination for idle connections',
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
                severity: 'error',
                checks: [
                    {
                        pattern: /collaborative[_-]?computing|remote[_-]?activation|video[_-]?conference/i,
                        message: 'FedRAMP SC-15: Check for collaborative computing device controls',
                        remediation: 'Implement controls for collaborative computing devices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /microphone[_-]?control|camera[_-]?control|audio[_-]?visual/i,
                        message: 'FedRAMP SC-15: Verify audio/visual device restrictions',
                        remediation: 'Control remote activation of audio/visual devices',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-17',
                title: 'Public Key Infrastructure Certificates',
                description: 'The organization issues public key certificates or obtains public key certificates from approved service providers.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /pki[_-]?certificate|public[_-]?key[_-]?infrastructure|x509[_-]?certificate/i,
                        message: 'FedRAMP SC-17: Check for PKI certificate management',
                        remediation: 'Implement PKI certificate issuance and management',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /certificate[_-]?authority|ca[_-]?certificate|certificate[_-]?validation/i,
                        message: 'FedRAMP SC-17: Verify certificate authority validation',
                        remediation: 'Use approved certificate authorities for PKI certificates',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-18',
                title: 'Mobile Code',
                description: 'The organization defines acceptable and unacceptable mobile code and mobile code technologies.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /mobile[_-]?code|javascript[_-]?security|active[_-]?content/i,
                        message: 'FedRAMP SC-18: Check for mobile code restrictions',
                        remediation: 'Define and control acceptable mobile code usage',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /code[_-]?execution[_-]?policy|script[_-]?restriction|dynamic[_-]?content/i,
                        message: 'FedRAMP SC-18: Verify code execution policies',
                        remediation: 'Implement policies for mobile code execution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-19',
                title: 'Voice Over Internet Protocol',
                description: 'The organization controls and monitors the use of Voice over Internet Protocol (VoIP) technologies.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /voip|voice[_-]?over[_-]?ip|sip[_-]?protocol/i,
                        message: 'FedRAMP SC-19: Check for VoIP security controls',
                        remediation: 'Implement security controls for VoIP communications',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /voice[_-]?communication|telephony[_-]?security|rtp[_-]?security/i,
                        message: 'FedRAMP SC-19: Verify voice communication security',
                        remediation: 'Secure voice communications and telephony systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-20',
                title: 'Secure Name/Address Resolution Service (Authoritative Source)',
                description: 'The information system provides additional data origin authentication.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /dns[_-]?security|dnssec|secure[_-]?name[_-]?resolution/i,
                        message: 'FedRAMP SC-20: Check for secure DNS resolution',
                        remediation: 'Implement DNSSEC for secure name resolution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /authoritative[_-]?source|data[_-]?origin[_-]?authentication|dns[_-]?validation/i,
                        message: 'FedRAMP SC-20: Verify authoritative DNS sources',
                        remediation: 'Use authoritative sources for name resolution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-21',
                title: 'Secure Name/Address Resolution Service (Recursive or Caching Resolver)',
                description: 'The information system requests and performs data origin authentication verification.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /recursive[_-]?resolver|caching[_-]?resolver|dns[_-]?caching/i,
                        message: 'FedRAMP SC-21: Check for secure DNS caching',
                        remediation: 'Implement secure DNS recursive resolution',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /dns[_-]?cache[_-]?validation|resolver[_-]?security|dns[_-]?integrity/i,
                        message: 'FedRAMP SC-21: Verify DNS resolver integrity',
                        remediation: 'Validate DNS cache integrity and security',
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
                severity: 'error',
                checks: [
                    {
                        pattern: /dns[_-]?architecture|fault[_-]?tolerant[_-]?dns|dns[_-]?redundancy/i,
                        message: 'FedRAMP SC-22: Check for fault-tolerant DNS architecture',
                        remediation: 'Implement fault-tolerant DNS architecture',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /dns[_-]?provisioning|name[_-]?service[_-]?architecture|dns[_-]?high[_-]?availability/i,
                        message: 'FedRAMP SC-22: Verify DNS service provisioning',
                        remediation: 'Ensure high availability for DNS services',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-23',
                title: 'Session Authenticity',
                description: 'The information system protects the authenticity of communications sessions.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /session[_-]?authenticity|session[_-]?integrity|communication[_-]?authenticity/i,
                        message: 'FedRAMP SC-23: Check for session authenticity protection',
                        remediation: 'Implement session authenticity verification',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /session[_-]?token|csrf[_-]?protection|session[_-]?validation/i,
                        message: 'FedRAMP SC-23: Verify session validation mechanisms',
                        remediation: 'Implement session token validation and CSRF protection',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SC-39',
                title: 'Process Isolation',
                description: 'The information system maintains separate execution domains for each executing process.',
                family: 'SC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /process[_-]?isolation|execution[_-]?domain|process[_-]?separation/i,
                        message: 'FedRAMP SC-39: Check for process isolation',
                        remediation: 'Implement process isolation and separate execution domains',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /container[_-]?isolation|sandbox|virtualization[_-]?isolation/i,
                        message: 'FedRAMP SC-39: Verify container and process separation',
                        remediation: 'Use containers or virtualization for process isolation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING CRITICAL SI CONTROLS FOR FEDRAMP MODERATE
            {
                id: 'SI-07',
                title: 'Software, Firmware, and Information Integrity',
                description: 'The organization employs integrity verification tools to detect unauthorized changes.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /integrity[_-]?verification|file[_-]?integrity|software[_-]?integrity/i,
                        message: 'FedRAMP SI-7: Check for integrity verification tools',
                        remediation: 'Implement file and software integrity monitoring',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /checksum|hash[_-]?verification|digital[_-]?signature/i,
                        message: 'FedRAMP SI-7: Verify integrity checking mechanisms',
                        remediation: 'Use checksums and digital signatures for integrity',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-08',
                title: 'Spam Protection',
                description: 'The information system implements spam protection mechanisms.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /spam[_-]?protection|anti[_-]?spam|email[_-]?filtering/i,
                        message: 'FedRAMP SI-8: Check for spam protection mechanisms',
                        remediation: 'Implement spam protection and email filtering',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /spam[_-]?filter|junk[_-]?mail[_-]?protection|email[_-]?security/i,
                        message: 'FedRAMP SI-8: Verify email security filtering',
                        remediation: 'Deploy comprehensive email security and spam filtering',
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
                        pattern: /input[_-]?validation|data[_-]?validation|parameter[_-]?validation/i,
                        message: 'FedRAMP SI-10: Check for input validation controls',
                        remediation: 'Implement comprehensive input validation',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /sanitization|sql[_-]?injection[_-]?prevention|xss[_-]?prevention/i,
                        message: 'FedRAMP SI-10: Verify injection attack prevention',
                        remediation: 'Implement input sanitization and injection prevention',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-11',
                title: 'Error Handling',
                description: 'The information system generates error messages that provide necessary information.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /error[_-]?handling|exception[_-]?handling|error[_-]?message/i,
                        message: 'FedRAMP SI-11: Check for secure error handling',
                        remediation: 'Implement secure error handling and messaging',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /information[_-]?disclosure|stack[_-]?trace|debug[_-]?information/i,
                        message: 'FedRAMP SI-11: Verify error information disclosure controls',
                        remediation: 'Prevent sensitive information disclosure in error messages',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-12',
                title: 'Information Handling and Retention',
                description: 'The organization handles and retains information within the information system.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /information[_-]?handling|data[_-]?retention|retention[_-]?policy/i,
                        message: 'FedRAMP SI-12: Check for information handling policies',
                        remediation: 'Implement information handling and retention policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /data[_-]?disposal|information[_-]?destruction|secure[_-]?deletion/i,
                        message: 'FedRAMP SI-12: Verify data disposal procedures',
                        remediation: 'Implement secure data disposal and destruction procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SI-16',
                title: 'Memory Protection',
                description: 'The information system implements memory protection mechanisms.',
                family: 'SI',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /memory[_-]?protection|buffer[_-]?overflow[_-]?protection|stack[_-]?protection/i,
                        message: 'FedRAMP SI-16: Check for memory protection mechanisms',
                        remediation: 'Implement memory protection and overflow prevention',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /aslr|dep|data[_-]?execution[_-]?prevention/i,
                        message: 'FedRAMP SI-16: Verify memory protection features',
                        remediation: 'Enable ASLR, DEP, and other memory protection features',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // CRITICAL MISSING CONTROLS FOR FEDRAMP COMPLETION
            
            // Configuration Management Controls
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

            // Identity and Authentication Control
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

            // System and Communications Protection Controls
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

            // System and Information Integrity Control
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

            // Additional Audit Controls for Complete Coverage
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

            // Access Control Enhancement
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

            // AWARENESS AND TRAINING CONTROLS
            {
                id: 'AT-01',
                title: 'Security Awareness and Training Policy and Procedures',
                description: 'The organization develops, documents, and disseminates security awareness and training policy.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?awareness|training[_-]?policy|awareness[_-]?training/i,
                        message: 'FedRAMP AT-1: Check for security awareness and training policies',
                        remediation: 'Develop security awareness and training policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /training[_-]?program|security[_-]?education|awareness[_-]?program/i,
                        message: 'FedRAMP AT-1: Verify training program documentation',
                        remediation: 'Document comprehensive security training programs',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /security[_-]?awareness[_-]?training|basic[_-]?security[_-]?training/i,
                        message: 'FedRAMP AT-2: Check for security awareness training implementation',
                        remediation: 'Provide basic security awareness training to all users',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /user[_-]?training|security[_-]?orientation|awareness[_-]?session/i,
                        message: 'FedRAMP AT-2: Verify user security training delivery',
                        remediation: 'Implement regular security awareness training sessions',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AT-03',
                title: 'Role-Based Security Training',
                description: 'The organization provides role-based security training to personnel.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /role[_-]?based[_-]?training|specialized[_-]?training|position[_-]?specific[_-]?training/i,
                        message: 'FedRAMP AT-3: Check for role-based security training',
                        remediation: 'Provide role-based security training for different positions',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /administrator[_-]?training|privileged[_-]?user[_-]?training|specialized[_-]?security[_-]?training/i,
                        message: 'FedRAMP AT-3: Verify specialized role training',
                        remediation: 'Implement specialized training for privileged users',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'AT-04',
                title: 'Security Training Records',
                description: 'The organization documents and monitors individual information system security training activities.',
                family: 'AT',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /training[_-]?records|security[_-]?training[_-]?documentation/i,
                        message: 'FedRAMP AT-4: Check for security training record keeping',
                        remediation: 'Maintain comprehensive security training records',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /training[_-]?tracking|completion[_-]?records|training[_-]?monitoring/i,
                        message: 'FedRAMP AT-4: Verify training record tracking',
                        remediation: 'Track and monitor security training completion',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SECURITY ASSESSMENT AND AUTHORIZATION CONTROLS
            {
                id: 'CA-01',
                title: 'Security Assessment and Authorization Policies and Procedures',
                description: 'The organization develops, documents, and disseminates security assessment and authorization policies.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?assessment[_-]?policy|authorization[_-]?policy|ca[_-]?policy/i,
                        message: 'FedRAMP CA-1: Check for security assessment and authorization policies',
                        remediation: 'Develop security assessment and authorization policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /assessment[_-]?procedures|authorization[_-]?procedures|security[_-]?evaluation/i,
                        message: 'FedRAMP CA-1: Verify assessment procedures documentation',
                        remediation: 'Document security assessment and authorization procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CA-02',
                title: 'Security Assessments',
                description: 'The organization develops a security assessment plan and conducts assessments.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?assessment[_-]?plan|assessment[_-]?methodology/i,
                        message: 'FedRAMP CA-2: Check for security assessment planning',
                        remediation: 'Develop and implement security assessment plans',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /vulnerability[_-]?assessment|penetration[_-]?testing|security[_-]?evaluation/i,
                        message: 'FedRAMP CA-2: Verify security assessment execution',
                        remediation: 'Conduct regular security assessments and testing',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /system[_-]?interconnections|interconnection[_-]?agreement|system[_-]?connections/i,
                        message: 'FedRAMP CA-3: Check for system interconnection controls',
                        remediation: 'Document and authorize system interconnections',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /isa|interconnection[_-]?security[_-]?agreement|connection[_-]?authorization/i,
                        message: 'FedRAMP CA-3: Verify interconnection security agreements',
                        remediation: 'Establish interconnection security agreements (ISAs)',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // PLANNING CONTROLS
            {
                id: 'PL-01',
                title: 'System Security Planning Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system security planning policies.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?planning[_-]?policy|system[_-]?security[_-]?plan/i,
                        message: 'FedRAMP PL-1: Check for system security planning policies',
                        remediation: 'Develop system security planning policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /ssp|security[_-]?planning[_-]?procedures|planning[_-]?methodology/i,
                        message: 'FedRAMP PL-1: Verify security planning procedures',
                        remediation: 'Document security planning procedures and methodologies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /system[_-]?security[_-]?plan|ssp|security[_-]?plan[_-]?document/i,
                        message: 'FedRAMP PL-2: Check for system security plan',
                        remediation: 'Develop comprehensive system security plan (SSP)',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /security[_-]?controls[_-]?implementation|control[_-]?implementation[_-]?plan/i,
                        message: 'FedRAMP PL-2: Verify security controls implementation documentation',
                        remediation: 'Document security controls implementation in SSP',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // PERSONNEL SECURITY CONTROLS
            {
                id: 'PS-01',
                title: 'Personnel Security Policy and Procedures',
                description: 'The organization develops, documents, and disseminates personnel security policies.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?security[_-]?policy|hr[_-]?security[_-]?policy/i,
                        message: 'FedRAMP PS-1: Check for personnel security policies',
                        remediation: 'Develop personnel security policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /background[_-]?check[_-]?policy|screening[_-]?procedures/i,
                        message: 'FedRAMP PS-1: Verify personnel screening procedures',
                        remediation: 'Document personnel screening and background check procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PS-02',
                title: 'Position Risk Designation',
                description: 'The organization assigns a risk designation to all organizational positions.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /position[_-]?risk[_-]?designation|risk[_-]?level[_-]?assignment/i,
                        message: 'FedRAMP PS-2: Check for position risk designations',
                        remediation: 'Assign risk designations to all organizational positions',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /high[_-]?risk[_-]?position|moderate[_-]?risk[_-]?position|low[_-]?risk[_-]?position/i,
                        message: 'FedRAMP PS-2: Verify position risk categorization',
                        remediation: 'Categorize positions by risk level (high, moderate, low)',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /personnel[_-]?screening|background[_-]?investigation|security[_-]?clearance/i,
                        message: 'FedRAMP PS-3: Check for personnel screening processes',
                        remediation: 'Implement personnel screening prior to system access',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /background[_-]?check|security[_-]?investigation|clearance[_-]?verification/i,
                        message: 'FedRAMP PS-3: Verify background check requirements',
                        remediation: 'Conduct appropriate background checks for system access',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // SYSTEM AND SERVICES ACQUISITION CONTROLS
            {
                id: 'SA-01',
                title: 'System and Services Acquisition Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system and services acquisition policies.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /acquisition[_-]?policy|system[_-]?acquisition[_-]?policy|services[_-]?acquisition/i,
                        message: 'FedRAMP SA-1: Check for system and services acquisition policies',
                        remediation: 'Develop system and services acquisition policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /procurement[_-]?security|acquisition[_-]?procedures|vendor[_-]?security/i,
                        message: 'FedRAMP SA-1: Verify acquisition security procedures',
                        remediation: 'Document security procedures for system acquisition',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SA-02',
                title: 'Allocation of Resources',
                description: 'The organization determines information security requirements for the information system.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /resource[_-]?allocation|security[_-]?requirements|information[_-]?security[_-]?requirements/i,
                        message: 'FedRAMP SA-2: Check for security requirements allocation',
                        remediation: 'Determine and allocate information security requirements',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /security[_-]?budget|security[_-]?resource[_-]?planning/i,
                        message: 'FedRAMP SA-2: Verify security resource planning',
                        remediation: 'Plan and budget for information security resources',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        message: 'FedRAMP SA-3: Check for SDLC methodology implementation',
                        remediation: 'Implement system development life cycle methodology',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /secure[_-]?development|security[_-]?in[_-]?sdlc|development[_-]?security/i,
                        message: 'FedRAMP SA-3: Verify security integration in SDLC',
                        remediation: 'Integrate security throughout the development life cycle',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SA-04',
                title: 'Acquisition Process',
                description: 'The organization includes security requirements in the acquisition process.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /acquisition[_-]?process|procurement[_-]?security|vendor[_-]?requirements/i,
                        message: 'FedRAMP SA-4: Check for security in acquisition process',
                        remediation: 'Include security requirements in acquisition processes',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /contract[_-]?security|vendor[_-]?security[_-]?requirements|supplier[_-]?security/i,
                        message: 'FedRAMP SA-4: Verify vendor security requirements',
                        remediation: 'Establish security requirements for vendors and suppliers',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // MAINTENANCE CONTROLS
            {
                id: 'MA-01',
                title: 'System Maintenance Policy and Procedures',
                description: 'The organization develops, documents, and disseminates system maintenance policies.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?policy|system[_-]?maintenance[_-]?policy/i,
                        message: 'FedRAMP MA-1: Check for system maintenance policies',
                        remediation: 'Develop system maintenance policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /maintenance[_-]?procedures|maintenance[_-]?schedule/i,
                        message: 'FedRAMP MA-1: Verify maintenance procedures documentation',
                        remediation: 'Document system maintenance procedures and schedules',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'MA-02',
                title: 'Controlled Maintenance',
                description: 'The organization schedules, performs, documents, and reviews records of maintenance.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /controlled[_-]?maintenance|maintenance[_-]?control|scheduled[_-]?maintenance/i,
                        message: 'FedRAMP MA-2: Check for controlled maintenance processes',
                        remediation: 'Implement controlled maintenance scheduling and documentation',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    },
                    {
                        pattern: /maintenance[_-]?records|maintenance[_-]?documentation|maintenance[_-]?tracking/i,
                        message: 'FedRAMP MA-2: Verify maintenance record keeping',
                        remediation: 'Maintain comprehensive maintenance records',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /nonlocal[_-]?maintenance|remote[_-]?maintenance|remote[_-]?access[_-]?maintenance/i,
                        message: 'FedRAMP MA-4: Check for nonlocal maintenance controls',
                        remediation: 'Control and monitor nonlocal maintenance activities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /remote[_-]?diagnostic|maintenance[_-]?session[_-]?monitoring/i,
                        message: 'FedRAMP MA-4: Verify remote maintenance monitoring',
                        remediation: 'Monitor and log remote maintenance sessions',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },

            {
                id: 'MA-05',
                title: 'Maintenance Personnel',
                description: 'The organization establishes a process for maintenance personnel authorization.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?personnel|authorized[_-]?maintenance[_-]?personnel/i,
                        message: 'FedRAMP MA-5: Check for maintenance personnel authorization',
                        remediation: 'Establish maintenance personnel authorization processes',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /maintenance[_-]?authorization|maintenance[_-]?access[_-]?control/i,
                        message: 'FedRAMP MA-5: Verify maintenance access controls',
                        remediation: 'Control access for maintenance personnel',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },

            // MEDIA PROTECTION CONTROLS
            {
                id: 'MP-01',
                title: 'Media Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates media protection policies.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?protection[_-]?policy|removable[_-]?media[_-]?policy/i,
                        message: 'FedRAMP MP-1: Check for media protection policies',
                        remediation: 'Develop media protection policies and procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /media[_-]?handling|media[_-]?sanitization[_-]?policy/i,
                        message: 'FedRAMP MP-1: Verify media handling procedures',
                        remediation: 'Document media handling and sanitization procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'MP-02',
                title: 'Media Access',
                description: 'The organization restricts access to digital and non-digital media.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?access[_-]?control|removable[_-]?media[_-]?control/i,
                        message: 'FedRAMP MP-2: Check for media access controls',
                        remediation: 'Implement media access restriction controls',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /usb[_-]?control|removable[_-]?storage[_-]?control|portable[_-]?media[_-]?control/i,
                        message: 'FedRAMP MP-2: Verify removable media controls',
                        remediation: 'Control access to removable and portable media',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'MP-06',
                title: 'Media Sanitization',
                description: 'The organization sanitizes digital media prior to disposal, release, or reuse.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?sanitization|secure[_-]?erase|data[_-]?destruction/i,
                        message: 'FedRAMP MP-6: Check for media sanitization procedures',
                        remediation: 'Implement media sanitization before disposal or reuse',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /secure[_-]?disposal|crypto[_-]?erase|degaussing/i,
                        message: 'FedRAMP MP-6: Verify secure disposal methods',
                        remediation: 'Use approved media sanitization methods',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // PHYSICAL AND ENVIRONMENTAL PROTECTION CONTROLS
            {
                id: 'PE-01',
                title: 'Physical and Environmental Protection Policy and Procedures',
                description: 'The organization develops, documents, and disseminates physical and environmental protection policies.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?protection[_-]?policy|environmental[_-]?protection[_-]?policy/i,
                        message: 'FedRAMP PE-1: Check for physical protection policies',
                        remediation: 'Develop physical and environmental protection policies',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /facility[_-]?security[_-]?policy|datacenter[_-]?security[_-]?policy/i,
                        message: 'FedRAMP PE-1: Verify facility security procedures',
                        remediation: 'Document facility and datacenter security procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /physical[_-]?access[_-]?authorization|facility[_-]?access[_-]?list/i,
                        message: 'FedRAMP PE-2: Check for physical access authorizations',
                        remediation: 'Maintain authorized physical access lists',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /access[_-]?badge|facility[_-]?authorization|datacenter[_-]?access/i,
                        message: 'FedRAMP PE-2: Verify physical access controls',
                        remediation: 'Control and authorize facility access',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-03',
                title: 'Physical Access Control',
                description: 'The organization enforces physical access authorizations at entry/exit points.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /physical[_-]?access[_-]?control|entry[_-]?point[_-]?control|facility[_-]?access[_-]?control/i,
                        message: 'FedRAMP PE-3: Check for physical access control enforcement',
                        remediation: 'Enforce physical access controls at entry points',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /badge[_-]?reader|card[_-]?access|biometric[_-]?access|access[_-]?control[_-]?system/i,
                        message: 'FedRAMP PE-3: Verify access control systems',
                        remediation: 'Deploy physical access control systems',
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
                        pattern: /physical[_-]?access[_-]?monitoring|facility[_-]?monitoring|cctv/i,
                        message: 'FedRAMP PE-6: Check for physical access monitoring',
                        remediation: 'Monitor physical access to facilities',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /surveillance[_-]?system|access[_-]?logs|visitor[_-]?logs/i,
                        message: 'FedRAMP PE-6: Verify physical monitoring systems',
                        remediation: 'Deploy surveillance and access logging systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-08',
                title: 'Visitor Access Records',
                description: 'The organization maintains visitor access records to the facility.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /visitor[_-]?access[_-]?records|visitor[_-]?log|guest[_-]?access/i,
                        message: 'FedRAMP PE-8: Check for visitor access record keeping',
                        remediation: 'Maintain visitor access records and logs',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /visitor[_-]?management|guest[_-]?registration|escort[_-]?procedures/i,
                        message: 'FedRAMP PE-8: Verify visitor management procedures',
                        remediation: 'Implement visitor management and escort procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-12',
                title: 'Emergency Lighting',
                description: 'The organization employs and maintains automatic emergency lighting.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /emergency[_-]?lighting|backup[_-]?lighting|emergency[_-]?power/i,
                        message: 'FedRAMP PE-12: Check for emergency lighting systems',
                        remediation: 'Deploy and maintain emergency lighting systems',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /ups|uninterruptible[_-]?power|battery[_-]?backup/i,
                        message: 'FedRAMP PE-12: Verify emergency power systems',
                        remediation: 'Maintain emergency power and lighting systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-13',
                title: 'Fire Protection',
                description: 'The organization employs and maintains fire suppression and detection devices.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /fire[_-]?protection|fire[_-]?suppression|fire[_-]?detection/i,
                        message: 'FedRAMP PE-13: Check for fire protection systems',
                        remediation: 'Deploy and maintain fire protection systems',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /smoke[_-]?detector|sprinkler[_-]?system|fire[_-]?alarm/i,
                        message: 'FedRAMP PE-13: Verify fire detection and suppression',
                        remediation: 'Maintain fire detection and suppression systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-14',
                title: 'Temperature and Humidity Controls',
                description: 'The organization maintains temperature and humidity levels within the facility.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /temperature[_-]?control|humidity[_-]?control|hvac/i,
                        message: 'FedRAMP PE-14: Check for environmental controls',
                        remediation: 'Maintain appropriate temperature and humidity controls',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /environmental[_-]?monitoring|climate[_-]?control|cooling[_-]?system/i,
                        message: 'FedRAMP PE-14: Verify environmental monitoring',
                        remediation: 'Monitor and control environmental conditions',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL ACCESS CONTROL
            {
                id: 'AC-21',
                title: 'Information Sharing',
                description: 'The organization facilitates information sharing by enabling authorized users to determine whether access authorizations assigned to the sharing partner match the access restrictions on the information.',
                family: 'AC',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /information[_-]?sharing|data[_-]?sharing[_-]?agreement|sharing[_-]?authorization/i,
                        message: 'FedRAMP AC-21: Check for information sharing controls',
                        remediation: 'Implement information sharing authorization controls',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cross[_-]?domain|partner[_-]?access|external[_-]?sharing/i,
                        message: 'FedRAMP AC-21: Verify cross-domain sharing controls',
                        remediation: 'Control information sharing with external partners',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL SECURITY ASSESSMENT CONTROLS
            {
                id: 'CA-05',
                title: 'Plan of Action and Milestones',
                description: 'The organization develops a plan of action and milestones for the information system.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /plan[_-]?of[_-]?action|poam|milestone[_-]?plan/i,
                        message: 'FedRAMP CA-5: Check for plan of action and milestones',
                        remediation: 'Develop plan of action and milestones (POA&M)',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /remediation[_-]?plan|weakness[_-]?tracking|vulnerability[_-]?remediation/i,
                        message: 'FedRAMP CA-5: Verify remediation planning',
                        remediation: 'Track and remediate security weaknesses',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CA-06',
                title: 'Security Authorization',
                description: 'The organization assigns a senior-level executive or manager as the authorizing official.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?authorization|authorizing[_-]?official|ao[_-]?designation/i,
                        message: 'FedRAMP CA-6: Check for security authorization process',
                        remediation: 'Assign authorizing official for security authorization',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /ato|authority[_-]?to[_-]?operate|authorization[_-]?decision/i,
                        message: 'FedRAMP CA-6: Verify authorization to operate process',
                        remediation: 'Establish authority to operate (ATO) process',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /continuous[_-]?monitoring|conmon|ongoing[_-]?assessment/i,
                        message: 'FedRAMP CA-7: Check for continuous monitoring program',
                        remediation: 'Implement continuous monitoring strategy',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /monitoring[_-]?strategy|security[_-]?metrics|control[_-]?assessment/i,
                        message: 'FedRAMP CA-7: Verify continuous monitoring implementation',
                        remediation: 'Deploy continuous security monitoring',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'CA-09',
                title: 'Internal System Connections',
                description: 'The organization authorizes internal connections of information system components.',
                family: 'CA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /internal[_-]?connections|system[_-]?component[_-]?connections|internal[_-]?interfaces/i,
                        message: 'FedRAMP CA-9: Check for internal system connection controls',
                        remediation: 'Authorize and control internal system connections',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /component[_-]?authorization|internal[_-]?network|system[_-]?architecture/i,
                        message: 'FedRAMP CA-9: Verify internal connection authorization',
                        remediation: 'Document and authorize system component connections',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL MAINTENANCE CONTROLS
            {
                id: 'MA-06',
                title: 'Timely Maintenance',
                description: 'The organization obtains maintenance support and/or spare parts for key information system components.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /timely[_-]?maintenance|maintenance[_-]?support|spare[_-]?parts/i,
                        message: 'FedRAMP MA-6: Check for timely maintenance support',
                        remediation: 'Ensure timely maintenance and spare parts availability',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /maintenance[_-]?contract|vendor[_-]?support|system[_-]?component[_-]?support/i,
                        message: 'FedRAMP MA-6: Verify maintenance support arrangements',
                        remediation: 'Establish maintenance support contracts',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL MEDIA PROTECTION CONTROLS
            {
                id: 'MP-07',
                title: 'Media Use',
                description: 'The organization restricts the use of certain types of digital media on information systems.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?use[_-]?restrictions|digital[_-]?media[_-]?control|removable[_-]?media[_-]?policy/i,
                        message: 'FedRAMP MP-7: Check for media use restrictions',
                        remediation: 'Restrict and control digital media usage',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /usb[_-]?restrictions|cd[_-]?dvd[_-]?control|portable[_-]?storage[_-]?restrictions/i,
                        message: 'FedRAMP MP-7: Verify removable media restrictions',
                        remediation: 'Implement restrictions on removable media',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL PLANNING CONTROLS
            {
                id: 'PL-04',
                title: 'Rules of Behavior',
                description: 'The organization establishes and makes readily available to individuals requiring access to the information system, the rules that describe their responsibilities and expected behavior.',
                family: 'PL',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /rules[_-]?of[_-]?behavior|user[_-]?responsibilities|acceptable[_-]?use[_-]?policy/i,
                        message: 'FedRAMP PL-4: Check for rules of behavior documentation',
                        remediation: 'Establish and communicate rules of behavior',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /user[_-]?agreement|behavior[_-]?expectations|access[_-]?responsibilities/i,
                        message: 'FedRAMP PL-4: Verify user behavior requirements',
                        remediation: 'Document user responsibilities and behavior expectations',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        message: 'FedRAMP PL-8: Check for information security architecture',
                        remediation: 'Develop information security architecture',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /architecture[_-]?documentation|security[_-]?blueprint|system[_-]?security[_-]?design/i,
                        message: 'FedRAMP PL-8: Verify security architecture documentation',
                        remediation: 'Document system security architecture',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL PERSONNEL SECURITY CONTROLS
            {
                id: 'PS-04',
                title: 'Personnel Termination',
                description: 'The organization, upon termination of individual employment, terminates information system access.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?termination|employment[_-]?termination|access[_-]?termination/i,
                        message: 'FedRAMP PS-4: Check for personnel termination procedures',
                        remediation: 'Implement personnel termination procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /account[_-]?deactivation|access[_-]?revocation|termination[_-]?checklist/i,
                        message: 'FedRAMP PS-4: Verify access termination process',
                        remediation: 'Terminate system access upon employment termination',
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
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?transfer|job[_-]?transfer|position[_-]?change/i,
                        message: 'FedRAMP PS-5: Check for personnel transfer procedures',
                        remediation: 'Implement personnel transfer access review procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /access[_-]?review|role[_-]?change|transfer[_-]?authorization/i,
                        message: 'FedRAMP PS-5: Verify transfer access controls',
                        remediation: 'Review access authorizations during personnel transfers',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PS-06',
                title: 'Access Agreements',
                description: 'The organization completes access agreements for individuals requiring access to organizational information and information systems.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /access[_-]?agreements|user[_-]?agreements|confidentiality[_-]?agreements/i,
                        message: 'FedRAMP PS-6: Check for access agreement documentation',
                        remediation: 'Implement access agreements for system users',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /nda|non[_-]?disclosure|access[_-]?authorization[_-]?agreement/i,
                        message: 'FedRAMP PS-6: Verify access agreement compliance',
                        remediation: 'Ensure signed access agreements before system access',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        message: 'FedRAMP PS-7: Check for third-party personnel security',
                        remediation: 'Establish third-party personnel security requirements',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /contractor[_-]?screening|vendor[_-]?background[_-]?check|third[_-]?party[_-]?screening/i,
                        message: 'FedRAMP PS-7: Verify third-party screening procedures',
                        remediation: 'Screen third-party personnel before system access',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // ADDITIONAL SYSTEM ACQUISITION CONTROLS
            {
                id: 'SA-05',
                title: 'Information System Documentation',
                description: 'The organization obtains administrator documentation for the information system.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /system[_-]?documentation|administrator[_-]?documentation|technical[_-]?documentation/i,
                        message: 'FedRAMP SA-5: Check for system documentation',
                        remediation: 'Obtain comprehensive system documentation',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /user[_-]?manual|admin[_-]?guide|system[_-]?manual/i,
                        message: 'FedRAMP SA-5: Verify documentation completeness',
                        remediation: 'Ensure complete system and user documentation',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SA-08',
                title: 'Security Engineering Principles',
                description: 'The organization applies information system security engineering principles in the specification, design, development, implementation, and modification of the information system.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /security[_-]?engineering|secure[_-]?development|security[_-]?by[_-]?design/i,
                        message: 'FedRAMP SA-8: Check for security engineering principles',
                        remediation: 'Apply security engineering principles in development',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /secure[_-]?coding|security[_-]?principles|defensive[_-]?programming/i,
                        message: 'FedRAMP SA-8: Verify secure development practices',
                        remediation: 'Implement secure development and engineering practices',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        pattern: /external[_-]?services|third[_-]?party[_-]?services|cloud[_-]?services/i,
                        message: 'FedRAMP SA-9: Check for external service security controls',
                        remediation: 'Control security of external information services',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /service[_-]?provider[_-]?security|vendor[_-]?compliance|external[_-]?security[_-]?requirements/i,
                        message: 'FedRAMP SA-9: Verify external service compliance',
                        remediation: 'Ensure external service providers meet security requirements',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'SA-10',
                title: 'Developer Configuration Management',
                description: 'The organization requires the developer of the information system to perform configuration management.',
                family: 'SA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /developer[_-]?configuration[_-]?management|development[_-]?cm|source[_-]?control/i,
                        message: 'FedRAMP SA-10: Check for developer configuration management',
                        remediation: 'Require developer configuration management practices',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /version[_-]?control|change[_-]?management|code[_-]?repository/i,
                        message: 'FedRAMP SA-10: Verify development configuration controls',
                        remediation: 'Implement configuration management in development',
                        fileTypes: ['.git', '.yaml', '.yml', '.json']
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
                        pattern: /developer[_-]?security[_-]?testing|security[_-]?assessment[_-]?plan|development[_-]?testing/i,
                        message: 'FedRAMP SA-11: Check for developer security testing',
                        remediation: 'Require developer security testing and evaluation',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /penetration[_-]?testing|security[_-]?evaluation|vulnerability[_-]?testing/i,
                        message: 'FedRAMP SA-11: Verify security testing implementation',
                        remediation: 'Implement comprehensive security testing in development',
                        fileTypes: ['.yaml', '.yml', '.json', '.tf']
                    }
                ]
            },

            // REMAINING INCIDENT RESPONSE CONTROLS
            {
                id: 'IR-07',
                title: 'Incident Response Assistance',
                description: 'The organization provides an incident response support resource that offers advice and assistance to users.',
                family: 'IR',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /incident[_-]?response[_-]?assistance|incident[_-]?support|ir[_-]?help[_-]?desk/i,
                        message: 'FedRAMP IR-7: Check for incident response assistance capability',
                        remediation: 'Provide incident response assistance and support resources',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /incident[_-]?hotline|security[_-]?help[_-]?desk|incident[_-]?reporting[_-]?support/i,
                        message: 'FedRAMP IR-7: Verify incident assistance availability',
                        remediation: 'Establish incident response assistance mechanisms',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING MAINTENANCE CONTROLS
            {
                id: 'MA-03',
                title: 'Maintenance Tools',
                description: 'The organization approves, controls, and monitors information system maintenance tools.',
                family: 'MA',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /maintenance[_-]?tools|system[_-]?maintenance[_-]?tools|diagnostic[_-]?tools/i,
                        message: 'FedRAMP MA-3: Check for maintenance tool controls',
                        remediation: 'Control and monitor system maintenance tools',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /tool[_-]?authorization|maintenance[_-]?equipment|diagnostic[_-]?equipment/i,
                        message: 'FedRAMP MA-3: Verify maintenance tool authorization',
                        remediation: 'Authorize and control maintenance tool usage',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING MEDIA PROTECTION CONTROLS
            {
                id: 'MP-03',
                title: 'Media Marking',
                description: 'The organization marks information system media indicating the distribution limitations.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?marking|media[_-]?labeling|classification[_-]?marking/i,
                        message: 'FedRAMP MP-3: Check for media marking requirements',
                        remediation: 'Mark media with appropriate classification labels',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /distribution[_-]?limitations|handling[_-]?instructions|classification[_-]?labels/i,
                        message: 'FedRAMP MP-3: Verify media marking implementation',
                        remediation: 'Implement media marking and labeling procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
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
                        message: 'FedRAMP MP-4: Check for secure media storage controls',
                        remediation: 'Implement secure media storage procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /storage[_-]?security|media[_-]?vault|physical[_-]?media[_-]?protection/i,
                        message: 'FedRAMP MP-4: Verify physical media storage security',
                        remediation: 'Secure physical and digital media storage',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'MP-05',
                title: 'Media Transport',
                description: 'The organization protects and controls digital and non-digital media during transport.',
                family: 'MP',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /media[_-]?transport|media[_-]?shipping|secure[_-]?transport/i,
                        message: 'FedRAMP MP-5: Check for media transport security',
                        remediation: 'Implement secure media transport procedures',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /courier[_-]?service|media[_-]?custody|transport[_-]?security/i,
                        message: 'FedRAMP MP-5: Verify media transport controls',
                        remediation: 'Control and secure media during transport',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING PHYSICAL PROTECTION CONTROLS
            {
                id: 'PE-04',
                title: 'Access Control for Transmission Medium',
                description: 'The organization controls physical access to information system distribution and transmission lines.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /transmission[_-]?medium[_-]?access|cable[_-]?protection|physical[_-]?transmission[_-]?security/i,
                        message: 'FedRAMP PE-4: Check for transmission medium access controls',
                        remediation: 'Control physical access to transmission lines',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /cable[_-]?security|conduit[_-]?protection|transmission[_-]?line[_-]?protection/i,
                        message: 'FedRAMP PE-4: Verify transmission medium protection',
                        remediation: 'Protect physical transmission and distribution lines',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-05',
                title: 'Output Device Access Control',
                description: 'The organization controls physical access to information system output devices.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /output[_-]?device[_-]?access|printer[_-]?security|display[_-]?security/i,
                        message: 'FedRAMP PE-5: Check for output device access controls',
                        remediation: 'Control physical access to output devices',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /printer[_-]?access[_-]?control|display[_-]?access[_-]?control|output[_-]?security/i,
                        message: 'FedRAMP PE-5: Verify output device security',
                        remediation: 'Secure printers, displays, and other output devices',
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
                        pattern: /power[_-]?equipment[_-]?protection|power[_-]?cabling[_-]?security|electrical[_-]?protection/i,
                        message: 'FedRAMP PE-9: Check for power equipment protection',
                        remediation: 'Protect power equipment and cabling',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /ups[_-]?protection|power[_-]?distribution|electrical[_-]?cabling[_-]?security/i,
                        message: 'FedRAMP PE-9: Verify power system security',
                        remediation: 'Secure power distribution and cabling systems',
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
                        pattern: /emergency[_-]?shutoff|emergency[_-]?power[_-]?off|epo[_-]?system/i,
                        message: 'FedRAMP PE-10: Check for emergency shutoff capability',
                        remediation: 'Implement emergency power shutoff capability',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /power[_-]?shutoff|emergency[_-]?shutdown|epo[_-]?button/i,
                        message: 'FedRAMP PE-10: Verify emergency shutoff implementation',
                        remediation: 'Deploy emergency power shutoff systems',
                        fileTypes: ['.tf', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-11',
                title: 'Emergency Power',
                description: 'The organization provides a short-term uninterruptible power supply to facilitate an orderly shutdown.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /emergency[_-]?power|uninterruptible[_-]?power[_-]?supply|ups[_-]?system/i,
                        message: 'FedRAMP PE-11: Check for emergency power systems',
                        remediation: 'Implement emergency power and UPS systems',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /backup[_-]?power|generator|battery[_-]?backup[_-]?system/i,
                        message: 'FedRAMP PE-11: Verify emergency power capability',
                        remediation: 'Deploy backup power and battery systems',
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
                severity: 'error',
                checks: [
                    {
                        pattern: /water[_-]?damage[_-]?protection|water[_-]?leak[_-]?detection|flood[_-]?protection/i,
                        message: 'FedRAMP PE-15: Check for water damage protection',
                        remediation: 'Implement water damage protection systems',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /leak[_-]?detection|water[_-]?sensors|flood[_-]?sensors/i,
                        message: 'FedRAMP PE-15: Verify water detection systems',
                        remediation: 'Deploy water leak detection and protection',
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
                severity: 'error',
                checks: [
                    {
                        pattern: /delivery[_-]?control|component[_-]?delivery|equipment[_-]?receiving/i,
                        message: 'FedRAMP PE-16: Check for delivery and removal controls',
                        remediation: 'Control delivery and removal of system components',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /shipping[_-]?receiving|equipment[_-]?tracking|component[_-]?authorization/i,
                        message: 'FedRAMP PE-16: Verify component delivery authorization',
                        remediation: 'Authorize and track system component delivery/removal',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            {
                id: 'PE-17',
                title: 'Alternate Work Site',
                description: 'The organization employs security controls for employees working at alternate work sites.',
                family: 'PE',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /alternate[_-]?work[_-]?site|remote[_-]?work[_-]?security|telework[_-]?security/i,
                        message: 'FedRAMP PE-17: Check for alternate work site controls',
                        remediation: 'Implement security controls for alternate work sites',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /home[_-]?office[_-]?security|remote[_-]?office[_-]?controls|telework[_-]?policy/i,
                        message: 'FedRAMP PE-17: Verify remote work security',
                        remediation: 'Establish security controls for remote work locations',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            },

            // REMAINING PERSONNEL SECURITY CONTROLS
            {
                id: 'PS-08',
                title: 'Personnel Sanctions',
                description: 'The organization employs a formal sanctions process for individuals failing to comply with established information security policies and procedures.',
                family: 'PS',
                standard: 'FedRAMP',
                severity: 'error',
                checks: [
                    {
                        pattern: /personnel[_-]?sanctions|disciplinary[_-]?action|security[_-]?violations[_-]?sanctions/i,
                        message: 'FedRAMP PS-8: Check for personnel sanctions process',
                        remediation: 'Implement formal personnel sanctions process',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    },
                    {
                        pattern: /disciplinary[_-]?procedures|sanctions[_-]?policy|violation[_-]?consequences/i,
                        message: 'FedRAMP PS-8: Verify sanctions implementation',
                        remediation: 'Establish consequences for security policy violations',
                        fileTypes: ['.md', '.txt', '.yaml', '.yml', '.json']
                    }
                ]
            }
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
        
        Array.from(instance.controls.values()).forEach(controls => {
            allControls.push(...controls);
        });
        
        return allControls;
    }
}
