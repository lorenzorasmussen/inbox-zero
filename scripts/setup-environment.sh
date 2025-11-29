#!/bin/bash

# Environment Setup Script for Inbox Zero
# Creates and configures all necessary .env files

set -e

echo "🔧 Inbox Zero Environment Setup"
echo "================================="
echo ""

# Function to generate secure random values
generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex "$1" 2>/dev/null || echo "$(date +%s | sha256sum | head -c 32)"
    else
        date +%s | sha256sum | head -c "$1"
    fi
}

# Function to check if value exists
check_value() {
    local var_name="$1"
    local current_value="${!var_name}"
    
    if [[ -z "$current_value" || "$current_value" == *"#"* || "$current_value" == *"="* ]]; then
        return 1  # Value is missing or placeholder
    else
        return 0  # Value exists
    fi
}

echo "📋 Checking environment configuration..."

# Check if main .env exists and is accessible
if [[ ! -f "apps/web/.env" ]]; then
    echo "📝 Creating main .env file from template..."
    cp apps/web/.env.example apps/web/.env
    echo "✅ Created apps/web/.env from template"
fi

# Read current .env values (if accessible)
if [[ -f "apps/web/.env" && -r "apps/web/.env" ]]; then
    source apps/web/.env 2>/dev/null || true
fi

echo ""
echo "🔍 Checking required environment variables..."

# Check and generate missing required values
echo ""
echo "🔐 Authentication & Security:"
if ! check_value "AUTH_SECRET"; then
    AUTH_SECRET=$(generate_secret 32)
    echo "   📝 Generated AUTH_SECRET"
else
    echo "   ✅ AUTH_SECRET exists"
fi

if ! check_value "EMAIL_ENCRYPT_SECRET"; then
    EMAIL_ENCRYPT_SECRET=$(generate_secret 32)
    echo "   📝 Generated EMAIL_ENCRYPT_SECRET"
else
    echo "   ✅ EMAIL_ENCRYPT_SECRET exists"
fi

if ! check_value "EMAIL_ENCRYPT_SALT"; then
    EMAIL_ENCRYPT_SALT=$(generate_secret 16)
    echo "   📝 Generated EMAIL_ENCRYPT_SALT"
else
    echo "   ✅ EMAIL_ENCRYPT_SALT exists"
fi

if ! check_value "INTERNAL_API_KEY"; then
    INTERNAL_API_KEY=$(generate_secret 32)
    echo "   📝 Generated INTERNAL_API_KEY"
else
    echo "   ✅ INTERNAL_API_KEY exists"
fi

if ! check_value "API_KEY_SALT"; then
    API_KEY_SALT=$(generate_secret 32)
    echo "   📝 Generated API_KEY_SALT"
else
    echo "   ✅ API_KEY_SALT exists"
fi

echo ""
echo "🌐 Base URL Configuration:"
if ! check_value "NEXT_PUBLIC_BASE_URL"; then
    # Determine appropriate base URL based on context
    if [[ -n "$DOCKER_ENV" ]]; then
        NEXT_PUBLIC_BASE_URL="http://localhost:3001"
        echo "   📝 Set NEXT_PUBLIC_BASE_URL for Docker: $NEXT_PUBLIC_BASE_URL"
    else
        NEXT_PUBLIC_BASE_URL="http://localhost:3000"
        echo "   📝 Set NEXT_PUBLIC_BASE_URL for local dev: $NEXT_PUBLIC_BASE_URL"
    fi
else
    echo "   ✅ NEXT_PUBLIC_BASE_URL exists: $NEXT_PUBLIC_BASE_URL"
fi

echo ""
echo "🗄️ Database Configuration:"
if ! check_value "DATABASE_URL"; then
    # Set appropriate database URL based on context
    if [[ -n "$DOCKER_ENV" ]]; then
        DATABASE_URL="postgresql://postgres:password@localhost:5432/inboxzero?schema=public"
        echo "   📝 Set DATABASE_URL for Docker production"
    else
        DATABASE_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public"
        echo "   📝 Set DATABASE_URL for local dev"
    fi
else
    echo "   ✅ DATABASE_URL exists"
fi

if ! check_value "DIRECT_URL"; then
    if [[ -n "$DOCKER_ENV" ]]; then
        DIRECT_URL="postgresql://postgres:password@localhost:5432/inboxzero?schema=public"
    else
        DIRECT_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public"
    fi
    echo "   📝 Set DIRECT_URL"
else
    echo "   ✅ DIRECT_URL exists"
fi

echo ""
echo "🔴 Redis Configuration:"
if ! check_value "UPSTASH_REDIS_URL"; then
    UPSTASH_REDIS_URL="http://localhost:8079"
    echo "   📝 Set UPSTASH_REDIS_URL: $UPSTASH_REDIS_URL"
else
    echo "   ✅ UPSTASH_REDIS_URL exists"
fi

if ! check_value "UPSTASH_REDIS_TOKEN"; then
    UPSTASH_REDIS_TOKEN=$(generate_secret 32)
    echo "   📝 Generated UPSTASH_REDIS_TOKEN"
else
    echo "   ✅ UPSTASH_REDIS_TOKEN exists"
fi

echo ""
echo "🤖 LLM Configuration Check:"
LLM_PROVIDER_SET=false

# Check if any LLM provider is configured
if check_value "OPENROUTER_API_KEY" && [[ -n "$OPENROUTER_API_KEY" ]]; then
    echo "   ✅ OpenRouter configured"
    LLM_PROVIDER_SET=true
elif check_value "ANTHROPIC_API_KEY" && [[ -n "$ANTHROPIC_API_KEY" ]]; then
    echo "   ✅ Anthropic configured"
    LLM_PROVIDER_SET=true
elif check_value "OPENAI_API_KEY" && [[ -n "$OPENAI_API_KEY" ]]; then
    echo "   ✅ OpenAI configured"
    LLM_PROVIDER_SET=true
elif check_value "GOOGLE_API_KEY" && [[ -n "$GOOGLE_API_KEY" ]]; then
    echo "   ✅ Google configured"
    LLM_PROVIDER_SET=true
elif check_value "GROQ_API_KEY" && [[ -n "$GROQ_API_KEY" ]]; then
    echo "   ✅ Groq configured"
    LLM_PROVIDER_SET=true
fi

if ! $LLM_PROVIDER_SET; then
    echo ""
    echo "⚠️  WARNING: No LLM provider configured!"
    echo "   💡 Please configure one of the following:"
    echo "      - OpenRouter: OPENROUTER_API_KEY"
    echo "      - Anthropic: ANTHROPIC_API_KEY"
    echo "      - OpenAI: OPENAI_API_KEY"
    echo "      - Google: GOOGLE_API_KEY"
    echo "      - Groq: GROQ_API_KEY"
    echo ""
    echo "📝 To configure OpenRouter (recommended):"
    echo "   OPENROUTER_API_KEY=your_openrouter_key_here"
    echo "   DEFAULT_LLM_PROVIDER=openrouter"
    echo "   DEFAULT_LLM_MODEL=anthropic/claude-sonnet-4.5"
    echo "   ECONOMY_LLM_PROVIDER=openrouter"
    echo "   ECONOMY_LLM_MODEL=anthropic/claude-haiku-4.5"
fi

echo ""
echo "🔧 Optional Services Check:"

# Check optional services
if check_value "GOOGLE_CLIENT_ID" && check_value "GOOGLE_CLIENT_SECRET"; then
    echo "   ✅ Google OAuth configured"
else
    echo "   ⚠️  Google OAuth not configured (optional for Gmail integration)"
fi

if check_value "MICROSOFT_CLIENT_ID" && check_value "MICROSOFT_CLIENT_SECRET"; then
    echo "   ✅ Microsoft OAuth configured"
else
    echo "   ⚠️  Microsoft OAuth not configured (optional for Outlook integration)"
fi

# Write updated .env file
echo ""
echo "💾 Writing updated configuration..."

# Create backup of existing .env
if [[ -f "apps/web/.env" ]]; then
    cp apps/web/.env apps/web/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo "   📋 Backed up existing .env to apps/web/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Write new .env with all generated values
cat > apps/web/.env << EOF
# =============================================================================
# Inbox Zero Environment Configuration
# Generated on $(date)
# =============================================================================

# 🔐 Authentication & Security
AUTH_SECRET=${AUTH_SECRET}
EMAIL_ENCRYPT_SECRET=${EMAIL_ENCRYPT_SECRET}
EMAIL_ENCRYPT_SALT=${EMAIL_ENCRYPT_SALT}
INTERNAL_API_KEY=${INTERNAL_API_KEY}
API_KEY_SALT=${API_KEY_SALT}

# 🌐 Base URL Configuration
NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# 🗄️ Database Configuration
DATABASE_URL=${DATABASE_URL}
DIRECT_URL=${DIRECT_URL}

# 🔴 Redis Configuration
UPSTASH_REDIS_URL=${UPSTASH_REDIS_URL}
UPSTASH_REDIS_TOKEN=${UPSTASH_REDIS_TOKEN}

# 🤖 LLM Configuration (choose ONE provider block)
# --- OpenRouter (Recommended) ---
DEFAULT_LLM_PROVIDER=openrouter
DEFAULT_LLM_MODEL=anthropic/claude-sonnet-4.5
ECONOMY_LLM_PROVIDER=openrouter
ECONOMY_LLM_MODEL=anthropic/claude-haiku-4.5
OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-}

# --- Anthropic ---
# DEFAULT_LLM_PROVIDER=anthropic
# DEFAULT_LLM_MODEL=claude-sonnet-4-5-20250514
# ECONOMY_LLM_PROVIDER=anthropic
# ECONOMY_LLM_MODEL=claude-haiku-4-5-20250514
# ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}

# --- OpenAI ---
# DEFAULT_LLM_PROVIDER=openai
# DEFAULT_LLM_MODEL=gpt-4o
# ECONOMY_LLM_PROVIDER=openai
# ECONOMY_LLM_MODEL=gpt-4o-mini
# OPENAI_API_KEY=${OPENAI_API_KEY:-}

# --- Google Vertex ---
# DEFAULT_LLM_PROVIDER=google
# DEFAULT_LLM_MODEL=gemini-2.5-pro
# ECONOMY_LLM_PROVIDER=google
# ECONOMY_LLM_MODEL=gemini-2.5-flash
# GOOGLE_API_KEY=${GOOGLE_API_KEY:-}

# --- Groq ---
# DEFAULT_LLM_PROVIDER=groq
# DEFAULT_LLM_MODEL=llama-3.3-70b-versatile
# ECONOMY_LLM_PROVIDER=groq
# ECONOMY_LLM_MODEL=llama-3.1-8b-instant
# GROQ_API_KEY=${GROQ_API_KEY:-}

# 🌐 OAuth Configuration (Optional)
# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_PUBSUB_TOPIC_NAME=${GOOGLE_PUBSUB_TOPIC_NAME:-projects/abc/topics/xyz}
GOOGLE_PUBSUB_VERIFICATION_TOKEN=${GOOGLE_PUBSUB_VERIFICATION_TOKEN:-}

# Microsoft OAuth
MICROSOFT_CLIENT_ID=${MICROSOFT_CLIENT_ID:-}
MICROSOFT_CLIENT_SECRET=${MICROSOFT_CLIENT_SECRET:-}
MICROSOFT_WEBHOOK_CLIENT_STATE=${MICROSOFT_WEBHOOK_CLIENT_STATE:-}

# 💳 Premium Configuration
NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS=true

# 📊 Optional Services (configure as needed)
# Tinybird (Analytics)
TINYBIRD_TOKEN=${TINYBIRD_TOKEN:-}
TINYBIRD_BASE_URL=${TINYBIRD_BASE_URL:-https://api.us-east.tinybird.co/}
TINYBIRD_ENCRYPT_SECRET=${TINYBIRD_ENCRYPT_SECRET:-}
TINYBIRD_ENCRYPT_SALT=${TINYBIRD_ENCRYPT_SALT:-}

# Sentry (Error Tracking)
SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}
SENTRY_ORGANIZATION=${SENTRY_ORGANIZATION:-}
SENTRY_PROJECT=${SENTRY_PROJECT:-}
NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN:-}

# Axiom (Logging)
NEXT_PUBLIC_AXIOM_DATASET=${NEXT_PUBLIC_AXIOM_DATASET:-}
NEXT_PUBLIC_AXIOM_TOKEN=${NEXT_PUBLIC_AXIOM_TOKEN:-}

# Resend (Transactional Emails)
RESEND_API_KEY=${RESEND_API_KEY:-}

# Loops (Marketing Emails)
LOOPS_API_SECRET=${LOOPS_API_SECRET:-}

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY:-}
NEXT_PUBLIC_POSTHOG_HERO_AB=${NEXT_PUBLIC_POSTHOG_HERO_AB:-}
NEXT_PUBLIC_POSTHOG_ONBOARDING_SURVEY_ID=${NEXT_PUBLIC_POSTHOG_ONBOARDING_SURVEY_ID:-}
POSTHOG_API_SECRET=${POSTHOG_API_SECRET:-}
POSTHOG_PROJECT_ID=${POSTHOG_PROJECT_ID:-}

# Crisp (Support Chat)
NEXT_PUBLIC_CRISP_WEBSITE_ID=${NEXT_PUBLIC_CRISP_WEBSITE_ID:-}

# Cron Jobs
CRON_SECRET=${CRON_SECRET:-}

# Sanity (Blog - Optional)
NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID:-}
NEXT_PUBLIC_SANITY_DATASET="production"

# Development Settings
LOG_ZOD_ERRORS=true
EOF

echo "   ✅ Updated apps/web/.env with all required values"

# Set appropriate permissions
chmod 600 apps/web/.env
echo "   🔒 Set secure permissions (600) on .env file"

echo ""
echo "🎯 Configuration Summary:"
echo "========================"
echo "📍 Environment: ${DOCKER_ENV:-local development}"
echo "🌐 Base URL: $NEXT_PUBLIC_BASE_URL"
echo "🗄️ Database: $DATABASE_URL"
echo "🔴 Redis: $UPSTASH_REDIS_URL"
echo "🔐 Security: All secrets generated"
echo "🤖 LLM: $([ -n "$OPENROUTER_API_KEY" ] && echo "OpenRouter configured" || echo "Needs configuration")"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. 📝 Configure LLM provider if not set:"
echo "   Edit apps/web/.env and add your API key"
echo ""
echo "2. 🌐 Configure OAuth if needed:"
echo "   - Google: https://console.cloud.google.com/apis/credentials"
echo "   - Microsoft: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps"
echo ""
echo "3. 🚀 Start development:"
if [[ -n "$DOCKER_ENV" ]]; then
    echo "   ./docker/scripts/start-optimized.sh"
else
    echo "   docker-compose -f docker-compose.dev-optimized.yml up -d"
    echo "   cd apps/web && pnpm dev"
fi
echo ""
echo "4. 📊 Verify setup:"
echo "   curl http://localhost:3000/api/health"
echo ""

echo "✅ Environment setup complete!"
echo "📋 All required values have been configured."
echo "🔒 Sensitive data is protected with secure permissions."
echo ""
echo "💡 Tip: Keep your .env file secure and never commit it to version control."