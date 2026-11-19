import { NextResponse, type NextRequest } from "next/server";
import { enquirySchema } from "@/lib/validations/enquiry.schema";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { sendNotificationEmail } from "@/lib/email/send";
import { enquiryNotificationHtml } from "@/lib/email/templates";
import { formatDate } from "@/lib/utils";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hmounayt17@gmail.com";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`enquiry:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.flatten() }, { status: 400 });
  }

  const values = parsed.data;

  // Honeypot: real visitors never populate this field. Silently pretend
  // success so bots don't learn their submission was flagged.
  if (values.company) {
    return NextResponse.json({ ok: true });
  }

  // Server-side anon client. The public lead-insert RLS policy accepts clean
  // "new" submissions without needing the service-role key; reads stay locked.
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, title, reference, city:cities(name), neighborhood:neighborhoods(name)")
    .eq("id", values.propertyId)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("leads").insert({
    property_id: values.propertyId,
    full_name: values.fullName,
    phone: values.phone,
    email: values.email,
    preferred_contact: values.preferredContact,
    visit_date: values.visitDate || null,
    num_people: values.numPeople ?? null,
    message: values.message,
    status: "new",
    source: "website",
    ip_address: ip,
  });

  if (insertError) {
    console.error("[enquiries] failed to insert lead", insertError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const locationParts = [
    (property as unknown as { neighborhood?: { name: string } | null }).neighborhood?.name,
    (property as unknown as { city?: { name: string } | null }).city?.name,
  ].filter(Boolean);

  let emailed = false;
  try {
    emailed = await sendNotificationEmail({
      to: [{ email: CONTACT_EMAIL }],
      subject: `New enquiry — ${values.propertyTitle} (${values.propertyReference})`,
      html: enquiryNotificationHtml({
        customerName: values.fullName,
        customerPhone: values.phone,
        customerEmail: values.email,
        message: values.message,
        propertyTitle: values.propertyTitle,
        propertyReference: values.propertyReference,
        propertyUrl: values.propertyUrl,
        propertyLocation: locationParts.join(", ") || "—",
        preferredContact: values.preferredContact,
        visitDate: values.visitDate,
        numPeople: values.numPeople,
        submittedAt: formatDate(new Date()),
      }),
    });
  } catch (err) {
    // The enquiry is already safely stored — a notification failure shouldn't
    // fail the user-facing submission, just get logged for follow-up.
    console.error("[enquiries] failed to send notification email", err);
  }

  // `emailed: false` tells the browser to send the notification via FormSubmit
  // (which must run client-side to pass its Cloudflare bot check).
  return NextResponse.json({ ok: true, emailed });
}
