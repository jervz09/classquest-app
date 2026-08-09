"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveTrustedOrigin } from "@/lib/auth/request-origin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, loginSchema, registerSchema, updatePasswordSchema, type AuthActionState } from "@/lib/validations/auth";
import { formValues } from "./shared";

function invalid(message = "Check the highlighted information and try again", values?: Record<string, string>): AuthActionState {
  return { status: "error", message, fields: values };
}

function friendlyAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return "Email or password is incorrect";
  if (/email not confirmed/i.test(message)) return "Confirm your email before signing in";
  if (/user already registered/i.test(message)) return "An account with this email already exists";
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait and try again";
  return "We couldn't complete that request. Please try again";
}

async function requestOrigin() {
  const requestHeaders = await headers();
  return resolveTrustedOrigin({
    origin: requestHeaders.get("origin"),
    forwardedHost: requestHeaders.get("x-forwarded-host"),
    host: requestHeaders.get("host"),
    forwardedProto: requestHeaders.get("x-forwarded-proto"),
  });
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const values = formValues(formData);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message, { email: values.email ?? "" });
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return invalid(friendlyAuthError(error.message), { email: parsed.data.email });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  redirect(profile?.role === "teacher" ? "/teacher" : "/student");
}

export async function registerAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const values = formValues(formData);
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message, { fullName: values.fullName ?? "", email: values.email ?? "", role: values.role ?? "" });
  let admin: ReturnType<typeof createAdminClient>;
  try { admin = createAdminClient(); }
  catch { return invalid("Registration is not configured yet. Add the real server-only Supabase service-role key and restart the app", { fullName: parsed.data.fullName, email: parsed.data.email, role: parsed.data.role }); }
  const origin = await requestOrigin();
  if (!origin) return invalid("Unable to determine the application URL");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: parsed.data.fullName } } });
  if (error) return invalid(friendlyAuthError(error.message), { fullName: parsed.data.fullName, email: parsed.data.email, role: parsed.data.role });
  if (!data.user || data.user.identities?.length === 0) return invalid("An account with this email already exists", { email: parsed.data.email });

  try {
    const { error: metadataError } = await admin.auth.admin.updateUserById(data.user.id, { app_metadata: { account_role: parsed.data.role } });
    if (metadataError) throw metadataError;
    const { error: profileError } = await admin.from("profiles").update({ full_name: parsed.data.fullName, role: parsed.data.role }).eq("id", data.user.id);
    if (profileError) throw profileError;
    if (parsed.data.role === "teacher") await admin.from("student_progress").delete().eq("student_id", data.user.id);
    else await admin.from("student_progress").upsert({ student_id: data.user.id }, { onConflict: "student_id" });
  } catch {
    return invalid("Your account was created, but setup could not finish. Please contact support before retrying", { email: parsed.data.email });
  }

  if (data.session) redirect(parsed.data.role === "teacher" ? "/teacher" : "/student");
  redirect("/register/success");
}

export async function forgotPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const values = formValues(formData);
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message, { email: values.email ?? "" });
  const origin = await requestOrigin();
  if (!origin) return invalid("Unable to determine the application URL");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${origin}/auth/callback?next=/update-password` });
  return { status: "success", message: "If an account exists for that email, a password-reset link is on its way" };
}

export async function updatePasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return invalid(friendlyAuthError(error.message));
  return { status: "success", message: "Password updated. You can continue to your dashboard" };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
