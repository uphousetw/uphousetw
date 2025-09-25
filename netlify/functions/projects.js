// Projects management API for admin functions
import jwt from 'jsonwebtoken';
import {
  getAllProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
} from '../data/projects.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verify admin authentication
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization header missing' })
      };
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
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Access denied - admin required' })
      };
    }

    const { httpMethod, path: requestPath } = event;
    const projectId = requestPath.split('/').pop();

    switch (httpMethod) {
      case 'GET':
        if (projectId && projectId !== 'projects') {
          // Get single project
          const project = await getProjectById(projectId);
          if (!project) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Project not found' })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ project })
          };
        } else {
          // Get all projects
          const projects = await getAllProjects();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              projects: projects,
              total: projects.length
            })
          };
        }

      case 'POST':
        // Create new project
        const newProjectData = JSON.parse(event.body);

        const newProject = await addProject(newProjectData);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            message: 'Project created successfully',
            project: newProject
          })
        };

      case 'PUT':
        // Update existing project
        if (!projectId || projectId === 'projects') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Project ID required for update' })
          };
        }

        const updateData = JSON.parse(event.body);
        const updatedProject = await updateProject(projectId, updateData);

        if (!updatedProject) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Project not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Project updated successfully',
            project: updatedProject
          })
        };

      case 'DELETE':
        // Delete project
        if (!projectId || projectId === 'projects') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Project ID required for deletion' })
          };
        }

        const deletedProject = await deleteProject(projectId);

        if (!deletedProject) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Project not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Project deleted successfully',
            project: deletedProject
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Projects API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};