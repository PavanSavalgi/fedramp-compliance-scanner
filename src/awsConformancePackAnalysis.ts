/**
 * AWS Config Conformance Pack Coverage Analysis for FedRAMP
 * 
 * This module analyzes AWS Config Conformance Pack coverage for FedRAMP Low, Moderate, and High impact levels.
 * It maps AWS Config rules to specific FedRAMP controls and identifies coverage gaps.
 */

import { FedRAMPLevel } from './types';

export interface AWSConfigRule {
    ruleName: string;
    ruleIdentifier: string;
    description: string;
    resourceTypes: string[];
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    remediationAvailable: boolean;
}

export interface FedRAMPControlMapping {
    controlId: string;
    controlFamily: string;
    controlTitle: string;
    applicableLevels: FedRAMPLevel[];
    awsConfigRules: AWSConfigRule[];
    coveragePercentage: number;
    gaps: string[];
    recommendations: string[];
}

export interface ConformancePackCoverage {
    packName: string;
    fedrampLevel: FedRAMPLevel;
    totalControls: number;
    coveredControls: number;
    coveragePercentage: number;
    controlMappings: FedRAMPControlMapping[];
    criticalGaps: string[];
    recommendations: string[];
}

// AWS Config Rules for FedRAMP Compliance
export const AWS_CONFIG_RULES: { [key: string]: AWSConfigRule } = {
    // Access Control (AC) Rules
    'access-keys-rotated': {
        ruleName: 'access-keys-rotated',
        ruleIdentifier: 'ACCESS_KEYS_ROTATED',
        description: 'Checks whether the active access keys are rotated within the number of days specified in maxAccessKeyAge',
        resourceTypes: ['AWS::IAM::User'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'iam-password-policy': {
        ruleName: 'iam-password-policy',
        ruleIdentifier: 'IAM_PASSWORD_POLICY',
        description: 'Checks whether the account password policy for IAM users meets the specified requirements',
        resourceTypes: ['AWS::IAM::AccountPasswordPolicy'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'iam-user-mfa-enabled': {
        ruleName: 'iam-user-mfa-enabled',
        ruleIdentifier: 'IAM_USER_MFA_ENABLED',
        description: 'Checks whether the AWS Identity and Access Management users have multi-factor authentication (MFA) enabled',
        resourceTypes: ['AWS::IAM::User'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'root-access-key-check': {
        ruleName: 'root-access-key-check',
        ruleIdentifier: 'ROOT_ACCESS_KEY_CHECK',
        description: 'Checks whether the root user access key is available',
        resourceTypes: ['AWS::IAM::User'],
        severity: 'CRITICAL',
        remediationAvailable: true
    },

    // Audit and Accountability (AU) Rules
    'cloudtrail-enabled': {
        ruleName: 'cloudtrail-enabled',
        ruleIdentifier: 'CLOUD_TRAIL_ENABLED',
        description: 'Checks whether AWS CloudTrail is enabled',
        resourceTypes: ['AWS::CloudTrail::Trail'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'cloudtrail-log-file-validation-enabled': {
        ruleName: 'cloudtrail-log-file-validation-enabled',
        ruleIdentifier: 'CLOUD_TRAIL_LOG_FILE_VALIDATION_ENABLED',
        description: 'Checks whether AWS CloudTrail creates a signed digest file with logs',
        resourceTypes: ['AWS::CloudTrail::Trail'],
        severity: 'MEDIUM',
        remediationAvailable: true
    },
    'cloudwatch-log-group-encrypted': {
        ruleName: 'cloudwatch-log-group-encrypted',
        ruleIdentifier: 'CLOUDWATCH_LOG_GROUP_ENCRYPTED',
        description: 'Checks whether a log group in Amazon CloudWatch Logs is encrypted',
        resourceTypes: ['AWS::Logs::LogGroup'],
        severity: 'HIGH',
        remediationAvailable: true
    },

    // Configuration Management (CM) Rules
    'ec2-security-group-attached-to-eni': {
        ruleName: 'ec2-security-group-attached-to-eni',
        ruleIdentifier: 'EC2_SECURITY_GROUP_ATTACHED_TO_ENI',
        description: 'Checks that security groups are attached to Amazon Elastic Compute Cloud (Amazon EC2) instances or to an elastic network interface',
        resourceTypes: ['AWS::EC2::SecurityGroup'],
        severity: 'MEDIUM',
        remediationAvailable: true
    },
    'ec2-instance-managed-by-systems-manager': {
        ruleName: 'ec2-instance-managed-by-systems-manager',
        ruleIdentifier: 'EC2_INSTANCE_MANAGED_BY_SSM',
        description: 'Checks whether the Amazon EC2 instances in your account are managed by AWS Systems Manager',
        resourceTypes: ['AWS::EC2::Instance', 'AWS::SSM::AssociationCompliance'],
        severity: 'MEDIUM',
        remediationAvailable: true
    },

    // Identification and Authentication (IA) Rules
    'mfa-enabled-for-iam-console-access': {
        ruleName: 'mfa-enabled-for-iam-console-access',
        ruleIdentifier: 'MFA_ENABLED_FOR_IAM_CONSOLE_ACCESS',
        description: 'Checks whether AWS Multi-Factor Authentication (MFA) is enabled for all AWS Identity and Access Management (IAM) users that can access the AWS Management Console',
        resourceTypes: ['AWS::IAM::User'],
        severity: 'HIGH',
        remediationAvailable: true
    },

    // System and Communications Protection (SC) Rules
    'encrypted-volumes': {
        ruleName: 'encrypted-volumes',
        ruleIdentifier: 'ENCRYPTED_VOLUMES',
        description: 'Checks whether the EBS volumes that are in an attached state are encrypted',
        resourceTypes: ['AWS::EC2::Volume'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'rds-storage-encrypted': {
        ruleName: 'rds-storage-encrypted',
        ruleIdentifier: 'RDS_STORAGE_ENCRYPTED',
        description: 'Checks whether storage encryption is enabled for your RDS DB instances',
        resourceTypes: ['AWS::RDS::DBInstance'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    's3-bucket-ssl-requests-only': {
        ruleName: 's3-bucket-ssl-requests-only',
        ruleIdentifier: 'S3_BUCKET_SSL_REQUESTS_ONLY',
        description: 'Checks whether S3 buckets have policies that require requests to use Secure Socket Layer (SSL)',
        resourceTypes: ['AWS::S3::Bucket'],
        severity: 'HIGH',
        remediationAvailable: true
    },
    'vpc-sg-open-only-to-authorized-ports': {
        ruleName: 'vpc-sg-open-only-to-authorized-ports',
        ruleIdentifier: 'INCOMING_SSH_DISABLED',
        description: 'Checks whether security groups that are in use disallow unrestricted incoming SSH traffic',
        resourceTypes: ['AWS::EC2::SecurityGroup'],
        severity: 'HIGH',
        remediationAvailable: true
    },

    // System and Information Integrity (SI) Rules
    'guardduty-enabled-centralized': {
        ruleName: 'guardduty-enabled-centralized',
        ruleIdentifier: 'GUARDDUTY_ENABLED_CENTRALIZED',
        description: 'Checks whether Amazon GuardDuty is enabled in your AWS account and region',
        resourceTypes: ['AWS::GuardDuty::Detector'],
        severity: 'HIGH',
        remediationAvailable: true
    }
};

// FedRAMP Control to AWS Config Rule Mappings
export const FEDRAMP_AWS_CONFIG_MAPPINGS: FedRAMPControlMapping[] = [
    {
        controlId: 'AC-2',
        controlFamily: 'Access Control',
        controlTitle: 'Account Management',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['access-keys-rotated'],
            AWS_CONFIG_RULES['iam-user-mfa-enabled'],
            AWS_CONFIG_RULES['root-access-key-check']
        ],
        coveragePercentage: 75,
        gaps: ['User lifecycle management automation', 'Account privilege reviews'],
        recommendations: [
            'Implement automated user provisioning/deprovisioning',
            'Set up regular access reviews using AWS IAM Access Analyzer'
        ]
    },
    {
        controlId: 'AC-3',
        controlFamily: 'Access Control',
        controlTitle: 'Access Enforcement',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['iam-password-policy'],
            AWS_CONFIG_RULES['mfa-enabled-for-iam-console-access']
        ],
        coveragePercentage: 60,
        gaps: ['Fine-grained resource access controls', 'Dynamic access policies'],
        recommendations: [
            'Implement attribute-based access control (ABAC)',
            'Use AWS IAM Conditions for dynamic access control'
        ]
    },
    {
        controlId: 'AU-2',
        controlFamily: 'Audit and Accountability',
        controlTitle: 'Auditable Events',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['cloudtrail-enabled'],
            AWS_CONFIG_RULES['cloudtrail-log-file-validation-enabled']
        ],
        coveragePercentage: 80,
        gaps: ['Application-level audit events', 'Custom audit event definitions'],
        recommendations: [
            'Configure application logging to CloudWatch',
            'Use AWS Config Rules for custom compliance monitoring'
        ]
    },
    {
        controlId: 'AU-4',
        controlFamily: 'Audit and Accountability',
        controlTitle: 'Audit Storage Capacity',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['cloudwatch-log-group-encrypted']
        ],
        coveragePercentage: 50,
        gaps: ['Automated capacity monitoring', 'Retention policy enforcement'],
        recommendations: [
            'Set up CloudWatch alarms for log storage capacity',
            'Implement automated log archival to S3 Glacier'
        ]
    },
    {
        controlId: 'CM-2',
        controlFamily: 'Configuration Management',
        controlTitle: 'Baseline Configuration',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['ec2-instance-managed-by-systems-manager']
        ],
        coveragePercentage: 45,
        gaps: ['Configuration drift detection', 'Automated baseline enforcement'],
        recommendations: [
            'Use AWS Systems Manager State Manager for configuration compliance',
            'Implement AWS Config remediation actions'
        ]
    },
    {
        controlId: 'CM-6',
        controlFamily: 'Configuration Management',
        controlTitle: 'Configuration Settings',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['ec2-security-group-attached-to-eni']
        ],
        coveragePercentage: 40,
        gaps: ['Comprehensive configuration management', 'Change control integration'],
        recommendations: [
            'Use AWS Systems Manager Parameter Store for configuration management',
            'Integrate with AWS Service Catalog for standardized deployments'
        ]
    },
    {
        controlId: 'IA-2',
        controlFamily: 'Identification and Authentication',
        controlTitle: 'Identification and Authentication (Organizational Users)',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['iam-user-mfa-enabled'],
            AWS_CONFIG_RULES['mfa-enabled-for-iam-console-access']
        ],
        coveragePercentage: 85,
        gaps: ['Certificate-based authentication', 'Biometric authentication'],
        recommendations: [
            'Implement AWS SSO with external identity providers',
            'Use AWS IAM Roles for service-to-service authentication'
        ]
    },
    {
        controlId: 'SC-7',
        controlFamily: 'System and Communications Protection',
        controlTitle: 'Boundary Protection',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['vpc-sg-open-only-to-authorized-ports']
        ],
        coveragePercentage: 70,
        gaps: ['Application-layer firewalls', 'DDoS protection configuration'],
        recommendations: [
            'Implement AWS WAF for application protection',
            'Use AWS Shield Advanced for DDoS protection'
        ]
    },
    {
        controlId: 'SC-8',
        controlFamily: 'System and Communications Protection',
        controlTitle: 'Transmission Confidentiality and Integrity',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['s3-bucket-ssl-requests-only']
        ],
        coveragePercentage: 65,
        gaps: ['End-to-end encryption verification', 'Protocol-specific encryption'],
        recommendations: [
            'Use AWS Certificate Manager for TLS certificate management',
            'Implement VPC endpoints for private communication'
        ]
    },
    {
        controlId: 'SC-28',
        controlFamily: 'System and Communications Protection',
        controlTitle: 'Protection of Information at Rest',
        applicableLevels: [FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['encrypted-volumes'],
            AWS_CONFIG_RULES['rds-storage-encrypted']
        ],
        coveragePercentage: 90,
        gaps: ['Key rotation policies', 'Hardware security module integration'],
        recommendations: [
            'Use AWS KMS for centralized key management',
            'Implement automated key rotation policies'
        ]
    },
    {
        controlId: 'SI-4',
        controlFamily: 'System and Information Integrity',
        controlTitle: 'Information System Monitoring',
        applicableLevels: [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High],
        awsConfigRules: [
            AWS_CONFIG_RULES['guardduty-enabled-centralized']
        ],
        coveragePercentage: 75,
        gaps: ['Custom threat detection rules', 'Behavioral analysis'],
        recommendations: [
            'Configure Amazon Security Hub for centralized security monitoring',
            'Use AWS CloudWatch for custom monitoring metrics'
        ]
    }
];

// Conformance Pack Coverage Analysis
export function analyzeConformancePackCoverage(level: FedRAMPLevel): ConformancePackCoverage {
    const applicableControls = FEDRAMP_AWS_CONFIG_MAPPINGS.filter(
        mapping => mapping.applicableLevels.includes(level)
    );

    const totalControls = applicableControls.length;
    const coveredControls = applicableControls.filter(
        mapping => mapping.coveragePercentage >= 50
    ).length;

    const overallCoverage = totalControls > 0 ? 
        Math.round((coveredControls / totalControls) * 100) : 0;

    const criticalGaps = applicableControls
        .filter(mapping => mapping.coveragePercentage < 50)
        .map(mapping => `${mapping.controlId}: ${mapping.controlTitle}`);

    const recommendations = [
        'Implement additional AWS Config rules for comprehensive coverage',
        'Use AWS Security Hub for centralized compliance monitoring',
        'Configure AWS Systems Manager for configuration management',
        'Set up automated remediation using AWS Config and Lambda',
        'Integrate with third-party security tools for enhanced monitoring'
    ];

    return {
        packName: `AWS Config Conformance Pack for FedRAMP ${level}`,
        fedrampLevel: level,
        totalControls,
        coveredControls,
        coveragePercentage: overallCoverage,
        controlMappings: applicableControls,
        criticalGaps,
        recommendations
    };
}

// Generate detailed coverage report
export function generateCoverageReport(): string {
    const levels = [FedRAMPLevel.Low, FedRAMPLevel.Moderate, FedRAMPLevel.High];
    let report = '# AWS Config Conformance Pack Coverage for FedRAMP\n\n';

    levels.forEach(level => {
        const coverage = analyzeConformancePackCoverage(level);
        
        report += `## FedRAMP ${level} Impact Level\n\n`;
        report += `**Overall Coverage: ${coverage.coveragePercentage}%**\n`;
        report += `- Total Controls: ${coverage.totalControls}\n`;
        report += `- Covered Controls: ${coverage.coveredControls}\n`;
        report += `- Coverage Gap: ${coverage.totalControls - coverage.coveredControls} controls\n\n`;

        report += '### Control Mappings\n\n';
        coverage.controlMappings.forEach(mapping => {
            report += `#### ${mapping.controlId} - ${mapping.controlTitle}\n`;
            report += `**Coverage: ${mapping.coveragePercentage}%**\n\n`;
            report += '**AWS Config Rules:**\n';
            mapping.awsConfigRules.forEach(rule => {
                report += `- ${rule.ruleName} (${rule.severity})\n`;
            });
            report += '\n**Coverage Gaps:**\n';
            mapping.gaps.forEach(gap => {
                report += `- ${gap}\n`;
            });
            report += '\n**Recommendations:**\n';
            mapping.recommendations.forEach(rec => {
                report += `- ${rec}\n`;
            });
            report += '\n---\n\n';
        });

        if (coverage.criticalGaps.length > 0) {
            report += '### Critical Coverage Gaps\n\n';
            coverage.criticalGaps.forEach(gap => {
                report += `- ${gap}\n`;
            });
            report += '\n';
        }

        report += '### Overall Recommendations\n\n';
        coverage.recommendations.forEach(rec => {
            report += `- ${rec}\n`;
        });
        report += '\n';
    });

    return report;
}

// Export summary for quick reference
export const COVERAGE_SUMMARY = {
    [FedRAMPLevel.Low]: analyzeConformancePackCoverage(FedRAMPLevel.Low),
    [FedRAMPLevel.Moderate]: analyzeConformancePackCoverage(FedRAMPLevel.Moderate),
    [FedRAMPLevel.High]: analyzeConformancePackCoverage(FedRAMPLevel.High)
};
