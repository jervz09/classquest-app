import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function formValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export async function requireActionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");
  return { supabase, user };
}

export function logActionError(scope: string, error: PostgrestError | null, context: Record<string, unknown>) {
  console.error(`[action:${scope}]`, error ? {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    ...context,
  } : { message: "Operation returned no result", ...context });
}
