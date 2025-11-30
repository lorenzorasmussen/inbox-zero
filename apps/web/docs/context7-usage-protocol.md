# Context7 MCP Server Integration Guide

## 🎯 Context7 Usage Protocol

**Whenever checking repositories, software information, tools, extensions, or development resources, ALWAYS use the Context7 MCP server.**

## 🔑 Setup Requirements

### 1. Get Context7 API Key

```bash
# Visit: https://context7.ai
# 1. Sign up/Sign in
# 2. Go to API Keys section
# 3. Generate new API key
# 4. Copy the key (format: ctx7_...)
```

### 2. Set Environment Variable

```bash
# Add to your shell profile
export CONTEXT7_API_KEY=your_context7_api_key_here

# Or set temporarily
export CONTEXT7_API_KEY=ctx7_your_key_here
```

### 3. Verify Setup

```bash
# Test Context7 MCP server
npx @upstash/context7-mcp --api-key $CONTEXT7_API_KEY "test connection"

# Should respond with Context7 capabilities
```

## 🚀 Context7 Query Protocol

### Repository Information

```bash
# ✅ CORRECT: Use Context7 for repository queries
opencode run --prompt "Find popular React component libraries on GitHub"

# ✅ CORRECT: Use Context7 for framework documentation
opencode run --prompt "Best practices for Next.js API routes"

# ✅ CORRECT: Use Context7 for tool comparisons
opencode run --prompt "Compare Zustand vs Redux for React state management"
```

### Software & Tool Information

```bash
# ✅ CORRECT: Use Context7 for library documentation
opencode run --prompt "API documentation for Lodash utility functions"

# ✅ CORRECT: Use Context7 for tool configurations
opencode run --prompt "ESLint configurations for TypeScript projects"

# ✅ CORRECT: Use Context7 for extension ecosystems
opencode run --prompt "VS Code extensions for React development"
```

### Extension & Plugin Information

```bash
# ✅ CORRECT: Use Context7 for browser extensions
opencode run --prompt "Chrome extensions for web development"

# ✅ CORRECT: Use Context7 for IDE plugins
opencode run --prompt "IntelliJ IDEA plugins for Java development"
```

## 🔄 Fallback Protocol (When Context7 Unavailable)

**ONLY use these alternatives if Context7 API key is not configured:**

### 1. GitHub MCP Server

```bash
# Use for direct repository operations
opencode run --prompt "Search GitHub for TypeScript utility libraries"
```

### 2. Web Search Integration

```bash
# Use for general web searches
opencode run --prompt "Find documentation for Express.js middleware"
```

### 3. Filesystem Search

```bash
# Use for local documentation
opencode run --prompt "Find all package.json files with testing dependencies"
```

## 📋 Context7 Use Cases Matrix

| Query Type                    | Context7 Usage | Example                                             |
| ----------------------------- | -------------- | --------------------------------------------------- |
| **Repository Search**         | ✅ Always      | "Find repositories implementing JWT authentication" |
| **Library Documentation**     | ✅ Always      | "Stripe API integration examples"                   |
| **Framework Best Practices**  | ✅ Always      | "Vue.js component composition patterns"             |
| **Tool Comparisons**          | ✅ Always      | "Webpack vs Vite build performance"                 |
| **Extension Recommendations** | ✅ Always      | "Browser extensions for API testing"                |
| **Code Patterns**             | ✅ Always      | "Common design patterns in Python"                  |
| **Configuration Guides**      | ✅ Always      | "Docker Compose for microservices"                  |

## 🎯 Implementation Status

### ✅ Configured MCP Servers

- **Context7**: ⚠️ **REQUIRES API KEY** (currently unavailable)
- **GitHub**: ✅ Ready (199 tools available)
- **Desktop Commander**: ✅ Ready (terminal + file operations)
- **Filesystem**: ✅ Ready (file system access)
- **Memory**: ✅ Ready (knowledge graph)
- **Chrome DevTools**: ✅ Ready (browser debugging)

### 🔧 Environment Setup

```bash
# Required for Context7
export CONTEXT7_API_KEY=ctx7_your_key_here

# Required for GitHub operations
export GITHUB_TOKEN=ghp_your_github_token_here
```

## 🚀 Context7 Query Examples

### Repository Analysis

```bash
opencode run --prompt "What are the most popular React state management libraries?"
opencode run --prompt "Find repositories with clean architecture implementations"
opencode run --prompt "Best GitHub repositories for learning TypeScript"
```

### Software Documentation

```bash
opencode run --prompt "Official documentation for PostgreSQL JSON functions"
opencode run --prompt "AWS SDK documentation for S3 operations"
opencode run --prompt "Docker best practices for production deployments"
```

### Tool & Extension Research

```bash
opencode run --prompt "Most popular VS Code themes for developers"
opencode run --prompt "Chrome DevTools extensions for performance monitoring"
opencode run --prompt "Terminal tools for system monitoring on macOS"
```

## ⚡ Quick Setup (For Immediate Use)

Since Context7 requires an API key, use this temporary setup:

```bash
# 1. Use GitHub MCP for repository queries
opencode run --prompt "Find popular React libraries on GitHub"

# 2. Use web search for documentation
# (Context7 would be preferred here)

# 3. Use filesystem search for local info
opencode run --prompt "Find all TypeScript configuration files"
```

## 🎯 Priority Action Items

1. **🔴 HIGH**: Get Context7 API key from https://context7.ai
2. **🟡 MEDIUM**: Set `CONTEXT7_API_KEY` environment variable
3. **🟢 LOW**: Test Context7 integration with sample queries

---

**🎯 REMINDER: Always prefer Context7 for repository, software, tool, and extension information queries. It provides AI-powered, comprehensive search and documentation capabilities.**

**Once Context7 API key is configured, it will become the primary tool for all software and repository research queries.**
