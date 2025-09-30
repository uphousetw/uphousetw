// Debug admin endpoint - test imports one by one
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Test 1: Basic response
    const result = { test: 'basic response works' };

    // Test 2: Import auth
    const { requireAuth } = await import('../lib/utils/auth.js');
    result.authImport = 'success';

    // Test 3: Import projects
    const { getAllProjects } = await import('../lib/data/projects-mongodb.js');
    result.projectsImport = 'success';

    // Test 4: Import contacts
    const { getAllContacts } = await import('../lib/data/contacts-mongodb.js');
    result.contactsImport = 'success';

    // Test 5: Import about
    const { getAboutData } = await import('../lib/data/about-mongodb.js');
    result.aboutImport = 'success';

    // Test 6: Import config
    const { getSiteConfig } = await import('../lib/data/config-mongodb.js');
    result.configImport = 'success';

    // Test 7: Import images
    const { getAllImages } = await import('../lib/data/images-mongodb.js');
    result.imagesImport = 'success';

    // Test 8: Import cloudinary
    const { v2: cloudinary } = await import('cloudinary');
    result.cloudinaryImport = 'success';

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}