import type { Metadata } from "next";
import { LocationsManager } from "@/components/admin/locations-manager";
import { getCitiesLookup, getCountriesLookup, getNeighborhoodsLookup } from "@/lib/data/admin-lookups";

export const metadata: Metadata = { title: "Locations" };

export default async function AdminLocationsPage() {
  const [countries, cities, neighborhoods] = await Promise.all([
    getCountriesLookup(),
    getCitiesLookup(),
    getNeighborhoodsLookup(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Locations</h1>
        <p className="text-sm text-muted-foreground">
          Manage countries, cities and neighborhoods. Properties link to these when their Location tab is saved.
        </p>
      </div>
      <LocationsManager countries={countries} cities={cities} neighborhoods={neighborhoods} />
    </div>
  );
}
