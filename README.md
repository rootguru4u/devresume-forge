# DevResume Forge

A modern Resume Builder web application with full CI/CD pipeline support, designed for learning full-stack development and DevOps practices.

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

## 🎯 Learning Objectives

- **Full-Stack Development**: React + Node.js + MongoDB
- **DevOps Practices**: Docker, Kubernetes, CI/CD
- **Cloud Deployment**: Container orchestration
- **Testing**: Unit, integration, and e2e testing
- **Security**: Authentication, authorization, data protection
- **Performance**: Optimization and monitoring
- **Documentation**: Technical writing and API docs

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review the FAQ in the wiki

---

**Happy Resume Building! 🚀** 