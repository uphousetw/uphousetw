# Admin Whitelist Management

This file explains how to manage the admin whitelist for the authentication system.

## Adding Admin Users

1. Open `api/data/admin-whitelist.json`
2. Add email addresses to the `emails` array
3. Save the file
4. Restart the API server if running locally

### Example

```json
{
  "emails": [
    "admin@example.com",
    "manager@company.com",
    "owner@business.com"
  ],
  "updatedAt": "2025-09-30T01:57:00.000Z"
}
```

## How It Works

1. User enters their email on the login page
2. System checks if email is in the whitelist
3. If yes, sends a magic link/OTP to their email (in development, shows token directly)
4. If no, shows "Access denied" error

## Security Notes

- Only emails in the whitelist can log in
- Tokens expire after 1 hour
- In production, magic links should be sent via email service (SendGrid, AWS SES, etc.)
- In development mode, tokens are shown directly for testing purposes

## Removing Admin Users

Simply remove their email from the `emails` array in `admin-whitelist.json`.