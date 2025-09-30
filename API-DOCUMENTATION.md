# API Documentation - Condensed Endpoints

## Overview

The API has been consolidated from 15 serverless functions to **3 endpoints** for better maintainability and reduced complexity:

1. **`/api/admin`** - All admin operations (requires authentication)
2. **`/api/public`** - Public data + contact submissions
3. **`/api/auth`** - Authentication & OAuth

---

## 🔒 `/api/admin` - Admin Operations

**Base URL:** `/api/admin`
**Authentication:** Required (JWT token in Authorization header)

### Common Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Resource Types
- `projects` - Project management
- `contacts` - Contact management
- `about` - About content management
- `config` - Site configuration
- `images` - Image metadata & Cloudinary operations

---

### Projects (`?resource=projects`)

#### Get All Projects
```http
GET /api/admin?resource=projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "1",
      "title": "Modern Villa",
      "description": "A beautiful modern villa",
      "category": "residential",
      "status": "completed",
      "images": ["img1", "img2"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Get Single Project
```http
GET /api/admin?resource=projects&id=123
```

#### Create Project
```http
POST /api/admin?resource=projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "category": "residential",
  "status": "draft",
  "location": "Taipei",
  "client": "Client Name",
  "completedDate": "2024-01-15",
  "images": [],
  "features": ["modern", "eco-friendly"]
}
```

**Response:**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "generated_id",
    "title": "New Project",
    "description": "Project description",
    "category": "residential",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Project
```http
PUT /api/admin?resource=projects&id=123
Content-Type: application/json

{
  "title": "Updated Project Title",
  "status": "published"
}
```

#### Delete Project
```http
DELETE /api/admin?resource=projects&id=123
```

---

### Contacts (`?resource=contacts`)

#### Get All Contacts
```http
GET /api/admin?resource=contacts
```

**Response:**
```json
{
  "contacts": [
    {
      "id": "1",
      "name": "John Doe",
      "phone": "123-456-7890",
      "email": "john@example.com",
      "project": "Kitchen Renovation",
      "message": "I need help with my kitchen",
      "status": "new",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Get Single Contact
```http
GET /api/admin?resource=contacts&id=123
```

#### Update Contact Status
```http
PUT /api/admin?resource=contacts&id=123
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called customer, scheduled meeting"
}
```

#### Delete Contact
```http
DELETE /api/admin?resource=contacts&id=123
```

---

### About Content (`?resource=about`)

#### Get About Data
```http
GET /api/admin?resource=about
```

**Response:**
```json
{
  "about": {
    "title": "About Our Company",
    "description": "We are a leading construction company...",
    "mission": "Building dreams into reality",
    "vision": "To be the most trusted construction partner",
    "values": ["Quality", "Innovation", "Integrity"],
    "team": [
      {
        "name": "John Smith",
        "position": "CEO",
        "bio": "25 years of experience...",
        "image": "team/john-smith"
      }
    ],
    "history": "Founded in 1995...",
    "certifications": ["ISO 9001", "Green Building"],
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update About Data
```http
PUT /api/admin?resource=about
Content-Type: application/json

{
  "title": "Updated About Title",
  "description": "Updated description",
  "mission": "New mission statement"
}
```

---

### Site Configuration (`?resource=config`)

#### Get Site Config
```http
GET /api/admin?resource=config
```

**Response:**
```json
{
  "config": {
    "logo": "uphouse/logo/icon_uphouse",
    "favicon": "uphouse/logo/favicon",
    "companyName": "向上建設",
    "gallery": [
      {
        "id": "1",
        "publicId": "gallery/image1",
        "title": "Project Gallery",
        "order": 0
      }
    ],
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Site configuration retrieved successfully"
}
```

#### Update Site Config
```http
PUT /api/admin?resource=config
Content-Type: application/json

{
  "companyName": "New Company Name",
  "logo": "new/logo/path",
  "favicon": "new/favicon/path"
}
```

---

### Images (`?resource=images`)

#### Get All Images
```http
GET /api/admin?resource=images
```

**Response:**
```json
{
  "images": [
    {
      "id": "1",
      "publicId": "gallery/image1",
      "title": "Beautiful Kitchen",
      "description": "Modern kitchen renovation",
      "category": "gallery",
      "order": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Get Single Image
```http
GET /api/admin?resource=images&id=123
```

#### Create Image Metadata
```http
POST /api/admin?resource=images
Content-Type: application/json

{
  "publicId": "gallery/new-image",
  "title": "New Image",
  "description": "Image description",
  "category": "gallery"
}
```

#### Update Image Metadata
```http
PUT /api/admin?resource=images&id=123
Content-Type: application/json

{
  "title": "Updated Image Title",
  "description": "Updated description"
}
```

#### Delete Image Metadata
```http
DELETE /api/admin?resource=images&id=123
```

#### Delete from Cloudinary
```http
DELETE /api/admin?resource=images&action=cloudinary-delete
Content-Type: application/json

{
  "public_id": "gallery/image-to-delete"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "public_id": "gallery/image-to-delete"
}
```

---

## 🌐 `/api/public` - Public Data & Contact

**Base URL:** `/api/public`
**Authentication:** Not required (except contact submissions are logged)

### Resource Types
- `projects` - Public project listings
- `about` - Public about content
- `contact` - Contact form submissions

---

### Public Projects (`?resource=projects`)

#### Get All Public Projects
```http
GET /api/public?resource=projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "1",
      "title": "Modern Villa",
      "slug": "modern-villa",
      "description": "A beautiful modern villa",
      "category": "residential",
      "status": "published",
      "images": ["img1", "img2"],
      "completedDate": "2024-01-15",
      "location": "Taipei"
    }
  ],
  "total": 1
}
```

#### Get Project by Slug
```http
GET /api/public?resource=projects&slug=modern-villa
```

**Response:**
```json
{
  "project": {
    "id": "1",
    "title": "Modern Villa",
    "slug": "modern-villa",
    "description": "A beautiful modern villa with...",
    "category": "residential",
    "images": ["img1", "img2"],
    "features": ["modern", "eco-friendly"],
    "location": "Taipei",
    "completedDate": "2024-01-15"
  }
}
```

---

### Public About (`?resource=about`)

#### Get Public About Data
```http
GET /api/public?resource=about
```

**Response:**
```json
{
  "about": {
    "title": "About Our Company",
    "description": "We are a leading construction company...",
    "mission": "Building dreams into reality",
    "vision": "To be the most trusted construction partner",
    "values": ["Quality", "Innovation", "Integrity"],
    "team": [
      {
        "name": "John Smith",
        "position": "CEO",
        "bio": "25 years of experience...",
        "image": "team/john-smith"
      }
    ]
  }
}
```

---

### Contact Form (`?resource=contact`)

#### Submit Contact Form
```http
POST /api/public?resource=contact
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "123-456-7890",
  "email": "john@example.com",
  "project": "Kitchen Renovation",
  "message": "I would like to renovate my kitchen. Please contact me for a consultation."
}
```

**Required Fields:** `name`, `phone`, `project`, `message`
**Optional Fields:** `email`

**Success Response:**
```json
{
  "success": true,
  "message": "訊息已送出，我們會盡快與您聯絡",
  "id": "contact_123"
}
```

**Validation Error Response:**
```json
{
  "error": "Missing required fields",
  "required": ["name", "phone", "project", "message"]
}
```

---

## 🔐 `/api/auth` - Authentication

**Base URL:** `/api/auth`

### Authentication Methods
- `magic-link` - Email-based authentication
- `google` - Google OAuth
- `verify` - Token verification
- `logout` - User logout

---

### Magic Link Login

#### Request Magic Link
```http
POST /api/auth?method=magic-link
Content-Type: application/json

{
  "email": "admin@example.com",
  "method": "magic-link"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to your email",
  "developmentToken": "jwt-token-for-dev",
  "isDevelopment": true
}
```

---

### Google OAuth

#### Get OAuth URL
```http
GET /api/auth?method=google
```

**Response:** Redirects to Google OAuth URL

#### Handle OAuth Callback
The OAuth callback is automatically handled when Google redirects back to your app.

**Callback URL:** `/api/auth?code=AUTH_CODE&state=STATE`

**Response:** Redirects to `/admin?token=JWT_TOKEN`

---

### Token Verification

#### Verify Token
```http
POST /api/auth?method=verify
Content-Type: application/json

{
  "token": "jwt-token-here"
}
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid or expired token"
}
```

---

### Logout

#### Logout User
```http
POST /api/auth?method=logout
```

**Response:**
```json
{
  "success": true
}
```

---

## Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "error": "Missing required fields",
  "details": "Specific error details"
}
```

#### 401 - Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 403 - Forbidden
```json
{
  "error": "Access denied"
}
```

#### 404 - Not Found
```json
{
  "error": "Resource not found"
}
```

#### 405 - Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Error description"
}
```

---

## Frontend Integration Examples

### React Service Class

```javascript
class APIService {
  constructor() {
    this.baseURL = '/api';
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

  // Auth API methods
  async loginWithMagicLink(email) {
    return this.request('/auth?method=magic-link', {
      method: 'POST',
      body: JSON.stringify({ email, method: 'magic-link' })
    });
  }

  async verifyToken(token) {
    return this.request('/auth?method=verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async logout() {
    const result = await this.request('/auth?method=logout', {
      method: 'POST'
    });
    localStorage.removeItem('authToken');
    return result;
  }
}

export default APIService;
```

### Usage Examples

```javascript
const api = new APIService();

// Get public projects for homepage
const projects = await api.getProjects();

// Submit contact form
try {
  await api.submitContact({
    name: 'John Doe',
    phone: '123-456-7890',
    project: 'Kitchen Renovation',
    message: 'I need help with my kitchen renovation.'
  });
  alert('Message sent successfully!');
} catch (error) {
  alert('Error: ' + error.message);
}

// Admin operations (requires authentication)
const adminProjects = await api.getAdminProjects();
await api.createProject(newProjectData);
await api.updateProject(projectId, updateData);
```

---

## Testing

### Running Tests

```bash
# Install test dependencies
npm install --save-dev jest node-fetch

# Run comprehensive test suite
node tests/api-qa-suite.js

# Run unit tests
npm test

# Run frontend integration tests
npm run test:frontend
```

### Environment Variables for Testing

```bash
# .env.test
API_BASE_URL=http://localhost:3001/api
TEST_ADMIN_EMAIL=admin@example.com
TEST_AUTH_TOKEN=your-test-token
JWT_SECRET=test-secret
ADMIN_EMAILS=admin@example.com,test@example.com
```

---

## Migration Guide

### Updating Frontend Code

**Before (15 endpoints):**
```javascript
// Old endpoints
fetch('/api/projects')
fetch('/api/projects-public')
fetch('/api/contact')
fetch('/api/auth')
fetch('/api/auth-callback')
fetch('/api/images')
fetch('/api/images/delete')
// ... 8 more endpoints
```

**After (3 endpoints):**
```javascript
// New consolidated endpoints
fetch('/api/public?resource=projects')
fetch('/api/public?resource=contact')
fetch('/api/admin?resource=projects')
fetch('/api/admin?resource=images')
fetch('/api/auth?method=login')
```

### Key Changes
1. **Resource-based routing:** Use `?resource=` parameter
2. **Method-based auth:** Use `?method=` parameter
3. **Consolidated responses:** All responses follow consistent format
4. **Better error handling:** Standardized error responses
5. **Single auth flow:** OAuth callback integrated into main auth endpoint

---

## Support

For issues or questions about the API:
1. Check the error response for specific details
2. Verify authentication headers for admin endpoints
3. Ensure required fields are included in requests
4. Review the test suite for usage examples

The condensed API maintains full backward compatibility while providing a cleaner, more maintainable structure.