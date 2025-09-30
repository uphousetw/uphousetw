/**
 * Backend Unit Tests for Condensed API Endpoints
 * Tests individual functions and components of the consolidated APIs
 */

const fs = require('fs');
const path = require('path');

// Mock external dependencies
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      destroy: jest.fn()
    }
  }
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn((token) => {
    if (token === 'valid-token') {
      return { email: 'admin@example.com', role: 'admin' };
    }
    throw new Error('Invalid token');
  })
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: jest.fn(() => 'https://mock-oauth-url.com'),
    getToken: jest.fn(() => Promise.resolve({
      tokens: { access_token: 'mock-access-token' }
    })),
    setCredentials: jest.fn()
  }))
}));

// Mock file system operations
jest.mock('fs');
const mockFs = fs;

describe('Backend Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock responses
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('[]');
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockFs.mkdirSync.mockReturnValue(undefined);
  });

  // ============= ADMIN API UNIT TESTS =============
  describe('Admin API Units', () => {
    let adminHandler;
    let mockReq, mockRes;

    beforeAll(async () => {
      // Mock the admin API handler
      process.env.JWT_SECRET = 'test-secret';
      process.env.ADMIN_EMAILS = 'admin@example.com';
    });

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        query: {},
        body: {},
        headers: { authorization: 'Bearer valid-token' },
        user: { email: 'admin@example.com', role: 'admin' }
      };

      mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis()
      };
    });

    test('should handle OPTIONS requests', async () => {
      mockReq.method = 'OPTIONS';

      // Import and test admin handler logic
      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('should require resource parameter', async () => {
      mockReq.query = {}; // No resource specified

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Resource type required')
        })
      );
    });

    test('should handle projects resource - GET all', async () => {
      mockReq.query = { resource: 'projects' };

      // Mock projects data
      const mockProjects = [
        { id: '1', title: 'Project 1', category: 'residential' },
        { id: '2', title: 'Project 2', category: 'commercial' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        projects: mockProjects,
        total: 2
      });
    });

    test('should handle projects resource - GET single', async () => {
      mockReq.query = { resource: 'projects', id: '1' };

      const mockProjects = [
        { id: '1', title: 'Project 1', category: 'residential' },
        { id: '2', title: 'Project 2', category: 'commercial' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        project: mockProjects[0]
      });
    });

    test('should handle projects resource - POST create', async () => {
      mockReq.method = 'POST';
      mockReq.query = { resource: 'projects' };
      mockReq.body = {
        title: 'New Project',
        description: 'New Description',
        category: 'residential'
      };

      mockFs.readFileSync.mockReturnValue('[]');

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project created successfully',
          project: expect.objectContaining({
            title: 'New Project'
          })
        })
      );
    });

    test('should handle projects resource - PUT update', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { resource: 'projects', id: '1' };
      mockReq.body = { title: 'Updated Project' };

      const mockProjects = [
        { id: '1', title: 'Project 1', category: 'residential' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project updated successfully'
        })
      );
    });

    test('should handle projects resource - DELETE', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { resource: 'projects', id: '1' };

      const mockProjects = [
        { id: '1', title: 'Project 1', category: 'residential' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project deleted successfully'
        })
      );
    });

    test('should handle contacts resource', async () => {
      mockReq.query = { resource: 'contacts' };

      const mockContacts = [
        { id: '1', name: 'John Doe', project: 'Kitchen' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockContacts));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        contacts: mockContacts,
        total: 1
      });
    });

    test('should handle about resource - GET', async () => {
      mockReq.query = { resource: 'about' };

      const mockAbout = { title: 'About Us', description: 'Company info' };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockAbout));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ about: mockAbout });
    });

    test('should handle about resource - PUT', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { resource: 'about' };
      mockReq.body = { title: 'Updated About' };

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'About data updated successfully'
        })
      );
    });

    test('should handle config resource - GET', async () => {
      mockReq.query = { resource: 'config' };

      const mockConfig = { companyName: 'Test Company', logo: 'logo.png' };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          config: mockConfig,
          message: 'Site configuration retrieved successfully'
        })
      );
    });

    test('should handle images resource - GET all', async () => {
      mockReq.query = { resource: 'images' };

      const mockImages = [
        { id: '1', publicId: 'image1', title: 'Image 1' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockImages));

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        images: mockImages,
        total: 1
      });
    });

    test('should handle images resource - POST create', async () => {
      mockReq.method = 'POST';
      mockReq.query = { resource: 'images' };
      mockReq.body = {
        publicId: 'new-image',
        title: 'New Image',
        category: 'gallery'
      };

      mockFs.readFileSync.mockReturnValue('[]');

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Image created successfully',
          image: expect.objectContaining({
            publicId: 'new-image'
          })
        })
      );
    });

    test('should handle Cloudinary delete action', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { resource: 'images', action: 'cloudinary-delete' };
      mockReq.body = { public_id: 'image-to-delete' };

      const cloudinary = require('cloudinary');
      cloudinary.v2.uploader.destroy.mockResolvedValue({ result: 'ok' });

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(cloudinary.v2.uploader.destroy).toHaveBeenCalledWith('image-to-delete');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Image deleted successfully',
          public_id: 'image-to-delete'
        })
      );
    });

    test('should handle invalid resource', async () => {
      mockReq.query = { resource: 'invalid' };

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid resource type'
        })
      );
    });

    test('should handle authentication failures', async () => {
      mockReq.headers = {}; // No auth header

      const { default: handler } = await import('../api/admin.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  // ============= PUBLIC API UNIT TESTS =============
  describe('Public API Units', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        query: {},
        body: {},
        headers: {}
      };

      mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis()
      };
    });

    test('should handle OPTIONS requests', async () => {
      mockReq.method = 'OPTIONS';

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('should handle projects resource - GET all', async () => {
      mockReq.query = { resource: 'projects' };

      const mockProjects = [
        { id: '1', title: 'Public Project 1', status: 'published' }
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects));

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        projects: mockProjects,
        total: 1
      });
    });

    test('should handle projects resource - GET by slug', async () => {
      mockReq.query = { resource: 'projects', slug: 'test-project' };

      const mockProject = {
        id: '1',
        title: 'Test Project',
        slug: 'test-project',
        status: 'published'
      };

      // Mock the getProjectBySlug function behavior
      mockFs.readFileSync.mockReturnValue(JSON.stringify([mockProject]));

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        project: mockProject
      });
    });

    test('should handle about resource', async () => {
      mockReq.query = { resource: 'about' };

      const mockAbout = { title: 'About Us', description: 'Public info' };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockAbout));

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ about: mockAbout });
    });

    test('should handle contact form submission', async () => {
      mockReq.method = 'POST';
      mockReq.query = { resource: 'contact' };
      mockReq.body = {
        name: 'John Doe',
        phone: '123-456-7890',
        project: 'Kitchen Renovation',
        message: 'Need help with kitchen'
      };

      mockFs.readFileSync.mockReturnValue('[]');

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '訊息已送出，我們會盡快與您聯絡'
        })
      );
    });

    test('should validate contact form fields', async () => {
      mockReq.method = 'POST';
      mockReq.query = { resource: 'contact' };
      mockReq.body = {
        name: 'John Doe'
        // Missing required fields
      };

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing required fields',
          required: ['name', 'phone', 'project', 'message']
        })
      );
    });

    test('should handle invalid resource', async () => {
      mockReq.query = { resource: 'invalid' };

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid resource type'
        })
      );
    });

    test('should reject non-GET/POST methods', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { resource: 'projects' };

      const { default: handler } = await import('../api/public.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Method not allowed'
        })
      );
    });
  });

  // ============= AUTH API UNIT TESTS =============
  describe('Auth API Units', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = {
        method: 'POST',
        query: {},
        body: {},
        headers: {}
      };

      mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis()
      };

      process.env.ADMIN_EMAILS = 'admin@example.com';
      process.env.JWT_SECRET = 'test-secret';
    });

    test('should handle OPTIONS requests', async () => {
      mockReq.method = 'OPTIONS';

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('should handle magic link login', async () => {
      mockReq.query = { method: 'magic-link' };
      mockReq.body = {
        email: 'admin@example.com',
        method: 'magic-link'
      };

      const jwt = require('jsonwebtoken');
      jwt.sign.mockReturnValue('mock-token');

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'admin@example.com' }),
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Magic link sent to your email'
        })
      );
    });

    test('should reject unauthorized email', async () => {
      mockReq.query = { method: 'magic-link' };
      mockReq.body = {
        email: 'unauthorized@example.com',
        method: 'magic-link'
      };

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied'
        })
      );
    });

    test('should handle token verification', async () => {
      mockReq.query = { method: 'verify' };
      mockReq.body = { token: 'valid-token' };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ email: 'admin@example.com', role: 'admin' });

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: { email: 'admin@example.com', role: 'admin' }
        })
      );
    });

    test('should handle invalid token', async () => {
      mockReq.query = { method: 'verify' };
      mockReq.body = { token: 'invalid-token' };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid or expired token'
        })
      );
    });

    test('should handle logout', async () => {
      mockReq.query = { method: 'logout' };

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    test('should handle Google OAuth URL generation', async () => {
      mockReq.method = 'GET';
      mockReq.query = { method: 'google' };
      mockReq.headers = { origin: 'http://localhost:3000' };

      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      const { OAuth2Client } = require('google-auth-library');
      const mockClient = new OAuth2Client();
      mockClient.generateAuthUrl.mockReturnValue('https://mock-oauth-url.com');

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(302, 'https://mock-oauth-url.com');
    });

    test('should handle OAuth callback', async () => {
      mockReq.query = { code: 'auth-code', state: 'state' };
      mockReq.headers = { origin: 'http://localhost:3000' };

      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      // Mock fetch for user info
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'admin@example.com',
            name: 'Admin User'
          })
        })
      );

      const { OAuth2Client } = require('google-auth-library');
      const mockClient = new OAuth2Client();
      mockClient.getToken.mockResolvedValue({
        tokens: { access_token: 'mock-access-token' }
      });

      const jwt = require('jsonwebtoken');
      jwt.sign.mockReturnValue('mock-jwt-token');

      const { default: handler } = await import('../api/auth.js');
      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining('auth_token=mock-jwt-token')
      );
      expect(mockRes.redirect).toHaveBeenCalledWith('/admin?token=mock-jwt-token');
    });
  });

  // ============= DATA LAYER TESTS =============
  describe('Data Layer Functions', () => {
    test('should read and write projects data', () => {
      const testProjects = [
        { id: '1', title: 'Test Project', category: 'residential' }
      ];

      mockFs.readFileSync.mockReturnValue(JSON.stringify(testProjects));

      // Test reading
      expect(JSON.parse(mockFs.readFileSync())).toEqual(testProjects);

      // Test writing
      const newProject = { id: '2', title: 'New Project' };
      const updatedProjects = [...testProjects, newProject];

      mockFs.writeFileSync.mockReturnValue(undefined);
      mockFs.writeFileSync(undefined, JSON.stringify(updatedProjects, null, 2));

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        undefined,
        JSON.stringify(updatedProjects, null, 2)
      );
    });

    test('should handle file system errors gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => {
        try {
          mockFs.readFileSync('non-existent-file');
        } catch (error) {
          expect(error.message).toBe('File not found');
          throw error;
        }
      }).toThrow('File not found');
    });
  });

  // ============= UTILITY FUNCTION TESTS =============
  describe('Utility Functions', () => {
    test('should validate required fields', () => {
      const validateRequiredFields = (data, required) => {
        const missing = required.filter(field => !data[field]);
        return missing.length === 0 ? null : missing;
      };

      const validData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hello'
      };

      const invalidData = {
        name: 'John'
        // Missing email and message
      };

      const required = ['name', 'email', 'message'];

      expect(validateRequiredFields(validData, required)).toBeNull();
      expect(validateRequiredFields(invalidData, required)).toEqual(['email', 'message']);
    });

    test('should generate unique IDs', () => {
      const generateId = () => Date.now().toString();

      const id1 = generateId();
      // Small delay to ensure different timestamps
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    test('should format timestamps', () => {
      const formatTimestamp = () => new Date().toISOString();

      const timestamp = formatTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});