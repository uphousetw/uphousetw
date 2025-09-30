# QA Testing Suite for Condensed API

## Overview

This comprehensive QA testing suite validates the condensed API endpoints that were reduced from 15 to 3 serverless functions. The test suite ensures both frontend and backend functionality work perfectly after the consolidation.

## Test Coverage

### 🧪 **Comprehensive API Tests** (`api-qa-suite.js`)
- Tests all 3 API endpoints end-to-end
- Authentication flow testing
- CRUD operations validation
- Error handling verification
- Real API calls with mock data

### 🎨 **Frontend Integration Tests** (`frontend-integration.test.js`)
- Frontend-API integration testing
- React service layer validation
- Request/response format testing
- Error handling in UI components
- Mock API responses

### ⚙️ **Backend Unit Tests** (`backend-unit.test.js`)
- Individual function testing
- Data layer validation
- Authentication middleware testing
- File system operations
- Utility function testing

## Quick Start

### 1. Install Dependencies
```bash
# Install Jest for unit/integration tests
npm install --save-dev jest node-fetch

# Or if using yarn
yarn add --dev jest node-fetch
```

### 2. Start Development Server
```bash
npm run dev:api
# Server should be running on http://localhost:3001
```

### 3. Run All Tests
```bash
# Run complete test suite
npm run test:all

# Or run individual test suites
npm run test:api        # Comprehensive API tests
npm run test:frontend   # Frontend integration tests
npm run test:backend    # Backend unit tests
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:all` | Run complete QA test suite |
| `npm run test:api` | Run comprehensive API tests |
| `npm run test:frontend` | Run frontend integration tests |
| `npm run test:backend` | Run backend unit tests |
| `npm test` | Run Jest tests only |

## Environment Configuration

### Required Environment Variables
```bash
# .env or .env.test
API_BASE_URL=http://localhost:3001/api
TEST_ADMIN_EMAIL=admin@example.com
JWT_SECRET=your-jwt-secret
ADMIN_EMAILS=admin@example.com,test@example.com

# Optional for OAuth testing
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Development vs Production Testing
```javascript
// The test suite automatically detects environment
if (process.env.NODE_ENV === 'development') {
  // Uses development tokens and relaxed validation
} else {
  // Uses production-like testing
}
```

## Test Structure

```
tests/
├── api-qa-suite.js           # Comprehensive API tests
├── frontend-integration.test.js  # Frontend integration tests
├── backend-unit.test.js      # Backend unit tests
├── run-tests.js             # Test runner and reporter
├── setup.js                 # Jest setup configuration
└── test-report-*.json       # Generated test reports
```

## API Endpoints Tested

### 🔒 `/api/admin` - Admin Operations
- ✅ Projects CRUD (Create, Read, Update, Delete)
- ✅ Contacts management
- ✅ About content management
- ✅ Site configuration
- ✅ Image metadata management
- ✅ Cloudinary operations
- ✅ Authentication required validation

### 🌐 `/api/public` - Public Data
- ✅ Public project listings
- ✅ Project details by slug
- ✅ Public about content
- ✅ Contact form submissions
- ✅ Form validation
- ✅ Error handling

### 🔐 `/api/auth` - Authentication
- ✅ Magic link login
- ✅ Google OAuth flow
- ✅ Token verification
- ✅ Logout functionality
- ✅ OAuth callback handling
- ✅ Security validation

## Test Scenarios

### Authentication Tests
```javascript
✅ Valid admin email login
✅ Invalid email rejection
✅ Token generation and verification
✅ OAuth URL generation
✅ OAuth callback processing
✅ Token expiration handling
✅ Logout and session cleanup
```

### CRUD Operations Tests
```javascript
✅ Create new projects/contacts/images
✅ Read single and multiple resources
✅ Update existing resources
✅ Delete resources with confirmation
✅ Handle non-existent resource IDs
✅ Validate required fields
✅ Test data integrity
```

### Error Handling Tests
```javascript
✅ 400 - Bad Request validation
✅ 401 - Authentication required
✅ 403 - Access denied
✅ 404 - Resource not found
✅ 405 - Method not allowed
✅ 500 - Server error handling
```

### Frontend Integration Tests
```javascript
✅ API service class functionality
✅ Request/response formatting
✅ Authentication header injection
✅ Error propagation to UI
✅ Loading states management
✅ Form submission handling
```

## Sample Test Output

```
🧪 Starting Comprehensive API QA Test Suite...

🔐 TESTING AUTH API (/api/auth)

🔍 Testing: Auth - Magic Link Login
✅ PASS: Auth - Magic Link Login

🔍 Testing: Auth - Token Verification
✅ PASS: Auth - Token Verification

🌐 TESTING PUBLIC API (/api/public)

🔍 Testing: Public - Get All Projects
✅ PASS: Public - Get All Projects

🔍 Testing: Public - Contact Form Submission
✅ PASS: Public - Contact Form Submission

🔒 TESTING ADMIN API (/api/admin)

🔍 Testing: Admin - Create Project
✅ PASS: Admin - Create Project

🔍 Testing: Admin - Update Project
✅ PASS: Admin - Update Project

==================================================
📊 TEST RESULTS SUMMARY
==================================================
✅ Passed: 24
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 QA Test Suite Complete!
```

## Troubleshooting

### Common Issues

#### 1. Server Not Running
```bash
Error: ECONNREFUSED localhost:3001
```
**Solution:** Start the development server first:
```bash
npm run dev:api
```

#### 2. Authentication Failures
```bash
Error: Authentication required
```
**Solution:** Check environment variables:
```bash
export TEST_ADMIN_EMAIL=admin@example.com
export ADMIN_EMAILS=admin@example.com
```

#### 3. Jest Not Found
```bash
Error: jest command not found
```
**Solution:** Install Jest:
```bash
npm install --save-dev jest
```

#### 4. File System Permissions
```bash
Error: EACCES permission denied
```
**Solution:** Check file permissions for `api/data/` directory

### Debug Mode
Enable verbose logging:
```bash
DEBUG=true npm run test:all
```

## Performance Testing

### Load Testing (Optional)
```javascript
// Example load test
for (let i = 0; i < 100; i++) {
  await api.getProjects();
}
// Measure response times and error rates
```

### Memory Usage Monitoring
```bash
node --inspect tests/api-qa-suite.js
# Open Chrome DevTools for memory profiling
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: API QA Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev:api &
      - run: sleep 5  # Wait for server to start
      - run: npm run test:all
```

### Pre-deployment Validation
```bash
# Run before deploying to production
npm run test:all
if [ $? -eq 0 ]; then
  echo "✅ All tests passed - safe to deploy"
  npm run build
else
  echo "❌ Tests failed - deployment blocked"
  exit 1
fi
```

## Test Data Management

### Mock Data
Test suite uses controlled mock data:
- Projects: Predictable test projects
- Contacts: Sample contact submissions
- Images: Mock Cloudinary IDs
- Users: Test admin accounts

### Data Cleanup
Tests automatically clean up:
- Created test records
- Temporary files
- Mock uploads
- Session data

## Extending Tests

### Adding New Test Cases
```javascript
// In api-qa-suite.js
await this.test('New Feature Test', async () => {
  const { response, data } = await this.apiCall('/admin?resource=newfeature');

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!data.success) throw new Error('Feature test failed');
});
```

### Adding Frontend Tests
```javascript
// In frontend-integration.test.js
test('should handle new feature', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ feature: 'working' })
  });

  const result = await apiService.getNewFeature();
  expect(result.feature).toBe('working');
});
```

## Reporting

### Test Reports
- Console output with color coding
- JSON reports saved to `tests/test-report-*.json`
- Coverage reports (when configured)
- Performance metrics

### Continuous Monitoring
Set up automated testing:
```bash
# Run tests every hour
0 * * * * cd /path/to/project && npm run test:all
```

## Security Testing

The test suite includes security validations:
- ✅ Authentication bypass attempts
- ✅ SQL injection prevention
- ✅ XSS protection validation
- ✅ CSRF token verification
- ✅ Input sanitization testing
- ✅ Authorization level checking

## Support

### Getting Help
1. Check console output for specific error details
2. Review environment variable configuration
3. Verify server is running and accessible
4. Check the API documentation for endpoint details
5. Review test logs in `tests/test-report-*.json`

### Contributing
When adding new API features:
1. Add corresponding tests to the test suite
2. Update API documentation
3. Test both frontend and backend integration
4. Verify all existing tests still pass

The QA test suite ensures your condensed API maintains full functionality while providing better maintainability and performance.