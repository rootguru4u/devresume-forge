# 🚀 CI/CD Practice Guide - DevResume Forge

## 📋 Overview
This guide will walk you through practicing **Continuous Integration** and **Continuous Deployment** using the DevResume Forge application. You'll learn industry-standard practices with real tools and workflows.

## 🎯 Learning Objectives
- ✅ Set up automated CI/CD pipelines with GitHub Actions
- ✅ Practice Docker containerization and multi-stage builds
- ✅ Deploy to Kubernetes with different strategies
- ✅ Implement monitoring, security scanning, and quality gates
- ✅ Practice GitOps workflows and environment promotion
- ✅ Learn rollback and disaster recovery procedures

---

## 🏗️ Setup Phase

### 1. Repository Setup
```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit: DevResume Forge CI/CD setup"

# Create GitHub repository and push
gh repo create devresume-forge --public
git remote add origin https://github.com/yourusername/devresume-forge.git
git branch -M main
git push -u origin main
```

### 2. Create Development Branch
```bash
# Create and switch to develop branch
git checkout -b develop
git push -u origin develop

# Set up branch protection rules in GitHub:
# - Require pull request reviews
# - Require status checks to pass
# - Require branches to be up to date
```

### 3. Environment Setup
```bash
# Local development with Docker Compose
docker-compose up -d

# Access services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - MongoDB Admin: http://localhost:8081
```

---

## 🔄 CI/CD Pipeline Stages

### Phase 1: Basic CI Pipeline

#### **Trigger**: Every push and pull request
```yaml
# .github/workflows/ci.yml is already configured with:
✅ Linting (ESLint, Prettier)
✅ Unit Tests (Jest)
✅ Integration Tests
✅ Security Scanning (Trivy)
✅ Code Quality (SonarCloud)
✅ Docker Image Builds
```

#### **Practice Tasks**:
1. **Create a feature branch and make changes**:
   ```bash
   git checkout -b feature/add-dark-mode
   # Make some changes to the frontend
   git add .
   git commit -m "Add dark mode toggle"
   git push origin feature/add-dark-mode
   ```

2. **Create Pull Request** - Watch CI pipeline run automatically

3. **Fix any failing tests** - Practice debugging CI failures

### Phase 2: Multi-Environment CD

#### **Environments**:
- **Staging**: Auto-deploy from `develop` branch
- **Production**: Auto-deploy from `main` branch
- **Feature**: Deploy manually for testing

#### **Practice Deployment Strategies**:

1. **Rolling Deployment** (Staging):
   ```bash
   # Push to develop triggers staging deployment
   git checkout develop
   git merge feature/add-dark-mode
   git push origin develop
   ```

2. **Blue-Green Deployment** (Production):
   ```bash
   # Create release branch
   git checkout -b release/v1.1.0
   git push origin release/v1.1.0
   
   # Merge to main for production deployment
   git checkout main
   git merge release/v1.1.0
   git tag v1.1.0
   git push origin main --tags
   ```

3. **Manual Deployment**:
   ```bash
   # Trigger manual deployment via GitHub Actions
   gh workflow run cd.yml -f environment=staging -f version=v1.1.0
   ```

### Phase 3: Advanced CI/CD Practices

#### **A. Infrastructure as Code**
```bash
# Deploy with Kubernetes manifests
kubectl apply -f k8s/staging/

# Or use Helm
helm install devresume-forge helm/devresume-forge \
  --namespace staging \
  --values helm/devresume-forge/values-staging.yaml
```

#### **B. GitOps Workflow**
```bash
# Create GitOps repository for deployment configs
git clone https://github.com/yourusername/devresume-forge-gitops
cd devresume-forge-gitops

# Update image tags for new deployment
sed -i 's/image: .*/image: ghcr.io\/yourusername\/devresume-forge\/frontend:v1.1.0/' staging/frontend.yaml
git commit -am "Update staging frontend to v1.1.0"
git push origin main
```

#### **C. Database Migrations**
```bash
# Run database migrations
kubectl apply -f k8s/jobs/migration-job.yaml
kubectl logs job/db-migration -f
```

---

## 🧪 Testing Strategies

### 1. Unit Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test
```

### 2. Integration Tests
```bash
# Run with Docker Compose
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### 3. End-to-End Tests
```bash
# Install dependencies
npm install -g cypress

# Run E2E tests
cd tests/e2e && npm run test:e2e
```

### 4. Performance Tests
```bash
# Load testing with k6
k6 run tests/performance/load-test.js
```

---

## 🔒 Security Practices

### 1. Dependency Scanning
```bash
# Automated in CI pipeline
npm audit --audit-level=high
```

### 2. Container Security
```bash
# Scan Docker images
trivy image ghcr.io/yourusername/devresume-forge/frontend:latest
```

### 3. Secret Management
```bash
# GitHub Secrets required:
GITHUB_TOKEN         # For container registry
KUBE_CONFIG_DATA     # Kubernetes config (base64 encoded)
SONAR_TOKEN         # SonarCloud integration
SLACK_WEBHOOK       # Notifications
JWT_SECRET          # Application secrets
MONGO_PASSWORD      # Database password
```

---

## 📊 Monitoring & Observability

### 1. Application Monitoring
```bash
# Start monitoring stack
docker-compose --profile monitoring up -d

# Access dashboards:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001
```

### 2. Log Aggregation
```bash
# View application logs
kubectl logs -f deployment/backend-staging -n staging

# Aggregate logs with fluentd/elasticsearch (advanced)
```

### 3. Health Checks
```bash
# Application health
curl http://localhost:5000/api/health

# Kubernetes health
kubectl get pods -n staging
```

---

## 🎯 Practice Scenarios

### Scenario 1: Hotfix Deployment
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug-fix

# 2. Make fix and commit
git commit -m "Fix critical security vulnerability"

# 3. Fast-track to production
git checkout main
git merge hotfix/critical-bug-fix
git tag v1.1.1
git push origin main --tags
```

### Scenario 2: Rollback Deployment
```bash
# Manual rollback via GitHub Actions
gh workflow run cd.yml -f environment=production -f action=rollback

# Or via Kubernetes
kubectl rollout undo deployment/frontend-prod -n production
```

### Scenario 3: Feature Flag Deployment
```bash
# Deploy with feature flags
helm upgrade devresume-forge helm/devresume-forge \
  --set featureFlags.darkMode=false \
  --set featureFlags.newEditor=true
```

### Scenario 4: Canary Deployment
```bash
# Deploy to subset of users
kubectl apply -f k8s/canary/frontend-canary.yaml

# Monitor metrics and gradually increase traffic
```

---

## 🏆 Advanced Challenges

### Challenge 1: Multi-Cloud Deployment
- Deploy to AWS EKS and Google GKE
- Implement cross-cloud load balancing
- Practice disaster recovery

### Challenge 2: Microservices Migration
- Break monolith into microservices
- Implement service mesh (Istio)
- Practice distributed tracing

### Challenge 3: Compliance & Governance
- Implement policy-as-code (OPA Gatekeeper)
- Add compliance scanning
- Implement audit logging

### Challenge 4: Cost Optimization
- Implement auto-scaling (HPA/VPA)
- Add resource quotas
- Monitor and optimize costs

---

## 📚 Learning Resources

### Books
- "Continuous Delivery" by Jez Humble
- "The DevOps Handbook" by Gene Kim
- "Kubernetes in Action" by Marko Lukša

### Courses
- GitHub Actions Certification
- Kubernetes Administrator (CKA)
- Docker Certified Associate (DCA)

### Tools to Master
- **CI/CD**: GitHub Actions, Jenkins, GitLab CI
- **Containers**: Docker, Podman, Buildah
- **Orchestration**: Kubernetes, Docker Swarm
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Security**: Trivy, OWASP ZAP, SonarQube

---

## 🎉 Success Metrics

Track your progress with these metrics:

- ✅ **Lead Time**: Time from commit to production
- ✅ **Deployment Frequency**: How often you deploy
- ✅ **Mean Time to Recovery**: How fast you fix issues
- ✅ **Change Failure Rate**: Percentage of failed deployments

### Example Metrics Dashboard
```bash
# Deploy metrics collection
kubectl apply -f monitoring/metrics-collection.yaml

# View in Grafana at http://localhost:3001
# Default login: admin/admin
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Docker Build Failures
```bash
# Clear Docker cache
docker system prune -af

# Rebuild with no cache
docker build --no-cache .
```

### Issue 2: Kubernetes Pod CrashLoopBackOff
```bash
# Check logs
kubectl logs pod-name -n namespace

# Check events
kubectl describe pod pod-name -n namespace
```

### Issue 3: CI Pipeline Timeouts
```bash
# Optimize Docker layers
# Use multi-stage builds
# Cache dependencies
```

---

## 🎁 Next Steps

1. **Fork this repository** and start practicing
2. **Join communities**: DevOps Discord, Reddit r/devops
3. **Get certified**: Start with GitHub Actions certification
4. **Build portfolio**: Document your CI/CD projects
5. **Contribute**: Help improve this practice environment

---

## 🤝 Contributing

Found improvements? Create a pull request!

```bash
git checkout -b improvement/better-monitoring
# Make improvements
git commit -m "Add better monitoring setup"
git push origin improvement/better-monitoring
# Create pull request
```

---

**Happy CI/CD practicing! 🚀**

*Remember: The best way to learn CI/CD is by doing. Break things, fix them, and iterate!* 