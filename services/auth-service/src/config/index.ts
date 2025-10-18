import { z } from 'zod';

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),
  
  // Database
  databaseUrl: z.string().min(1, 'Database URL is required'),
  
  // Redis
  redisUrl: z.string().min(1, 'Redis URL is required'),
  
  // JWT
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  jwtExpiresIn: z.string().default('24h'),
  refreshTokenExpiresIn: z.string().default('7d'),
  
  // CORS
  cors: z.object({
    allowedOrigins: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:8080'])
  }),
  
  // Email (for notifications)
  email: z.object({
    host: z.string().optional(),
    port: z.coerce.number().optional(),
    secure: z.boolean().default(false),
    user: z.string().optional(),
    password: z.string().optional()
  }).optional(),
  
  // MFA
  mfa: z.object({
    issuer: z.string().default('hypatiaOS'),
    window: z.coerce.number().default(1)
  }),
  
  // Rate limiting
  rateLimit: z.object({
    windowMs: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
    max: z.coerce.number().default(100)
  }),
  
  // Audit
  audit: z.object({
    enabled: z.boolean().default(true),
    retentionDays: z.coerce.number().default(2555) // 7 years for clinical trials
  })
});

const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || undefined
  },
  
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },
  
  mfa: {
    issuer: process.env.MFA_ISSUER,
    window: process.env.MFA_WINDOW
  },
  
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    max: process.env.RATE_LIMIT_MAX
  },
  
  audit: {
    enabled: process.env.AUDIT_ENABLED !== 'false',
    retentionDays: process.env.AUDIT_RETENTION_DAYS
  }
};

export const config = configSchema.parse(rawConfig);
