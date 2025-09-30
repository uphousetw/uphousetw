// Vercel serverless function for authentication
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Read whitelist from file
const WHITELIST_FILE = path.join(__dirname, 'data', 'admin-whitelist.json');

function readWhitelist() {
  // First, check if environment variable is set (for Vercel/production)
  if (process.env.ADMIN_EMAILS) {
    return process.env.ADMIN_EMAILS.split(',').map(email => email.trim());
  }

  // Fall back to file system (for local development)
  try {
    if (!fs.existsSync(WHITELIST_FILE)) {
      // Create default whitelist file
      const dataDir = path.dirname(WHITELIST_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const defaultWhitelist = {
        emails: [],
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(WHITELIST_FILE, JSON.stringify(defaultWhitelist, null, 2));
      return defaultWhitelist.emails;
    }
    const data = fs.readFileSync(WHITELIST_FILE, 'utf8');
    const whitelist = JSON.parse(data);
    return whitelist.emails || [];
  } catch (error) {
    console.error('Error reading whitelist:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req.query;

    switch (method) {
      case 'magic-link':
      case 'login':
        return await handleLogin(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'logout':
        return await handleLogout(req, res);
      default:
        return res.status(400).json({ error: 'Invalid method. Use: magic-link, verify, or logout' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, method } = req.body;

  // Check if email is in admin whitelist
  const whitelist = readWhitelist();

  // Debug logging
  console.log('🔍 Login attempt:', {
    email,
    whitelist,
    envSet: !!process.env.ADMIN_EMAILS,
    envValue: process.env.ADMIN_EMAILS ? '[REDACTED]' : 'not set',
    isMatch: whitelist.includes(email)
  });

  if (!whitelist.includes(email)) {
    return res.status(403).json({
      error: 'Access denied. Your email is not in the admin whitelist.',
      debug: {
        submittedEmail: email,
        whitelistCount: whitelist.length,
        envConfigured: !!process.env.ADMIN_EMAILS
      }
    });
  }

  if (method === 'magic-link') {
    // Generate OTP token
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    // Check if this is development mode
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         req.headers.host?.includes('localhost');

    // TODO: Send email with magic link using email service (SendGrid, AWS SES, etc.)
    // const magicLink = `${req.headers.origin}/admin?token=${token}`;
    // await sendEmail(email, magicLink);

    return res.status(200).json({
      success: true,
      message: 'Magic link sent to your email',
      // In development, return the token directly for easy testing
      developmentToken: isDevelopment ? token : undefined,
      isDevelopment: isDevelopment
    });
  }

  return res.status(400).json({ error: 'Invalid login method' });
}

async function handleVerify(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);

    return res.status(200).json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function handleLogout(req, res) {
  res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  return res.status(200).json({ success: true });
}