import { z } from "zod";

export const propertyBasicSchema = z.object({
  title: z.string().trim().min(5, "Title is too short").max(200),
  // Empty on creation lets the DB trigger auto-generate a TIN-xxxx reference.
  reference: z.string().trim().max(50).optional().or(z.literal("")),
  listing_type: z.enum(["sale", "rent"]),
  // Only meaningful when listing_type is "rent" — enforced below via superRefine.
  rental_term: z.enum(["short_term", "long_term"]).nullable().optional(),
  property_type_id: z.string().uuid("Select a category"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().trim().min(1).max(6).default("MAD"),
  status: z.enum(["draft", "available", "reserved", "rented", "sold", "archived"]),
  featured: z.boolean().default(false),
});

export const propertyBasicFormSchema = propertyBasicSchema.superRefine((data, ctx) => {
  if (data.listing_type === "rent" && !data.rental_term) {
    ctx.addIssue({
      code: "custom",
      path: ["rental_term"],
      message: "Select short-term or long-term for a rental listing",
    });
  }
});

export const propertyDetailsSchema = z.object({
  bedrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).nullable().optional(),
  living_area: z.coerce.number().min(0).nullable().optional(),
  land_area: z.coerce.number().min(0).nullable().optional(),
  floors: z.coerce.number().int().min(0).max(200).nullable().optional(),
  year_built: z.coerce.number().int().min(1800).max(2100).nullable().optional(),
  furnished: z.boolean().default(false),
  description: z.string().trim().min(20, "Description is too short").max(10000),
  feature_ids: z.array(z.string().uuid()).default([]),
});

export const propertyLocationSchema = z.object({
  country_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid("Select a city"),
  neighborhood_id: z.string().uuid().nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  show_full_address: z.boolean().default(false),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  google_maps_url: z.string().trim().url().nullable().optional().or(z.literal("")),
});

export const propertyContactSchema = z.object({
  agent_id: z.string().uuid().nullable().optional(),
});

export const propertySeoSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  seo_title: z.string().trim().max(160).nullable().optional().or(z.literal("")),
  seo_description: z.string().trim().max(300).nullable().optional().or(z.literal("")),
  og_image: z.string().url().nullable().optional().or(z.literal("")),
});

export const propertySchema = propertyBasicSchema
  .merge(propertyDetailsSchema)
  .merge(propertyLocationSchema)
  .merge(propertyContactSchema)
  .merge(propertySeoSchema)
  .superRefine((data, ctx) => {
    if (data.listing_type === "rent" && !data.rental_term) {
      ctx.addIssue({
        code: "custom",
        path: ["rental_term"],
        message: "Select short-term or long-term for a rental listing",
      });
    }
  });

export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertyBasicInput = z.infer<typeof propertyBasicSchema>;
export type PropertyDetailsInput = z.infer<typeof propertyDetailsSchema>;
export type PropertyLocationInput = z.infer<typeof propertyLocationSchema>;
export type PropertySeoInput = z.infer<typeof propertySeoSchema>;
