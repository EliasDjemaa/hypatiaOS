import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { DatabaseManager } from './database/DatabaseManager';
import { RedisManager } from './database/RedisManager';
import { KafkaManager } from './events/KafkaManager';
import { logger } from './utils/logger';

// Route imports
import contractRoutes from './routes/contracts';
import budgetRoutes from './routes/budgets';
import invoiceRoutes from './routes/invoices';
import paymentRoutes from './routes/payments';
import milestoneRoutes from './routes/milestones';
import healthRoutes from './routes/health';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/health', healthRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    await DatabaseManager.initialize();
    logger.info('Database connection established');

    // Initialize Redis
    await RedisManager.initialize();
    logger.info('Redis connection established');

    // Initialize Kafka
    await KafkaManager.initialize();
    logger.info('Kafka connection established');

    // Run database migrations
    await DatabaseManager.runMigrations();
    logger.info('Database migrations completed');

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await DatabaseManager.disconnect();
  await RedisManager.disconnect();
  await KafkaManager.disconnect();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  await DatabaseManager.disconnect();
  await RedisManager.disconnect();
  await KafkaManager.disconnect();
  
  process.exit(0);
});

// Start server
const PORT = config.PORT || 3005;

initializeServices().then(() => {
  app.listen(PORT, () => {
    logger.info(`Contract Service running on port ${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
