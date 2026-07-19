import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>,
) {
  const supabase = await createClient();
  await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: (metadata as Json) ?? null,
  });
}
