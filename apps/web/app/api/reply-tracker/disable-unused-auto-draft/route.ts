import { NextResponse } from 'next/server';
import { hasPostCronSecret } from '@/utils/cron';
import { captureException } from '@/utils/error';
import { withError } from '@/utils/middleware';
import { disableUnusedAutoDrafts } from './disable-unused-auto-drafts';

export const maxDuration = 300;

export const POST = withError(async (request) => {
  if (!(await hasPostCronSecret(request))) {
    captureException(
      new Error('Unauthorized cron request: api/auto-draft/disable-unused')
    );
    return new Response('Unauthorized', { status: 401 });
  }

  const results = await disableUnusedAutoDrafts();
  return NextResponse.json(results);
});
