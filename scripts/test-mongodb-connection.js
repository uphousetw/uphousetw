// Test MongoDB Atlas connection
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '../.env'), 'utf-8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      const match = line.match(/^MONGODB_URI=(.+)$/);
      if (match) {
        return match[1].trim();
      }
    }
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
  return null;
}

const MONGODB_URI = process.env.MONGODB_URI || loadEnv();

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function testConnection() {
  console.log('🔌 Testing MongoDB Atlas connection...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    console.log('⏳ Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Get database
    const db = client.db('uphouse');

    // List collections
    console.log('📋 Checking database collections...');
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('   No collections found (database is empty - ready for migration)');
    } else {
      console.log(`   Found ${collections.length} collections:`);
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    }

    console.log('\n✅ Connection test successful!');
    console.log('🚀 You can now run: npm run migrate:mongodb');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Check your MongoDB URI is correct');
    console.error('2. Verify your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('3. Confirm your database user credentials are correct');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();