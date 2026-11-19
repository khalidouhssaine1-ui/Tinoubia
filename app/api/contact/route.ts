import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/validations/contact.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";
import { sendNotificationEmail } from "@/lib/email/send";
import { contactNotificationHtml } from "@/lib/email/templates";
import { formatDate } from "@/lib/utils";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hmounayt17@gmail.com";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.flatten() }, { status: 400 });
  }

  const values = parsed.data;

  if (values.company) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("leads").insert({
    property_id: null,
    full_name: values.fullName,
    phone: values.phone,
    email: values.email,
    preferred_contact: "email",
    message: values.message,
    source: "contact_page",
    ip_address: ip,
  });

  if (insertError) {
    console.error("[contact] failed to insert lead", insertError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  let emailed = false;
  try {
    emailed = await sendNotificationEmail({
      to: [{ email: CONTACT_EMAIL }],
      subject: `New general enquiry from ${values.fullName}`,
      html: contactNotificationHtml({
        customerName: values.fullName,
        customerPhone: values.phone,
        customerEmail: values.email,
        message: values.message,
        submittedAt: formatDate(new Date()),
      }),
    });
  } catch (err) {
    console.error("[contact] failed to send notification email", err);
  }

  return NextResponse.json({ ok: true, emailed });
}
