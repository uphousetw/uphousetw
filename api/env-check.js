// Environment variable checker for debugging
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    backend: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
    },
    note: 'Frontend VITE_ variables are baked into the build, check browser console'
  });
}