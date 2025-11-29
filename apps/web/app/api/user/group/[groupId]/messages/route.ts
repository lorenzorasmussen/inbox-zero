import { NextResponse } from 'next/server';
import { getGroupEmails } from '@/app/api/user/group/[groupId]/messages/controller';
import { withEmailProvider } from '@/utils/middleware';

export const GET = withEmailProvider(
  'user/group/messages',
  async (request, { params }) => {
    const emailAccountId = request.auth.emailAccountId;

    const { groupId } = await params;
    if (!groupId) return NextResponse.json({ error: 'Missing group id' });

    const { messages } = await getGroupEmails({
      provider: request.emailProvider.name,
      groupId,
      emailAccountId,
      from: undefined,
      to: undefined,
      pageToken: '',
    });

    return NextResponse.json({ messages });
  }
);
