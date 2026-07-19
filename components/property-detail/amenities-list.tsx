import { getFeatureIcon } from "@/lib/feature-icons";
import type { Feature } from "@/types";

export function AmenitiesList({ features }: { features: Feature[] }) {
  if (features.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-xl text-charcoal">Amenities &amp; Features</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = getFeatureIcon(feature.icon);
          return (
            <div key={feature.id} className="flex items-center gap-2.5 text-sm text-charcoal/85">
              <Icon className="size-4 text-bronze" />
              {feature.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
