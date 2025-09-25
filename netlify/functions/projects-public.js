// Public projects API for frontend display
// This endpoint doesn't require authentication
import {
  getAllProjects,
  getProjectBySlug
} from '../data/projects.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const { httpMethod, path: requestPath } = event;

    if (httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Extract slug from path if it exists
    const pathParts = requestPath.split('/');
    const slug = pathParts[pathParts.length - 1];

    if (slug && slug !== 'projects-public') {
      // Get single project by slug
      const project = await getProjectBySlug(slug);
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
      // Get all projects for public display
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

  } catch (error) {
    console.error('Public projects API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};