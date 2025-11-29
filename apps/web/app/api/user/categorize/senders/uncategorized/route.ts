import { NextResponse } from 'next/server';
import { getUncategorizedSenders } from '@/app/api/user/categorize/senders/uncategorized/get-uncategorized-senders';
import { withEmailAccount } from '@/utils/middleware';

export type UncategorizedSendersResponse = {
  uncategorizedSenders: string[];
  nextOffset?: number;
};

export const GET = withEmailAccount(
  'user/categorize/senders/uncategorized',
  async (request) => {
    const emailAccountId = request.auth.emailAccountId;

    const url = new URL(request.url);
    const offset = Number.parseInt(url.searchParams.get('offset') || '0');

    const result = await getUncategorizedSenders({
      emailAccountId,
      offset,
    });

    return NextResponse.json(result);
  }
);
