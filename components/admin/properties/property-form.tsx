"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicTab } from "@/components/admin/properties/tabs/basic-tab";
import { DetailsTab } from "@/components/admin/properties/tabs/details-tab";
import { LocationTab } from "@/components/admin/properties/tabs/location-tab";
import { MediaTab } from "@/components/admin/properties/tabs/media-tab";
import { ContactTab } from "@/components/admin/properties/tabs/contact-tab";
import { SeoTab } from "@/components/admin/properties/tabs/seo-tab";
import type { Agent, City, Country, Feature, Neighborhood, PropertyType, PropertyWithRelations } from "@/types";

export function PropertyForm({
  property,
  propertyTypes,
  countries,
  cities,
  neighborhoods,
  agents,
  features,
}: {
  property: PropertyWithRelations;
  propertyTypes: PropertyType[];
  countries: Country[];
  cities: City[];
  neighborhoods: Neighborhood[];
  agents: Agent[];
  features: Feature[];
}) {
  const cityName = cities.find((c) => c.id === property.city_id)?.name;

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="flex-wrap">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="contact">Contact &amp; Agent</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <TabsContent value="basic">
          <BasicTab property={property} propertyTypes={propertyTypes} />
        </TabsContent>
        <TabsContent value="details">
          <DetailsTab property={property} features={features} selectedFeatureIds={property.features.map((f) => f.id)} />
        </TabsContent>
        <TabsContent value="location">
          <LocationTab property={property} countries={countries} cities={cities} neighborhoods={neighborhoods} />
        </TabsContent>
        <TabsContent value="media">
          <MediaTab propertyId={property.id} media={property.media} brochureUrl={property.brochure_url} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab property={property} agents={agents} />
        </TabsContent>
        <TabsContent value="seo">
          <SeoTab property={property} cityName={cityName} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
