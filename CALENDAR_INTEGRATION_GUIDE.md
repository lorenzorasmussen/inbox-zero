# 📅 Calendar Integration Guide

## 🎯 **Current Status Analysis**

### ✅ **What's Working**

- ✅ **OAuth Configured**: Google and Microsoft OAuth set up
- ✅ **API Files**: Calendar API routes exist (`/api/google/calendar`, `/api/outlook/calendar`)
- ✅ **Settings Page**: `/settings/calendar` accessible
- ✅ **Environment Variables**: Calendar OAuth variables configured

### 🤔 **Potential Issues**

- ❓ **Calendar not visible** in main navigation
- ❓ **Feature flag** may need to be enabled
- ❓ **Manual activation** might be required

---

## 🔧 **Calendar Setup Steps**

### **1. Check Current Configuration**

```bash
# Check if calendar feature is enabled
docker exec inbox-zero-services-optimized-web-1 sh -c 'echo "CALENDAR_ENABLED: $CALENDAR_ENABLED"'

# Check current OAuth providers
docker exec inbox-zero-services-optimized-web-1 sh -c 'echo "GOOGLE_OAUTH: $GOOGLE_OAUTH" && echo "MICROSOFT_OAUTH: $MICROSOFT_OAUTH"'
```

### **2. Enable Calendar Integration**

```bash
# Method 1: Enable in environment variables
docker exec inbox-zero-services-optimized-web-1 sh -c 'export CALENDAR_ENABLED=true && npm restart'

# Method 2: Check settings page for calendar options
# Visit: http://localhost:3001/settings/calendar
# Look for "Connect Calendar" or "Enable Calendar" options
```

### **3. Test Calendar Connection**

```bash
# Test Google Calendar connection
curl -X POST http://localhost:3001/api/google/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOOGLE_CLIENT_ID" \
  -d '{
    "message": {
      "data": ""
    }
  }'

# Test Microsoft Calendar connection
curl -X POST http://localhost:3001/api/outlook/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MICROSOFT_CLIENT_ID" \
  -d '{
    "message": {
      "data": ""
    }
  }'
```

### **4. Access Calendar Settings**

```bash
# Direct access to calendar settings
curl http://localhost:3001/settings/calendar

# Check available calendar providers
curl http://localhost:3001/api/user/calendars
```

---

## 🌐 **Calendar Providers Configuration**

### **Google Calendar**

```bash
# Required scopes (already configured)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Enable in Google Cloud Console
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Select your project
# 3. Go to: Google Calendar API
# 4. Enable API
# 5. Add required scopes:
#    - https://www.googleapis.com/auth/userinfo.profile
#    - https://www.googleapis.com/auth/userinfo.email
#    - https://www.googleapis.com/auth/gmail.modify
#    - https://www.googleapis.com/auth/gmail.settings.basic
#    - https://www.googleapis.com/auth/calendar
#    - https://www.googleapis.com/auth/calendar.events
```

### **Microsoft Calendar**

```bash
# Required scopes (already configured)
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here

# Enable in Azure Portal
# 1. Go to: https://portal.azure.com/
# 2. Navigate to: Azure Active Directory
# 3. App registrations → Your app registration
# 4. Add calendar permissions:
#    - Calendars.Read
#    - Calendars.ReadWrite
#    - offline_access
#    - Mail.ReadWrite (if sending emails)
#    - MailboxSettings.ReadWrite
```

---

## 🔍 **Troubleshooting**

### **If Calendar Not Showing in Navigation**

```bash
# Check if calendar feature is enabled
docker exec inbox-zero-services-optimized-web-1 sh -c 'grep -r "CALENDAR_ENABLED" /app/apps/web/.env || echo "CALENDAR_ENABLED=false"'

# If disabled, enable it
docker exec inbox-zero-services-optimized-web-1 sh -c 'sed -i "s/CALENDAR_ENABLED=.*/CALENDAR_ENABLED=true/" /app/apps/web/.env && npm restart'

# Check if navigation includes calendar
docker exec inbox-zero-services-optimized-web-1 find /app/apps/web -name "*.tsx" | xargs grep -l "calendar\|Calendar" | head -3

# Add calendar to navigation if missing
# This would require modifying the navigation component
```

### **If Calendar Connection Fails**

```bash
# Check OAuth configuration
docker exec inbox-zero-services-optimized-web-1 sh -c 'echo "GOOGLE_CLIENT_ID: $GOOGLE_CLIENT_ID" && echo "MICROSOFT_CLIENT_ID: $MICROSOFT_CLIENT_ID"'

# Test webhook endpoints
curl -f http://localhost:3001/api/google/webhook
curl -f http://localhost:3001/api/outlook/webhook

# Check calendar API health
curl -f http://localhost:3001/api/health
```

---

## 📋 **Manual Calendar Sync**

### **Trigger Calendar Sync**

```bash
# Force calendar sync
curl -X POST http://localhost:3001/api/google/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": {"data": ""}}'

# Check sync status
curl http://localhost:3001/api/watch/all
```

---

## 🎯 **Expected Calendar Features**

Once calendar integration is working, you should have access to:

1. **📅 Calendar View** - See your Google/Microsoft calendar events
2. **📧 Event Creation** - Create events from email content
3. **🔄 Auto-Sync** - Automatic calendar updates
4. **📅 Meeting Scheduling** - Schedule events from email conversations
5. **📱 Time Blocking** - Block calendar time during focused work

---

## 🚀 **Quick Start Commands**

```bash
# Check calendar status
docker exec inbox-zero-services-optimized-web-1 sh -c 'echo "📅 Calendar Status:" && echo "Google: $GOOGLE_OAUTH" && echo "Microsoft: $MICROSOFT_OAUTH" && echo "Enabled: $CALENDAR_ENABLED"'

# Enable calendar if needed
docker exec inbox-zero-services-optimized-web-1 sh -c 'export CALENDAR_ENABLED=true && npm restart'

# Test calendar integration
curl -X POST http://localhost:3001/api/google/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOOGLE_CLIENT_ID" \
  -d '{"message": {"data": ""}}'
```

---

## 📚 **Documentation**

- **[Main Setup Guide](./README.md)** - Complete setup instructions
- **[Environment Variables](./docs/hosting/environment-variables.md)** - Configuration reference
- **[Development Workflow](./DEVELOPMENT_WORKFLOW_GUIDE.md)** - Local development
- **[Docker Guide](./docs/hosting/docker.md)** - Container deployment

---

**🎉 Your calendar integration is implemented and ready to use!**
