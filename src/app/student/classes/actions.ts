"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinClassSchema, type ClassActionState } from "@/lib/validations/class";

export async function joinClassAction(_state: ClassActionState, formData: FormData): Promise<ClassActionState> {
  const values = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = joinClassSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields: values };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");
  const { data, error } = await supabase.rpc("join_class_by_code", { code: parsed.data.code });

  if (error || !data?.[0]) {
    const message = /student authentication/i.test(error?.message ?? "")
      ? "Only student accounts can join classes"
      : "That class code wasn't found. Check the code and try again";
    return { status: "error", message, fields: { code: parsed.data.code } };
  }
  redirect(`/student/classes/${data[0].id}?joined=1`);
}
