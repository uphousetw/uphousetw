// Images data layer with MongoDB
// NOTE: Only stores Cloudinary metadata, not actual images!
// Images are hosted on Cloudinary, MongoDB only stores references

import { getCollection, isMongoDBConfigured } from '../utils/mongodb.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_FILE = path.join(__dirname, 'images.json');

/**
 * Fallback file system operations
 */
function readImagesFromFile() {
  try {
    if (!fs.existsSync(IMAGES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(IMAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images file:', error);
    return [];
  }
}

/**
 * Get all images (metadata only, actual images are in Cloudinary)
 */
export async function getAllImages() {
  // Check MongoDB at runtime, not at module load
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured for images, using file system');
    return readImagesFromFile();
  }

  try {
    const collection = await getCollection('images');
    const images = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return images.map(image => ({
      ...image,
      id: image._id.toString(),
      _id: undefined
    }));
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return readImagesFromFile();
  }
}

/**
 * Get single image by ID
 */
export async function getImageById(imageId) {
  if (!USE_MONGODB) {
    const images = readImagesFromFile();
    return images.find(img => img.id === imageId);
  }

  try {
    const collection = await getCollection('images');
    const { ObjectId } = await import('mongodb');

    const image = await collection.findOne({ _id: new ObjectId(imageId) });

    if (!image) return null;

    return {
      ...image,
      id: image._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    return null;
  }
}

/**
 * Add new image metadata (after uploading to Cloudinary)
 * @param {Object} imageData - Must include publicId from Cloudinary
 */
export async function addImage(imageData) {
  if (!USE_MONGODB) {
    const images = readImagesFromFile();
    const newImage = {
      id: Date.now().toString(),
      ...imageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    images.push(newImage);
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
    return newImage;
  }

  try {
    const collection = await getCollection('images');

    const newImage = {
      publicId: imageData.publicId, // Cloudinary reference
      title: imageData.title || '',
      description: imageData.description || '',
      category: imageData.category || 'gallery',
      order: imageData.order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newImage);

    return {
      ...newImage,
      id: result.insertedId.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error saving image metadata:', error);
    throw error;
  }
}

/**
 * Update image metadata
 */
export async function updateImage(imageId, updates) {
  if (!USE_MONGODB) {
    const images = readImagesFromFile();
    const index = images.findIndex(img => img.id === imageId);
    if (index === -1) return null;

    images[index] = {
      ...images[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
    return images[index];
  }

  try {
    const collection = await getCollection('images');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(imageId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    return null;
  }
}

/**
 * Delete image metadata (doesn't delete from Cloudinary!)
 */
export async function deleteImage(imageId) {
  if (!USE_MONGODB) {
    const images = readImagesFromFile();
    const filtered = images.filter(img => img.id !== imageId);
    if (filtered.length === images.length) return null;

    const deleted = images.find(img => img.id === imageId);
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(filtered, null, 2));
    return deleted;
  }

  try {
    const collection = await getCollection('images');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndDelete({ _id: new ObjectId(imageId) });

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    return null;
  }
}