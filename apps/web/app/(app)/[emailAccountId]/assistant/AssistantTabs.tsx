'use client';

import { XIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { History } from '@/app/(app)/[emailAccountId]/assistant/History';
import { Process } from '@/app/(app)/[emailAccountId]/assistant/Process';
import { Rules } from '@/app/(app)/[emailAccountId]/assistant/Rules';
import { RulesPrompt } from '@/app/(app)/[emailAccountId]/assistant/RulesPrompt';
import { RuleTab } from '@/app/(app)/[emailAccountId]/assistant/RuleTab';
import { TabsToolbar } from '@/components/TabsToolbar';
import { TypographyP } from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AssistantTabs() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="empty" className="flex h-full flex-col">
        <TabsToolbar className="shrink-0 border-none pb-0 shadow-none">
          <div className="w-full overflow-x-auto">
            <TabsList>
              {/* <TabsTrigger value="prompt">Prompt</TabsTrigger> */}
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          <CloseArtifactButton />
        </TabsToolbar>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="empty" className="mt-0 h-full">
            <div className="flex h-full items-center justify-center">
              <TypographyP className="max-w-sm px-4 text-center">
                Select a tab or add rules via the assistant
              </TypographyP>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="mt-0 h-full">
            <RulesPrompt />
          </TabsContent>
          <TabsContent value="rules" className="content-container pb-4">
            <Rules />
          </TabsContent>
          <TabsContent value="test" className="content-container pb-4">
            <Process />
          </TabsContent>
          <TabsContent value="history" className="content-container pb-4">
            <History />
          </TabsContent>
          {/* Set via search params. Not a visible tab. */}
          <TabsContent value="rule" className="content-container pb-4">
            <RuleTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function CloseArtifactButton() {
  const [_tab, setTab] = useQueryState('tab');

  const onClose = useCallback(() => setTab(null), [setTab]);

  return (
    <Button size="icon" variant="ghost" onClick={onClose}>
      <XIcon className="size-4" />
    </Button>
  );
}
