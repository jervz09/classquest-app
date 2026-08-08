import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireRole(role: "teacher" | "student") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?message=${encodeURIComponent("Please sign in to continue")}`);
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single();
  if (!profile) redirect("/login?message=Profile unavailable");
  if (profile.role !== role) redirect(profile.role === "teacher" ? "/teacher" : "/student");
  return { user, profile };
}

export async function getHomeForCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "teacher" ? "/teacher" : "/student";
}
