import type { Metadata } from "next";
import { NewPropertyForm } from "@/components/admin/properties/new-property-form";
import { getPropertyTypesLookup } from "@/lib/data/admin-lookups";

export const metadata: Metadata = { title: "Add Property" };

export default async function NewPropertyPage() {
  const propertyTypes = await getPropertyTypesLookup();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Add Property</h1>
        <p className="text-sm text-muted-foreground">
          Start with the basics — you&apos;ll add details, location, media and SEO after creating the draft.
        </p>
      </div>
      <NewPropertyForm propertyTypes={propertyTypes} />
    </div>
  );
}
