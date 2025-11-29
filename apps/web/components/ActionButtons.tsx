import {
  ArchiveIcon,
  ExternalLinkIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ButtonGroup } from '@/components/ButtonGroup';
import { LoadingMiniSpinner } from '@/components/Loading';
import { useAccount } from '@/providers/EmailAccountProvider';
import { onTrashThread } from '@/utils/actions/client';
import { isGoogleProvider } from '@/utils/email/provider-types';
import { getGmailUrl } from '@/utils/url';

export function ActionButtons({
  threadId,
  onArchive,
  onPlanAiAction,
  isPlanning,
  refetch,
  shadow,
}: {
  threadId: string;
  isPlanning: boolean;
  shadow?: boolean;
  onPlanAiAction: () => void;
  onArchive: () => void;
  refetch: (threadId?: string) => void;
}) {
  const { emailAccountId, userEmail, provider } = useAccount();

  const openInGmail = useCallback(() => {
    // open in gmail
    const url = getGmailUrl(threadId, userEmail);
    window.open(url, '_blank');
  }, [threadId, userEmail]);

  const [isTrashing, setIsTrashing] = useState(false);

  // TODO lift this up to the parent component to be consistent / to support bulk trash
  // TODO show loading toast
  const onTrash = useCallback(async () => {
    setIsTrashing(true);
    await onTrashThread({ emailAccountId, threadId });
    refetch(threadId);
    setIsTrashing(false);
  }, [threadId, refetch, emailAccountId]);

  const buttons = useMemo(
    () => [
      ...(isGoogleProvider(provider)
        ? [
            {
              tooltip: 'Open in Gmail',
              onClick: openInGmail,
              icon: <ExternalLinkIcon className="size-4" aria-hidden="true" />,
            },
          ]
        : []),
      {
        tooltip: 'Process with assistant',
        onClick: onPlanAiAction,
        icon: isPlanning ? (
          <LoadingMiniSpinner />
        ) : (
          <SparklesIcon className="size-4" aria-hidden="true" />
        ),
      },
      {
        tooltip: 'Archive',
        onClick: onArchive,
        icon: <ArchiveIcon className="size-4" aria-hidden="true" />,
      },
      // may remove later
      {
        tooltip: 'Delete',
        onClick: onTrash,
        icon: isTrashing ? (
          <LoadingMiniSpinner />
        ) : (
          <Trash2Icon className="size-4" aria-hidden="true" />
        ),
      },
    ],
    [
      onTrash,
      isTrashing,
      onArchive,
      onPlanAiAction,
      isPlanning,
      openInGmail,
      provider,
    ]
  );

  return <ButtonGroup buttons={buttons} shadow={shadow} />;
}
