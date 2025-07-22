const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error with context
  logger.logError(error, req, {
    timestamp: new Date().toISOString(),
    errorType: err.name || 'UnknownError'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      type: 'CAST_ERROR'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field from error message
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    
    error = {
      message,
      statusCode: 400,
      type: 'DUPLICATE_KEY',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    error = {
      message: 'Validation failed',
      statusCode: 400,
      type: 'VALIDATION_ERROR',
      errors
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = {
      message,
      statusCode: 401,
      type: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = {
      message,
      statusCode: 401,
      type: 'EXPIRED_TOKEN'
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 5MB.';
    error = {
      message,
      statusCode: 400,
      type: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files. Maximum is 5 files.';
    error = {
      message,
      statusCode: 400,
      type: 'TOO_MANY_FILES'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field. Please check your form data.';
    error = {
      message,
      statusCode: 400,
      type: 'UNEXPECTED_FILE'
    };
  }

  // Rate limit errors
  if (err.status === 429 || err.type === 'RATE_LIMIT') {
    const message = 'Too many requests. Please try again later.';
    error = {
      message,
      statusCode: 429,
      type: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter || 900 // 15 minutes default
    };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    const message = 'Database connection error. Please try again later.';
    error = {
      message,
      statusCode: 503,
      type: 'DATABASE_CONNECTION_ERROR'
    };
  }

  // PDF generation errors
  if (err.message && err.message.includes('puppeteer')) {
    const message = 'PDF generation failed. Please try again.';
    error = {
      message,
      statusCode: 500,
      type: 'PDF_GENERATION_ERROR'
    };
  }

  // File system errors
  if (err.code === 'ENOENT') {
    const message = 'File not found';
    error = {
      message,
      statusCode: 404,
      type: 'FILE_NOT_FOUND'
    };
  }

  if (err.code === 'EACCES' || err.code === 'EPERM') {
    const message = 'File permission denied';
    error = {
      message,
      statusCode: 403,
      type: 'FILE_PERMISSION_DENIED'
    };
  }

  // Custom application errors
  if (err.type === 'BUSINESS_LOGIC_ERROR') {
    error = {
      message: err.message,
      statusCode: err.statusCode || 400,
      type: 'BUSINESS_LOGIC_ERROR',
      code: err.code
    };
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    const message = 'CORS error: Origin not allowed';
    error = {
      message,
      statusCode: 403,
      type: 'CORS_ERROR'
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const type = error.type || 'INTERNAL_SERVER_ERROR';

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      type,
      statusCode
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = {
      name: err.name,
      code: err.code,
      ...error
    };
    
    // Add request context
    errorResponse.request = {
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
  }

  // Add specific error fields if they exist
  if (error.errors) {
    errorResponse.error.validation = error.errors;
  }

  if (error.field) {
    errorResponse.error.field = error.field;
  }

  if (error.retryAfter) {
    errorResponse.error.retryAfter = error.retryAfter;
    res.set('Retry-After', error.retryAfter);
  }

  // Add correlation ID if available
  if (req.correlationId) {
    errorResponse.correlationId = req.correlationId;
  }

  // Set appropriate status code
  res.status(statusCode);

  // Send JSON response
  res.json(errorResponse);

  // Log performance impact for slow errors
  if (res.locals.startTime) {
    const duration = Date.now() - res.locals.startTime;
    if (duration > 1000) { // Log if error handling took more than 1 second
      logger.logPerformance('Error Handler', duration, {
        statusCode,
        errorType: type,
        path: req.originalUrl
      });
    }
  }
};

// Helper function to create custom errors
const createError = (message, statusCode = 500, type = 'CUSTOM_ERROR', code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.type = type;
  if (code) error.code = code;
  return error;
};

// Helper function for async error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  createError,
  asyncHandler
}; 