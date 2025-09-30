// About data layer with MongoDB
import { getCollection, isMongoDBConfigured } from '../utils/mongodb.js';
import { getAboutData as getAboutFromFile, updateAboutData as updateAboutInFile } from './about.js';

/**
 * Get about/company data
 * Stores as single document with key 'main'
 */
export async function getAboutData() {
  // Check MongoDB at runtime, not at module load
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return getAboutFromFile();
  }

  try {
    const collection = await getCollection('about');
    const doc = await collection.findOne({ key: 'main' });

    if (!doc) {
      // Return default structure if no data exists
      return {
        title: '',
        intro: '',
        mission: '',
        vision: '',
        principles: [],
        milestones: []
      };
    }

    return {
      title: doc.title || '',
      intro: doc.intro || '',
      mission: doc.mission || '',
      vision: doc.vision || '',
      brandPrinciplesSubtitle: doc.brandPrinciplesSubtitle || '',
      principles: doc.principles || [],
      milestones: doc.milestones || [],
      updatedAt: doc.updatedAt
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return getAboutFromFile();
  }
}

/**
 * Update about/company data
 */
export async function updateAboutData(updates) {
  // Check MongoDB at runtime, not at module load
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return updateAboutInFile(updates);
  }

  try {
    const collection = await getCollection('about');

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
      title: result.title || '',
      intro: result.intro || '',
      mission: result.mission || '',
      vision: result.vision || '',
      brandPrinciplesSubtitle: result.brandPrinciplesSubtitle || '',
      principles: result.principles || [],
      milestones: result.milestones || [],
      updatedAt: result.updatedAt
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return updateAboutInFile(updates);
  }
}