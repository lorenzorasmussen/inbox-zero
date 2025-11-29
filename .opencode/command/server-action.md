---
description: "Create server actions with validation, security, and best practices"
agent: build
subtask: true
---

# ⚡ Server Action Generator

Create Next.js server actions following Inbox Zero patterns, validation, and security guidelines.

## Phase 1: Action Type Selection

**What type of server action are you creating?**

- `user` - User-scoped operations (profile, settings, API keys)
- `email` - Email account-scoped operations (rules, schedules, emails)
- `admin` - Admin-only operations (user management, system tasks)

**User provided:** $1

## Phase 2: Action Configuration

**Action Details:**

- **Action Name:** $2 (e.g., `updateProfile`, `createRule`, `sendDigest`)
- **Description:** $3 (optional description of action purpose)
- **Input Fields:** $4 (comma-separated field names and types, e.g., `name:string,enabled:boolean`)

**Generated Files:**

- `apps/web/utils/actions/ACTION_NAME.validation.ts`
- `apps/web/utils/actions/ACTION_NAME.ts`

## Phase 3: Client Selection

**Based on action type, select appropriate client:**

### User Actions (`actionClientUser`)

```typescript
export const actionNameAction = actionClientUser
  .metadata({ name: "actionName" })
  .schema(actionValidationSchema)
  .action(async ({ ctx: { userId }, parsedInput }) => {
    // User-scoped logic with userId context
  });
```

### Email Actions (`actionClient`)

```typescript
export const actionNameAction = actionClient
  .metadata({ name: "actionName" })
  .schema(actionValidationSchema)
  .action(async ({ ctx: { emailAccountId }, parsedInput }) => {
    // Email account-scoped logic
    // emailAccountId must be bound when calling from client
  });
```

### Admin Actions (`adminActionClient`)

```typescript
export const actionNameAction = adminActionClient
  .metadata({ name: "actionName" })
  .schema(actionValidationSchema)
  .action(async ({ ctx: { userId }, parsedInput }) => {
    // Admin-only logic
  });
```

## Phase 4: Validation Schema Generation

**Create Zod validation schema:**

```typescript
// apps/web/utils/actions/ACTION_NAME.validation.ts
import { z } from "zod";

export const actionNameBody = z.object({
  fieldName: z.string().min(1).max(100),
  optionalField: z.string().optional(),
  booleanField: z.boolean(),
  enumField: z.enum(["option1", "option2", "option3"]),
  arrayField: z.array(z.string()).min(1).max(10),
  numberField: z.number().min(0).max(1000),
  emailField: z.string().email(),
  urlField: z.string().url().optional(),
  dateField: z.string().datetime().optional(),
});

export type ActionNameBody = z.infer<typeof actionNameBody>;
```

## Phase 5: Action Implementation Patterns

### User Profile Actions

```typescript
export const updateProfileAction = actionClientUser
  .metadata({ name: "updateProfile" })
  .schema(updateProfileBody)
  .action(
    async ({ ctx: { userId }, parsedInput: { name, email, timezone } }) => {
      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          timezone,
        },
      });

      // Revalidate related cache
      revalidatePath("/profile");

      return updatedUser;
    },
  );
```

### Email Rule Actions

```typescript
export const createRuleAction = actionClient
  .metadata({ name: "createRule" })
  .schema(createRuleBody)
  .action(
    async ({
      ctx: { emailAccountId },
      parsedInput: { name, instructions, enabled },
    }) => {
      // Create email rule
      const rule = await prisma.rule.create({
        data: {
          name,
          instructions,
          enabled,
          emailAccountId,
        },
      });

      // Revalidate rules cache
      revalidatePath("/rules");
      revalidateTag(`rules-${emailAccountId}`);

      return rule;
    },
  );
```

### Email Schedule Actions

```typescript
export const updateScheduleAction = actionClient
  .metadata({ name: "updateSchedule" })
  .schema(updateScheduleBody)
  .action(
    async ({
      ctx: { emailAccountId },
      parsedInput: { scheduleId, frequency, enabled },
    }) => {
      // Validate ownership
      const existingSchedule = await prisma.schedule.findUnique({
        where: {
          id: scheduleId,
          emailAccount: { id: emailAccountId },
        },
      });

      if (!existingSchedule) {
        throw new SafeError("Schedule not found");
      }

      // Update schedule
      const updatedSchedule = await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          frequency,
          enabled,
        },
      });

      // Revalidate schedules cache
      revalidatePath("/schedules");
      revalidateTag(`schedules-${emailAccountId}`);

      return updatedSchedule;
    },
  );
```

### Admin Actions

```typescript
export const adminUserAction = adminActionClient
  .metadata({ name: "adminUserAction" })
  .schema(adminUserBody)
  .action(
    async ({
      ctx: { userId },
      parsedInput: { targetUserId, action, reason },
    }) => {
      // Admin-only user management
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        throw new SafeError("User not found");
      }

      // Perform admin action
      const result = await performAdminAction(action, targetUser, reason);

      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: userId,
          targetUserId,
          action,
          reason,
          timestamp: new Date(),
        },
      });

      return result;
    },
  );
```

## Phase 6: Error Handling Patterns

### SafeError Usage

```typescript
export const actionNameAction = actionClientUser
  .metadata({ name: "actionName" })
  .schema(actionNameBody)
  .action(async ({ ctx: { userId }, parsedInput }) => {
    // Validation errors
    const existing = await prisma.resource.findUnique({
      where: { name: parsedInput.name },
    });

    if (existing) {
      throw new SafeError("Resource with this name already exists");
    }

    // Permission errors
    const hasPermission = await checkUserPermission(
      userId,
      parsedInput.resourceId,
    );
    if (!hasPermission) {
      throw new SafeError("Insufficient permissions");
    }

    // Business logic errors
    if (parsedInput.quantity <= 0) {
      throw new SafeError("Quantity must be greater than 0");
    }

    // Success case
    const result = await prisma.resource.create({
      data: {
        ...parsedInput,
        userId,
      },
    });

    return result;
  });
```

### Async Operations with Error Handling

```typescript
export const processEmailsAction = actionClient
  .metadata({ name: "processEmails" })
  .schema(processEmailsBody)
  .action(async ({ ctx: { emailAccountId }, parsedInput }) => {
    try {
      // External API call
      const emails = await fetchEmailsFromProvider(emailAccountId);

      // Process each email with error handling
      const results = await Promise.allSettled(
        emails.map(async (email) => {
          try {
            return await processSingleEmail(email);
          } catch (error) {
            // Log error but don't fail entire action
            captureException(error);
            return {
              emailId: email.id,
              status: "failed",
              error: error.message,
            };
          }
        }),
      );

      // Return summary
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return {
        total: emails.length,
        successful,
        failed,
        results: results.map((r) => r.value || r.reason),
      };
    } catch (error) {
      // Handle critical errors
      captureException(error);
      throw new SafeError("Failed to process emails");
    }
  });
```

## Phase 7: Client-Side Usage

### Form Integration

```typescript
// React component with form
import { actionNameAction } from "@/utils/actions/ACTION_NAME";
import { useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/components/Toast";

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(actionNameBody)
  });

  const onSubmit = async (data) => {
    const result = await actionNameAction(data);

    if (result?.serverError) {
      toastError({
        title: "Action failed",
        description: result.serverError
      });
    } else {
      toastSuccess({
        description: "Action completed successfully"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("fieldName", { required: true })}
        error={errors.fieldName}
        label="Field Name"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### SWR Integration for Data Refresh

```typescript
import { actionNameAction } from "@/utils/actions/ACTION_NAME";
import useSWR, { mutate } from "swr";

export default function MyComponent() {
  const { data, mutate } = useSWR("/api/user/data");

  const handleAction = async (actionData) => {
    const result = await actionNameAction(actionData);

    if (!result?.serverError) {
      // Refresh SWR cache
      mutate();
    }
  };

  return (
    // Component JSX
  );
}
```

## Phase 8: Testing Setup

### Unit Tests

```typescript
// apps/web/utils/actions/ACTION_NAME.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { actionNameAction } from "./ACTION_NAME";
import prisma from "@/utils/__mocks__/prisma";

vi.mock("@/utils/prisma");

describe("Action: ACTION_NAME", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create resource with valid data", async () => {
    const mockData = { name: "Test Resource", enabled: true };
    const mockResult = { id: "123", ...mockData };

    prisma.resource.create.mockResolvedValue(mockResult);

    const result = await actionNameAction(mockData);

    expect(result).toEqual(mockResult);
    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: { ...mockData, userId: "test-user-id" },
    });
  });

  it("should throw SafeError for duplicate name", async () => {
    const mockData = { name: "Duplicate Resource", enabled: true };

    prisma.resource.findUnique.mockResolvedValue({ id: "existing" });

    await expect(actionNameAction(mockData)).rejects.toThrow(
      "Resource with this name already exists",
    );
  });

  it("should validate input schema", async () => {
    const invalidData = { name: "", enabled: "invalid" };

    await expect(actionNameAction(invalidData)).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// apps/web/__tests__/integration/ACTION_NAME.test.ts
import { describe, it, expect } from "vitest";
import { actionNameAction } from "@/utils/actions/ACTION_NAME";

describe("Action Integration: ACTION_NAME", () => {
  it("should work end-to-end with database", async () => {
    const validData = {
      name: "Integration Test Resource",
      enabled: true,
    };

    const result = await actionNameAction(validData);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe(validData.name);
    expect(result.enabled).toBe(validData.enabled);
  });
});
```

## Phase 9: File Generation

**Generate complete action files:**

### Validation File Template

```typescript
// apps/web/utils/actions/ACTION_NAME.validation.ts
import { z } from "zod";

export const actionNameBody = z.object({
  // Generated based on input fields
});

export type ActionNameBody = z.infer<typeof actionNameBody>;
```

### Action File Template

```typescript
// apps/web/utils/actions/ACTION_NAME.ts
"use server";

import {
  actionClientUser,
  actionClient,
  adminActionClient,
} from "@/utils/actions/safe-action";
import { actionNameBody } from "./ACTION_NAME.validation";
import prisma from "@/utils/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export const actionNameAction = actionClientUser
  .metadata({ name: "actionName" })
  .schema(actionNameBody)
  .action(async ({ ctx: { userId }, parsedInput }) => {
    // Generated implementation
  });
```

## Phase 10: Security Checklist

**Before completing, verify security requirements:**

### Input Validation ✅

- [ ] All inputs validated with Zod schemas
- [ ] Proper type checking and constraints
- [ ] Sanitization of user inputs
- [ ] No direct parameter usage without validation

### Database Security ✅

- [ ] All queries scoped to authenticated user
- [ ] Resource ownership validation
- [ ] No mass assignment vulnerabilities
- [ ] Proper use of Prisma relationships

### Error Handling ✅

- [ ] SafeError for expected errors
- [ ] Generic error messages (no info disclosure)
- [ ] Proper exception logging
- [ ] Consistent error response format

### Cache Invalidation ✅

- [ ] Appropriate revalidatePath usage
- [ ] Cache tag invalidation where needed
- [ ] No stale data issues

## Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract action type, name, description, and input fields
2. **Select Client**: Choose appropriate action client based on type
3. **Generate Validation**: Create Zod schema for input validation
4. **Implement Action**: Create complete action with security patterns
5. **Add Error Handling**: Implement SafeError usage and proper error responses
6. **Setup Testing**: Create unit and integration test files
7. **Security Review**: Verify all security requirements are met
8. **File Creation**: Write all generated files to appropriate locations

**Examples:**

```bash
/server-action user updateProfile "Update user profile" "name:string,email:string,timezone:string"
/server-action email createRule "Create new email rule" "name:string,instructions:text,enabled:boolean"
/server-action admin sendDigest "Send digest to all users" "subject:string,content:text"
```

Execute server action generation now.
