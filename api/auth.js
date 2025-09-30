// Vercel serverless function for authentication
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Initialize Google OAuth client
const oauth2Client = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
  ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'http://localhost:5173/api/auth-callback')
  : null;

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
    const { code, error, state } = req.query;

    // Handle OAuth callback from auth-callback.js functionality
    if (code || error) {
      return await handleOAuthCallback(req, res);
    }

    switch (method) {
      case 'google':
        return await handleGoogleOAuth(req, res);
      case 'magic-link':
      case 'login':
        return await handleLogin(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'logout':
        return await handleLogout(req, res);
      default:
        return res.status(400).json({ error: 'Invalid method. Use: google, magic-link, verify, or logout' });
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
  if (!ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (method === 'magic-link') {
    // TODO: Implement magic link email
    // For now, return a mock magic link
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    // Check if this is development mode
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         req.headers.host?.includes('localhost');

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

async function handleGoogleOAuth(req, res) {
  if (!oauth2Client) {
    return res.status(500).json({
      error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    });
  }

  if (req.method === 'GET') {
    // Step 1: Generate Google OAuth URL and redirect
    const redirectUri = `${req.headers.origin || 'http://localhost:5173'}/api/auth-callback`;

    // Create a new OAuth2Client with the dynamic redirect URI
    const dynamicOAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const authorizeUrl = dynamicOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      include_granted_scopes: true,
      prompt: 'select_account'
    });

    return res.redirect(302, authorizeUrl);
  }

  if (req.method === 'POST') {
    // Step 2: Handle OAuth callback with authorization code
    const { code, error } = req.body;

    if (error) {
      return res.status(400).json({ error: `OAuth error: ${error}` });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json();

      // Check if email is in admin whitelist
      if (!ADMIN_EMAILS.includes(userInfo.email)) {
        return res.status(403).json({ error: `Access denied. Email ${userInfo.email} is not in the admin whitelist.` });
      }

      // Create JWT token
      const jwtToken = jwt.sign(
        {
          email: userInfo.email,
          name: userInfo.name,
          role: 'admin',
          provider: 'google'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        token: jwtToken,
        user: {
          email: userInfo.email,
          name: userInfo.name,
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Google OAuth error:', error);
      return res.status(500).json({ error: `OAuth failed: ${error.message}` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleOAuthCallback(req, res) {
  if (!oauth2Client) {
    return res.redirect('/admin?error=OAuth not configured');
  }

  const { code, error, state } = req.query;

  // Handle OAuth errors
  if (error) {
    return res.redirect(`/admin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect('/admin?error=No authorization code received');
  }

  try {
    // Set redirect URI for this callback
    const redirectUri = `${req.headers.origin || 'http://localhost:5173'}/api/auth`;

    // Create a new OAuth2Client with the correct redirect URI
    const dynamicOAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange authorization code for tokens
    const { tokens } = await dynamicOAuth2Client.getToken(code);
    dynamicOAuth2Client.setCredentials(tokens);

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const userInfo = await userInfoResponse.json();

    // Check if email is in admin whitelist
    if (!ADMIN_EMAILS.includes(userInfo.email)) {
      return res.redirect(`/admin?error=${encodeURIComponent(`Access denied. Email ${userInfo.email} is not authorized.`)}`);
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      {
        email: userInfo.email,
        name: userInfo.name,
        role: 'admin',
        provider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie and redirect back to admin with token
    res.setHeader('Set-Cookie', `auth_token=${jwtToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.redirect(`/admin?token=${jwtToken}`);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`/admin?error=${encodeURIComponent(`OAuth failed: ${error.message}`)}`);
  }
}