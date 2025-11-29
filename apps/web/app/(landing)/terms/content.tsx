'use client';

import { LegalPage } from '@/components/LegalPage';
import Content from './content.mdx';

export function TermsContent() {
  return (
    <LegalPage
      date="2023-07-16"
      title="Terms of Service"
      content={<Content />}
    />
  );
}
