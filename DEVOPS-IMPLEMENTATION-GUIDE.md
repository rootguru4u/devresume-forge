# DevResume-Forge: End-to-End DevOps Implementation Guide

## Complete Architecture Overview

### 1. Overall System Architecture
```
                                                    Internet
                                                        │
                                                        ▼
                                                   Route 53
                                                        │
                                                        ▼
                                                 CloudFront CDN
                                                        │
                                                        ▼
                                                    AWS WAF
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
                    S3 Buckets                                              Application Load Balancer
                         │                                                             │
            ┌────────────┴────────────┐                                    ┌──────────┴──────────┐
            ▼                         ▼                                    ▼                     ▼
    Static Content              Terraform State                      ECS Cluster           EKS Cluster
                                      │                                    │                     │
                                      ▼                             ┌──────┴──────┐      ┌──────┴──────┐
                              DynamoDB Locking                      ▼             ▼      ▼             ▼
                                                             Frontend        Backend   Frontend      Backend
                                                             (Fargate)      (Fargate)  (Pods)       (Pods)
                                                                  │             │         │            │
                                                                  └─────┬───────┘         └────┬───────┘
                                                                        │                      │
                                                                        ▼                      ▼
                                                               Secrets Manager           Secrets Manager
                                                                        │                      │
                                                            ┌───────────┴──────────┐   ┌──────┴───────┐
                                                            ▼                      ▼   ▼              ▼
                                                      Application            Database   KMS         Lambda
                                                       Secrets               Secrets  Encryption    Rotation
                                                            │                      │
                                                            └──────────┬──────────┘
                                                                       │
                                                                       ▼
                                                                 AWS Services
                                                         ┌─────────────┴─────────────┐
                                                         ▼                           ▼
                                                    RDS Aurora                 ElastiCache
                                                    (PostgreSQL)                 (Redis)
                                                         │                           │
                                                         └─────────────┬────────────┘
                                                                       │
                                                                       ▼
                                                              Monitoring Stack
                                                         ┌─────────────┴─────────────┐
                                                         ▼                           ▼
                                                   CloudWatch                   Prometheus
                                                         │                           │
                                                         └─────────────┬────────────┘
                                                                       │
                                                                       ▼
                                                                   Grafana
```

### 2. CI/CD and Infrastructure Flow
```
                                    Developer
                                        │
                                        ▼
                                    Git Push
                                        │
                    ┌──────────────────┴───────────────────┐
                    ▼                                      ▼
            GitHub Actions                          Terraform Cloud
                    │                                      │
        ┌───────────┴───────────┐              ┌──────────┴──────────┐
        ▼                       ▼              ▼                     ▼
    Build & Test          Security Scan    State Management    Infrastructure
        │                       │              │                     │
        └───────────┬───────────┘              └─────────┬─────────┘
                    ▼                                    ▼
              Push to ECR                         AWS Services
                    │                                   │
        ┌───────────┴───────────┐           ┌─────────┴──────────┐
        ▼                       ▼           ▼                    ▼
    ECS Deploy              EKS Deploy   Networking           Security
        │                       │           │                    │
        └───────────┬───────────┘           └─────────┬────────┘
                    │                                 │
                    └─────────────┬─────────────────┘
                                 │
                                 ▼
                         Application Stack
                    ┌────────────┴────────────┐
                    ▼                         ▼
                Frontend                    Backend
                    │                         │
                    └─────────────┬──────────┘
                                 │
                                 ▼
                        Monitoring & Alerts
```

### 3. Environment Segregation
```
                                Production (main)
                                      │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
              EKS Cluster                       RDS Aurora
              (t3.medium)                     (db.t3.medium)
                    │                                 │
                    └────────────────┬───────────────┘
                                    │
                                Staging (stage)
                                    │
                    ┌──────────────┴───────────────┐
                    ▼                              ▼
              ECS Cluster                    RDS Aurora
              (t3.small)                   (db.t3.small)
                    │                              │
                    └──────────────┬──────────────┘
                                  │
                            Development (dev)
                                  │
                    ┌────────────┴────────────┐
                    ▼                         ▼
              ECS Cluster                RDS Aurora
              (t3.micro)               (db.t3.micro)
```

### 4. Security and Secrets Flow
```
                              AWS Secrets Manager
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                Application Secrets           Database Secrets
                        │                           │
            ┌───────────┴───────────┐     ┌────────┴────────┐
            ▼                       ▼     ▼                 ▼
    ECS Task Secrets         EKS Pod Secrets    RDS Secrets  Cache Secrets
            │                       │           │                 │
    ┌───────┴───────┐     ┌───────┴───────┐   │                 │
    ▼               ▼     ▼               ▼   │                 │
Frontend         Backend  Frontend      Backend│                 │
Secrets         Secrets   Secrets       Secrets│                 │
    │               │        │            │    │                 │
    └───────┬───────┘        └────┬──────┘    │                 │
            │                      │           │                 │
            ▼                      ▼           ▼                 ▼
      KMS Encryption         KMS Encryption  Rotation        Rotation
            │                      │        Function        Function
            └──────────────┬───────┘           │                 │
                          ▼                    │                 │
                    CloudWatch                 │                 │
                    Monitoring                 │                 │
                          │                    │                 │
                          └────────────────────┴─────────────────┘
```

## Prerequisites Checklist

### 1. Accounts and Access
- [ ] AWS Account with admin access
- [ ] GitHub account
- [ ] Docker Hub account
- [ ] Domain name (for production)

### 2. Local Development Setup
- [ ] Git installed
- [ ] AWS CLI installed and configured
- [ ] Terraform installed (v1.0.0 or later)
- [ ] Docker installed
- [ ] Node.js installed (for application development)
- [ ] kubectl installed (for EKS)

### 3. Required AWS Services
- [ ] VPC and related networking services
- [ ] ECS/EKS for container orchestration
- [ ] ECR for container registry
- [ ] RDS for database
- [ ] ElastiCache for caching
- [ ] CloudWatch for monitoring
- [ ] Route 53 for DNS (if using custom domain)
- [ ] ACM for SSL certificates

### 4. Required AWS Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "ecs:*",
                "eks:*",
                "rds:*",
                "elasticache:*",
                "s3:*",
                "route53:*",
                "cloudwatch:*",
                "logs:*",
                "iam:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Implementation Steps

### Phase 1: Initial Setup (Day 1)
1. [ ] Clone repository
2. [ ] Set up branch structure
3. [ ] Configure GitHub repository settings
4. [ ] Set up GitHub Actions secrets

### Phase 2: Infrastructure Setup (Days 2-3)
1. [ ] Initialize Terraform
2. [ ] Create VPC and networking
3. [ ] Set up ECS/EKS clusters
4. [ ] Configure databases
5. [ ] Set up monitoring

### Phase 3: CI/CD Pipeline (Days 4-5)
1. [ ] Set up GitHub Actions workflows
2. [ ] Configure Docker builds
3. [ ] Set up deployment pipelines
4. [ ] Configure environment variables

### Phase 4: Application Deployment (Days 6-7)
1. [ ] Deploy to staging environment
2. [ ] Test all components
3. [ ] Deploy to production
4. [ ] Set up monitoring and alerts

## Cost Estimation

### Development Environment
```
Service               Monthly Cost (USD)
----------------------------------
ECS/EKS Cluster         $50-100
RDS (t3.micro)         $15-25
ElastiCache            $15-25
Other Services         $20-30
----------------------------------
Total                  $100-180
```

### Production Environment
```
Service               Monthly Cost (USD)
----------------------------------
ECS/EKS Cluster         $200-300
RDS (t3.medium)         $50-80
ElastiCache            $50-80
Other Services         $70-100
----------------------------------
Total                  $370-560
```

## Quick Start Commands

### 1. Initial Setup
```bash
# Clone and setup repository
git clone https://github.com/yourusername/devresume-forge.git
cd devresume-forge

# Create .gitignore
cat > .gitignore << EOL
.env
.env.*
node_modules/
dist/
build/
*.tfvars
.terraform/
*.tfstate
*.tfstate.*
.DS_Store
coverage/
.vscode/
EOL

# Create main branches
git checkout -b main
git push -u origin main

git checkout -b dev
git push -u origin dev

git checkout -b stage
git push -u origin stage

# Initialize infrastructure
cd infra

# Configure Terraform Cloud backend
cat > backend.tf << EOL
terraform {
  cloud {
    organization = "devresume-org"
    workspaces {
      tags = ["devresume"]
    }
  }
}
EOL

terraform init
terraform workspace new devresume-dev
terraform workspace new devresume-stage
terraform workspace new devresume-prod
```

### 2. Infrastructure Deployment
```bash
# Deploy development infrastructure
terraform workspace select devresume-dev
terraform plan -var-file=environments/dev/terraform.tfvars -out=tfplan
terraform apply tfplan

# Create ECR repositories
aws ecr create-repository \
    --repository-name devresume-frontend \
    --image-scanning-configuration scanOnPush=true

aws ecr create-repository \
    --repository-name devresume-backend \
    --image-scanning-configuration scanOnPush=true

# Deploy staging infrastructure
terraform workspace select devresume-stage
terraform plan -var-file=environments/stage/terraform.tfvars -out=tfplan
terraform apply tfplan

# Deploy production infrastructure
terraform workspace select devresume-prod
terraform plan -var-file=environments/prod/terraform.tfvars -out=tfplan
terraform apply tfplan
```

### 3. Application Deployment
```bash
# Build and push Docker images
cd frontend
docker build -t devresume-frontend:latest -f Dockerfile.dev .
docker tag devresume-frontend:latest ${ECR_REGISTRY}/devresume-frontend:latest

cd ../backend
docker build -t devresume-backend:latest -f Dockerfile.dev .
docker tag devresume-backend:latest ${ECR_REGISTRY}/devresume-backend:latest

# Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Push images
docker push ${ECR_REGISTRY}/devresume-frontend:latest
docker push ${ECR_REGISTRY}/devresume-backend:latest

# Deploy to ECS
aws ecs update-service \
    --cluster ${ENV}-devresume-cluster \
    --service frontend \
    --force-new-deployment

aws ecs update-service \
    --cluster ${ENV}-devresume-cluster \
    --service backend \
    --force-new-deployment

# Create secrets
aws secretsmanager create-secret \
    --name "/${ENV}/devresume/application" \
    --description "Application secrets for ${ENV} environment" \
    --secret-string '{"JWT_SECRET":"your-secure-jwt-secret","API_KEY":"your-api-key"}'

aws secretsmanager create-secret \
    --name "/${ENV}/devresume/database" \
    --description "Database credentials for ${ENV} environment" \
    --secret-string '{"username":"dbadmin","password":"your-secure-password"}'
```

## Environment Variables Reference

### Common Variables
```bash
# Required in all environments
NODE_ENV=<environment>              # development, staging, production
AWS_REGION=us-west-2               # Default region
PROJECT_NAME=devresume             # Project identifier
```

### Frontend Environment Variables
```bash
# .env.development, .env.staging, .env.production
REACT_APP_API_URL=<backend-url>    # e.g., https://api.dev.devresume.com
REACT_APP_ENV=<environment>        # development, staging, production
REACT_APP_GA_ID=<analytics-id>     # Google Analytics ID
```

### Backend Environment Variables
```bash
# .env.development, .env.staging, .env.production
PORT=3000
DB_HOST=<rds-endpoint>             # RDS endpoint from AWS
DB_PORT=5432                       # PostgreSQL default port
DB_NAME=devresume_${ENV}          # e.g., devresume_dev
DB_USER=<from-secrets-manager>     # Fetch from AWS Secrets Manager
DB_PASSWORD=<from-secrets-manager> # Fetch from AWS Secrets Manager
REDIS_HOST=<redis-endpoint>        # ElastiCache endpoint
REDIS_PORT=6379                    # Redis default port
```

### AWS Configuration Variables
```bash
# AWS CLI configuration
AWS_ACCESS_KEY_ID=<access-key>     # From IAM user credentials
AWS_SECRET_ACCESS_KEY=<secret-key> # From IAM user credentials
AWS_DEFAULT_REGION=us-west-2       # Default region

# ECR Registry
ECR_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

### Terraform Variables
```hcl
# Common variables for all environments
project_name    = "devresume"
aws_region      = "us-west-2"
domain_name     = "devresume.com"

# Environment-specific variables
environment     = "<env>"           # dev, stage, prod
vpc_cidr        = "10.0.0.0/16"    # Unique per environment
instance_type   = "t3.micro"       # Varies by environment
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Terraform State Lock**
```bash
# Remove state lock if stuck
aws dynamodb delete-item \
    --table-name devresume-terraform-lock \
    --key '{"LockID": {"S": "devresume-${ENV}/terraform.tfstate-md5"}}'
```

2. **ECS Deployment Issues**
```bash
# Check service events
aws ecs describe-services \
    --cluster devresume-${ENV}-cluster \
    --services devresume-${ENV}-frontend \
    --query 'services[].events'

# Check task status
aws ecs list-tasks \
    --cluster devresume-${ENV}-cluster \
    --service-name devresume-${ENV}-frontend

# View task logs
aws logs get-log-events \
    --log-group-name /aws/ecs/devresume-${ENV} \
    --log-stream-name frontend/$(aws ecs list-tasks \
        --cluster devresume-${ENV}-cluster \
        --service-name devresume-${ENV}-frontend \
        --query 'taskArns[0]' --output text | cut -d '/' -f3)
```

3. **Database Connection Issues**
```bash
# Check RDS status
aws rds describe-db-instances \
    --db-instance-identifier devresume-${ENV}-db \
    --query 'DBInstances[].DBInstanceStatus'

# Test database connection
PGPASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id devresume-${ENV}/database \
    --query 'SecretString' --output text | jq -r '.password') \
psql -h ${DB_HOST} -U ${DB_USER} -d devresume_${ENV} -c "\l"
```

4. **Secrets Manager Issues**
```bash
# Verify secret exists
aws secretsmanager describe-secret \
    --secret-id devresume-${ENV}/application

# Rotate secret manually if needed
aws secretsmanager rotate-secret \
    --secret-id devresume-${ENV}/database

# Check secret rotation status
aws secretsmanager describe-secret \
    --secret-id devresume-${ENV}/database \
    --query 'RotationEnabled'
```

5. **Container Registry Issues**
```bash
# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login \
    --username AWS \
    --password-stdin ${ECR_REGISTRY}

# List images in repository
aws ecr describe-images \
    --repository-name devresume-${ENV}-frontend \
    --query 'imageDetails[*].imageTags[]'

# Clean up untagged images
aws ecr list-images \
    --repository-name devresume-${ENV}-frontend \
    --filter tagStatus=UNTAGGED \
    --query 'imageIds[*]' \
    --output json | jq -r '.[]' | \
aws ecr batch-delete-image \
    --repository-name devresume-${ENV}-frontend \
    --image-ids file:///dev/stdin
```

## Verification Commands

### Infrastructure Verification
```bash
# Verify VPC
aws ec2 describe-vpcs \
    --filters Name=tag:Name,Values=devresume-${ENV}-vpc \
    --query 'Vpcs[].VpcId'

# Check ECS cluster
aws ecs describe-clusters \
    --clusters devresume-${ENV}-cluster \
    --query 'clusters[].status'

# Verify RDS
aws rds describe-db-instances \
    --db-instance-identifier devresume-${ENV}-db \
    --query 'DBInstances[].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}'

# Check ElastiCache
aws elasticache describe-cache-clusters \
    --cache-cluster-id devresume-${ENV}-redis \
    --query 'CacheClusters[].{Status:CacheClusterStatus,Endpoint:CacheNodes[0].Endpoint.Address}'
```

### Application Verification
```bash
# Check frontend service
aws ecs describe-services \
    --cluster devresume-${ENV}-cluster \
    --services devresume-${ENV}-frontend \
    --query 'services[].{Status:status,Running:runningCount,Desired:desiredCount}'

# Verify backend service
aws ecs describe-services \
    --cluster devresume-${ENV}-cluster \
    --services devresume-${ENV}-backend \
    --query 'services[].{Status:status,Running:runningCount,Desired:desiredCount}'

# Test frontend health
curl -I https://${ENV}.devresume.com/health

# Test backend health
curl -I https://api.${ENV}.devresume.com/health
```

### Security Verification
```bash
# Check SSL certificate
aws acm describe-certificate \
    --certificate-arn ${CERTIFICATE_ARN} \
    --query 'Certificate.{Status:Status,Domain:DomainName}'

# Verify secrets
aws secretsmanager list-secrets \
    --filters Key=tag-key,Values=Environment,Key=tag-value,Values=${ENV} \
    --query 'SecretList[].{Name:Name,LastRotated:LastRotatedDate}'

# Check security groups
aws ec2 describe-security-groups \
    --filters Name=tag:Project,Values=devresume Name=tag:Environment,Values=${ENV} \
    --query 'SecurityGroups[].{Name:GroupName,Id:GroupId}'
```

## System Architecture Overview
```
                                   End Users
                                      │
                                      ▼
                                  Route 53
                                      │
                                      ▼
                               CloudFront CDN
                                      │
                         ┌────────────┴───────────┐
                         ▼                        ▼
                    S3 Bucket             Application Load Balancer
                 (Static Assets)                   │
                                        ┌─────────┴─────────┐
                                        ▼                   ▼
                                Frontend Service    Backend Service
                                   (ECS/EKS)         (ECS/EKS)
                                        │                │
                                        │                ▼
                                        │         ┌──────────────┐
                                        │         │ SQS Queues   │
                                        │         ├──────────────┤
                                        │         │Resume Updates│
                                        │         │(FIFO Queue)  │
                                        │         ├──────────────┤
                                        │         │PDF Generation│
                                        │         │(Std Queue)   │
                                        │         ├──────────────┤
                                        │         │Notifications │
                                        │         │(Std Queue)   │
                                        │         └──────┬───────┘
                                        │                │
                                        │                ▼
                                        │            RDS Database
                                        │                │
                                        └───────────────►│
                                                        │
                                                   CloudWatch
                                                   Monitoring
```

## Message Processing Architecture
```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│ Frontend     │    │ Backend API   │    │ SQS Queues   │    │ Workers      │
│ React App    │───►│ Express.js    │───►│ - Resume     │───►│ - Resume     │
│              │    │               │    │ - PDF        │    │ - PDF        │
└──────────────┘    └───────────────┘    │ - Notify     │    │ - Notify     │
                                         └──────────────┘    └──────────────┘
                                                                    │
                                         ┌──────────────┐           │
                                         │ Dead Letter  │◄──────────┘
                                         │ Queue (DLQ)  │
                                         └──────────────┘
```

## SQS Implementation Details

### 1. Queue Structure
```
Queue Types and Purposes
┌────────────────────────────────────────────────────────────┐
│ Resume Updates Queue (FIFO)                                │
├────────────────────────────────────────────────────────────┤
│ - Name: devresume-resume-updates.fifo                      │
│ - Type: FIFO (First-In-First-Out)                         │
│ - Use: Maintain order of resume updates per user           │
│ - Deduplication: Content-based                            │
│ - Message Group ID: user-${userId}                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ PDF Generation Queue (Standard)                            │
├────────────────────────────────────────────────────────────┤
│ - Name: devresume-pdf-generation                          │
│ - Type: Standard                                          │
│ - Use: Async PDF generation requests                      │
│ - High throughput processing                              │
│ - Parallel processing capable                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Notifications Queue (Standard)                             │
├────────────────────────────────────────────────────────────┤
│ - Name: devresume-notifications                           │
│ - Type: Standard                                          │
│ - Use: User notifications and emails                      │
│ - Async notification processing                           │
└────────────────────────────────────────────────────────────┘
```

### 2. Message Flow
```
User Action                 Queue Processing            Backend Processing
┌──────────┐               ┌──────────────┐           ┌──────────────┐
│Update    │──FIFO Queue──►│Ordered      │──Worker──►│Update DB     │
│Resume    │               │Processing    │           │Generate PDF  │
└──────────┘               └──────────────┘           └──────────────┘
     │                                                      │
     │                     ┌──────────────┐                │
     └─────Std Queue─────►│PDF           │◄───Worker──────┘
                          │Generation     │
                          └──────────────┘
                                │
                                │                    ┌──────────────┐
                                └────Std Queue─────►│Send          │
                                                   │Notification   │
                                                   └──────────────┘
```

### 3. Infrastructure Setup

```hcl
# Terraform SQS Configuration
resource "aws_sqs_queue" "resume_updates" {
  name                        = "devresume-${var.environment}-resume-updates.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 300
  message_retention_seconds   = 86400  # 1 day
  
  tags = {
    Environment = var.environment
    Service     = "resume-processing"
  }
}

resource "aws_sqs_queue" "pdf_generation" {
  name                      = "devresume-${var.environment}-pdf-generation"
  visibility_timeout_seconds = 600
  message_retention_seconds = 86400
  
  tags = {
    Environment = var.environment
    Service     = "pdf-generation"
  }
}

resource "aws_sqs_queue" "notifications" {
  name                      = "devresume-${var.environment}-notifications"
  visibility_timeout_seconds = 300
  message_retention_seconds = 86400
  
  tags = {
    Environment = var.environment
    Service     = "notifications"
  }
}

# Dead Letter Queues
resource "aws_sqs_queue" "resume_updates_dlq" {
  name = "devresume-${var.environment}-resume-updates-dlq.fifo"
  fifo_queue = true
  
  tags = {
    Environment = var.environment
    Service     = "resume-processing-dlq"
  }
}

resource "aws_sqs_queue" "pdf_generation_dlq" {
  name = "devresume-${var.environment}-pdf-generation-dlq"
  
  tags = {
    Environment = var.environment
    Service     = "pdf-generation-dlq"
  }
}
```

### 4. Monitoring Setup
```
CloudWatch Dashboard Layout
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│   Queue Metrics    │ │   Worker Metrics   │ │   Error Metrics    │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│- Message Count     │ │- Processing Time   │ │- Failed Messages   │
│- Age of Messages   │ │- Worker Health     │ │- DLQ Count        │
│- In Flight Count   │ │- CPU/Memory Usage  │ │- Error Types      │
└────────────────────┘ └────────────────────┘ └────────────────────┘

Alarms Configuration
┌────────────────────────────────────────────────────────┐
│ High Priority Alarms                                   │
├────────────────────────────────────────────────────────┤
│ - Queue depth > 1000 messages                         │
│ - Message age > 10 minutes                            │
│ - DLQ message count > 0                               │
│ - Worker error rate > 5%                              │
└────────────────────────────────────────────────────────┘
```

### 5. Implementation Commands

```bash
# Create SQS Queues
aws sqs create-queue \
  --queue-name devresume-${ENV}-resume-updates.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true

aws sqs create-queue \
  --queue-name devresume-${ENV}-pdf-generation

aws sqs create-queue \
  --queue-name devresume-${ENV}-notifications

# Create Dead Letter Queues
aws sqs create-queue \
  --queue-name devresume-${ENV}-resume-updates-dlq.fifo \
  --attributes FifoQueue=true

aws sqs create-queue \
  --queue-name devresume-${ENV}-pdf-generation-dlq

# Set up CloudWatch Alarms
aws cloudwatch put-metric-alarm \
  --alarm-name devresume-${ENV}-queue-depth \
  --metric-name ApproximateNumberOfMessagesVisible \
  --namespace AWS/SQS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions ${SNS_TOPIC_ARN}
```

### 6. Deployment Updates

Update the deployment workflow to include SQS worker services:

```yaml
name: Deploy SQS Workers

on:
  push:
    branches: [dev, stage, main]

jobs:
  deploy-workers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      - name: Deploy Resume Processor
        run: |
          aws ecs update-service \
            --cluster devresume-${GITHUB_REF_NAME}-cluster \
            --service resume-processor \
            --force-new-deployment
      
      - name: Deploy PDF Generator
        run: |
          aws ecs update-service \
            --cluster devresume-${GITHUB_REF_NAME}-cluster \
            --service pdf-generator \
            --force-new-deployment
```

## 1. Developer Environment Setup

### 1.1 Local IDE Configuration
```bash
# Install required tools
brew install git aws-cli terraform docker kubectl

# Configure AWS CLI
aws configure
# Enter AWS credentials and default region

# Install Node.js and npm
brew install node

# Clone repository
git clone https://github.com/yourusername/devresume-forge.git
cd devresume-forge
```

### 1.2 Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Local development
npm install
docker-compose up -d

# Commit changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

## 2. GitHub Repository Structure

### 2.1 Branch Organization
```
main          # Production environment
├── release/* # Release candidates
├── stage     # Staging environment
├── dev       # Development integration
└── feature/* # Feature branches
```

### 2.2 Branch Protection Rules
```yaml
# main branch
protection_rules:
  required_reviews: 3
  status_checks: ["ci", "security", "prod-deploy"]
  allow_force_push: false

# stage branch
protection_rules:
  required_reviews: 2
  status_checks: ["ci", "stage-deploy"]
  allow_force_push: false

# dev branch
protection_rules:
  required_reviews: 1
  status_checks: ["ci"]
  allow_force_push: false
```

## 3. GitHub Actions CI/CD

### 3.1 CI Pipeline (.github/workflows/ci.yml)
```yaml
name: CI Pipeline
on:
  push:
    branches: [feature/*, dev, stage, release/*, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: npm test

  build:
    needs: test
    steps:
      - name: Build Docker Image
        run: docker build -t app:${GITHUB_SHA} .
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag app:${GITHUB_SHA} ${{ secrets.ECR_REGISTRY }}/app:${GITHUB_SHA}
          docker push ${{ secrets.ECR_REGISTRY }}/app:${GITHUB_SHA}
```

### 3.2 CD Pipeline (.github/workflows/cd.yml)
```yaml
name: CD Pipeline
on:
  push:
    branches: [dev, stage, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Apply
        run: |
          cd terraform
          terraform init
          terraform workspace select ${GITHUB_REF##*/}
          terraform apply -auto-approve
```

## 4. Terraform Infrastructure

### 4.0 Terraform Cloud Setup

1. **Create Terraform Cloud Account**
```bash
# Install Terraform CLI
brew install terraform  # For MacOS
terraform -version     # Verify installation

# Login to Terraform Cloud
terraform login
```

2. **Create Organization in Terraform Cloud**
- Visit app.terraform.io
- Create new organization "devresume-org"
- Note down the organization name

3. **Configure Project Structure**
```
infra/
├── terraform.tf          # Terraform Cloud backend config
├── variables.tf         # Common variables
├── outputs.tf          # Common outputs
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   ├── stage/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       └── terraform.tfvars
└── modules/
    ├── networking/
    ├── compute/
    ├── database/
    └── monitoring/
```

4. **Configure Terraform Cloud Backend**
```hcl
# terraform.tf
terraform {
  cloud {
    organization = "devresume-org"
    workspaces {
      tags = ["devresume"]
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}
```

5. **Create Workspaces in Terraform Cloud**
- Create three workspaces:
  - `devresume-dev`
  - `devresume-stage`
  - `devresume-prod`
- For each workspace, configure:
  - Version Control (connect to your GitHub repo)
  - Working Directory: `infra/environments/<env>`
  - Execution Mode: Remote
  - Apply Method: Auto apply for dev, Manual for stage/prod

6. **Configure Workspace Variables**
In Terraform Cloud UI, set for each workspace:

```hcl
# Workspace: devresume-dev
# Category: Environment Variables
AWS_ACCESS_KEY_ID     = "******" (sensitive)
AWS_SECRET_ACCESS_KEY = "******" (sensitive)
AWS_DEFAULT_REGION    = "us-west-2"

# Category: Terraform Variables
environment           = "dev"
vpc_cidr             = "10.0.0.0/16"
instance_type        = "t3.micro"
domain               = "dev.app.io"

# Workspace: devresume-stage
# Similar configuration with stage-specific values

# Workspace: devresume-prod
# Similar configuration with prod-specific values
```

7. **Environment-Specific Configurations**
```hcl
# environments/dev/main.tf
terraform {
  required_version = ">= 1.0.0"
}

module "networking" {
  source = "../../modules/networking"
  environment = var.environment
  vpc_cidr = var.vpc_cidr
}

module "compute" {
  source = "../../modules/compute"
  environment = var.environment
  instance_type = var.instance_type
  vpc_id = module.networking.vpc_id
}

# environments/dev/terraform.tfvars
environment = "dev"
vpc_cidr = "10.0.0.0/16"
instance_type = "t3.micro"
domain = "dev.app.io"
```

8. **GitHub Actions Integration with Terraform Cloud**
```yaml
# .github/workflows/terraform.yml
name: "Terraform"

on:
  push:
    branches:
      - dev
      - stage
      - main
  pull_request:

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          cli_config_credentials_token: ${{ secrets.TF_API_TOKEN }}

      - name: Set Workspace
        run: |
          if [[ ${{ github.ref }} == 'refs/heads/dev' ]]; then
            echo "TF_WORKSPACE=devresume-dev" >> $GITHUB_ENV
          elif [[ ${{ github.ref }} == 'refs/heads/stage' ]]; then
            echo "TF_WORKSPACE=devresume-stage" >> $GITHUB_ENV
          elif [[ ${{ github.ref }} == 'refs/heads/main' ]]; then
            echo "TF_WORKSPACE=devresume-prod" >> $GITHUB_ENV
          fi

      - name: Terraform Format
        run: terraform fmt -check

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan
        
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve
```

9. **Terraform Cloud State Management**
```
                ┌───────────────────────────┐
                │    Terraform Cloud        │
                │   State Management        │
                └─────────────┬─────────────┘
                              │
                ┌─────────────┴─────────────┐
                │      Workspaces           │
                ├───────────────────────────┤
                │ devresume-dev            │
                │ devresume-stage          │
                │ devresume-prod           │
                └─────────────┬─────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼────┐             ┌─────▼────┐             ┌─────▼────┐
│State Lock│             │State Lock │             │State Lock│
│   Dev    │             │  Stage   │             │   Prod   │
└────┬────┘             └─────┬────┘             └─────┬────┘
     │                        │                        │
     ▼                        ▼                        ▼
Remote State             Remote State             Remote State
  Storage                 Storage                  Storage
```

10. **Terraform Cloud Best Practices**
- Use Terraform Cloud's remote state storage
- Enable state locking (automatic in Terraform Cloud)
- Use variable sets for common variables across workspaces
- Configure workspace-specific run triggers
- Set up notification configurations
- Use policy sets for governance
- Enable cost estimation
- Configure sentinel policies

11. **Workspace Management Commands**
```bash
# Note: Most operations will be done through Terraform Cloud UI
# Local commands are mainly for development and troubleshooting

# Initialize backend
terraform init

# Select workspace (if working locally)
terraform workspace select devresume-dev

# Plan changes (triggers remote plan in Terraform Cloud)
terraform plan

# Apply changes (triggers remote apply in Terraform Cloud)
terraform apply
```

### 4.0 Terraform Workspace Architecture
```
                ┌───────────────────────────┐
                │    Terraform Cloud        │
                │   (Organization)          │
                └─────────────┬─────────────┘
                              │
                ┌─────────────┴─────────────┐
                │      Workspaces           │
                ├───────────────────────────┤
                │ dev       stage     prod  │
                │                           │
                │ Holds state for each env  │
                │ Separate vars per env     │
                └─────────────┬─────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼────┐             ┌─────▼────┐             ┌─────▼────┐
│  dev    │             │  stage   │             │  prod    │
│ tfvars  │             │ tfvars   │             │ tfvars   │
│ AWS Dev │             │ AWS Stage│             │ AWS Prod │
└────┬────┘             └─────┬────┘             └─────┬────┘
     │                        │                        │
     ▼                        ▼                        ▼
AWS Dev Infra          AWS Stage Infra          AWS Prod Infra
(dev.app.io)           (stage.app.io)           (app.io)
```

### 4.0.1 Workspace Setup Commands
```bash
# Login to Terraform Cloud
terraform login

# Create organization in Terraform Cloud (via UI)
# Save the organization name

# Initialize backend
terraform init

# Create workspaces
terraform workspace new dev
terraform workspace new stage
terraform workspace new prod

# List workspaces
terraform workspace list

# Switch between workspaces
terraform workspace select dev    # For development
terraform workspace select stage  # For staging
terraform workspace select prod   # For production

# Apply changes to specific workspace
terraform workspace select dev
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars

# Repeat for stage and prod with respective var files
```

### 4.0.2 Workspace-Specific Variables
```hcl
# environments/dev/terraform.tfvars
environment = "dev"
vpc_cidr = "10.0.0.0/16"
instance_type = "t3.micro"
domain = "dev.app.io"

# environments/stage/terraform.tfvars
environment = "stage"
vpc_cidr = "10.1.0.0/16"
instance_type = "t3.small"
domain = "stage.app.io"

# environments/prod/terraform.tfvars
environment = "prod"
vpc_cidr = "10.2.0.0/16"
instance_type = "t3.medium"
domain = "app.io"
```

### 4.1 Workspace Management
```bash
# Create workspaces
terraform workspace new dev
terraform workspace new stage
terraform workspace new prod

# List workspaces
terraform workspace list

# Select workspace
terraform workspace select ${ENV}
```

### 4.2 Infrastructure Modules
```hcl
# main.tf
module "networking" {
  source = "./modules/networking"
  environment = terraform.workspace
}

module "compute" {
  source = "./modules/compute"
  environment = terraform.workspace
  vpc_id = module.networking.vpc_id
}

module "database" {
  source = "./modules/database"
  environment = terraform.workspace
  vpc_id = module.networking.vpc_id
}

module "monitoring" {
  source = "./modules/monitoring"
  environment = terraform.workspace
}
```

## 5. AWS Resources

### 5.1 VPC and Networking
```hcl
# modules/networking/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  
  tags = {
    Name = "${var.environment}-vpc"
  }
}

resource "aws_subnet" "private" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.private_subnet_cidr
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.public_subnet_cidr
}
```

### 5.2 ECS Configuration
```hcl
# modules/compute/ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "devresume-${var.environment}-cluster"
  
  tags = {
    Name        = "devresume-${var.environment}-cluster"
    Environment = var.environment
    Project     = "devresume"
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "devresume-${var.environment}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = var.frontend_cpu
  memory                  = var.frontend_memory
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${var.ecr_repository_url}/devresume-frontend:${var.image_tag}"
      portMappings = [
        {
          containerPort = 80
          protocol     = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/devresume-${var.environment}/frontend"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "frontend"
        }
      }
    }
  ])

  tags = {
    Name        = "devresume-${var.environment}-frontend"
    Environment = var.environment
    Project     = "devresume"
  }
}

resource "aws_ecs_service" "frontend" {
  name            = "devresume-${var.environment}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.frontend.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  tags = {
    Name        = "devresume-${var.environment}-frontend-service"
    Environment = var.environment
    Project     = "devresume"
  }
}
```

### 5.3 RDS Database
```hcl
# modules/database/main.tf
resource "aws_db_instance" "main" {
  identifier = "devresume-${var.environment}-db"
  engine     = "postgres"
  engine_version = "13.7"
  
  instance_class = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage = var.environment == "prod" ? 100 : 20
  
  db_name  = "devresume_${var.environment}"
  username = "devresume_admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
  
  backup_retention_period = var.environment == "prod" ? 30 : 7
  multi_az               = var.environment == "prod"
  storage_encrypted      = true
  
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.database.name
  
  tags = {
    Name        = "devresume-${var.environment}-db"
    Environment = var.environment
    Project     = "devresume"
  }
}

resource "aws_db_subnet_group" "database" {
  name       = "devresume-${var.environment}-db-subnet"
  subnet_ids = var.database_subnet_ids

  tags = {
    Name        = "devresume-${var.environment}-db-subnet"
    Environment = var.environment
    Project     = "devresume"
  }
}
```

### 5.4 Secrets Management
```hcl
# modules/secrets/main.tf
resource "aws_secretsmanager_secret" "app" {
  name = "${var.environment}/app-secrets"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    DB_PASSWORD = random_password.db.result
    JWT_SECRET = random_password.jwt.result
  })
}
```

## 6. Application Runtime

### 6.1 Container Configuration
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 6.2 Environment Configuration
```bash
# .env.${ENV}
NODE_ENV=${ENV}
DB_HOST=${DB_ENDPOINT}
DB_NAME=${DB_NAME}
```

### 6.3 Health Checks
```javascript
// health.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

## 7. Monitoring and Logging

### 7.1 CloudWatch Configuration
```hcl
# modules/monitoring/main.tf
resource "aws_cloudwatch_log_group" "app" {
  name = "/aws/ecs/${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7
}

resource "aws_cloudwatch_metric_alarm" "cpu" {
  alarm_name = "${var.environment}-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  metric_name = "CPUUtilization"
  namespace = "AWS/ECS"
  threshold = 80
}
```

### 7.2 Application Logging
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
```

## 8. Deployment Commands

### 8.1 Development Deployment
```bash
# Deploy to dev
git checkout dev
git merge feature/new-feature
git push origin dev

# GitHub Actions will:
# 1. Run tests
# 2. Build Docker image
# 3. Push to ECR
# 4. Apply Terraform changes
```

### 8.2 Production Deployment
```bash
# Deploy to production
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags

# GitHub Actions will:
# 1. Run all tests
# 2. Build production image
# 3. Push to ECR
# 4. Apply Terraform changes
# 5. Update DNS
```

### 8.3 Rollback Procedure
```bash
# Rollback deployment
aws ecs update-service \
  --cluster ${ENV}-cluster \
  --service app \
  --task-definition app:${PREVIOUS_VERSION}

# Rollback infrastructure
terraform workspace select ${ENV}
terraform plan -out=tfplan
terraform apply tfplan
```

## 9. Maintenance Tasks

### 9.1 Database Backups
```bash
# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier ${ENV}-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)

# Automated backups configured in Terraform
```

### 9.2 Log Analysis
```bash
# View application logs
aws logs get-log-events \
  --log-group-name /aws/ecs/${ENV} \
  --log-stream-name app/latest

# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=${ENV}-cluster \
  --start-time $(date -v-1H +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### 9.3 Cost Management
```bash
# View current month's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost
``` 

### Terraform Module Structure
```
infra/
├── backend.tf          # S3 state configuration
├── provider.tf         # AWS provider configuration
├── variables.tf        # Common variables
├── outputs.tf         # Common outputs
│
├── modules/
│   ├── networking/    # VPC and network components
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── compute/      # ECS/EKS configuration
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── database/     # RDS and ElastiCache
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── monitoring/   # CloudWatch and alerts
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── environments/
    ├── staging/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── terraform.tfvars
    │
    └── production/
        ├── main.tf
        ├── variables.tf
        └── terraform.tfvars
```

### Terraform State Management
```
                    Developer
                        │
                        ▼
                Terraform Commands
                        │
                        ▼
            ┌──────────────────────┐
            │   State Management   │
            └──────────────────────┘
                        │
        ┌──────────────┴──────────────┐
        ▼                             ▼
    S3 Bucket                    DynamoDB
(State Storage)              (State Locking)
        │                             │
        └──────────────┬─────────────┘
                      │
              ┌───────┴────────┐
              ▼                ▼
         Staging State    Production State
```

### AWS Networking Layout
```
                     Internet Gateway
                            │
                    ┌───────┴───────┐
                    ▼               ▼
             Public Subnet    Public Subnet
             (AZ-1)          (AZ-2)
                    │               │
                    ▼               ▼
              NAT Gateway     NAT Gateway
                    │               │
                    ▼               ▼
            Private Subnet   Private Subnet
            (AZ-1)          (AZ-2)
                    │               │
                    ▼               ▼
            Database Subnet  Database Subnet
            (AZ-1)          (AZ-2)
```

### ECS Service Architecture
```
                           ECS Cluster
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Service   │    │   Service   │    │   Service   │ │
│  │  Frontend   │    │  Backend    │    │  Database   │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                   │        │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐ │
│  │   Task      │    │    Task     │    │    Task     │ │
│  │ Definition  │    │ Definition  │    │ Definition  │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                   │        │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐ │
│  │  Container  │    │  Container  │    │  Container  │ │
│  │   (Fargate) │    │  (Fargate) │    │  (Fargate) │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## EKS Service Architecture
```
                           EKS Cluster
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  Node Group │    │  Node Group │    │  Node Group │ │
│  │   (Spot)    │    │ (On-Demand) │    │   (Spot)    │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                   │        │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐ │
│  │ Deployment  │    │ Deployment  │    │ StatefulSet │ │
│  │  Frontend   │    │  Backend    │    │  Database   │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                   │        │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐ │
│  │    HPA      │    │    HPA      │    │   Volume    │ │
│  │Auto-scaling │    │Auto-scaling │    │  Claims     │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Service Deployment Strategy
We'll use both ECS and EKS for different environments to demonstrate and leverage the benefits of both services:

### ECS Deployment (Development & Staging)
- **Environment**: Development and Staging
- **Benefits**:
  - Simpler management
  - Lower operational overhead
  - Cost-effective for smaller workloads
  - Easier monitoring setup

```
Development/Staging Flow (ECS)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  GitHub     │───►│  ECR        │───►│  ECS        │
│  Actions    │    │  Repository │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                          ┌───────────────►│
┌─────────────┐          │                │
│  Terraform  │──────────┘                │
│  Apply      │                           ▼
└─────────────┘                    ┌─────────────┐
                                   │  Fargate    │
                                   │  Tasks      │
                                   └─────────────┘
```

### EKS Deployment (Production)
- **Environment**: Production
- **Benefits**:
  - Advanced orchestration
  - Better scalability
  - More control over infrastructure
  - Advanced deployment strategies

```
Production Flow (EKS)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  GitHub     │───►│  ECR        │───►│  EKS        │
│  Actions    │    │  Repository │    │  Cluster    │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                          ┌───────────────►│
┌─────────────┐          │                │
│  Terraform  │──────────┘                ▼
│  Apply      │                    ┌─────────────┐
└─────────────┘                    │  Node       │
                                   │  Groups     │
                                   └─────────────┘
```

### Resource Configuration

#### ECS Resources (Dev/Staging)
```hcl
# Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = var.task_cpu
  memory                  = var.task_memory
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${var.ecr_repository_url}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
    }
  ])
}

# Service
resource "aws_ecs_service" "app" {
  name            = "${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.service_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}
```

#### EKS Resources (Production)
```hcl
# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "${var.environment}-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = var.private_subnet_ids
  }
}

# Node Groups
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.environment}-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.private_subnet_ids

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  instance_types = ["t3.medium"]
  capacity_type  = "SPOT"  # Using SPOT instances for cost optimization
}
```

## Important Implementation Notes

### Day 1: Setup & Configuration
```bash
# IMPORTANT: Before starting, ensure AWS credentials are properly configured
aws configure
aws sts get-caller-identity  # Verify AWS access

# TIP: Create a .gitignore file to prevent committing sensitive information
cat > .gitignore << EOL
.env
*.tfvars
.terraform/
*.tfstate
*.tfstate.backup
EOL

# BEST PRACTICE: Initialize git with main branch
git init
git checkout -b main
```

### Day 2: Infrastructure
```bash
# NOTE: Always create resources in this order to avoid dependencies issues:
# 1. VPC and networking
# 2. Security groups
# 3. Database subnets
# 4. Application subnets
# 5. Load balancers
# 6. Container infrastructure

# TIP: Use data sources to fetch AWS information
data "aws_availability_zones" "available" {
  state = "available"
}

# SECURITY: Always encrypt sensitive data
resource "aws_db_instance" "main" {
  storage_encrypted = true
  # ... other configurations
}
```

### Day 3: Databases
```bash
# IMPORTANT: Always create database backups before major changes
aws rds create-db-snapshot \
    --db-instance-identifier ${ENV}-db \
    --db-snapshot-identifier pre-change-snapshot

# TIP: Test database connectivity before proceeding
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\l"
```

### Day 4: CI/CD
```yaml
# NOTE: Add these environment variables in GitHub Secrets
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# DOCKER_USERNAME
# DOCKER_PASSWORD
# DB_PASSWORD
# JWT_SECRET

# BEST PRACTICE: Always specify versions for actions
steps:
  - uses: actions/checkout@v2  # Don't use @master
  - uses: aws-actions/configure-aws-credentials@v1
```

### Day 5: Testing
```bash
# TIP: Run tests in parallel for faster execution
npm test -- --parallel

# IMPORTANT: Always test with production-like data
# Create a staging database with production-like schema
```

### Day 6-7: Deployment
```bash
# CHECKLIST: Before production deployment
# 1. Backup all data
# 2. Verify all tests pass
# 3. Check resource scaling
# 4. Verify monitoring
# 5. Test rollback procedure

# TIP: Use deployment slots for zero-downtime updates
```

## Resource Scaling Guidelines

### Development Environment
```
Resource               Min         Max
----------------------------------------
ECS Tasks              1           2
RDS Instance           t3.micro    -
ElastiCache           t3.micro    -
```

### Production Environment
```
Resource               Min         Max
----------------------------------------
ECS Tasks              2           10
RDS Instance           t3.medium   -
ElastiCache           t3.medium   -
Auto Scaling          CPU > 70%   CPU < 40%
```

## Monitoring Best Practices

### 1. CloudWatch Alarms
```bash
# Set up basic alarms first
aws cloudwatch put-metric-alarm \
    --alarm-name cpu-utilization \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --period 300 \
    --threshold 70 \
    --statistic Average
```

### 2. Log Insights
```bash
# Useful CloudWatch Logs Insights queries
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

### 3. Health Checks
```bash
# Add health check endpoints
GET /health/live  # Liveness probe
GET /health/ready # Readiness probe
```

## Security Reminders

### 1. Network Security
- Always use private subnets for applications
- Use security groups as firewalls
- Enable VPC Flow Logs for monitoring

### 2. Application Security
- Enable AWS WAF for web applications
- Use AWS Secrets Manager for credentials
- Implement rate limiting

### 3. Database Security
- Enable encryption at rest
- Use IAM authentication when possible
- Regular security patches

## Cost Optimization Tips

### 1. Development Environment
- Use Spot Instances where possible
- Scale down during non-working hours
- Use smaller instance types

### 2. Production Environment
- Use Reserved Instances for steady workloads
- Enable auto-scaling
- Monitor and act on CloudWatch metrics 

## AWS Secrets Manager Integration

### 1. Secrets Architecture
```
                                ┌─────────────────┐
                                │  AWS Secrets    │
                                │   Manager       │
                                └────────┬────────┘
                                         │
                 ┌─────────────┬─────────┴──────────┬─────────────┐
                 │             │                    │             │
        ┌────────┴───────┐    │            ┌───────┴──────┐      │
        │  Application   │    │            │  Database    │      │
        │   Secrets     │    │            │  Secrets     │      │
        └────────┬───────┘    │            └───────┬──────┘      │
                 │            │                    │             │
         ┌───────┴───────┐    │            ┌───────┴───────┐     │
         │ JWT_SECRET    │    │            │ DB_PASSWORD   │     │
         │ API_KEYS      │    │            │ DB_USERNAME   │     │
         └───────────────┘    │            └───────────────┘     │
                             ┌┴┐                                 │
                             │ │                                 │
                        ECS/EKS                            Rotation
                        Access                             Lambda
```

### 2. Terraform Configuration for Secrets Manager

```hcl
# modules/secrets/main.tf

# Create secrets for different environments
resource "aws_secretsmanager_secret" "application" {
  name = "${var.environment}/application"
  description = "Application secrets for ${var.environment} environment"
  
  tags = {
    Environment = var.environment
    Project     = "devresume"
  }
}

resource "aws_secretsmanager_secret" "database" {
  name = "${var.environment}/database"
  description = "Database credentials for ${var.environment} environment"
  
  tags = {
    Environment = var.environment
    Project     = "devresume"
  }
}

# Create secret versions with initial values
resource "aws_secretsmanager_secret_version" "application" {
  secret_id = aws_secretsmanager_secret.application.id
  secret_string = jsonencode({
    JWT_SECRET = var.jwt_secret
    API_KEY    = var.api_key
  })
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
  })
}

# Create rotation schedule for database secrets
resource "aws_secretsmanager_secret_rotation" "database" {
  secret_id           = aws_secretsmanager_secret.database.id
  rotation_lambda_arn = aws_lambda_function.rotation.arn

  rotation_rules {
    automatically_after_days = var.environment == "prod" ? 30 : 90
  }
}

# IAM role for ECS tasks to access secrets
resource "aws_iam_role_policy" "secrets_access" {
  name = "${var.environment}-secrets-access"
  role = var.ecs_task_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.application.arn,
          aws_secretsmanager_secret.database.arn
        ]
      }
    ]
  })
}
```

### 3. ECS Integration with Secrets Manager

```hcl
# modules/ecs/task-definition.tf

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = var.task_cpu
  memory                  = var.task_memory
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.ecr_repository_url}:${var.image_tag}"
      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.application.arn}:JWT_SECRET::"
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.database.arn}:password::"
        },
        {
          name      = "DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.database.arn}:username::"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        }
      ]
    }
  ])
}
```

### 4. EKS Integration with Secrets Manager

```yaml
# k8s/secrets-store.yaml

apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-secrets
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "${environment}/application"
        objectType: "secretsmanager"
        jmesPath: 
          - path: JWT_SECRET
            objectAlias: jwt_secret
      - objectName: "${environment}/database"
        objectType: "secretsmanager"
        jmesPath:
          - path: username
            objectAlias: db_username
          - path: password
            objectAlias: db_password

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
      - name: backend
        volumeMounts:
        - name: secrets-store
          mountPath: "/mnt/secrets-store"
          readOnly: true
      volumes:
      - name: secrets-store
        csi:
          driver: secrets-store.csi.k8s.io
          readOnly: true
          volumeAttributes:
            secretProviderClass: "aws-secrets"
```

### 5. Secrets Rotation Lambda Function

```python
# modules/secrets/lambda/rotate_secrets.py

import boto3
import json
import logging
import os
import pg8000

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """Rotate secrets for RDS database"""
    arn = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']
    
    secrets_client = boto3.client('secretsmanager')
    
    metadata = secrets_client.describe_secret(SecretId=arn)
    
    if step == "createSecret":
        create_secret(secrets_client, arn, token)
    elif step == "setSecret":
        set_secret(secrets_client, arn, token)
    elif step == "testSecret":
        test_secret(secrets_client, arn, token)
    elif step == "finishSecret":
        finish_secret(secrets_client, arn, token)
        
    return {"statusCode": 200}

def create_secret(secrets_client, arn, token):
    """Generate a new secret"""
    current_dict = get_secret_dict(secrets_client, arn, "AWSCURRENT")
    new_dict = current_dict.copy()
    new_dict['password'] = generate_password()
    
    secrets_client.put_secret_value(
        SecretId=arn,
        ClientRequestToken=token,
        SecretString=json.dumps(new_dict),
        VersionStages=['AWSPENDING']
    )

def set_secret(secrets_client, arn, token):
    """Set the new secret in the database"""
    pending_dict = get_secret_dict(secrets_client, arn, "AWSPENDING")
    current_dict = get_secret_dict(secrets_client, arn, "AWSCURRENT")
    
    connection = get_connection(current_dict)
    with connection.cursor() as cursor:
        cursor.execute(
            f"ALTER USER {current_dict['username']} WITH PASSWORD '{pending_dict['password']}'"
        )
    connection.commit()
    connection.close()

def test_secret(secrets_client, arn, token):
    """Test the new secret"""
    pending_dict = get_secret_dict(secrets_client, arn, "AWSPENDING")
    
    connection = get_connection(pending_dict)
    connection.close()

def finish_secret(secrets_client, arn, token):
    """Mark the secret as rotated"""
    secrets_client.update_secret_version_stage(
        SecretId=arn,
        VersionStage="AWSCURRENT",
        MoveToVersionId=token,
        RemoveFromVersionId=get_secret_version(secrets_client, arn, "AWSCURRENT")
    )
```

### 6. Terraform Cloud Variables for Secrets

Configure these variables in Terraform Cloud workspace:

```hcl
# Workspace Variables (mark as sensitive)
jwt_secret    = "your-secure-jwt-secret"
api_key       = "your-api-key"
db_username   = "admin"
db_password   = "secure-password"

# Environment Variables
AWS_ACCESS_KEY_ID     = "******"
AWS_SECRET_ACCESS_KEY = "******"
```

### 7. Secrets Access Monitoring

```hcl
# modules/monitoring/secrets.tf

resource "aws_cloudwatch_metric_alarm" "secrets_access" {
  alarm_name          = "${var.environment}-secrets-access-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "SecretsAccessCount"
  namespace           = "AWS/SecretsManager"
  period              = "300"
  statistic          = "Sum"
  threshold          = var.secrets_access_threshold
  alarm_description  = "This metric monitors secrets access frequency"
  
  dimensions = {
    SecretId = aws_secretsmanager_secret.application.id
  }
  
  alarm_actions = [var.sns_topic_arn]
}
```

### 8. Security Best Practices

1. **Access Control**
   - Use IAM roles with least privilege
   - Implement resource-based policies
   - Use VPC endpoints for Secrets Manager

2. **Rotation**
   - Enable automatic rotation for database credentials
   - Implement custom rotation for application secrets
   - Use separate rotation schedules per environment

3. **Monitoring**
   - Enable CloudTrail logging
   - Set up CloudWatch alarms
   - Monitor access patterns

4. **Encryption**
   - Use AWS KMS for encryption
   - Rotate KMS keys regularly
   - Enable automatic key rotation 
```

## Final Implementation Checklist

### 1. Infrastructure Setup
- [ ] VPC and networking components created with proper naming
  ```bash
  # Verify VPC
  aws ec2 describe-vpcs \
      --filters Name=tag:Name,Values=devresume-${ENV}-vpc
  ```

- [ ] ECS/EKS clusters properly configured
  ```bash
  # Verify clusters
  aws ecs describe-clusters \
      --clusters devresume-${ENV}-cluster
  aws eks describe-cluster \
      --name devresume-${ENV}-cluster
  ```

- [ ] Databases and caches initialized
  ```bash
  # Verify database
  aws rds describe-db-instances \
      --db-instance-identifier devresume-${ENV}-db
  ```

### 2. Application Deployment
- [ ] Container images built and pushed
  ```bash
  # Verify images
  aws ecr describe-images \
      --repository-name devresume-${ENV}-frontend
  aws ecr describe-images \
      --repository-name devresume-${ENV}-backend
  ```

- [ ] Services running with correct configurations
  ```bash
  # Verify services
  aws ecs describe-services \
      --cluster devresume-${ENV}-cluster \
      --services devresume-${ENV}-frontend devresume-${ENV}-backend
  ```

### 3. Security Configuration
- [ ] Secrets properly configured
  ```bash
  # Verify secrets
  aws secretsmanager list-secrets \
      --filters Key=tag-key,Values=Project,Key=tag-value,Values=devresume
  ```

- [ ] SSL certificates installed
  ```bash
  # Verify certificates
  aws acm list-certificates \
      --includes keyTypes=RSA_2048 \
      --query 'CertificateSummaryList[?DomainName==`*.devresume.com`]'
  ```

### 4. Monitoring Setup
- [ ] CloudWatch log groups created
  ```bash
  # Verify log groups
  aws logs describe-log-groups \
      --log-group-name-prefix /aws/ecs/devresume-${ENV}
  ```

- [ ] Alarms configured
  ```bash
  # Verify alarms
  aws cloudwatch describe-alarms \
      --alarm-name-prefix devresume-${ENV}
  ```

### 5. DNS and Routing
- [ ] Route53 records created
  ```bash
  # Verify DNS records
  aws route53 list-resource-record-sets \
      --hosted-zone-id ${HOSTED_ZONE_ID} \
      --query "ResourceRecordSets[?Name=='${ENV}.devresume.com.']"
  ```

### 6. Backup and Recovery
- [ ] Database backups configured
  ```bash
  # Verify backup settings
  aws rds describe-db-instances \
      --db-instance-identifier devresume-${ENV}-db \
      --query 'DBInstances[].BackupRetentionPeriod'
  ```

- [ ] Snapshot schedule set up
  ```bash
  # Verify snapshots
  aws rds describe-db-snapshots \
      --db-instance-identifier devresume-${ENV}-db
  ```

### 7. Cost Management
- [ ] Resource tagging complete
  ```bash
  # Verify tags
  aws resourcegroupstaggingapi get-resources \
      --tag-filters Key=Project,Values=devresume Key=Environment,Values=${ENV}
  ```

- [ ] Budget alerts configured
  ```bash
  # Verify budgets
  aws budgets describe-budgets \
      --account-id ${AWS_ACCOUNT_ID}
  ```

### 8. Documentation
- [ ] Architecture diagrams updated
- [ ] Runbooks created
- [ ] Deployment procedures documented
- [ ] Emergency contacts listed
- [ ] Rollback procedures documented

### 9. Testing
- [ ] Load testing completed
  ```bash
  # Verify scaling
  aws ecs describe-services \
      --cluster devresume-${ENV}-cluster \
      --services devresume-${ENV}-frontend \
      --query 'services[].deployments[].{Desired:desiredCount,Running:runningCount}'
  ```

- [ ] Failover testing performed
  ```bash
  # Verify high availability
  aws rds describe-db-instances \
      --db-instance-identifier devresume-${ENV}-db \
      --query 'DBInstances[].MultiAZ'
  ```

### 10. Compliance
- [ ] Security scan completed
- [ ] Compliance requirements met
- [ ] Audit logs enabled
- [ ] Access controls verified

## Jira Integration and Workflow

### Jira Project Structure
```
                                    Jira Project: DEVRESUME
                    ┌─────────────────────────┴──────────────────────────┐
                    ▼                         ▼                          ▼
              Epics (DEV-E*)           Stories (DEV-*)            Tasks (DEV-*)
                    │                         │                          │
            ┌───────┴───────┐         ┌──────┴──────┐          ┌───────┴───────┐
            ▼               ▼         ▼             ▼          ▼               ▼
    Infrastructure    Application   Frontend      Backend    Development     DevOps
      Setup            Features    Components     APIs         Tasks         Tasks
```

### Workflow States
```
                              To Do
                                │
                                ▼
                            In Progress ◄────────────┐
                                │                    │
                                ▼                    │
                            In Review                │
                                │                    │
                                ▼                    │
                            Testing                  │
                                │                    │
                                ▼                    │
                          Ready for Prod             │
                                │                    │
                                ▼                    │
                            Done                     │
                                │                    │
                                ▼                    │
                            Closed            Reopened
```

### Jira-Git Integration
```
                         Jira Issue (DEV-123)
                                │
                                ▼
                    Create Branch from Issue
                    feature/DEV-123-description
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            Commit Messages           Pull Request
        DEV-123: commit message    DEV-123: PR title
                    │                       │
                    └───────────┬───────────┘
                               ▼
                      Auto-Update Jira Issue
                      (Status & Comments)
```

### Implementation Guidelines

1. **Issue Creation and Management**
   - Create epics for major features (e.g., "DEV-E1: User Authentication System")
   - Break epics into stories (e.g., "DEV-101: Implement Login Page")
   - Create technical tasks as subtasks (e.g., "DEV-102: Setup JWT Authentication")

2. **Branch Naming Convention**
   ```bash
   # Format: feature/DEV-{number}-{description}
   git checkout -b feature/DEV-123-implement-login
   git checkout -b bugfix/DEV-124-fix-auth-token
   ```

3. **Commit Message Format**
   ```bash
   # Format: DEV-{number}: {message}
   git commit -m "DEV-123: Implement login form and validation"
   git commit -m "DEV-123: Add JWT token handling"
   ```

4. **Pull Request Integration**
   - Title: "DEV-123: Implement User Authentication"
   - Description Template:
     ```markdown
     Jira Issue: DEV-123
     
     Changes:
     - Implemented login form
     - Added JWT token handling
     - Setup authentication middleware
     
     Testing:
     - [ ] Unit tests added
     - [ ] Integration tests completed
     - [ ] Manual testing performed
     
     Screenshots:
     [If applicable]
     ```

5. **Automation Rules**
   - Moving issue to "In Progress" when branch is created
   - Updating issue with PR link when created
   - Moving issue to "In Review" when PR is opened
   - Moving issue to "Testing" when PR is merged to dev
   - Moving issue to "Ready for Prod" when merged to stage
   - Moving issue to "Done" when merged to main

6. **GitHub Actions Integration**
   ```yaml
   name: Jira Integration
   on:
     pull_request:
       types: [opened, closed, reopened]
   
   jobs:
     update-jira:
       runs-on: ubuntu-latest
       steps:
         - name: Login to Jira
           uses: atlassian/gajira-login@v3
           with:
             client-id: ${{ secrets.JIRA_CLIENT_ID }}
             client-secret: ${{ secrets.JIRA_CLIENT_SECRET }}
         
         - name: Update Jira Issue
           uses: atlassian/gajira-transition@v3
           with:
             issue: ${{ github.event.pull_request.title.split(':')[0] }}
             transition: "In Review"
   ```

7. **Development Workflow**
   ```bash
   # Start working on a new feature
   jira_id="DEV-123"
   description="implement-login"
   
   # Create branch
   git checkout dev
   git pull origin dev
   git checkout -b feature/${jira_id}-${description}
   
   # Make changes and commit
   git add .
   git commit -m "${jira_id}: Implement login form"
   
   # Create PR (this will auto-update Jira)
   gh pr create --title "${jira_id}: Implement User Authentication" \
                --body "Jira Issue: ${jira_id}"
   ```

8. **Status Transitions**
   - To Do → In Progress: When branch is created
   - In Progress → In Review: When PR is created
   - In Review → Testing: When PR is merged to dev
   - Testing → Ready for Prod: When merged to stage
   - Ready for Prod → Done: When merged to main
   - Any → Reopened: When issues are found
```

### Detailed Jira Configurations

1. **Project Configuration**
   ```
   Project Type: Software Development
   Template: Scrum
   Key: DEV
   
   Board Configuration:
   ├── Sprint Duration: 2 weeks
   ├── Story Points: Fibonacci (1,2,3,5,8,13,21)
   └── Estimation: Story Points
   ```

2. **Custom Fields Setup**
   ```
   Field Name            Type          Usage
   ─────────────────────────────────────────────────────
   Environment         Select Menu    [Dev, Stage, Prod]
   AWS Services        Checkbox      [ECS, EKS, RDS, S3, CloudFront]
   Component          Select Menu    [Frontend, Backend, Infrastructure]
   Priority           Select Menu    [P0, P1, P2, P3]
   Tech Stack         Multi-Select   [React, Node.js, MongoDB, Docker]
   Test Coverage      Number        [Percentage]
   Security Review    Checkbox      [Required for Prod]
   Template Impact    Checkbox      [Yes/No]
   Resume Section     Multi-Select   [Personal, Experience, Education, Skills]
   ```

3. **Project-Specific Issue Templates**
   ```yaml
   Template: Frontend Feature
   Fields:
     - Component: Frontend
     - Tech Stack: [Required]
     - Resume Section: [Required]
     - Template Impact: [Required]
     - UI Mockups: [Optional]
     - Test Cases: [Required]
     - Browser Compatibility: [Required]

   Template: Backend API
   Fields:
     - Component: Backend
     - Tech Stack: [Required]
     - API Documentation: [Required]
     - Data Models: [Required]
     - Test Cases: [Required]
     - Performance Impact: [Optional]

   Template: Infrastructure Change
   Fields:
     - Component: Infrastructure
     - AWS Services: [Required]
     - Environment: [Required]
     - Security Review: Auto-set
     - Rollback Plan: [Required]
     - Cost Impact: [Required]
     - Downtime Expected: [Y/N]
   ```

4. **Integration Settings**
   ```yaml
   GitHub Integration:
     Repository: devresume-forge
     Smart Commits: Enabled
     Development Panel: Enabled
     Branch Creation: Enabled
     PR Status: Enabled

   Slack Integration:
     Channel: #devresume-updates
     Notifications:
       - New resume template added
       - Infrastructure changes
       - Build/deployment status
       - Security review needed
       - Production deployments

   AWS Integration:
     CloudWatch Alerts:
       - ECS/EKS service health
       - RDS performance
       - S3 bucket metrics
       - CloudFront distribution
     Deployment Status: Enabled
     Cost Alerts: Enabled
   ```

5. **Example Epic Structure**
   ```
   Epic: DEV-E1: Resume Builder Core Features
   ├── Story: DEV-101: Implement Resume Template System
   │   ├── Task: DEV-102: Create base template components
   │   ├── Task: DEV-103: Implement template switching
   │   └── Task: DEV-104: Add template preview
   │
   ├── Story: DEV-201: PDF Export Functionality
   │   ├── Task: DEV-202: Setup PDF generation service
   │   ├── Task: DEV-203: Implement export API
   │   └── Task: DEV-204: Add download functionality
   │
   └── Story: DEV-301: Resume Data Management
       ├── Task: DEV-302: Create resume data models
       ├── Task: DEV-303: Implement CRUD operations
       └── Task: DEV-304: Add data validation
   ```

6. **Workflow Triggers**
   ```
   Trigger                Action                     Condition
   ────────────────────────────────────────────────────────────
   Branch Created    → Set "In Progress"         Branch matches feature/*
   PR Created       → Set "In Review"           PR title contains DEV-*
   PR Merged        → Update Environment        Target branch = dev/stage/main
   Build Failed     → Add "blocked" label       CI/CD pipeline fails
   Deploy Success   → Update Environment        Deployment succeeds
   ```

7. **Dashboard Configuration**
   ```
   Dashboard: DevResume Development
   ┌─────────────────────┐ ┌────────────────────┐
   │   Sprint Progress   │ │  Production Issues │
   ├─────────────────────┤ ├────────────────────┤
   │   Burndown Chart    │ │   AWS Service      │
   │                     │ │   Distribution     │
   └─────────────────────┘ └────────────────────┘
   ┌─────────────────────┐ ┌────────────────────┐
   │   Team Workload     │ │  Security Review   │
   │                     │ │    Status          │
   └─────────────────────┘ └────────────────────┘
   ```

8. **JQL Filters**
   ```sql
   -- Production Deployments
   project = DEV AND environment = Prod 
   AND status CHANGED TO "Done" 
   DURING (startOfWeek(), endOfWeek())

   -- Security Reviews Needed
   project = DEV 
   AND "Security Review" = Required 
   AND status != Done
   AND environment = Prod

   -- Tech Debt Tracking
   project = DEV 
   AND "Tech Debt" = Yes 
   ORDER BY priority DESC

   -- Team Velocity
   project = DEV 
   AND sprint in openSprints() 
   AND type = Story
   ```

9. **Webhook Configurations**
   ```yaml
   Endpoint: GitHub Actions
   Events:
     - issue_updated
     - issue_transitioned
     - comment_created
   Headers:
     Authorization: ${JIRA_WEBHOOK_SECRET}
   Payload:
     issue_key: {{issue.key}}
     status: {{issue.status}}
     assignee: {{issue.assignee}}
     priority: {{issue.priority}}
   ```

10. **Permission Scheme**
   ```
   Role               Permissions
   ───────────────────────────────────────────
   Developer        Create/Edit/Comment/Transition
   Tech Lead        Admin/Create Board/Configure
   DevOps           Edit Workflows/Automation
   Security Team    View/Comment on Security Items
   Product Owner    Create Epics/Prioritize
   ```

11. **Integration Settings**
   ```yaml
   GitHub Integration:
     Repository: devresume-forge
     Smart Commits: Enabled
     Development Panel: Enabled
     Branch Creation: Enabled
     PR Status: Enabled

   Slack Integration:
     Channel: #devresume-updates
     Notifications:
       - New resume template added
       - Infrastructure changes
       - Build/deployment status
       - Security review needed
       - Production deployments

   AWS Integration:
     CloudWatch Alerts:
       - ECS/EKS service health
       - RDS performance
       - S3 bucket metrics
       - CloudFront distribution
     Deployment Status: Enabled
     Cost Alerts: Enabled
   ```

12. **Custom Issue Templates**
    ```yaml
    Template: Infrastructure Change
    Fields:
      - AWS Services: [Required]
      - Environment: [Required]
      - Security Review: Auto-set
      - Rollback Plan: [Required]
      - Cost Impact: [Required]
      - Downtime Expected: [Y/N]

    Template: Feature Implementation
    Fields:
      - User Story: [Required]
      - Acceptance Criteria: [Required]
      - Technical Design: [Optional]
      - Test Cases: [Required]
      - UI Mockups: [Optional]
    ```

### Implementation Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JIRA IMPLEMENTATION FLOW                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐   Creates    ┌──────────┐    Breaks Down    ┌─────────┐   │
│  │  Epic   ├─────────────►│  Story   ├────────────────►  │  Task   │   │
│  └─────────┘   DEV-E*     └──────────┘     DEV-*         └────┬────┘   │
│                                                               │         │
│                    Triggers Branch Creation                   │         │
│                            ┌─────────────────────────────────▼─────┐   │
│                            │  feature/DEV-123-implement-login      │   │
│                            └─────────────────────────┬─────────────┘   │
│                                                     │                   │
│  ┌───────────────────┐                             │                   │
│  │   Status Update   │◄────────────────────────────┘                   │
│  │   "In Progress"   │                                                 │
│  └────────┬──────────┘                                                 │
│           │                                                            │
│           │         ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                │
│           ▼         │     Commit Messages                              │
│    Development      │     "DEV-123: Add login form"                   │
│       Work          │     "DEV-123: Implement validation"             │
│           │         └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                │
│           ▼                                                            │
│  ┌───────────────────┐    Creates     ┌───────────────────┐           │
│  │   Pull Request    ├───────────────►│  Status Update    │           │
│  │DEV-123: Add Login │               │   "In Review"     │           │
│  └─────────┬─────────┘                └────────┬──────────┘           │
│            │                                   │                       │
│            │         ┌──────────────┐         │                       │
│            └────────►│ CI/CD Tests  │◄────────┘                       │
│                     └───────┬──────┘                                  │
│                             │                                         │
│                             ▼                                         │
│                    ┌─────────────────┐                               │
│            ┌──────►│  Merge to Dev   │                               │
│            │       └────────┬────────┘                               │
│            │                │                                         │
│  ┌─────────┴────────┐      ▼         ┌───────────────────┐          │
│  │   Status Update  │   Testing      │   Status Update   │          │
│  │    "Testing"     │◄──────────────►│ "Ready for Prod"  │          │
│  └─────────┬────────┘                └────────┬──────────┘          │
│            │                                  │                      │
│            │         ┌──────────────┐        │                      │
│            └────────►│Merge to Main │◄───────┘                      │
│                     └───────┬──────┘                                │
│                             │                                       │
│                             ▼                                       │
│                   ┌─────────────────┐                              │
│                   │  Status Update  │                              │
│                   │     "Done"      │                              │
│                   └─────────────────┘                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Project-Specific Workflows

1. **New Resume Template Workflow**
   ```
   Feature Branch: feature/DEV-401-modern-template
   │
   ├── Frontend Tasks
   │   ├── DEV-402: Create template component structure
   │   │   ├── Header component
   │   │   ├── Experience section
   │   │   ├── Skills grid
   │   │   └── Custom styling system
   │   │
   │   ├── DEV-403: Implement responsive design
   │   │   ├── Desktop layout
   │   │   ├── Tablet adjustments
   │   │   └── Mobile optimization
   │   │
   │   └── DEV-404: Add template preview
   │       ├── Thumbnail generation
   │       └── Live preview integration
   │
   ├── Backend Tasks
   │   ├── DEV-405: Template data model updates
   │   │   ├── Schema modifications
   │   │   └── Migration script
   │   │
   │   └── DEV-406: PDF generation updates
   │       ├── Template-specific styling
   │       └── Export optimization
   │
   └── Testing & Integration
       ├── DEV-407: Unit tests
       ├── DEV-408: Integration tests
       └── DEV-409: Browser compatibility
   ```

2. **Infrastructure Scaling Workflow**
   ```
   Epic: DEV-E5: Production Infrastructure Scaling
   │
   ├── ECS Development Environment
   │   ├── DEV-501: Configure Auto Scaling
   │   │   ├── CPU/Memory thresholds
   │   │   ├── Scaling policies
   │   │   └── CloudWatch alarms
   │   │
   │   └── DEV-502: Performance Monitoring
   │       ├── Container insights
   │       ├── Log aggregation
   │       └── Alert configuration
   │
   ├── EKS Production Environment
   │   ├── DEV-503: Node Group Configuration
   │   │   ├── Instance types
   │   │   ├── Spot instances
   │   │   └── Auto-scaling groups
   │   │
   │   ├── DEV-504: Pod Auto Scaling
   │   │   ├── HPA configuration
   │   │   ├── Resource quotas
   │   │   └── Pod disruption budgets
   │   │
   │   └── DEV-505: Cluster Monitoring
   │       ├── Prometheus setup
   │       ├── Grafana dashboards
   │       └── Alert rules
   │
   └── Database Optimization
       ├── DEV-506: RDS Scaling
       │   ├── Instance sizing
       │   ├── Read replicas
       │   └── Backup strategy
       │
       └── DEV-507: Performance Tuning
           ├── Index optimization
           ├── Query analysis
           └── Connection pooling
   ```

3. **User Authentication Enhancement**
   ```
   Epic: DEV-E6: Enhanced Authentication System
   │
   ├── Frontend Implementation
   │   ├── DEV-601: Auth UI Components
   │   │   ├── Login form
   │   │   ├── Registration form
   │   │   ├── Password reset
   │   │   └── Social login buttons
   │   │
   │   ├── DEV-602: Auth State Management
   │   │   ├── Context setup
   │   │   ├── Token handling
   │   │   └── Persistence
   │   │
   │   └── DEV-603: Protected Routes
   │       ├── Route guards
   │       ├── Role-based access
   │       └── Redirect logic
   │
   ├── Backend Implementation
   │   ├── DEV-604: JWT Authentication
   │   │   ├── Token generation
   │   │   ├── Validation middleware
   │   │   └── Refresh mechanism
   │   │
   │   ├── DEV-605: OAuth Integration
   │   │   ├── Google OAuth
   │   │   ├── GitHub OAuth
   │   │   └── LinkedIn OAuth
   │   │
   │   └── DEV-606: Security Enhancements
   │       ├── Rate limiting
   │       ├── Password policies
   │       └── Session management
   │
   └── Infrastructure Updates
       ├── DEV-607: Secrets Management
       │   ├── AWS Secrets Manager
       │   ├── OAuth credentials
       │   └── Rotation policy
       │
       └── DEV-608: Security Monitoring
           ├── Auth failure alerts
           ├── Suspicious activity
           └── Audit logging
   ```

4. **Resume Data Export/Import**
   ```
   Epic: DEV-E7: Resume Portability
   │
   ├── Data Format Implementation
   │   ├── DEV-701: JSON Schema
   │   │   ├── Core schema design
   │   │   ├── Validation rules
   │   │   └── Version control
   │   │
   │   └── DEV-702: Format Converters
   │       ├── LinkedIn parser
   │       ├── PDF extractor
   │       └── Plain text converter
   │
   ├── Frontend Features
   │   ├── DEV-703: Import Interface
   │   │   ├── File upload
   │   │   ├── Data preview
   │   │   └── Conflict resolution
   │   │
   │   ├── DEV-704: Export Options
   │   │   ├── Format selection
   │   │   ├── Section selection
   │   │   └── Batch export
   │   │
   │   └── DEV-705: Progress Tracking
   │       ├── Upload progress
   │       ├── Processing status
   │       └── Error handling
   │
   └── Backend Processing
       ├── DEV-706: Import Processing
       │   ├── Queue system
       │   ├── Data validation
       │   └── Error recovery
       │
       └── DEV-707: Export Generation
           ├── Format conversion
           ├── File compression
           └── Cleanup jobs
   ```

5. **Detailed Task Breakdown Example: PDF Export Service**
   ```
   Story: DEV-801: Implement PDF Export Service
   │
   ├── Backend Tasks
   │   ├── Setup PDF Generation (DEV-802)
   │   │   ├── Install dependencies
   │   │   │   ├── puppeteer for HTML to PDF
   │   │   │   └── pdf-lib for manipulation
   │   │   │
   │   │   ├── Create service structure
   │   │   │   ├── PDFService class
   │   │   │   └── Queue handler
   │   │   │
   │   │   └── Configure storage
   │   │       ├── S3 bucket setup
   │   │       └── Local temp storage
   │   │
   │   ├── Implement Generation Logic (DEV-803)
   │   │   ├── HTML template engine
   │   │   ├── CSS styling system
   │   │   ├── Dynamic content injection
   │   │   └── Error handling
   │   │
   │   └── Optimize Output (DEV-804)
   │       ├── Compression options
   │       ├── Quality settings
   │       └── File size limits
   │
   ├── Frontend Integration
   │   ├── Export UI (DEV-805)
   │   │   ├── Export button
   │   │   ├── Progress indicator
   │   │   └── Download handler
   │   │
   │   ├── Preview System (DEV-806)
   │   │   ├── Preview component
   │   │   ├── Zoom controls
   │   │   └── Page navigation
   │   │
   │   └── Error Handling (DEV-807)
   │       ├── Error messages
   │       ├── Retry mechanism
   │       └── Fallback options
   │
   └── Testing & Deployment
       ├── Unit Tests (DEV-808)
       │   ├── Generation tests
       │   ├── Format tests
       │   └── Error tests
       │
       ├── Integration Tests (DEV-809)
       │   ├── API endpoints
       │   ├── Storage integration
       │   └── Frontend integration
       │
       └── Performance Tests (DEV-810)
           ├── Load testing
           ├── Concurrent exports
           └── Resource usage
   ```