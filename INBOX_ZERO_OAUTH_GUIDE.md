# 🔐 Inbox Zero OAuth Configuration Guide

## 🎯 Tailored for Email Management

This guide is specifically designed for Inbox Zero's email management features, focusing on Gmail and Outlook integration for comprehensive email processing, calendar sync, and contact management.

## 📧 Email Management Features Enabled

### Gmail Integration

- **Email Reading**: Access to inbox, sent, and archived emails
- **Email Sending**: Send emails through Gmail API
- **Real-time Updates**: Webhook notifications for new emails
- **Label Management**: Smart labeling and organization
- **Settings Access**: Mailbox settings and filters

### Outlook Integration

- **Email Access**: Full mailbox read/write access
- **Email Sending**: Send emails through Outlook
- **Calendar Sync**: Calendar events and scheduling
- **Contact Management**: Address book integration

### Cross-Provider Features

- **Unified Interface**: Single interface for both providers
- **Account Switching**: Easy switching between email accounts
- **Bulk Operations**: Process multiple accounts simultaneously
- **Smart Categorization**: AI-powered email categorization

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Login    │───▶│   OAuth Flow     │───▶│  Account Link   │
│                 │    │  (Google/MS)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Email Processing│◀───│   Webhooks       │───▶│  Real-time      │
│  Engine         │    │  (PubSub/Graph)  │    │  Updates        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Analysis   │◀───│   Data Sync      │───▶│  Smart Actions  │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## ⚙️ Inbox Zero-Specific Configuration

### Required OAuth Scopes

#### Gmail (Essential for Email Management)

```typescript
// utils/gmail/scopes.ts - Configured for Inbox Zero
export const SCOPES = [
  // Core email access
  'https://www.googleapis.com/auth/gmail.readonly', // Read all emails
  'https://www.googleapis.com/auth/gmail.send', // Send emails

  // Email organization
  'https://www.googleapis.com/auth/gmail.settings.basic', // Manage labels/filters

  // Calendar integration
  'https://www.googleapis.com/auth/calendar.readonly', // Read calendar events

  // Contact management
  'https://www.googleapis.com/auth/contacts.readonly', // Access contacts

  // User identification
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
]
```

#### Outlook (Essential for Email Management)

```typescript
// utils/outlook/scopes.ts - Configured for Inbox Zero
export const SCOPES = [
  // OpenID Connect
  'openid',
  'profile',
  'email',
  'User.Read',
  'offline_access',

  // Email operations
  'Mail.ReadWrite', // Full email access
  'Mail.Send', // Send emails
  'MailboxSettings.ReadWrite', // Manage mailbox settings

  // Calendar integration
  'Calendars.ReadWrite', // Calendar access

  // Contact management
  'Contacts.Read', // Contact access
]
```

### Better Auth Configuration for Inbox Zero

```typescript
// utils/auth.ts - Optimized for email management
export const betterAuthConfig = betterAuth({
  // ... other config

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: [...GMAIL_SCOPES],
      accessType: 'offline', // Required for background processing
      prompt: 'select_account consent', // Allow account switching
      disableIdTokenSignIn: true, // Use access tokens only
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID || '',
      clientSecret: env.MICROSOFT_CLIENT_SECRET || '',
      scope: [...OUTLOOK_SCOPES],
      tenantId: 'common', // Multi-tenant support
      prompt: 'consent', // Explicit consent
      disableIdTokenSignIn: true, // Use access tokens only
    },
  },

  // Email account linking hooks
  databaseHooks: {
    account: {
      create: { after: handleLinkAccount },
      update: { after: handleLinkAccount },
    },
  },
})
```

## 🔄 Email Processing Workflows

### Gmail Webhook Integration

#### PubSub Configuration

```bash
# Required environment variables
GOOGLE_PUBSUB_TOPIC_NAME=projects/your-project/topics/gmail-webhooks
GOOGLE_PUBSUB_VERIFICATION_TOKEN=your-secure-verification-token
```

#### Webhook Processing Flow

```
1. Gmail Event → PubSub Topic
2. PubSub → Webhook Endpoint (/api/google/webhook)
3. Token Verification
4. Asynchronous Processing (after() function)
5. History ID Processing
6. Email Data Sync
7. AI Categorization Trigger
8. User Notification
```

#### Gmail Watch Setup

```typescript
// utils/gmail/watch.ts
export async function watchGmail(gmail: gmail_v1.Gmail) {
  return gmail.users.watch({
    userId: 'me',
    requestBody: {
      labelIds: [GmailLabel.INBOX, GmailLabel.SENT],
      labelFilterBehavior: 'include',
      topicName: env.GOOGLE_PUBSUB_TOPIC_NAME,
    },
  })
}
```

### Outlook Integration

#### Microsoft Graph Webhooks

- Real-time notifications for email events
- Subscription management
- Lifecycle token handling

#### Calendar Integration

- Event synchronization
- Meeting detection
- Scheduling conflict resolution

## 🗄️ Database Schema for Email Accounts

### Email Account Model

```typescript
// prisma/schema.prisma
model EmailAccount {
  id            String   @id @default(cuid())
  userId        String
  accountId     String   @unique
  email         String   @unique
  name          String?
  image         String?

  // OAuth tokens (encrypted)
  access_token  String?  @db.Text
  refresh_token String?  @db.Text
  expires_at    DateTime?

  // Provider info
  provider      String   // 'google' | 'microsoft'

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  user          User     @relation(fields: [userId], references: [id])
  account       Account  @relation(fields: [accountId], references: [id])
}
```

### Account Linking Logic

```typescript
// utils/oauth/account-linking.ts
export async function handleAccountLinking(params) {
  // 1. Validate provider permissions
  // 2. Fetch user profile data
  // 3. Create/update email account record
  // 4. Set up webhooks/watchers
  // 5. Trigger initial email sync
  // 6. Update premium account seats
}
```

## 🎯 Inbox Zero-Specific Features

### Smart Email Processing

- **AI Categorization**: Automatic email classification
- **Bulk Operations**: Process multiple emails simultaneously
- **Unsubscribe Management**: Smart unsubscribe detection
- **Reply Tracking**: Follow-up email management

### Calendar Integration

- **Meeting Detection**: Identify calendar events in emails
- **Scheduling**: Create calendar events from emails
- **Conflict Resolution**: Handle scheduling conflicts

### Contact Management

- **Contact Sync**: Sync email contacts
- **Relationship Tracking**: Track email interactions
- **Contact Enrichment**: Enhance contact data

## 🔒 Security Considerations for Email

### Token Security

- **Encryption**: All tokens encrypted at rest
- **Rotation**: Automatic token refresh
- **Scope Limitation**: Minimal required permissions
- **Audit Logging**: Token access logging

### Data Protection

- **Email Privacy**: Secure email content handling
- **PII Protection**: Personal data encryption
- **Compliance**: GDPR/CCPA compliance
- **Data Retention**: Configurable data retention

### Webhook Security

- **Verification**: PubSub token verification
- **Rate Limiting**: Prevent abuse
- **Timeout Handling**: Prevent long-running processes
- **Error Isolation**: Isolated error handling

## 📊 Monitoring & Analytics

### OAuth Metrics

- **Login Success Rate**: Track authentication success
- **Account Linking**: Monitor linking completion
- **Token Refresh**: Track refresh success/failure
- **Webhook Delivery**: Monitor real-time updates

### Email Processing Metrics

- **Processing Latency**: Email processing time
- **Success Rate**: Successful email operations
- **Error Rate**: Failed operations by type
- **Throughput**: Emails processed per minute

### User Experience Metrics

- **Setup Completion**: OAuth setup success rate
- **Feature Adoption**: Usage of integrated features
- **Performance**: Perceived application speed
- **Satisfaction**: User feedback and ratings

## 🚀 Deployment Strategy

### Staging Environment

1. **OAuth Setup**: Configure test credentials
2. **Webhook Testing**: Verify webhook delivery
3. **Email Processing**: Test email workflows
4. **Load Testing**: Simulate user load

### Production Deployment

1. **Credential Rotation**: Use production credentials
2. **Domain Verification**: Verify production domains
3. **SSL Configuration**: Ensure HTTPS everywhere
4. **Monitoring Setup**: Configure production monitoring

### Rollback Plan

1. **Credential Fallback**: Backup credential access
2. **Feature Flags**: Ability to disable features
3. **Data Backup**: Email account data backup
4. **User Communication**: Clear user notifications

## 🔧 Maintenance Procedures

### Regular Maintenance

- **Token Rotation**: Rotate OAuth credentials quarterly
- **API Quota Monitoring**: Monitor Google/Microsoft API usage
- **Webhook Health**: Verify webhook endpoint health
- **Performance Tuning**: Optimize email processing

### Emergency Procedures

- **OAuth Outage**: Handle provider outages
- **Token Expiration**: Bulk token refresh
- **Webhook Failure**: Webhook recovery procedures
- **Data Corruption**: Email data recovery

## 📚 Troubleshooting Guide

### Common OAuth Issues

#### Google OAuth Problems

- **403 Access Denied**: Check API enablement and scopes
- **Invalid Scope**: Verify scope configuration
- **Token Expired**: Implement refresh logic
- **Domain Mismatch**: Update authorized domains

#### Microsoft OAuth Problems

- **Admin Consent Required**: Get admin approval for scopes
- **Tenant Restriction**: Check tenant configuration
- **Scope Mismatch**: Verify Graph API permissions

#### Webhook Issues

- **Verification Failed**: Check PubSub token
- **Timeout Errors**: Implement async processing
- **Delivery Failures**: Check network connectivity

### Debug Tools

- **OAuth Playground**: Test OAuth flows
- **API Explorer**: Test API calls
- **Webhook Tester**: Verify webhook delivery
- **Token Inspector**: Check token validity

## 🎯 Success Metrics

### User Adoption

- **Setup Completion Rate**: % of users completing OAuth setup
- **Feature Usage**: % of users using integrated features
- **Retention**: User retention after OAuth setup

### Technical Performance

- **OAuth Success Rate**: >99% authentication success
- **Webhook Delivery**: >99.9% webhook delivery
- **Processing Latency**: <5 seconds average
- **Error Rate**: <0.1% error rate

### Business Impact

- **Email Processing**: Emails processed per user per day
- **Time Saved**: Time saved through automation
- **User Satisfaction**: Net Promoter Score improvement

---

_This configuration is specifically tailored for Inbox Zero's email management requirements. Last updated for Inbox Zero v2.1.0_
