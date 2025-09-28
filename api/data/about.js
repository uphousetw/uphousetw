// Shared about us data for both admin and public APIs
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'api', 'data', 'about-data.json');

// Dynamic default data that gets created when file doesn't exist
function createDefaultAbout() {
  return {
    title: '向上建設',
    intro: '昇昊營造有限公司成立於2015年，專注於住宅與商辦建設。我們秉持「品質第一、客戶至上」的經營理念，致力於提供優質的建築服務。',
    mission: '我們致力於打造安全耐用的建築，為客戶創造美觀、宜居的生活空間',
    vision: '打造兼顧美學、環境與社區價值的未來城市',
    brandPrinciplesSubtitle: '美感中築夢，品質中紮根',
    principles: [
      {
        icon: '🏗️',
        title: '品質與安全',
        description: '嚴格執行品質管制，確保施工安全與建築品質。'
      },
      {
        icon: '⏰',
        title: '準時交付',
        description: '合理規劃工期，確保專案按時完成交付。'
      },
      {
        icon: '💬',
        title: '透明溝通',
        description: '與客戶保持密切溝通，即時回應需求與問題。'
      }
    ],
    achievements: [
      {
        number: '100+',
        label: '完成專案'
      },
      {
        number: '8年',
        label: '營運經驗'
      },
      {
        number: '500+',
        label: '滿意客戶'
      }
    ],
    milestones: [
      {
        year: '2015',
        event: '公司成立'
      },
      {
        year: '2020',
        event: '業務擴展至商辦建設'
      },
      {
        year: '2025',
        event: '邁向永續建築'
      }
    ],
    team: {
      title: '專業團隊',
      description: '我們擁有經驗豐富的建築師、工程師和施工團隊，為每個專案提供專業的技術支援。',
      members: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Helper function to load about data from file
async function loadAbout() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    console.log('✅ Loading existing backend data from:', DATA_FILE);
    return parsedData;
  } catch (error) {
    console.log('📝 Creating new about-data.json file with dynamic default data');
    // Create the file with dynamic default data if it doesn't exist
    const newAboutData = createDefaultAbout();
    await saveAbout(newAboutData);
    console.log('✅ Successfully created new about-data.json with complete data structure');
    return newAboutData;
  }
}

// Helper function to save about data to file with retry logic
async function saveAbout(aboutData, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  try {
    // Ensure the directory exists
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });

    // Write the file with proper error handling
    const jsonString = JSON.stringify(aboutData, null, 2);
    await fs.writeFile(DATA_FILE, jsonString, 'utf8');

    // Verify the file was written correctly
    const verifyData = await fs.readFile(DATA_FILE, 'utf8');
    const parsedVerify = JSON.parse(verifyData);

    if (parsedVerify.updatedAt !== aboutData.updatedAt) {
      throw new Error('Data verification failed - file content mismatch');
    }

    console.log('✅ Successfully saved and verified backend data to:', DATA_FILE);
    return aboutData;
  } catch (error) {
    console.error(`❌ Failed to save about data (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);

    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return saveAbout(aboutData, retryCount + 1);
    }

    // All retries failed - this is a critical error
    throw new Error(`Failed to save data after ${maxRetries + 1} attempts: ${error.message}`);
  }
}

// API functions
export async function getAboutData() {
  return await loadAbout();
}

// Data consistency verification function
async function verifyDataConsistency(expectedData) {
  try {
    const fileData = await loadAbout();

    // Compare critical fields
    const criticalFields = ['title', 'intro', 'mission', 'vision', 'updatedAt'];
    for (const field of criticalFields) {
      if (fileData[field] !== expectedData[field]) {
        console.warn(`⚠️ Data inconsistency detected in field '${field}':`, {
          expected: expectedData[field],
          actual: fileData[field]
        });
        return false;
      }
    }

    console.log('✅ Data consistency verified');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify data consistency:', error.message);
    return false;
  }
}

export async function updateAboutData(updates) {
  console.log('🔄 Starting updateAboutData with updates:', JSON.stringify(updates, null, 2));

  const currentData = await loadAbout();
  console.log('📖 Current data loaded, title:', currentData.title);

  const updatedData = {
    ...currentData,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  console.log('📝 New data prepared, title:', updatedData.title);
  console.log('📝 New updatedAt:', updatedData.updatedAt);

  // Save the data
  const savedData = await saveAbout(updatedData);

  // Verify the data was saved correctly
  const isConsistent = await verifyDataConsistency(savedData);
  if (!isConsistent) {
    throw new Error('Data consistency check failed after save operation');
  }

  console.log('✅ About data updated and verified successfully');
  console.log('📊 Final saved data title:', savedData.title);
  return savedData;
}