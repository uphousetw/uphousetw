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

## Critical Issue: API URL Parameter Mismatch

### ⚠️ Symptoms
- Admin panel shows "儲存建案失敗，請稍後再試" (Project save failed)
- Admin panel shows "狀態更新失敗，請稍後再試" (Status update failed)
- Contact message deletion fails silently
- Contact status updates don't work
- Error messages: "Project ID required for update", "Contact ID required for update"

### 🔍 Root Cause
Frontend sends API requests using **path parameters** (`/api/projects/${id}`) but backend expects **query parameters** (`/api/projects?id=${id}`). This mismatch causes 400 Bad Request errors.

### 🛠️ Fix Required
**ALWAYS** use query parameters for resource IDs, not path parameters.

#### ❌ Incorrect (Path Parameters)
```typescript
// Projects
this.makeRequest(`projects/${id}`, { method: 'PUT' })     // ❌
this.makeRequest(`projects/${id}`, { method: 'DELETE' })  // ❌

// Contacts
fetch(`/api/contacts/${contactId}`, { method: 'PUT' })    // ❌
fetch(`/api/contacts/${contactId}`, { method: 'DELETE' }) // ❌
```

#### ✅ Correct (Query Parameters)
```typescript
// Projects
this.makeRequest(`projects?id=${id}`, { method: 'PUT' })     // ✅
this.makeRequest(`projects?id=${id}`, { method: 'DELETE' })  // ✅

// Contacts
fetch(`/api/contacts?id=${contactId}`, { method: 'PUT' })    // ✅
fetch(`/api/contacts?id=${contactId}`, { method: 'DELETE' }) // ✅
```

### 🧪 How to Test
1. **Admin Panel**: Try editing projects - should succeed without errors
2. **Contact Management**: Try updating contact status - should work
3. **Contact Deletion**: Try deleting contacts - should work
4. **Network Tab**: Check API calls use `?id=` format
5. **Console**: No "Project ID required" or "Contact ID required" errors

### 🚨 All Affected Endpoints
Fixed in these locations:
- `src/services/apiService.ts` - `updateProject()` method
- `src/pages/Admin.tsx` - `handleDeleteContact()` function
- `src/pages/Admin.tsx` - `handleUpdateStatus()` function
- `src/pages/Admin.tsx` - CSV export contact updates

### 📝 QA Checklist
- [ ] Project editing works in admin panel
- [ ] Contact status updates work (新訊息 → 已讀 → 已處理 → 已解決)
- [ ] Contact deletion works
- [ ] CSV export works and updates contact status
- [ ] Network tab shows `?id=` format for PUT/DELETE requests
- [ ] No "ID required" error messages in console

### 📅 Historical Context
- **Issue Discovered**: 2025-09-29
- **Affected Systems**: Admin panel project management, contact management
- **Resolution**: Changed all frontend API calls from path to query parameters
- **Files Changed**: `src/services/apiService.ts`, `src/pages/Admin.tsx`

---

**Last Updated**: 2025-09-29
**Severity**: Critical - affects all admin functionality
**Priority**: P0 - Must fix before deployment