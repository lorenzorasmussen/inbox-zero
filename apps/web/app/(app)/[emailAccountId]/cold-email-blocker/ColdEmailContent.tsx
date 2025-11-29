'use client';

import Link from 'next/link';
import { ColdEmailList } from '@/app/(app)/[emailAccountId]/cold-email-blocker/ColdEmailList';
import { ColdEmailRejected } from '@/app/(app)/[emailAccountId]/cold-email-blocker/ColdEmailRejected';
import { ColdEmailTest } from '@/app/(app)/[emailAccountId]/cold-email-blocker/ColdEmailTest';
import { MessageText } from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from '@/providers/EmailAccountProvider';
import { prefixPath } from '@/utils/path';

export function ColdEmailContent({ searchParam }: { searchParam?: string }) {
  const { emailAccountId } = useAccount();

  return (
    <Tabs defaultValue="test" searchParam={searchParam}>
      <TabsList>
        <TabsTrigger value="test">Test</TabsTrigger>
        <TabsTrigger value="cold-emails">Cold Emails</TabsTrigger>
        <TabsTrigger value="rejected">Marked Not Cold</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="test" className="mb-10">
        <ColdEmailTest />
      </TabsContent>

      <TabsContent value="cold-emails" className="mb-10">
        <Card>
          <ColdEmailList />
        </Card>
      </TabsContent>
      <TabsContent value="rejected" className="mb-10">
        <Card>
          <ColdEmailRejected />
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="mb-10">
        <MessageText className="my-4">
          To manage cold email settings, go to the Assistant Rules tab and click
          Edit on the Cold Email rule.
        </MessageText>
        <Button asChild variant="outline">
          <Link href={prefixPath(emailAccountId, '/automation?tab=rules')}>
            Go to Assistant Rules
          </Link>
        </Button>
      </TabsContent>
    </Tabs>
  );
}
