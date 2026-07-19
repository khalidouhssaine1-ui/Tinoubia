import "server-only";

const SENDPULSE_OAUTH_URL = "https://api.sendpulse.com/oauth/access_token";
const SENDPULSE_SMTP_URL = "https://api.sendpulse.com/smtp/emails";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const res = await fetch(SENDPULSE_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.SENDPULSE_API_USER_ID,
      client_secret: process.env.SENDPULSE_API_SECRET,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SendPulse OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

interface SendEmailInput {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}

export async function sendTransactionalEmail({ to, subject, html }: SendEmailInput) {
  if (!process.env.SENDPULSE_API_USER_ID || !process.env.SENDPULSE_API_SECRET) {
    console.warn(
      "[sendpulse] SENDPULSE_API_USER_ID / SENDPULSE_API_SECRET not configured — skipping email send.",
      { subject, to },
    );
    return { skipped: true as const };
  }

  const token = await getAccessToken();

  const res = await fetch(SENDPULSE_SMTP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: {
        html: Buffer.from(html, "utf-8").toString("base64"),
        text: html.replace(/<[^>]+>/g, " "),
        subject,
        from: {
          name: process.env.SENDPULSE_SENDER_NAME || "Tinoubia Immobilier",
          email: process.env.SENDPULSE_SENDER_EMAIL,
        },
        to,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SendPulse send failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as { result: boolean; id?: string };
}
