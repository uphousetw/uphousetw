# Cloudinary Upload Test Plan
**Generated:** 2025-09-30
**Component:** Picture & Logo Upload Functionality
**Risk Level:** HIGH (Configuration Dependencies)

## Test Environment Setup

### Prerequisites Checklist:
- [ ] `.env` file with valid Cloudinary credentials
- [ ] Cloudinary upload preset "Uphouse" configured
- [ ] Development server running (localhost:5173)
- [ ] Network connectivity to Cloudinary API

### Environment Variables Required:
```bash
VITE_CLOUDINARY_CLOUD_NAME=dpqbbiuef
VITE_CLOUDINARY_UPLOAD_PRESET=Uphouse
```

## Test Scenarios

### 1. Basic Upload Functionality Tests

#### 1.1 Valid Image Upload
**Given:** User has a valid image file (JPEG, PNG, WebP < 10MB)
**When:** User uploads via ImageUpload component
**Then:**
- File uploads successfully to Cloudinary
- Preview displays correctly
- `onUpload` callback fires with UploadResult
- Image metadata saved to backend

**Test Data:**
- small-image.jpg (< 1MB)
- medium-image.png (2-5MB)
- large-image.webp (8-10MB)

#### 1.2 File Validation Tests
**Given:** User selects invalid files
**When:** Attempting upload
**Then:** Appropriate error messages display

**Test Cases:**
- [ ] File too large (> 10MB) → "圖片大小不能超過 10MB"
- [ ] Invalid format (GIF, SVG) → "只支援 JPEG、PNG 和 WebP 格式的圖片"
- [ ] No file selected → No error, graceful handling

### 2. Upload Preset Tests

#### 2.1 Logo Upload Test
```javascript
uploadImage(file, uploadPresets.logo)
// Expected: folder: 'uphouse/logos', tags: ['logo', 'branding']
```

#### 2.2 Gallery Upload Test
```javascript
uploadImage(file, uploadPresets.gallery)
// Expected: folder: 'uphouse/gallery', tags: ['gallery', 'projects']
```

### 3. Error Handling Tests

#### 3.1 Network Failure Simulation
**Given:** Network is disconnected
**When:** User attempts upload
**Then:** Error message displays, upload state resets

#### 3.2 Invalid Credentials Test
**Given:** Wrong VITE_CLOUDINARY_CLOUD_NAME
**When:** Upload attempt
**Then:** 401/403 error handled gracefully

#### 3.3 Upload Preset Missing
**Given:** Upload preset doesn't exist in Cloudinary
**When:** Upload attempt
**Then:** Clear error message about preset configuration

### 4. UI/UX Tests

#### 4.1 Drag & Drop Interface
- [ ] Drag over effect visual feedback
- [ ] Drop zone highlights correctly
- [ ] File acceptance on drop
- [ ] Multiple file handling (if enabled)

#### 4.2 Upload State Management
- [ ] Loading spinner during upload
- [ ] Disable interactions during upload
- [ ] Progress indication (if available)
- [ ] Success state with preview

#### 4.3 Preview Display Tests
- [ ] Image preview shows correct Cloudinary URL
- [ ] Image transformations applied correctly
- [ ] Fallback for failed image loads
- [ ] Clear/remove functionality works

### 5. Security Tests

#### 5.1 File Type Validation
- [ ] Server-side validation matches client-side
- [ ] Malicious file upload prevention
- [ ] File size limits enforced

#### 5.2 Upload Preset Security
- [ ] Preset restricts to intended folders
- [ ] No unauthorized transformations allowed
- [ ] Proper CORS configuration

### 6. Integration Tests

#### 6.1 Backend Integration
- [ ] Image metadata saves to database
- [ ] Authentication token validation
- [ ] Error handling for metadata save failures

#### 6.2 Component Integration
- [ ] Header logo upload updates site logo
- [ ] Project gallery uploads appear in gallery
- [ ] Admin panel displays uploaded images

## Test Execution Commands

### Manual Testing:
1. Start dev server: `npm run dev`
2. Navigate to admin panel or component with ImageUpload
3. Test each scenario systematically

### Automated Testing:
```bash
# Run existing tests
npm test

# Specific image upload tests
npm test -- --grep "image.upload"
```

### Direct API Testing:
Open `test-upload.html` in browser for direct Cloudinary API testing

## Expected Results Matrix

| Test Case | Expected Result | Failure Indicator |
|-----------|----------------|-------------------|
| Valid upload | Success + preview | Error message/no preview |
| Invalid file | Validation error | Upload proceeds |
| Network error | Error message | Indefinite loading |
| Missing env | Configuration error | Generic error |

## Common Failure Points

1. **Missing `.env` file** → `VITE_CLOUDINARY_CLOUD_NAME` undefined
2. **CORS issues** → Browser blocks direct upload
3. **Upload preset not found** → 400 error from Cloudinary
4. **File size exceeded** → Network timeout or 413 error
5. **Invalid API key** → 401/403 authentication errors

## Troubleshooting Guide

### If uploads fail:
1. Check browser console for errors
2. Verify environment variables loaded
3. Test with `test-upload.html` for API connectivity
4. Check Cloudinary dashboard for upload preset configuration
5. Verify network connectivity to `api.cloudinary.com`

### Debug Commands:
```javascript
// In browser console
console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
```

## Quality Gates

**PASS Criteria:**
- All upload scenarios work with valid configuration
- Error handling provides clear user feedback
- UI states update correctly during upload process
- Security validations prevent malicious uploads

**FAIL Criteria:**
- Uploads fail with valid configuration
- Silent failures with no error indication
- Security vulnerabilities in file handling
- UI becomes unresponsive during uploads