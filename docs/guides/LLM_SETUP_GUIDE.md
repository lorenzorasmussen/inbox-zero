# 🤖 LLM Provider Setup Instructions

## 🎯 **CURRENT STATUS**

✅ **Environment Setup**: Complete
✅ **Docker Services**: Running and healthy
✅ **Web Application**: Running on http://localhost:3000
⚠️ **LLM Provider**: OpenRouter configured but needs API key

---

## 🔑 **LLM PROVIDER CONFIGURATION**

### **Step 1: Choose Your LLM Provider**

#### **🥇 Recommended: OpenRouter**

- **Why**: Best balance of cost, performance, and model availability
- **Models**: Access to Claude 3.5 Sonnet, GPT-4, Gemini, Llama 3.3, and more
- **Cost**: Pay-per-use with transparent pricing
- **Setup**: Get API key from https://openrouter.ai/

#### **Alternative Options:**

**🤖 Anthropic Claude**

- **Models**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Cost**: $3/1M input tokens (high quality)
- **Setup**: Get API key from https://console.anthropic.com/

**🔷 OpenAI GPT**

- **Models**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Cost**: $5/1M input tokens (standard)
- **Setup**: Get API key from https://platform.openai.com/

**🌟 Google Vertex AI**

- **Models**: Gemini 2.5 Pro, Gemini 2.5 Flash
- **Cost**: Pay-per-use with competitive rates
- **Setup**: Get API key from https://console.cloud.google.com/

**🦙 Groq**

- **Models**: Llama 3.3 70B, Mixtral 8x7B
- **Cost**: Very low cost, high speed
- **Setup**: Get API key from https://console.groq.com/

---

## 📝 **CONFIGURATION STEPS**

### **Option 1: OpenRouter (Recommended)**

#### **1. Get OpenRouter API Key**

1. Go to https://openrouter.ai/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new API key
5. Copy the API key (starts with `sk-or-...`)

#### **2. Configure Environment**

```bash
# Edit your .env file
nano apps/web/.env

# Add your OpenRouter API key
OPENROUTER_API_KEY=sk-or-your-actual-api-key-here

# Save and exit
# Press Ctrl+X, then Y, then Enter
```

#### **3. Restart Services**

```bash
# Restart web application to pick up new environment
pkill -f "pnpm dev"
cd apps/web && pnpm dev
```

### **Option 2: Anthropic Claude**

#### **1. Get Anthropic API Key**

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create new API key
4. Copy the API key (starts with `sk-ant-...`)

#### **2. Configure Environment**

```bash
# Edit .env file
nano apps/web/.env

# Comment out OpenRouter
# OPENROUTER_API_KEY=sk-or-...

# Uncomment Anthropic section
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

#### **3. Restart Services**

```bash
# Restart web application
pkill -f "pnpm dev"
cd apps/web && pnpm dev
```

---

## 🔧 **VERIFICATION**

### **Test Your Configuration**

```bash
# Test LLM provider is working
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'

# Check logs for any errors
cd apps/web && tail -f .next/server.log
```

### **Verify in Application**

1. Open http://localhost:3000 in your browser
2. Navigate to Settings → AI Configuration
3. Check that your LLM provider is detected
4. Test with a sample message

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues**

#### **API Key Not Working**

```bash
# Check if API key is correctly set
grep OPENROUTER_API_KEY apps/web/.env

# Test API key validity
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "anthropic/claude-3-sonnet-20240229", "messages": [{"role": "user", "content": "test"}]}'
```

#### **Provider Not Available in App**

```bash
# Check if provider is enabled in .env
grep DEFAULT_LLM_PROVIDER apps/web/.env

# Restart web application
pkill -f "pnpm dev"
cd apps/web && pnpm dev
```

#### **Memory Issues**

```bash
# Check system memory
memory_pressure

# Optimize if needed
./scripts/optimize-system.sh
```

---

## 📋 **ENVIRONMENT VARIABLES REFERENCE**

### **Required for All Providers**

```bash
AUTH_SECRET=your_generated_secret
EMAIL_ENCRYPT_SECRET=your_generated_secret
EMAIL_ENCRYPT_SALT=your_generated_salt
INTERNAL_API_KEY=your_generated_secret
API_KEY_SALT=your_generated_salt
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5433/inboxzero
UPSTASH_REDIS_URL=http://localhost:8079
UPSTASH_REDIS_TOKEN=your_generated_token
```

### **OpenRouter Configuration**

```bash
DEFAULT_LLM_PROVIDER=openrouter
DEFAULT_LLM_MODEL=anthropic/claude-sonnet-4.5
ECONOMY_LLM_PROVIDER=openrouter
ECONOMY_LLM_MODEL=anthropic/claude-haiku-4.5
OPENROUTER_API_KEY=sk-or-your-api-key-here
```

### **Anthropic Configuration**

```bash
DEFAULT_LLM_PROVIDER=anthropic
DEFAULT_LLM_MODEL=claude-sonnet-4-5-20240229
ECONOMY_LLM_PROVIDER=anthropic
ECONOMY_LLM_MODEL=claude-haiku-4-5-20250514
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### **OpenAI Configuration**

```bash
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4
ECONOMY_LLM_PROVIDER=openai
ECONOMY_LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-your-api-key-here
```

---

## 🎯 **RECOMMENDATIONS**

### **For Development**

1. **Start with OpenRouter** - Best balance of features and cost
2. **Use Claude 3.5 Sonnet** - Highest quality for complex tasks
3. **Use Claude 3.5 Haiku** - Fast and cost-effective for simple tasks
4. **Monitor usage** - Check API usage in your provider dashboard

### **For Production**

1. **Set production base URL**: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
2. **Use economy model**: Configure `ECONOMY_LLM_MODEL` for cost savings
3. **Set up monitoring**: Track API costs and usage patterns
4. **Consider model routing**: Use different models for different task types

---

## 🚀 **QUICK START**

### **Choose Your Provider:**

**For OpenRouter (Recommended):**

```bash
# 1. Get API key from https://openrouter.ai/
# 2. Configure environment
nano apps/web/.env
# 3. Add: OPENROUTER_API_KEY=sk-or-your-key-here
# 4. Restart: pkill -f "pnpm dev" && cd apps/web && pnpm dev
```

**For Anthropic:**

```bash
# 1. Get API key from https://console.anthropic.com/
# 2. Configure environment
nano apps/web/.env
# 3. Add: ANTHROPIC_API_KEY=sk-ant-your-key-here
# 4. Restart: pkill -f "pnpm dev" && cd apps/web && pnpm dev
```

---

## 📞 **SUPPORT**

If you encounter issues:

1. **Check logs**: `cd apps/web && tail -f .next/server.log`
2. **Verify configuration**: `./scripts/verify-services.sh`
3. **System optimization**: `./scripts/optimize-system.sh`
4. **Port documentation**: See `PORT_CONFIGURATION_GUIDE.md`

---

_Last updated: $(date)_
