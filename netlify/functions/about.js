// About us management API for admin functions
import jwt from 'jsonwebtoken';
import { getAboutData, updateAboutData } from '../data/about.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verify admin authentication
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization header missing' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;

    // Handle demo token for testing
    if (token === 'demo-token') {
      decoded = { email: 'demo@uphousetw.com', role: 'admin' };
    } else {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Access denied - admin required' })
      };
    }

    const { httpMethod } = event;

    switch (httpMethod) {
      case 'GET':
        const aboutData = await getAboutData();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ about: aboutData })
        };

      case 'PUT':
        const updateData = JSON.parse(event.body);
        const updatedAbout = await updateAboutData(updateData);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'About data updated successfully',
            about: updatedAbout
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('About API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};