import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  // Mock process.env for testing
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3001');

  // Mock global APIs
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3001',
      origin: 'http://localhost:3001',
    },
    writable: true,
  });
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Restore original environment
  vi.unstubAllEnvs();
});
