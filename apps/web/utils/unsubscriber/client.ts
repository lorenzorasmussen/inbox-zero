import { env } from '@/env';
import { createScopedLogger } from '@/utils/logger';

const logger = createScopedLogger('unsubscriber-client');

export async function autoUnsubscribe(url: string): Promise<boolean> {
  if (!env.UNSUBSCRIBER_URL) {
    logger.warn('UNSUBSCRIBER_URL not set, skipping auto-unsubscribe');
    return false;
  }

  try {
    const response = await fetch(`${env.UNSUBSCRIBER_URL}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Failed to auto-unsubscribe', {
        status: response.status,
        error,
        url,
      });
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    logger.error('Error calling unsubscriber service', {
      error: error instanceof Error ? error.message : String(error),
      url,
    });
    return false;
  }
}
