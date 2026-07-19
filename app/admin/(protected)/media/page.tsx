import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllMedia } from "@/lib/data/admin-media";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const media = await getAllMedia(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Media Library</h1>
        <p className="text-sm text-muted-foreground">{media.length} files across all properties.</p>
      </div>

      <form className="max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Search by property title..." />
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {media.map((item) => {
          const property = (item as unknown as { property: { id: string; title: string; slug: string } }).property;
          return (
            <Link
              key={item.id}
              href={`/admin/properties/${property.id}/edit`}
              className="group overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-square bg-muted">
                {item.resource_type === "video" ? (
                  <div className="flex h-full items-center justify-center bg-charcoal text-ivory">
                    <Video className="size-6" />
                  </div>
                ) : (
                  <Image
                    src={item.secure_url}
                    alt={item.alt_text || ""}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                {item.is_cover && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-bronze px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
                    Cover
                  </span>
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{property.title}</p>
            </Link>
          );
        })}
        {media.length === 0 && <p className="col-span-full py-8 text-center text-muted-foreground">No media uploaded yet.</p>}
      </div>
    </div>
  );
}
