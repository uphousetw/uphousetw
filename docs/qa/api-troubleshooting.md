# API Troubleshooting Guide

## Critical Issue: Content-Type Header Problems

### ⚠️ Symptoms
- Admin panel shows "資料更新成功!" (Data updated successfully)
- Changes appear to save but revert to old data after refresh
- Backend logs show `req.body: undefined` or empty request data
- API requests have `content-type: text/plain` instead of `application/json`
- Data files (JSON) get new timestamps but same content

### 🔍 Root Cause
The browser sends requests with `Content-Type: text/plain` instead of `application/json`, causing Express.js middleware to fail parsing the JSON body. This results in `req.body` being `undefined`, so updates save empty data.

### 🛠️ Fix Required
**ALWAYS** explicitly set `'Content-Type': 'application/json'` in headers for POST/PUT/PATCH requests that send JSON data.

#### ❌ Incorrect (Missing Content-Type)
```typescript
async updateData(token: string, data: any) {
  return this.makeRequest('endpoint', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}
```

#### ✅ Correct (With Content-Type)
```typescript
async updateData(token: string, data: any) {
  return this.makeRequest('endpoint', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
}
```

### 🧪 How to Test
1. **Check Network Tab**: Request should show `Content-Type: application/json`
2. **Check Backend Logs**: Should show actual data, not `undefined`
3. **Check Data Persistence**: Changes should survive page refresh
4. **Check JSON Files**: Should contain actual changes, not just timestamp updates

### 🚨 All Affected Endpoints
Check these API methods when adding new ones:
- `submitContact` - Contact form submissions
- `createProject` - New project creation
- `updateProject` - Project editing
- `updateAbout` - About page updates
- `updateContact` - Contact status changes
- `updateSiteConfig` - Site configuration updates

### 📝 QA Checklist
- [ ] All POST/PUT/PATCH requests include `'Content-Type': 'application/json'`
- [ ] Backend logs show actual request data (not `undefined`)
- [ ] Network tab shows correct Content-Type header
- [ ] Data persists after page refresh
- [ ] JSON files contain actual changes

### 🔧 Backend Debug Code
Add to API handlers for debugging:
```javascript
console.log('🔍 DEBUG - Raw request body:', req.body);
console.log('🔍 DEBUG - Request headers:', req.headers);
```

### 📅 Historical Context
- **Issue Discovered**: 2025-09-28
- **Affected Systems**: All admin panel data updates
- **Resolution**: Added explicit Content-Type headers to all JSON requests
- **Files Changed**: `src/services/apiService.ts`

### 🎯 Prevention
1. **Code Review**: Always check Content-Type headers in API calls
2. **Testing**: Test data persistence on every new endpoint
3. **Documentation**: Keep this guide updated with new endpoints
4. **Templates**: Use the correct pattern for new API methods

---

## General API Debugging Steps

### 1. Check Request Format
- Verify Content-Type header
- Verify request body structure
- Check authentication headers

### 2. Check Backend Processing
- Add debug logs for request data
- Verify middleware is working
- Check file write permissions

### 3. Check Data Flow
- Frontend → API request
- Backend → Data processing
- File system → Data persistence
- Database → Data retrieval

### 4. Common Issues
- Missing Content-Type headers
- Authentication token problems
- File permission issues
- JSON parsing errors
- CORS configuration problems

---

**Last Updated**: 2025-09-28
**Severity**: Critical - affects all data persistence
**Priority**: P0 - Must fix before deployment