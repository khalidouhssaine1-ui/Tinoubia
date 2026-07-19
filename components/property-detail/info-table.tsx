import { BedDouble, Bath, Maximize, LandPlot, Building2, Calendar, Sofa } from "lucide-react";
import { formatArea } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

export function InfoTable({ property }: { property: PropertyWithRelations }) {
  const items = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "Living Area", value: property.living_area != null ? formatArea(property.living_area) : null },
    { icon: LandPlot, label: "Land Area", value: property.land_area != null ? formatArea(property.land_area) : null },
    { icon: Building2, label: "Floors", value: property.floors },
    { icon: Calendar, label: "Year Built", value: property.year_built },
    { icon: Sofa, label: "Furnished", value: property.furnished ? "Yes" : "No" },
  ].filter((i) => i.value !== null && i.value !== undefined);

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-start gap-1.5">
          <item.icon className="size-5 text-bronze" />
          <p className="font-heading text-lg text-charcoal">{item.value}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
