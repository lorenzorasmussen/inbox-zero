# @inboxzero/tinybird-ai-analytics

[![npm version](https://badge.fury.io/js/@inboxzero%2Ftinybird-ai-analytics.svg)](https://badge.fury.io/js/@inboxzero%2Ftinybird-ai-analytics)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/inboxzero/inbox-zero-google-migration)
[![TypeScript](https://img.shields.io/badge/types-supported-blue.svg)](https://www.typescriptlang.org/)

A TypeScript wrapper for AI-powered analytics using [Tinybird](https://tinybird.co), designed specifically for InboxZero's machine learning and AI analytics workflows.

## Features

- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **Zod Integration**: Built-in schema validation using Zod
- ✅ **AI Analytics**: Track AI model calls, performance, and usage patterns
- ✅ **ML Metrics**: Monitor machine learning model performance and accuracy
- ✅ **Cost Tracking**: Track AI API costs and usage quotas
- ✅ **Performance Monitoring**: Monitor response times and throughput
- ✅ **Test Coverage**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @inboxzero/tinybird-ai-analytics
# or
pnpm add @inboxzero/tinybird-ai-analytics
# or
yarn add @inboxzero/tinybird-ai-analytics
```

## Environment Setup

Set up your Tinybird token as an environment variable:

```bash
# .env.local
TINYBIRD_TOKEN=your_tinybird_token_here
TINYBIRD_BASE_URL=https://api.tinybird.co (optional)
```

## Usage

### Tracking AI Calls

```typescript
import { trackAICall } from "@inboxzero/tinybird-ai-analytics";

// Track an AI model call
const result = await trackAICall({
  model: "gpt-4",
  provider: "openai",
  input_tokens: 150,
  output_tokens: 300,
  response_time: 1200,
  cost: 0.006,
  user_id: "user_123",
  success: true,
  error: null,
});
```

### Tracking AI Performance

```typescript
import { trackAIPerformance } from "@inboxzero/tinybird-ai-analytics";

// Track AI model performance metrics
const result = await trackAIPerformance({
  model: "claude-3-sonnet",
  provider: "anthropic",
  accuracy: 0.92,
  latency: 800,
  throughput: 15,
  user_id: "user_123",
  timestamp: new Date().toISOString(),
});
```

### Querying AI Analytics

```typescript
import { queryAIAnalytics } from "@inboxzero/tinybird-ai-analytics";

// Query AI usage analytics
const analytics = await queryAIAnalytics({
  user_id: "user_123",
  period: "7d",
  model: "gpt-4",
});

console.log(analytics.data);
```

## API Reference

### Core Functions

#### `trackAICall(data: AICallData)`

Tracks an AI model call event.

- **data.model**: The AI model used (e.g., 'gpt-4', 'claude-3-sonnet')
- **data.provider**: The AI provider (e.g., 'openai', 'anthropic')
- **data.input_tokens**: Number of input tokens
- **data.output_tokens**: Number of output tokens
- **data.response_time**: Response time in milliseconds
- **data.cost**: Cost of the API call in USD
- **data.user_id**: User identifier
- **data.success**: Whether the call was successful
- **data.error**: Error message if the call failed

**Returns:** `Promise<{ success: boolean; id?: string }>`

```typescript
const result = await trackAICall({
  model: "gpt-4",
  provider: "openai",
  input_tokens: 150,
  output_tokens: 300,
  response_time: 1200,
  cost: 0.006,
  user_id: "user_123",
  success: true,
  error: null,
});
```

#### `trackAIPerformance(data: AIPerformanceData)`

Tracks AI model performance metrics.

- **data.model**: The AI model used
- **data.provider**: The AI provider
- **data.accuracy**: Model accuracy score (0-1)
- **data.latency**: Average latency in milliseconds
- **data.throughput**: Requests per minute
- **data.user_id**: User identifier
- **data.timestamp**: Timestamp of the performance measurement

**Returns:** `Promise<{ success: boolean; id?: string }>`

```typescript
const result = await trackAIPerformance({
  model: "claude-3-sonnet",
  provider: "anthropic",
  accuracy: 0.92,
  latency: 800,
  throughput: 15,
  user_id: "user_123",
  timestamp: new Date().toISOString(),
});
```

#### `queryAIAnalytics(params: AIAnalyticsParams)`

Queries AI analytics data.

- **params.user_id** (optional): Filter by user ID
- **params.period** (optional): Time period (e.g., '7d', '30d', '90d')
- **params.model** (optional): Filter by AI model
- **params.provider** (optional): Filter by AI provider
- **params.start_date** (optional): Start date for custom range
- **params.end_date** (optional): End date for custom range

**Returns:** `Promise<{ data: any[]; error?: string }>`

```typescript
const result = await queryAIAnalytics({
  user_id: "user_123",
  period: "7d",
  model: "gpt-4",
});

if (result.error) {
  console.error("Query failed:", result.error);
} else {
  console.log("AI analytics:", result.data);
}
```

### Types

#### `AICallData`

```typescript
interface AICallData {
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  response_time: number;
  cost: number;
  user_id: string;
  success: boolean;
  error: string | null;
  timestamp?: string;
}
```

#### `AIPerformanceData`

```typescript
interface AIPerformanceData {
  model: string;
  provider: string;
  accuracy: number;
  latency: number;
  throughput: number;
  user_id: string;
  timestamp: string;
}
```

#### `AIAnalyticsParams`

```typescript
interface AIAnalyticsParams {
  user_id?: string;
  period?: string;
  model?: string;
  provider?: string;
  start_date?: string;
  end_date?: string;
}
```

## Available Datasources

### AI Calls

Tracks individual AI model calls and their metadata.

```typescript
interface AICallEvent {
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  response_time: number;
  cost: number;
  user_id: string;
  success: boolean;
  error: string | null;
  timestamp: string;
}
```

## Available Pipes

### AI Calls

Aggregates AI call data for analytics and reporting.

```typescript
const aiCalls = await queryAIAnalytics({
  user_id: "user_123",
  period: "7d",
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
tb push datasources/aiCall.datasource
```

### Pushing Pipes

```bash
# Push all pipes
tb push pipes

# Push specific pipe
tb push pipes/aiCalls.pipe

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
tb push datasources
tb push pipes
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
