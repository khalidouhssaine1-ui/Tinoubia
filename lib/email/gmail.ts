import "server-only";
import nodemailer from "nodemailer";

interface SendEmailInput {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}

/**
 * Sends via the agency's own Gmail using an App Password (SMTP). Uses the
 * account the agency already owns — no new provider signup, and mail goes
 * Gmail → inbox so it lands reliably. Requires 2-Step Verification + an
 * App Password (GMAIL_USER / GMAIL_APP_PASSWORD).
 */
export async function sendViaGmail({ to, subject, html }: SendEmailInput) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Gmail SMTP not configured");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const senderName = process.env.SENDPULSE_SENDER_NAME || "Tinoubia Immobilier";

  return transporter.sendMail({
    from: `"${senderName}" <${user}>`,
    to: to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(", "),
    subject,
    html,
  });
}
