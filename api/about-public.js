// Public about us API for frontend display - Vercel
import { getAboutData } from './data/about.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Cache-busting headers to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const aboutData = await getAboutData();
    return res.status(200).json({ about: aboutData });

  } catch (error) {
    console.error('Public about API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}