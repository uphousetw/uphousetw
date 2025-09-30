// Test MongoDB write operations with detailed error reporting
import { getCollection, isMongoDBConfigured } from '../lib/utils/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const results = {
    timestamp: new Date().toISOString(),
    mongoConfigured: isMongoDBConfigured(),
    tests: []
  };

  // Test 1: MongoDB Configuration
  results.tests.push({
    name: 'MongoDB Configuration',
    status: results.mongoConfigured ? 'PASS' : 'FAIL',
    details: results.mongoConfigured ? 'MONGODB_URI is set' : 'MONGODB_URI not found'
  });

  if (!results.mongoConfigured) {
    return res.status(200).json(results);
  }

  // Test 2: Connect to MongoDB
  try {
    const collection = await getCollection('test_collection');
    results.tests.push({
      name: 'MongoDB Connection',
      status: 'PASS',
      details: 'Successfully connected to MongoDB'
    });

    // Test 3: Write to MongoDB
    try {
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test write operation'
      };

      console.log('Attempting to insert test document:', testDoc);
      const insertResult = await collection.insertOne(testDoc);
      console.log('Insert result:', insertResult);

      results.tests.push({
        name: 'MongoDB Write Operation',
        status: 'PASS',
        details: {
          message: 'Successfully wrote to MongoDB',
          insertedId: insertResult.insertedId.toString()
        }
      });

      // Test 4: Read back the document
      try {
        const readDoc = await collection.findOne({ _id: insertResult.insertedId });
        results.tests.push({
          name: 'MongoDB Read After Write',
          status: readDoc ? 'PASS' : 'FAIL',
          details: readDoc ? 'Successfully read document back' : 'Could not read document'
        });

        // Test 5: Delete the test document
        try {
          await collection.deleteOne({ _id: insertResult.insertedId });
          results.tests.push({
            name: 'MongoDB Delete Operation',
            status: 'PASS',
            details: 'Successfully deleted test document'
          });
        } catch (deleteError) {
          results.tests.push({
            name: 'MongoDB Delete Operation',
            status: 'FAIL',
            error: deleteError.message,
            stack: deleteError.stack
          });
        }

      } catch (readError) {
        results.tests.push({
          name: 'MongoDB Read After Write',
          status: 'FAIL',
          error: readError.message,
          stack: readError.stack
        });
      }

    } catch (writeError) {
      console.error('Write error:', writeError);
      results.tests.push({
        name: 'MongoDB Write Operation',
        status: 'FAIL',
        error: writeError.message,
        code: writeError.code,
        codeName: writeError.codeName,
        stack: writeError.stack
      });
    }

  } catch (connectionError) {
    console.error('Connection error:', connectionError);
    results.tests.push({
      name: 'MongoDB Connection',
      status: 'FAIL',
      error: connectionError.message,
      stack: connectionError.stack
    });
  }

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const failed = results.tests.filter(t => t.status === 'FAIL').length;
  results.summary = {
    total: results.tests.length,
    passed,
    failed,
    allPassed: failed === 0
  };

  return res.status(200).json(results);
}