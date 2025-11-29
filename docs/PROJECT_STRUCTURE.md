# Inbox Zero Project Structure

## Root Directory (Essential Files)

- `package.json` - Project dependencies and scripts
- `pnpm-workspace.yaml` - Workspace configuration
- `pnpm-lock.yaml` - Dependency lock file
- `tsconfig.json` - TypeScript configuration
- `turbo.json` - Turborepo configuration
- `biome.json` - Code quality configuration
- `vercel.json` - Vercel deployment configuration
- `README.md` - Primary project documentation
- `DEVELOPMENT.md` - Development setup guide

## /.config/ Directory

- `constitutional/` - Constitutional framework files
  - `CONSTITUTION.md` - Project governing principles
  - `copilot-constitutional-config.json` - Copilot constitutional configuration
  - `constitutional_checks.yml` - Constitutional validation checks
- `checkpoint_status` - Checkpoint tracking

## /docs/ Directory

- `guides/` - Setup and integration guides
  - `DEVELOPMENT_WORKFLOW_GUIDE.md` - Development workflow guide
  - `LLM_SETUP_GUIDE.md` - LLM setup instructions
  - `GEMINI.md` - Gemini AI integration guide
  - `FREE_AI_MODELS_SETUP.md` - Free AI models setup
  - `CALENDAR_INTEGRATION_GUIDE.md` - Calendar integration guide
  - `PORT_CONFIGURATION_GUIDE.md` - Port configuration guide
- `reports/` - Analysis and completion reports
  - `DOCKER_OPTIMIZATION_COMPLETE.md` - Docker optimization report
  - `MCP_IMPLEMENTATION_COMPLETE.md` - MCP implementation report
  - `OPTIMIZATION_COMPLETE.md` - General optimization report
  - `PROJECT_STATE_REVIEW_COMPLETE.md` - Project state review
  - `SYSTEM_OPTIMIZATION_COMPLETE.md` - System optimization report
  - `GIT_AGENT_SETUP_COMPLETE.md` - Git agent setup report
  - `analysis-report.md` - Analysis report
  - `metrics.json` - Project metrics
  - `recommendations.md` - Project recommendations
  - `cleanup-report.md` - Cleanup report
- `setup/` - Quick start and setup guides
  - `QUICK_START.md` - Quick start guide
- `hosting/` - Hosting configuration guides
  - `aws-copilot.md` - AWS Copilot setup
  - `docker.md` - Docker configuration
  - `ec2-deployment.md` - EC2 deployment guide
  - `environment-variables.md` - Environment variables guide
- `PROJECT_STRUCTURE.md` - This file

## /scripts/ Directory

- `utilities/` - Utility and helper scripts
  - `clone-marketing.sh` - Marketing repository cloning script

## /apps/ Directory

- `web/` - Main web application
- `unsubscriber/` - Email unsubscriber application

## /packages/ Directory

- `loops/` - Loops package
- `resend/` - Resend package
- `tinybird/` - Tinybird package
- `tinybird-ai-analytics/` - Tinybird AI analytics package
- `tsconfig/` - TypeScript configuration package

## /archive/ Directory

- `legal/` - Legal documents
  - `LICENSE` - Project license
- `completed-guides/` - Completed setup guides
- `version.txt` - Version information
- `video-thumbnail.png` - Video thumbnail image

## /.github/ Directory

- `workflows/` - GitHub Actions workflows
- `screenshots/` - Project screenshots

## /.opencode/ Directory

- `command/` - OpenCode command definitions
- `agent/` - OpenCode agent configurations

## /.specify/ Directory

- `specs/` - Feature specifications
- `implementation/` - Implementation guides
- `plans/` - Implementation plans
- `compliance-report.md` - Compliance report
- `README.md` - Spec-Kit documentation

## File Organization Principles

1. **Root Minimalism** - Only essential files in root
2. **Logical Grouping** - Related files grouped together
3. **Clear Naming** - Descriptive directory and file names
4. **Easy Navigation** - Flat structure where possible
5. **Separation of Concerns** - Configs, docs, apps separated

## Directory Usage Guidelines

### Root Directory

Keep only essential configuration and documentation files that are frequently accessed or required for project setup.

### .config/ Directory

Store configuration files that control project behavior, including constitutional framework and operational settings.

### docs/ Directory

Organize all documentation with clear subdirectories:

- `guides/` for how-to guides and setup instructions
- `reports/` for analysis reports and completion documentation
- `setup/` for quick start and initial setup guides
- `hosting/` for deployment and hosting configuration

### scripts/ Directory

Store all utility and automation scripts, organized by purpose.

### archive/ Directory

Store historical documents, completed guides, and files that are no longer actively used but should be preserved.

### apps/ Directory

Main application code organized by application or service.

### packages/ Directory

Shared packages and libraries organized by package name.

## Benefits of This Structure

- **Clean Root Directory** - Easy to see essential project files
- **Logical Organization** - Related files grouped together
- **Scalable** - Easy to add new applications or packages
- **Maintainable** - Clear location for each type of file
- **Git-Friendly** - Well-organized for version control
