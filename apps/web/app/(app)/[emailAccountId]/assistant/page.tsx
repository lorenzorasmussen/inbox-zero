import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, lazy } from 'react';
import { PermissionsCheck } from '@/app/(app)/[emailAccountId]/PermissionsCheck';
import { LoadingContent } from '@/components/LoadingContent';
import { EmailProvider } from '@/providers/EmailProvider';
import { ASSISTANT_ONBOARDING_COOKIE } from '@/utils/cookies';
import { checkUserOwnsEmailAccount } from '@/utils/email-account';
import { prefixPath } from '@/utils/path';
import prisma from '@/utils/prisma';

// Lazy load the heavy Chat component to reduce initial bundle size
const Chat = lazy(() =>
  import('@/components/assistant-chat/chat').then((module) => ({
    default: module.Chat,
  }))
);

export const maxDuration = 300; // Applies to the actions

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  // onboarding redirect
  const cookieStore = await cookies();
  const viewedOnboarding =
    cookieStore.get(ASSISTANT_ONBOARDING_COOKIE)?.value === 'true';

  if (!viewedOnboarding) {
    const hasRule = await prisma.rule.findFirst({
      where: { emailAccountId },
      select: { id: true },
    });

    if (!hasRule) {
      redirect(prefixPath(emailAccountId, '/assistant?onboarding=true'));
    }
  }

  return (
    <EmailProvider>
      <Suspense>
        <PermissionsCheck />
      </Suspense>

      <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
        <Suspense
          fallback={
            <LoadingContent loading={true}>
              <div className="h-96" />
            </LoadingContent>
          }
        >
          <Chat />
        </Suspense>
      </div>
    </EmailProvider>
  );
}
