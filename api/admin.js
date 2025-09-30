// Consolidated admin API endpoint - handles all admin operations including images
import {
  getAllProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
} from '../lib/data/projects-mongodb.js';
import {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
} from '../lib/data/contacts-mongodb.js';
import { getAboutData, updateAboutData } from '../lib/data/about-mongodb.js';
import { getSiteConfig, updateSiteConfig } from '../lib/data/config-mongodb.js';
import { getAllImages, getImageById, addImage, updateImage, deleteImage } from '../lib/data/images-mongodb.js';
import { requireAuth, logAdminAction } from '../lib/utils/auth.js';
import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Secure authentication check
    const auth = requireAuth(req, res);
    if (!auth.valid) {
      return;
    }

    const { resource, id } = req.query;

    if (!resource) {
      return res.status(400).json({ error: 'Resource type required (projects, contacts, about, config, images)' });
    }

    switch (resource) {
      case 'projects':
        return await handleProjects(req, res, id);
      case 'contacts':
        return await handleContacts(req, res, id);
      case 'about':
        return await handleAbout(req, res);
      case 'config':
        return await handleConfig(req, res);
      case 'images':
        return await handleImages(req, res, id);
      default:
        return res.status(400).json({ error: 'Invalid resource type' });
    }

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleProjects(req, res, projectId) {
  switch (req.method) {
    case 'GET':
      if (projectId && projectId !== 'projects') {
        const project = await getProjectById(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json({ project });
      } else {
        const projects = await getAllProjects();
        return res.status(200).json({
          projects: projects,
          total: projects.length
        });
      }

    case 'POST':
      const newProject = await addProject(req.body);
      return res.status(201).json({
        message: 'Project created successfully',
        project: newProject
      });

    case 'PUT':
      if (!projectId || projectId === 'projects') {
        return res.status(400).json({ error: 'Project ID required for update' });
      }
      try {
        console.log('🔄 Updating project:', projectId, 'with data:', req.body);
        const updatedProject = await updateProject(projectId, req.body);
        if (!updatedProject) {
          console.error('❌ Project not found:', projectId);
          return res.status(404).json({ error: 'Project not found' });
        }
        console.log('✅ Project updated successfully:', projectId);
        return res.status(200).json({
          message: 'Project updated successfully',
          project: updatedProject
        });
      } catch (error) {
        console.error('❌ Error updating project:', error);
        return res.status(500).json({
          error: 'Failed to update project',
          details: error.message
        });
      }

    case 'DELETE':
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
}

async function handleContacts(req, res, contactId) {
  switch (req.method) {
    case 'GET':
      if (contactId && contactId !== 'contacts') {
        const contact = await getContactById(contactId);
        if (!contact) {
          return res.status(404).json({ error: 'Contact not found' });
        }
        return res.status(200).json({ contact });
      } else {
        const contacts = await getAllContacts();
        return res.status(200).json({
          contacts: contacts,
          total: contacts.length
        });
      }

    case 'PUT':
      if (!contactId || contactId === 'contacts') {
        return res.status(400).json({ error: 'Contact ID required for update' });
      }
      const updatedContact = await updateContact(contactId, req.body);
      if (!updatedContact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      return res.status(200).json({
        message: 'Contact updated successfully',
        contact: updatedContact
      });

    case 'DELETE':
      if (!contactId || contactId === 'contacts') {
        return res.status(400).json({ error: 'Contact ID required for deletion' });
      }
      const deletedContact = await deleteContact(contactId);
      if (!deletedContact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      return res.status(200).json({
        message: 'Contact deleted successfully',
        contact: deletedContact
      });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleAbout(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    switch (req.method) {
      case 'GET':
        const aboutData = await getAboutData();
        return res.status(200).json({ about: aboutData });

      case 'PUT':
        console.log('🔍 DEBUG - About PUT request body:', req.body);
        console.log('🔍 DEBUG - Request headers:', req.headers);

        const updatedAbout = await updateAboutData(req.body);
        return res.status(200).json({
          message: 'About data updated successfully',
          about: updatedAbout
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ About API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      message: '儲存失敗，請稍後再試'
    });
  }
}

async function handleConfig(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const config = await getSiteConfig();
        return res.status(200).json({
          config,
          message: 'Site configuration retrieved successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to read site configuration',
          details: error.message
        });
      }

    case 'PUT':
      try {
        const updatedConfig = await updateSiteConfig(req.body);
        return res.status(200).json({
          config: updatedConfig,
          message: 'Site configuration updated successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to update site configuration',
          details: error.message
        });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleImages(req, res, imageId) {
  const { action } = req.query;

  console.log('🖼️ Image handler - action:', action, 'method:', req.method, 'imageId:', imageId);

  // Handle Cloudinary operations
  if (action === 'cloudinary-delete') {
    return await handleCloudinaryDelete(req, res);
  }

  // Handle image upload to Cloudinary (must be before POST switch)
  if (action === 'upload' && req.method === 'POST') {
    console.log('📤 Uploading image via backend...');
    return await handleCloudinaryUpload(req, res);
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all images or single image
        if (imageId && imageId !== 'images') {
          const image = await getImageById(imageId);
          if (!image) {
            return res.status(404).json({ error: 'Image not found' });
          }
          return res.status(200).json({ image });
        } else {
          const images = await getAllImages();
          return res.status(200).json({ images, total: images.length });
        }

      case 'POST':
        // Add new image metadata
        const { publicId, title = '', description = '', category = 'gallery', order } = req.body;

        if (!publicId) {
          return res.status(400).json({ error: 'publicId is required' });
        }

        const images = await getAllImages();
        const newImage = await addImage({
          publicId,
          title,
          description,
          category,
          order: order !== undefined ? order : images.length
        });

        return res.status(201).json({
          message: 'Image created successfully',
          image: newImage
        });

      case 'PUT':
        // Update image metadata
        if (!imageId || imageId === 'images') {
          return res.status(400).json({ error: 'Image ID required for update' });
        }

        const updatedImage = await updateImage(imageId, req.body);
        if (!updatedImage) {
          return res.status(404).json({ error: 'Image not found' });
        }

        return res.status(200).json({
          message: 'Image updated successfully',
          image: updatedImage
        });

      case 'DELETE':
        // Delete image metadata
        if (!imageId || imageId === 'images') {
          return res.status(400).json({ error: 'Image ID required for deletion' });
        }

        const deletedImage = await deleteImage(imageId);
        if (!deletedImage) {
          return res.status(404).json({ error: 'Image not found' });
        }

        return res.status(200).json({
          message: 'Image deleted successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling images:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function handleCloudinaryDelete(req, res) {
  const user = req.user;
  logAdminAction(user, 'delete_image', { publicId: req.body.public_id });

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'public_id is required' });
  }

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return res.status(200).json({
        message: 'Image deleted successfully',
        public_id: public_id
      });
    } else {
      return res.status(400).json({
        error: 'Failed to delete image',
        details: result
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function handleCloudinaryUpload(req, res) {
  const user = req.user;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // For this simplified implementation, we'll expect the file data to be base64 encoded in the request body
    const { fileData, fileName, folder = 'uphouse/gallery' } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'File data is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    // Save image metadata to database
    const images = await getAllImages();
    const newImage = await addImage({
      publicId: result.public_id,
      title: '',
      description: '',
      category: 'gallery',
      order: images.length
    });

    return res.status(200).json({
      message: 'Image uploaded successfully',
      result: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format
      },
      image: newImage
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}