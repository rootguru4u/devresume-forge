require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');

// Internal imports
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Connect to MongoDB
connectDB();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip;
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin')
  });

  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
  });

  next();
});

// Create required directories
const createDirectories = () => {
  const dirs = [
    process.env.UPLOAD_PATH || './uploads',
    process.env.PDF_STORAGE_PATH || './uploads/pdfs',
    './logs'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DevResume Forge API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      resumes: '/api/resumes',
      upload: '/api/upload'
    }
  });
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'DevResume Forge API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      resumes: {
        list: 'GET /api/resumes',
        create: 'POST /api/resumes',
        get: 'GET /api/resumes/:id',
        update: 'PUT /api/resumes/:id',
        delete: 'DELETE /api/resumes/:id',
        export: 'POST /api/resumes/:id/export/pdf',
        preview: 'GET /api/resumes/:id/preview'
      },
      health: {
        basic: 'GET /api/health',
        detailed: 'GET /api/health/detailed'
      },
      upload: {
        image: 'POST /api/upload/image',
        file: 'POST /api/upload/file'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown function
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🗃️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  logger.info(`📁 Upload path: ${process.env.UPLOAD_PATH || './uploads'}`);
  logger.info(`🔒 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = app; 