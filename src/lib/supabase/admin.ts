import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "./config";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || /placeholder|your-service-role-key/i.test(serviceRoleKey) || serviceRoleKey.length < 40) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured with a real service-role key");
  }
  const env = getSupabasePublicEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
