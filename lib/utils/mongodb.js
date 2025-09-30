// MongoDB connection utility for Vercel serverless functions
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection pooling for serverless
 * Reuses connection across function invocations
 */
export async function connectToDatabase() {
  // Return cached connection if available and test if still alive
  if (cachedClient && cachedDb) {
    try {
      // Ping to verify connection is still alive
      await cachedDb.admin().ping();
      console.log('✅ Using cached MongoDB connection');
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('⚠️  Cached connection dead, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  console.log('🔄 Creating new MongoDB connection...');

  // Create new connection with retry logic
  let lastError;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Connection attempt ${attempt}/${maxRetries}`);

      const client = new MongoClient(uri, {
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 60000,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
      });

      await client.connect();

      const db = client.db('uphouse');

      // Verify connection with ping
      await db.admin().ping();

      // Cache for reuse
      cachedClient = client;
      cachedDb = db;

      console.log('✅ Connected to MongoDB successfully');

      return { client, db };
    } catch (error) {
      lastError = error;
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error('❌ All MongoDB connection attempts failed');
  throw lastError;
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