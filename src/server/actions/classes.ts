"use server";

import { redirect } from "next/navigation";
import { createClassSchema, joinClassSchema, type ClassActionState } from "@/lib/validations/class";
import { formValues, logActionError, requireActionUser } from "./shared";

export async function createClassAction(_state: ClassActionState, formData: FormData): Promise<ClassActionState> {
  const values = formValues(formData);
  const parsed = createClassSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields: values };
  const { supabase, user } = await requireActionUser();
  const { data, error } = await supabase.from("classes").insert({ teacher_id: user.id, name: parsed.data.name, section: parsed.data.section || null, subject: parsed.data.subject || null }).select("id").single();
  if (error || !data) {
    logActionError("class.create", error, { userId: user.id });
    return { status: "error", message: "We couldn't create the class. Please try again", fields: values };
  }
  redirect(`/teacher/classes/${data.id}?created=1`);
}

export async function joinClassAction(_state: ClassActionState, formData: FormData): Promise<ClassActionState> {
  const values = formValues(formData);
  const parsed = joinClassSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields: values };
  const { supabase, user } = await requireActionUser();
  const { data, error } = await supabase.rpc("join_class_by_code", { code: parsed.data.code });
  if (error || !data?.[0]) {
    logActionError("class.join", error, { userId: user.id });
    const message = /student authentication/i.test(error?.message ?? "") ? "Only student accounts can join classes" : "That class code wasn't found. Check the code and try again";
    return { status: "error", message, fields: { code: parsed.data.code } };
  }
  redirect(`/student/classes/${data[0].id}?joined=1`);
}
