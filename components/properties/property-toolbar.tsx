"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Map as MapIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VIEWS = [
  { value: "grid", icon: LayoutGrid, label: "Grid" },
  { value: "list", icon: List, label: "List" },
  { value: "map", icon: MapIcon, label: "Map" },
] as const;

export function PropertyToolbar({
  basePath,
  total,
  view,
  sort,
}: {
  basePath: string;
  total: number;
  view: string;
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "page") params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-charcoal">{total}</span> {total === 1 ? "property" : "properties"} found
      </p>

      <div className="flex items-center gap-3">
        <Select value={sort} onValueChange={(v) => v && updateParam("sort", v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="area-asc">Area: Small to Large</SelectItem>
            <SelectItem value="area-desc">Area: Large to Small</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border border-border p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              aria-label={v.label}
              onClick={() => updateParam("view", v.value)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                view === v.value ? "bg-bronze text-white" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <v.icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
