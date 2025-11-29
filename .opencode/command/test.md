---
description: "Create comprehensive tests with Vitest, mocking, and best practices"
agent: "build"
subtask: true
---

# 🧪 Test Generator

Create comprehensive test suites following Inbox Zero testing patterns, mocking strategies, and best practices.

## Phase 1: Test Type Selection

**What type of test are you creating?**

- `unit` - Unit tests for functions, components, utilities
- `integration` - Integration tests for API routes, database operations
- `e2e` - End-to-end tests for user workflows
- `security` - Security tests for authentication, authorization, vulnerabilities
- `performance` - Performance tests for load testing, benchmarks
- `accessibility` - Accessibility tests for WCAG compliance

**User provided:** $1

## Phase 2: Test Configuration

**Test Details:**

- **Target:** $2 (file/function/class being tested, e.g., `utils/actions/user`, `components/UserProfile`, `api/user/settings`)
- **Test Name:** $3 (descriptive test name, e.g., `UserProfile`, `UserSettingsAPI`, `AuthenticationFlow`)
- **Test Cases:** $4 (comma-separated test scenarios, e.g., `valid input,invalid input,edge cases`)

**Generated Files:**

- `apps/web/__tests__/TARGET.test.ts` - Main test file
- `apps/web/__tests__/helpers/TEST_NAME.ts` - Test helpers (if needed)
- `apps/web/__tests__/mocks/TARGET.mock.ts` - Mock definitions (if needed)

## Phase 3: Unit Test Patterns

### Function/Utility Tests

```typescript
// apps/web/__tests__/utils/TARGET.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TARGET_FUNCTION } from "@/utils/TARGET";

describe("TARGET_FUNCTION", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when called with valid input", () => {
    it("should return expected result", () => {
      const input = {
        /* valid input */
      };
      const expected = {
        /* expected output */
      };

      const result = TARGET_FUNCTION(input);

      expect(result).toEqual(expected);
    });

    it("should handle edge cases", () => {
      const edgeCases = [
        { input: null, expected: null },
        { input: "", expected: "" },
        { input: [], expected: [] },
      ];

      edgeCases.forEach(({ input, expected }) => {
        expect(TARGET_FUNCTION(input)).toEqual(expected);
      });
    });
  });

  describe("when called with invalid input", () => {
    it("should throw appropriate error", () => {
      const invalidInput = {
        /* invalid input */
      };

      expect(() => TARGET_FUNCTION(invalidInput)).toThrow(
        "Expected error message",
      );
    });

    it("should validate input types", () => {
      const invalidTypes = [undefined, null, 123, "string", {}, []];

      invalidTypes.forEach((input) => {
        expect(() => TARGET_FUNCTION(input)).toThrow();
      });
    });
  });

  describe("performance considerations", () => {
    it("should complete within time limit", () => {
      const input = {
        /* large but valid input */
      };
      const startTime = performance.now();

      TARGET_FUNCTION(input);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 100ms limit
    });
  });
});
```

### Component Tests

```typescript
// apps/web/__tests__/components/TARGET.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TARGET } from "@/components/TARGET";

describe("TARGET Component", () => {
  const defaultProps = {
    // Default props for testing
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<TARGET {...defaultProps} />);

    // Check for key elements
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    const handleClick = vi.fn();
    render(<TARGET {...defaultProps} onClick={handleClick} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it("displays loading state", () => {
    render(<TARGET {...defaultProps} loading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    const errorMessage = "Something went wrong";
    render(<TARGET {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("handles prop changes correctly", () => {
    const { rerender } = render(<TARGET {...defaultProps} value="initial" />);

    expect(screen.getByDisplayValue("initial")).toBeInTheDocument();

    rerender(<TARGET {...defaultProps} value="updated" />);
    expect(screen.getByDisplayValue("updated")).toBeInTheDocument();
  });

  it("is accessible", async () => {
    const { container } = render(<TARGET {...defaultProps} />);

    // Check for accessibility violations
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("supports keyboard navigation", async () => {
    render(<TARGET {...defaultProps} />);

    const interactiveElement = screen.getByRole("button");
    interactiveElement.focus();
    expect(interactiveElement).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    // Test keyboard interaction
  });
});
```

### Form Component Tests

```typescript
// apps/web/__tests__/components/TARGET.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TARGET } from "@/components/TARGET";
import { actionNameAction } from "@/utils/actions/ACTION_NAME";

// Mock the server action
vi.mock("@/utils/actions/ACTION_NAME");

describe("TARGET Form Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<TARGET />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<TARGET />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const mockResult = { id: "123", name: "Test" };
    vi.mocked(actionNameAction).mockResolvedValue(mockResult);

    render(<TARGET />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test Name");
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(actionNameAction).toHaveBeenCalledWith({
        name: "Test Name",
        email: "test@example.com"
      });
    });
  });

  it("handles server action errors", async () => {
    const errorMessage = "Server error occurred";
    vi.mocked(actionNameAction).mockResolvedValue({ serverError: errorMessage });

    render(<TARGET />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
```

## Phase 4: Integration Test Patterns

### API Route Tests

```typescript
// apps/web/__tests__/integration/api/TARGET.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GET, POST } from "@/app/api/TARGET/route";
import prisma from "@/utils/__mocks__/prisma";

// Setup test database
beforeAll(async () => {
  // Setup test data
  await prisma.user.create({
    data: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    },
  });
});

afterAll(async () => {
  // Cleanup test data
  await prisma.user.deleteMany({
    where: { id: { contains: "test-" } },
  });
});

describe("API Route: TARGET", () => {
  describe("GET /api/TARGET", () => {
    it("should return data for authenticated user", async () => {
      const mockData = { id: "123", name: "Test Resource" };
      prisma.resource.findMany.mockResolvedValue([mockData]);

      const request = {
        auth: { userId: "test-user-id", emailAccountId: "test-account-id" },
      };

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([mockData]);
    });

    it("should return 401 for unauthenticated request", async () => {
      const request = { auth: null };

      await expect(
        GET(request, { params: Promise.resolve({}) }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("POST /api/TARGET", () => {
    it("should create resource with valid data", async () => {
      const newResource = { id: "456", name: "New Resource" };
      prisma.resource.create.mockResolvedValue(newResource);

      const requestBody = { name: "New Resource" };
      const request = {
        auth: { userId: "test-user-id", emailAccountId: "test-account-id" },
        json: () => Promise.resolve(requestBody),
      };

      const response = await POST(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(newResource);
    });

    it("should return 400 for invalid data", async () => {
      const request = {
        auth: { userId: "test-user-id", emailAccountId: "test-account-id" },
        json: () => Promise.resolve({ name: "" }), // Invalid: empty name
      };

      const response = await POST(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid input");
    });
  });
});
```

### Database Operation Tests

```typescript
// apps/web/__tests__/integration/database/TARGET.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import prisma from "@/utils/prisma";

describe("Database Operations: TARGET", () => {
  let testUserId: string;
  let testEmailAccountId: string;

  beforeAll(async () => {
    // Create test user and email account
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
      },
    });
    testUserId = user.id;

    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: testUserId,
        email: "test@gmail.com",
        name: "Test Account",
      },
    });
    testEmailAccountId = emailAccount.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.emailAccount.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  beforeEach(async () => {
    // Cleanup specific test data before each test
    await prisma.rule.deleteMany({
      where: { emailAccountId: testEmailAccountId },
    });
  });

  describe("Rule Creation", () => {
    it("should create rule with valid data", async () => {
      const ruleData = {
        name: "Test Rule",
        instructions: "Test instructions",
        enabled: true,
        emailAccountId: testEmailAccountId,
      };

      const rule = await prisma.rule.create({
        data: ruleData,
      });

      expect(rule).toHaveProperty("id");
      expect(rule.name).toBe(ruleData.name);
      expect(rule.emailAccountId).toBe(testEmailAccountId);
    });

    it("should enforce foreign key constraints", async () => {
      const invalidRuleData = {
        name: "Invalid Rule",
        instructions: "Invalid instructions",
        enabled: true,
        emailAccountId: "non-existent-id",
      };

      await expect(
        prisma.rule.create({ data: invalidRuleData }),
      ).rejects.toThrow();
    });
  });

  describe("Rule Retrieval", () => {
    it("should retrieve rules for email account", async () => {
      // Create test rules
      await prisma.rule.createMany({
        data: [
          {
            name: "Rule 1",
            instructions: "Instructions 1",
            enabled: true,
            emailAccountId: testEmailAccountId,
          },
          {
            name: "Rule 2",
            instructions: "Instructions 2",
            enabled: false,
            emailAccountId: testEmailAccountId,
          },
        ],
      });

      const rules = await prisma.rule.findMany({
        where: { emailAccountId: testEmailAccountId },
        orderBy: { createdAt: "desc" },
      });

      expect(rules).toHaveLength(2);
      expect(rules[0].name).toBe("Rule 1");
      expect(rules[1].name).toBe("Rule 2");
    });

    it("should not return rules from other email accounts", async () => {
      // Create another email account and rules
      const otherUser = await prisma.user.create({
        data: { email: "other@example.com", name: "Other User" },
      });
      const otherAccount = await prisma.emailAccount.create({
        data: {
          userId: otherUser.id,
          email: "other@gmail.com",
          name: "Other Account",
        },
      });
      await prisma.rule.create({
        data: {
          name: "Other Rule",
          instructions: "Other instructions",
          enabled: true,
          emailAccountId: otherAccount.id,
        },
      });

      const rules = await prisma.rule.findMany({
        where: { emailAccountId: testEmailAccountId },
      });

      expect(rules).toHaveLength(0);
    });
  });
});
```

## Phase 5: End-to-End Test Patterns

### User Workflow Tests

```typescript
// apps/web/__tests__/e2e/TARGET.spec.ts
import { test, expect } from "@playwright/test";

test.describe("TARGET Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/dashboard");
  });

  test("should complete full user workflow", async ({ page }) => {
    // Navigate to target page
    await page.goto("/TARGET");

    // Verify page loads
    await expect(page.locator("h1")).toContainText("TARGET Page");

    // Fill form
    await page.fill('[data-testid="name-input"]', "Test Name");
    await page.fill('[data-testid="email-input"]', "test@example.com");

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      "Created successfully",
    );

    // Verify data persistence
    await page.reload();
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue(
      "Test Name",
    );
  });

  test("should handle validation errors", async ({ page }) => {
    await page.goto("/TARGET");

    // Submit empty form
    await page.click('[data-testid="submit-button"]');

    // Verify error messages
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toContainText(
      "Name is required",
    );
    await expect(page.locator('[data-testid="email-error"]')).toContainText(
      "Email is required",
    );

    // Verify form is not submitted
    await expect(
      page.locator('[data-testid="success-message"]'),
    ).not.toBeVisible();
  });

  test("should be accessible", async ({ page }) => {
    await page.goto("/TARGET");

    // Check for accessibility violations
    const accessibilityScanResults = await page.accessibility.scan();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## Phase 6: Security Test Patterns

### Authentication Tests

```typescript
// apps/web/__tests__/security/TARGET.test.ts
import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/TARGET/route";

describe("Security Tests: TARGET", () => {
  describe("Authentication Bypass", () => {
    it("should reject requests without authentication", async () => {
      const request = { auth: null };

      await expect(
        GET(request, { params: Promise.resolve({}) }),
      ).rejects.toThrow("Unauthorized");
    });

    it("should reject requests with invalid tokens", async () => {
      const request = {
        auth: { userId: "invalid", token: "invalid" },
      };

      await expect(
        GET(request, { params: Promise.resolve({}) }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("Authorization Bypass", () => {
    it("should prevent access to other users' resources", async () => {
      const request = {
        auth: { userId: "user1", emailAccountId: "account1" },
      };

      // Try to access resource from user2/account2
      await expect(
        GET(request, {
          params: Promise.resolve({ id: "resource-from-user2" }),
        }),
      ).rejects.toThrow("Resource not found"); // Should be 404, not 403
    });
  });

  describe("Input Validation", () => {
    it("should sanitize malicious input", async () => {
      const maliciousInput = {
        name: "<script>alert('xss')</script>",
        query: "'; DROP TABLE users; --",
      };

      const request = {
        auth: { userId: "test-user", emailAccountId: "test-account" },
        json: () => Promise.resolve(maliciousInput),
      };

      const response = await POST(request, { params: Promise.resolve({}) });

      // Should not execute malicious code
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid input");
    });
  });
});
```

## Phase 7: Performance Test Patterns

### Load Testing

```typescript
// apps/web/__tests__/performance/TARGET.test.ts
import { describe, it, expect } from "vitest";

describe("Performance Tests: TARGET", () => {
  it("should handle concurrent requests", async () => {
    const concurrentRequests = 100;
    const startTime = Date.now();

    const promises = Array.from({ length: concurrentRequests }, () =>
      // Simulate API request
      fetch("/api/TARGET", { method: "GET" }),
    );

    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify performance
    expect(duration).toBeLessThan(5000); // 5 seconds for 100 requests
    const successful = results.filter((r) => r.status === "fulfilled").length;
    expect(successful).toBeGreaterThan(95); // 95% success rate
  });

  it("should complete within time limits", async () => {
    const iterations = 1000;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Execute function to test
      TARGET_FUNCTION(testData);

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const p95Time = times.sort((a, b) => a - b)[
      Math.floor(times.length * 0.95)
    ];

    expect(averageTime).toBeLessThan(10); // 10ms average
    expect(maxTime).toBeLessThan(50); // 50ms max
    expect(p95Time).toBeLessThan(20); // 20ms 95th percentile
  });
});
```

## Phase 8: Mock and Helper Setup

### Mock Templates

```typescript
// apps/web/__tests__/mocks/prisma.ts
import { vi } from "vitest";

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  emailAccount: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  rule: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// Mock the entire prisma export
vi.mock("@/utils/prisma", () => mockPrisma);

export default mockPrisma;
```

### Test Helpers

```typescript
// apps/web/__tests__/helpers/index.ts
import { prisma } from "@/utils/__mocks__/prisma";

export const createTestUser = async (overrides = {}) => {
  const userData = {
    email: "test@example.com",
    name: "Test User",
    ...overrides,
  };

  return await prisma.user.create({ data: userData });
};

export const createTestEmailAccount = async (
  userId: string,
  overrides = {},
) => {
  const accountData = {
    userId,
    email: "test@gmail.com",
    name: "Test Account",
    ...overrides,
  };

  return await prisma.emailAccount.create({ data: accountData });
};

export const createTestRule = async (
  emailAccountId: string,
  overrides = {},
) => {
  const ruleData = {
    name: "Test Rule",
    instructions: "Test instructions",
    enabled: true,
    emailAccountId,
    ...overrides,
  };

  return await prisma.rule.create({ data: ruleData });
};

export const cleanupTestData = async () => {
  await prisma.rule.deleteMany({
    where: { name: { contains: "Test" } },
  });
  await prisma.emailAccount.deleteMany({
    where: { name: { contains: "Test" } },
  });
  await prisma.user.deleteMany({
    where: { email: { contains: "test" } },
  });
};
```

## Phase 9: Test Configuration

### Vitest Configuration

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "__tests__/", "**/*.d.ts", "**/*.config.*"],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### Test Setup File

```typescript
// apps/web/__tests__/setup.ts
import { vi } from "vitest";
import "whatwg-fetch";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/test",
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
```

## Phase 10: File Generation

**Generate the following files:**

1. `apps/web/__tests__/TARGET.test.ts` - Main test file
2. `apps/web/__tests__/helpers/TARGET.ts` - Test helpers (if needed)
3. `apps/web/__tests__/mocks/TARGET.mock.ts` - Mock definitions (if needed)

**Update:**

- Add test scripts to package.json if needed
- Update CI/CD pipeline for test execution
- Add test coverage reporting

## Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract test type, target, test name, and test cases
2. **Select Test Pattern**: Choose appropriate test structure template
3. **Generate Tests**: Create comprehensive test files with proper patterns
4. **Setup Mocking**: Create mock definitions and helpers
5. **Add Security Tests**: Include authentication, authorization, and input validation tests
6. **Configure Coverage**: Set up test coverage and reporting
7. **File Creation**: Write all generated files to appropriate locations

**Examples:**

```bash
/test unit utils/actions/user "User Actions" "valid input,invalid input,edge cases"
/test integration api/user/settings "User Settings API" "authentication,authorization,input validation"
/test e2e user-registration "User Registration Flow" "successful registration,validation errors,duplicate email"
/test security api/auth "Authentication Security" "bypass attempts,injection attacks,session hijacking"
/test performance email-processing "Email Processing Performance" "concurrent requests,large datasets,memory usage"
```

Execute test generation now.
