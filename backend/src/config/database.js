const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/devresume_test'
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/devresume';

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
    };

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`🗃️  MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    logger.info(`📊 Database Name: ${conn.connection.name}`);
    logger.info(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    mongoose.connection.on('connecting', () => {
      logger.info('Connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      logger.info('Connected to MongoDB');
    });

    // Handle connection lost
    mongoose.connection.on('close', () => {
      logger.warn('MongoDB connection closed');
    });

    // Graceful shutdown
    const gracefulShutdown = (msg) => {
      mongoose.connection.close(() => {
        logger.info(`MongoDB disconnected through ${msg}`);
      });
    };

    // Handle app termination
    process.once('SIGINT', () => gracefulShutdown('app termination'));
    process.once('SIGTERM', () => gracefulShutdown('app termination'));

    return conn;

  } catch (error) {
    logger.error('Database connection failed:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // In development/test, throw error to be handled by caller
    throw error;
  }
};

// Function to check database connection health
const checkDBHealth = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      };
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

// Function to get database stats
const getDBStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  getDBStats
}; 