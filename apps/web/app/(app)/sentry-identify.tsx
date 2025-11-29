'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function SentryIdentify({ email }: { email: string }) {
  useEffect(() => {
    Sentry.setUser({ email });
  }, [email]);

  return null;
}
