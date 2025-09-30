// MongoDB Migration Script - Migrate existing JSON data to MongoDB Atlas
// Run this script ONCE after setting up MongoDB Atlas to migrate your existing data

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
const DATABASE_NAME = 'uphouse';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Please add your MongoDB Atlas connection string to .env file');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting MongoDB migration...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db(DATABASE_NAME);

    // 1. Migrate About Data
    console.log('📄 Migrating about data...');
    try {
      const aboutData = JSON.parse(
        readFileSync(join(__dirname, '../api/data/about-data.json'), 'utf-8')
      );
      await db.collection('about').updateOne(
        { key: 'main' },
        { $set: { ...aboutData, key: 'main' } },
        { upsert: true }
      );
      console.log('✅ About data migrated\n');
    } catch (error) {
      console.log('⚠️  About data not found or already migrated\n');
    }

    // 2. Migrate Projects
    console.log('📁 Migrating projects...');
    try {
      const projectsData = JSON.parse(
        readFileSync(join(__dirname, '../api/data/projects-data.json'), 'utf-8')
      );

      if (Array.isArray(projectsData) && projectsData.length > 0) {
        // Clear existing projects to avoid duplicates
        await db.collection('projects').deleteMany({});

        // Insert projects
        const result = await db.collection('projects').insertMany(projectsData);
        console.log(`✅ ${result.insertedCount} projects migrated\n`);
      } else {
        console.log('⚠️  No projects to migrate\n');
      }
    } catch (error) {
      console.log('⚠️  Projects not found or already migrated\n');
    }

    // 3. Migrate Contacts
    console.log('📧 Migrating contacts...');
    try {
      const contactsData = JSON.parse(
        readFileSync(join(__dirname, '../api/data/contacts-data.json'), 'utf-8')
      );

      if (Array.isArray(contactsData) && contactsData.length > 0) {
        // Clear existing contacts to avoid duplicates
        await db.collection('contacts').deleteMany({});

        const result = await db.collection('contacts').insertMany(contactsData);
        console.log(`✅ ${result.insertedCount} contacts migrated\n`);
      } else {
        console.log('⚠️  No contacts to migrate\n');
      }
    } catch (error) {
      console.log('⚠️  Contacts not found or already migrated\n');
    }

    // 4. Migrate Images
    console.log('🖼️  Migrating images...');
    try {
      const imagesData = JSON.parse(
        readFileSync(join(__dirname, '../api/data/images.json'), 'utf-8')
      );

      if (Array.isArray(imagesData) && imagesData.length > 0) {
        // Clear existing images to avoid duplicates
        await db.collection('images').deleteMany({});

        const result = await db.collection('images').insertMany(imagesData);
        console.log(`✅ ${result.insertedCount} images migrated\n`);
      } else {
        console.log('⚠️  No images to migrate\n');
      }
    } catch (error) {
      console.log('⚠️  Images not found or already migrated\n');
    }

    // 5. Migrate Site Config
    console.log('⚙️  Migrating site configuration...');
    try {
      const configData = JSON.parse(
        readFileSync(join(__dirname, '../api/data/site-config.json'), 'utf-8')
      );
      await db.collection('config').updateOne(
        { key: 'main' },
        { $set: { ...configData, key: 'main' } },
        { upsert: true }
      );
      console.log('✅ Site configuration migrated\n');
    } catch (error) {
      console.log('⚠️  Site config not found or already migrated\n');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Database Summary:');

    // Show collection counts
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run migration
migrate().catch(console.error);