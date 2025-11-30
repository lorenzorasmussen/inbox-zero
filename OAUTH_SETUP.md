# Inbox Zero OAuth Setup Guide

## Overview

This guide will help you set up complete OAuth integration for Google and Microsoft accounts in the Inbox Zero application.

## Prerequisites

- Google Cloud Console account
- Microsoft Azure account
- gcloud CLI installed
- Azure CLI installed
- Node.js and pnpm installed

## Quick Setup (Automated)

Run the automated setup script:

```bash
./setup-oauth.sh
```

This script will guide you through:

- Google Cloud Project setup
- API enablement
- PubSub topic creation
- OAuth consent screen configuration
- Microsoft Azure AD app registration
- API permissions configuration
- Environment variable generation

## Manual Setup Instructions

### 1. Google Cloud Console Setup

#### Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the Project ID

#### Enable Required APIs

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable gmail.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable people.googleapis.com
gcloud services enable pubsub.googleapis.com
```

#### Create PubSub Topic

```bash
gcloud pubsub topics create gmail-webhooks
```

#### Configure OAuth Consent Screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. User Type: **External**
3. App name: **Inbox Zero**
4. Add required scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/contacts.readonly`

#### Create OAuth Credentials

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. **Create Credentials** > **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: **Inbox Zero Web App**
5. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### 2. Microsoft Azure AD Setup

#### Create Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. **New registration**
4. Name: **Inbox Zero**
5. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
6. Redirect URI:
   - Type: **Web**
   - URI: `http://localhost:3000/api/auth/callback/microsoft` (development)
   - URI: `https://yourdomain.com/api/auth/callback/microsoft` (production)

#### Configure API Permissions

1. Go to **API permissions** in your app
2. **Add a permission** > **Microsoft Graph**
3. Add these **delegated permissions**:
   - `Mail.ReadWrite`
   - `Mail.Send`
   - `Calendars.ReadWrite`
   - `Contacts.Read`
   - `User.Read`
   - `offline_access`
4. **Grant admin consent** for your organization

#### Create Client Secret

1. Go to **Certificates & secrets**
2. **New client secret**
3. Description: **Inbox Zero Secret**
4. Expires: **24 months**
5. Copy the **Value** (not the Secret ID)

## Environment Variables

Add these to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Google PubSub
GOOGLE_PUBSUB_TOPIC_NAME=projects/YOUR_PROJECT_ID/topics/gmail-webhooks
GOOGLE_PUBSUB_VERIFICATION_TOKEN=your_generated_verification_token

# Webhook URL
WEBHOOK_URL=http://localhost:3000/api/google/webhook?token=your_verification_token
```

## Testing OAuth Flows

### Start the Application

```bash
pnpm dev
```

### Test Google OAuth

1. Visit `http://localhost:3000`
2. Click "Sign in with Google"
3. Grant permissions for Gmail, Calendar, and Contacts
4. Verify account linking in the accounts page

### Test Microsoft OAuth

1. Visit `http://localhost:3000`
2. Click "Sign in with Microsoft"
3. Grant permissions for Mail, Calendar, and Contacts
4. Verify account linking in the accounts page

### Test Webhook Notifications

1. Send a test email to your connected Gmail account
2. Check application logs for webhook processing
3. Verify email appears in the inbox

## Production Deployment

### Update Redirect URIs

1. **Google Cloud Console**: Update OAuth credentials with production domain
2. **Azure AD**: Update redirect URIs with production domain

### Domain Verification

1. **Google**: Verify domain ownership in Google Search Console
2. **Microsoft**: No additional verification required

### Environment Variables

Update production environment with:

- Production domain URLs
- Production webhook URL
- Production redirect URIs

## Troubleshooting

### Common Issues

#### Google OAuth Errors

- **403: access_denied**: Check OAuth consent screen configuration
- **invalid_client**: Verify client ID and secret
- **redirect_uri_mismatch**: Check authorized redirect URIs

#### Microsoft OAuth Errors

- **invalid_client**: Verify client ID and secret
- **access_denied**: Check API permissions and admin consent
- **redirect_uri_mismatch**: Check configured redirect URIs

#### PubSub Webhook Issues

- **Invalid token**: Check verification token in webhook URL
- **Timeout**: Ensure webhook endpoint responds within 10 seconds
- **No notifications**: Verify PubSub topic subscription

### Debug Commands

```bash
# Check Google APIs
gcloud services list --enabled

# Check PubSub topics
gcloud pubsub topics list

# Test webhook endpoint
curl -X POST http://localhost:3000/api/google/webhook?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"message":{"data":"test"}}'
```

## Security Considerations

- Store client secrets securely (never in version control)
- Use HTTPS in production
- Regularly rotate client secrets
- Monitor API usage and costs
- Implement rate limiting on webhook endpoints

## Support

For issues with OAuth setup:

1. Check the troubleshooting section above
2. Review Google Cloud Console and Azure Portal configurations
3. Verify environment variables are correctly set
4. Check application logs for detailed error messages
