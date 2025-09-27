// Projects management API for admin functions - Vercel
import jwt from 'jsonwebtoken';
import {
  getAllProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
} from './data/projects.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;

    // Handle demo token for testing
    if (token === 'demo-token') {
      decoded = { email: 'demo@uphousetw.com', role: 'admin' };
    } else {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Access denied - admin required' });
    }

    // Get project ID from query params
    const projectId = req.query.id;

    switch (req.method) {
      case 'GET':
        if (projectId && projectId !== 'projects') {
          // Get single project
          const project = await getProjectById(projectId);
          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }
          return res.status(200).json({ project });
        } else {
          // Get all projects
          const projects = await getAllProjects();
          return res.status(200).json({
            projects: projects,
            total: projects.length
          });
        }

      case 'POST':
        // Create new project
        const newProjectData = req.body;
        const newProject = await addProject(newProjectData);

        return res.status(201).json({
          message: 'Project created successfully',
          project: newProject
        });

      case 'PUT':
        // Update existing project
        if (!projectId || projectId === 'projects') {
          return res.status(400).json({ error: 'Project ID required for update' });
        }

        const updateData = req.body;
        const updatedProject = await updateProject(projectId, updateData);

        if (!updatedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({
          message: 'Project updated successfully',
          project: updatedProject
        });

      case 'DELETE':
        // Delete project
        if (!projectId || projectId === 'projects') {
          return res.status(400).json({ error: 'Project ID required for deletion' });
        }

        const deletedProject = await deleteProject(projectId);

        if (!deletedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({
          message: 'Project deleted successfully',
          project: deletedProject
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}