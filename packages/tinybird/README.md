# @inboxzero/tinybird

[![npm version](https://badge.fury.io/js/@inboxzero%2Ftinybird.svg)](https://badge.fury.io/js/@inboxzero%2Ftinybird)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/inboxzero/inbox-zero-google-migration)
[![TypeScript](https://img.shields.io/badge/types-supported-blue.svg)](https://www.typescriptlang.org/)

A TypeScript wrapper for the [Tinybird](https://tinybird.co) analytics platform, designed specifically for InboxZero's data analytics and event tracking workflows.

## Features

- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **Zod Integration**: Built-in schema validation using Zod
- ✅ **Event Tracking**: Track user events and analytics data
- ✅ **Data Publishing**: Publish data to Tinybird datasources
- ✅ **Query Execution**: Execute complex analytics queries
- ✅ **Retry Logic**: Automatic retry with exponential backoff
- ✅ **Test Coverage**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @inboxzero/tinybird
# or
pnpm add @inboxzero/tinybird
# or
yarn add @inboxzero/tinybird
```

## Environment Setup

Set up your Tinybird token as an environment variable:

```bash
# .env.local
TINYBIRD_TOKEN=your_tinybird_token_here
TINYBIRD_BASE_URL=https://api.tinybird.co (optional)
```

## Usage

### Publishing Events

```typescript
import { publishEvent } from "@inboxzero/tinybird";

// Publish a user event
const result = await publishEvent("email_events", {
  user_id: "user_123",
  event_type: "email_opened",
  timestamp: new Date().toISOString(),
  data: {
    email_id: "email_456",
    category: "primary",
  },
});
```

### Querying Data

```typescript
import { queryData } from "@inboxzero/tinybird";

// Query user analytics
const analytics = await queryData("get_user_analytics", {
  user_id: "user_123",
  period: "7d",
});

console.log(analytics.data);
```

### Deleting Data

```typescript
import { deleteData } from "@inboxzero/tinybird";

// Delete user data
const result = await deleteData("user_data", {
  user_id: "user_123",
});
```

## API Reference

### Core Functions

#### `publishEvent(datasource: string, data: Record<string, any>)`

Publishes an event to a Tinybird datasource.

- **datasource**: The name of the datasource
- **data**: The event data to publish

**Returns:** `Promise<{ success: boolean; id?: string }>`

```typescript
const result = await publishEvent("email_events", {
  user_id: "user_123",
  event_type: "email_sent",
  timestamp: new Date().toISOString(),
  properties: {
    email_id: "email_456",
    category: "promotional",
  },
});
```

#### `queryData(pipe: string, params?: Record<string, any>)`

Executes a query using a Tinybird pipe.

- **pipe**: The name of the pipe to execute
- **params** (optional): Query parameters

**Returns:** `Promise<{ data: any[]; error?: string }>`

```typescript
const result = await queryData("get_email_analytics", {
  user_id: "user_123",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
});

if (result.error) {
  console.error("Query failed:", result.error);
} else {
  console.log("Analytics data:", result.data);
}
```

#### `deleteData(datasource: string, filter: Record<string, any>)`

Deletes data from a Tinybird datasource.

- **datasource**: The name of the datasource
- **filter**: Filter criteria for deletion

**Returns:** `Promise<{ success: boolean; deleted?: number }>`

```typescript
const result = await deleteData("user_events", {
  user_id: "user_123",
  event_type: "test_event",
});
```

### Tinybird Client

#### `tb`

The main Tinybird client instance, configured with environment variables.

```typescript
import { tb } from "@inboxzero/tinybird";

// Use the client directly
const result = await tb.buildPipe("my_pipe").fetch({
  param1: "value1",
  param2: "value2",
});
```

## Available Datasources

### Email Events

Tracks email-related events and analytics.

```typescript
interface EmailEvent {
  user_id: string;
  event_type: "email_sent" | "email_opened" | "email_clicked" | "email_bounced";
  timestamp: string;
  email_id?: string;
  category?: string;
  provider?: string;
}
```

### User Analytics

Tracks user behavior and engagement metrics.

```typescript
interface UserAnalytics {
  user_id: string;
  event_type: string;
  timestamp: string;
  properties: Record<string, any>;
}
```

## Available Pipes

### Get Email Actions by Period

Retrieves email actions for a specific time period.

```typescript
const emailActions = await queryData("get_email_actions_by_period", {
  user_id: "user_123",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  event_types: "email_opened,email_clicked",
});
```

### Last and Oldest Emails Materialized View

Provides aggregated email statistics.

```typescript
const emailStats = await queryData("last_and_oldest_emails_mv", {
  user_id: "user_123",
});
```

## Development

### Tinybird CLI Setup

First time setup:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install tinybird-cli
tb auth
```

### Pushing Datasources

```bash
# Push all datasources
tb push datasources

# Push specific datasource
tb push datasources/email.datasource
```

### Pushing Pipes

```bash
# Push all pipes
tb push pipes

# Push specific pipe
tb push pipes/get_email_actions_by_period.pipe

# Force push changes
tb push pipes --force --no-check
```

### Docker Development

You can also use the Docker image for Tinybird CLI:

```bash
docker run -v .:/mnt/data -it tinybirdco/tinybird-cli-docker
```

Then within Docker:

```bash
cd mnt/data
tb auth  # Sign in to Tinybird
```

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
