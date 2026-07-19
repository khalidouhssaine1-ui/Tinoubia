"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyMapView } from "@/components/properties/property-map-view";
import type { PropertyWithRelations } from "@/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function PropertyResults({
  properties,
  view,
}: {
  properties: PropertyWithRelations[];
  view?: string;
}) {
  const reduced = useReducedMotion();

  if (properties.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
        <p className="font-heading text-lg text-charcoal">No properties match your search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting or resetting your filters.</p>
      </div>
    );
  }

  if (view === "map") {
    return <PropertyMapView properties={properties} />;
  }

  if (view === "list") {
    return (
      <motion.div
        key={properties.map((p) => p.id).join(",")}
        variants={reduced ? undefined : container}
        initial={reduced ? undefined : "hidden"}
        animate={reduced ? undefined : "show"}
        className="flex flex-col gap-5"
      >
        {properties.map((property, i) => (
          <motion.div key={property.id} variants={reduced ? undefined : item}>
            <PropertyCard property={property} layout="list" priority={i < 2} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={properties.map((p) => p.id).join(",")}
      variants={reduced ? undefined : container}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "show"}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {properties.map((property, i) => (
        <motion.div key={property.id} variants={reduced ? undefined : item}>
          <PropertyCard property={property} priority={i < 3} />
        </motion.div>
      ))}
    </motion.div>
  );
}
