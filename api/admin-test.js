// Simple admin test endpoint to diagnose issues
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    return res.status(200).json({
      status: 'admin endpoint loads',
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}