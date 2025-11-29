import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tb } from './client';

// Mock the @chronark/zod-bird module
vi.mock('@chronark/zod-bird', () => ({
  Tinybird: vi.fn().mockImplementation(() => ({
    // Mock Tinybird client methods here
  })),
}));

describe('Tinybird Client', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create Tinybird client with environment variables', () => {
    process.env.TINYBIRD_TOKEN = 'test-token';
    process.env.TINYBIRD_BASE_URL = 'https://api.tinybird.co';

    // Re-import to get fresh instance with mocked environment
    vi.resetModules();
    const { tb: client } = require('./client');

    expect(client).toBeDefined();
  });

  it('should require TINYBIRD_TOKEN', () => {
    delete process.env.TINYBIRD_TOKEN;

    expect(() => {
      vi.resetModules();
      require('./client');
    }).toThrow();
  });
});
