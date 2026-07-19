import Image from "next/image";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/nav-config";
import type { Agent, Property } from "@/types";

export function AgentCard({ agent, property }: { agent: Agent; property: Property }) {
  const message = `Hello, I'm interested in "${property.title}" (Ref: ${property.reference}). Is it still available?`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Listed by</p>
      <div className="mt-3 flex items-center gap-3">
        {agent.avatar_url ? (
          <div className="relative size-12 overflow-hidden rounded-full">
            <Image src={agent.avatar_url} alt={agent.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-sand/40 font-heading text-charcoal">
            {agent.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-heading text-base text-charcoal">{agent.name}</p>
          <p className="text-xs text-muted-foreground">Tinoubia Immobilier</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {agent.phone && (
          <a
            href={`tel:${agent.phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-charcoal hover:bg-muted"
          >
            <Phone className="size-4" /> Call Agent
          </a>
        )}
        {agent.whatsapp && (
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white hover:bg-[#1ebc59]"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        )}
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-charcoal hover:bg-muted"
          >
            <Mail className="size-4" /> Email
          </a>
        )}
      </div>
    </div>
  );
}
