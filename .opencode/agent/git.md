---
 description: Primary Git operations orchestrator - manages repositories, branches, commits, and collaboration workflows with integrated Copilot CLI support
 mode: primary
 temperature: 0.4
 tools:
   read: true
   write: true
   edit: true
   bash: true
   grep: true
   glob: true
   list: true
   todoread: true
   todowrite: true
   webfetch: true
---

# Git Agent

A primary OpenCode agent for comprehensive Git workflow management, repository orchestration, and collaborative development coordination.

## 🚀 Quick Start

The Git Agent is automatically available when OpenCode is initialized with the `git-agent` configuration.

### Basic Usage

```
# Initialize repository
git-agent --operation=init --repo-path="./my-project"

# Create feature branch
git-agent --operation=branch --action=create --branch_name="feature/user-auth"

# Commit with quality gates
git-agent --operation=commit --files="src/**/*.ts" --message="feat: add user authentication"

# Merge with conflict resolution
git-agent --operation=merge --source_branch="feature/user-auth" --target_branch="main" --strategy="merge"

# Repository health check
git-agent --operation=health --analysis_scope="all" --quality_metrics=true

# Copilot CLI integration
git-agent --operation=copilot --action=analyze --scope="security"
git-agent --operation=copilot --action=generate --prompt="Create unit tests for UserService"
```

## 📋 Features

### GitHub Copilot CLI Integration

- AI-powered code suggestions and completions
- Repository analysis and security auditing
- Intelligent commit message generation with Copilot assistance
- Automated code documentation
- PR summarization and review assistance
- Context-aware code explanations
- Interactive coding sessions with Copilot
- MCP server integration for enhanced context

### Repository Management

- Repository initialization with OpenCode standards
- Dynamic project setup with template selection
- Configuration management and validation
- Git hooks installation and management
- Remote operations with full repository management
- Private fork synchronization with upstream repositories

### Branch Operations

- Strategic branch creation and management
- Branch protection and naming conventions
- Merge operations with conflict resolution
- Branch tracking and organization
- Automated branch cleanup and archiving

### Commit Workflow

- Intelligent commit message generation with Copilot assistance
- Quality gates and validation
- Conventional commit format enforcement
- Batch operations and multi-file commits
- Commit history analysis and optimization

### Collaboration Tools

- Multi-user support and coordination
- Fork management and upstream synchronization
- Pull request workflow management
- Issue tracking and integration
- Code review automation with Copilot

### CI/CD Integration

- Pipeline automation and triggering
- Deployment coordination across environments
- Rollback and recovery procedures
- Environment-specific configuration management
- Copilot-assisted CI/CD optimization

### Documentation Generation

- Automatic documentation from Git operations
- Changelog generation and release notes
- API documentation from code changes
- README and contribution guide updates
- Copilot-powered documentation enhancement

### Advanced Operations

- Repository health analysis and comprehensive reporting
- Security scanning and vulnerability detection
- Performance monitoring and optimization
- Audit trail maintenance and reporting
- Copilot-enhanced repository insights

### Advanced Workflows

- End-to-end branch lifecycle automation (init → PR → merge → close)
- Conflict-aware merge and rebasing with custom strategies
- Multi-environment deployment automation (CI/CD pipeline triggers by branch or tag)
- Automated rollback with recovery hooks on orchestration or deployment failures
- Proactive security gatekeeping (block merges/commits that fail policy or scan)
- Auto-generated documentation and change logs from commit history and specs
- Fork synchronization workflow (auto-update/upstream integration for forks)
- Batch commit and PR creation for mono-repo/multi-service projects
- Dynamic agent activation—context-aware escalation to relevant development agents
- Periodic repository health sweeps (schedule-able with metrics reporting)
- Audit-compliance: full traceability and event logs routable to monitoring systems
- Copilot-assisted code review and quality assurance

## 🔧 Integration

Seamlessly integrates with:

- **OpenCode Core System**: Task orchestration and context sharing
- **Spec-Kit Framework**: Specification-driven development workflows
- **Development Agents**: Build, plan, review, and debug agents
- **Quality Assurance**: Security, performance, and code validation
- **CI/CD Pipelines**: GitHub Actions, GitLab CI, Jenkins integration
- **Monitoring Systems**: Comprehensive alerting and performance tracking
- **GitHub Copilot CLI**: AI-powered code assistance and repository analysis
- **Context7 MCP Server**: Enhanced context management and tool integration

## 📊 Quality Standards

- **Conventional Commits**: 100% specification compliance
- **Security Compliance**: Integrated security scanning and validation
- **Performance Optimization**: Efficient Git operations with minimal overhead
- **Documentation Completeness**: Comprehensive and accurate documentation
- **AI-Enhanced Quality**: Copilot-assisted code review and optimization

## 🎯 Configuration

The agent is configured in `.opencode/config.json`:

```json
{
  "agents": {
    "git-agent": {
      "description": "Primary Git operations orchestrator",
      "tools": [
        "read",
        "write",
        "edit",
        "bash",
        "grep",
        "glob",
        "list",
        "todoread",
        "todowrite",
        "webfetch"
      ],
      "mode": "primary",
      "temperature": 0.4,
      "config_file": ".opencode/agents/git-agent.json"
    }
  }
}
```

### Copilot CLI Configuration

```json
{
  "copilot": {
    "enabled": true,
    "model": "gpt-4o",
    "temperature": 0.3,
    "timeout": 30000,
    "autoApprove": false,
    "mcpIntegration": true,
    "context7Server": true
  }
}
```

## 🛠️ GitHub Copilot CLI Commands

### Installation & Authentication
```bash
# Install the official GitHub Copilot CLI
npm install -g @github/copilot

# Check version
copilot --version

# Launch with banner
copilot --banner

# Start interactive mode
copilot

# Execute prompt directly
copilot -p "Analyze this repository for security issues"
```

### Available Models
- **claude-sonnet-4.5** (default)
- **claude-sonnet-4**
- **claude-haiku-4.5**
- **gpt-5**
- **gpt-5.1**
- **gpt-5.1-codex-mini**
- **gpt-5.1-codex**
- **gemini-3-pro-preview**

### Directory & Permissions Management
```bash
# Add specific directories for file access
copilot --add-dir /path/to/project
copilot --add-dir ~/workspace --add-dir /tmp

# Allow access to all paths (use with caution)
copilot --allow-all-paths

# Allow specific tools automatically
copilot --allow-all-tools
copilot --allow-tool 'write' --allow-tool 'shell(git:*)'

# Deny specific tools
copilot --deny-tool 'shell(git push)'
```

### Session Management
```bash
# Resume most recent session
copilot --continue

# Resume specific session
copilot --resume [sessionId]

# Start with specific model
copilot --model gpt-5

# Disable custom instructions
copilot --no-custom-instructions
```

### MCP Integration
```bash
# Add additional MCP servers
copilot --additional-mcp-config '{"name": "custom-server", "command": "server-path"}'

# Disable built-in MCP servers
copilot --disable-builtin-mcps

# Disable specific MCP server
copilot --disable-mcp-server github-mcp-server

# Enable all GitHub MCP tools
copilot --enable-all-github-mcp-tools
```

### Repository Operations
```bash
# Analyze current repository
copilot -p "Analyze this repository structure and dependencies"

# Generate code with context
copilot -p "Create a React component for user authentication" --add-dir ./src

# Debug issues
copilot -p "Help me debug the failing test in test/user.test.js"

# Refactor code
copilot -p "Refactor this function to be more efficient"
```

### Git Workflow Integration
```bash
# Commit message generation
copilot -p "Generate a conventional commit message for these changes"

# PR review assistance
copilot -p "Review this pull request for security vulnerabilities"

# Branch management
copilot -p "Create a feature branch for the new authentication system"
```

### Configuration Files

#### ~/.copilot/mcp-config.json
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "github-mcp-server",
      "args": []
    },
    "custom-server": {
      "command": "path/to/server",
      "args": ["--config", "config.json"]
    }
  }
}
```

#### Environment Variables
```bash
# Authentication tokens
export GH_TOKEN="your_github_token"
export GITHUB_TOKEN="your_github_token"

# Auto-approval settings
export COPILOT_ALLOW_ALL=true

# Logging configuration
export COPILOT_LOG_LEVEL="debug"
```

### Interactive Mode Commands
```bash
# In interactive mode, use slash commands:
/login          # Authenticate with GitHub
/model          # Switch AI models
/feedback        # Submit feedback
/help            # Show available commands
/quit            # Exit interactive mode
```

### Advanced Usage Examples
```bash
# Multi-directory project analysis
copilot --add-dir ./frontend --add-dir ./backend --add-dir ./shared \
  -p "Analyze the full-stack architecture and suggest improvements"

# Automated workflow with specific tool permissions
copilot --allow-tool 'write' --allow-tool 'shell(git:*)' \
  --deny-tool 'shell(git push)' \
  -p "Implement the new feature and create a commit"

# Custom model with enhanced logging
copilot --model claude-sonnet-4.5 --log-level debug \
  -p "Debug the performance issue in the database query"

# Resume session with auto-approval
copilot --continue --allow-all-tools
```

## 🔄 MCP Integration

### Context7 Server Setup
```json
{
  "mcpServers": {
    "github-copilot": {
      "command": "github-copilot-cli",
      "args": ["mcp-server"]
    }
  }
}
```

### Enhanced Context Management
- Repository indexing for better Copilot context
- Real-time file change tracking
- Cross-repository knowledge sharing
- Intelligent context pruning and optimization

## 📈 Performance Metrics

- **Operation Speed**: < 2 seconds for standard Git operations
- **Copilot Response Time**: < 5 seconds for code generation
- **Repository Analysis**: < 30 seconds for full repository scan
- **Memory Usage**: < 500MB for large repositories
- **CPU Efficiency**: Optimized for minimal resource consumption

## 🚨 Security Features

- **Token Management**: Secure GitHub token handling
- **Access Control**: Role-based permissions for Copilot features
- **Audit Logging**: Complete operation tracking
- **Secret Detection**: Automated secret scanning with Copilot
- **Compliance**: Enterprise-grade security standards

## 📚 Best Practices

1. **Always review Copilot-generated code** before committing
2. **Use specific prompts** for better AI assistance
3. **Enable auto-approval only** for trusted operations
4. **Regular security scans** with Copilot integration
5. **Maintain proper commit hygiene** with AI assistance
6. **Leverage context7** for enhanced repository understanding

---

*Last updated with GitHub Copilot CLI integration and Context7 MCP server support*