# 🚀 AWS Deployment Guide - DevResume Forge

Deploy your resume app to AWS using multiple strategies, from simple EC2 deployment to advanced EKS with CI/CD.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- Docker Desktop
- kubectl (for Kubernetes deployments)
- Terraform (optional, for Infrastructure as Code)

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Key, Region (us-east-1), Output format (json)

# Verify setup
aws sts get-caller-identity
```

---

## 🎯 Deployment Options Overview

| Method | Complexity | Cost | Scalability | Best For |
|--------|------------|------|-------------|----------|
| **EC2 + RDS** | ⭐ Easy | 💰 Low | ⭐⭐ Medium | Learning, prototypes |
| **ECS Fargate** | ⭐⭐ Medium | 💰💰 Medium | ⭐⭐⭐ High | Production apps |
| **EKS** | ⭐⭐⭐ Hard | 💰💰💰 High | ⭐⭐⭐⭐ Very High | Enterprise, microservices |
| **Lambda + S3** | ⭐⭐ Medium | 💰 Very Low | ⭐⭐⭐⭐ Auto | Serverless apps |

---

## 🚀 Option 1: Simple EC2 Deployment (Recommended for Beginners)

**Cost**: ~$20-50/month | **Setup Time**: 30 minutes

### Step 1: Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair --key-name devresume-key \
  --query 'KeyMaterial' --output text > devresume-key.pem
chmod 400 devresume-key.pem

# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name devresume-key \
  --security-groups default \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DevResume-Server}]'

# Get instance public IP
aws ec2 describe-instances --filters "Name=tag:Name,Values=DevResume-Server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

### Step 2: Configure Security Groups

```bash
# Get default security group ID
SECURITY_GROUP=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=default" --query 'SecurityGroups[0].GroupId' --output text)

# Allow HTTP, HTTPS, SSH
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 3000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 5000 --cidr 0.0.0.0/0
```

### Step 3: Set Up Application on EC2

```bash
# SSH into instance
ssh -i devresume-key.pem ec2-user@YOUR_INSTANCE_IP

# Install dependencies
sudo yum update -y
sudo yum install -y git docker

# Install Node.js 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo <<EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Clone and setup application
git clone https://github.com/yourusername/devresume-forge.git
cd devresume-forge

# Setup backend
cd backend
npm install
npm install -g pm2

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume_app_prod
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Start backend with PM2
pm2 start src/server.js --name "devresume-backend"
pm2 startup
pm2 save

# Setup frontend
cd ../frontend
npm install
npm run build

# Install and configure Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx
sudo tee /etc/nginx/conf.d/devresume.conf << EOF
server {
    listen 80;
    server_name YOUR_INSTANCE_IP;
    
    location / {
        root /home/ec2-user/devresume-forge/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Set Up Domain and SSL (Optional)

```bash
# Install Certbot for SSL
sudo yum install -y python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

**✅ Your app is now live at: `http://YOUR_INSTANCE_IP`**

---

## 🐳 Option 2: ECS Fargate Deployment (Production Ready)

**Cost**: ~$50-100/month | **Setup Time**: 1-2 hours

### Step 1: Push Images to ECR

```bash
# Create ECR repositories
aws ecr create-repository --repository-name devresume-frontend
aws ecr create-repository --repository-name devresume-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
cd frontend
docker build -t devresume-frontend .
docker tag devresume-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-frontend:latest

# Build and push backend
cd ../backend
docker build -t devresume-backend .
docker tag devresume-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-backend:latest
```

### Step 2: Set Up DocumentDB (MongoDB-compatible)

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier devresume-docdb \
  --engine docdb \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --vpc-security-group-ids sg-xxxxxxxxx

# Create DocumentDB instance
aws docdb create-db-instance \
  --db-instance-identifier devresume-docdb-instance \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier devresume-docdb
```

### Step 3: Create ECS Infrastructure

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name devresume-cluster

# Create task execution role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### Step 4: Create ECS Task Definitions

Create `task-definition-backend.json`:
```json
{
  "family": "devresume-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "MONGODB_URI", "value": "mongodb://admin:YourSecurePassword123!@devresume-docdb.cluster-xxxxxxxxx.us-east-1.docdb.amazonaws.com:27017/?retryWrites=false"},
        {"name": "JWT_SECRET", "value": "your-jwt-secret"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/devresume-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Create `task-definition-frontend.json`:
```json
{
  "family": "devresume-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devresume-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/devresume-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 5: Deploy ECS Services

```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-frontend.json

# Create services
aws ecs create-service \
  --cluster devresume-cluster \
  --service-name devresume-backend-service \
  --task-definition devresume-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}"

aws ecs create-service \
  --cluster devresume-cluster \
  --service-name devresume-frontend-service \
  --task-definition devresume-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}"
```

### Step 6: Set Up Application Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name devresume-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx

# Create target groups
aws elbv2 create-target-group \
  --name devresume-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip

aws elbv2 create-target-group \
  --name devresume-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:loadbalancer/app/devresume-alb/xxxxxxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/devresume-frontend-tg/xxxxxxxxx
```

**✅ Your app is now live at: `http://YOUR_LOAD_BALANCER_DNS`**

---

## ☸️ Option 3: EKS Deployment (Advanced)

**Cost**: ~$100-200/month | **Setup Time**: 2-4 hours

### Step 1: Create EKS Cluster

```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create EKS cluster
eksctl create cluster \
  --name devresume-cluster \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name devresume-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name devresume-cluster
```

### Step 2: Deploy MongoDB to EKS

```bash
# Install MongoDB using Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install mongodb bitnami/mongodb \
  --set auth.rootPassword=secretpassword \
  --set persistence.size=10Gi
```

### Step 3: Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/production/

# Check deployments
kubectl get pods
kubectl get services

# Get LoadBalancer URL
kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

**✅ Your app is now live at: `http://YOUR_ELB_HOSTNAME`**

---

## 🌐 Option 4: Serverless Deployment (Cost-Effective)

**Cost**: ~$5-20/month | **Setup Time**: 1-2 hours

### Step 1: Deploy Frontend to S3 + CloudFront

```bash
# Create S3 bucket for static hosting
aws s3 mb s3://devresume-frontend-$(date +%s)
BUCKET_NAME=$(aws s3 ls | grep devresume-frontend | awk '{print $3}')

# Configure bucket for static hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Build and upload frontend
cd frontend
npm run build
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Step 2: Deploy Backend to Lambda

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml in backend directory
cd backend
cat > serverless.yml << EOF
service: devresume-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
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

# Create Lambda handler
cat > lambda.js << EOF
const serverless = require('serverless-http');
const app = require('./src/server');

module.exports.handler = serverless(app);
EOF

# Deploy to Lambda
npm install serverless-http
serverless deploy
```

### Step 3: Set Up MongoDB Atlas

```bash
# Sign up for MongoDB Atlas (free tier)
# Create cluster and get connection string
# Update environment variables with Atlas connection string
```

**✅ Your serverless app is now live!**

---

## 🔄 CI/CD Pipeline for AWS

### Step 1: Update GitHub Actions for AWS

Create `.github/workflows/aws-deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push frontend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: devresume-frontend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Build and push backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: devresume-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster devresume-cluster --service devresume-frontend-service --force-new-deployment
        aws ecs update-service --cluster devresume-cluster --service devresume-backend-service --force-new-deployment
```

### Step 2: Set GitHub Secrets

Add these secrets in your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`

---

## 📊 Cost Optimization

### Monthly Cost Estimates:

1. **EC2 + RDS**: $20-50
   - t3.medium EC2: ~$30
   - RDS t3.micro: ~$20

2. **ECS Fargate**: $50-100
   - Fargate vCPU/Memory: ~$50
   - DocumentDB: ~$50

3. **EKS**: $100-200
   - EKS cluster: $72
   - EC2 worker nodes: ~$60
   - Load balancers: ~$20

4. **Serverless**: $5-20
   - Lambda: ~$5
   - S3 + CloudFront: ~$5
   - MongoDB Atlas: ~$10

### Cost Optimization Tips:

```bash
# Use Spot Instances for non-production
aws ec2 request-spot-instances --spot-price "0.05" --instance-count 1

# Set up auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/devresume-cluster/devresume-frontend-service \
  --min-capacity 1 \
  --max-capacity 10

# Use reserved instances for production
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --instance-count 1
```

---

## 🔒 Security Best Practices

### 1. Enable VPC and Security Groups

```bash
# Create custom VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=DevResume-VPC}]'

# Create private subnets for database
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1a
```

### 2. Set Up WAF and Shield

```bash
# Create WAF for application protection
aws wafv2 create-web-acl \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --name DevResume-WAF
```

### 3. Enable CloudTrail and GuardDuty

```bash
# Enable CloudTrail for auditing
aws cloudtrail create-trail --name DevResume-Trail --s3-bucket-name devresume-cloudtrail-logs

# Enable GuardDuty for threat detection
aws guardduty create-detector --enable
```

---

## 📈 Monitoring and Logging

### Set Up CloudWatch

```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "DevResume-Dashboard" \
  --dashboard-body file://dashboard.json

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "DevResume-HighCPU" \
  --alarm-description "Alarm when CPU exceeds 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold
```

### Set Up X-Ray Tracing

```bash
# Enable X-Ray tracing in your application
npm install aws-xray-sdk-core aws-xray-sdk-express
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **ECS Tasks Keep Stopping**
   ```bash
   aws ecs describe-tasks --cluster devresume-cluster --tasks TASK_ARN
   aws logs describe-log-groups
   aws logs get-log-events --log-group-name /ecs/devresume-backend
   ```

2. **Database Connection Issues**
   ```bash
   # Test DocumentDB connection
   mongo --ssl --host devresume-docdb.cluster-xxxxxxxxx.us-east-1.docdb.amazonaws.com:27017 \
     --sslCAFile rds-combined-ca-bundle.pem --username admin --password
   ```

3. **Load Balancer Health Checks Failing**
   ```bash
   aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...
   ```

4. **High Costs**
   ```bash
   # Check AWS Cost Explorer
   aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY
   ```

---

## 🎯 Next Steps

After deployment:

1. **Set up monitoring alerts**
2. **Configure backup strategies**
3. **Implement blue-green deployments**
4. **Set up disaster recovery**
5. **Optimize performance with CDN**
6. **Implement security scanning**

---

**🎉 Congratulations! Your DevResume Forge is now live on AWS!**

Choose the deployment option that best fits your needs and budget. Start with EC2 for learning, then progress to ECS/EKS for production workloads. 