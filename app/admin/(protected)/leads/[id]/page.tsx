import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetail } from "@/components/admin/leads/lead-detail";
import { getLeadById, getLeadNotes } from "@/lib/data/admin-leads";
import { getAgentsLookup } from "@/lib/data/admin-lookups";

export const metadata: Metadata = { title: "Lead Details" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, notes, agents] = await Promise.all([getLeadById(id), getLeadNotes(id), getAgentsLookup()]);

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">{lead.full_name}</h1>
        <p className="text-sm text-muted-foreground">Enquiry received {new Date(lead.created_at).toLocaleString()}</p>
      </div>
      <LeadDetail lead={lead} agents={agents} notes={notes} />
    </div>
  );
}
