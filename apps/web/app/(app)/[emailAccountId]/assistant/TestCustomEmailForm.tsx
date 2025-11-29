'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SparklesIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { ResultsDisplay } from '@/app/(app)/[emailAccountId]/assistant/ResultDisplay';
import { Input } from '@/components/Input';
import { toastError } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from '@/providers/EmailAccountProvider';
import { testAiCustomContentAction } from '@/utils/actions/ai-rule';
import {
  type TestAiCustomContentBody,
  testAiCustomContentBody,
} from '@/utils/actions/ai-rule.validation';
import type { RunRulesResult } from '@/utils/ai/choose-rule/run-rules';

export const TestCustomEmailForm = () => {
  const [testResults, setTestResult] = useState<RunRulesResult[]>();
  const { emailAccountId } = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestAiCustomContentBody>({
    resolver: zodResolver(testAiCustomContentBody),
  });

  const onSubmit: SubmitHandler<TestAiCustomContentBody> = useCallback(
    async (data) => {
      const result = await testAiCustomContentAction(emailAccountId, data);
      if (result?.serverError) {
        toastError({
          title: 'Error testing email',
          description: result.serverError,
        });
      } else {
        setTestResult(result?.data);
      }
    },
    [emailAccountId]
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input
          type="text"
          autosizeTextarea
          rows={3}
          name="content"
          placeholder="Paste in email content or write your own. e.g. Receipt from Stripe for $49"
          registerProps={register('content', { required: true })}
          error={errors.content}
        />
        <Button type="submit" loading={isSubmitting} size="sm">
          <SparklesIcon className="mr-2 size-4" />
          Test
        </Button>
      </form>
      {testResults && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsDisplay results={testResults} showFullContent={true} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
