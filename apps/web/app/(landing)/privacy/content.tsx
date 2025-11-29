'use client';

import { LegalPage } from '@/components/LegalPage';
import Content from './content.mdx';

export function PrivacyContent() {
  return (
    <LegalPage date="2023-12-20" title="Privacy Policy" content={<Content />} />
  );
}
