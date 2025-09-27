// About us management API for admin functions - Vercel
import jwt from 'jsonwebtoken';
import { getAboutData, updateAboutData } from './data/about.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
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
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Access denied - admin required' });
    }

    switch (req.method) {
      case 'GET':
        const aboutData = await getAboutData();
        return res.status(200).json({ about: aboutData });

      case 'PUT':
        const updateData = req.body;
        const updatedAbout = await updateAboutData(updateData);

        return res.status(200).json({
          message: 'About data updated successfully',
          about: updatedAbout
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('About API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}