import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createContact,
  deleteContact,
  startedTrial,
  completedTrial,
  switchedPremiumPlan,
  cancelledPremium,
  updateContactRole,
  updateContactCompanySize,
} from './loops';

// Mock the loops module
vi.mock('loops', () => ({
  LoopsClient: vi.fn().mockImplementation(() => ({
    createContact: vi.fn(),
    deleteContact: vi.fn(),
    sendEvent: vi.fn(),
    updateContact: vi.fn(),
  })),
}));

describe('Loops', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createContact', () => {
    it('should return success: false when LOOPS_API_SECRET is not set', async () => {
      delete process.env.LOOPS_API_SECRET;
      const result = await createContact('test@example.com');
      expect(result).toEqual({ success: false });
    });

    it('should create contact with minimal parameters', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.createContact.mockResolvedValue({ success: true, id: '123' });

      const result = await createContact('test@example.com');

      expect(result).toEqual({ success: true, id: '123' });
      expect(mockClient.createContact).toHaveBeenCalledWith({
        email: 'test@example.com',
        properties: {},
      });
    });

    it('should create contact with all parameters', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.createContact.mockResolvedValue({ success: true, id: '123' });

      const result = await createContact('test@example.com', 'John', 'google');

      expect(result).toEqual({ success: true, id: '123' });
      expect(mockClient.createContact).toHaveBeenCalledWith({
        email: 'test@example.com',
        properties: { firstName: 'John', provider: 'google' },
      });
    });
  });

  describe('deleteContact', () => {
    it('should return success: false when LOOPS_API_SECRET is not set', async () => {
      delete process.env.LOOPS_API_SECRET;
      const result = await deleteContact('test@example.com');
      expect(result).toEqual({ success: false });
    });

    it('should delete contact successfully', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.deleteContact.mockResolvedValue({ success: true });

      const result = await deleteContact('test@example.com');

      expect(result).toEqual({ success: true });
      expect(mockClient.deleteContact).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });

  describe('startedTrial', () => {
    it('should send started trial event', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.sendEvent.mockResolvedValue({ success: true });

      const result = await startedTrial('test@example.com', 'premium');

      expect(result).toEqual({ success: true });
      expect(mockClient.sendEvent).toHaveBeenCalledWith({
        eventName: 'upgraded',
        email: 'test@example.com',
        contactProperties: { tier: 'premium' },
        eventProperties: { tier: 'premium' },
      });
    });
  });

  describe('completedTrial', () => {
    it('should send completed trial event', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.sendEvent.mockResolvedValue({ success: true });

      const result = await completedTrial('test@example.com', 'premium');

      expect(result).toEqual({ success: true });
      expect(mockClient.sendEvent).toHaveBeenCalledWith({
        eventName: 'completed_trial',
        email: 'test@example.com',
        contactProperties: { tier: 'premium' },
        eventProperties: { tier: 'premium' },
      });
    });
  });

  describe('switchedPremiumPlan', () => {
    it('should send switched premium plan event', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.sendEvent.mockResolvedValue({ success: true });

      const result = await switchedPremiumPlan(
        'test@example.com',
        'enterprise'
      );

      expect(result).toEqual({ success: true });
      expect(mockClient.sendEvent).toHaveBeenCalledWith({
        eventName: 'switched_premium_plan',
        email: 'test@example.com',
        contactProperties: { tier: 'enterprise' },
        eventProperties: { tier: 'enterprise' },
      });
    });
  });

  describe('cancelledPremium', () => {
    it('should send cancelled event', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.sendEvent.mockResolvedValue({ success: true });

      const result = await cancelledPremium('test@example.com');

      expect(result).toEqual({ success: true });
      expect(mockClient.sendEvent).toHaveBeenCalledWith({
        eventName: 'cancelled',
        email: 'test@example.com',
        contactProperties: { tier: '' },
      });
    });
  });

  describe('updateContactRole', () => {
    it('should update contact role', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.updateContact.mockResolvedValue({ success: true });

      const result = await updateContactRole({
        email: 'test@example.com',
        role: 'admin',
      });

      expect(result).toEqual({ success: true });
      expect(mockClient.updateContact).toHaveBeenCalledWith({
        email: 'test@example.com',
        properties: { role: 'admin' },
      });
    });
  });

  describe('updateContactCompanySize', () => {
    it('should update contact company size', async () => {
      process.env.LOOPS_API_SECRET = 'test-secret';
      const { LoopsClient } = await import('loops');
      const mockClient = LoopsClient.mock.results[0].value;

      mockClient.updateContact.mockResolvedValue({ success: true });

      const result = await updateContactCompanySize({
        email: 'test@example.com',
        companySize: 100,
      });

      expect(result).toEqual({ success: true });
      expect(mockClient.updateContact).toHaveBeenCalledWith({
        email: 'test@example.com',
        properties: { companySize: 100 },
      });
    });
  });
});
