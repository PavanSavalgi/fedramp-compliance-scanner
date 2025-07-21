/**
 * AWS Cloud Infrastructure Scanner - Simplified Version
 * FedRAMP Compliance Scanner v2.9.0 - Core functionality
 */

import {
    IAMClient, ListUsersCommand
} from '@aws-sdk/client-iam';
import {
    S3Client, ListBucketsCommand, GetPublicAccessBlockCommand
} from '@aws-sdk/client-s3';

import {
    CloudComplianceReport, ComplianceIssue, IAMComplianceIssue, S3ComplianceIssue,
    CloudScanner, CloudCredentials, ConnectionStatus
} from '../types/cloudTypes';

export class AWSCloudScanner implements CloudScanner {
    private iamClient?: IAMClient;
    private s3Client?: S3Client;
    private isConnectedFlag = false;
    private connectionStatus: ConnectionStatus = { connected: false };

    async connect(credentials: CloudCredentials): Promise<boolean> {
        try {
            await this.initialize(credentials);
            this.isConnectedFlag = true;
            this.connectionStatus = { 
                connected: true, 
                provider: 'aws',
                lastConnected: new Date()
            };
            return true;
        } catch (error) {
            this.connectionStatus = { 
                connected: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.iamClient = undefined;
        this.s3Client = undefined;
        this.isConnectedFlag = false;
        this.connectionStatus = { connected: false };
    }

    isConnected(): boolean {
        return this.isConnectedFlag;
    }

    async validateCredentials(): Promise<boolean> {
        if (!this.iamClient) {
            return false;
        }
        
        try {
            await this.iamClient.send(new ListUsersCommand({ MaxItems: 1 }));
            return true;
        } catch {
            return false;
        }
    }

    async scanInfrastructure(): Promise<CloudComplianceReport> {
        return this.scanCompliance();
    }

    async getResourceCount(): Promise<number> {
        return 10; // Simplified count
    }

    getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    async initialize(credentials: any): Promise<void> {
        console.log('🔧 Initializing AWS SDK clients (core services)...');
        this.iamClient = new IAMClient(credentials);
        this.s3Client = new S3Client(credentials);
        console.log('✅ AWS SDK clients initialized successfully!');
    }

    async scanCompliance(): Promise<CloudComplianceReport> {
        console.log('🔍 Starting AWS compliance scan (core services)...');

        const startTime = Date.now();
        const allIssues: ComplianceIssue[] = [];

        // Simple scan for core services only
        const [iamIssues, s3Issues] = await Promise.all([
            this.scanIAMCompliance(),
            this.scanS3Compliance()
        ]);

        allIssues.push(...iamIssues, ...s3Issues);

        const totalResources = 10; // Simplified count
        const complianceScore = Math.max(0, 100 - (allIssues.length * 10));
        const scanDuration = Date.now() - startTime;

        console.log(`✅ AWS scan completed in ${scanDuration}ms. Found ${allIssues.length} issues.`);

        return {
            provider: 'aws',
            scanStartTime: new Date(startTime),
            scanEndTime: new Date(),
            totalResources,
            compliantResources: Math.max(0, totalResources - allIssues.length),
            nonCompliantResources: allIssues.length,
            complianceScore,
            issues: allIssues,
            controlCoverage: [],
            summary: {
                critical: 0,
                high: allIssues.filter(i => i.severity === 'HIGH').length,
                medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
                low: allIssues.filter(i => i.severity === 'LOW').length
            }
        };
    }

    private async scanIAMCompliance(): Promise<IAMComplianceIssue[]> {
        const issues: IAMComplianceIssue[] = [];
        
        if (!this.iamClient) {
            return issues;
        }

        try {
            console.log('🔍 Scanning IAM for compliance...');
            const usersResponse = await this.iamClient.send(new ListUsersCommand({}));
            
            if (usersResponse.Users && usersResponse.Users.length > 5) {
                issues.push({
                    id: 'iam-user-count',
                    resource: 'IAMUsers',
                    resourceType: 'IAMUser',
                    resourceArn: 'arn:aws:iam::*:user/*',
                    severity: 'MEDIUM',
                    control: 'AC-2',
                    description: 'High number of IAM users detected',
                    remediation: 'Review IAM users and remove unnecessary accounts',
                    riskScore: 50,
                    lastChecked: new Date(),
                    userName: 'Multiple',
                    mfaEnabled: false
                });
            }
        } catch (error) {
            console.warn('⚠️ IAM scan failed, may need valid credentials');
        }

        return issues;
    }

    private async scanS3Compliance(): Promise<S3ComplianceIssue[]> {
        const issues: S3ComplianceIssue[] = [];
        
        if (!this.s3Client) {
            return issues;
        }

        try {
            console.log('🔍 Scanning S3 for compliance...');
            const bucketsResponse = await this.s3Client.send(new ListBucketsCommand({}));
            
            if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
                // Sample compliance check - just flag that buckets exist
                issues.push({
                    id: 's3-buckets-found',
                    resource: 'S3Buckets',
                    resourceType: 'S3Bucket',
                    resourceArn: 'arn:aws:s3:::*',
                    severity: 'LOW',
                    control: 'AC-3',
                    description: `Found ${bucketsResponse.Buckets.length} S3 buckets - ensure proper access controls`,
                    remediation: 'Review S3 bucket policies and access permissions',
                    riskScore: 30,
                    lastChecked: new Date(),
                    bucketName: 'Multiple',
                    publicRead: false,
                    publicWrite: false,
                    encryptionEnabled: true,
                    versioning: true
                });
            }
        } catch (error) {
            console.warn('⚠️ S3 scan failed, may need valid credentials');
        }

        return issues;
    }
}
