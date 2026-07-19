"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyMedia } from "@/types";

export function Gallery({ media, title }: { media: PropertyMedia[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const visible = media.slice(0, 5);
  const remaining = media.length - visible.length;

  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => setLightboxIndex((i) => (i === null ? null : (i + 1) % media.length)), [media.length]);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + media.length) % media.length)),
    [media.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, close, next, prev]);

  if (media.length === 0) {
    return <div className="flex h-72 items-center justify-center rounded-2xl bg-muted text-muted-foreground">No photos yet</div>;
  }

  return (
    <>
      <div className="grid h-[26rem] grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:h-[30rem] sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative col-span-1 row-span-2 overflow-hidden sm:col-span-2"
        >
          <MediaThumb item={visible[0]} priority />
        </button>

        {visible.slice(1, 5).map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIndex(i + 1)}
            className="group relative hidden overflow-hidden sm:block"
          >
            <MediaThumb item={item} />
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-medium text-white">
                +{remaining} more
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="mt-3 flex items-center gap-2 text-sm font-medium text-charcoal hover:text-bronze sm:hidden"
      >
        <Expand className="size-4" /> View all {media.length} photos
      </button>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <p className="text-sm">
                {lightboxIndex + 1} / {media.length} — {title}
              </p>
              <button type="button" onClick={close} aria-label="Close">
                <X className="size-6" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-2 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="relative h-full w-full max-w-5xl">
                {media[lightboxIndex].resource_type === "video" ? (
                  <video
                    src={media[lightboxIndex].secure_url}
                    controls
                    autoPlay
                    className="mx-auto h-full max-h-[75vh] w-auto rounded-lg"
                  />
                ) : (
                  <Image
                    src={media[lightboxIndex].secure_url}
                    alt={media[lightboxIndex].alt_text || title}
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-2 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MediaThumb({ item, priority = false }: { item: PropertyMedia; priority?: boolean }) {
  if (item.resource_type === "video") {
    return (
      <div className="relative h-full w-full bg-charcoal">
        <video src={item.secure_url} className="h-full w-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <PlayCircle className="size-10 text-white" />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={item.secure_url}
      alt={item.alt_text || ""}
      fill
      priority={priority}
      sizes="(min-width: 640px) 50vw, 100vw"
      className={cn("object-cover transition-transform duration-500 group-hover:scale-105")}
    />
  );
}
