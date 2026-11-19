export type ListingType = "sale" | "rent";

export type RentalTerm = "short_term" | "long_term";

export type PropertyStatus =
  | "draft"
  | "available"
  | "reserved"
  | "rented"
  | "sold"
  | "archived";

export type PropertyCategorySlug = "apartments" | "villas" | "riads";

export type UserRole = "super_admin" | "admin" | "agent" | "editor";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "negotiating"
  | "won"
  | "lost"
  | "spam";

export type PreferredContact = "phone" | "email" | "whatsapp";

export type MediaResourceType = "image" | "video";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  slug: string;
}

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  slug: string;
}

export interface PropertyType {
  id: string;
  name: string;
  slug: PropertyCategorySlug;
  icon: string | null;
}

export interface Feature {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Agent {
  id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  cloudinary_public_id: string;
  secure_url: string;
  resource_type: MediaResourceType;
  width: number | null;
  height: number | null;
  duration: number | null;
  position: number;
  alt_text: string | null;
  caption: string | null;
  is_cover: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  reference: string;
  title: string;
  slug: string;
  listing_type: ListingType;
  rental_term: RentalTerm | null;
  property_type_id: string;
  status: PropertyStatus;
  show_when_unavailable: boolean;
  featured: boolean;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  living_area: number | null;
  land_area: number | null;
  floors: number | null;
  year_built: number | null;
  furnished: boolean;
  description: string | null;
  country_id: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  address: string | null;
  show_full_address: boolean;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  agent_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  brochure_url: string | null;
  brochure_public_id: string | null;
  views_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PropertyWithRelations extends Property {
  property_type: PropertyType;
  city: City | null;
  neighborhood: Neighborhood | null;
  country: Country | null;
  agent: Agent | null;
  media: PropertyMedia[];
  features: Feature[];
}

export interface Lead {
  id: string;
  property_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  preferred_contact: PreferredContact;
  visit_date: string | null;
  num_people: number | null;
  message: string | null;
  status: LeadStatus;
  assigned_agent_id: string | null;
  source: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  note: string;
  created_at: string;
}

export interface InstagramVideo {
  id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_avatar: string | null;
  rating: number;
  message: string;
  featured: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PropertyFilters {
  listingType?: ListingType;
  rentalTerm?: RentalTerm;
  categorySlug?: PropertyCategorySlug;
  citySlug?: string;
  neighborhoodSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  pool?: boolean;
  garden?: boolean;
  terrace?: boolean;
  parking?: boolean;
  availableOnly?: boolean;
  featuredOnly?: boolean;
  query?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "area-asc" | "area-desc";
  view?: "grid" | "list" | "map";
  page?: number;
}
