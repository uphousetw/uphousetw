# QA Documentation

## 🚨 Critical Issues & Troubleshooting

### Content-Type Header Issues
**Priority: P0** - Affects all data persistence

- **[API Troubleshooting Guide](./api-troubleshooting.md)** - Complete troubleshooting guide for Content-Type header issues
- **[Content-Type Testing Checklist](./content-type-testing-checklist.md)** - Pre-deployment testing checklist

#### Quick Summary
If admin panel updates appear to save but revert to old data, check for Content-Type header issues. All POST/PUT requests must include `'Content-Type': 'application/json'`.

## 📁 QA Structure

```
docs/qa/
├── README.md                           # This file
├── api-troubleshooting.md             # API debugging guide
├── content-type-testing-checklist.md  # Testing procedures
├── assessments/                       # QA assessments
└── gates/                            # Deployment gates
```

## 🧪 Testing Procedures

### Before Every Deployment
1. **Data Persistence Testing** - Verify all admin updates persist
2. **Content-Type Verification** - Check all API requests use correct headers
3. **Backend Log Review** - Ensure request bodies are properly parsed
4. **Cross-browser Testing** - Test on Chrome, Firefox, Safari

### API Testing Priority
1. **P0 - Critical**: About page, Project management, Contact forms
2. **P1 - High**: Site configuration, User management
3. **P2 - Medium**: Analytics, SEO features

## 🔧 Debug Tools

### Backend Debugging
Add to API handlers for troubleshooting:
```javascript
console.log('🔍 DEBUG - Raw request body:', req.body);
console.log('🔍 DEBUG - Request headers:', req.headers);
```

### Frontend Debugging
1. Chrome DevTools → Network tab
2. Check request headers for `Content-Type: application/json`
3. Verify request body contains expected data

## 📋 Common Issues

### Data Persistence Problems
- **Symptoms**: Changes save but revert after refresh
- **Cause**: Missing Content-Type headers
- **Fix**: Add `'Content-Type': 'application/json'` to API calls

### Authentication Issues
- **Symptoms**: 401/403 errors in admin panel
- **Cause**: Token expiration or invalid credentials
- **Fix**: Check token validity and refresh mechanism

### File Upload Issues
- **Symptoms**: Images not saving or displaying
- **Cause**: File path or permission problems
- **Fix**: Verify file permissions and path resolution

## 🚀 Deployment Gates

### Pre-Deployment Checklist
- [ ] All critical functionality tested
- [ ] API endpoints verified
- [ ] Data persistence confirmed
- [ ] Cross-browser compatibility checked
- [ ] Performance benchmarks met
- [ ] Security audit passed

### Sign-off Required
- [ ] Developer testing complete
- [ ] QA testing passed
- [ ] Security review approved
- [ ] Performance review approved

## 📞 Emergency Contacts

### Production Issues
1. **Check backend logs** for error details
2. **Review recent commits** for breaking changes
3. **Rollback deployment** if critical data loss
4. **Contact team** for immediate response

### Escalation Path
1. Developer → Team Lead → Project Manager
2. Critical issues: Immediate escalation
3. Data loss: Emergency rollback procedures

---

**Last Updated**: 2025-09-28
**Maintained By**: Development Team
**Review Frequency**: After each major release