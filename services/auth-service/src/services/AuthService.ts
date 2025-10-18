import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { DatabaseManager } from '../database/DatabaseManager';
import { RedisManager } from '../cache/RedisManager';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  organization_id?: string;
  mfa_enabled: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  
  static async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
      issuer: 'hypatia-auth-service',
      audience: 'hypatia-services'
    });

    // Generate refresh token
    const refreshTokenId = uuidv4();
    const refreshToken = jwt.sign(
      { tokenId: refreshTokenId, userId: user.id },
      config.jwtSecret,
      { expiresIn: config.refreshTokenExpiresIn }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    
    await DatabaseManager.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [refreshTokenId, user.id, tokenHash, expiresAt]
    );

    // Cache user session
    await RedisManager.setex(
      `user_session:${user.id}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        lastActivity: new Date().toISOString()
      })
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };
  }

  static async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      
      // Get token from database
      const tokenResult = await DatabaseManager.query(
        `SELECT rt.*, u.* FROM refresh_tokens rt
         JOIN users u ON rt.user_id = u.id
         WHERE rt.id = $1 AND rt.expires_at > NOW() AND rt.revoked_at IS NULL`,
        [decoded.tokenId]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid refresh token');
      }

      const tokenRecord = tokenResult.rows[0];
      
      // Verify token hash
      const isValidToken = await bcrypt.compare(refreshToken, tokenRecord.token_hash);
      if (!isValidToken) {
        throw new Error('Invalid refresh token');
      }

      // Revoke old refresh token
      await DatabaseManager.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [decoded.tokenId]
      );

      // Generate new tokens
      const user: User = {
        id: tokenRecord.user_id,
        email: tokenRecord.email,
        display_name: tokenRecord.display_name,
        role: tokenRecord.role,
        organization_id: tokenRecord.organization_id,
        mfa_enabled: tokenRecord.mfa_enabled
      };

      return await this.generateTokens(user);

    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      
      await DatabaseManager.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [decoded.tokenId]
      );
    } catch (error) {
      logger.error('Token revocation failed:', error);
      // Don't throw error for logout
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    const result = await DatabaseManager.query(
      `SELECT ur.permissions, u.role
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1`,
      [userId]
    );

    const permissions = new Set<string>();
    
    // Add role-based permissions
    const user = result.rows[0];
    if (user) {
      const rolePermissions = this.getRolePermissions(user.role);
      rolePermissions.forEach(p => permissions.add(p));
      
      // Add custom permissions
      result.rows.forEach(row => {
        if (row.permissions) {
          row.permissions.forEach((p: string) => permissions.add(p));
        }
      });
    }

    return Array.from(permissions);
  }

  static getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      // System Level Roles
      system_admin: ['*'], // All permissions
      compliance_officer: [
        'audit.read', 'audit.export', 'compliance.read', 'compliance.audit',
        'documents.read', 'reports.regulatory', 'financial_audit.read'
      ],
      auditor: [
        'audit.read', 'audit.export', 'compliance.read',
        'documents.read', 'financial_audit.read'
      ],
      
      // Sponsor Ecosystem Roles
      sponsor_admin: [
        'users.read', 'users.invite', 'users.manage',
        'organizations.manage', 'studies.read', 'studies.create'
      ],
      sponsor_clinical_lead: [
        'studies.read', 'studies.create', 'studies.update',
        'sites.read', 'sites.manage', 'protocols.read', 'protocols.update',
        'reports.read', 'reports.export', 'adverse_events.read'
      ],
      sponsor_regulatory: [
        'studies.read', 'documents.read', 'documents.regulatory',
        'submissions.read', 'submissions.create', 'compliance.read',
        'reports.regulatory', 'protocols.read'
      ],
      sponsor_finance_manager: [
        'contracts.read', 'contracts.approve', 'budgets.read', 'budgets.approve',
        'invoices.read', 'invoices.approve', 'payments.read', 'payments.authorize',
        'financial_reports.read', 'milestones.approve', 'studies.read'
      ],
      sponsor_contract_manager: [
        'contracts.read', 'contracts.create', 'contracts.update', 'contracts.negotiate',
        'budgets.read', 'studies.read', 'organizations.read', 'legal.read'
      ],
      
      // CRO Ecosystem Roles  
      cro_pm: [
        'studies.read', 'sites.read', 'sites.manage',
        'participants.read', 'visits.read', 'reports.read',
        'budgets.read', 'milestones.read', 'contracts.read'
      ],
      cra: [
        'studies.read', 'sites.read', 'sites.monitor',
        'forms.read', 'forms.review', 'queries.create', 'queries.resolve',
        'documents.read', 'documents.upload', 'visits.read', 'visits.create'
      ],
      data_manager: [
        'studies.read', 'forms.read', 'forms.lock',
        'queries.read', 'queries.create', 'queries.resolve',
        'data.read', 'data.export', 'data.clean', 'reports.read', 'reports.generate'
      ],
      cro_regulatory: [
        'studies.read', 'documents.read', 'documents.regulatory',
        'submissions.read', 'compliance.read', 'reports.regulatory'
      ],
      cro_etmf_manager: [
        'documents.read', 'documents.create', 'documents.update', 'documents.upload',
        'etmf.read', 'etmf.manage', 'compliance.read', 'studies.read'
      ],
      cro_finance_analyst: [
        'budgets.read', 'budgets.create', 'budgets.update',
        'invoices.read', 'invoices.create', 'invoices.send',
        'payments.read', 'receivables.read', 'financial_reports.read',
        'milestones.read', 'contracts.read', 'studies.read'
      ],
      cro_contract_manager: [
        'contracts.read', 'contracts.create', 'contracts.update',
        'budgets.read', 'budgets.create', 'legal.read', 'studies.read'
      ],
      cro_legal_officer: [
        'contracts.read', 'contracts.review', 'contracts.approve',
        'legal.read', 'legal.create', 'compliance.read', 'risk.read'
      ],
      
      // Site Ecosystem Roles
      principal_investigator: [
        'participants.read', 'participants.create', 'visits.read', 'visits.create',
        'forms.read', 'forms.create', 'forms.sign', 'adverse_events.read',
        'adverse_events.create', 'documents.read', 'documents.sign',
        'site_payments.read'
      ],
      site_coordinator: [
        'participants.read', 'participants.create', 'participants.update',
        'visits.read', 'visits.create', 'visits.update',
        'forms.read', 'forms.create', 'forms.update',
        'documents.read', 'documents.upload', 'queries.read', 'queries.respond',
        'site_payments.read'
      ],
      site_pharmacist: [
        'participants.read', 'visits.read', 'inventory.read', 'inventory.manage',
        'dispensing.read', 'dispensing.create', 'forms.pharmacy',
        'documents.read', 'site_payments.read'
      ],
      site_finance_coordinator: [
        'site_payments.read', 'site_payments.track', 'expenses.read',
        'expenses.create', 'expenses.submit', 'milestones.read',
        'financial_reports.site', 'visits.read', 'participants.read'
      ],
      
      // Legacy Roles
      biostat: [
        'studies.read', 'data.read', 'data.export',
        'reports.read', 'reports.generate', 'reports.statistical',
        'analytics.read', 'analytics.advanced'
      ],
      patient: [
        'profile.read', 'profile.update', 'visits.read',
        'forms.patient_reported', 'notifications.read', 'consent.manage'
      ],
      admin: ['*'] // Legacy admin role
    };

    return rolePermissions[role] || [];
  }

  static async assignDefaultPermissions(userId: string, role: string): Promise<void> {
    const permissions = this.getRolePermissions(role);
    
    if (permissions.length > 0) {
      await DatabaseManager.query(
        `INSERT INTO user_roles (user_id, role_name, permissions)
         VALUES ($1, $2, $3)`,
        [userId, role, JSON.stringify(permissions)]
      );
    }
  }

  static authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      // Check if user session exists in cache
      const cachedSession = await RedisManager.get(`user_session:${decoded.userId}`);
      
      if (!cachedSession) {
        // Fetch user from database
        const userResult = await DatabaseManager.query(
          'SELECT * FROM users WHERE id = $1 AND status = $2 AND deleted_at IS NULL',
          [decoded.userId, 'active']
        );

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        const user = userResult.rows[0];
        
        // Update cache
        await RedisManager.setex(
          `user_session:${user.id}`,
          24 * 60 * 60,
          JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organization_id,
            lastActivity: new Date().toISOString()
          })
        );

        req.user = user;
      } else {
        req.user = JSON.parse(cachedSession);
      }

      // Get user permissions
      req.user.permissions = await AuthService.getUserPermissions(decoded.userId);

      next();

    } catch (error) {
      logger.error('Token authentication failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };

  static requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = req.user.permissions || [];
      
      // Check for admin wildcard or specific permission
      if (userPermissions.includes('*') || userPermissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permission
      });
    };
  };
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
