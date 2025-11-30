# 📋 Inbox Zero OAuth Integration Index

## 🎯 Overview

Complete OAuth integration for Inbox Zero email management application with Google Gmail and Microsoft Outlook support.

## 📁 File Organization

### Core Configuration Files

```
apps/web/
├── utils/auth.ts                    # Better Auth main configuration
├── utils/gmail/scopes.ts           # Google OAuth scopes
├── utils/outlook/scopes.ts         # Microsoft OAuth scopes
├── env.ts                          # Environment variables schema
└── app/api/auth/[...all]/route.ts  # Auth API routes
```

### OAuth Helper Modules

```
utils/oauth/
├── account-linking.ts              # Account linking logic
├── account-linking.test.ts         # Account linking tests
├── callback-validation.ts          # OAuth callback validation
├── callback-validation.test.ts     # Callback validation tests
├── error-handler.ts                # OAuth error handling
└── state.ts                        # OAuth state management
```

### Provider-Specific Modules

```
utils/gmail/
├── client.ts                       # Gmail API client
├── constants.ts                    # Gmail constants
├── label.ts                        # Gmail labels
├── retry.ts                        # Gmail API retry logic
├── scopes.ts                       # Gmail OAuth scopes
└── watch.ts                        # Gmail watch functionality

utils/outlook/
├── client.ts                       # Outlook API client
├── scopes.ts                       # Outlook OAuth scopes
└── [other outlook utilities]
```

### Webhook & Integration

```
app/api/google/
├── webhook/route.ts                # Gmail webhook handler
├── webhook/process-history.ts      # History processing
├── webhook/process-history-item.ts # Individual history processing
├── webhook/types.ts                # Webhook types
├── linking/auth-url/route.ts       # Account linking auth URL
├── linking/callback/route.ts       # Account linking callback
├── calendar/                       # Calendar integration
└── contacts/                       # Contacts integration

app/api/outlook/
├── calendar/                       # Outlook calendar
├── linking/                        # Outlook account linking
└── webhook/                        # Outlook webhooks
```

## 🔧 Configuration Index

### Environment Variables (Required)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Google PubSub (Webhooks)
GOOGLE_PUBSUB_TOPIC_NAME=projects/project-id/topics/gmail-webhooks
GOOGLE_PUBSUB_VERIFICATION_TOKEN=your_verification_token

# Feature Flags
NEXT_PUBLIC_CONTACTS_ENABLED=true
NEXT_PUBLIC_EMAIL_SEND_ENABLED=true
```

### OAuth Scopes (Configured)

#### Google Gmail Scopes

- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar
- `https://www.googleapis.com/auth/contacts.readonly` - Read contacts
- `https://www.googleapis.com/auth/gmail.settings.basic` - Basic settings

#### Microsoft Outlook Scopes

- `Mail.ReadWrite` - Read/write emails
- `Mail.Send` - Send emails
- `Calendars.ReadWrite` - Read/write calendar
- `Contacts.Read` - Read contacts
- `User.Read` - Read user profile
- `offline_access` - Refresh tokens

## 🚀 Setup Scripts & Documentation

### Automated Setup

- `setup-oauth.sh` - Interactive setup script for Google Cloud & Azure

### Documentation

- `OAUTH_SETUP.md` - Complete setup guide
- `OAUTH_REPORT.md` - Implementation status report
- `CLAUDE.md` - Development guidelines

### Testing

- `test-oauth.js` - OAuth configuration test script

## 🔄 OAuth Flow Architecture

### Authentication Flow

```
User Login → OAuth Provider → Better Auth → Database → Email Account Linking
```

### Email Account Linking Flow

```
OAuth Success → Profile Data Fetch → Email Account Upsert → Premium Seats Update
```

### Webhook Flow (Gmail)

```
Gmail Event → PubSub → Webhook Endpoint → History Processing → Email Updates
```

## 📊 API Endpoints

### Authentication

- `GET/POST /api/auth/[...all]` - Better Auth handlers
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/microsoft` - Microsoft OAuth callback

### Account Linking

- `GET /api/google/linking/auth-url` - Get Google linking URL
- `GET /api/google/linking/callback` - Google linking callback
- `GET /api/outlook/linking/auth-url` - Get Outlook linking URL
- `GET /api/outlook/linking/callback` - Outlook linking callback

### Webhooks

- `POST /api/google/webhook` - Gmail webhook handler
- `POST /api/outlook/webhook` - Outlook webhook handler

## 🔐 Security Configuration

### Token Storage

- Access tokens encrypted in database
- Refresh tokens securely stored
- Automatic token refresh handling

### Webhook Security

- PubSub verification tokens
- Request validation
- Rate limiting considerations

### Environment Security

- Client secrets in environment variables
- HTTPS required for production
- Domain verification for Google

## 🧪 Testing Strategy

### Unit Tests

- OAuth callback validation
- Account linking logic
- Token refresh mechanisms

### Integration Tests

- Full OAuth flows
- Webhook processing
- Email account linking

### E2E Tests

- Gmail operations test suite
- Outlook operations test suite
- Cross-provider functionality

## 📈 Monitoring & Analytics

### OAuth Metrics

- Login success/failure rates
- Account linking completion
- Token refresh success rates

### Webhook Monitoring

- Delivery success rates
- Processing latency
- Error rates by provider

### Error Tracking

- OAuth flow failures
- Token refresh issues
- Webhook processing errors

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] OAuth credentials created
- [ ] Redirect URIs updated for production
- [ ] Domain verification completed
- [ ] Webhook URLs updated

### Production Validation

- [ ] OAuth flows tested
- [ ] Webhook notifications working
- [ ] Email account linking functional
- [ ] Token refresh working
- [ ] Error handling verified

### Monitoring Setup

- [ ] OAuth metrics configured
- [ ] Webhook monitoring active
- [ ] Error alerting enabled
- [ ] Performance monitoring

## 🔧 Maintenance Tasks

### Regular Maintenance

- Rotate OAuth client secrets
- Review API usage and costs
- Update OAuth scopes as needed
- Monitor for deprecated APIs

### Emergency Procedures

- OAuth credential rotation
- Webhook endpoint failover
- Token refresh failure handling
- Account linking issue resolution

## 📚 Related Documentation

- `CLAUDE.md` - Development workflow and guidelines
- `docs/guides/CALENDAR_INTEGRATION_GUIDE.md` - Calendar integration
- `docs/guides/DEVELOPMENT_WORKFLOW_GUIDE.md` - Development processes
- `docs/hosting/` - Deployment guides

---

_This index is automatically maintained. Last updated: $(date)_
