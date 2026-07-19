"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLead, addLeadNote } from "@/lib/actions/leads";
import { formatDate, LEAD_STATUS_LABEL } from "@/lib/utils";
import type { Agent, Lead, LeadNote, LeadStatus, Profile, Property } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "visit_scheduled", "negotiating", "won", "lost", "spam"];

export function LeadDetail({
  lead,
  agents,
  notes,
}: {
  lead: Lead & { property: Pick<Property, "id" | "title" | "slug" | "reference"> | null; assigned_agent: Agent | null };
  agents: Agent[];
  notes: (LeadNote & { author: Pick<Profile, "full_name" | "email"> | null })[];
}) {
  const [status, setStatus] = useState(lead.status);
  const [agentId, setAgentId] = useState(lead.assigned_agent?.id ?? "unassigned");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateStatus(value: string | null) {
    if (!value) return;
    setStatus(value as LeadStatus);
    startTransition(async () => {
      const result = await updateLead(lead.id, { status: value });
      if (!result.success) toast.error(result.error || "Could not update status");
    });
  }

  function updateAgent(value: string | null) {
    if (!value) return;
    setAgentId(value);
    startTransition(async () => {
      const result = await updateLead(lead.id, { assigned_agent_id: value === "unassigned" ? null : value });
      if (!result.success) toast.error(result.error || "Could not assign agent");
    });
  }

  function submitNote() {
    if (!note.trim()) return;
    startTransition(async () => {
      const result = await addLeadNote({ lead_id: lead.id, note });
      if (result.success) {
        toast.success("Note added");
        setNote("");
      } else {
        toast.error(result.error || "Could not add note");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg text-charcoal">Enquiry Details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Item label="Full Name" value={lead.full_name} />
            <Item label="Phone" value={lead.phone} />
            <Item label="Email" value={lead.email} />
            <Item label="Preferred Contact" value={lead.preferred_contact} />
            <Item label="Visit Date" value={lead.visit_date ? formatDate(lead.visit_date) : "—"} />
            <Item label="Number of People" value={lead.num_people?.toString() ?? "—"} />
            <Item label="Submitted" value={formatDate(lead.created_at)} />
            <Item label="Source" value={lead.source ?? "website"} />
          </dl>
          {lead.message && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
              <p className="mt-1 whitespace-pre-line text-sm text-charcoal/85">{lead.message}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg text-charcoal">Internal Notes</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note..." rows={3} />
            <Button onClick={submitNote} disabled={isPending} className="self-start bg-bronze text-white hover:bg-bronze/90">
              Add Note
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="text-charcoal/85">{n.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.author?.full_name || n.author?.email || "Staff"} · {formatDate(n.created_at)}
                </p>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <Select value={status} onValueChange={updateStatus}>
            <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{LEAD_STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>

          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Assigned Agent</p>
          <Select value={agentId} onValueChange={updateAgent}>
            <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {lead.property && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Linked Property</p>
            <Link href={`/admin/properties/${lead.property.id}/edit`} className="mt-2 block font-medium text-charcoal hover:text-bronze">
              {lead.property.title}
            </Link>
            <p className="text-xs text-muted-foreground">Ref: {lead.property.reference}</p>
            <Link href={`/properties/${lead.property.slug}`} target="_blank" className="mt-2 inline-block text-xs text-bronze hover:underline">
              View public listing →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-charcoal">{value}</p>
    </div>
  );
}
