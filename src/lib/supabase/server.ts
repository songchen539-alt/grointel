// GroIntel Supabase Server Client
// Uses Service Role key for database operations.
// NEVER expose this client or its key to the browser.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let serverClient: ReturnType<typeof createClient> | null = null;

export function getServerClient() {
  if (serverClient) return serverClient;

  if (!supabaseUrl.includes("supabase.co") || !serviceRoleKey) {
    return null;
  }

  serverClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serverClient;
}
