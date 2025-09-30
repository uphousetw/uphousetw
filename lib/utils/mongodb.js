// MongoDB connection utility for Vercel serverless functions
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection pooling for serverless
 * Reuses connection across function invocations
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Create new connection
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
  });

  await client.connect();

  const db = client.db('uphouse'); // Database name

  // Cache for reuse
  cachedClient = client;
  cachedDb = db;

  console.log('✅ Connected to MongoDB');

  return { client, db };
}

/**
 * Get a collection from the database
 */
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

/**
 * Check if MongoDB is configured and available
 */
export function isMongoDBConfigured() {
  const isConfigured = !!process.env.MONGODB_URI;
  console.log(`🔍 MongoDB configured: ${isConfigured}, URI exists: ${!!process.env.MONGODB_URI}`);
  if (!isConfigured) {
    console.log('⚠️  MONGODB_URI not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
  }
  return isConfigured;
}