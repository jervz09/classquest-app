"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClassSchema, type ClassActionState } from "@/lib/validations/class";

export async function createClassAction(_state: ClassActionState, formData: FormData): Promise<ClassActionState> {
  const values = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = createClassSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields: values };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");

  const { data, error } = await supabase.from("classes").insert({
    teacher_id: user.id,
    name: parsed.data.name,
    section: parsed.data.section || null,
    subject: parsed.data.subject || null,
  }).select("id").single();

  if (error || !data) return { status: "error", message: "We couldn't create the class. Please try again", fields: values };
  redirect(`/teacher/classes/${data.id}?created=1`);
}
