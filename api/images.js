import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store image metadata
const IMAGES_FILE = path.join(__dirname, 'data', 'images.json');

// Ensure data directory exists
const dataDir = path.dirname(IMAGES_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize images file if it doesn't exist
if (!fs.existsSync(IMAGES_FILE)) {
  fs.writeFileSync(IMAGES_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readImages = () => {
  try {
    const data = fs.readFileSync(IMAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images file:', error);
    return [];
  }
};

const writeImages = (images) => {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing images file:', error);
    return false;
  }
};

// API handler
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all images
        const images = readImages();
        res.status(200).json(images);
        break;

      case 'POST':
        // Add new image
        const { publicId, title = '', description = '', category = 'gallery' } = req.body;

        if (!publicId) {
          return res.status(400).json({ error: 'publicId is required' });
        }

        const images_post = readImages();
        const newImage = {
          id: Date.now().toString(),
          publicId,
          title,
          description,
          category,
          order: images_post.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        images_post.push(newImage);

        if (writeImages(images_post)) {
          res.status(201).json(newImage);
        } else {
          res.status(500).json({ error: 'Failed to save image' });
        }
        break;

      case 'PUT':
        // Update image
        const { id } = req.query;
        const updateData = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Image ID is required' });
        }

        const images_put = readImages();
        const imageIndex = images_put.findIndex(img => img.id === id);

        if (imageIndex === -1) {
          return res.status(404).json({ error: 'Image not found' });
        }

        images_put[imageIndex] = {
          ...images_put[imageIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        if (writeImages(images_put)) {
          res.status(200).json(images_put[imageIndex]);
        } else {
          res.status(500).json({ error: 'Failed to update image' });
        }
        break;

      case 'DELETE':
        // Delete image
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Image ID is required' });
        }

        const images_delete = readImages();
        const filteredImages = images_delete.filter(img => img.id !== deleteId);

        if (filteredImages.length === images_delete.length) {
          return res.status(404).json({ error: 'Image not found' });
        }

        if (writeImages(filteredImages)) {
          res.status(200).json({ message: 'Image deleted successfully' });
        } else {
          res.status(500).json({ error: 'Failed to delete image' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}