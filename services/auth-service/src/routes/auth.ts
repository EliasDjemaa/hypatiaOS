import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import { config } from '../config';
import { DatabaseManager } from '../database/DatabaseManager';
import { RedisManager } from '../cache/RedisManager';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { AuthService } from '../services/AuthService';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaToken: z.string().optional()
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  displayName: z.string().min(2).max(100),
  organizationId: z.string().uuid().optional(),
  role: z.enum(['sponsor_pm', 'cra', 'site_coordinator', 'investigator', 'data_manager', 'biostat', 'regulatory', 'patient', 'admin'])
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
});

// Login endpoint
router.post('/login', validateRequest(loginSchema), auditLog('login'), async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Find user
    const userResult = await DatabaseManager.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfaToken) {
        return res.status(401).json({
          success: false,
          message: 'MFA token required',
          requiresMfa: true
        });
      }

      const isValidMfa = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: mfaToken,
        window: config.mfa.window
      });

      if (!isValidMfa) {
        return res.status(401).json({
          success: false,
          message: 'Invalid MFA token'
        });
      }
    }

    // Generate tokens
    const tokens = await AuthService.generateTokens(user);

    // Update last login
    await DatabaseManager.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Get user permissions
    const permissions = await AuthService.getUserPermissions(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          organizationId: user.organization_id,
          permissions
        },
        tokens
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
router.post('/register', validateRequest(registerSchema), auditLog('register'), async (req, res) => {
  try {
    const { email, password, displayName, organizationId, role } = req.body;

    // Check if user already exists
    const existingUser = await DatabaseManager.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await DatabaseManager.query(
      `INSERT INTO users (email, hashed_password, display_name, organization_id, role, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, email, display_name, role, organization_id, created_at`,
      [email.toLowerCase(), hashedPassword, displayName, organizationId, role]
    );

    const user = userResult.rows[0];

    // Assign default role permissions
    await AuthService.assignDefaultPermissions(user.id, role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          organizationId: user.organization_id,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const tokens = await AuthService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: { tokens }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout endpoint
router.post('/logout', auditLog('logout'), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Setup MFA endpoint
router.post('/mfa/setup', AuthService.authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `hypatiaOS (${req.user.email})`,
      issuer: config.mfa.issuer
    });

    // Store secret temporarily (not enabled until verified)
    await RedisManager.setex(`mfa_setup:${userId}`, 300, secret.base32); // 5 minutes

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });

  } catch (error) {
    logger.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify and enable MFA
router.post('/mfa/verify', AuthService.authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    // Get temporary secret
    const secret = await RedisManager.get(`mfa_setup:${userId}`);
    if (!secret) {
      return res.status(400).json({
        success: false,
        message: 'MFA setup session expired'
      });
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: config.mfa.window
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    // Enable MFA for user
    await DatabaseManager.query(
      'UPDATE users SET mfa_enabled = true, mfa_secret = $1 WHERE id = $2',
      [secret, userId]
    );

    // Clean up temporary secret
    await RedisManager.del(`mfa_setup:${userId}`);

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });

  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password endpoint
router.post('/change-password', 
  AuthService.authenticateToken, 
  validateRequest(changePasswordSchema), 
  auditLog('password_change'), 
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get current user
      const userResult = await DatabaseManager.query(
        'SELECT hashed_password FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.hashed_password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await DatabaseManager.query(
        'UPDATE users SET hashed_password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

export { router as authRoutes };
