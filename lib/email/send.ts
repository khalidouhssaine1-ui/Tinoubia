import "server-only";
import { sendViaResend } from "@/lib/email/resend";
import { sendViaGmail } from "@/lib/email/gmail";
import { sendTransactionalEmail as sendViaSendPulse } from "@/lib/email/sendpulse";

interface SendEmailInput {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}

/**
 * Server-side email dispatch, in order of preference:
 *  1. Resend — simplest hosted API.
 *  2. Gmail SMTP — uses the agency's own Gmail + App Password.
 *  3. SendPulse — legacy fallback.
 * Returns true only if a provider actually accepted the message. FormSubmit is
 * intentionally NOT here — its Cloudflare protection blocks datacenter IPs, so
 * it can only run from the visitor's browser (see the client fallback in the
 * enquiry/contact forms). When this returns false, the client sends via
 * FormSubmit instead. The lead is stored in the DB regardless.
 */
export async function sendNotificationEmail(input: SendEmailInput): Promise<boolean> {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(input);
    return true;
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    await sendViaGmail(input);
    return true;
  }
  const result = await sendViaSendPulse(input);
  return !(result && "skipped" in result);
}
