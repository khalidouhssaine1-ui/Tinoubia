/**
 * Client-side FormSubmit notification. Runs in the visitor's browser (a real
 * browser passes FormSubmit's Cloudflare bot check, which server/datacenter
 * IPs fail). Best-effort: the lead is already stored server-side, so a failure
 * here never blocks the user. Target inbox comes from a public env var.
 */
export async function notifyViaFormSubmit(subject: string, fields: Record<string, string>) {
  const email = process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL;
  if (!email) return;
  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _template: "table", ...fields }),
    });
  } catch {
    // best-effort notification
  }
}
