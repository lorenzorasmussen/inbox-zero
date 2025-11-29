import type React from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import { Loading } from './Loading';

interface LoadingContentProps {
  loading: boolean;
  loadingComponent?: React.ReactNode;
  error?: { info?: { error: string }; error?: string };
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingContent(props: LoadingContentProps) {
  if (props.error) {
    return props.errorComponent ? (
      props.errorComponent
    ) : (
      <div className="mt-4">
        <ErrorDisplay error={props.error} />
      </div>
    );
  }

  if (props.loading) return <>{props.loadingComponent || <Loading />}</>;

  return <>{props.children}</>;
}
