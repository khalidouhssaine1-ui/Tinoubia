import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "bronze" | "olive";
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          tone === "bronze" && "bg-bronze/10 text-bronze",
          tone === "olive" && "bg-olive/10 text-olive",
          tone === "default" && "bg-muted text-charcoal",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-heading text-2xl text-charcoal">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
