# TODO: Set up Email Service for Magic Link Authentication

## Current Status
🟡 **Temporary Solution Active**: Magic links are displayed directly in the browser after login attempt. This works but is not production-ready.

## What Needs to Be Done

### 1. Sign up for Resend
- Go to https://resend.com
- Create a free account (100 emails/day free tier)
- Verify your email domain (or use their test domain for testing)

### 2. Get API Key
- Go to Resend dashboard → API Keys
- Create a new API key
- Copy the key (you'll only see it once!)

### 3. Configure Vercel Environment Variable
- Go to Vercel project → Settings → Environment Variables
- Add new variable:
  - **Name**: `RESEND_API_KEY`
  - **Value**: `re_xxxxxxxxxxxxxxxxxxxxx` (your API key)
  - **Environments**: Select all (Production, Preview, Development)
- Click Save
- Redeploy your site

### 4. Let me know when ready
Once you have the API key and added it to Vercel, I will:
- Install `resend` npm package
- Implement the email sending function in `api/auth.js`
- Create a nice email template for the magic link
- Test the email delivery
- Remove the temporary link display from the UI

## Files That Will Be Modified
- `package.json` - Add resend dependency
- `api/auth.js` - Implement sendEmail function
- `src/pages/Admin.tsx` - Remove temporary link display

## Testing Checklist
- [ ] Email arrives in inbox within 1 minute
- [ ] Magic link works and logs you in
- [ ] Link expires after 1 hour
- [ ] Proper error handling if email fails to send

---

**Current login flow**: Enter email → Link displayed on screen → Click link → Logged in ✅
**Target login flow**: Enter email → Check inbox → Click link in email → Logged in 📧