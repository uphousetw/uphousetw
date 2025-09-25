// Shared projects data for both admin and public APIs
// Uses file system for persistence in serverless environment
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'netlify', 'data', 'projects-data.json');

// Default projects data
const defaultProjects = [
  {
    id: '1',
    slug: 'luxury-apartment-2024',
    title: '豪華電梯大樓',
    category: '電梯大樓',
    year: 2024,
    location: '台北市信義區',
    summary: '現代化電梯大樓，提供舒適的居住環境。',
    coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    facts: {
      地點: '台北市信義區',
      類別: '電梯大樓',
      年份: '2024',
      完工日: '2024-12-31'
    },
    description: '這是一個現代化電梯大樓項目，提供舒適的居住環境。位於台北市信義區的黃金地段，擁有便利的交通和完善的生活機能。建築採用現代化設計理念，結合環保節能材料，為住戶創造優質的生活空間。',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'modern-townhouse-2023',
    title: '現代透天別墅',
    category: '透天',
    year: 2023,
    location: '新北市板橋區',
    summary: '設計精美的現代透天別墅，注重空間利用。',
    coverUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    facts: {
      地點: '新北市板橋區',
      類別: '透天',
      年份: '2023',
      完工日: '2023-10-15'
    },
    description: '設計精美的現代透天別墅，注重空間利用。採用現代簡約風格，結合實用性與美觀性。開放式空間設計增加室內採光，私人花園提供戶外休憩空間。',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'garden-mansion-2024',
    title: '花園華廈',
    category: '華廈',
    year: 2024,
    location: '桃園市中壢區',
    summary: '結合自然景觀的花園華廈建案。',
    coverUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    facts: {
      地點: '桃園市中壢區',
      類別: '華廈',
      年份: '2024',
      完工日: '2024-08-30'
    },
    description: '結合自然景觀的花園華廈建案。周邊綠意盎然，提供住戶優質的居住環境。建築設計融合現代與自然元素，創造和諧的生活空間。',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to load projects from file
async function loadProjects() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, initialize with default data
    await saveProjects(defaultProjects);
    return defaultProjects;
  }
}

// Helper function to save projects to file
async function saveProjects(projects) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save projects:', error);
    throw error;
  }
}

// API functions
export async function getAllProjects() {
  return await loadProjects();
}

export async function getProjectById(id) {
  const projects = await loadProjects();
  return projects.find(p => p.id === id);
}

export async function getProjectBySlug(slug) {
  const projects = await loadProjects();
  return projects.find(p => p.slug === slug);
}

export async function addProject(project) {
  const projects = await loadProjects();
  const newId = projects.length > 0
    ? (Math.max(...projects.map(p => parseInt(p.id))) + 1).toString()
    : '1';

  const slug = project.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Date.now();

  const newProject = {
    id: newId,
    slug: slug,
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);
  await saveProjects(projects);
  return newProject;
}

export async function updateProject(id, updates) {
  const projects = await loadProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveProjects(projects);
  return projects[index];
}

export async function deleteProject(id) {
  const projects = await loadProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const deletedProject = projects.splice(index, 1)[0];
  await saveProjects(projects);
  return deletedProject;
}