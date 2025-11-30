import { NextRequest, NextResponse } from 'next/server';
import { fetchRealEmails } from '@/utils/real-email-fetch';
import { auth } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailAccountId, batchSize = 50 } = await request.json();

    if (!emailAccountId) {
      return NextResponse.json(
        { error: 'emailAccountId is required' },
        { status: 400 }
      );
    }

    console.log(
      `🚀 Starting email fetch for account ${emailAccountId}, batch size: ${batchSize}`
    );

    // Fetch real emails
    const emails = await fetchRealEmails(emailAccountId, batchSize);

    console.log(`✅ Successfully fetched and stored ${emails.length} emails`);

    return NextResponse.json({
      success: true,
      emailsFetched: emails.length,
      emails: emails.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emailAccountId = searchParams.get('emailAccountId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!emailAccountId) {
      return NextResponse.json(
        { error: 'emailAccountId is required' },
        { status: 400 }
      );
    }

    // Get stored emails
    const { getStoredEmails } = await import('@/utils/real-email-fetch');
    const emails = await getStoredEmails(emailAccountId, limit);

    return NextResponse.json({
      success: true,
      emailsCount: emails.length,
      emails: emails.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date,
        snippet: email.snippet,
      })),
    });
  } catch (error) {
    console.error('❌ Error getting emails:', error);
    return NextResponse.json(
      { error: 'Failed to get emails', details: error.message },
      { status: 500 }
    );
  }
}
