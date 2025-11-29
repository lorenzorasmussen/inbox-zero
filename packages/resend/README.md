# @inboxzero/resend

[![npm version](https://badge.fury.io/js/@inboxzero%2Fresend.svg)](https://badge.fury.io/js/@inboxzero%2Fresend)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/inboxzero/inbox-zero-google-migration)
[![TypeScript](https://img.shields.io/badge/types-supported-blue.svg)](https://www.typescriptlang.org/)

A TypeScript wrapper for the [Resend](https://resend.com) email service, designed specifically for InboxZero's transactional email workflows with React Email templates.

## Features

- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **React Email Integration**: Built-in support for React Email templates
- ✅ **Contact Management**: Manage email contacts and lists
- ✅ **Email Templates**: Pre-built templates for common use cases
- ✅ **Development Environment**: Local email preview and testing
- ✅ **Test Coverage**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @inboxzero/resend
# or
pnpm add @inboxzero/resend
# or
yarn add @inboxzero/resend
```

## Environment Setup

Set up your Resend API key as an environment variable:

```bash
# .env.local
RESEND_API_KEY=your_resend_api_key_here
```

## Usage

### Sending Emails

```typescript
import { sendEmail } from "@inboxzero/resend";

// Send a basic email
const result = await sendEmail({
  to: "user@example.com",
  subject: "Welcome to InboxZero",
  html: "<h1>Welcome!</h1><p>Thanks for joining us.</p>",
});
```

### Using React Email Templates

```typescript
import { DigestEmail, InvitationEmail, SummaryEmail } from '@inboxzero/resend/emails';
import { render } from '@react-email/render';

// Send digest email
const digestHtml = await render(<DigestEmail data={digestData} />);
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Weekly Digest',
  html: digestHtml
});

// Send invitation email
const invitationHtml = await render(<InvitationEmail data={invitationData} />);
await sendEmail({
  to: 'user@example.com',
  subject: 'You\'re Invited!',
  html: invitationHtml
});

// Send summary email
const summaryHtml = await render(<SummaryEmail data={summaryData} />);
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Account Summary',
  html: summaryHtml
});
```

### Managing Contacts

```typescript
import { createContact, updateContact, deleteContact } from "@inboxzero/resend";

// Create a new contact
const contact = await createContact({
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
});

// Update a contact
await updateContact(contact.id, {
  firstName: "Jonathan",
});

// Delete a contact
await deleteContact(contact.id);
```

## Available Email Templates

### Digest Email

Weekly digest email template for summarizing user activity and insights.

```typescript
interface DigestData {
  user: {
    name: string;
    email: string;
  };
  stats: {
    emailsProcessed: number;
    timeSaved: number;
    categories: Array<{
      name: string;
      count: number;
    }>;
  };
  insights: Array<{
    title: string;
    description: string;
  }>;
}

const digestHtml = await render(<DigestEmail data={digestData} />);
```

### Invitation Email

Invitation email template for referring new users.

```typescript
interface InvitationData {
  inviter: {
    name: string;
    email: string;
  };
  invitee: {
    name: string;
    email: string;
  };
  referralLink: string;
  message?: string;
}

const invitationHtml = await render(<InvitationEmail data={invitationData} />);
```

### Summary Email

Account summary email template for monthly reports.

```typescript
interface SummaryData {
  user: {
    name: string;
    email: string;
    plan: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    emailsProcessed: number;
    categoriesOrganized: number;
    timeSaved: number;
    accuracy: number;
  };
}

const summaryHtml = await render(<SummaryEmail data={summaryData} />);
```

## Development

### Running Email Previews Locally

```bash
# Start the email preview server
pnpm dev
```

Then visit http://localhost:3010/ to view email previews.

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

## API Reference

### Functions

#### `sendEmail(options)`

Sends an email using Resend.

- **options.to**: Recipient email address
- **options.subject**: Email subject
- **options.html**: Email HTML content
- **options.from** (optional): Sender email (defaults to your verified domain)
- **options.cc** (optional): CC recipients
- **options.bcc** (optional): BCC recipients
- **options.replyTo** (optional): Reply-to address

**Returns:** `Promise<{ success: boolean; id?: string }>`

#### `createContact(data)`

Creates a new contact.

- **data.email**: Contact email address
- **data.firstName** (optional): First name
- **data.lastName** (optional): Last name

**Returns:** `Promise<Contact>`

#### `updateContact(id, data)`

Updates an existing contact.

- **id**: Contact ID
- **data**: Updated contact data

**Returns:** `Promise<Contact>`

#### `deleteContact(id)`

Deletes a contact.

- **id**: Contact ID

**Returns:** `Promise<boolean>`

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
