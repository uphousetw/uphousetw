// Site config data layer with MongoDB
import { getCollection, isMongoDBConfigured } from '../utils/mongodb.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, 'site-config.json');

const defaultConfig = {
  logo: "uphouse/logo/icon_uphouse",
  favicon: "uphouse/logo/favicon",
  companyName: "向上建設",
  gallery: []
};

/**
 * Fallback file operations
 */
function readConfigFromFile() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return defaultConfig;
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    return defaultConfig;
  }
}

/**
 * Get site configuration
 * Stores as single document with key 'main'
 */
export async function getSiteConfig() {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return readConfigFromFile();
  }

  try {
    const collection = await getCollection('config');
    const doc = await collection.findOne({ key: 'main' });

    if (!doc) {
      return defaultConfig;
    }

    return {
      logo: doc.logo || defaultConfig.logo,
      favicon: doc.favicon || defaultConfig.favicon,
      companyName: doc.companyName || defaultConfig.companyName,
      gallery: doc.gallery || [],
      updatedAt: doc.updatedAt
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return readConfigFromFile();
  }
}

/**
 * Update site configuration
 */
export async function updateSiteConfig(updates) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    try {
      const config = {
        ...readConfigFromFile(),
        ...updates,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      return config;
    } catch (error) {
      console.error('Error writing config file:', error);
      throw error;
    }
  }

  try {
    const collection = await getCollection('config');

    const result = await collection.findOneAndUpdate(
      { key: 'main' },
      {
        $set: {
          ...updates,
          key: 'main',
          updatedAt: new Date().toISOString()
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    return {
      logo: result.logo || defaultConfig.logo,
      favicon: result.favicon || defaultConfig.favicon,
      companyName: result.companyName || defaultConfig.companyName,
      gallery: result.gallery || [],
      updatedAt: result.updatedAt
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    throw error;
  }
}