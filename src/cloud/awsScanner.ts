/**
 * AWS Cloud Infrastructure Scanner
 * FedRAMP Compliance Scanner v2.7.0 - AWS Integration
 */

import {
    IAMClient, ListUsersCommand, ListRolesCommand, ListPoliciesCommand,
    GetPolicyCommand, ListMFADevicesCommand, ListAccessKeysCommand,
    GetAccessKeyLastUsedCommand, GetPolicyVersionCommand
} from '@aws-sdk/client-iam';
import {
    EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand,
    DescribeVpcsCommand, DescribeNetworkAclsCommand, DescribeVolumesCommand
} from '@aws-sdk/client-ec2';
import {
    S3Client, ListBucketsCommand, GetBucketLocationCommand, GetBucketPolicyCommand,
    GetBucketEncryptionCommand, GetBucketVersioningCommand, GetBucketAclCommand,
    GetPublicAccessBlockCommand
} from '@aws-sdk/client-s3';
import {
    RDSClient, DescribeDBInstancesCommand, DescribeDBClustersCommand,
    DescribeDBSnapshotsCommand, DescribeDBClusterSnapshotsCommand
} from '@aws-sdk/client-rds';
import {
    CloudTrailClient, DescribeTrailsCommand, GetTrailStatusCommand,
    GetEventSelectorsCommand
} from '@aws-sdk/client-cloudtrail';
import { fromIni, fromEnv, fromInstanceMetadata } from '@aws-sdk/credential-providers';
import Bottleneck from 'bottleneck';
import NodeCache from 'node-cache';
import * as vscode from 'vscode';

import {
    CloudScanner, CloudCredentials, AWSCredentials, CloudComplianceReport,
    ComplianceIssue, IAMComplianceIssue, EC2ComplianceIssue, S3ComplianceIssue,
    RDSComplianceIssue, CloudTrailComplianceIssue, ConnectionStatus,
    CloudScannerOptions, ControlCoverage
} from '../types/cloudTypes';

export class AWSCloudScanner implements CloudScanner {
    private iamClient?: IAMClient;
    private ec2Client?: EC2Client;
    private s3Client?: S3Client;
    private rdsClient?: RDSClient;
    private cloudTrailClient?: CloudTrailClient;
    
    private connected = false;
    private credentials?: AWSCredentials;
    private accountId?: string;
    private rateLimiter: Bottleneck;
    private cache: NodeCache;
    
    constructor() {
        // Rate limiter to prevent AWS API throttling
        this.rateLimiter = new Bottleneck({
            minTime: 100,      // 100ms between requests
            maxConcurrent: 10, // Max 10 concurrent requests
        });
        
        // Cache with 5-minute TTL
        this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
    }

    async connect(credentials: CloudCredentials): Promise<boolean> {
        if (credentials.provider !== 'aws') {
            throw new Error('Invalid provider. Expected "aws".');
        }

        const awsCreds = credentials as AWSCredentials;
        this.credentials = awsCreds;

        try {
            // Create credential provider based on available credentials
            let credProvider;
            if (awsCreds.accessKeyId && awsCreds.secretAccessKey) {
                credProvider = {
                    accessKeyId: awsCreds.accessKeyId,
                    secretAccessKey: awsCreds.secretAccessKey,
                    sessionToken: awsCreds.sessionToken
                };
            } else if (awsCreds.profile) {
                credProvider = fromIni({ profile: awsCreds.profile });
            } else {
                // Try environment variables or instance metadata
                credProvider = fromEnv();
            }

            // Initialize AWS clients
            const clientConfig = {
                region: awsCreds.region,
                credentials: credProvider
            };

            this.iamClient = new IAMClient(clientConfig);
            this.ec2Client = new EC2Client(clientConfig);
            this.s3Client = new S3Client(clientConfig);
            this.rdsClient = new RDSClient(clientConfig);
            this.cloudTrailClient = new CloudTrailClient(clientConfig);

            // Test connection by getting account ID
            await this.validateCredentials();
            this.connected = true;

            vscode.window.showInformationMessage(
                `🌟 Successfully connected to AWS account ${this.accountId} in region ${awsCreds.region}`
            );

            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Failed to connect to AWS: ${error}`);
            this.connected = false;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        this.credentials = undefined;
        this.accountId = undefined;
        this.iamClient = undefined;
        this.ec2Client = undefined;
        this.s3Client = undefined;
        this.rdsClient = undefined;
        this.cloudTrailClient = undefined;
        this.cache.flushAll();
        
        vscode.window.showInformationMessage('🔌 Disconnected from AWS');
    }

    isConnected(): boolean {
        return this.connected;
    }

    async validateCredentials(): Promise<boolean> {
        if (!this.iamClient) {
            return false;
        }

        try {
            // Get account ID by making a simple IAM call
            const response = await this.rateLimiter.schedule(() => 
                this.iamClient!.send(new ListUsersCommand({ MaxItems: 1 }))
            );
            
            if (response.Users && response.Users.length >= 0) {
                // Extract account ID from user ARN if available
                if (response.Users.length > 0 && response.Users[0].Arn) {
                    this.accountId = response.Users[0].Arn.split(':')[4];
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('AWS credential validation failed:', error);
            return false;
        }
    }

    async getResourceCount(): Promise<number> {
        if (!this.isConnected()) {
            return 0;
        }

        const cacheKey = 'resource-count';
        const cached = this.cache.get<number>(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            let totalResources = 0;

            // Count IAM resources
            const iamUsers = await this.rateLimiter.schedule(() =>
                this.iamClient!.send(new ListUsersCommand({}))
            );
            totalResources += iamUsers.Users?.length || 0;

            const iamRoles = await this.rateLimiter.schedule(() =>
                this.iamClient!.send(new ListRolesCommand({}))
            );
            totalResources += iamRoles.Roles?.length || 0;

            // Count EC2 instances
            const ec2Instances = await this.rateLimiter.schedule(() =>
                this.ec2Client!.send(new DescribeInstancesCommand({}))
            );
            totalResources += ec2Instances.Reservations?.reduce((count: number, reservation: any) => 
                count + (reservation.Instances?.length || 0), 0) || 0;

            // Count S3 buckets
            const s3Buckets = await this.rateLimiter.schedule(() =>
                this.s3Client!.send(new ListBucketsCommand({}))
            );
            totalResources += s3Buckets.Buckets?.length || 0;

            this.cache.set(cacheKey, totalResources, 300); // Cache for 5 minutes
            return totalResources;
        } catch (error) {
            console.error('Failed to get resource count:', error);
            return 0;
        }
    }

    getConnectionStatus(): ConnectionStatus {
        return {
            connected: this.connected,
            provider: 'aws',
            region: this.credentials?.region,
            accountId: this.accountId,
            lastConnected: this.connected ? new Date() : undefined
        };
    }

    async scanInfrastructure(options?: CloudScannerOptions): Promise<CloudComplianceReport> {
        if (!this.isConnected()) {
            throw new Error('Not connected to AWS. Please connect first.');
        }

        const scanStartTime = new Date();
        const allIssues: ComplianceIssue[] = [];

        vscode.window.showInformationMessage('🔍 Starting AWS infrastructure compliance scan...');

        try {
            // Run all scans concurrently for better performance
            const [
                iamIssues,
                ec2Issues,
                s3Issues,
                rdsIssues,
                cloudTrailIssues
            ] = await Promise.all([
                this.scanIAMCompliance(),
                this.scanEC2Compliance(),
                this.scanS3Compliance(),
                this.scanRDSCompliance(),
                this.scanCloudTrailCompliance()
            ]);

            allIssues.push(...iamIssues, ...ec2Issues, ...s3Issues, ...rdsIssues, ...cloudTrailIssues);

            const totalResources = await this.getResourceCount();
            const compliantResources = Math.max(0, totalResources - allIssues.length);
            const complianceScore = totalResources > 0 ? Math.round((compliantResources / totalResources) * 100) : 100;

            const report: CloudComplianceReport = {
                provider: 'aws',
                accountId: this.accountId,
                region: this.credentials?.region,
                scanStartTime,
                scanEndTime: new Date(),
                totalResources,
                compliantResources,
                nonCompliantResources: allIssues.length,
                complianceScore,
                issues: allIssues,
                summary: {
                    critical: allIssues.filter(i => i.severity === 'CRITICAL').length,
                    high: allIssues.filter(i => i.severity === 'HIGH').length,
                    medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
                    low: allIssues.filter(i => i.severity === 'LOW').length
                },
                controlCoverage: this.generateControlCoverage(allIssues)
            };

            vscode.window.showInformationMessage(
                `✅ AWS scan complete! Found ${allIssues.length} compliance issues. Compliance Score: ${complianceScore}%`
            );

            return report;
        } catch (error) {
            vscode.window.showErrorMessage(`❌ AWS infrastructure scan failed: ${error}`);
            throw error;
        }
    }

    private async scanIAMCompliance(): Promise<IAMComplianceIssue[]> {
        const issues: IAMComplianceIssue[] = [];

        try {
            // Scan IAM users
            const usersResponse = await this.rateLimiter.schedule(() =>
                this.iamClient!.send(new ListUsersCommand({}))
            );

            for (const user of usersResponse.Users || []) {
                // Check MFA status
                const mfaDevices = await this.rateLimiter.schedule(() =>
                    this.iamClient!.send(new ListMFADevicesCommand({ UserName: user.UserName }))
                );

                if (mfaDevices.MFADevices?.length === 0) {
                    issues.push({
                        id: `iam-user-no-mfa-${user.UserName}`,
                        control: 'AC-2',
                        severity: 'HIGH',
                        resource: user.UserName!,
                        resourceArn: user.Arn,
                        resourceType: 'IAMUser',
                        description: `IAM user '${user.UserName}' does not have MFA enabled`,
                        remediation: 'Enable MFA for this IAM user to enhance account security',
                        riskScore: 85,
                        userName: user.UserName,
                        mfaEnabled: false,
                        lastChecked: new Date()
                    });
                }

                // Check access key age
                const accessKeys = await this.rateLimiter.schedule(() =>
                    this.iamClient!.send(new ListAccessKeysCommand({ UserName: user.UserName }))
                );

                for (const accessKey of accessKeys.AccessKeyMetadata || []) {
                    const keyAge = Date.now() - (accessKey.CreateDate?.getTime() || 0);
                    const keyAgeInDays = keyAge / (1000 * 60 * 60 * 24);

                    if (keyAgeInDays > 90) {
                        issues.push({
                            id: `iam-access-key-old-${accessKey.AccessKeyId}`,
                            control: 'AC-2',
                            severity: 'MEDIUM',
                            resource: `${user.UserName}-${accessKey.AccessKeyId}`,
                            resourceArn: user.Arn,
                            resourceType: 'IAMUser',
                            description: `Access key for user '${user.UserName}' is ${Math.round(keyAgeInDays)} days old`,
                            remediation: 'Rotate access keys regularly (recommended: every 90 days)',
                            riskScore: 60,
                            userName: user.UserName,
                            accessKeyAge: keyAgeInDays,
                            lastChecked: new Date()
                        });
                    }
                }
            }

            // Scan for overly permissive policies
            const policiesResponse = await this.rateLimiter.schedule(() =>
                this.iamClient!.send(new ListPoliciesCommand({ Scope: 'Local' }))
            );

            for (const policy of policiesResponse.Policies || []) {
                if (policy.PolicyName && policy.Arn) {
                    const hasWildcardPermissions = await this.checkPolicyForWildcards(policy.Arn);
                    
                    if (hasWildcardPermissions) {
                        issues.push({
                            id: `iam-policy-wildcard-${policy.PolicyName}`,
                            control: 'AC-3',
                            severity: 'MEDIUM',
                            resource: policy.PolicyName,
                            resourceArn: policy.Arn,
                            resourceType: 'IAMPolicy',
                            description: `Policy '${policy.PolicyName}' contains overly broad wildcard permissions`,
                            remediation: 'Apply principle of least privilege by restricting policy permissions',
                            riskScore: 70,
                            policyName: policy.PolicyName,
                            lastChecked: new Date()
                        });
                    }
                }
            }

        } catch (error) {
            console.error('IAM compliance scan failed:', error);
        }

        return issues;
    }

    private async checkPolicyForWildcards(policyArn: string): Promise<boolean> {
        try {
            const policyResponse = await this.rateLimiter.schedule(() =>
                this.iamClient!.send(new GetPolicyCommand({ PolicyArn: policyArn }))
            );

            if (policyResponse.Policy?.DefaultVersionId) {
                const versionResponse = await this.rateLimiter.schedule(() =>
                    this.iamClient!.send(new GetPolicyVersionCommand({
                        PolicyArn: policyArn,
                        VersionId: policyResponse.Policy!.DefaultVersionId
                    }))
                );

                if (versionResponse.PolicyVersion?.Document) {
                    const policyDoc = JSON.parse(decodeURIComponent(versionResponse.PolicyVersion.Document));
                    
                    // Check for wildcard actions or resources
                    const statements = Array.isArray(policyDoc.Statement) ? policyDoc.Statement : [policyDoc.Statement];
                    
                    for (const statement of statements) {
                        if (statement.Effect === 'Allow') {
                            const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
                            const resources = Array.isArray(statement.Resource) ? statement.Resource : [statement.Resource];
                            
                            if (actions.includes('*') || resources.includes('*')) {
                                return true;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check policy for wildcards:', error);
        }
        
        return false;
    }

    private async scanEC2Compliance(): Promise<EC2ComplianceIssue[]> {
        const issues: EC2ComplianceIssue[] = [];

        try {
            // Scan EC2 instances
            const instancesResponse = await this.rateLimiter.schedule(() =>
                this.ec2Client!.send(new DescribeInstancesCommand({}))
            );

            for (const reservation of instancesResponse.Reservations || []) {
                for (const instance of reservation.Instances || []) {
                    // Check for public instances
                    if (instance.PublicIpAddress) {
                        issues.push({
                            id: `ec2-public-instance-${instance.InstanceId}`,
                            control: 'SC-7',
                            severity: 'HIGH',
                            resource: instance.InstanceId!,
                            resourceType: 'EC2Instance',
                            description: `EC2 instance '${instance.InstanceId}' has a public IP address`,
                            remediation: 'Use private subnets and NAT gateways for instances that do not need direct internet access',
                            riskScore: 80,
                            instanceId: instance.InstanceId,
                            publicIp: instance.PublicIpAddress,
                            lastChecked: new Date()
                        });
                    }

                    // Check encryption of EBS volumes
                    if (instance.BlockDeviceMappings) {
                        for (const blockDevice of instance.BlockDeviceMappings) {
                            if (blockDevice.Ebs?.VolumeId) {
                                const volumeResponse = await this.rateLimiter.schedule(() =>
                                    this.ec2Client!.send(new DescribeVolumesCommand({
                                        VolumeIds: [blockDevice.Ebs!.VolumeId!]
                                    }))
                                );

                                const volume = volumeResponse.Volumes?.[0];
                                if (volume && !volume.Encrypted) {
                                    issues.push({
                                        id: `ec2-unencrypted-volume-${volume.VolumeId}`,
                                        control: 'SC-13',
                                        severity: 'HIGH',
                                        resource: `${instance.InstanceId}-${volume.VolumeId}`,
                                        resourceType: 'EC2Instance',
                                        description: `EBS volume '${volume.VolumeId}' attached to instance '${instance.InstanceId}' is not encrypted`,
                                        remediation: 'Enable EBS encryption for all volumes to protect data at rest',
                                        riskScore: 85,
                                        instanceId: instance.InstanceId,
                                        encryptionEnabled: false,
                                        lastChecked: new Date()
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // Scan Security Groups
            const securityGroupsResponse = await this.rateLimiter.schedule(() =>
                this.ec2Client!.send(new DescribeSecurityGroupsCommand({}))
            );

            for (const sg of securityGroupsResponse.SecurityGroups || []) {
                // Check for overly permissive inbound rules
                for (const rule of sg.IpPermissions || []) {
                    for (const ipRange of rule.IpRanges || []) {
                        if (ipRange.CidrIp === '0.0.0.0/0' && rule.FromPort !== undefined) {
                            const severity = (rule.FromPort === 22 || rule.FromPort === 3389) ? 'CRITICAL' : 'HIGH';
                            
                            issues.push({
                                id: `sg-open-${sg.GroupId}-${rule.FromPort}`,
                                control: 'SC-7',
                                severity,
                                resource: sg.GroupId!,
                                resourceType: 'SecurityGroup',
                                description: `Security Group '${sg.GroupName}' allows inbound traffic from 0.0.0.0/0 on port ${rule.FromPort}`,
                                remediation: 'Restrict security group rules to specific IP ranges or other security groups',
                                riskScore: severity === 'CRITICAL' ? 95 : 85,
                                securityGroupId: sg.GroupId,
                                ports: [rule.FromPort],
                                lastChecked: new Date()
                            });
                        }
                    }
                }
            }

        } catch (error) {
            console.error('EC2 compliance scan failed:', error);
        }

        return issues;
    }

    private async scanS3Compliance(): Promise<S3ComplianceIssue[]> {
        const issues: S3ComplianceIssue[] = [];

        try {
            // Get all S3 buckets
            const bucketsResponse = await this.rateLimiter.schedule(() =>
                this.s3Client!.send(new ListBucketsCommand({}))
            );

            for (const bucket of bucketsResponse.Buckets || []) {
                if (!bucket.Name) {
                    continue;
                }

                try {
                    // Check public access settings
                    const publicAccessBlock = await this.rateLimiter.schedule(() =>
                        this.s3Client!.send(new GetPublicAccessBlockCommand({ Bucket: bucket.Name! }))
                    );

                    const config = publicAccessBlock.PublicAccessBlockConfiguration;
                    if (!config?.BlockPublicAcls || !config?.BlockPublicPolicy || 
                        !config?.IgnorePublicAcls || !config?.RestrictPublicBuckets) {
                        
                        issues.push({
                            id: `s3-public-access-${bucket.Name}`,
                            control: 'AC-3',
                            severity: 'HIGH',
                            resource: bucket.Name,
                            resourceType: 'S3Bucket',
                            description: `S3 bucket '${bucket.Name}' does not have all public access blocks enabled`,
                            remediation: 'Enable all public access block settings unless public access is specifically required',
                            riskScore: 80,
                            bucketName: bucket.Name,
                            publicRead: !config?.BlockPublicAcls,
                            publicWrite: !config?.BlockPublicPolicy,
                            lastChecked: new Date()
                        });
                    }

                    // Check encryption
                    try {
                        await this.rateLimiter.schedule(() =>
                            this.s3Client!.send(new GetBucketEncryptionCommand({ Bucket: bucket.Name! }))
                        );
                    } catch (encryptionError: any) {
                        if (encryptionError.name === 'ServerSideEncryptionConfigurationNotFoundError') {
                            issues.push({
                                id: `s3-no-encryption-${bucket.Name}`,
                                control: 'SC-13',
                                severity: 'HIGH',
                                resource: bucket.Name,
                                resourceType: 'S3Bucket',
                                description: `S3 bucket '${bucket.Name}' does not have default encryption enabled`,
                                remediation: 'Enable default server-side encryption for the S3 bucket',
                                riskScore: 85,
                                bucketName: bucket.Name,
                                encryptionEnabled: false,
                                lastChecked: new Date()
                            });
                        }
                    }

                    // Check versioning
                    const versioning = await this.rateLimiter.schedule(() =>
                        this.s3Client!.send(new GetBucketVersioningCommand({ Bucket: bucket.Name! }))
                    );

                    if (versioning.Status !== 'Enabled') {
                        issues.push({
                            id: `s3-no-versioning-${bucket.Name}`,
                            control: 'CP-9',
                            severity: 'MEDIUM',
                            resource: bucket.Name,
                            resourceType: 'S3Bucket',
                            description: `S3 bucket '${bucket.Name}' does not have versioning enabled`,
                            remediation: 'Enable versioning to protect against accidental deletion or modification',
                            riskScore: 60,
                            bucketName: bucket.Name,
                            versioning: false,
                            lastChecked: new Date()
                        });
                    }

                } catch (error) {
                    console.error(`Failed to scan bucket ${bucket.Name}:`, error);
                }
            }

        } catch (error) {
            console.error('S3 compliance scan failed:', error);
        }

        return issues;
    }

    private async scanRDSCompliance(): Promise<RDSComplianceIssue[]> {
        const issues: RDSComplianceIssue[] = [];

        try {
            // Scan RDS instances
            const instancesResponse = await this.rateLimiter.schedule(() =>
                this.rdsClient!.send(new DescribeDBInstancesCommand({}))
            );

            for (const instance of instancesResponse.DBInstances || []) {
                if (!instance.DBInstanceIdentifier) {
                    continue;
                }

                // Check encryption at rest
                if (!instance.StorageEncrypted) {
                    issues.push({
                        id: `rds-no-encryption-${instance.DBInstanceIdentifier}`,
                        control: 'SC-13',
                        severity: 'HIGH',
                        resource: instance.DBInstanceIdentifier,
                        resourceArn: instance.DBInstanceArn,
                        resourceType: 'RDSInstance',
                        description: `RDS instance '${instance.DBInstanceIdentifier}' does not have encryption at rest enabled`,
                        remediation: 'Enable encryption at rest for RDS instances containing sensitive data',
                        riskScore: 85,
                        instanceId: instance.DBInstanceIdentifier,
                        encryptionAtRest: false,
                        lastChecked: new Date()
                    });
                }

                // Check public accessibility
                if (instance.PubliclyAccessible) {
                    issues.push({
                        id: `rds-publicly-accessible-${instance.DBInstanceIdentifier}`,
                        control: 'SC-7',
                        severity: 'CRITICAL',
                        resource: instance.DBInstanceIdentifier,
                        resourceArn: instance.DBInstanceArn,
                        resourceType: 'RDSInstance',
                        description: `RDS instance '${instance.DBInstanceIdentifier}' is publicly accessible`,
                        remediation: 'Configure RDS instances to be accessible only from private subnets',
                        riskScore: 95,
                        instanceId: instance.DBInstanceIdentifier,
                        publiclyAccessible: true,
                        lastChecked: new Date()
                    });
                }

                // Check backup retention
                if ((instance.BackupRetentionPeriod || 0) < 7) {
                    issues.push({
                        id: `rds-short-backup-retention-${instance.DBInstanceIdentifier}`,
                        control: 'CP-9',
                        severity: 'MEDIUM',
                        resource: instance.DBInstanceIdentifier,
                        resourceArn: instance.DBInstanceArn,
                        resourceType: 'RDSInstance',
                        description: `RDS instance '${instance.DBInstanceIdentifier}' has backup retention period of ${instance.BackupRetentionPeriod} days (recommended: 7+ days)`,
                        remediation: 'Set backup retention period to at least 7 days for proper disaster recovery',
                        riskScore: 60,
                        instanceId: instance.DBInstanceIdentifier,
                        backupRetention: instance.BackupRetentionPeriod,
                        lastChecked: new Date()
                    });
                }

                // Check Multi-AZ
                if (!instance.MultiAZ) {
                    issues.push({
                        id: `rds-no-multiaz-${instance.DBInstanceIdentifier}`,
                        control: 'CP-9',
                        severity: 'LOW',
                        resource: instance.DBInstanceIdentifier,
                        resourceArn: instance.DBInstanceArn,
                        resourceType: 'RDSInstance',
                        description: `RDS instance '${instance.DBInstanceIdentifier}' is not configured for Multi-AZ deployment`,
                        remediation: 'Enable Multi-AZ deployment for high availability and automatic failover',
                        riskScore: 40,
                        instanceId: instance.DBInstanceIdentifier,
                        multiAz: false,
                        lastChecked: new Date()
                    });
                }
            }

        } catch (error) {
            console.error('RDS compliance scan failed:', error);
        }

        return issues;
    }

    private async scanCloudTrailCompliance(): Promise<CloudTrailComplianceIssue[]> {
        const issues: CloudTrailComplianceIssue[] = [];

        try {
            // Get all CloudTrail trails
            const trailsResponse = await this.rateLimiter.schedule(() =>
                this.cloudTrailClient!.send(new DescribeTrailsCommand({}))
            );

            if (!trailsResponse.trailList || trailsResponse.trailList.length === 0) {
                issues.push({
                    id: 'cloudtrail-no-trails',
                    control: 'AU-2',
                    severity: 'CRITICAL',
                    resource: 'CloudTrail',
                    resourceType: 'CloudTrail',
                    description: 'No CloudTrail trails are configured',
                    remediation: 'Create at least one CloudTrail trail to enable audit logging',
                    riskScore: 95,
                    lastChecked: new Date()
                });
            } else {
                for (const trail of trailsResponse.trailList) {
                    if (!trail.Name) {
                        continue;
                    }

                    // Check if trail is logging
                    const statusResponse = await this.rateLimiter.schedule(() =>
                        this.cloudTrailClient!.send(new GetTrailStatusCommand({ Name: trail.Name! }))
                    );

                    if (!statusResponse.IsLogging) {
                        issues.push({
                            id: `cloudtrail-not-logging-${trail.Name}`,
                            control: 'AU-2',
                            severity: 'HIGH',
                            resource: trail.Name,
                            resourceArn: trail.TrailARN,
                            resourceType: 'CloudTrail',
                            description: `CloudTrail '${trail.Name}' is not currently logging`,
                            remediation: 'Enable logging for CloudTrail to maintain audit records',
                            riskScore: 85,
                            trailName: trail.Name,
                            isLogging: false,
                            lastChecked: new Date()
                        });
                    }

                    // Check if it's multi-region
                    if (!trail.IsMultiRegionTrail) {
                        issues.push({
                            id: `cloudtrail-single-region-${trail.Name}`,
                            control: 'AU-2',
                            severity: 'MEDIUM',
                            resource: trail.Name,
                            resourceArn: trail.TrailARN,
                            resourceType: 'CloudTrail',
                            description: `CloudTrail '${trail.Name}' is not configured for multi-region logging`,
                            remediation: 'Enable multi-region logging to capture events from all regions',
                            riskScore: 60,
                            trailName: trail.Name,
                            isMultiRegion: false,
                            lastChecked: new Date()
                        });
                    }

                    // Check log file validation
                    if (!trail.LogFileValidationEnabled) {
                        issues.push({
                            id: `cloudtrail-no-validation-${trail.Name}`,
                            control: 'AU-9',
                            severity: 'MEDIUM',
                            resource: trail.Name,
                            resourceArn: trail.TrailARN,
                            resourceType: 'CloudTrail',
                            description: `CloudTrail '${trail.Name}' does not have log file validation enabled`,
                            remediation: 'Enable log file validation to ensure log integrity',
                            riskScore: 55,
                            trailName: trail.Name,
                            logFileValidation: false,
                            lastChecked: new Date()
                        });
                    }
                }
            }

        } catch (error) {
            console.error('CloudTrail compliance scan failed:', error);
        }

        return issues;
    }

    private generateControlCoverage(issues: ComplianceIssue[]): ControlCoverage[] {
        const controls = new Map<string, ControlCoverage>();
        
        // Initialize common FedRAMP controls
        const commonControls = [
            { id: 'AC-2', name: 'Account Management' },
            { id: 'AC-3', name: 'Access Enforcement' },
            { id: 'AC-6', name: 'Least Privilege' },
            { id: 'AU-2', name: 'Audit Events' },
            { id: 'AU-9', name: 'Protection of Audit Information' },
            { id: 'CP-9', name: 'Information System Backup' },
            { id: 'SC-7', name: 'Boundary Protection' },
            { id: 'SC-8', name: 'Transmission Confidentiality and Integrity' },
            { id: 'SC-13', name: 'Cryptographic Protection' }
        ];

        for (const control of commonControls) {
            controls.set(control.id, {
                controlId: control.id,
                controlName: control.name,
                status: 'compliant',
                resourcesChecked: 0,
                issuesFound: 0,
                lastAssessed: new Date()
            });
        }

        // Update controls based on issues found
        for (const issue of issues) {
            const existing = controls.get(issue.control);
            if (existing) {
                existing.issuesFound++;
                existing.resourcesChecked++;
                existing.status = 'non-compliant';
            }
        }

        return Array.from(controls.values());
    }
}
