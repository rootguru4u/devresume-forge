# DevResume-Forge

A modern Resume Builder web application with full CI/CD pipeline support, designed for learning full-stack development and DevOps practices.

## 🚀 Quick Start CI/CD Practice

**Your React app is already running on http://localhost:3000!** 

Ready to practice CI/CD? Jump to these sections:
- 📋 [**CI/CD Practice - Quick Start**](#-cicd-practice---quick-start) - Start practicing immediately
- 📖 [**DevOps Implementation Guide**](./DEVOPS-IMPLEMENTATION-GUIDE.md) - Complete implementation guide
- 🐳 [**Docker Commands**](#-docker-practice) - Container practice
- ☸️ [**Kubernetes Commands**](#️-kubernetes-practice) - Orchestration practice

### 30-Second Setup
```bash
git init && git add . && git commit -m "Initial commit"
gh repo create devresume-forge --public
git remote add origin https://github.com/yourusername/devresume-forge.git
git push -u origin main
# ✨ CI/CD pipeline is now active!
```

### 🚀 Deploy to AWS in One Command
```bash
# Quick EC2 deployment (recommended for beginners)
./scripts/deploy-to-aws.sh ec2

# Or choose your deployment type:
./scripts/deploy-to-aws.sh [ec2|ecs|eks|serverless]
./scripts/deploy-to-aws.sh --help  # See all options
```

### ✅ Current Status
- 🚀 **Frontend**: Running on http://localhost:3000
- 🔧 **Backend**: Ready to start (run `cd backend && npm start`)
- 🐳 **Docker**: Ready for containerization
- ⚙️ **CI/CD**: GitHub Actions workflows configured
- ☸️ **Kubernetes**: Manifests ready for deployment
- 📊 **Monitoring**: Prometheus & Grafana configured
- ☁️ **AWS**: Ready for EC2, ECS, EKS, or Serverless deployment

## 🏗️ Architecture

- **Frontend**: React with Tailwind CSS (resume builder interface with live preview)
- **Backend**: Node.js + Express (REST API for resume management)
- **Database**: MongoDB (resume data storage)
- **Storage**: Local file system or cloud-compatible (PDF export)
- **CI/CD**: GitHub Actions workflows
- **Deployment**: Kubernetes with optional Helm support

## 📁 Project Structure

```
resume_app/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/           # MongoDB schemas
│   │   ├── middleware/       # Authentication, validation
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (PDF generation)
│   │   ├── utils/            # Helper functions
│   │   └── server.js         # Entry point
│   ├── tests/                # Backend tests
│   ├── uploads/              # Temporary file storage
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Helper functions
│   │   └── styles/           # Tailwind styles
│   ├── public/
│   ├── tests/                # Frontend tests
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── k8s/                       # Kubernetes manifests
│   ├── backend/
│   ├── frontend/
│   ├── mongodb/
│   └── ingress/
├── helm/                      # Helm charts (optional)
│   └── devresume-forge/
├── .github/                   # GitHub Actions workflows
│   └── workflows/
├── docker-compose.yml         # Local development
├── docker-compose.prod.yml    # Production setup
└── README.md
```

## 🚀 Features

### Core Features
- **Resume Builder**: Interactive form-based resume creation
- **Live Preview**: Real-time preview of resume as you type
- **PDF Export**: High-quality PDF generation and download
- **Data Persistence**: Save and load resumes from MongoDB
- **Responsive Design**: Works on desktop, tablet, and mobile

### Resume Sections
- Personal Information (name, contact, photo)
- Professional Summary
- Work Experience
- Education
- Skills (with proficiency levels)
- Projects
- Certifications
- Custom Sections

### Technical Features
- **Authentication**: Simple JWT-based user authentication
- **Real-time Updates**: Live preview updates as you edit
- **Template System**: Multiple resume templates (expandable)
- **Export Options**: PDF download with custom styling
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Graceful error handling and user feedback

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Git

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo>
   cd resume_app
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm start
   ```

4. **Setup Database** (using Docker):
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

### Using Docker Compose (Recommended)

```bash
# Development environment
docker-compose up --build

# Production environment
docker-compose -f docker-compose.prod.yml up --build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
npm run test:watch
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
npm run test:e2e
```

### Integration Tests
```bash
# Run all tests
npm run test:all

# Run with Docker
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🚢 Deployment

### Local Kubernetes (Minikube/Kind)

1. **Start your cluster**:
   ```bash
   minikube start
   # or
   kind create cluster
   ```

2. **Deploy MongoDB**:
   ```bash
   kubectl apply -f k8s/mongodb/
   ```

3. **Deploy Backend**:
   ```bash
   kubectl apply -f k8s/backend/
   ```

4. **Deploy Frontend**:
   ```bash
   kubectl apply -f k8s/frontend/
   ```

5. **Setup Ingress**:
   ```bash
   kubectl apply -f k8s/ingress/
   ```

### Using Helm

```bash
# Install
helm install devresume-forge ./helm/devresume-forge

# Upgrade
helm upgrade devresume-forge ./helm/devresume-forge

# Uninstall
helm uninstall devresume-forge
```

### Cloud Deployment

The application is configured to deploy to major cloud providers:

- **AWS**: EKS with ALB Ingress
- **Google Cloud**: GKE with Cloud Load Balancer
- **Azure**: AKS with Application Gateway

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **CI Pipeline** (`ci.yml`):
   - Triggered on push and pull requests
   - Runs linting, testing, and security scans
   - Builds and tests Docker images
   - Runs integration tests

2. **CD Pipeline** (`cd.yml`):
   - Triggered on merge to `main` or `release/*`
   - Builds production Docker images
   - Pushes to container registry
   - Deploys to Kubernetes cluster
   - Sends notifications

3. **Security Pipeline** (`security.yml`):
   - Dependency vulnerability scanning
   - Container image security scanning
   - Code quality analysis

### Manual Deployment

```bash
# Build images
docker build -t devresume-forge/backend ./backend
docker build -t devresume-forge/frontend ./frontend

# Push to registry
docker push devresume-forge/backend
docker push devresume-forge/frontend

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Resume Management
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get specific resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Export
- `POST /api/resumes/:id/export/pdf` - Export resume as PDF
- `GET /api/resumes/:id/preview` - Get resume preview

### System
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed system status

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devresume
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
PDF_STORAGE_PATH=./uploads
PUPPETEER_EXECUTABLE_PATH=
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_APP_NAME=DevResume Forge
REACT_APP_ENABLE_ANALYTICS=false
```

## 📊 Monitoring

- **Application Logs**: Winston logging with multiple transports
- **Health Checks**: Kubernetes liveness and readiness probes
- **Metrics**: Custom metrics for resume creation and exports
- **Alerts**: Slack/Discord notifications for deployment status

## 🔒 Security

- **Authentication**: JWT-based with refresh tokens
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Express rate limiting middleware
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet.js security middleware
- **File Upload**: Secure file handling with type validation

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first approach
- **Real-time Preview**: Live resume preview as you edit
- **Form Validation**: Client-side and server-side validation
- **Auto-save**: Automatic saving of form data
- **Template Selection**: Multiple resume templates
- **Export Options**: PDF export with custom styling
- **Accessibility**: WCAG 2.1 AA compliant

## 📱 Supported Resume Templates

1. **Professional**: Clean, ATS-friendly layout
2. **Creative**: Modern design with colors and graphics
3. **Academic**: Focused on education and research
4. **Technical**: Optimized for software engineers
5. **Executive**: Senior-level professional template

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure CI pipeline passes

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 CI/CD Practice - Quick Start

This project is designed as a **complete CI/CD learning environment**. Follow these steps to practice real-world DevOps workflows:

### 📋 Prerequisites
- Git and GitHub account
- Docker Desktop
- Node.js 18+ (for local development)
- kubectl (for Kubernetes practice)

### 🎯 Immediate Practice Tasks

#### **1. Start Local Development** ✅ Ready Now!
```bash
# Your React app is already running on http://localhost:3000
# Start the full stack:

# Option A: Node.js development
cd backend && npm install && npm start    # Backend on :5000
cd frontend && npm start                  # Frontend on :3000

# Option B: Docker development
docker-compose up -d                      # Full stack with MongoDB
```

#### **2. Set Up CI/CD Pipeline** (5 minutes)
```bash
# Initialize Git and push to GitHub
git init
git add .
git commit -m "Initial commit: DevResume Forge CI/CD setup"

# Create GitHub repository
gh repo create devresume-forge --public
git remote add origin https://github.com/yourusername/devresume-forge.git
git branch -M main
git push -u origin main

# ✨ CI/CD pipeline automatically activates on push!
```

#### **3. Practice Feature Development Workflow**
```bash
# Create feature branch
git checkout -b feature/add-dark-mode

# Make changes (try editing src/pages/LandingPage.js)
# Add a dark mode toggle button

# Commit and push
git add .
git commit -m "Add dark mode toggle feature"
git push origin feature/add-dark-mode

# Create Pull Request on GitHub
# ✅ Watch CI pipeline run automatically:
#   - ESLint checks
#   - Unit tests
#   - Security scans
#   - Docker builds
```

#### **4. Deploy to Staging**
```bash
# Merge to develop for staging deployment
git checkout develop
git merge feature/add-dark-mode
git push origin develop

# ✅ Automatic staging deployment triggers
```

#### **5. Production Deployment**
```bash
# Release to production
git checkout main
git merge develop
git tag v1.0.1
git push origin main --tags

# ✅ Blue-green production deployment runs
```

### 🧪 Testing Practice

#### **Frontend Testing**
```bash
cd frontend
npm test                    # Unit tests
npm run test:coverage      # Coverage report
npm run lint               # ESLint check
```

#### **Backend Testing**
```bash
cd backend
npm test                   # API tests
npm run test:integration   # Integration tests
npm run lint               # ESLint check
```

#### **E2E Testing**
```bash
# Full application testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### 🐳 Docker Practice

#### **Development Environment**
```bash
# Hot-reload development
docker-compose up -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

#### **Production Builds**
```bash
# Build production images
docker build -t devresume-forge-frontend ./frontend
docker build -t devresume-forge-backend ./backend

# Run production stack
docker-compose -f docker-compose.prod.yml up -d
```

#### **Image Optimization Practice**
```bash
# Analyze image sizes
docker images | grep devresume-forge

# Security scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image devresume-forge-frontend:latest
```

### ☸️ Kubernetes Practice

#### **Local Kubernetes**
```bash
# Enable Kubernetes in Docker Desktop or use minikube
minikube start

# Deploy to staging
kubectl apply -f k8s/staging/

# Check deployments
kubectl get pods -n staging
kubectl logs -f deployment/frontend-staging -n staging
```

#### **Production Deployment**
```bash
# Deploy production environment
kubectl apply -f k8s/production/

# Rolling update practice
kubectl set image deployment/frontend-prod frontend=ghcr.io/yourusername/devresume-forge/frontend:v1.0.2 -n production
kubectl rollout status deployment/frontend-prod -n production

# Rollback practice
kubectl rollout undo deployment/frontend-prod -n production
```

### 📊 Monitoring Practice

#### **Application Monitoring**
```bash
# Start monitoring stack
docker-compose --profile monitoring up -d

# Access dashboards:
# - Grafana: http://localhost:3001 (admin/admin)
# - Prometheus: http://localhost:9090
```

#### **Health Checks**
```bash
# Check application health
curl http://localhost:5000/api/health
curl http://localhost:3000/health

# Kubernetes health
kubectl get pods --all-namespaces
kubectl describe pod <pod-name> -n <namespace>
```

### 🔒 Security Practice

#### **Dependency Scanning**
```bash
# Check for vulnerabilities
npm audit --audit-level=high
docker run --rm -v "$(pwd)":/app aquasec/trivy fs /app
```

#### **Secret Management**
```bash
# Required GitHub Secrets for full CI/CD:
GITHUB_TOKEN         # Container registry access
KUBE_CONFIG_DATA     # Kubernetes cluster config
SONAR_TOKEN         # Code quality scanning
SLACK_WEBHOOK       # Deployment notifications
JWT_SECRET          # Application security
MONGO_PASSWORD      # Database security
```

### 🎯 Practice Scenarios

#### **Scenario 1: Hotfix Deployment**
```bash
# Simulate production bug
git checkout main
git checkout -b hotfix/critical-security-fix
# Make fix
git commit -m "Fix critical XSS vulnerability"
git checkout main
git merge hotfix/critical-security-fix
git tag v1.0.2
git push origin main --tags
# Watch fast-track deployment
```

#### **Scenario 2: Feature Flag Practice**
```bash
# Toggle features without redeployment
helm upgrade devresume-forge helm/devresume-forge \
  --set featureFlags.darkMode=true \
  --set featureFlags.pdfExport=false
```

#### **Scenario 3: Load Testing**
```bash
# Install k6
brew install k6

# Run load tests
k6 run tests/performance/load-test.js
```

### 📚 Advanced Practice

#### **Multi-Environment GitOps**
```bash
# Create environment-specific configs
# Promote through dev → staging → production
# Practice with ArgoCD or Flux
```

#### **Service Mesh Practice**
```bash
# Install Istio
istioctl install --set values.defaultRevision=default

# Practice traffic splitting, security policies
```

#### **Observability Stack**
```bash
# Full observability with ELK stack
# Distributed tracing with Jaeger
# Metrics collection with Prometheus
```

### 🚨 Troubleshooting CI/CD Practice

#### **Common Issues & Solutions**

**Frontend won't start:**
```bash
cd frontend && rm -rf node_modules && npm install && npm start
```

**Docker build fails:**
```bash
docker system prune -af  # Clean up Docker cache
docker-compose build --no-cache
```

**CI pipeline fails:**
```bash
# Check GitHub Actions logs in your repository
# Common fixes:
git add . && git commit -m "Fix: Add missing files"
npm run lint -- --fix  # Fix linting errors
npm test -- --watchAll=false  # Run tests once
```

**Kubernetes deployment fails:**
```bash
# Check pod status
kubectl get pods -n staging
kubectl describe pod <pod-name> -n staging
kubectl logs <pod-name> -n staging

# Common fixes:
kubectl delete deployment frontend-staging -n staging
kubectl apply -f k8s/staging/
```

**Backend API not responding:**
```bash
# Check if MongoDB is running
docker-compose ps
docker-compose logs mongodb

# Restart backend
cd backend && npm install && npm start
```

#### **Environment Variables Setup**
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NODE_ENV=development

# Backend (.env)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resume_app_dev
JWT_SECRET=your-secret-key
```

#### **GitHub Secrets Required for Full CI/CD**
Add these in your GitHub repository settings → Secrets and variables → Actions:
- `GITHUB_TOKEN` (automatically provided)
- `KUBE_CONFIG_DATA` (base64 encoded kubeconfig)
- `SONAR_TOKEN` (from SonarCloud)
- `SLACK_WEBHOOK` (optional, for notifications)

## Documentation

- 📖 [**DevOps Implementation Guide**](./DEVOPS-IMPLEMENTATION-GUIDE.md) - Complete guide covering infrastructure setup, CI/CD, deployment, and best practices 