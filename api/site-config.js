const fs = require('fs');
const path = require('path');

// Path to the site configuration data file
const siteConfigPath = path.join(__dirname, 'data', 'site-config.json');

// Ensure data directory exists
const dataDir = path.dirname(siteConfigPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default site config
const defaultSiteConfig = {
  logo: "uphouse/logo/icon_uphouse",
  favicon: "uphouse/logo/favicon",
  companyName: "向上建設",
  gallery: [],
  updatedAt: new Date().toISOString()
};

// Initialize file if it doesn't exist
if (!fs.existsSync(siteConfigPath)) {
  fs.writeFileSync(siteConfigPath, JSON.stringify(defaultSiteConfig, null, 2));
}

// Read site config data
function readSiteConfig() {
  try {
    const data = fs.readFileSync(siteConfigPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site config:', error);
    return defaultSiteConfig;
  }
}

// Write site config data
function writeSiteConfig(config) {
  try {
    const updatedConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(siteConfigPath, JSON.stringify(updatedConfig, null, 2));
    return updatedConfig;
  } catch (error) {
    console.error('Error writing site config:', error);
    throw error;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const config = readSiteConfig();
      return res.status(200).json({
        config,
        message: 'Site configuration retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to read site configuration'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updatedConfig = writeSiteConfig(req.body);
      return res.status(200).json({
        config: updatedConfig,
        message: 'Site configuration updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to update site configuration'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}