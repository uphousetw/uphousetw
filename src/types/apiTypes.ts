/**
 * API Contract Types - Single Source of Truth
 * This file defines the exact API contracts between frontend and backend
 * to prevent schema misalignment issues
 */

// ===== PROJECT API TYPES =====

export interface ProjectFacts {
  地點: string;
  類別: string;
  年份: string;
  完工日: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: '透天' | '華廈' | '電梯大樓' | '其他';
  year: number;
  location: string;
  summary: string;
  description: string; // Full content - BACKEND HAS THIS
  coverUrl: string;
  images?: string[]; // Image gallery - BACKEND HAS THIS
  facts: ProjectFacts;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  project: Project;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

// ===== ABOUT API TYPES =====

export interface AboutPrinciple {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutMilestone {
  year: string;
  event: string;
}

export interface AboutAchievement {
  number: string;
  label: string;
}

export interface AboutTeam {
  title: string;
  description: string;
  members: any[]; // Can be expanded as needed
}

export interface AboutUs {
  title: string;
  intro: string;
  mission: string;
  vision: string;
  brandPrinciplesSubtitle?: string;
  principles: AboutPrinciple[];
  achievements: AboutAchievement[];
  milestones: AboutMilestone[];
  team: AboutTeam;
  updatedAt: string;
}

export interface AboutResponse {
  about: AboutUs;
}

// ===== CONTACT API TYPES =====

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  project: string;
  message: string;
  status: 'new' | 'read' | 'processed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  contacts: ContactMessage[];
  total: number;
}

// ===== SITE CONFIG API TYPES =====

export interface SiteConfig {
  logo: string;
  favicon: string;
  companyName: string;
  gallery: any[];
  updatedAt: string;
}

export interface SiteConfigResponse {
  config: SiteConfig;
}

// ===== API ERROR TYPES =====

export interface ApiError {
  error: string;
  details?: string;
}

// ===== VALIDATION HELPERS =====

export function isProject(obj: any): obj is Project {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.year === 'number' &&
    obj.facts && typeof obj.facts === 'object';
}

export function isAboutUs(obj: any): obj is AboutUs {
  return obj &&
    typeof obj.title === 'string' &&
    typeof obj.intro === 'string' &&
    Array.isArray(obj.principles) &&
    Array.isArray(obj.milestones);
}

// ===== SCHEMA MIGRATION HELPERS =====

/**
 * Transforms legacy mock data to match backend schema
 */
export function migrateLegacyProject(legacyProject: any): Project {
  return {
    ...legacyProject,
    description: legacyProject.description || legacyProject.body || legacyProject.summary,
    images: legacyProject.images || [],
  };
}

/**
 * Transforms legacy mock about data to match backend schema
 */
export function migrateLegacyAbout(legacyAbout: any): AboutUs {
  // Handle string-based principles (legacy format)
  const principles = legacyAbout.principles?.map((p: any) => {
    if (typeof p === 'string') {
      // Convert string principles to object format
      const descriptions: Record<string, string> = {
        '品質與安全': '嚴格執行品質管制，確保施工安全與建築品質。',
        '準時交付': '合理規劃工期，確保建案按時完成交付。',
        '透明溝通': '與客戶保持密切溝通，即時回應需求與問題。'
      };
      const icons: Record<string, string> = {
        '品質與安全': '🏗️',
        '準時交付': '⏰',
        '透明溝通': '💬'
      };
      return {
        icon: icons[p] || '✨',
        title: p,
        description: descriptions[p] || ''
      };
    }
    return p;
  }) || [];

  return {
    title: legacyAbout.title || '關於我們',
    intro: legacyAbout.intro || '',
    mission: legacyAbout.mission || '為客戶創造優質的建築空間',
    vision: legacyAbout.vision || '成為最值得信賴的建設公司',
    brandPrinciplesSubtitle: legacyAbout.brandPrinciplesSubtitle,
    principles,
    achievements: legacyAbout.achievements || [],
    milestones: legacyAbout.milestones || [],
    team: legacyAbout.team || {
      title: '專業團隊',
      description: '擁有經驗豐富的專業團隊',
      members: []
    },
    updatedAt: legacyAbout.updatedAt || new Date().toISOString()
  };
}