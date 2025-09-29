// About us management API for admin functions - Vercel
import { getAboutData, updateAboutData } from './data/about.js';
import { requireAuth, logAdminAction } from './utils/auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');

  // Cache-busting headers to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Secure authentication check
    const auth = requireAuth(req, res);
    if (!auth.valid) {
      return; // Response already sent by requireAuth
    }

    const user = req.user;

    switch (req.method) {
      case 'GET':
        const aboutData = await getAboutData();
        return res.status(200).json({ about: aboutData });

      case 'PUT':
        console.log('🔍 DEBUG - Raw request body:', req.body);
        console.log('🔍 DEBUG - Request headers:', req.headers);

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