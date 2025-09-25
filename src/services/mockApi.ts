// Mock API service for Vite development mode
// This provides fallback data when Netlify functions aren't available

const mockProjects = [
  {
    "id": "1",
    "slug": "luxury-apartment-2024",
    "title": "豪華電梯大樓",
    "category": "電梯大樓",
    "year": 2024,
    "location": "台北市信義區",
    "summary": "現代化電梯大樓，提供舒適的居住環境。",
    "coverUrl": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "facts": {
      "地點": "台北市信義區",
      "類別": "電梯大樓",
      "年份": "2024",
      "完工日": "2024-12-31"
    },
    "body": "這是一個現代化電梯大樓項目，提供舒適的居住環境。位於台北市信義區的黃金地段，擁有便利的交通和完善的生活機能。建築採用現代化設計理念，結合環保節能材料，為住戶創造優質的生活空間。",
    "createdAt": "2025-09-25T06:55:53.020Z",
    "updatedAt": "2025-09-25T06:56:01.274Z"
  },
  {
    "id": "2",
    "slug": "modern-townhouse-2023",
    "title": "現代透天別墅",
    "category": "透天",
    "year": 2023,
    "location": "新北市板橋區",
    "summary": "設計精美的現代透天別墅，注重空間利用。",
    "coverUrl": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "facts": {
      "地點": "新北市板橋區",
      "類別": "透天",
      "年份": "2023",
      "完工日": "2023-10-15"
    },
    "body": "設計精美的現代透天別墅，注重空間利用。採用現代簡約風格，結合實用性與美觀性。開放式空間設計增加室內採光，私人花園提供戶外休憩空間。",
    "createdAt": "2025-09-25T06:55:53.020Z",
    "updatedAt": "2025-09-25T06:59:24.334Z"
  }
];

const mockAbout = {
  "title": "向上建設",
  "intro": "昇昊營造有限公司成立於2015年，專注於住宅與商辦建設。我們秉持「品質第一、客戶至上」的經營理念，致力於提供優質的建築服務。",
  "mission": "我們致力於打造安全耐用的建築，為客戶創造美觀、宜居的生活空間",
  "vision": "打造兼顧美學、環境與社區價值的未來城市",
  "principles": [
    {
      "icon": "🏗️",
      "title": "品質與安全",
      "description": "嚴格執行品質管制，確保施工安全與建築品質。"
    },
    {
      "icon": "⏰",
      "title": "準時交付",
      "description": "合理規劃工期，確保專案按時完成交付。"
    },
    {
      "icon": "💬",
      "title": "透明溝通",
      "description": "與客戶保持密切溝通，即時回應需求與問題。"
    }
  ],
  "milestones": [
    {
      "year": "2022",
      "event": "籌立"
    },
    {
      "year": "2025",
      "event": "重要里程碑"
    }
  ]
};

const mockContacts = [
  {
    "id": "6",
    "name": "測試聯絡人",
    "phone": "091222312",
    "email": "example@mail.com",
    "project": "電梯大樓",
    "message": "這是測試聯絡訊息",
    "status": "resolved",
    "createdAt": "2025-09-25T13:34:26.894Z",
    "updatedAt": "2025-09-25T13:40:32.867Z"
  }
];

// Mock API functions that simulate the Netlify functions
export const mockApiService = {
  async getProjects() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { projects: mockProjects, total: mockProjects.length };
  },

  async getAbout() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { about: mockAbout };
  },

  async getContacts() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { contacts: mockContacts, total: mockContacts.length };
  },

  async updateAbout(data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updated = { ...mockAbout, ...data, updatedAt: new Date().toISOString() };
    return { about: updated, message: 'About data updated successfully' };
  },

  async addProject(data: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newProject = {
      id: String(Date.now()),
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { project: newProject, message: 'Project created successfully' };
  },

  async updateProject(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updated = { ...data, id, updatedAt: new Date().toISOString() };
    return { project: updated, message: 'Project updated successfully' };
  },

  async deleteProject(id: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { message: `Project ${id} deleted successfully` };
  },

  async deleteContact(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: `Contact ${id} deleted successfully` };
  },

  async updateContact(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { contact: { ...data, id, updatedAt: new Date().toISOString() }, message: 'Contact updated successfully' };
  }
};

// Helper function to detect if we're in Vite dev mode
export const isViteDevMode = () => {
  return import.meta.env.DEV && (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175');
};

// API service that automatically chooses between real API and mock
export const apiService = {
  async makeRequest(url: string, options: RequestInit = {}) {
    if (isViteDevMode()) {
      // In Vite dev mode, use mock data
      console.log('🔄 Using mock API for development');
      return this.handleMockRequest(url, options);
    }

    // In Netlify dev or production, use real API
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },

  async handleMockRequest(url: string, options: RequestInit) {
    const method = options.method || 'GET';

    if (url.includes('/projects')) {
      if (method === 'GET') return mockApiService.getProjects();
      if (method === 'POST') return mockApiService.addProject(JSON.parse(options.body as string));
      if (method === 'PUT') return mockApiService.updateProject('1', JSON.parse(options.body as string));
      if (method === 'DELETE') return mockApiService.deleteProject('1');
    }

    if (url.includes('/about')) {
      if (method === 'GET') return mockApiService.getAbout();
      if (method === 'PUT') return mockApiService.updateAbout(JSON.parse(options.body as string));
    }

    if (url.includes('/contacts')) {
      if (method === 'GET') return mockApiService.getContacts();
      if (method === 'PUT') return mockApiService.updateContact('1', JSON.parse(options.body as string));
      if (method === 'DELETE') return mockApiService.deleteContact('1');
    }

    throw new Error('Mock API endpoint not found');
  }
};