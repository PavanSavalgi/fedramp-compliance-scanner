#!/usr/bin/env node

/**
 * Quick test for FedRAMP Cost Analysis functionality
 * This demonstrates how the cost analysis commands work
 */

console.log('🏗️  FEDRAMP COST ANALYSIS DEMO');
console.log('='.repeat(50));

// Simulate what the VS Code command does
const sampleInfrastructure = {
    ec2Instances: [
        { type: 't3.medium', count: 2, storage: '20GB' },
        { type: 't3.large', count: 1, storage: '50GB' }
    ],
    rdsInstances: [
        { type: 'db.t3.medium', engine: 'mysql', storage: '100GB' }
    ],
    s3Buckets: [
        { name: 'app-data', estimatedSize: '500GB' },
        { name: 'compliance-logs', estimatedSize: '100GB' }
    ],
    networking: {
        albCount: 1,
        natGatewayCount: 1,
        elasticIPs: 2
    }
};

console.log('📋 INFRASTRUCTURE TO ANALYZE:');
console.log(JSON.stringify(sampleInfrastructure, null, 2));

// AWS Cost Estimates (monthly)
const costEstimates = {
    'EC2 t3.medium': 31.68,
    'EC2 t3.large': 63.36,
    'RDS db.t3.medium': 48.38,
    'S3 Standard': 0.023, // per GB
    'ALB': 16.43,
    'NAT Gateway': 45.00,
    'Elastic IP': 3.65
};

console.log('\n💰 ESTIMATED MONTHLY COSTS:');

// Calculate costs
let totalInfraCost = 0;

// EC2 Costs
sampleInfrastructure.ec2Instances.forEach(instance => {
    const cost = costEstimates[`EC2 ${instance.type}`] * instance.count;
    totalInfraCost += cost;
    console.log(`   ${instance.type} x${instance.count}: $${cost.toFixed(2)}`);
});

// RDS Costs
sampleInfrastructure.rdsInstances.forEach(instance => {
    const cost = costEstimates[`RDS ${instance.type}`];
    totalInfraCost += cost;
    console.log(`   RDS ${instance.type}: $${cost.toFixed(2)}`);
});

// S3 Costs
sampleInfrastructure.s3Buckets.forEach(bucket => {
    const sizeGB = parseInt(bucket.estimatedSize);
    const cost = costEstimates['S3 Standard'] * sizeGB;
    totalInfraCost += cost;
    console.log(`   S3 ${bucket.name} (${bucket.estimatedSize}): $${cost.toFixed(2)}`);
});

// Networking Costs
const albCost = costEstimates['ALB'] * sampleInfrastructure.networking.albCount;
const natCost = costEstimates['NAT Gateway'] * sampleInfrastructure.networking.natGatewayCount;
const eipCost = costEstimates['Elastic IP'] * sampleInfrastructure.networking.elasticIPs;

totalInfraCost += albCost + natCost + eipCost;

console.log(`   Application Load Balancer: $${albCost.toFixed(2)}`);
console.log(`   NAT Gateway: $${natCost.toFixed(2)}`);
console.log(`   Elastic IPs x${sampleInfrastructure.networking.elasticIPs}: $${eipCost.toFixed(2)}`);

console.log('\n' + '='.repeat(50));
console.log(`💵 TOTAL INFRASTRUCTURE COST: $${totalInfraCost.toFixed(2)}/month`);

// FedRAMP Compliance Overhead
const complianceOverhead = {
    'Additional Security Tools': 200,
    'Compliance Monitoring': 150,
    'Enhanced Logging': 100,
    'Security Assessment': 500,
    'Documentation & Audit': 300
};

let totalComplianceCost = 0;
console.log('\n🛡️  FEDRAMP COMPLIANCE OVERHEAD:');
Object.entries(complianceOverhead).forEach(([item, cost]) => {
    totalComplianceCost += cost;
    console.log(`   ${item}: $${cost}/month`);
});

const grandTotal = totalInfraCost + totalComplianceCost;

console.log('\n' + '='.repeat(50));
console.log(`🏗️  Infrastructure: $${totalInfraCost.toFixed(2)}/month`);
console.log(`🛡️  FedRAMP Compliance: $${totalComplianceCost.toFixed(2)}/month`);
console.log(`💰 GRAND TOTAL: $${grandTotal.toFixed(2)}/month`);
console.log(`📅 Annual Cost: $${(grandTotal * 12).toFixed(2)}`);

console.log('\n🎯 TO GENERATE ACTUAL REPORTS:');
console.log('1. Open VS Code Command Palette (Ctrl+Shift+P)');
console.log('2. Type: "Generate Infrastructure Cost Analysis"');
console.log('3. Or: "Generate Comprehensive Analytics Dashboard"');
console.log('4. Or: "Generate Compliance Forecast"');

console.log('\n✨ This demo shows the type of analysis your extension provides!');
