import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3005),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default(5432),
  DB_NAME: z.string().default('hypatia_contracts'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_SSL: z.string().transform(val => val === 'true').default(false),
  DB_POOL_MIN: z.string().transform(Number).default(2),
  DB_POOL_MAX: z.string().transform(Number).default(10),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(2),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('contract-service'),
  KAFKA_GROUP_ID: z.string().default('contract-service-group'),

  // Security
  JWT_SECRET: z.string().default('your-jwt-secret-key'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // File Storage
  S3_BUCKET: z.string().default('hypatia-contracts'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(), // For MinIO

  // DocuSign Integration
  DOCUSIGN_INTEGRATION_KEY: z.string().optional(),
  DOCUSIGN_USER_ID: z.string().optional(),
  DOCUSIGN_ACCOUNT_ID: z.string().optional(),
  DOCUSIGN_PRIVATE_KEY: z.string().optional(),
  DOCUSIGN_BASE_PATH: z.string().default('https://demo.docusign.net/restapi'),

  // AI Service
  AI_SERVICE_URL: z.string().default('http://localhost:3008'),
  AI_SERVICE_API_KEY: z.string().optional(),

  // External Integrations
  ERP_INTEGRATION_ENABLED: z.string().transform(val => val === 'true').default(false),
  ERP_API_URL: z.string().optional(),
  ERP_API_KEY: z.string().optional(),

  // Audit
  AUDIT_RETENTION_DAYS: z.string().transform(Number).default(2555), // 7 years
  AUDIT_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const config = configSchema.parse(process.env);
