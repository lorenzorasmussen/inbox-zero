---
description: "Generate comprehensive project documentation with structure, API, and guides"
agent: build
subtask: true
---

# 📚 Documentation Generator

Generate comprehensive project documentation including structure, API reference, and development guides.

## Phase 1: Documentation Type Selection

**What type of documentation are you creating?**

- `api` - API reference documentation
- `readme` - Project README and getting started
- `architecture` - System architecture and design
- `deployment` - Deployment and hosting guides
- `contributing` - Development contribution guidelines
- `user-guide` - End-user documentation
- `changelog` - Version history and release notes
- `troubleshooting` - Common issues and solutions

**User provided:** $1

## Phase 2: Documentation Configuration

**Documentation Details:**

- **Target:** $2 (specific component, API, or feature)
- **Audience:** $3 (developers, users, admins, etc.)
- **Format:** $4 (markdown, html, pdf, etc.)
- **Output:** $5 (file path or location for generated docs)

**Generated Files:**

- Documentation files in specified format
- API schemas and examples
- Code snippets and samples
- Diagrams and visualizations

## Phase 3: API Documentation

### OpenAPI Specification

```yaml
# Generated OpenAPI spec
openapi: 3.0.0
info:
  title: Inbox Zero API
  description: AI-powered email management API
  version: 1.0.0
  contact:
    name: Inbox Zero Team
    email: support@inboxzero.dev
  license:
    name: MIT
    url: https://github.com/elie222/inbox-zero/blob/main/LICENSE

servers:
  - url: https://api.getinboxzero.com/v1
    description: Production server
  - url: http://localhost:3001/api/v1
    description: Development server

paths:
  /user/profile:
    get:
      summary: Get user profile
      tags: [User]
      security:
        - bearerAuth
      responses:
        "200":
          description: User profile data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserProfile"
        "401":
          description: Unauthorized
        "404":
          description: User not found

  /email/rules:
    get:
      summary: Get email rules
      tags: [Email Rules]
      security:
        - bearerAuth
        - emailAccountAuth
      parameters:
        - name: emailAccountId
          in: header
          required: true
          schema:
            type: string
      responses:
        "200":
          description: List of email rules
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/EmailRule"
    post:
      summary: Create email rule
      tags: [Email Rules]
      security:
        - bearerAuth
        - emailAccountAuth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateEmailRule"
      responses:
        "201":
          description: Rule created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/EmailRule"
        "400":
          description: Invalid input
        "401":
          description: Unauthorized

components:
  schemas:
    UserProfile:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        timezone:
          type: string
        createdAt:
          type: string
          format: date-time
      required: [id, email, name]

    EmailRule:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        instructions:
          type: string
        enabled:
          type: boolean
        emailAccountId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name, instructions, enabled, emailAccountId]

    CreateEmailRule:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        instructions:
          type: string
          minLength: 1
        enabled:
          type: boolean
          default: true
      required: [name, instructions]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    emailAccountAuth:
      type: apiKey
      in: header
      name: X-Email-Account-ID
```

### API Reference Documentation

```markdown
# API Reference

## Authentication

All API endpoints require authentication using JWT tokens and email account context.

### Headers

\`\`\`http
Authorization: Bearer <jwt_token>
X-Email-Account-ID: <email_account_id>
\`\`\`

## User Endpoints

### Get User Profile

Retrieve user profile information.

\`\`\`http
GET /api/v1/user/profile
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {
"id": "uuid",
"email": "user@example.com",
"name": "John Doe",
"timezone": "America/New_York",
"createdAt": "2024-01-01T00:00:00Z"
}
}
\`\`\`

### Update User Profile

Update user profile information.

\`\`\`http
PUT /api/v1/user/profile
\`\`\`

**Request Body:**
\`\`\`json
{
"name": "Updated Name",
"timezone": "Europe/London"
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {
"id": "uuid",
"email": "user@example.com",
"name": "Updated Name",
"timezone": "Europe/London",
"updatedAt": "2024-01-01T12:00:00Z"
}
}
\`\`\`

## Email Rules Endpoints

### List Email Rules

Get all email rules for a specific email account.

\`\`\`http
GET /api/v1/email/rules
\`\`\`

**Query Parameters:**

- \`page\` (optional): Page number for pagination
- \`limit\` (optional): Number of rules per page
- \`enabled\` (optional): Filter by enabled status

**Response:**
\`\`\`json
{
"success": true,
"data": {
"rules": [
{
"id": "uuid",
"name": "Newsletter Filter",
"instructions": "Archive newsletters and promotional emails",
"enabled": true,
"createdAt": "2024-01-01T00:00:00Z"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 45,
"hasNext": true
}
}
}
\`\`\`

### Create Email Rule

Create a new email rule.

\`\`\`http
POST /api/v1/email/rules
\`\`\`

**Request Body:**
\`\`\`json
{
"name": "Work Email Filter",
"instructions": "Move work-related emails to Work folder",
"enabled": true
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {
"id": "new-uuid",
"name": "Work Email Filter",
"instructions": "Move work-related emails to Work folder",
"enabled": true,
"emailAccountId": "email-account-uuid",
"createdAt": "2024-01-01T12:00:00Z"
}
}
\`\`\`

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
"success": false,
"error": "Error message",
"code": "ERROR_CODE",
"details": {
"field": "Additional error details"
}
}
\`\`\`

### Common Error Codes

- \`UNAUTHORIZED\` (401): Authentication failed
- \`FORBIDDEN\` (403): Insufficient permissions
- \`NOT_FOUND\` (404): Resource not found
- \`VALIDATION_ERROR\` (400): Input validation failed
- \`RATE_LIMITED\` (429): Too many requests
- \`INTERNAL_ERROR\` (500): Server error
  \`\`\`
```

## Phase 4: README Documentation

### Project README Template

```markdown
# Inbox Zero - AI Email Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![codecov](https://codecov.io/gh/elie222/inbox-zero/branch/main/graph/badge.svg)](https://codecov.io/gh/elie222/inbox-zero)

> AI-powered email management system that helps you achieve inbox zero through intelligent automation and smart categorization.

## ✨ Features

- 🤖 **AI-Powered Processing**: Smart email categorization and response suggestions
- 📧 **Custom Rules**: Create personalized email handling rules
- 🔄 **Bulk Operations**: Mass unsubscribe and archive capabilities
- 📊 **Analytics**: Comprehensive email activity insights
- 🔒 **Secure**: End-to-end encryption and privacy protection
- 🌐 **Multi-Provider**: Support for Gmail, Outlook, and more
- 📱 **Responsive**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/elie222/inbox-zero.git
   cd inbox-zero
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Setup environment**
   \`\`\`bash
   cp .env.example .env

   # Edit .env with your configuration

   \`\`\`

4. **Start database**
   \`\`\`bash
   docker compose -f docker-compose.dev.yml up -d
   \`\`\`

5. **Run migrations**
   \`\`\`bash
   pnpm prisma migrate dev
   \`\`\`

6. **Start development**
   \`\`\`bash
   pnpm dev
   \`\`\`

7. **Open the application**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📖 Documentation

- [API Reference](./docs/api.md) - Complete API documentation
- [Architecture Guide](./docs/architecture.md) - System design and architecture
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions
- [Contributing Guide](./docs/contributing.md) - Development contribution guidelines

## 🛠️ Development

### Available Scripts

\`\`\`bash
pnpm dev # Start development server
pnpm build # Build for production
pnpm test # Run test suite
pnpm lint # Run code quality checks
pnpm prisma studio # Open database GUI
\`\`\`

### Project Structure

\`\`\`
inbox-zero/
├── apps/
│ └── web/ # Main Next.js application
│ ├── app/ # App Router pages and API
│ ├── components/ # React components
│ ├── utils/ # Utility functions
│ └── prisma/ # Database schema
├── packages/ # Shared packages
├── docs/ # Documentation
└── docker/ # Docker configurations
\`\`\`

## 🔧 Configuration

### Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash

# Authentication

AUTH_SECRET=your-auth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database

DATABASE_URL=postgresql://user:password@localhost:5432/inboxzero

# AI Services

OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Application

NEXT_PUBLIC_BASE_URL=http://localhost:3001
\`\`\`

## 🧪 Testing

\`\`\`bash

# Run all tests

pnpm test

# Run tests in watch mode

pnpm test:watch

# Run tests with coverage

pnpm test:coverage
\`\`\`

## 📦 Deployment

### Docker Deployment

\`\`\`bash

# Build and run with Docker

docker compose up --build
\`\`\`

### Manual Deployment

\`\`\`bash

# Build for production

pnpm build

# Start production server

pnpm start
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📞 Support

- 📧 [Issues](https://github.com/elie222/inbox-zero/issues) - Bug reports and feature requests
- 💬 [Discussions](https://github.com/elie222/inbox-zero/discussions) - Community discussions
- 📧 [Discord](https://discord.gg/inboxzero) - Real-time chat
  \`\`\`
```

## Phase 5: Architecture Documentation

### System Architecture Template

```markdown
# Inbox Zero Architecture

## Overview

Inbox Zero is a modern email management system that leverages AI to help users achieve inbox zero through intelligent automation and smart categorization.

## High-Level Architecture

\`\`\`
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │ │ Backend API │ │ AI Services │
│ (Next.js) │◄──►│ (Next.js) │◄──►│ (OpenAI, │
│ │ │ │ │ Anthropic, │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
│ │ │
└───────────────────────┴───────────────────────┘
│
┌─────────────────┐
│ Database │
│ (PostgreSQL) │
└─────────────────┘
\`\`\`

## Core Components

### Frontend (apps/web)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Jotai
- **Authentication**: Better Auth

### Backend API

- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance
- **File Storage**: Local filesystem with cloud backup

### AI Integration

- **Providers**: OpenAI, Anthropic, Google AI, local models
- **Processing**: Email categorization, response generation
- **Learning**: User feedback integration for improvement

## Data Flow

### Email Processing Pipeline

1. **Ingestion**: Gmail webhook triggers on new emails
2. **Parsing**: Extract content, metadata, and attachments
3. **AI Analysis**: Categorize and generate suggested actions
4. **Rule Engine**: Apply user-defined rules
5. **Execution**: Perform actions (archive, label, reply)
6. **Learning**: Update AI models based on user feedback

### User Data Flow

1. **Authentication**: OAuth2 with email providers
2. **Synchronization**: Real-time email sync
3. **Processing**: Background AI processing
4. **Storage**: Encrypted storage of user data
5. **Analytics**: Track usage and performance metrics

## Security Architecture

### Authentication & Authorization

- **OAuth2 Integration**: Secure provider authentication
- **JWT Tokens**: Stateless session management
- **Role-Based Access**: User and admin permissions
- **API Security**: Rate limiting, input validation

### Data Protection

- **Encryption**: AES-256 encryption for sensitive data
- **Privacy**: GDPR-compliant data handling
- **Access Control**: User-scoped data access
- **Audit Logging**: Comprehensive activity tracking

## Performance Architecture

### Caching Strategy

- **Redis**: Session storage and API response caching
- **Database**: Optimized queries and indexing
- **CDN**: Static asset delivery
- **Lazy Loading**: Component and route code splitting

### Scalability Design

- **Horizontal Scaling**: Load balancer ready
- **Database Sharding**: Multi-tenant architecture
- **Queue System**: Background job processing
- **Monitoring**: Real-time performance metrics

## Technology Stack

### Frontend

- **React 19**: Latest with concurrent features
- **Next.js 15**: App Router and server components
- **TypeScript**: Strict mode with full type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library

### Backend

- **Node.js**: Latest LTS version
- **Prisma**: Type-safe database access
- **PostgreSQL**: Reliable relational database
- **Redis**: High-performance caching
- **Docker**: Containerized deployment

### AI/ML

- **OpenAI API**: GPT-4 and GPT-3.5 models
- **Anthropic Claude**: Advanced reasoning capabilities
- **Local Models**: Ollama integration for privacy
- **Custom Models**: Fine-tuned models for specific tasks

## Deployment Architecture

### Container Strategy

- **Multi-stage Builds**: Optimized Docker images
- **Health Checks**: Container health monitoring
- **Graceful Shutdown**: Proper signal handling
- **Resource Limits**: Memory and CPU constraints

### Orchestration

- **Docker Compose**: Local development
- **Kubernetes**: Production scaling
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application and infrastructure monitoring
  \`\`\`
```

## Phase 6: Contributing Guide

### Contributing Template

```markdown
# Contributing to Inbox Zero

We love your contributions! Inbox Zero is open-source and we welcome everyone to help improve it.

## 🤝 How to Contribute

### Reporting Bugs

- Use [GitHub Issues](https://github.com/elie222/inbox-zero/issues) for bug reports
- Include detailed reproduction steps
- Provide environment information
- Add screenshots if applicable

### Suggesting Features

- Open an issue with "Feature Request" label
- Describe the use case and problem you're solving
- Explain why this feature would be valuable
- Consider implementation complexity

### Code Contributions

#### Setup Development Environment

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: \`pnpm install\`
4. Create a feature branch: \`git checkout -b feature/amazing-feature\`
5. Make your changes
6. Test thoroughly: \`pnpm test\`
7. Commit your changes: \`git commit -m 'feat: add amazing feature'\`
8. Push to your fork: \`git push origin feature/amazing-feature\`
9. Open a Pull Request

#### Code Style Guidelines

- Follow the existing code style and patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed

#### Development Workflow

\`\`\`bash

# Install dependencies

pnpm install

# Start development

pnpm dev

# Run tests

pnpm test

# Run linting

pnpm lint

# Type checking

pnpm type-check
\`\`\`

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Self-review of code changes
- [ ] Documentation updated if needed
- [ ] No merge conflicts

### PR Template

Use this template for your pull requests:

\`\`\`markdown

## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Cross-browser compatibility checked

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
      \`\`\`

## 🏷️ Code Style

### TypeScript Guidelines

- Use strict mode
- Prefer explicit types over \`any\`
- Use interfaces for object shapes
- Add JSDoc comments for public APIs

### React Guidelines

- Use functional components
- Prefer hooks over class components
- Use proper dependency arrays
- Follow React best practices

### CSS Guidelines

- Use Tailwind CSS utilities
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic HTML elements

## 🧪 Testing Guidelines

### Unit Tests

- Test all public functions and methods
- Mock external dependencies
- Cover edge cases and error conditions
- Aim for 95%+ code coverage

### Integration Tests

- Test API endpoints with real database
- Test authentication and authorization
- Test error handling and validation
- Use test containers for isolation

### E2E Tests

- Test critical user workflows
- Use Playwright for browser automation
- Test on multiple browsers and devices
- Include accessibility testing

## 📖 Documentation

### Code Documentation

- Add JSDoc comments to public APIs
- Update README for new features
- Document configuration options
- Include usage examples

### API Documentation

- Keep OpenAPI spec updated
- Document all endpoints
- Include request/response examples
- Document error codes

## 🚀 Release Process

### Version Management

- Follow semantic versioning
- Update CHANGELOG.md
- Tag releases properly
- Create GitHub releases

### Deployment

- Test in staging environment
- Run full test suite
- Monitor for issues
- Rollback plan ready

## 💬 Community

### Getting Help

- Join our [Discord](https://discord.gg/inboxzero)
- Participate in [GitHub Discussions](https://github.com/elie222/inbox-zero/discussions)
- Follow our [Blog](https://blog.inboxzero.dev)

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow the project's Code of Conduct

Thank you for contributing to Inbox Zero! 🎉
\`\`\`
```

## Phase 7: File Generation

**Generate the following files:**

1. Main documentation file in specified format
2. API specifications and schemas
3. Code examples and snippets
4. Diagrams and visualizations (if applicable)
5. Contributing guidelines (if applicable)

## Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract documentation type, target, audience, format, and output
2. **Select Template**: Choose appropriate documentation structure
3. **Generate Content**: Create comprehensive documentation with examples
4. **Add Examples**: Include code snippets and usage examples
5. **Create Visualizations**: Add diagrams and charts where helpful
6. **Format Output**: Generate documentation in specified format
7. **File Creation**: Write all documentation to appropriate locations

**Examples:**

```bash
/docs api user/profile "User Profile API" markdown ./docs/api/
/docs readme project "Project README" markdown ./README.md
/docs architecture system "System Architecture" markdown ./docs/architecture.md
/docs contributing development "Contributing Guide" markdown ./CONTRIBUTING.md
/docs deployment production "Deployment Guide" markdown ./docs/deployment.md
```

Execute documentation generation now.
