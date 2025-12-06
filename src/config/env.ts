import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  BACKEND_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().optional(),

  // Midtrans
  MIDTRANS_MERCHANT_ID: z.string().optional(),
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.string().transform(val => val === 'true').default('false'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Redis (Optional - leave empty to disable)
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().optional().default(''),
  REDIS_PORT: z.string().transform(Number).optional().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Internal API Key (for n8n integration)
  INTERNAL_API_KEY: z.string().optional().default('change-me-in-production'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Logger is available here (imported at top)
    // Sanitize env errors to prevent leaking sensitive data
    // Use require for synchronous import in error handler
    try {
      const { sanitizeForLogging } = require('./utils/log-sanitizer');
      logger.error('Invalid environment variables:', sanitizeForLogging({
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      }));
    } catch {
      // Fallback if sanitizer fails - only log error paths, not values
      logger.error('Invalid environment variables:');
      error.errors.forEach((err) => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
  throw error;
}

export default env;

