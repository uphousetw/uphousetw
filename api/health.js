// Health check endpoint - helps debug Vercel deployment issues
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      mongodbConfigured: !!process.env.MONGODB_URI,
      mongodbUriLength: process.env.MONGODB_URI?.length || 0,
      mongodbUriPreview: process.env.MONGODB_URI?.substring(0, 50) + '...',
      nodeVersion: process.version,
      platform: process.platform,
    }
  };

  return res.status(200).json(health);
}