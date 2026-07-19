"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tinoubia:favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Anonymous visitors get client-only favorites via localStorage — see the
 * `favorites` table comment in the schema for why this isn't a DB round trip. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Deliberately deferred to after mount: reading localStorage during the
    // initial render would produce a server/client hydration mismatch, since
    // the server has no concept of this visitor's favorites.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readFavorites());
    const onStorage = () => setFavorites(readFavorites());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((propertyId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((propertyId: string) => favorites.includes(propertyId), [favorites]);

  return { favorites, toggle, isFavorite };
}
