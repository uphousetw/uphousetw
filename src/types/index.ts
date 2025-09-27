export interface Project {
  slug: string;
  title: string;
  category: '透天' | '華廈' | '電梯大樓' | '其他';
  year: number;
  location: string;
  summary: string;
  coverUrl: string;
  facts: {
    地點: string;
    類別: string;
    年份: string;
    完工日: string;
  };
  body: string;
}

export interface AboutUs {
  title: string;
  intro: string;
  mission?: string;
  vision?: string;
  principles: (string | {
    icon?: string;
    title: string;
    description: string;
  })[];
  milestones: {
    year: number;
    event: string;
  }[];
}

export interface ContactMessage {
  name: string;
  phone: string;
  email?: string;
  project: '透天' | '華廈' | '電梯大樓' | '其他';
  message: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  name: string;
}