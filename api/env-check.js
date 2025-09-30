// Environment variable checker for debugging
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const mongoUri = process.env.MONGODB_URI;

  return res.status(200).json({
    backend: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI_exists: !!mongoUri,
      MONGODB_URI_length: mongoUri?.length || 0,
      MONGODB_URI_starts_with: mongoUri?.substring(0, 20) || 'NOT SET',
      MONGODB_URI_contains_srv: mongoUri?.includes('mongodb+srv://') || false,
      MONGODB_URI_full: mongoUri // TEMPORARY - for debugging only, remove after fixing
    },
    note: 'Frontend VITE_ variables are baked into the build, check browser console',
    warning: '⚠️ Full MongoDB URI shown for debugging - remove after fixing!'
  });
}