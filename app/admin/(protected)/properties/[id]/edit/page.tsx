import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PropertyForm } from "@/components/admin/properties/property-form";
import { PropertyToolbarActions } from "@/components/admin/properties/property-toolbar-actions";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/permissions";
import {
  getAgentsLookup,
  getCitiesLookup,
  getCountriesLookup,
  getFeaturesLookup,
  getNeighborhoodsLookup,
  getPropertyTypesLookup,
} from "@/lib/data/admin-lookups";
import { PROPERTY_STATUS_LABEL } from "@/lib/utils";
import type { Feature, PropertyMedia, PropertyWithRelations } from "@/types";

export const metadata: Metadata = { title: "Edit Property" };

async function getPropertyForEdit(id: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "*, property_type:property_types(*), city:cities(*), neighborhood:neighborhoods(*), country:countries(*), agent:agents(*), media:property_media(*), property_features(feature:features(*))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as PropertyWithRelations & {
    media: PropertyMedia[];
    property_features: { feature: Feature }[];
  };

  return {
    ...row,
    media: [...(row.media ?? [])].sort((a, b) => a.position - b.position),
    features: (row.property_features ?? []).map((pf) => pf.feature).filter(Boolean),
  };
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();

  const [property, propertyTypes, countries, cities, neighborhoods, agents, features] = await Promise.all([
    getPropertyForEdit(id),
    getPropertyTypesLookup(),
    getCountriesLookup(),
    getCitiesLookup(),
    getNeighborhoodsLookup(),
    getAgentsLookup(),
    getFeaturesLookup(),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl text-charcoal">{property.title}</h1>
            <Badge variant="secondary">{PROPERTY_STATUS_LABEL[property.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Ref: {property.reference}</p>
        </div>
        <PropertyToolbarActions propertyId={property.id} slug={property.slug} role={profile.role} />
      </div>

      <PropertyForm
        property={property}
        propertyTypes={propertyTypes}
        countries={countries}
        cities={cities}
        neighborhoods={neighborhoods}
        agents={agents}
        features={features}
      />
    </div>
  );
}
