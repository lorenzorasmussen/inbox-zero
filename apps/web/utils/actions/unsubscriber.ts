"use server";

import prisma from "@/utils/prisma";
import { setNewsletterStatusBody } from "@/utils/actions/unsubscriber.validation";
import { extractEmailAddress } from "@/utils/email";
import { actionClient } from "@/utils/actions/safe-action";

import { autoUnsubscribe } from "@/utils/unsubscriber/client";

export const setNewsletterStatusAction = actionClient
  .metadata({ name: "setNewsletterStatus" })
  .inputSchema(setNewsletterStatusBody)
  .action(
    async ({
      parsedInput: { newsletterEmail, status, unsubscribeLink },
      ctx: { emailAccountId },
    }) => {
      const email = extractEmailAddress(newsletterEmail);

      if (status === NewsletterStatus.UNSUBSCRIBED && unsubscribeLink) {
        // Fire and forget - don't wait for it
        autoUnsubscribe(unsubscribeLink).catch((error) => {
          // biome-ignore lint/suspicious/noConsole: Self-hosted environment logging
          console.error("Auto-unsubscribe error:", error);
        });
      }

      return await prisma.newsletter.upsert({
        where: {
          email_emailAccountId: { email, emailAccountId },
        },
        create: {
          status,
          email,
          emailAccountId,
        },
        update: { status },
      });
    },
  );
