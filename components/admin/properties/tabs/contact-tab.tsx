"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePropertyContact } from "@/lib/actions/properties";
import type { Agent, Property } from "@/types";

export function ContactTab({ property, agents }: { property: Property; agents: Agent[] }) {
  const [agentId, setAgentId] = useState<string | undefined>(property.agent_id ?? undefined);
  const [saving, setSaving] = useState(false);
  const selectedAgent = agents.find((a) => a.id === agentId);

  async function handleSave() {
    setSaving(true);
    const result = await updatePropertyContact(property.id, agentId ?? null);
    setSaving(false);
    if (result.success) toast.success("Agent assignment saved");
    else toast.error(result.error || "Could not save");
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Assigned Agent</Label>
        <Select value={agentId} onValueChange={(v) => setAgentId(v ?? undefined)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="No agent assigned" /></SelectTrigger>
          <SelectContent>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedAgent && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium text-charcoal">{selectedAgent.name}</p>
          <p className="text-muted-foreground">{selectedAgent.phone}</p>
          <p className="text-muted-foreground">{selectedAgent.whatsapp && `WhatsApp: ${selectedAgent.whatsapp}`}</p>
          <p className="text-muted-foreground">{selectedAgent.email}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            To change an agent&apos;s phone, WhatsApp or email, edit them from the Users page.
          </p>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save Agent"}
      </Button>
    </div>
  );
}
