// Centralized authentication utilities
// Prevents demo tokens from working in production

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const isDevelopment = !isProduction;

// Demo token configuration
const DEMO_TOKEN = 'demo-token-dev-only';

/**
 * Validates authentication token
 * CRITICAL: Blocks demo tokens in production
 */
export function validateAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const token = authHeader.split(' ')[1];

  // CRITICAL SECURITY: Block demo tokens in production
  if (token === DEMO_TOKEN) {
    if (isProduction) {
      console.error('SECURITY ALERT: Demo token blocked in production!');
      return { valid: false, error: 'Demo tokens not allowed in production' };
    }

    // Allow demo token only in development
    if (isDevelopment) {
      return {
        valid: true,
        user: {
          email: 'demo@uphousetw.com',
          role: 'admin',
          isDemoUser: true
        }
      };
    }
  }

  // Validate real JWT tokens
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is in admin whitelist
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return { valid: false, error: 'User not authorized' };
    }

    return {
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role || 'admin',
        isDemoUser: false
      }
    };
  } catch (error) {
    console.error('JWT validation error:', error.message);
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Middleware to protect admin routes
 * Usage: const auth = requireAuth(req, res); if (!auth.valid) return;
 */
export function requireAuth(req, res) {
  const authResult = validateAuthToken(req.headers.authorization);

  if (!authResult.valid) {
    res.status(401).json({ error: authResult.error });
    return authResult;
  }

  // Add user info to request for use in handlers
  req.user = authResult.user;
  return authResult;
}

/**
 * Log admin actions for security monitoring
 */
export function logAdminAction(user, action, details = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    user: user.email,
    isDemoUser: user.isDemoUser,
    action,
    details,
    environment: isProduction ? 'production' : 'development'
  };

  console.log('Admin Action:', JSON.stringify(logData));

  // In production, you might want to send this to a logging service
  if (isProduction && user.isDemoUser) {
    console.error('SECURITY ALERT: Demo user action in production!', logData);
  }
}

/**
 * Check if current environment allows demo mode
 */
export function isDemoModeAllowed() {
  return isDevelopment;
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    isProduction,
    isDevelopment,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    demoAllowed: isDemoModeAllowed()
  };
}