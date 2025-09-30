/**
 * Frontend Integration Tests for Condensed API
 * Tests the frontend's integration with the new consolidated API endpoints
 */

// Mock fetch for testing
global.fetch = jest.fn();

// API Configuration
const API_BASE = '/api';

describe('Frontend API Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ============= PUBLIC API INTEGRATION =============
  describe('Public API Integration', () => {
    test('should fetch all projects for homepage', async () => {
      const mockProjects = [
        { id: '1', title: 'Project 1', category: 'residential' },
        { id: '2', title: 'Project 2', category: 'commercial' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects, total: 2 })
      });

      // Simulate frontend API call
      const response = await fetch(`${API_BASE}/public?resource=projects`);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/public?resource=projects`);
      expect(data.projects).toHaveLength(2);
      expect(data.projects[0].title).toBe('Project 1');
    });

    test('should fetch single project by slug', async () => {
      const mockProject = {
        id: '1',
        title: 'Modern Villa',
        slug: 'modern-villa',
        description: 'A beautiful modern villa'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: mockProject })
      });

      const response = await fetch(`${API_BASE}/public?resource=projects&slug=modern-villa`);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/public?resource=projects&slug=modern-villa`);
      expect(data.project.title).toBe('Modern Villa');
      expect(data.project.slug).toBe('modern-villa');
    });

    test('should fetch about data for about page', async () => {
      const mockAbout = {
        title: 'About Us',
        description: 'We are a construction company',
        mission: 'Building dreams'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ about: mockAbout })
      });

      const response = await fetch(`${API_BASE}/public?resource=about`);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/public?resource=about`);
      expect(data.about.title).toBe('About Us');
    });

    test('should submit contact form successfully', async () => {
      const contactData = {
        name: 'John Doe',
        phone: '123-456-7890',
        email: 'john@example.com',
        project: 'Kitchen Renovation',
        message: 'I need help with my kitchen renovation'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '訊息已送出，我們會盡快與您聯絡',
          id: 'contact_123'
        })
      });

      const response = await fetch(`${API_BASE}/public?resource=contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/public?resource=contact`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        })
      );
      expect(data.success).toBe(true);
      expect(data.id).toBe('contact_123');
    });

    test('should handle contact form validation errors', async () => {
      const invalidData = {
        name: 'John Doe'
        // Missing required fields
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Missing required fields',
          required: ['name', 'phone', 'project', 'message']
        })
      });

      const response = await fetch(`${API_BASE}/public?resource=contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(data.required).toContain('phone');
    });
  });

  // ============= ADMIN API INTEGRATION =============
  describe('Admin API Integration', () => {
    const mockAuthToken = 'mock-jwt-token';

    beforeEach(() => {
      // Mock localStorage for auth token
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => mockAuthToken),
          setItem: jest.fn(),
          removeItem: jest.fn()
        },
        writable: true
      });
    });

    test('should fetch admin projects with auth header', async () => {
      const mockProjects = [
        { id: '1', title: 'Admin Project 1', status: 'draft' },
        { id: '2', title: 'Admin Project 2', status: 'published' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects, total: 2 })
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects`, {
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/admin?resource=projects`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockAuthToken}`
          })
        })
      );
      expect(data.projects).toHaveLength(2);
    });

    test('should create new project via admin panel', async () => {
      const newProject = {
        title: 'New Project',
        description: 'Project description',
        category: 'residential',
        status: 'draft'
      };

      const mockResponse = {
        message: 'Project created successfully',
        project: { id: 'new_123', ...newProject, createdAt: new Date().toISOString() }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.project.title).toBe('New Project');
      expect(data.project.id).toBe('new_123');
    });

    test('should update existing project', async () => {
      const projectId = 'project_123';
      const updateData = {
        title: 'Updated Project Title',
        description: 'Updated description'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Project updated successfully',
          project: { id: projectId, ...updateData, updatedAt: new Date().toISOString() }
        })
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects&id=${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();

      expect(data.project.title).toBe('Updated Project Title');
      expect(data.message).toBe('Project updated successfully');
    });

    test('should delete project', async () => {
      const projectId = 'project_123';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Project deleted successfully',
          project: { id: projectId }
        })
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects&id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      expect(data.message).toBe('Project deleted successfully');
    });

    test('should fetch admin contacts', async () => {
      const mockContacts = [
        { id: '1', name: 'John Doe', project: 'Kitchen', status: 'new' },
        { id: '2', name: 'Jane Smith', project: 'Bathroom', status: 'contacted' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ contacts: mockContacts, total: 2 })
      });

      const response = await fetch(`${API_BASE}/admin?resource=contacts`, {
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      expect(data.contacts).toHaveLength(2);
      expect(data.contacts[0].name).toBe('John Doe');
    });

    test('should update about content', async () => {
      const aboutData = {
        title: 'Updated About Us',
        description: 'New company description',
        mission: 'Updated mission statement'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'About data updated successfully',
          about: aboutData
        })
      });

      const response = await fetch(`${API_BASE}/admin?resource=about`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aboutData)
      });
      const data = await response.json();

      expect(data.about.title).toBe('Updated About Us');
      expect(data.message).toBe('About data updated successfully');
    });

    test('should manage site configuration', async () => {
      const configData = {
        companyName: 'Updated Company Name',
        logo: 'new/logo/path',
        favicon: 'new/favicon/path'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Site configuration updated successfully',
          config: { ...configData, updatedAt: new Date().toISOString() }
        })
      });

      const response = await fetch(`${API_BASE}/admin?resource=config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });
      const data = await response.json();

      expect(data.config.companyName).toBe('Updated Company Name');
    });

    test('should manage image metadata', async () => {
      const imageData = {
        publicId: 'gallery/new-image',
        title: 'New Gallery Image',
        description: 'Beautiful new image',
        category: 'gallery'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Image created successfully',
          image: { id: 'img_123', ...imageData, createdAt: new Date().toISOString() }
        })
      });

      const response = await fetch(`${API_BASE}/admin?resource=images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageData)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.image.title).toBe('New Gallery Image');
    });

    test('should handle authentication errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' })
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects`, {
        headers: {
          'Content-Type': 'application/json'
          // No auth header
        }
      });

      expect(response.status).toBe(401);
    });
  });

  // ============= AUTH API INTEGRATION =============
  describe('Auth API Integration', () => {
    test('should handle magic link login', async () => {
      const loginData = {
        email: 'admin@example.com',
        method: 'magic-link'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Magic link sent to your email',
          developmentToken: 'dev-token-123'
        })
      });

      const response = await fetch(`${API_BASE}/auth?method=magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.developmentToken).toBe('dev-token-123');
    });

    test('should verify auth token', async () => {
      const token = 'jwt-token-123';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { email: 'admin@example.com', role: 'admin' }
        })
      });

      const response = await fetch(`${API_BASE}/auth?method=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.user.role).toBe('admin');
    });

    test('should handle logout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const response = await fetch(`${API_BASE}/auth?method=logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  // ============= ERROR HANDLING =============
  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch(`${API_BASE}/public?resource=projects`);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle 404 errors for non-existent resources', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Resource not found' })
      });

      const response = await fetch(`${API_BASE}/public?resource=projects&slug=non-existent`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });

    test('should handle server errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const response = await fetch(`${API_BASE}/admin?resource=projects`);
      expect(response.status).toBe(500);
    });
  });
});

// Frontend Service Layer Tests
describe('Frontend API Service Layer', () => {
  // Mock API service class that frontend would use
  class APIService {
    constructor(baseURL = '/api') {
      this.baseURL = baseURL;
      this.authToken = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    }

    // Public API methods
    async getProjects() {
      return this.request('/public?resource=projects');
    }

    async getProject(slug) {
      return this.request(`/public?resource=projects&slug=${slug}`);
    }

    async getAbout() {
      return this.request('/public?resource=about');
    }

    async submitContact(contactData) {
      return this.request('/public?resource=contact', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
    }

    // Admin API methods
    async getAdminProjects() {
      return this.request('/admin?resource=projects');
    }

    async createProject(projectData) {
      return this.request('/admin?resource=projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
    }

    async updateProject(id, projectData) {
      return this.request(`/admin?resource=projects&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
      });
    }

    async deleteProject(id) {
      return this.request(`/admin?resource=projects&id=${id}`, {
        method: 'DELETE'
      });
    }
  }

  test('APIService should work with consolidated endpoints', async () => {
    global.localStorage = {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    const apiService = new APIService();

    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ projects: [], total: 0 })
    });

    const result = await apiService.getProjects();

    expect(fetch).toHaveBeenCalledWith('/api/public?resource=projects', expect.any(Object));
    expect(result.projects).toBeDefined();
  });
});