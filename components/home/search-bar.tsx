"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [listingType, setListingType] = useState("sale");
  const [rentalTerm, setRentalTerm] = useState("any");
  const [category, setCategory] = useState("any");
  const [city, setCity] = useState("marrakech");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("any");

  function handleSearch() {
    const base = category !== "any" ? `/properties/${category}/${listingType === "sale" ? "for-sale" : "for-rent"}` : `/properties`;
    const params = new URLSearchParams();
    if (category === "any") params.set("listingType", listingType);
    if (listingType === "rent" && rentalTerm !== "any") params.set("rentalTerm", rentalTerm);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms !== "any") params.set("bedrooms", bedrooms);
    router.push(`${base}?${params.toString()}`);
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur sm:grid-cols-3 lg:grid-cols-6 lg:items-end lg:gap-3 lg:p-4">
        <Field label="Sale or Rent">
          <Select value={listingType} onValueChange={(v) => v && setListingType(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {listingType === "rent" && (
          <Field label="Duration">
            <Select value={rentalTerm} onValueChange={(v) => v && setRentalTerm(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="short_term">Short-Term</SelectItem>
                <SelectItem value="long_term">Long-Term</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field label="Category">
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="apartments">Apartments</SelectItem>
              <SelectItem value="villas">Villas</SelectItem>
              <SelectItem value="riads">Riads</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="City">
          <Select value={city} onValueChange={(v) => v && setCity(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="marrakech">Marrakech</SelectItem>
              <SelectItem value="agadir">Agadir</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Min Price">
          <Input type="number" inputMode="numeric" placeholder="MAD" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </Field>

        <Field label="Max Price">
          <Input type="number" inputMode="numeric" placeholder="MAD" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </Field>

        <Field label="Bedrooms">
          <Select value={bedrooms} onValueChange={(v) => v && setBedrooms(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Button
        onClick={handleSearch}
        size="lg"
        className="mt-3 w-full gap-2 rounded-xl bg-bronze text-white hover:bg-bronze/90 sm:w-auto"
      >
        <Search className="size-4" />
        Search Properties
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
