// Google OAuth callback handler
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Initialize Google OAuth client
const oauth2Client = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
  ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'http://localhost:60807/.netlify/functions/auth-callback')
  : null;

export const handler = async (event, context) => {
  if (!oauth2Client) {
    return {
      statusCode: 302,
      headers: {
        'Location': '/admin?error=OAuth not configured'
      },
      body: ''
    };
  }

  const { code, error, state } = event.queryStringParameters || {};

  // Handle OAuth errors
  if (error) {
    return {
      statusCode: 302,
      headers: {
        'Location': `/admin?error=${encodeURIComponent(error)}`
      },
      body: ''
    };
  }

  if (!code) {
    return {
      statusCode: 302,
      headers: {
        'Location': '/admin?error=No authorization code received'
      },
      body: ''
    };
  }

  try {
    // Set redirect URI for this callback
    const redirectUri = `${event.headers.origin || 'http://localhost:60807'}/.netlify/functions/auth-callback`;

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
      return {
        statusCode: 302,
        headers: {
          'Location': `/admin?error=${encodeURIComponent(`Access denied. Email ${userInfo.email} is not authorized.`)}`
        },
        body: ''
      };
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

    // Redirect back to admin with token
    return {
      statusCode: 302,
      headers: {
        'Location': `/admin?token=${jwtToken}`,
        'Set-Cookie': `auth_token=${jwtToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      },
      body: ''
    };

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': `/admin?error=${encodeURIComponent(`OAuth failed: ${error.message}`)}`
      },
      body: ''
    };
  }
};