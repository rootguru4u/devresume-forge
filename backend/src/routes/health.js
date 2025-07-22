const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs');
const { checkDBHealth, getDBStats } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Basic health check
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'DevResume Forge API'
  });
});

// @desc    Detailed health check
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'DevResume Forge API',
    
    // Service health
    services: {
      api: {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        pid: process.pid
      },
      database: {
        status: 'unknown',
        connection: null,
        stats: null
      }
    },

    // System health
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        totalSystem: Math.round(os.totalmem() / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      disk: {
        uploads: await getDiskUsage(process.env.UPLOAD_PATH || './uploads'),
        logs: await getDiskUsage('./logs')
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      os: {
        type: os.type(),
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: Math.floor(os.uptime())
      }
    }
  };

  try {
    // Check database health
    const dbHealth = await checkDBHealth();
    healthCheck.services.database = dbHealth;

    // Get database statistics if healthy
    if (dbHealth.status === 'healthy') {
      try {
        const dbStats = await getDBStats();
        healthCheck.services.database.stats = dbStats;
      } catch (statsError) {
        logger.warn('Could not retrieve database stats:', statsError.message);
      }
    }

    // Determine overall health status
    if (dbHealth.status !== 'healthy') {
      healthCheck.success = false;
      healthCheck.status = 'DEGRADED';
    }

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    healthCheck.success = false;
    healthCheck.status = 'UNHEALTHY';
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check system resources and warn if low
  const memoryUsagePercent = (healthCheck.system.memory.used / healthCheck.system.memory.total) * 100;
  if (memoryUsagePercent > 90) {
    healthCheck.warnings = healthCheck.warnings || [];
    healthCheck.warnings.push('High memory usage detected');
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// @desc    Readiness probe (Kubernetes)
// @route   GET /api/health/ready
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const checks = [];

    // Database readiness
    const dbHealth = await checkDBHealth();
    checks.push({
      name: 'database',
      ready: dbHealth.status === 'healthy',
      message: dbHealth.message
    });

    // File system readiness
    const uploadsDir = process.env.UPLOAD_PATH || './uploads';
    const logsDir = './logs';
    
    checks.push({
      name: 'uploads_directory',
      ready: fs.existsSync(uploadsDir) && await isDirectoryWritable(uploadsDir),
      message: `Uploads directory ${uploadsDir} is ${fs.existsSync(uploadsDir) ? 'accessible' : 'not accessible'}`
    });

    checks.push({
      name: 'logs_directory', 
      ready: fs.existsSync(logsDir) && await isDirectoryWritable(logsDir),
      message: `Logs directory ${logsDir} is ${fs.existsSync(logsDir) ? 'accessible' : 'not accessible'}`
    });

    // Check if all services are ready
    const allReady = checks.every(check => check.ready);

    if (!allReady) {
      return res.status(503).json({
        success: false,
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        checks,
        message: 'Some services are not ready'
      });
    }

    res.json({
      success: true,
      status: 'READY',
      timestamp: new Date().toISOString(),
      checks,
      message: 'All services are ready'
    });

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Readiness check failed'
    });
  }
});

// @desc    Liveness probe (Kubernetes)
// @route   GET /api/health/live
// @access  Public
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.json({
    success: true,
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// @desc    Get application metrics
// @route   GET /api/health/metrics
// @access  Public
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      
      // Process metrics
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform
      },

      // System metrics
      system: {
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpus: os.cpus().length,
        uptime: os.uptime()
      },

      // Application metrics
      application: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Add database metrics if available
    try {
      const dbHealth = await checkDBHealth();
      if (dbHealth.status === 'healthy') {
        const dbStats = await getDBStats();
        metrics.database = {
          status: dbHealth.status,
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize
        };
      }
    } catch (dbError) {
      metrics.database = {
        status: 'error',
        error: dbError.message
      };
    }

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to collect metrics',
      message: error.message
    });
  }
});

// Helper function to get disk usage
async function getDiskUsage(directory) {
  try {
    if (!fs.existsSync(directory)) {
      return { error: 'Directory does not exist' };
    }

    const stats = fs.statSync(directory);
    const files = fs.readdirSync(directory);
    
    let totalSize = 0;
    for (const file of files) {
      try {
        const filePath = require('path').join(directory, file);
        const fileStats = fs.statSync(filePath);
        totalSize += fileStats.size;
      } catch (err) {
        // Skip files that can't be accessed
        continue;
      }
    }

    return {
      path: directory,
      fileCount: files.length,
      totalSize: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      accessible: true
    };

  } catch (error) {
    return {
      path: directory,
      error: error.message,
      accessible: false
    };
  }
}

// Helper function to check if directory is writable
async function isDirectoryWritable(directory) {
  try {
    const testFile = require('path').join(directory, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = router; 