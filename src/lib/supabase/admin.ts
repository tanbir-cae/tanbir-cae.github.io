import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role client. Server-only. Never import from Client Components.
 * Prefer RLS + the authenticated user client whenever possible.
 */
export function createServiceRoleClient() {
  const env = getPublicSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  if (!env || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for the service-role client and must stay server-side.",
    );
  }

  return createClient<Database>(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
