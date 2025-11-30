# 📂 Inbox Zero OAuth File Organization

## 🎯 Functional Organization

This document organizes all OAuth-related files by functionality, making it easy to find and maintain components.

## 1. 🔐 Core Authentication

### Main Configuration

```
utils/auth.ts
├── Better Auth configuration
├── Social provider setup (Google, Microsoft)
├── Session management
├── Database hooks for account linking
└── Error handling
```

### Environment Configuration

```
env.ts
├── OAuth environment variables schema
├── GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
├── MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
├── GOOGLE_PUBSUB_TOPIC_NAME, GOOGLE_PUBSUB_VERIFICATION_TOKEN
└── Feature flags (NEXT_PUBLIC_CONTACTS_ENABLED, etc.)
```

## 2. 🔄 OAuth Flow Management

### State Management

```
utils/oauth/state.ts
├── OAuth state generation
├── State cookie management
├── CSRF protection
└── State validation
```

### Callback Validation

```
utils/oauth/callback-validation.ts
├── OAuth callback validation logic
├── Provider-specific validation
├── Error handling for callbacks
└── Security checks
```

### Account Linking

```
utils/oauth/account-linking.ts
├── Account linking orchestration
├── Email account creation/update
├── Provider conflict resolution
├── Premium seat management
└── Orphaned account cleanup
```

## 3. 📧 Provider-Specific Modules

### Google Gmail Integration

```
utils/gmail/
├── client.ts           # Gmail API client setup
├── constants.ts        # Gmail-specific constants
├── label.ts           # Gmail label definitions
├── retry.ts           # API retry logic
├── scopes.ts          # OAuth scopes configuration
└── watch.ts           # Gmail watch functionality
```

### Microsoft Outlook Integration

```
utils/outlook/
├── client.ts          # Outlook API client
├── scopes.ts          # OAuth scopes configuration
└── [additional outlook utilities]
```

## 4. 🌐 API Routes & Endpoints

### Authentication Routes

```
app/api/auth/[...all]/route.ts
├── Better Auth handler
├── OAuth callback processing
├── Session management
└── Error responses
```

### Google Integration Routes

```
app/api/google/
├── linking/
│   ├── auth-url/route.ts     # Generate linking auth URL
│   └── callback/route.ts     # Handle linking callback
├── webhook/
│   ├── route.ts              # Main webhook handler
│   ├── process-history.ts    # History processing
│   ├── process-history-item.ts # Individual item processing
│   └── types.ts              # Webhook type definitions
├── calendar/                 # Calendar integration routes
└── contacts/                 # Contacts integration routes
```

### Microsoft Integration Routes

```
app/api/outlook/
├── linking/                  # Account linking routes
├── webhook/                  # Webhook handlers
├── calendar/                 # Calendar integration
└── contacts/                 # Contacts integration
```

## 5. 🧪 Testing & Validation

### Unit Tests

```
utils/oauth/
├── account-linking.test.ts     # Account linking tests
└── callback-validation.test.ts # Callback validation tests
```

### Integration Tests

```
__tests__/e2e/
├── gmail-operations.test.ts    # Gmail integration tests
└── outlook-operations.test.ts  # Outlook integration tests
```

### Configuration Tests

```
test-oauth.js                    # OAuth configuration validator
```

## 6. 📚 Documentation & Scripts

### Setup Scripts

```
setup-oauth.sh                   # Interactive OAuth setup
├── Google Cloud Console setup
├── Azure AD configuration
├── Environment variable generation
└── Validation checks
```

### Documentation

```
OAUTH_INDEX.md                   # Complete file index
OAUTH_SETUP.md                   # Setup instructions
OAUTH_REPORT.md                  # Implementation report
INBOX_ZERO_OAUTH_GUIDE.md        # Inbox Zero specific guide
```

## 7. 🔧 Utility Modules

### Error Handling

```
utils/oauth/error-handler.ts      # OAuth error handling
utils/webhook/error-handler.ts    # Webhook error handling
```

### Middleware

```
utils/middleware.ts               # Auth middleware
├── withAuth()                   # User authentication
├── withEmailAccount()           # Email account context
└── Error handling wrappers
```

### Encryption & Security

```
utils/encryption.ts               # Token encryption
utils/error.ts                    # Error tracking
utils/logger.ts                   # Structured logging
```

## 8. 🗄️ Database & Models

### Prisma Schema Extensions

```
prisma/schema.prisma
├── Account model (Better Auth)
├── EmailAccount model (Inbox Zero)
├── Session model
├── VerificationToken model
└── User model
```

### Database Extensions

```
utils/prisma/extensions.ts        # Prisma extensions
├── Token encryption hooks
├── Automatic token refresh
└── Email account relationships
```

## 9. 🎨 Frontend Components

### Authentication UI

```
app/
├── login/                       # Login pages
├── accounts/                    # Account management
└── settings/                    # OAuth settings
```

### Hooks & State Management

```
hooks/
├── useAuth.ts                   # Authentication state
├── useEmailAccounts.ts          # Email account management
└── useOAuth.ts                  # OAuth flow management
```

## 10. 📊 Monitoring & Analytics

### Logging Configuration

```
utils/logger.ts                   # Structured logging
├── OAuth flow logging
├── Webhook processing logs
├── Error tracking
└── Performance metrics
```

### Analytics Integration

```
utils/analytics/
├── oauth-events.ts              # OAuth event tracking
├── email-sync.ts                # Email sync analytics
└── webhook-metrics.ts           # Webhook performance
```

## 11. 🚀 Deployment & Infrastructure

### Environment Configuration

```
.env.example                      # Environment template
.env.local                        # Local development
.env.production                   # Production config
```

### Docker Configuration

```
Dockerfile.*                      # Container setup
docker-compose.*                  # Service orchestration
```

### CI/CD Integration

```
.github/workflows/
├── oauth-validation.yml          # OAuth setup validation
├── integration-tests.yml         # OAuth integration tests
└── deployment.yml                # Production deployment
```

## 12. 🔒 Security & Compliance

### Security Modules

```
utils/security/
├── oauth-validation.ts           # OAuth security validation
├── token-management.ts           # Secure token handling
├── rate-limiting.ts              # API rate limiting
└── audit-logging.ts              # Security audit logs
```

### Compliance

```
docs/compliance/
├── gdpr-oauth.md                 # GDPR compliance
├── ccpa-oauth.md                 # CCPA compliance
├── security-audit.md             # Security audit reports
└── data-retention.md             # Data retention policies
```

## 📋 Quick Reference Matrix

| Component       | File                              | Purpose               | Dependencies                      |
| --------------- | --------------------------------- | --------------------- | --------------------------------- |
| Auth Config     | `utils/auth.ts`                   | Better Auth setup     | env, prisma                       |
| Google Scopes   | `utils/gmail/scopes.ts`           | Gmail permissions     | env                               |
| Outlook Scopes  | `utils/outlook/scopes.ts`         | Outlook permissions   | env                               |
| Account Linking | `utils/oauth/account-linking.ts`  | Link email accounts   | prisma, logger                    |
| Gmail Client    | `utils/gmail/client.ts`           | Gmail API client      | googleapis                        |
| Outlook Client  | `utils/outlook/client.ts`         | Outlook API client    | @microsoft/microsoft-graph-client |
| Webhook Handler | `app/api/google/webhook/route.ts` | Gmail webhooks        | pubsub, history processor         |
| Auth Routes     | `app/api/auth/[...all]/route.ts`  | OAuth endpoints       | better-auth                       |
| Setup Script    | `setup-oauth.sh`                  | Automated setup       | gcloud, az                        |
| Test Script     | `test-oauth.js`                   | Configuration testing | node                              |

## 🔄 Data Flow Architecture

```
User Action → Frontend → API Route → OAuth Provider → Callback → Account Linking → Database → Webhook Setup → Real-time Updates
```

## 🎯 Maintenance Checklist

### Daily

- [ ] Monitor OAuth error logs
- [ ] Check webhook delivery rates
- [ ] Review token refresh success

### Weekly

- [ ] Validate OAuth configurations
- [ ] Check API quota usage
- [ ] Review security logs

### Monthly

- [ ] Rotate OAuth credentials
- [ ] Update API scopes if needed
- [ ] Review access patterns

### Quarterly

- [ ] Security audit of OAuth implementation
- [ ] Performance optimization
- [ ] Update to latest OAuth best practices

---

_File organization follows Inbox Zero's modular architecture. Last organized: $(date)_
