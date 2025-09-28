# Content-Type Header Testing Checklist

## Pre-Deployment Testing

### 🎯 Critical Test: Data Persistence
**Test all admin panel updates to ensure data actually saves and persists.**

### 📋 Test Cases

#### 1. About Page Updates
- [ ] Navigate to `/admin/about`
- [ ] Change title, intro, mission, or vision
- [ ] Click save - should see "資料更新成功!"
- [ ] Refresh page - changes should still be visible
- [ ] Check `api/data/about-data.json` - should contain actual changes
- [ ] Network tab: Request should have `Content-Type: application/json`

#### 2. Project Management
- [ ] Create new project in admin panel
- [ ] Edit existing project details
- [ ] Save changes and refresh page
- [ ] Verify changes persist in project list
- [ ] Check `api/data/projects-data.json` for updates

#### 3. Contact Form
- [ ] Submit contact form from public website
- [ ] Check admin contacts section
- [ ] Update contact status in admin panel
- [ ] Verify status changes persist after refresh

#### 4. Site Configuration
- [ ] Update site settings in admin panel
- [ ] Save configuration changes
- [ ] Refresh and verify settings persist

### 🔍 Technical Checks

#### Network Tab Inspection
1. Open Chrome DevTools → Network tab
2. Perform any admin update action
3. Find the API request (POST/PUT method)
4. Click on request → Headers tab
5. **Verify**: `Content-Type: application/json` (NOT `text/plain`)

#### Backend Log Verification
1. Monitor console output during testing
2. **Look for**: `🔍 DEBUG - Raw request body:` logs
3. **Verify**: Request body shows actual data (NOT `undefined`)
4. **Expected**: Logs show the form data being sent

#### Data File Verification
1. Check JSON files in `api/data/` directory
2. **Before update**: Note current content and timestamp
3. **After update**: Verify both content AND timestamp changed
4. **Red flag**: Only timestamp changed but content is same

### ⚠️ Failure Symptoms

#### Signs of Content-Type Issues:
- ✅ Success message appears
- ❌ Data reverts after refresh
- ❌ Network tab shows `text/plain` content-type
- ❌ Backend logs show `req.body: undefined`
- ❌ JSON files have new timestamp but same content

### 🛠️ Quick Fix Verification

#### If Content-Type Issue Found:
1. Check `src/services/apiService.ts`
2. Find the failing API method
3. Verify headers include:
   ```typescript
   headers: {
     Authorization: `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
4. Restart frontend dev server
5. Re-test the failing functionality

### 📝 Test Report Template

```
## Content-Type Testing Report
Date: [YYYY-MM-DD]
Tester: [Name]
Environment: [Development/Staging/Production]

### Test Results:
- [ ] About page updates: PASS/FAIL
- [ ] Project management: PASS/FAIL
- [ ] Contact form: PASS/FAIL
- [ ] Site configuration: PASS/FAIL

### Technical Verification:
- [ ] All requests use application/json: PASS/FAIL
- [ ] Backend receives proper data: PASS/FAIL
- [ ] Data persists correctly: PASS/FAIL

### Issues Found:
[List any failing endpoints or symptoms]

### Fixes Applied:
[List any code changes made]

### Sign-off:
- [ ] All tests passing
- [ ] Ready for deployment
```

### 🚀 Deployment Gates

**DO NOT DEPLOY** until:
- [ ] All test cases pass
- [ ] Network requests show correct Content-Type
- [ ] Backend logs show proper request data
- [ ] Data persistence verified on all endpoints
- [ ] QA sign-off completed

---

**Test Priority**: P0 - Critical
**Test Frequency**: Before every deployment
**Last Updated**: 2025-09-28