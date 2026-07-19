import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/permissions";
import { getLeads } from "@/lib/data/admin-leads";

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  try {
    await requireProfile();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await getLeads();

  const headers = [
    "Full Name",
    "Phone",
    "Email",
    "Preferred Contact",
    "Message",
    "Property",
    "Status",
    "Assigned Agent",
    "Visit Date",
    "Number of People",
    "Submitted",
  ];

  const rows = leads.map((lead) => {
    const l = lead as unknown as {
      full_name: string;
      phone: string;
      email: string;
      preferred_contact: string;
      message: string | null;
      property: { title: string } | null;
      status: string;
      assigned_agent: { name: string } | null;
      visit_date: string | null;
      num_people: number | null;
      created_at: string;
    };
    return [
      l.full_name,
      l.phone,
      l.email,
      l.preferred_contact,
      l.message,
      l.property?.title,
      l.status,
      l.assigned_agent?.name,
      l.visit_date,
      l.num_people,
      l.created_at,
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tinoubia-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
