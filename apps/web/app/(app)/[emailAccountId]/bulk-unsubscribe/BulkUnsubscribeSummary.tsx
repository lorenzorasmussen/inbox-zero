'use client';

import { ArchiveIcon, BadgeCheckIcon, UserRoundMinusIcon } from 'lucide-react';
import useSWR from 'swr';
import type { NewsletterSummaryResponse } from '@/app/api/user/stats/newsletters/summary/route';
import { LoadingContent } from '@/components/LoadingContent';
import { StatsCards } from '@/components/StatsCards';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsletterStatus } from '@/generated/prisma/enums';
import { formatStat } from '@/utils/stats';

export function BulkUnsubscribeSummary() {
  const { data, isLoading, error } = useSWR<
    NewsletterSummaryResponse,
    { error: string }
  >('/api/user/stats/newsletters/summary', {
    keepPreviousData: true,
  });

  return (
    <LoadingContent
      loading={!data && isLoading}
      error={error}
      loadingComponent={<Skeleton className="h-24 rounded" />}
    >
      <StatsCards
        stats={[
          {
            name: 'Unsubscribes',
            value: formatStat(
              data?.result?.[NewsletterStatus.UNSUBSCRIBED] || 0
            ),
            subvalue: 'emails',
            icon: <UserRoundMinusIcon className="h-4 w-4" />,
          },
          {
            name: 'Skip Inbox',
            value: formatStat(
              data?.result?.[NewsletterStatus.AUTO_ARCHIVED] || 0
            ),
            subvalue: 'emails',
            icon: <ArchiveIcon className="h-4 w-4" />,
          },
          {
            name: 'Approved',
            value: formatStat(data?.result?.[NewsletterStatus.APPROVED] || 0),
            subvalue: 'emails',
            icon: <BadgeCheckIcon className="h-4 w-4" />,
          },
        ]}
      />
    </LoadingContent>
  );
}
