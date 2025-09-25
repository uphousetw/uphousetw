// Netlify serverless function for authentication
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.split('/').pop();

  try {
    const method = event.queryStringParameters?.method || 'login';

    switch (method) {
      case 'google':
        return await handleGoogleOAuth(event, headers);
      case 'magic-link':
      case 'login':
        return await handleLogin(event, headers);
      case 'verify':
        return await handleVerify(event, headers);
      case 'logout':
        return await handleLogout(event, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid method. Use: google, magic-link, verify, or logout' })
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleLogin(event, headers) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { email, method } = JSON.parse(event.body);

  // Check if email is in admin whitelist
  if (!ADMIN_EMAILS.includes(email)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Access denied' })
    };
  }

  if (method === 'magic-link') {
    // TODO: Implement magic link email
    // For now, return a mock magic link
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    // Check if this is development mode (Netlify dev server or localhost)
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         process.env.NETLIFY_DEV === 'true' ||
                         event.headers.host?.includes('localhost');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Magic link sent to your email',
        // In development, return the token directly for easy testing
        developmentToken: isDevelopment ? token : undefined,
        isDevelopment: isDevelopment
      })
    };
  }

  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: 'Invalid login method' })
  };
}

async function handleVerify(event, headers) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { token } = JSON.parse(event.body);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
      },
      body: JSON.stringify({
        success: true,
        user: {
          email: decoded.email,
          role: decoded.role
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' })
    };
  }
}

async function handleLogout(event, headers) {
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Set-Cookie': 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
    },
    body: JSON.stringify({ success: true })
  };
}

async function handleGoogleOAuth(event, headers) {
  if (!oauth2Client) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      })
    };
  }

  const { httpMethod } = event;

  if (httpMethod === 'GET') {
    // Step 1: Generate Google OAuth URL and redirect
    const redirectUri = `${event.headers.origin || 'http://localhost:60807'}/.netlify/functions/auth-callback`;

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

    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': authorizeUrl
      },
      body: ''
    };
  }

  if (httpMethod === 'POST') {
    // Step 2: Handle OAuth callback with authorization code
    const { code, error } = JSON.parse(event.body);

    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `OAuth error: ${error}` })
      };
    }

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
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
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: `Access denied. Email ${userInfo.email} is not in the admin whitelist.` })
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: jwtToken,
          user: {
            email: userInfo.email,
            name: userInfo.name,
            role: 'admin'
          }
        })
      };

    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `OAuth failed: ${error.message}` })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}