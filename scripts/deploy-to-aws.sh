#!/bin/bash

# 🚀 DevResume Forge - AWS Deployment Script
# This script automates the deployment of your resume app to AWS
# Usage: ./scripts/deploy-to-aws.sh [ec2|ecs|eks|serverless]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_TYPE=${1:-ec2}
REGION=${AWS_REGION:-us-east-1}
KEY_NAME="devresume-key"
APP_NAME="devresume-forge"

echo -e "${BLUE}🚀 DevResume Forge AWS Deployment${NC}"
echo -e "${BLUE}Deployment Type: ${DEPLOYMENT_TYPE}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI v2${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure'${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker Desktop${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Get AWS Account ID
get_account_id() {
    ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
    echo -e "${GREEN}AWS Account ID: ${ACCOUNT_ID}${NC}"
}

# Deploy to EC2
deploy_ec2() {
    echo -e "${YELLOW}🔧 Deploying to EC2...${NC}"
    
    # Create key pair if it doesn't exist
    if ! aws ec2 describe-key-pairs --key-names $KEY_NAME &> /dev/null; then
        echo "Creating key pair..."
        aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > ${KEY_NAME}.pem
        chmod 400 ${KEY_NAME}.pem
        echo -e "${GREEN}✅ Key pair created: ${KEY_NAME}.pem${NC}"
    fi
    
    # Launch EC2 instance
    echo "Launching EC2 instance..."
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id ami-0c02fb55956c7d316 \
        --count 1 \
        --instance-type t3.medium \
        --key-name $KEY_NAME \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${APP_NAME}-server}]" \
        --query 'Instances[0].InstanceId' --output text)
    
    echo -e "${GREEN}✅ Instance launched: ${INSTANCE_ID}${NC}"
    
    # Wait for instance to be running
    echo "Waiting for instance to be running..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    
    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
    
    # Configure security group
    SECURITY_GROUP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text)
    
    echo "Configuring security group..."
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 22 --cidr 0.0.0.0/0 2>/dev/null || true
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null || true
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 443 --cidr 0.0.0.0/0 2>/dev/null || true
    
    echo -e "${GREEN}✅ EC2 Deployment Complete!${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "1. SSH into your instance: ${YELLOW}ssh -i ${KEY_NAME}.pem ec2-user@${PUBLIC_IP}${NC}"
    echo -e "2. Follow the setup instructions in the AWS Deployment Guide"
    echo -e "3. Your app will be available at: ${YELLOW}http://${PUBLIC_IP}${NC}"
}

# Deploy to ECS
deploy_ecs() {
    echo -e "${YELLOW}🐳 Deploying to ECS Fargate...${NC}"
    
    # Create ECR repositories
    echo "Creating ECR repositories..."
    aws ecr create-repository --repository-name ${APP_NAME}-frontend 2>/dev/null || true
    aws ecr create-repository --repository-name ${APP_NAME}-backend 2>/dev/null || true
    
    # Get ECR login
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com
    
    # Build and push images
    echo "Building and pushing frontend image..."
    cd frontend
    docker build -t ${APP_NAME}-frontend .
    docker tag ${APP_NAME}-frontend:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-frontend:latest
    docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-frontend:latest
    
    echo "Building and pushing backend image..."
    cd ../backend
    docker build -t ${APP_NAME}-backend .
    docker tag ${APP_NAME}-backend:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-backend:latest
    docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-backend:latest
    
    cd ..
    
    # Create ECS cluster
    echo "Creating ECS cluster..."
    aws ecs create-cluster --cluster-name ${APP_NAME}-cluster 2>/dev/null || true
    
    echo -e "${GREEN}✅ ECS Setup Complete!${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "1. Configure task definitions and services using the AWS Deployment Guide"
    echo -e "2. Set up Application Load Balancer"
    echo -e "3. Deploy your services"
}

# Deploy to EKS
deploy_eks() {
    echo -e "${YELLOW}☸️ Deploying to EKS...${NC}"
    
    # Check if eksctl is installed
    if ! command -v eksctl &> /dev/null; then
        echo "Installing eksctl..."
        curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
        sudo mv /tmp/eksctl /usr/local/bin
    fi
    
    # Create EKS cluster
    echo "Creating EKS cluster (this may take 15-20 minutes)..."
    eksctl create cluster \
        --name ${APP_NAME}-cluster \
        --version 1.28 \
        --region $REGION \
        --nodegroup-name ${APP_NAME}-nodes \
        --node-type t3.medium \
        --nodes 2 \
        --nodes-min 1 \
        --nodes-max 4 \
        --managed
    
    # Update kubeconfig
    aws eks update-kubeconfig --region $REGION --name ${APP_NAME}-cluster
    
    echo -e "${GREEN}✅ EKS Cluster Created!${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "1. Deploy applications using: ${YELLOW}kubectl apply -f k8s/production/${NC}"
    echo -e "2. Check status: ${YELLOW}kubectl get pods${NC}"
}

# Deploy Serverless
deploy_serverless() {
    echo -e "${YELLOW}⚡ Deploying Serverless...${NC}"
    
    # Install Serverless Framework
    if ! command -v serverless &> /dev/null; then
        echo "Installing Serverless Framework..."
        npm install -g serverless
    fi
    
    # Create S3 bucket for frontend
    BUCKET_NAME="${APP_NAME}-frontend-$(date +%s)"
    aws s3 mb s3://$BUCKET_NAME
    
    # Configure bucket for static hosting
    aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html
    
    # Build and upload frontend
    echo "Building and uploading frontend..."
    cd frontend
    npm run build
    aws s3 sync build/ s3://$BUCKET_NAME --delete
    cd ..
    
    # Deploy backend to Lambda
    echo "Deploying backend to Lambda..."
    cd backend
    
    # Create serverless.yml if it doesn't exist
    if [ ! -f serverless.yml ]; then
        cat > serverless.yml << EOF
service: ${APP_NAME}-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: ${REGION}
  environment:
    MONGODB_URI: \${env:MONGODB_URI}
    JWT_SECRET: \${env:JWT_SECRET}

functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
EOF
    fi
    
    # Create Lambda handler if it doesn't exist
    if [ ! -f lambda.js ]; then
        cat > lambda.js << EOF
const serverless = require('serverless-http');
const app = require('./src/server');

module.exports.handler = serverless(app);
EOF
    fi
    
    npm install serverless-http
    serverless deploy
    
    cd ..
    
    echo -e "${GREEN}✅ Serverless Deployment Complete!${NC}"
    echo -e "${BLUE}📋 Your App URLs:${NC}"
    echo -e "Frontend: ${YELLOW}http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com${NC}"
    echo -e "Backend API: Check the serverless deploy output for the API Gateway URL"
}

# Main deployment function
main() {
    check_prerequisites
    get_account_id
    
    case $DEPLOYMENT_TYPE in
        ec2)
            deploy_ec2
            ;;
        ecs)
            deploy_ecs
            ;;
        eks)
            deploy_eks
            ;;
        serverless)
            deploy_serverless
            ;;
        *)
            echo -e "${RED}❌ Invalid deployment type: $DEPLOYMENT_TYPE${NC}"
            echo -e "${YELLOW}Usage: $0 [ec2|ecs|eks|serverless]${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment process initiated!${NC}"
    echo -e "${BLUE}📖 For detailed instructions, see: AWS-DEPLOYMENT-GUIDE.md${NC}"
    echo -e "${BLUE}💰 Monitor costs: https://console.aws.amazon.com/billing/${NC}"
    echo -e "${BLUE}📊 View resources: https://console.aws.amazon.com/${NC}"
}

# Help function
show_help() {
    echo -e "${BLUE}🚀 DevResume Forge AWS Deployment Script${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [DEPLOYMENT_TYPE]"
    echo ""
    echo -e "${YELLOW}Deployment Types:${NC}"
    echo "  ec2        - Simple EC2 deployment (~$20-50/month)"
    echo "  ecs        - ECS Fargate deployment (~$50-100/month)"
    echo "  eks        - EKS Kubernetes deployment (~$100-200/month)"
    echo "  serverless - Lambda + S3 deployment (~$5-20/month)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 ec2        # Deploy to EC2 (beginner-friendly)"
    echo "  $0 ecs        # Deploy to ECS Fargate (production-ready)"
    echo "  $0 eks        # Deploy to EKS (advanced)"
    echo "  $0 serverless # Deploy serverless (cost-effective)"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "  - AWS CLI v2 configured"
    echo "  - Docker Desktop"
    echo "  - Appropriate AWS permissions"
    echo ""
    echo -e "${BLUE}For detailed guides, see: AWS-DEPLOYMENT-GUIDE.md${NC}"
}

# Handle help flag
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main 