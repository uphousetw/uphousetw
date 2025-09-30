// Development server to run Vercel API functions locally
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
const importHandler = async (handlerPath) => {
  try {
    const module = await import(handlerPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to import ${handlerPath}:`, error);
    return null;
  }
};

// Condensed API Route handlers (3 endpoints)

// Admin API - All admin operations
app.all('/api/admin', async (req, res) => {
  const handler = await importHandler('./api/admin.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Admin handler not found' });
  }
});

// Public API - All public data and contact submissions
app.all('/api/public', async (req, res) => {
  const handler = await importHandler('./api/public.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Public handler not found' });
  }
});

// Auth API - Authentication and OAuth
app.all('/api/auth', async (req, res) => {
  const handler = await importHandler('./api/auth.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Auth handler not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 Condensed API endpoints available at http://localhost:${PORT}/api/*`);
  console.log('📋 Registered routes (3 consolidated endpoints):');
  console.log('  🔒 /api/admin    - All admin operations (auth required)');
  console.log('      • ?resource=projects&id=123');
  console.log('      • ?resource=contacts&id=456');
  console.log('      • ?resource=about');
  console.log('      • ?resource=config');
  console.log('      • ?resource=images&id=789');
  console.log('  🌐 /api/public   - Public data & contact submissions');
  console.log('      • ?resource=projects&slug=project-name');
  console.log('      • ?resource=about');
  console.log('      • ?resource=contact (POST)');
  console.log('  🔐 /api/auth     - Authentication & OAuth');
  console.log('      • ?method=magic-link');
  console.log('      • ?method=google');
  console.log('      • ?method=verify');
  console.log('      • ?method=logout');
  console.log('');
  console.log('✨ Condensed from 15 to 3 endpoints for better maintainability!');
});