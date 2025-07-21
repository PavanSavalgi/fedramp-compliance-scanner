/**
 * Cloud Integration Types and Interfaces
 * FedRAMP Compliance Scanner v2.7.0 - Cloud Infrastructure Scanning
 */

export interface CloudCredentials {
    provider: 'aws' | 'azure' | 'gcp';
    region?: string;
    profile?: string;
}

export interface AWSCredentials extends CloudCredentials {
    provider: 'aws';
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    region: string;
    profile?: string;
}

export interface ComplianceIssue {
    id: string;
    control: string;           // FedRAMP control (e.g., 'AC-2', 'SC-8')
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resource: string;          // Resource name or identifier
    resourceArn?: string;      // AWS ARN or equivalent
    resourceType: string;      // e.g., 'IAMUser', 'S3Bucket', 'EC2Instance'
    description: string;       // Issue description
    remediation: string;       // How to fix the issue
    riskScore: number;         // 0-100 risk score
    region?: string;
    accountId?: string;
    tags?: Record<string, string>;
    lastChecked: Date;
}

export interface CloudComplianceReport {
    provider: string;
    accountId?: string;
    region?: string;
    scanStartTime: Date;
    scanEndTime: Date;
    totalResources: number;
    compliantResources: number;
    nonCompliantResources: number;
    complianceScore: number;   // 0-100 overall compliance score
    issues: ComplianceIssue[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    controlCoverage: ControlCoverage[];
}

export interface ControlCoverage {
    controlId: string;         // e.g., 'AC-2'
    controlName: string;       // e.g., 'Account Management'
    status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
    resourcesChecked: number;
    issuesFound: number;
    lastAssessed: Date;
}

export interface CloudScannerOptions {
    region?: string;
    profile?: string;
    maxConcurrentRequests?: number;
    enableCaching?: boolean;
    cacheTTL?: number;
    dryRun?: boolean;
}

export interface CloudScanner {
    connect(credentials: CloudCredentials): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    validateCredentials(): Promise<boolean>;
    scanInfrastructure(options?: CloudScannerOptions): Promise<CloudComplianceReport>;
    getResourceCount(): Promise<number>;
    getConnectionStatus(): ConnectionStatus;
}

export interface ConnectionStatus {
    connected: boolean;
    provider?: string;
    region?: string;
    accountId?: string;
    lastConnected?: Date;
    error?: string;
}

// AWS-specific interfaces
export interface IAMComplianceIssue extends ComplianceIssue {
    resourceType: 'IAMUser' | 'IAMRole' | 'IAMPolicy' | 'IAMGroup';
    userName?: string;
    roleName?: string;
    policyName?: string;
    groupName?: string;
    mfaEnabled?: boolean;
    accessKeyAge?: number;
    lastUsed?: Date;
}

export interface EC2ComplianceIssue extends ComplianceIssue {
    resourceType: 'EC2Instance' | 'SecurityGroup' | 'NetworkAcl' | 'VPC';
    instanceId?: string;
    securityGroupId?: string;
    vpcId?: string;
    publicIp?: string;
    encryptionEnabled?: boolean;
    ports?: number[];
}

export interface S3ComplianceIssue extends ComplianceIssue {
    resourceType: 'S3Bucket' | 'S3Object';
    bucketName?: string;
    objectKey?: string;
    publicRead?: boolean;
    publicWrite?: boolean;
    encryptionEnabled?: boolean;
    versioning?: boolean;
    mfaDelete?: boolean;
}

export interface RDSComplianceIssue extends ComplianceIssue {
    resourceType: 'RDSInstance' | 'RDSCluster' | 'RDSSnapshot';
    instanceId?: string;
    clusterId?: string;
    snapshotId?: string;
    encryptionAtRest?: boolean;
    encryptionInTransit?: boolean;
    backupRetention?: number;
    multiAz?: boolean;
    publiclyAccessible?: boolean;
}

export interface CloudTrailComplianceIssue extends ComplianceIssue {
    resourceType: 'CloudTrail' | 'CloudTrailEvent';
    trailName?: string;
    isLogging?: boolean;
    isMultiRegion?: boolean;
    includeGlobalServices?: boolean;
    logFileValidation?: boolean;
    kmsKeyId?: string;
}

// Drift Detection
export interface DriftReport {
    provider: string;
    accountId?: string;
    region?: string;
    detectionTime: Date;
    driftItems: DriftItem[];
    summary: {
        total: number;
        new: number;
        modified: number;
        deleted: number;
    };
}

export interface DriftItem {
    resourceType: string;
    resourceId: string;
    resourceArn?: string;
    driftType: 'new' | 'modified' | 'deleted';
    previousState?: any;
    currentState?: any;
    configurationDrift: boolean;
    complianceDrift: boolean;
    detectedAt: Date;
}

// Real-time Monitoring
export interface MonitoringEvent {
    eventId: string;
    eventType: 'compliance_violation' | 'configuration_change' | 'new_resource' | 'resource_deleted';
    provider: string;
    resourceType: string;
    resourceId: string;
    resourceArn?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    timestamp: Date;
    region?: string;
    accountId?: string;
    relatedControl?: string;
}

export interface MonitoringOptions {
    enabled: boolean;
    checkInterval: number;      // minutes
    notificationLevel: 'high' | 'medium' | 'low' | 'all';
    enableWebhooks: boolean;
    webhookUrl?: string;
}
