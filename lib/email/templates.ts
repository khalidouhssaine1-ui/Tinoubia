interface EnquiryEmailInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
  propertyTitle: string;
  propertyReference: string;
  propertyUrl: string;
  propertyLocation: string;
  preferredContact: string;
  visitDate?: string | null;
  numPeople?: number | null;
  submittedAt: string;
}

export function enquiryNotificationHtml(input: EnquiryEmailInput): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px;color:#6F745D;font-size:13px;font-family:Arial,sans-serif;white-space:nowrap;">${label}</td>
      <td style="padding:8px 16px;color:#151816;font-size:14px;font-family:Arial,sans-serif;">${value}</td>
    </tr>`;

  return `
  <div style="background:#F5F1E8;padding:32px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E2D9C6;">
      <div style="background:#151816;padding:24px 32px;">
        <p style="margin:0;color:#F5F1E8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Tinoubia Immobilier</p>
        <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;">New Property Enquiry</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Property", input.propertyTitle)}
        ${row("Reference", input.propertyReference)}
        ${row("Location", input.propertyLocation)}
        ${row("Name", input.customerName)}
        ${row("Phone", input.customerPhone)}
        ${row("Email", input.customerEmail)}
        ${row("Preferred contact", input.preferredContact)}
        ${input.visitDate ? row("Desired visit date", input.visitDate) : ""}
        ${input.numPeople ? row("Number of people", String(input.numPeople)) : ""}
        ${row("Submitted", input.submittedAt)}
      </table>
      <div style="padding:16px 32px;border-top:1px solid #E2D9C6;">
        <p style="color:#6F745D;font-size:13px;margin:0 0 6px;">Message</p>
        <p style="color:#151816;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${input.message}</p>
      </div>
      <div style="padding:16px 32px;background:#F5F1E8;">
        <a href="${input.propertyUrl}" style="color:#A47C48;font-size:13px;text-decoration:none;">View property listing →</a>
      </div>
    </div>
  </div>`;
}

interface ContactEmailInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
  submittedAt: string;
}

export function contactNotificationHtml(input: ContactEmailInput): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px;color:#6F745D;font-size:13px;font-family:Arial,sans-serif;white-space:nowrap;">${label}</td>
      <td style="padding:8px 16px;color:#151816;font-size:14px;font-family:Arial,sans-serif;">${value}</td>
    </tr>`;

  return `
  <div style="background:#F5F1E8;padding:32px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E2D9C6;">
      <div style="background:#151816;padding:24px 32px;">
        <p style="margin:0;color:#F5F1E8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Tinoubia Immobilier</p>
        <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;">New General Enquiry</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Name", input.customerName)}
        ${row("Phone", input.customerPhone)}
        ${row("Email", input.customerEmail)}
        ${row("Submitted", input.submittedAt)}
      </table>
      <div style="padding:16px 32px;border-top:1px solid #E2D9C6;">
        <p style="color:#6F745D;font-size:13px;margin:0 0 6px;">Message</p>
        <p style="color:#151816;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${input.message}</p>
      </div>
    </div>
  </div>`;
}
