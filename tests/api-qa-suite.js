/**
 * Comprehensive QA Test Suite for Condensed API Endpoints
 * Tests all 3 consolidated API endpoints: admin.js, public.js, auth.js
 */

// Test Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN;

class APITestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.authToken = null;
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive API QA Test Suite...\n');

    try {
      // Test sequence: Auth -> Public -> Admin
      await this.testAuthAPI();
      await this.testPublicAPI();
      await this.testAdminAPI();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async test(name, testFn) {
    try {
      console.log(`🔍 Testing: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      console.log(`✅ PASS: ${name}\n`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name} - ${error.message}\n`);
    }
  }

  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    return { response, data };
  }

  // ============= AUTH API TESTS =============
  async testAuthAPI() {
    console.log('🔐 TESTING AUTH API (/api/auth)\n');

    // Test 1: Magic link login
    await this.test('Auth - Magic Link Login', async () => {
      const { response, data } = await this.apiCall('/auth?method=magic-link', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_ADMIN_EMAIL,
          method: 'magic-link'
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.success) throw new Error('Login failed');
      if (data.developmentToken) {
        this.authToken = data.developmentToken;
      }
    });

    // Test 2: Token verification
    if (this.authToken) {
      await this.test('Auth - Token Verification', async () => {
        const { response, data } = await this.apiCall('/auth?method=verify', {
          method: 'POST',
          body: JSON.stringify({ token: this.authToken })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!data.success) throw new Error('Token verification failed');
      });
    }

    // Test 3: Google OAuth URL generation
    await this.test('Auth - Google OAuth URL', async () => {
      const { response } = await this.apiCall('/auth?method=google', {
        method: 'GET'
      });

      if (response.status !== 302) throw new Error('Expected redirect for OAuth');
    });

    // Test 4: Logout
    await this.test('Auth - Logout', async () => {
      const { response, data } = await this.apiCall('/auth?method=logout', {
        method: 'POST'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.success) throw new Error('Logout failed');
    });
  }

  // ============= PUBLIC API TESTS =============
  async testPublicAPI() {
    console.log('🌐 TESTING PUBLIC API (/api/public)\n');

    // Test 1: Get all projects
    await this.test('Public - Get All Projects', async () => {
      const { response, data } = await this.apiCall('/public?resource=projects');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!Array.isArray(data.projects)) throw new Error('Projects should be an array');
    });

    // Test 2: Get project by slug
    await this.test('Public - Get Project by Slug', async () => {
      const { response, data } = await this.apiCall('/public?resource=projects&slug=test-project');

      // Should return 404 or project data
      if (response.status !== 404 && response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    });

    // Test 3: Get about data
    await this.test('Public - Get About Data', async () => {
      const { response, data } = await this.apiCall('/public?resource=about');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.about) throw new Error('About data missing');
    });

    // Test 4: Contact form submission
    await this.test('Public - Contact Form Submission', async () => {
      const contactData = {
        name: 'Test User',
        phone: '123-456-7890',
        email: 'test@example.com',
        project: 'Test Project',
        message: 'This is a test message'
      };

      const { response, data } = await this.apiCall('/public?resource=contact', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.success) throw new Error('Contact submission failed');
      if (!data.id) throw new Error('Contact ID not returned');
    });

    // Test 5: Contact form validation
    await this.test('Public - Contact Form Validation', async () => {
      const invalidData = {
        name: 'Test User',
        // Missing required fields
      };

      const { response, data } = await this.apiCall('/public?resource=contact', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      if (response.status !== 400) throw new Error('Should return 400 for invalid data');
      if (!data.error) throw new Error('Error message missing');
    });

    // Test 6: Invalid resource
    await this.test('Public - Invalid Resource', async () => {
      const { response } = await this.apiCall('/public?resource=invalid');

      if (response.status !== 400) throw new Error('Should return 400 for invalid resource');
    });
  }

  // ============= ADMIN API TESTS =============
  async testAdminAPI() {
    console.log('🔒 TESTING ADMIN API (/api/admin)\n');

    if (!this.authToken) {
      console.log('⚠️  Skipping admin tests - no auth token available\n');
      return;
    }

    // Test 1: Get all projects (admin)
    await this.test('Admin - Get All Projects', async () => {
      const { response, data } = await this.apiCall('/admin?resource=projects');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!Array.isArray(data.projects)) throw new Error('Projects should be an array');
    });

    // Test 2: Create project
    let testProjectId;
    await this.test('Admin - Create Project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        category: 'residential',
        status: 'completed'
      };

      const { response, data } = await this.apiCall('/admin?resource=projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.project) throw new Error('Project data missing');
      if (!data.project.id) throw new Error('Project ID missing');
      testProjectId = data.project.id;
    });

    // Test 3: Update project
    if (testProjectId) {
      await this.test('Admin - Update Project', async () => {
        const updateData = {
          title: 'Updated Test Project',
          description: 'Updated Description'
        };

        const { response, data } = await this.apiCall(`/admin?resource=projects&id=${testProjectId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!data.project) throw new Error('Updated project data missing');
      });
    }

    // Test 4: Get all contacts
    await this.test('Admin - Get All Contacts', async () => {
      const { response, data } = await this.apiCall('/admin?resource=contacts');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!Array.isArray(data.contacts)) throw new Error('Contacts should be an array');
    });

    // Test 5: Get about data (admin)
    await this.test('Admin - Get About Data', async () => {
      const { response, data } = await this.apiCall('/admin?resource=about');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.about) throw new Error('About data missing');
    });

    // Test 6: Update about data
    await this.test('Admin - Update About Data', async () => {
      const aboutData = {
        title: 'Test About Title',
        description: 'Test About Description'
      };

      const { response, data } = await this.apiCall('/admin?resource=about', {
        method: 'PUT',
        body: JSON.stringify(aboutData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.about) throw new Error('Updated about data missing');
    });

    // Test 7: Get site config
    await this.test('Admin - Get Site Config', async () => {
      const { response, data } = await this.apiCall('/admin?resource=config');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.config) throw new Error('Config data missing');
    });

    // Test 8: Update site config
    await this.test('Admin - Update Site Config', async () => {
      const configData = {
        companyName: 'Test Company',
        logo: 'test/logo/path'
      };

      const { response, data } = await this.apiCall('/admin?resource=config', {
        method: 'PUT',
        body: JSON.stringify(configData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.config) throw new Error('Updated config data missing');
    });

    // Test 9: Get all images
    await this.test('Admin - Get All Images', async () => {
      const { response, data } = await this.apiCall('/admin?resource=images');

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!Array.isArray(data.images)) throw new Error('Images should be an array');
    });

    // Test 10: Create image metadata
    let testImageId;
    await this.test('Admin - Create Image Metadata', async () => {
      const imageData = {
        publicId: 'test/image/id',
        title: 'Test Image',
        description: 'Test Image Description',
        category: 'gallery'
      };

      const { response, data } = await this.apiCall('/admin?resource=images', {
        method: 'POST',
        body: JSON.stringify(imageData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!data.image) throw new Error('Image data missing');
      if (!data.image.id) throw new Error('Image ID missing');
      testImageId = data.image.id;
    });

    // Test 11: Update image metadata
    if (testImageId) {
      await this.test('Admin - Update Image Metadata', async () => {
        const updateData = {
          title: 'Updated Test Image',
          description: 'Updated Description'
        };

        const { response, data } = await this.apiCall(`/admin?resource=images&id=${testImageId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!data.image) throw new Error('Updated image data missing');
      });
    }

    // Test 12: Delete project (cleanup)
    if (testProjectId) {
      await this.test('Admin - Delete Project', async () => {
        const { response, data } = await this.apiCall(`/admin?resource=projects&id=${testProjectId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!data.message) throw new Error('Delete confirmation missing');
      });
    }

    // Test 13: Delete image metadata (cleanup)
    if (testImageId) {
      await this.test('Admin - Delete Image Metadata', async () => {
        const { response, data } = await this.apiCall(`/admin?resource=images&id=${testImageId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!data.message) throw new Error('Delete confirmation missing');
      });
    }

    // Test 14: Authentication required
    await this.test('Admin - Authentication Required', async () => {
      const originalToken = this.authToken;
      this.authToken = null;

      const { response } = await this.apiCall('/admin?resource=projects');

      if (response.status !== 401 && response.status !== 403) {
        throw new Error('Should return 401/403 without auth');
      }

      this.authToken = originalToken;
    });
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => console.log(`   • ${test.name}: ${test.error}`));
    }

    console.log('\n🎉 QA Test Suite Complete!');
  }
}

// Export for module usage or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APITestSuite;
} else {
  // Run tests if executed directly
  const testSuite = new APITestSuite();
  testSuite.runAllTests();
}