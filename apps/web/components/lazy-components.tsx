'use client';

import { lazy, Suspense } from 'react';
import { LoadingContent } from '@/components/LoadingContent';

// Lazy load heavy components to reduce initial bundle size
export const LazyRichTextEditor = lazy(() =>
  import('@/components/editor/SimpleRichTextEditor').then((module) => ({
    default: module.SimpleRichTextEditor,
  }))
);

export const LazyChat = lazy(() =>
  import('@/components/assistant-chat/chat').then((module) => ({
    default: module.Chat,
  }))
);

export const LazyEmailViewer = lazy(() =>
  import('@/components/EmailViewer').then((module) => ({
    default: module.EmailViewer,
  }))
);

// Wrapper component with loading fallback
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <LoadingContent loading={true}>
            <div className="h-32" />
          </LoadingContent>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Preload functions for critical components
export const preloadRichTextEditor = () =>
  import('@/components/editor/SimpleRichTextEditor');

export const preloadChat = () => import('@/components/assistant-chat/chat');

export const preloadEmailViewer = () => import('@/components/EmailViewer');
