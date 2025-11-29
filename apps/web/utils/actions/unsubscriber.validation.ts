import { z } from "zod";
import { NewsletterStatus } from "@/generated/prisma/enums";

export const setNewsletterStatusBody = z.object({
  newsletterEmail: z.string().email(),
  status: z.nativeEnum(NewsletterStatus).nullable(),
  unsubscribeLink: z.string().optional(),
});
export type SetNewsletterStatusBody = z.infer<typeof setNewsletterStatusBody>;
