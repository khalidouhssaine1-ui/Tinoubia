"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLead } from "@/lib/actions/leads";
import { formatDate, LEAD_STATUS_LABEL } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export interface Row {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
  property: { id: string; title: string } | null;
  assigned_agent: { name: string } | null;
}

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "visit_scheduled", "negotiating", "won", "lost", "spam"];

export function LeadsTable({ rows }: { rows: Row[] }) {
  const [, startTransition] = useTransition();

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateLead(id, { status });
      if (!result.success) toast.error(result.error || "Could not update status");
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Agent</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/leads/${row.id}`} className="font-medium text-charcoal hover:text-bronze">
                  {row.full_name}
                </Link>
                <p className="text-xs text-muted-foreground">{row.phone} · {row.email}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.property?.title ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.assigned_agent?.name ?? <Badge variant="secondary">Unassigned</Badge>}
              </td>
              <td className="px-4 py-3">
                <Select defaultValue={row.status} onValueChange={(v) => v && handleStatusChange(row.id, v)}>
                  <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{LEAD_STATUS_LABEL[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(row.created_at)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No enquiries yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
