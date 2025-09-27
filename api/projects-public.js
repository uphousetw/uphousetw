// Public projects API for frontend display - Vercel
import { getAllProjects, getProjectBySlug } from './data/projects.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (slug) {
      // Get single project by slug
      const project = await getProjectBySlug(slug);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json({ project });
    } else {
      // Get all projects for public display
      const projects = await getAllProjects();
      return res.status(200).json({
        projects: projects,
        total: projects.length
      });
    }

  } catch (error) {
    console.error('Public projects API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}