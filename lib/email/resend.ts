import "server-only";

const RESEND_URL = "https://api.resend.com/emails";

interface SendEmailInput {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}

/**
 * Sends via the Resend REST API (no SDK dependency). On Resend's free tier
 * without a verified domain you can send from `onboarding@resend.dev` to the
 * account owner's own address — which is exactly our notification use case.
 * Once a domain is verified, set RESEND_FROM to e.g. "Tinoubia <no-reply@yourdomain.com>".
 */
export async function sendViaResend({ to, subject, html }: SendEmailInput) {
  const from = process.env.RESEND_FROM || "Tinoubia Immobilier <onboarding@resend.dev>";

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: to.map((t) => t.email),
      subject,
      html,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as { id: string };
}
