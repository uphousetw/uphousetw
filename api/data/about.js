// Shared about us data for both admin and public APIs
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'api', 'data', 'about-data.json');

// Default about data
const defaultAbout = {
  title: '關於昇昊營造',
  intro: '昇昊營造有限公司成立於2015年，專注於住宅與商辦建設。我們秉持「品質第一、客戶至上」的經營理念，致力於提供優質的建築服務。',
  mission: '為客戶創造安全、舒適、美觀的建築空間。',
  vision: '成為台灣最值得信賴的營造品牌。',
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
      event: '昇昊營造有限公司成立'
    },
    {
      year: '2018',
      event: '完成首個大型電梯大樓專案'
    },
    {
      year: '2020',
      event: '建立專業施工團隊，擴大營運規模'
    },
    {
      year: '2023',
      event: '累計完成100個建築專案'
    }
  ],
  team: {
    title: '專業團隊',
    description: '我們擁有經驗豐富的建築師、工程師和施工團隊，為每個專案提供專業的技術支援。',
    members: []
  },
  updatedAt: new Date().toISOString()
};

// Helper function to load about data from file
async function loadAbout() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // In serverless environment, can't write files, return default data
    console.warn('Using default about data (serverless mode)');
    return defaultAbout;
  }
}

// Helper function to save about data to file
async function saveAbout(aboutData) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(aboutData, null, 2), 'utf8');
  } catch (error) {
    console.warn('Cannot save in serverless environment:', error.message);
    // In serverless/production, we can't write to filesystem
    // This is expected behavior - changes won't persist
    return aboutData; // Return the data anyway
  }
}

// API functions
export async function getAboutData() {
  return await loadAbout();
}

export async function updateAboutData(updates) {
  const currentData = await loadAbout();
  const updatedData = {
    ...currentData,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveAbout(updatedData);
  return updatedData;
}