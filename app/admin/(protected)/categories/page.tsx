import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { getFeaturesLookup, getPropertyTypesLookup } from "@/lib/data/admin-lookups";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const [propertyTypes, features] = await Promise.all([getPropertyTypesLookup(), getFeaturesLookup()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage property categories and the amenities available on listings.</p>
      </div>
      <CategoriesManager propertyTypes={propertyTypes} features={features} />
    </div>
  );
}
