# Implementation Guidelines - Core Email Processing

## Overview

Technical implementation guidelines and standards for core email processing functionality to ensure constitutional compliance and quality.

## Development Standards

### Code Quality Requirements

#### TypeScript Standards

- **Strict Mode**: All code must compile with `strict: true`
- **Type Safety**: No implicit `any` types, explicit typing required
- **Interface Design**: Clear, maintainable interfaces with documentation
- **Error Handling**: Proper error types and graceful degradation

#### Code Structure

- **Component Organization**: Logical separation of concerns
- **Import Management**: Clean imports, no circular dependencies
- **Naming Conventions**: Consistent naming following project patterns
- **File Organization**: Well-structured directory layout

### Security Implementation

#### Input Validation

```typescript
// Example input validation pattern
import { z } from "zod";

const EmailSchema = z.object({
  messageId: z.string().min(1),
  userId: z.string().uuid(),
  content: z.string().max(1024 * 1024), // 1MB limit
});

export const validateEmailInput = (input: unknown) => {
  return EmailSchema.parse(input);
};
```

#### Data Protection

```typescript
// Example encryption pattern
import { encrypt } from "@/utils/encryption";

export const storeEmailContent = async (content: string) => {
  const encrypted = await encrypt(content);
  // Store encrypted content in database
  return encrypted;
};
```

### Performance Standards

#### Database Optimization

```typescript
// Example optimized query pattern
export const getEmailsByUser = async (userId: string, limit = 50) => {
  return prisma.email.findMany({
    where: { userId },
    select: {
      id: true,
      subject: true,
      senderEmail: true,
      receivedAt: true,
      // Avoid selecting large fields unless needed
    },
    orderBy: { receivedAt: "desc" },
    take: limit,
  });
};
```

#### Caching Strategy

```typescript
// Example caching pattern
import { cache } from "@/utils/cache";

export const getCachedEmail = async (emailId: string) => {
  const cacheKey = `email:${emailId}`;
  const cached = await cache.get(cacheKey);

  if (cached) return cached;

  const email = await fetchEmailFromDb(emailId);
  await cache.set(cacheKey, email, { ttl: 300 }); // 5 minutes
  return email;
};
```

## Architecture Patterns

### Error Handling

```typescript
// Standardized error handling
export class EmailProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "EmailProcessingError";
  }
}

export const handleEmailProcessingError = (error: unknown) => {
  if (error instanceof EmailProcessingError) {
    logger.error("Email processing failed", {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });
    return error;
  }

  // Handle unexpected errors
  logger.error("Unexpected error in email processing", error);
  return new EmailProcessingError("Internal server error", "INTERNAL_ERROR");
};
```

### Logging Strategy

```typescript
// Structured logging pattern
import { logger } from "@/utils/logger";

export const logEmailProcessing = (
  emailId: string,
  userId: string,
  action: string,
  metadata?: Record<string, any>,
) => {
  logger.info("Email processing action", {
    emailId,
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};
```

### API Response Patterns

```typescript
// Standardized API responses
export const apiSuccess = <T>(data: T, message?: string) => {
  return Response.json({
    success: true,
    data,
    message: message || "Operation successful",
  });
};

export const apiError = (
  message: string,
  statusCode: number = 400,
  code?: string,
) => {
  return Response.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: statusCode },
  );
};
```

## Testing Guidelines

### Unit Testing Patterns

```typescript
// Example unit test structure
import { describe, it, expect, vi, beforeEach } from "vitest";
import { processEmail } from "@/utils/email/processor";
import { mockEmail } from "@/__tests__/mocks/email";

describe("Email Processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process email successfully", async () => {
    // Arrange
    const email = mockEmail();

    // Act
    const result = await processEmail(email);

    // Assert
    expect(result.success).toBe(true);
    expect(result.category).toBeDefined();
  });

  it("should handle invalid email gracefully", async () => {
    // Arrange
    const invalidEmail = { invalid: "data" };

    // Act & Assert
    await expect(processEmail(invalidEmail)).rejects.toThrow(
      EmailProcessingError,
    );
  });
});
```

### Integration Testing Patterns

```typescript
// Example integration test
import { test, expect } from "@playwright/test";

test.describe("Email Processing Flow", () => {
  test("should process email end-to-end", async ({ page }) => {
    // Test complete user flow
    await page.goto("/mail");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.click('[data-testid="process-button"]');

    // Verify processing completed
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Database Guidelines

### Schema Design

```sql
-- Example table design with proper constraints
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_id VARCHAR(255) UNIQUE NOT NULL,
  thread_id VARCHAR(255),
  subject TEXT,
  sender_email VARCHAR(255) NOT NULL,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_gmail_id ON emails(gmail_id);
CREATE INDEX idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX idx_emails_user_received ON emails(user_id, received_at DESC);
```

### Migration Patterns

```typescript
// Example migration file
import { Migration } from "@mikro-orm/migrations";

export class Migration20250101000000 extends Migration {
  async up(): Promise<void> {
    const sql = `
      CREATE TABLE emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gmail_id VARCHAR(255) UNIQUE NOT NULL,
        -- ... other columns
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_emails_user_id ON emails(user_id);
    `;

    await this.execute(sql);
  }

  async down(): Promise<void> {
    await this.execute("DROP TABLE emails");
  }
}
```

## AI Integration Guidelines

### Provider Abstraction

```typescript
// AI provider interface
export interface AIProvider {
  generateResponse(prompt: string, options?: AIOptions): Promise<string>;
  analyzeContent(content: string): Promise<ContentAnalysis>;
  isHealthy(): Promise<boolean>;
}

// Provider implementation
export class OpenAIProvider implements AIProvider {
  async generateResponse(prompt: string, options?: AIOptions): Promise<string> {
    // Implementation with error handling and retries
  }
}
```

### Rate Limiting

```typescript
// Rate limiting for AI calls
import { RateLimiter } from "@/utils/rate-limiter";

const aiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const callAIWithRateLimit = async (prompt: string) => {
  await aiRateLimiter.acquire();
  return aiProvider.generateResponse(prompt);
};
```

## Security Implementation

### Input Sanitization

```typescript
// Content sanitization
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export const sanitizeEmailContent = (htmlContent: string): string => {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);

  return purify.sanitize(htmlContent, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "a"],
    ALLOWED_ATTR: ["href", "target"],
  });
};
```

### Authentication Patterns

```typescript
// Secure API route pattern
import { auth } from "@/lib/auth";

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return apiError("Unauthorized", 401);
  }

  // Process authenticated request
  const userId = session.user.id;
  // ... rest of implementation
};
```

## Performance Optimization

### Bundle Optimization

```javascript
// next.config.js optimizations
module.exports = {
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    };
    return config;
  },
};
```

### Image Optimization

```typescript
// Optimized image component
import Image from 'next/image';
import { useState } from 'react';

export const OptimizedImage = ({ src, alt, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      onLoadingComplete={() => setIsLoading(false)}
      className={isLoading ? 'blur-sm' : ''}
      {...props}
    />
  );
};
```

## Monitoring & Observability

### Metrics Collection

```typescript
// Performance metrics
export const recordMetric = (
  name: string,
  value: number,
  tags?: Record<string, string>,
) => {
  // Send to monitoring service
  console.log(`Metric: ${name}`, { value, tags, timestamp: Date.now() });
};

export const measureExecutionTime = async <T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;
    recordMetric("operation_duration", duration, { operation: operationName });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    recordMetric("operation_error", duration, { operation: operationName });
    throw error;
  }
};
```

### Health Checks

```typescript
// Health check endpoint
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth(),
    ai_providers: await checkAIProvidersHealth(),
  };

  const isHealthy = Object.values(checks).every((check) => check.healthy);

  return {
    status: isHealthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  };
};
```

## Documentation Standards

### Code Documentation

````typescript
/**
 * Processes an email and applies user-defined rules
 *
 * @param email - The email object to process
 * @param userId - The user ID for context
 * @param options - Processing options
 * @returns Promise<ProcessingResult> - Result of email processing
 *
 * @throws {EmailProcessingError} When email validation fails
 * @throws {DatabaseError} When database operations fail
 *
 * @example
 * ```typescript
 * const result = await processEmail(email, userId, {
 *   applyRules: true,
 *   generateReply: false,
 * });
 * ```
 */
export const processEmail = async (
  email: Email,
  userId: string,
  options: ProcessingOptions = {},
): Promise<ProcessingResult> => {
  // Implementation
};
````

### API Documentation

```typescript
// OpenAPI schema generation
export const EmailProcessingSchema = {
  "/api/email/process": {
    post: {
      summary: "Process an email",
      description: "Processes an email and applies user-defined rules",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: EmailSchema,
          },
        },
      },
      responses: {
        200: {
          description: "Email processed successfully",
          content: {
            "application/json": {
              schema: ProcessingResultSchema,
            },
          },
        },
        400: {
          description: "Invalid email data",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },
};
```

---

**Implementation Guidelines Version**: 1.0.0  
**Last Updated**: 2025-11-29  
**Status**: Ready for Implementation  
**Constitutional Compliance**: Validated
