// Netlify serverless function for authentication
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

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
    switch (path) {
      case 'login':
        return await handleLogin(event, headers);
      case 'verify':
        return await handleVerify(event, headers);
      case 'logout':
        return await handleLogout(event, headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
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

  if (method === 'google') {
    // TODO: Implement Google OAuth
    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({ error: 'Google OAuth not implemented yet' })
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