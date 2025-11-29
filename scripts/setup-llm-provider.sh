#!/bin/bash

# Demo LLM Provider Setup Script
# This script demonstrates how to configure LLM providers for Inbox Zero

set -e

echo "🤖 Inbox Zero LLM Provider Configuration"
echo "========================================"
echo ""

# Function to validate API key format
validate_api_key() {
    local provider="$1"
    local api_key="$2"
    
    case "$provider" in
        "openrouter")
            if [[ "$api_key" =~ ^sk-or-.* ]]; then
                return 0
            else
                echo "❌ Invalid OpenRouter API key format. Should start with 'sk-or-'"
                return 1
            fi
            ;;
        "anthropic")
            if [[ "$api_key" =~ ^sk-ant-.* ]]; then
                return 0
            else
                echo "❌ Invalid Anthropic API key format. Should start with 'sk-ant-'"
                return 1
            fi
            ;;
        "openai")
            if [[ "$api_key" =~ ^sk-.* ]]; then
                return 0
            else
                echo "❌ Invalid OpenAI API key format. Should start with 'sk-'"
                return 1
            fi
            ;;
        "google")
            # Google API keys have various formats
            if [[ -n "$api_key" ]]; then
                return 0
            else
                echo "❌ Invalid Google API key"
                return 1
            fi
            ;;
        "groq")
            if [[ "$api_key" =~ ^gsk_.* ]]; then
                return 0
            else
                echo "❌ Invalid Groq API key format. Should start with 'gsk_'"
                return 1
            fi
            ;;
    esac
}

# Function to create .env configuration
configure_env() {
    local provider="$1"
    local api_key="$2"
    
    echo "📝 Updating .env configuration..."
    
    # Create a backup
    if [[ -f "apps/web/.env" ]]; then
        cp "apps/web/.env" "apps/web/.env.backup.$(date +%Y%m%d_%H%M%S)"
        echo "   ✅ Created backup of existing .env"
    fi
    
    # Create demo configuration
    cat > apps/web/.env.demo << EOF
# =============================================================================
# Inbox Zero LLM Provider Configuration
# Generated for demo purposes - replace with real API keys
# =============================================================================

# 🔐 Authentication & Security (auto-generated)
AUTH_SECRET=demo_auth_secret_1234567890abcdef1234567890abcdef
EMAIL_ENCRYPT_SECRET=demo_email_encrypt_secret_1234567890abcdef
EMAIL_ENCRYPT_SALT=demo_salt_12345678
INTERNAL_API_KEY=demo_internal_api_key_1234567890abcdef
API_KEY_SALT=demo_api_key_salt_1234567890abcdef

# 🌐 Base URL Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 🗄️ Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5433/inboxzero?schema=public
DIRECT_URL=postgresql://postgres:password@localhost:5433/inboxzero?schema=public

# 🔴 Redis Configuration
UPSTASH_REDIS_URL=http://localhost:8079
UPSTASH_REDIS_TOKEN=demo_redis_token_1234567890abcdef

# 🤖 LLM Configuration - $provider
EOF

    case "$provider" in
        "openrouter")
            echo "# OpenRouter Configuration" >> apps/web/.env.demo
            echo "DEFAULT_LLM_PROVIDER=openrouter" >> apps/web/.env.demo
            echo "DEFAULT_LLM_MODEL=anthropic/claude-3-sonnet-20240229" >> apps/web/.env.demo
            echo "ECONOMY_LLM_PROVIDER=openrouter" >> apps/web/.env.demo
            echo "ECONOMY_LLM_MODEL=anthropic/claude-3-haiku-20240307" >> apps/web/.env.demo
            echo "OPENROUTER_API_KEY=$api_key" >> apps/web/.env.demo
            ;;
        "anthropic")
            echo "# Anthropic Configuration" >> apps/web/.env.demo
            echo "DEFAULT_LLM_PROVIDER=anthropic" >> apps/web/.env.demo
            echo "DEFAULT_LLM_MODEL=claude-3-sonnet-20240229" >> apps/web/.env.demo
            echo "ECONOMY_LLM_PROVIDER=anthropic" >> apps/web/.env.demo
            echo "ECONOMY_LLM_MODEL=claude-3-haiku-20240307" >> apps/web/.env.demo
            echo "ANTHROPIC_API_KEY=$api_key" >> apps/web/.env.demo
            ;;
        "openai")
            echo "# OpenAI Configuration" >> apps/web/.env.demo
            echo "DEFAULT_LLM_PROVIDER=openai" >> apps/web/.env.demo
            echo "DEFAULT_LLM_MODEL=gpt-4" >> apps/web/.env.demo
            echo "ECONOMY_LLM_PROVIDER=openai" >> apps/web/.env.demo
            echo "ECONOMY_LLM_MODEL=gpt-3.5-turbo" >> apps/web/.env.demo
            echo "OPENAI_API_KEY=$api_key" >> apps/web/.env.demo
            ;;
        "google")
            echo "# Google Vertex Configuration" >> apps/web/.env.demo
            echo "DEFAULT_LLM_PROVIDER=google" >> apps/web/.env.demo
            echo "DEFAULT_LLM_MODEL=gemini-1.5-pro" >> apps/web/.env.demo
            echo "ECONOMY_LLM_PROVIDER=google" >> apps/web/.env.demo
            echo "ECONOMY_LLM_MODEL=gemini-1.5-flash" >> apps/web/.env.demo
            echo "GOOGLE_API_KEY=$api_key" >> apps/web/.env.demo
            ;;
        "groq")
            echo "# Groq Configuration" >> apps/web/.env.demo
            echo "DEFAULT_LLM_PROVIDER=groq" >> apps/web/.env.demo
            echo "DEFAULT_LLM_MODEL=llama-3.3-70b-versatile" >> apps/web/.env.demo
            echo "ECONOMY_LLM_PROVIDER=groq" >> apps/web/.env.demo
            echo "ECONOMY_LLM_MODEL=mixtral-8x7b-32768" >> apps/web/.env.demo
            echo "GROQ_API_KEY=$api_key" >> apps/web/.env.demo
            ;;
    esac

    # Add remaining configuration
    cat >> apps/web/.env.demo << EOF

# 🌐 OAuth Configuration (Optional)
# Google OAuth for Gmail integration
GOOGLE_CLIENT_ID=demo_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=demo_google_client_secret

# Microsoft OAuth for Outlook integration
MICROSOFT_CLIENT_ID=demo_microsoft_client_id
MICROSOFT_CLIENT_SECRET=demo_microsoft_client_secret
MICROSOFT_WEBHOOK_CLIENT_STATE=demo_microsoft_webhook_state_12345678

# 📧 Email Configuration
GOOGLE_PUBSUB_TOPIC_NAME=projects/demo-project/topics/demo-topic
GOOGLE_PUBSUB_VERIFICATION_TOKEN=demo_verification_token_12345678

# 💳 Premium Configuration
NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS=true

# 📊 Optional Services (demo configurations)
# Tinybird Analytics
TINYBIRD_TOKEN=demo_tinybird_token_1234567890abcdef
TINYBIRD_BASE_URL=https://api.us-east.tinybird.co/
TINYBIRD_ENCRYPT_SECRET=demo_tinybird_encrypt_secret_12345678
TINYBIRD_ENCRYPT_SALT=demo_tinybird_encrypt_salt_123456

# Sentry Error Tracking
SENTRY_AUTH_TOKEN=demo_sentry_auth_token_1234567890abcdef
SENTRY_ORGANIZATION=demo-org
SENTRY_PROJECT=demo-project
NEXT_PUBLIC_SENTRY_DSN=https://demo@sentry.io/dsn

# Axiom Logging
NEXT_PUBLIC_AXIOM_DATASET=demo-dataset
NEXT_PUBLIC_AXIOM_TOKEN=demo_axiom_token_1234567890abcdef

# Resend Transactional Emails
RESEND_API_KEY=re_demo_api_key_1234567890abcdef

# Loops Marketing Emails
LOOPS_API_SECRET=demo_loops_api_secret_1234567890abcdef

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=demo_posthog_key_1234567890abcdef
NEXT_PUBLIC_POSTHOG_HERO_AB=demo_ab_test
NEXT_PUBLIC_POSTHOG_ONBOARDING_SURVEY_ID=demo_survey_id

# Crisp Support Chat
NEXT_PUBLIC_CRISP_WEBSITE_ID=demo_crisp_website_id

# Cron Jobs
CRON_SECRET=demo_cron_secret_12345678

# Sanity Blog (Optional)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Development Settings
LOG_ZOD_ERRORS=true
EOF

    # Set secure permissions
    chmod 600 apps/web/.env.demo
    echo "   ✅ Created demo configuration: apps/web/.env.demo"
    echo "   🔒 Set secure permissions (600)"
}

# Main execution
echo "📋 Available LLM Providers:"
echo "1. OpenRouter (Recommended)"
echo "2. Anthropic Claude"
echo "3. OpenAI GPT"
echo "4. Google Vertex"
echo "5. Groq"
echo ""

# For demo purposes, configure OpenRouter with a placeholder
echo "🤖 Configuring OpenRouter (demo setup)..."
echo "   📝 Provider: OpenRouter"
echo "   📝 Model: Claude 3.5 Sonnet (default)"
echo "   📝 Economy Model: Claude 3.5 Haiku"

# Create demo API key (this is not a real key)
DEMO_API_KEY="sk-or-demo-key-1234567890abcdef"

configure_env "openrouter" "$DEMO_API_KEY"

echo ""
echo "🎯 Configuration Summary:"
echo "========================"
echo "✅ LLM Provider: OpenRouter"
echo "✅ Default Model: Claude 3.5 Sonnet"
echo "✅ Economy Model: Claude 3.5 Haiku"
echo "✅ Demo API Key: $DEMO_API_KEY"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. 📝 Replace demo API key with real one:"
echo "   - Get OpenRouter API key: https://openrouter.ai/"
echo "   - Edit: apps/web/.env.demo"
echo "   - Replace: $DEMO_API_KEY with your real key"
echo ""
echo "2. 📋 Copy configuration to main .env:"
echo "   cp apps/web/.env.demo apps/web/.env"
echo ""
echo "3. 🚀 Restart web application:"
echo "   pkill -f 'pnpm dev'"
echo "   cd apps/web && pnpm dev"
echo ""
echo "4. 🧪 Test LLM integration:"
echo "   curl -X POST http://localhost:3000/api/ai/test \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Hello, test message\"}'"

echo ""
echo "⚠️  Important Notes:"
echo "=================="
echo "🔐 Security: Replace demo keys with real API keys"
echo "💳 Costs: LLM API usage may incur charges"
echo "🔍 Testing: Verify API key works before full deployment"
echo "📚 Documentation: See LLM_SETUP_GUIDE.md for detailed instructions"

echo ""
echo "✅ Demo LLM configuration complete!"
echo "📋 Real API key configuration required for production use."