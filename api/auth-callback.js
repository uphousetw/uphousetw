// Google OAuth callback handler for Vercel
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
    const redirectUri = `${req.headers.origin || 'http://localhost:5173'}/api/auth-callback`;

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