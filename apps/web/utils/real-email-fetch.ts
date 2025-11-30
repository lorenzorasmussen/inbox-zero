// Real email fetching and storage system
// This pulls actual emails from Gmail/Outlook and stores them in the database

export async function fetchRealEmails(emailAccountId: string, batchSize = 50) {
  try {
    console.log(
      `📥 Fetching ${batchSize} real emails for account ${emailAccountId}...`
    );

    // Dynamic imports to avoid circular dependencies
    const { prisma } = await import('@/utils/prisma');
    const { createEmailProvider } = await import('@/utils/email/provider');
    const { createScopedLogger } = await import('@/utils/logger');

    // Get email account details
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
      select: {
        email: true,
        provider: true,
      },
    });

    if (!emailAccount) {
      throw new Error('Email account not found');
    }

    // Create email provider
    const logger = createScopedLogger('email-fetch');
    const provider = await createEmailProvider({
      emailAccountId,
      provider: emailAccount.provider,
      logger,
    });

    // Fetch recent emails from inbox
    const messages = await provider.getMessages({
      limit: batchSize,
      labelId: 'INBOX',
      includeAttachments: false,
    });

    console.log(
      `📨 Retrieved ${messages.length} emails from ${emailAccount.provider}`
    );

    // Store emails in database
    const storedEmails = [];
    for (const message of messages) {
      try {
        // Check if message already exists
        const existingMessage = await prisma.message.findUnique({
          where: { id: message.id },
        });

        if (!existingMessage) {
          // Store message
          const storedMessage = await prisma.message.create({
            data: {
              id: message.id,
              threadId: message.threadId || message.id,
              subject: message.subject || 'No Subject',
              from: message.from?.email || 'unknown@example.com',
              to: Array.isArray(message.to)
                ? message.to.map((t: any) => t.email).join(', ')
                : message.to?.email || '',
              date: new Date(message.date || Date.now()),
              text: message.text || '',
              html: message.html || null,
              snippet: message.snippet || '',
              labels: message.labels || [],
              emailAccountId,
            },
          });

          // Update or create thread
          await prisma.thread.upsert({
            where: { id: message.threadId || message.id },
            update: {
              lastMessageDate: new Date(message.date || Date.now()),
              messageCount: {
                increment: 1,
              },
            },
            create: {
              id: message.threadId || message.id,
              emailAccountId,
              lastMessageDate: new Date(message.date || Date.now()),
              messageCount: 1,
            },
          });

          storedEmails.push(storedMessage);
        }
      } catch (error) {
        console.error(`Failed to store message ${message.id}:`, error);
      }
    }

    console.log(`✅ Stored ${storedEmails.length} new emails in database`);
    return storedEmails;
  } catch (error) {
    console.error('❌ Failed to fetch real emails:', error);
    throw error;
  }
}

export async function getStoredEmails(emailAccountId: string, limit = 100) {
  try {
    const { prisma } = await import('@/utils/prisma');

    const emails = await prisma.message.findMany({
      where: { emailAccountId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        thread: true,
      },
    });

    console.log(`📚 Retrieved ${emails.length} emails from database`);
    return emails;
  } catch (error) {
    console.error('❌ Failed to get stored emails:', error);
    throw error;
  }
}

export async function processEmailsWithAI(emailIds: string[]) {
  try {
    console.log(`🤖 Processing ${emailIds.length} emails with AI...`);

    const { prisma } = await import('@/utils/prisma');

    for (const emailId of emailIds) {
      try {
        // Get email content
        const email = await prisma.message.findUnique({
          where: { id: emailId },
          select: {
            id: true,
            subject: true,
            text: true,
            from: true,
            snippet: true,
          },
        });

        if (!email) continue;

        // AI processing logic
        const aiResult = {
          category: categorizeEmail(email),
          priority: assessPriority(email),
          sentiment: analyzeSentiment(email),
          suggestedActions: suggestActions(email),
        };

        // Store AI results (assuming you have an aiProcessingResult table)
        // For now, we'll just log the results
        console.log(`✅ Processed email ${emailId}:`, aiResult);
      } catch (error) {
        console.error(`❌ Failed to process email ${emailId}:`, error);
      }
    }

    console.log(`🎉 Completed AI processing for ${emailIds.length} emails`);
  } catch (error) {
    console.error('❌ Failed to process emails with AI:', error);
    throw error;
  }
}

// AI Helper functions
function categorizeEmail(email: any): string {
  const subject = email.subject?.toLowerCase() || '';
  const from = email.from?.toLowerCase() || '';
  const text = email.text?.toLowerCase() || '';

  if (
    subject.includes('invoice') ||
    subject.includes('receipt') ||
    text.includes('payment')
  ) {
    return 'finance';
  }
  if (
    from.includes('linkedin') ||
    from.includes('job') ||
    subject.includes('career')
  ) {
    return 'career';
  }
  if (
    subject.includes('newsletter') ||
    from.includes('medium.com') ||
    from.includes('substack')
  ) {
    return 'newsletter';
  }
  if (
    subject.includes('meeting') ||
    subject.includes('calendar') ||
    text.includes('schedule')
  ) {
    return 'calendar';
  }

  return 'personal';
}

function assessPriority(email: any): string {
  const subject = email.subject?.toLowerCase() || '';
  const from = email.from?.toLowerCase() || '';

  if (
    subject.includes('urgent') ||
    subject.includes('important') ||
    from.includes('boss') ||
    from.includes('manager')
  ) {
    return 'high';
  }
  if (subject.includes('meeting') || subject.includes('deadline')) {
    return 'medium';
  }

  return 'low';
}

function analyzeSentiment(email: any): string {
  const text = email.text?.toLowerCase() || '';
  const positiveWords = ['thank', 'great', 'excellent', 'awesome', 'good'];
  const negativeWords = ['problem', 'issue', 'error', 'fail', 'urgent'];

  const positiveCount = positiveWords.filter((word) =>
    text.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    text.includes(word)
  ).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function suggestActions(email: any): string[] {
  const actions = [];
  const category = categorizeEmail(email);

  switch (category) {
    case 'finance':
      actions.push('archive', 'label');
      break;
    case 'newsletter':
      actions.push('unsubscribe', 'archive');
      break;
    case 'career':
      actions.push('read', 'save');
      break;
    case 'calendar':
      actions.push('calendar', 'archive');
      break;
    default:
      actions.push('read', 'archive');
  }

  return actions;
}
