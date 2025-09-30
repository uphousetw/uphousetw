// Projects data layer with MongoDB
import { getCollection, isMongoDBConfigured } from '../utils/mongodb.js';
import { getAllProjects as getProjectsFromFile, getProjectById as getProjectByIdFromFile, addProject as addProjectToFile, updateProject as updateProjectInFile, deleteProject as deleteProjectFromFile } from './projects.js';

/**
 * Get all projects
 */
export async function getAllProjects() {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return getProjectsFromFile();
  }

  try {
    const collection = await getCollection('projects');
    const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();

    // Convert MongoDB _id to id for frontend compatibility
    return projects.map(project => ({
      ...project,
      id: project._id.toString(),
      _id: undefined
    }));
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return getProjectsFromFile();
  }
}

/**
 * Get single project by ID
 */
export async function getProjectById(projectId) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return getProjectByIdFromFile(projectId);
  }

  try {
    const collection = await getCollection('projects');
    const { ObjectId } = await import('mongodb');

    const project = await collection.findOne({ _id: new ObjectId(projectId) });

    if (!project) return null;

    return {
      ...project,
      id: project._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return getProjectByIdFromFile(projectId);
  }
}

/**
 * Get single project by slug
 */
export async function getProjectBySlug(slug) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    const projects = await getProjectsFromFile();
    return projects.find(p => p.slug === slug);
  }

  try {
    const collection = await getCollection('projects');
    const project = await collection.findOne({ slug });

    if (!project) return null;

    return {
      ...project,
      id: project._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    return null;
  }
}

/**
 * Add new project
 */
export async function addProject(projectData) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return addProjectToFile(projectData);
  }

  try {
    const collection = await getCollection('projects');

    const newProject = {
      ...projectData,
      slug: projectData.slug || projectData.title.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newProject);

    return {
      ...newProject,
      id: result.insertedId.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return addProjectToFile(projectData);
  }
}

/**
 * Update existing project
 */
export async function updateProject(projectId, updates) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return updateProjectInFile(projectId, updates);
  }

  try {
    const collection = await getCollection('projects');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return updateProjectInFile(projectId, updates);
  }
}

/**
 * Delete project
 */
export async function deleteProject(projectId) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return deleteProjectFromFile(projectId);
  }

  try {
    const collection = await getCollection('projects');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndDelete({ _id: new ObjectId(projectId) });

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return deleteProjectFromFile(projectId);
  }
}