import express, { Express } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import env from './config/env';
import { setupSecurity } from './middlewares/security';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { addCSRFToken } from './middlewares/csrf';
import { metricsMiddleware } from './middlewares/metrics';
import logger from './utils/logger';
import apiRoutes from './routes';
import { initializeSocket } from './socket/socket';
import { swaggerSpec } from './config/swagger';
import prisma from './config/database';
import businessMetricsService from './services/business-metrics.service';

logger.info('Loading Express app...');
const app: Express = express();
const httpServer = createServer(app);
logger.info('Express app and HTTP server created');

// Trust proxy - Required when running behind reverse proxy (nginx, cloudflare, etc.)
// This allows Express to correctly identify client IPs and handle X-Forwarded-* headers
// Trust 2 hops: nginx (1) + cloudflare (1) = 2
// This is more secure than 'true' and prevents rate limiter warnings
app.set('trust proxy', 2);

// Security middleware
logger.info('Setting up security middleware...');
setupSecurity(app);
logger.info('Security middleware configured');

// CORS - Configure before other middleware
// Security: Only allow configured origins, restrict in production
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
      
      // Allow requests with no origin (like health checks, mobile apps, curl requests)
      // Health checks from Docker don't send Origin header
      if (!origin) {
        // Always allow health check endpoint without origin
        // This is safe because health check doesn't expose sensitive data
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        // In development, log warning but allow (for easier testing)
        // In production, strictly reject
        if (env.NODE_ENV === 'production') {
          logger.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
          callback(new Error('CORS: Not allowed by CORS policy'), false);
        } else {
          logger.warn(`CORS: Allowing unauthorized origin in development: ${origin}`);
          callback(null, true);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  })
);

// Compression
app.use(compression());

// Cookie parser (for CSRF token storage)
app.use(cookieParser());

// Body parser with size limits
app.use(express.json({ limit: '10mb' })); // 10MB max request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request/Response size limiters
import { requestSizeLimiter, responseSizeLimiter } from './middlewares/request-limits';
app.use(requestSizeLimiter(10)); // 10MB max request
app.use(responseSizeLimiter(10)); // 10MB max response

// CSRF Protection - Add token to responses (before routes)
// Note: CSRF protection is optional for JWT-based auth, but adds extra security layer
app.use('/api', addCSRFToken);

// Rate limiting - Use Redis-based rate limiter if available, fallback to memory-based
logger.info('Setting up rate limiting...');
// Use IIFE to handle async import
(async () => {
  try {
    const { redisApiLimiter, redisAuthLimiter } = await import('./middlewares/redis-rate-limiter');
    app.use('/api', redisApiLimiter);
    app.use('/api/auth/login', redisAuthLimiter);
    logger.info('Redis-based rate limiting configured');
  } catch (error) {
    // Fallback to memory-based rate limiter
    logger.warn('Redis rate limiter not available, using memory-based limiter', {
      error: error instanceof Error ? error.message : String(error),
    });
    app.use('/api', apiLimiter);
    app.use('/api/auth/login', authLimiter);
    logger.info('Memory-based rate limiting configured');
  }
})();

// Response time audit middleware
import { responseTimeAudit } from './middlewares/response-time';
app.use(responseTimeAudit(1000, true)); // Log requests slower than 1 second

// Metrics middleware (before routes to track all requests)
app.use(metricsMiddleware);

// Health check - Enhanced with detailed metrics
app.get('/health', async (req, res) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    services: {
      database: string;
      redis: string;
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`.catch(() => {
      throw new Error('Database query failed');
    });
    health.services.database = 'connected';
  } catch (error: any) {
    health.services.database = 'disconnected';
    health.status = 'degraded';
    // Log error for debugging but don't crash
    if (process.env.NODE_ENV === 'development') {
      logger.error('Health check database error', { error: error?.message || error });
    }
  }

  // Check Redis connection
  try {
    const { getRedisClient } = await import('./config/redis');
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      health.services.redis = 'connected';
    } else {
      health.services.redis = 'not_configured';
    }
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Warungin API',
    version: '1.1.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      docs: '/api-docs',
    },
  });
});

// API Documentation (wrap in try-catch to prevent crash)
try {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger UI configured');
} catch (error: any) {
  logger.warn('Swagger UI setup failed (non-critical)', { error: error?.message || error });
  // Continue without Swagger UI - it's optional
}

// API routes (wrap in try-catch to prevent crash)
logger.info('Setting up API routes...');
try {
  app.use('/api', apiRoutes);
  logger.info('API routes configured');
} catch (error: any) {
  logger.error('Failed to setup API routes', { error: error?.message || error });
  // This is critical - exit if routes can't be loaded
  process.exit(1);
}

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = env.PORT || 3000;
if (!PORT || PORT <= 0) {
  logger.error('Invalid PORT', { port: PORT });
  process.exit(1);
}

// Initialize Socket.IO (optional service)
logger.info('Initializing Socket.IO...');
try {
  initializeSocket(httpServer);
  logger.info('Socket.IO initialized successfully');
} catch (error: any) {
  logger.error('Socket.IO initialization failed (non-critical)', { error: error?.message || error });
  // Continue anyway - Socket.IO is optional
}

// Initialize API key rotation system
setImmediate(async () => {
  try {
    const { initializeApiKeys } = await import('./utils/api-key-rotation');
    await initializeApiKeys();
  } catch (error) {
    logger.warn('Failed to initialize API keys (non-critical)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Initialize scheduler (optional - requires Redis)
// Load asynchronously to prevent blocking app start
setImmediate(() => {
  import('./scheduler').catch((error: any) => {
    // Scheduler is optional, continue if import fails
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Scheduler import failed (optional service)', { error: error?.message || error });
    }
  });
});

// Initialize business metrics update
// Update metrics on startup and then every 5 minutes
setImmediate(async () => {
  try {
    logger.info('Initializing business metrics...');
    await businessMetricsService.updateAllMetrics();
    logger.info('Business metrics initialized successfully');
    
    // Update metrics every 5 minutes
    setInterval(async () => {
      try {
        await businessMetricsService.updateAllMetrics();
      } catch (error: any) {
        logger.error('Error updating business metrics in interval:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } catch (error: any) {
    logger.warn('Failed to initialize business metrics (non-critical)', {
      error: error?.message || error,
    });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection:', {
    promise: String(promise),
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Don't exit the process, just log the error
  // Log stack trace for debugging
  if (reason instanceof Error) {
    logger.error('Unhandled Rejection Error Stack:', { stack: reason.stack });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  logger.error('Uncaught Exception Stack:', error.stack);
  // Don't exit the process, just log the error
  // Process should continue running to avoid 502 errors
});

logger.info(`Starting HTTP server on port ${PORT}...`);

// Error handling for server listen
httpServer.on('error', (error: any) => {
  logger.error('HTTP Server Error:', error);
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    logger.error('Server error:', error);
    // Don't exit - let it retry or handle gracefully
  }
});

httpServer.listen(PORT, () => {
  // Use logger for structured logging
  logger.info(`Server running on port ${PORT}`, {
    environment: env.NODE_ENV,
    backendUrl: env.BACKEND_URL,
    socketIo: 'initialized'
  });
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 Backend URL: ${env.BACKEND_URL}`);
  logger.info(`🔌 Socket.IO initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect().then(() => {
      logger.info('Database disconnected');
      process.exit(0);
    });
  });
});

export default app;

