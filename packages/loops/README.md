# @inboxzero/loops

[![npm version](https://badge.fury.io/js/@inboxzero%2Floops.svg)](https://badge.fury.io/js/@inboxzero%2Floops)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/inboxzero/inbox-zero-google-migration)
[![TypeScript](https://img.shields.io/badge/types-supported-blue.svg)](https://www.typescriptlang.org/)

A TypeScript wrapper for the [Loops](https://loops.so) API, designed specifically for InboxZero's email marketing and user engagement workflows.

## Features

- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **Environment Variable Management**: Secure API key handling with environment variables
- ✅ **Contact Management**: Create, update, and delete contacts
- ✅ **Event Tracking**: Send custom events for user lifecycle tracking
- ✅ **Error Handling**: Graceful error handling and logging
- ✅ **Zero Dependencies**: Minimal dependencies, only the official Loops SDK
- ✅ **Test Coverage**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @inboxzero/loops
# or
pnpm add @inboxzero/loops
# or
yarn add @inboxzero/loops
```

## Environment Setup

Set up your Loops API secret as an environment variable:

```bash
# .env.local
LOOPS_API_SECRET=your_loops_api_secret_here
```

## Usage

### Creating a Contact

```typescript
import { createContact } from "@inboxzero/loops";

// Basic contact creation
const result = await createContact("user@example.com");

// With additional properties
const result = await createContact("user@example.com", "John", "google");
```

### Deleting a Contact

```typescript
import { deleteContact } from "@inboxzero/loops";

const result = await deleteContact("user@example.com");
```

### Tracking User Events

```typescript
import {
  startedTrial,
  completedTrial,
  switchedPremiumPlan,
  cancelledPremium,
} from "@inboxzero/loops";

// User started a trial
await startedTrial("user@example.com", "premium");

// User completed a trial
await completedTrial("user@example.com", "premium");

// User switched to a premium plan
await switchedPremiumPlan("user@example.com", "enterprise");

// User cancelled premium
await cancelledPremium("user@example.com");
```

### Updating Contact Properties

```typescript
import { updateContactRole, updateContactCompanySize } from "@inboxzero/loops";

// Update user role
await updateContactRole({
  email: "user@example.com",
  role: "admin",
});

// Update company size
await updateContactCompanySize({
  email: "user@example.com",
  companySize: 100,
});
```

## API Reference

### Functions

#### `createContact(email: string, firstName?: string, provider?: string)`

Creates a new contact in Loops.

- **email**: The contact's email address
- **firstName** (optional): The contact's first name
- **provider** (optional): The signup provider (e.g., 'google', 'github')

**Returns:** `Promise<{ success: boolean; id?: string }>`

#### `deleteContact(email: string)`

Deletes a contact from Loops.

- **email**: The email address of the contact to delete

**Returns:** `Promise<{ success: boolean }>`

#### `startedTrial(email: string, tier: string)`

Sends a trial started event.

- **email**: The user's email address
- **tier**: The trial tier (e.g., 'premium', 'enterprise')

**Returns:** `Promise<{ success: boolean }>`

#### `completedTrial(email: string, tier: string)`

Sends a trial completed event.

- **email**: The user's email address
- **tier**: The completed trial tier

**Returns:** `Promise<{ success: boolean }>`

#### `switchedPremiumPlan(email: string, tier: string)`

Sends a premium plan switch event.

- **email**: The user's email address
- **tier**: The new premium tier

**Returns:** `Promise<{ success: boolean }>`

#### `cancelledPremium(email: string)`

Sends a premium cancellation event.

- **email**: The user's email address

**Returns:** `Promise<{ success: boolean }>`

#### `updateContactRole({ email, role })`

Updates a contact's role.

- **email**: The contact's email address
- **role**: The new role

**Returns:** `Promise<{ success: boolean }>`

#### `updateContactCompanySize({ email, companySize })`

Updates a contact's company size.

- **email**: The contact's email address
- **companySize**: The company size as a number

**Returns:** `Promise<{ success: boolean }>`

## Error Handling

All functions return a success boolean. If `LOOPS_API_SECRET` is not set, functions will return `{ success: false }` and log a warning.

```typescript
const result = await createContact("user@example.com");

if (!result.success) {
  // Handle error case
  console.error("Failed to create contact");
}
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode
pnpm test:ci
```

### Type Checking

```bash
pnpm type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/inboxzero/inbox-zero-google-migration/issues).
