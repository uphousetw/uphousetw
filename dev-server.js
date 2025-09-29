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

// Route handlers
app.all('/api/about-public', async (req, res) => {
  const handler = await importHandler('./api/about-public.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/about', async (req, res) => {
  const handler = await importHandler('./api/about.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/projects-public', async (req, res) => {
  const handler = await importHandler('./api/projects-public.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/projects', async (req, res) => {
  const handler = await importHandler('./api/projects.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/contacts', async (req, res) => {
  const handler = await importHandler('./api/contacts.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/contact', async (req, res) => {
  const handler = await importHandler('./api/contact.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/images', async (req, res) => {
  const handler = await importHandler('./api/images.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

app.all('/api/images/delete', async (req, res) => {
  const handler = await importHandler('./api/images/delete.js');
  if (handler) {
    await handler(req, res);
  } else {
    res.status(500).json({ error: 'Handler not found' });
  }
});

// Site configuration endpoint
app.get('/api/site-config', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    config: {
      logo: "uphouse/logo/icon_uphouse",
      favicon: "uphouse/logo/favicon",
      companyName: "向上建設",
      gallery: [],
      updatedAt: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log('📋 Registered routes:');
  console.log('  - /api/about-public');
  console.log('  - /api/about');
  console.log('  - /api/projects-public');
  console.log('  - /api/projects');
  console.log('  - /api/contacts');
  console.log('  - /api/contact');
  console.log('  - /api/images');
  console.log('  - /api/images/delete');
  console.log('  - /api/site-config');
});