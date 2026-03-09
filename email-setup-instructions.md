# Email Configuration Setup

## Step 1: Configure Gmail App Password

1. Enable 2-factor authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" for the app
4. Generate a 16-character App Password
5. Copy this password (you won't see it again)

## Step 2: Update .env File

Add these lines to your backend `.env` file:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Step 3: Test Email Sending

After configuring the credentials, run:

```bash
cd backend
node test-email.js
```

## Step 4: Test via API

Once email is working, you can test via the API:

```bash
curl -X POST "https://api.mw265.com/api/reports/audit/15/share" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "felixkumafutsa@gmail.com",
    "message": "Test email sending for audit report ID 15"
  }'
```

## Notes

- The test script will:
  - Verify audit ID 15 exists
  - Test email configuration
  - Send a test email to felixkumafutsa@gmail.com
  - Report success or detailed error information

- Common issues:
  - Use App Password, not your regular Gmail password
  - Ensure EMAIL_USER includes @gmail.com
  - Check for typos in credentials
