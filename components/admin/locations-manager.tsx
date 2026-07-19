"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCity, createCountry, createNeighborhood, deleteLocation } from "@/lib/actions/locations";
import { slugify } from "@/lib/utils";
import type { City, Country, Neighborhood } from "@/types";

export function LocationsManager({
  countries: initialCountries,
  cities: initialCities,
  neighborhoods: initialNeighborhoods,
}: {
  countries: Country[];
  cities: City[];
  neighborhoods: Neighborhood[];
}) {
  const [countries, setCountries] = useState(initialCountries);
  const [cities, setCities] = useState(initialCities);
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [isPending, startTransition] = useTransition();

  const [newCountry, setNewCountry] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCityCountry, setNewCityCountry] = useState<string | undefined>(countries[0]?.id);
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newNeighborhoodCity, setNewNeighborhoodCity] = useState<string | undefined>(cities[0]?.id);

  function addCountry() {
    if (!newCountry.trim()) return;
    startTransition(async () => {
      const result = await createCountry({ name: newCountry, slug: slugify(newCountry) });
      if (result.success && result.id) {
        setCountries((prev) => [...prev, { id: result.id!, name: newCountry, slug: slugify(newCountry) }]);
        setNewCountry("");
      } else {
        toast.error(result.error || "Could not add country");
      }
    });
  }

  function addCity() {
    if (!newCity.trim() || !newCityCountry) return;
    startTransition(async () => {
      const result = await createCity({ name: newCity, slug: slugify(newCity), country_id: newCityCountry });
      if (result.success && result.id) {
        setCities((prev) => [...prev, { id: result.id!, name: newCity, slug: slugify(newCity), country_id: newCityCountry }]);
        setNewCity("");
      } else {
        toast.error(result.error || "Could not add city");
      }
    });
  }

  function addNeighborhood() {
    if (!newNeighborhood.trim() || !newNeighborhoodCity) return;
    startTransition(async () => {
      const result = await createNeighborhood({
        name: newNeighborhood,
        slug: slugify(newNeighborhood),
        city_id: newNeighborhoodCity,
      });
      if (result.success && result.id) {
        setNeighborhoods((prev) => [
          ...prev,
          { id: result.id!, name: newNeighborhood, slug: slugify(newNeighborhood), city_id: newNeighborhoodCity },
        ]);
        setNewNeighborhood("");
      } else {
        toast.error(result.error || "Could not add neighborhood");
      }
    });
  }

  function handleDelete(table: "countries" | "cities" | "neighborhoods", id: string) {
    startTransition(async () => {
      const result = await deleteLocation(table, id);
      if (!result.success) {
        toast.error(result.error || "Could not delete");
        return;
      }
      if (table === "countries") setCountries((prev) => prev.filter((c) => c.id !== id));
      if (table === "cities") setCities((prev) => prev.filter((c) => c.id !== id));
      if (table === "neighborhoods") setNeighborhoods((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <LocationColumn title="Countries">
        <div className="flex gap-2">
          <Input value={newCountry} onChange={(e) => setNewCountry(e.target.value)} placeholder="Morocco" />
          <Button size="icon" onClick={addCountry} disabled={isPending}><Plus className="size-4" /></Button>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {countries.map((c) => (
            <ListRow key={c.id} label={c.name} onDelete={() => handleDelete("countries", c.id)} />
          ))}
        </ul>
      </LocationColumn>

      <LocationColumn title="Cities">
        <div className="flex flex-col gap-2">
          <Select value={newCityCountry} onValueChange={(v) => setNewCityCountry(v ?? undefined)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Marrakech" />
            <Button size="icon" onClick={addCity} disabled={isPending}><Plus className="size-4" /></Button>
          </div>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {cities.map((c) => (
            <ListRow key={c.id} label={c.name} onDelete={() => handleDelete("cities", c.id)} />
          ))}
        </ul>
      </LocationColumn>

      <LocationColumn title="Neighborhoods">
        <div className="flex flex-col gap-2">
          <Select value={newNeighborhoodCity} onValueChange={(v) => setNewNeighborhoodCity(v ?? undefined)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input value={newNeighborhood} onChange={(e) => setNewNeighborhood(e.target.value)} placeholder="Gueliz" />
            <Button size="icon" onClick={addNeighborhood} disabled={isPending}><Plus className="size-4" /></Button>
          </div>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {neighborhoods.map((n) => (
            <ListRow key={n.id} label={n.name} onDelete={() => handleDelete("neighborhoods", n.id)} />
          ))}
        </ul>
      </LocationColumn>
    </div>
  );
}

function LocationColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg text-charcoal">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ListRow({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <li className="flex items-center justify-between py-2 text-sm">
      {label}
      <button type="button" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}
