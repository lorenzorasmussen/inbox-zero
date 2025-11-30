#!/bin/bash

# Google-Only OAuth Setup for Inbox Zero
echo "🔐 Google OAuth Setup for Inbox Zero"
echo "===================================="
echo ""

echo "📋 GOOGLE SETUP STEPS:"
echo ""

echo "STEP 1: Google Cloud Console Setup"
echo "==================================="
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create/select a project (note the Project ID)"
echo ""

echo "3. Enable these APIs:"
echo "   - Gmail API: https://console.cloud.google.com/apis/library/gmail.googleapis.com"
echo "   - Google Calendar API: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
echo "   - People API: https://console.cloud.google.com/apis/library/people.googleapis.com"
echo "   - Cloud Pub/Sub API: https://console.cloud.google.com/apis/library/pubsub.googleapis.com"
echo ""

echo "4. Create PubSub topic:"
echo "   Go to Pub/Sub → Topics → Create Topic"
echo "   Topic ID: gmail-webhooks"
echo ""

echo "5. Configure OAuth consent screen:"
echo "   Go to OAuth consent screen"
echo "   - User Type: External"
echo "   - App name: Inbox Zero"
echo "   - Scopes: Add these manually:"
echo "     * https://www.googleapis.com/auth/gmail.readonly"
echo "     * https://www.googleapis.com/auth/gmail.send"
echo "     * https://www.googleapis.com/auth/calendar.readonly"
echo "     * https://www.googleapis.com/auth/contacts.readonly"
echo ""

echo "6. Create OAuth credentials:"
echo "   Go to Credentials → Create Credentials → OAuth 2.0 Client IDs"
echo "   - Application type: Web application"
echo "   - Name: Inbox Zero Web App"
echo "   - Authorized JavaScript origins:"
echo "     * http://localhost:3000"
echo "     * https://yourdomain.com (production)"
echo "   - Authorized redirect URIs:"
echo "     * http://localhost:3000/api/auth/callback/google"
echo "     * https://yourdomain.com/api/auth/callback/google (production)"
echo ""

read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "Enter your Google Cloud Project ID: " GOOGLE_PROJECT_ID
echo ""

# Generate verification token
VERIFICATION_TOKEN=$(openssl rand -hex 32 2>/dev/null || echo "generated-verification-token-$(date +%s)")

echo "🔐 Generated PubSub verification token: $VERIFICATION_TOKEN"
echo ""

# Create Google-only .env.oauth file
cat > .env.oauth << EOF
# Google OAuth Configuration (Google Only)
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Google PubSub Configuration
GOOGLE_PUBSUB_TOPIC_NAME=projects/$GOOGLE_PROJECT_ID/topics/gmail-webhooks
GOOGLE_PUBSUB_VERIFICATION_TOKEN=$VERIFICATION_TOKEN

# Webhook URL (update with your production domain)
WEBHOOK_URL=http://localhost:3000/api/google/webhook?token=$VERIFICATION_TOKEN

# Microsoft OAuth (disabled for Google-only setup)
# MICROSOFT_CLIENT_ID=
# MICROSOFT_CLIENT_SECRET=
EOF

echo "✅ Google OAuth configuration saved to .env.oauth"
echo ""

echo "🎯 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Apply the configuration:"
echo "   cat .env.oauth >> .env"
echo ""
echo "2. Test the setup:"
echo "   cd apps/web && pnpm dev"
echo "   Visit: http://localhost:3000"
echo "   Click 'Sign in with Google'"
echo ""
echo "3. For production deployment:"
echo "   - Update redirect URIs in Google Cloud Console with production domain"
echo "   - Update WEBHOOK_URL with production domain"
echo ""

echo "📚 Documentation:"
echo "================="
echo "- OAUTH_README.md - Complete overview"
echo "- OAUTH_QUICK_REFERENCE.md - Quick commands"
echo ""

echo "🎉 Ready to test Google OAuth integration!"