// Image deletion API for Cloudinary - requires API secret
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth, logAdminAction } from '../utils/auth.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');

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
    logAdminAction(user, 'delete_image', { publicId: req.body.public_id });

    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return res.status(200).json({
        message: 'Image deleted successfully',
        public_id: public_id
      });
    } else {
      return res.status(400).json({
        error: 'Failed to delete image',
        details: result
      });
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}