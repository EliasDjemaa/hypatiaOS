import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

export class DatabaseManager {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection pool initialized');
    } catch (error) {
      logger.error('Failed to initialize database connection:', error);
      throw error;
    }

    // Run migrations
    await this.runMigrations();
  }

  static async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  static async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection pool closed');
    }
  }

  private static async runMigrations(): Promise<void> {
    const migrations = [
      // Users table
      `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        organization_id UUID,
        role VARCHAR(50) NOT NULL CHECK (role IN (
          'sponsor_pm', 'cra', 'site_coordinator', 'investigator', 
          'data_manager', 'biostat', 'regulatory', 'patient', 'admin'
        )),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
        last_login TIMESTAMP WITH TIME ZONE,
        mfa_enabled BOOLEAN DEFAULT false,
        mfa_secret VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by UUID
      );
      `,
      
      // User roles for RBAC
      `
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_name VARCHAR(100) NOT NULL,
        permissions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );
      `,
      
      // Organizations
      `
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN (
          'sponsor', 'CRO', 'site', 'hospital', 'lab', 'regulator', 'vendor'
        )),
        address JSONB,
        contact JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by UUID
      );
      `,
      
      // Refresh tokens
      `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        revoked_at TIMESTAMP WITH TIME ZONE
      );
      `,
      
      // Audit events
      `
      CREATE TABLE IF NOT EXISTS audit_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        object_type VARCHAR(100) NOT NULL,
        object_id UUID,
        actor_id UUID REFERENCES users(id),
        action VARCHAR(50) NOT NULL CHECK (action IN (
          'create', 'update', 'delete', 'sign', 'upload', 'download', 
          'randomize', 'lock', 'login', 'logout', 'password_change'
        )),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        previous_value_hash VARCHAR(255),
        delta JSONB,
        signature JSONB,
        ip_address INET,
        user_agent TEXT
      );
      `,
      
      // Indexes for performance
      `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
      CREATE INDEX IF NOT EXISTS idx_audit_events_object ON audit_events(object_type, object_id);
      CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp);
      `,
      
      // Add foreign key constraint for organization_id after organizations table exists
      `
      ALTER TABLE users 
      ADD CONSTRAINT fk_users_organization 
      FOREIGN KEY (organization_id) REFERENCES organizations(id) 
      ON DELETE SET NULL;
      `
    ];

    for (const migration of migrations) {
      try {
        await this.query(migration);
        logger.debug('Migration executed successfully');
      } catch (error) {
        // Ignore "already exists" errors for idempotent migrations
        if (!error.message.includes('already exists') && !error.message.includes('already has')) {
          logger.error('Migration failed:', error);
          throw error;
        }
      }
    }

    logger.info('Database migrations completed');
  }
}
