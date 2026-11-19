import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number, currency = "MAD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatArea(sqm: number) {
  return `${new Intl.NumberFormat("en-US").format(sqm)} m²`
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Makes free-text search safe to embed in a Supabase/PostgREST `.or()` filter
 * string. Commas, parentheses, quotes and backslashes are filter syntax there,
 * so a search like "villa, pool" would otherwise break the query or add extra
 * clauses. LIKE wildcards (% _ *) are dropped so the term matches literally.
 * Returns "" when nothing searchable is left — callers should skip the filter.
 */
export function toSafeSearchTerm(input: string, maxLength = 100) {
  return input
    .replace(/[,()"\\%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

export function generatePropertySlug(title: string, city: string, listingType: "sale" | "rent", reference: string) {
  const action = listingType === "sale" ? "a-vendre" : "a-louer"
  return slugify(`${title}-${action}-${city}-ref-${reference.replace(/\D/g, "")}`)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(date),
  )
}

export const LISTING_TYPE_LABEL: Record<"sale" | "rent", string> = {
  sale: "For Sale",
  rent: "For Rent",
}

export const PROPERTY_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  rented: "Rented",
  sold: "Sold",
  archived: "Archived",
}

export const RENTAL_TERM_LABEL: Record<string, string> = {
  short_term: "Short-Term",
  long_term: "Long-Term",
}

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  visit_scheduled: "Visit Scheduled",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
}
