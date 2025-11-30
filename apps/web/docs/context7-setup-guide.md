# Context7 MCP Server Setup Guide

## 🚀 Getting Your Context7 API Key

Context7 provides AI-powered documentation and repository search capabilities. To use the Context7 MCP server, you need an API key.

### Step 1: Visit Context7

```
🌐 https://context7.ai
```

### Step 2: Sign Up / Sign In

- Create an account or sign in to existing account
- Context7 offers both free and paid tiers

### Step 3: Get API Key

- Go to your account settings/dashboard
- Look for "API Keys" or "Developer" section
- Generate a new API key
- Copy the API key (it will look like: `ctx7_...`)

### Step 4: Set Environment Variable

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export CONTEXT7_API_KEY=your_api_key_here

# Or set it temporarily for current session
export CONTEXT7_API_KEY=ctx7_your_key_here
```

### Step 5: Verify Setup

```bash
# Test the Context7 MCP server
npx @upstash/context7-mcp --api-key $CONTEXT7_API_KEY --help
```

## 🎯 Context7 Capabilities

Once configured, Context7 provides:

### Repository Information

- **Code search** across repositories
- **Documentation lookup** for frameworks/libraries
- **API reference** for development tools
- **Best practices** and implementation guides

### Software & Tool Information

- **Framework documentation** (React, Vue, Angular, etc.)
- **Library APIs** (Lodash, Axios, etc.)
- **Tool configurations** (ESLint, Prettier, etc.)
- **Extension capabilities** (VS Code, browser extensions)

### Development Resources

- **Repository analysis** and code patterns
- **Software architecture** best practices
- **Tool comparisons** and recommendations
- **Extension ecosystems** and integrations

## 🔧 Alternative Setup (If API Key Unavailable)

If you can't get a Context7 API key immediately, you can still use:

### 1. GitHub MCP Server (Already Configured)

```bash
# Search repositories directly
opencode run --prompt "Search for React component libraries on GitHub"
```

### 2. Web Search Integration

```bash
# Use web search for repository information
opencode run --prompt "Find popular TypeScript utility libraries"
```

### 3. Filesystem Search

```bash
# Search local documentation and code
opencode run --prompt "Find all TypeScript config files in workspace"
```

## 🚀 Quick Setup Commands

```bash
# 1. Get your Context7 API key from https://context7.ai

# 2. Set the environment variable
echo "export CONTEXT7_API_KEY=your_key_here" >> ~/.zshrc
source ~/.zshrc

# 3. Test the connection
npx @upstash/context7-mcp --api-key $CONTEXT7_API_KEY "search for React hooks documentation"

# 4. Use in OpenCode
opencode run --prompt "Find the best practices for Next.js API routes"
```

## 📋 Context7 Use Cases

**Repository Analysis:**

- "What are the most popular React state management libraries?"
- "Find repositories implementing JWT authentication"

**Software Information:**

- "Compare Express.js vs Fastify performance"
- "Best practices for TypeScript project structure"

**Tool & Extension Info:**

- "VS Code extensions for React development"
- "ESLint configurations for TypeScript projects"

**Development Resources:**

- "API documentation for Stripe payment integration"
- "Best practices for database schema design"

---

**🎯 Once you have your Context7 API key, you'll have access to comprehensive repository and software information through AI-powered search and documentation!**
