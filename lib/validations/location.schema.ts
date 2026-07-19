import { z } from "zod";

export const countrySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const citySchema = z.object({
  country_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const neighborhoodSchema = z.object({
  city_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const featureSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  icon: z.string().trim().max(50).optional().or(z.literal("")),
});

export type CountryInput = z.infer<typeof countrySchema>;
export type CityInput = z.infer<typeof citySchema>;
export type NeighborhoodInput = z.infer<typeof neighborhoodSchema>;
export type FeatureInput = z.infer<typeof featureSchema>;
