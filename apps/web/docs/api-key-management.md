# 🔐 API Key Management System

A comprehensive, secure, and automated API key management system for Inbox Zero with enterprise-grade security features.

## Overview

This system provides:

- **Automated Key Generation** - Secure random key generation with configurable policies
- **Key Rotation** - Automated rotation with grace periods and notifications
- **Access Control** - Role-based permissions and scope management
- **Audit Trail** - Complete audit logging for compliance
- **CLI Tools** - Command-line interface for developers
- **API Endpoints** - RESTful API endpoints for integration
- **Security Monitoring** - Anomaly detection and alerting
- **Performance Analytics** - Usage tracking and optimization insights

## Features

### 🔐 **Key Generation**

- **Secure Random Generation**: Cryptographically secure random keys
- **Configurable Policies**: Type-based default permissions and expiration
- **Multiple Key Types**: Development, Production, Service keys
- **Custom Scopes**: Flexible permission assignment
- **IP Restrictions**: CIDR and wildcard support
- **Rate Limiting**: Per-key rate limits

### 🔑 **Key Rotation**

- **Automated Rotation**: Schedule-based and usage-based rotation
- **Manual Rotation**: On-demand rotation with force option
- **Grace Periods**: Configurable overlap periods
- **Batch Operations**: Rotate multiple keys at once
- **Emergency Rotation**: Immediate rotation for security incidents

### 🔑 **Access Control**

- **Role-Based Permissions**: Predefined roles with granular permissions
- **Scope Management**: Fine-grained scope control
- **IP Restrictions**: CIDR notation and whitelisting
- **Rate Limiting**: Configurable per-key rate limits

### 🔑 **Audit & Compliance**

- **Complete Audit Trail**: Every operation logged with timestamps
- **Security Events**: Anomaly detection and alerting
- **Usage Analytics**: Detailed usage statistics and patterns

### 🔑 **CLI Tools**

- **Generate Keys**: `api-key generate`
- **Rotate Keys**: `api-key rotate`
- **List Keys**: `api-key list`
- **Revoke Keys**: `api-key revoke`
- **Validate Keys**: `api-key validate`
- **Get Stats**: `api-key stats`
- **Get Audit**: `api-key audit`
- **Batch Operations**: `api-key rotate --batch`

### 🔑 **API Endpoints**

- **Generate**: `POST /api/admin/api-keys/generate`
- **Rotate**: `POST /api/admin/api-keys/rotate`
- **List**: `GET /api/admin/api-keys/list`
- **Revoke**: `DELETE /api/admin/api-keys/revoke`
- **Stats**: `GET /api/admin/api-keys/stats`
- **Audit**: `GET /api/admin/api-keys/audit`

## 📋 **Security Features**

### **Encryption**

- **Strong Hashing**: PBKDF2 with 256-bit entropy
- **Salt Management**: Unique salts for each key
- **Key Masking**: Secure key masking for logs

### **Authentication**

- **Bearer Tokens**: JWT-based authentication
- **Middleware**: Request validation and user context
- **Rate Limiting**: Built-in rate limiting

### **Monitoring**

- **Usage Tracking**: Real-time usage monitoring
- **Performance Metrics**: Response time and throughput tracking
- **Security Scoring**: Risk assessment and alerting

## 📋 **Developer Experience**

### **CLI Interface**

- **Interactive Commands**: User-friendly command-line interface
- **Colored Output**: Structured tables and progress indicators
- **Error Handling**: Comprehensive error messages
- **Help System**: Built-in help and examples

## 🚀 **Getting Started**

### Installation

```bash
# Install CLI tool globally
npm install -g @inbox-zero/api-key

# Add to package.json scripts
npm run api-key:generate --help

# Generate your first development key
api-key:generate --type=dev --purpose="Local development"

# List all keys
api-key: list --include-usage

# Validate a key
api-key: validate dev_abc123def456...

# Rotate keys (when needed)
api-key: rotate --type=prod --notify=true

# Get statistics
api-key: stats

# Get audit trail
api-key: audit --limit=10
```

## 📋 **Environment Setup**

```bash
# Set environment variables
export INBOX_ZERO_API_KEY="your_generated_key_here"
export INBOX_ZERO_API_KEY_ID="your_key_id_here"

# For development
export INBOX_ZERO_API_URL="http://localhost:3000"

# For production
export INBOX_ZERO_API_KEY="your_production_key"
export INBOX_ZERO_API_KEY_ID="your_production_key_id"
```

## 📋 **Usage Examples**

### Generate Development Key

```bash
api-key: generate --type=dev --purpose="API testing" --scopes="read:emails,write:rules"
✅ API Key Generated Successfully!
🔑 Key ID: dev_abc123def456
🔑 Key Type: dev
🔑 Key: dev_abc123def456...789
🔑 Scopes: read:emails,write:rules
🔑 Expires: 2025-02-27T00:00:00Z
🔑 Save this key securely:
   export INBOX_ZERO_API_KEY="dev_abc123def456..."
   export INBOX_ZERO_API_KEY_ID="dev_abc123def456"
   export INBOX_ZERO_API_KEY="dev_abc123def456"
🔐 Use in your application:
   Authorization: Bearer dev_abc123def456...
   X-API-Key-ID: dev_abc123def456
```

### List All Keys

```bash
api-key: list --include-usage
📋 API Keys (2 total):
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Type     │ Key ID              │ Name                │ Status    │ Usage (24h) │
├─────────────┼──────────────┼──────────────┤
│ dev     │ dev_abc123def456   │ Active   │ 1,247     │
│ prod    │ prod_xyz789uvw012   │ Active   │ 45,892     │
└─────────────────────────────────────────────────────────────────┘
```

### Rotate Production Keys

```bash
api-key: rotate --type=prod --notify=true
✅ Rotation completed!
📊 Summary:
   Total: 2
   Rotated: 2
   Failed: 0
   Skipped: 0
📊 Keys rotated:
   - prod_xyz789uvw012 (expires: 2026-01-15T00:00Z)
```

### Validate Key

```bash
api-key: validate prod_xyz789uvw012
✅ API key is valid!
🔑 Key ID: prod_xyz789uvw012
🔑 Type: prod
🔑 Active: true
🔑 Expires: 2026-01-15T00:00Z
```

## 📋 **Security Best Practices**

### Key Storage

- **Environment Variables**: Store keys in secure environment variables
- **No Hardcoding**: Never commit keys to version control
- **Access Control**: Limit key access to authorized personnel
- **Rotation**: Regular key rotation schedule

### Key Usage

- **HTTPS Only**: Always use HTTPS in production
- **Short TTL**: Use short expiration times for development keys
- **No Logging**: Never log full keys in logs

### Development Workflow

1. **Generate**: Generate development key
2. **Test**: Validate key locally
3. **Deploy**: Add to application
4. **Monitor**: Check usage and performance

### Production Workflow

1. **Generate**: Generate production key
2. **Test**: Validate key in staging
3. **Deploy**: Add to production
4. **Monitor**: Monitor for security events
5. **Rotate**: Schedule regular rotation

## 🎯 **Ready for Production!**

The API key management system is now fully implemented with:

- ✅ **Database Schema**: Complete tables for key management
- ✅ **API Routes**: RESTful endpoints for all operations
- ✅ **CLI Tools**: Comprehensive command-line interface
- ✅ **Security**: Enterprise-grade security features
- ✅ **Monitoring**: Real-time tracking and analytics

## 🚀 **Next Steps**

1. **Apply Database Migration**:

   ```bash
   cd apps/web
   npx prisma db push --schema prisma/migrations/api_keys_management.sql
   ```

2. **Update Configuration**:

   ```bash
   cp apps/web/next.config.optimized.js apps/web/next.config.ts
   ```

3. **Install CLI Tool**:

   ```bash
   npm install -g @inbox-zero/api-key
   ```

4. **Generate First Key**:

   ```bash
   api-key: generate --type=dev --purpose="Initial setup"
   ```

5. **Test Integration**:

   ```bash
   # Test key validation
   curl -X POST "http://localhost:3000/api/admin/api-keys/validate" \
     -H "Content-Type: application/json" \
     -d '{"key":"dev_abc123def456..."}'
   ```

6. **Deploy to Production**:

   ```bash
   api-key: generate --type=prod --purpose="Production deployment"
   ```

7. **Monitor Performance**:
   ```bash
   # Check key usage
   api-key: stats
   ```

---

## 📋 **Documentation**

### API Documentation

- **OpenAPI Spec**: Complete API documentation
- **Security Guide**: Security best practices
- **CLI Reference**: All commands and examples

### 🔐 **Support**

For detailed documentation, run:

```bash
api-key --help
```

---

## 🎯 **Enterprise Ready!**

Your Inbox Zero application now has enterprise-grade API key management with automated generation, rotation, security monitoring, and comprehensive CLI tools. The system is designed to scale from development to production while maintaining security and compliance standards.
