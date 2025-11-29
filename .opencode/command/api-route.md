---
description: "Create new API routes with proper security, validation, and patterns"
agent: build
subtask: true
---

# 🛣️ API Route Generator

Create new API routes following Inbox Zero security patterns, validation, and best practices.

## Phase 1: Route Type Selection

**What type of API route are you creating?**

- `user` - User-scoped operations (settings, profile, API keys)
- `email` - Email account-scoped operations (emails, rules, schedules)
- `public` - Public endpoints (webhooks, public data)
- `cron` - Scheduled tasks (digests, cleanup, monitoring)
- `admin` - Admin-only operations

**User provided:** $1

## Phase 2: Route Configuration

**Route Details:**

- **HTTP Method:** $2 (GET|POST|PUT|DELETE)
- **Route Path:** $3 (e.g., `user/settings`, `email/rules`, `public/webhook`)
- **Description:** $4 (optional description of route purpose)

**Generated Route Path:** `apps/web/app/api/${ROUTE_PATH}/route.ts`

## Phase 3: Security Middleware Selection

**Based on route type, select appropriate middleware:**

### User Routes (`withAuth`)

```typescript
export const METHOD = withAuth(async (request) => {
  const { userId } = request.auth;
  // User-scoped logic
});
```

### Email Routes (`withEmailAccount`)

```typescript
export const METHOD = withEmailAccount(async (request, { params }) => {
  const { userId, emailAccountId } = request.auth;
  // Email account-scoped logic
});
```

### Public Routes (`withError`)

```typescript
export const METHOD = withError(async (request) => {
  // Custom authentication or public access
});
```

### Cron Routes (`withError` + Cron Validation)

```typescript
export const METHOD = withError(async (request) => {
  if (!hasCronSecret(request)) {
    captureException(new Error("Unauthorized cron request"));
    return new Response("Unauthorized", { status: 401 });
  }
  // Cron logic
});
```

### Admin Routes (`adminActionClient`)

```typescript
export const METHOD = withError(async (request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin logic
});
```

## Phase 4: Input Validation Setup

**Create validation schema:**

```typescript
// apps/web/utils/actions/ROUTE_NAME.validation.ts
import { z } from "zod";

export const routeActionSchema = z.object({
  fieldName: z.string().min(1).max(100),
  optionalField: z.string().optional(),
  booleanField: z.boolean(),
});

export type RouteActionInput = z.infer<typeof routeActionSchema>;
```

## Phase 5: Database Query Patterns

**Secure query patterns based on route type:**

### User-Scoped Queries

```typescript
// Always include userId filter
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true }, // Only needed fields
});

const userResources = await prisma.resource.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});
```

### Email Account-Scoped Queries

```typescript
// Always include emailAccountId and userId
const emailAccount = await prisma.emailAccount.findUnique({
  where: {
    id: emailAccountId,
    userId, // Double validation
  },
});

const emailResources = await prisma.rule.findMany({
  where: {
    emailAccountId,
    enabled: true,
  },
  include: { actions: true },
});
```

### Ownership Validation

```typescript
// Always validate resource ownership
const resource = await prisma.resource.findUnique({
  where: {
    id: resourceId,
    emailAccount: { id: emailAccountId }, // Relationship-based ownership
  },
});

if (!resource) {
  throw new SafeError("Resource not found"); // Generic 404
}
```

## Phase 6: Error Handling & Responses

**Standardized response patterns:**

```typescript
export const METHOD = withEmailAccount(async (request, { params }) => {
  try {
    // ... route logic
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof SafeError) {
      return NextResponse.json(
        {
          error: error.message,
          isKnownError: true,
        },
        { status: error.statusCode || 400 },
      );
    }
    throw error; // Let middleware handle unexpected errors
  }
});
```

## Phase 7: Route Generation

**Create complete route file:**

### GET Route Example

```typescript
import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import prisma from "@/utils/prisma";

export const GET = withEmailAccount(async (request, { params }) => {
  const { emailAccountId } = request.auth;
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing resource ID" }, { status: 400 });
  }

  const resource = await prisma.resource.findUnique({
    where: {
      id,
      emailAccount: { id: emailAccountId },
    },
  });

  if (!resource) {
    throw new SafeError("Resource not found");
  }

  return NextResponse.json(resource);
});
```

### POST Route Example

```typescript
import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { routeActionSchema } from "@/utils/actions/route.validation";
import { actionClient } from "@/utils/actions/safe-action";

export const POST = withEmailAccount(async (request, { params }) => {
  const { emailAccountId } = request.auth;
  const body = await request.json();

  try {
    const validatedData = routeActionSchema.parse(body);

    const result = await actionClient
      .schema(routeActionSchema)
      .action(async ({ parsedInput }) => {
        return await prisma.resource.create({
          data: {
            ...parsedInput,
            emailAccountId,
          },
        });
      })(validatedData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    throw error;
  }
});
```

## Phase 8: Testing Setup

**Create corresponding test file:**

```typescript
// apps/web/app/api/ROUTE_PATH/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import prisma from "@/utils/__mocks__/prisma";

vi.mock("@/utils/prisma");

describe("API Route: ROUTE_PATH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return resource for authenticated user", async () => {
      const mockResource = { id: "123", name: "Test Resource" };
      prisma.resource.findUnique.mockResolvedValue(mockResource);

      const response = await GET(
        { auth: { userId: "user1", emailAccountId: "account1" } },
        { params: Promise.resolve({ id: "123" }) },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockResource);
    });

    it("should return 404 for non-existent resource", async () => {
      prisma.resource.findUnique.mockResolvedValue(null);

      await expect(
        GET(
          { auth: { userId: "user1", emailAccountId: "account1" } },
          { params: Promise.resolve({ id: "999" }) },
        ),
      ).rejects.toThrow("Resource not found");
    });
  });

  describe("POST", () => {
    it("should create resource with valid data", async () => {
      const newResource = { id: "456", name: "New Resource" };
      prisma.resource.create.mockResolvedValue(newResource);

      const requestBody = { name: "New Resource" };
      const request = {
        auth: { userId: "user1", emailAccountId: "account1" },
        json: () => Promise.resolve(requestBody),
      };

      const response = await POST(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(newResource);
    });

    it("should return 400 for invalid data", async () => {
      const request = {
        auth: { userId: "user1", emailAccountId: "account1" },
        json: () => Promise.resolve({ name: "" }), // Invalid: empty name
      };

      const response = await POST(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid input");
    });
  });
});
```

## Phase 9: Security Checklist

**Before completing, verify security requirements:**

### Authentication ✅

- [ ] Uses appropriate middleware (`withAuth`, `withEmailAccount`, `withError`)
- [ ] Cron endpoints use `hasCronSecret()` validation
- [ ] Admin endpoints validate admin status

### Authorization ✅

- [ ] All queries include user/account filtering
- [ ] Resource ownership is validated
- [ ] No direct object references without ownership checks

### Input Validation ✅

- [ ] All parameters are validated
- [ ] Request bodies use Zod schemas
- [ ] SQL injection prevention via Prisma

### Data Protection ✅

- [ ] Only necessary fields returned
- [ ] Error messages don't leak information
- [ ] Consistent error response format

## Phase 10: File Creation

**Generate the following files:**

1. `apps/web/app/api/${ROUTE_PATH}/route.ts` - Main route file
2. `apps/web/utils/actions/${ROUTE_NAME}.validation.ts` - Validation schemas
3. `apps/web/app/api/${ROUTE_PATH}/route.test.ts` - Test file

**Update:**

- Add route to API documentation
- Update type definitions if needed
- Add to security review checklist

## Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract route type, method, path, and description
2. **Select Middleware**: Choose appropriate security middleware
3. **Generate Route**: Create complete route file with security patterns
4. **Create Validation**: Generate Zod validation schemas
5. **Setup Testing**: Create comprehensive test file
6. **Security Review**: Verify all security requirements are met
7. **File Creation**: Write all generated files to appropriate locations

**Examples:**

```bash
/api-route user GET user/profile "Get user profile information"
/api-route email POST email/rules "Create new email rule"
/api-route public POST public/webhook "Handle external webhooks"
/api-route cron POST cron/digest "Send daily digest emails"
/api-route admin GET admin/users "Get all users (admin only)"
```

Execute API route generation now.
