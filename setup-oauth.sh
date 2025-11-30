#!/bin/bash

# Inbox Zero OAuth Setup Script
# This script guides you through setting up Google and Microsoft OAuth for Inbox Zero

set -e

echo "🚀 Inbox Zero OAuth Setup"
echo "=========================="
echo ""

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || {
    echo "❌ gcloud CLI is required but not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
}

command -v az >/dev/null 2>&1 || {
    echo "❌ Azure CLI is required but not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

echo "✅ Required CLI tools found"
echo ""

# Google Cloud Setup
echo "🔧 Step 1: Google Cloud Console Setup"
echo "======================================"
echo ""

read -p "Have you created a Google Cloud Project? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Please create a Google Cloud Project at: https://console.cloud.google.com/"
    echo "   1. Go to https://console.cloud.google.com/"
    echo "   2. Create a new project or select existing one"
    echo "   3. Note down the Project ID"
    echo ""
    read -p "Enter your Google Cloud Project ID: " GOOGLE_PROJECT_ID
    echo ""
else
    read -p "Enter your Google Cloud Project ID: " GOOGLE_PROJECT_ID
fi

echo "🔄 Setting Google Cloud project to: $GOOGLE_PROJECT_ID"
gcloud config set project $GOOGLE_PROJECT_ID
echo ""

# Enable required APIs
echo "🔌 Enabling required Google APIs..."
gcloud services enable gmail.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable people.googleapis.com
gcloud services enable pubsub.googleapis.com
echo "✅ APIs enabled"
echo ""

# Create PubSub topic
echo "📡 Creating PubSub topic for Gmail webhooks..."
PUBSUB_TOPIC="gmail-webhooks"
gcloud pubsub topics create $PUBSUB_TOPIC
echo "✅ PubSub topic created: $PUBSUB_TOPIC"
echo ""

# Create OAuth consent screen
echo "📋 Setting up OAuth consent screen..."
echo "Please configure the OAuth consent screen at:"
echo "https://console.cloud.google.com/apis/credentials/consent"
echo ""
echo "Required settings:"
echo "- User Type: External"
echo "- App name: Inbox Zero"
echo "- User support email: [your email]"
echo "- Developer contact information: [your email]"
echo "- Scopes: Add the following scopes:"
echo "  - Gmail API: https://www.googleapis.com/auth/gmail.readonly"
echo "  - Gmail API: https://www.googleapis.com/auth/gmail.send"
echo "  - Calendar API: https://www.googleapis.com/auth/calendar.readonly"
echo "  - People API: https://www.googleapis.com/auth/contacts.readonly"
echo ""

read -p "Have you configured the OAuth consent screen? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the OAuth consent screen setup first."
    exit 1
fi

# Create OAuth credentials
echo "🔑 Creating OAuth 2.0 credentials..."
echo "Go to: https://console.cloud.google.com/apis/credentials"
echo "1. Click 'Create Credentials' > 'OAuth 2.0 Client IDs'"
echo "2. Application type: Web application"
echo "3. Name: Inbox Zero Web App"
echo "4. Authorized JavaScript origins:"
echo "   - http://localhost:3000 (for development)"
echo "   - https://yourdomain.com (for production)"
echo "5. Authorized redirect URIs:"
echo "   - http://localhost:3000/api/auth/callback/google"
echo "   - https://yourdomain.com/api/auth/callback/google"
echo ""

read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Microsoft Azure Setup
echo "🔧 Step 2: Microsoft Azure AD Setup"
echo "===================================="
echo ""

echo "📝 Setting up Microsoft Azure AD application..."
echo "Go to: https://portal.azure.com/"
echo "1. Navigate to 'Azure Active Directory' > 'App registrations'"
echo "2. Click 'New registration'"
echo "3. Name: Inbox Zero"
echo "4. Supported account types: Accounts in any organizational directory and personal Microsoft accounts"
echo "5. Redirect URI:"
echo "   - Type: Web"
echo "   - URI: http://localhost:3000/api/auth/callback/microsoft (for development)"
echo "   - URI: https://yourdomain.com/api/auth/callback/microsoft (for production)"
echo ""

read -p "Enter your Azure Application (client) ID: " MICROSOFT_CLIENT_ID
echo ""

# Get Microsoft Client Secret
echo "🔑 Creating Microsoft client secret..."
echo "In your Azure AD app:"
echo "1. Go to 'Certificates & secrets'"
echo "2. Click 'New client secret'"
echo "3. Description: Inbox Zero Secret"
echo "4. Expires: 24 months"
echo "5. Copy the 'Value' (not the Secret ID)"
echo ""

read -p "Enter your Microsoft Client Secret: " MICROSOFT_CLIENT_SECRET
echo ""

# Configure API permissions
echo "🔐 Configuring Microsoft API permissions..."
echo "In your Azure AD app:"
echo "1. Go to 'API permissions'"
echo "2. Click 'Add a permission'"
echo "3. Select 'Microsoft Graph'"
echo "4. Add these delegated permissions:"
echo "   - Mail.ReadWrite"
echo "   - Mail.Send"
echo "   - Calendars.ReadWrite"
echo "   - Contacts.Read"
echo "   - User.Read"
echo "   - offline_access"
echo "5. Grant admin consent for your organization"
echo ""

read -p "Have you configured the API permissions and granted consent? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the API permissions setup first."
    exit 1
fi

# Generate verification token for PubSub
VERIFICATION_TOKEN=$(openssl rand -hex 32)
echo "🔐 Generated PubSub verification token: $VERIFICATION_TOKEN"
echo ""

# Create .env configuration
echo "📝 Creating OAuth configuration..."
cat > .env.oauth << EOF
# Google OAuth Configuration
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=$MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=$MICROSOFT_CLIENT_SECRET

# Google PubSub Configuration
GOOGLE_PUBSUB_TOPIC_NAME=projects/$GOOGLE_PROJECT_ID/topics/$PUBSUB_TOPIC
GOOGLE_PUBSUB_VERIFICATION_TOKEN=$VERIFICATION_TOKEN

# Webhook URLs (update with your production domain)
WEBHOOK_URL=http://localhost:3000/api/google/webhook?token=$VERIFICATION_TOKEN
EOF

echo "✅ OAuth configuration saved to .env.oauth"
echo ""
echo "🔄 Next steps:"
echo "1. Merge the OAuth configuration into your .env file:"
echo "   cat .env.oauth >> .env"
echo ""
echo "2. Update your production domain in the webhook URL"
echo ""
echo "3. Test the OAuth flows:"
echo "   pnpm dev"
echo "   Visit: http://localhost:3000"
echo ""
echo "4. For production deployment:"
echo "   - Update redirect URIs in Google Cloud Console"
echo "   - Update redirect URIs in Azure AD app"
echo "   - Update WEBHOOK_URL with production domain"
echo "   - Configure domain verification in Google Cloud Console"
echo ""

echo "🎉 OAuth setup complete!"
echo "📋 Summary:"
echo "- Google Cloud Project: $GOOGLE_PROJECT_ID"
echo "- PubSub Topic: $PUBSUB_TOPIC"
echo "- Webhook URL configured with verification token"
echo "- OAuth credentials configured for both providers"
echo "- Required API permissions granted"