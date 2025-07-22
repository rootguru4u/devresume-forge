const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston to use our custom colors
winston.addColors(colors);

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    let message = `${info.timestamp} [${info.level}]: ${info.message}`;
    
    // Add metadata if present
    if (info.metadata && Object.keys(info.metadata).length > 0) {
      message += ` ${JSON.stringify(info.metadata)}`;
    }
    
    // Add stack trace for errors
    if (info.stack) {
      message += `\n${info.stack}`;
    }
    
    return message;
  })
);

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Determine format based on environment
const logFormat = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' 
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple()
        )
      : devFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),

  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),

  // Application specific log
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    maxsize: 5242880, // 5MB
    maxFiles: 3,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Add HTTP log file in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true
});

// Add request logging utility
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    contentLength: res.get('Content-Length') || 0
  };

  if (req.user) {
    logData.userId = req.user.id;
  }

  logger.http('HTTP Request', { metadata: logData });
};

// Add error logging utility
logger.logError = (error, req = null, additional = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    ...additional
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (req.user) {
      errorData.userId = req.user.id;
    }
  }

  logger.error('Application Error', { metadata: errorData });
};

// Add database operation logging
logger.logDB = (operation, collection, query = {}, result = {}) => {
  const dbData = {
    operation,
    collection,
    query: JSON.stringify(query),
    resultCount: result.length || (result.n !== undefined ? result.n : 1),
    executionTime: result.executionTime || 'unknown'
  };

  logger.debug('Database Operation', { metadata: dbData });
};

// Add authentication logging
logger.logAuth = (action, userId, ip, userAgent, success = true, details = {}) => {
  const authData = {
    action,
    userId,
    ip,
    userAgent,
    success,
    timestamp: new Date().toISOString(),
    ...details
  };

  const level = success ? 'info' : 'warn';
  logger.log(level, `Auth ${action}`, { metadata: authData });
};

// Add performance logging
logger.logPerformance = (operation, duration, details = {}) => {
  const perfData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...details
  };

  logger.info('Performance Metric', { metadata: perfData });
};

// Handle test environment
if (process.env.NODE_ENV === 'test') {
  logger.silent = true;
}

// Export logger with utilities
module.exports = logger; 