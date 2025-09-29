/**
 * Environment Configuration
 * Centralized environment detection and demo mode management
 */

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Demo mode configuration (ONLY for development)
export const DEMO_CONFIG = {
  // Only enable demo features in development
  ENABLED: isDevelopment,

  // Demo user credentials
  USER: {
    email: 'demo@uphousetw.com',
    role: 'admin' as const
  },

  // Demo token (not a real JWT)
  TOKEN: 'demo-token-dev-only',

  // Warning message for demo mode
  WARNING: '⚠️ Demo mode is active - changes will not persist'
};

/**
 * Safely check if demo mode is available
 * Returns false in production, preventing demo access
 */
export function isDemoModeAvailable(): boolean {
  // CRITICAL: Never allow demo mode in production
  if (isProduction) {
    console.warn('Demo mode blocked in production environment');
    return false;
  }

  return DEMO_CONFIG.ENABLED;
}

/**
 * Check if a token is a demo token
 */
export function isDemoToken(token: string): boolean {
  return isDevelopment && token === DEMO_CONFIG.TOKEN;
}

/**
 * Get environment-specific API base URL
 */
export function getApiBaseUrl(): string {
  return window.location.origin;
}

/**
 * Environment validation
 */
export function validateEnvironment(): {
  isDev: boolean;
  isProd: boolean;
  demoAllowed: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for production safety
  if (isProduction && DEMO_CONFIG.ENABLED) {
    warnings.push('CRITICAL: Demo mode detected in production!');
  }

  // Check for development indicators in production
  if (isProduction && window.location.hostname === 'localhost') {
    warnings.push('Production build running on localhost');
  }

  return {
    isDev: isDevelopment,
    isProd: isProduction,
    demoAllowed: isDemoModeAvailable(),
    warnings
  };
}