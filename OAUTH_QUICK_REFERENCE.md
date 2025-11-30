# 🚀 Inbox Zero OAuth Quick Reference

## ⚡ Quick Start

### 1. Run Setup Script

```bash
./setup-oauth.sh
```

### 2. Configure Environment

```bash
# Copy generated config to .env
cat .env.oauth >> .env
```

### 3. Test OAuth

```bash
pnpm dev
# Visit http://localhost:3000 → Sign in with Google/Microsoft
```

## 📋 OAuth Configuration Summary

### Required Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret

# Google PubSub (Webhooks)
GOOGLE_PUBSUB_TOPIC_NAME=projects/project-id/topics/gmail-webhooks
GOOGLE_PUBSUB_VERIFICATION_TOKEN=secure-token

# Feature Flags
NEXT_PUBLIC_CONTACTS_ENABLED=true
NEXT_PUBLIC_EMAIL_SEND_ENABLED=true
```

### OAuth Scopes (Configured)

#### Google Gmail

- ✅ `gmail.readonly` - Read emails
- ✅ `gmail.send` - Send emails
- ✅ `calendar.readonly` - Read calendar
- ✅ `contacts.readonly` - Read contacts
- ✅ `gmail.settings.basic` - Basic settings

#### Microsoft Outlook

- ✅ `Mail.ReadWrite` - Read/write emails
- ✅ `Mail.Send` - Send emails
- ✅ `Calendars.ReadWrite` - Read/write calendar
- ✅ `Contacts.Read` - Read contacts
- ✅ `User.Read` - Read profile

## 🔧 Key Files & Locations

### Core Configuration

- **Auth Config**: `utils/auth.ts` - Better Auth setup
- **Google Scopes**: `utils/gmail/scopes.ts` - Gmail permissions
- **Outlook Scopes**: `utils/outlook/scopes.ts` - Outlook permissions
- **Environment**: `env.ts` - Variable validation

### API Routes

- **Auth Handler**: `app/api/auth/[...all]/route.ts`
- **Gmail Linking**: `app/api/google/linking/`
- **Outlook Linking**: `app/api/outlook/linking/`
- **Webhooks**: `app/api/google/webhook/route.ts`

### OAuth Utilities

- **Account Linking**: `utils/oauth/account-linking.ts`
- **State Management**: `utils/oauth/state.ts`
- **Error Handling**: `utils/oauth/error-handler.ts`

## 🔄 OAuth Flow Diagrams

### Gmail Integration Flow

```
User Login → Google OAuth → Account Link → PubSub Watch → Webhook Setup → Real-time Sync
```

### Outlook Integration Flow

```
User Login → Microsoft OAuth → Account Link → Graph Subscriptions → Webhook Setup → Real-time Sync
```

### Email Processing Flow

```
Email Received → Webhook Trigger → History Processing → AI Categorization → User Notification
```

## 🚨 Troubleshooting Quick Reference

### Common Issues & Solutions

#### Google OAuth Issues

- **403 Access Denied** → Enable Gmail API in Google Cloud Console
- **Invalid Scope** → Check scopes in `utils/gmail/scopes.ts`
- **Redirect URI Mismatch** → Update authorized redirect URIs

#### Microsoft OAuth Issues

- **Admin Consent Required** → Get admin approval for Graph API permissions
- **Invalid Client** → Verify client ID/secret in Azure AD
- **Scope Error** → Check permissions in Azure AD app

#### Webhook Issues

- **Verification Failed** → Check `GOOGLE_PUBSUB_VERIFICATION_TOKEN`
- **Timeout Error** → Webhook processing takes too long
- **No Notifications** → Verify PubSub topic subscription

### Debug Commands

```bash
# Check environment variables
node test-oauth.js

# Test webhook endpoint
curl -X POST http://localhost:3000/api/google/webhook?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"message":{"data":"test"}}'

# Check Google APIs
gcloud services list --enabled

# Check PubSub
gcloud pubsub topics list
```

## 📊 Status Check Commands

### OAuth Configuration Status

```bash
# Check if OAuth is configured
node test-oauth.js

# Verify scopes are loaded
grep -r "gmail.readonly" utils/gmail/scopes.ts
grep -r "Mail.ReadWrite" utils/outlook/scopes.ts
```

### Application Status

```bash
# Check if app starts
pnpm dev

# Test OAuth endpoints
curl http://localhost:3000/api/auth/google
curl http://localhost:3000/api/auth/microsoft
```

### Webhook Status

```bash
# Check webhook endpoint
curl -I http://localhost:3000/api/google/webhook

# Verify PubSub topic
gcloud pubsub topics describe gmail-webhooks
```

## 🎯 Production Deployment Checklist

### Pre-Deployment

- [ ] OAuth credentials configured for production
- [ ] Redirect URIs updated with production domain
- [ ] Domain verified in Google Search Console
- [ ] HTTPS enabled and configured
- [ ] Webhook URL updated with production domain

### Go-Live Validation

- [ ] OAuth flows tested in production
- [ ] Webhook notifications working
- [ ] Email account linking functional
- [ ] Token refresh working properly
- [ ] Error handling verified

### Monitoring Setup

- [ ] OAuth success/failure metrics
- [ ] Webhook delivery monitoring
- [ ] Token refresh monitoring
- [ ] Error alerting configured

## 📞 Support & Resources

### Documentation

- **Setup Guide**: `OAUTH_SETUP.md`
- **Complete Index**: `OAUTH_INDEX.md`
- **Inbox Zero Guide**: `INBOX_ZERO_OAUTH_GUIDE.md`
- **File Organization**: `OAUTH_FILE_ORGANIZATION.md`

### Key Contacts

- **OAuth Issues**: Check `OAUTH_REPORT.md` for known issues
- **API Documentation**: Google Cloud Console, Microsoft Graph Explorer
- **Webhook Testing**: PubSub documentation, Microsoft Graph webhooks

### Emergency Contacts

- **Google OAuth Issues**: Google Cloud Console support
- **Microsoft OAuth Issues**: Azure AD support
- **Application Issues**: Check logs and error monitoring

## 🔄 Maintenance Schedule

### Daily

- Monitor OAuth error rates
- Check webhook delivery success
- Review token refresh failures

### Weekly

- Validate OAuth configurations
- Check API quota usage
- Review security logs

### Monthly

- Rotate OAuth client secrets
- Update API scopes if needed
- Performance optimization review

---

## ⚡ Quick Commands Reference

```bash
# Setup & Configuration
./setup-oauth.sh                    # Run OAuth setup wizard
node test-oauth.js                  # Test OAuth configuration
cat .env.oauth >> .env             # Apply generated config

# Development & Testing
pnpm dev                           # Start development server
pnpm test e2e/gmail-operations     # Test Gmail integration
pnpm test e2e/outlook-operations   # Test Outlook integration

# Google Cloud Operations
gcloud config set project PROJECT_ID    # Set project
gcloud services enable gmail.googleapis.com  # Enable Gmail API
gcloud pubsub topics create gmail-webhooks   # Create PubSub topic

# Azure Operations
az login                          # Login to Azure CLI
az ad app create                  # Create Azure AD app
az ad app permission add          # Add API permissions

# Monitoring & Debugging
tail -f logs/oauth.log            # Monitor OAuth logs
gcloud logging read "resource.type=pubsub_topic"  # Check PubSub logs
```

---

_Quick reference for Inbox Zero OAuth operations. Keep this handy during development and deployment._
