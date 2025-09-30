// Consolidated public API endpoint - handles all public data requests and contact submissions
import { getAllProjects, getProjectBySlug } from './data/projects-mongodb.js';
import { getAboutData } from './data/about-mongodb.js';
import { addContact } from './data/contacts-mongodb.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Cache-busting headers to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { resource, slug } = req.query;

    // Handle contact form submission (POST)
    if (req.method === 'POST' && resource === 'contact') {
      return await handleContactSubmission(req, res);
    }

    // Handle GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!resource) {
      return res.status(400).json({ error: 'Resource type required (projects, about)' });
    }

    switch (resource) {
      case 'projects':
        return await handlePublicProjects(req, res, slug);
      case 'about':
        return await handlePublicAbout(req, res);
      default:
        return res.status(400).json({ error: 'Invalid resource type' });
    }

  } catch (error) {
    console.error('Public API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handlePublicProjects(req, res, slug) {
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
}

async function handlePublicAbout(req, res) {
  const aboutData = await getAboutData();
  return res.status(200).json({ about: aboutData });
}

async function handleContactSubmission(req, res) {
  try {
    const { name, phone, email, project, message } = req.body;

    // Validate required fields
    if (!name || !phone || !project || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'phone', 'project', 'message']
      });
    }

    // Create contact message object
    const contactData = {
      name,
      phone,
      email: email || null,
      project,
      message
    };

    // Save to data storage using our data layer
    const savedContact = await addContact(contactData);

    console.log('Contact form submission saved:', {
      id: savedContact.id,
      project: savedContact.project,
      timestamp: savedContact.createdAt
    });

    // TODO: Implement email sending
    // await sendEmailNotification(savedContact);

    return res.status(200).json({
      success: true,
      message: '訊息已送出，我們會盡快與您聯絡',
      id: savedContact.id
    });

  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: '系統錯誤，請稍後再試'
    });
  }
}