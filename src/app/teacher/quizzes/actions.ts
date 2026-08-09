"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignmentSchema, questionSchema, quizSchema, type QuizActionState } from "@/lib/validations/quiz";

function valuesOf(formData: FormData) { return Object.fromEntries(formData.entries()) as Record<string, string>; }
async function authenticatedClient() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");
  return { supabase, user };
}

export async function createQuizAction(_state: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const fields = valuesOf(formData); const parsed = quizSchema.safeParse(fields);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields };
  const { supabase, user } = await authenticatedClient();
  const { data, error } = await supabase.from("quizzes").insert({ teacher_id: user.id, title: parsed.data.title, description: parsed.data.description || null, subject: parsed.data.subject || null, difficulty: parsed.data.difficulty, game_mode: parsed.data.gameMode }).select("id").single();
  if (error || !data) {
    console.error("[quiz:create] insert failed", error ? { code: error.code, message: error.message, details: error.details, hint: error.hint, userId: user.id } : { message: "Insert returned no row", userId: user.id });
    return { status: "error", message: "We couldn't create the quiz. Please try again", fields };
  }
  redirect(`/teacher/quizzes/${data.id}?created=1`);
}

export async function updateQuizAction(quizId: string, _state: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const fields = valuesOf(formData); const parsed = quizSchema.safeParse(fields);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields };
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("quizzes").update({ title: parsed.data.title, description: parsed.data.description || null, subject: parsed.data.subject || null, difficulty: parsed.data.difficulty, game_mode: parsed.data.gameMode }).eq("id", quizId);
  if (error) return { status: "error", message: "We couldn't save the quiz", fields };
  redirect(`/teacher/quizzes/${quizId}?saved=1`);
}

export async function saveQuestionAction(quizId: string, questionId: string | null, _state: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const fields = valuesOf(formData); const parsed = questionSchema.safeParse(fields);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the question", fields };
  const { supabase } = await authenticatedClient();
  const choices = parsed.data.questionType === "multiple_choice" ? [parsed.data.choice1, parsed.data.choice2, parsed.data.choice3, parsed.data.choice4].filter((value): value is string => Boolean(value)) : null;
  const payload = { question_text: parsed.data.questionText, question_type: parsed.data.questionType, choices, correct_answer: parsed.data.correctAnswer, points: parsed.data.points };
  let error;
  if (questionId) ({ error } = await supabase.from("questions").update(payload).eq("id", questionId).eq("quiz_id", quizId));
  else {
    const { data: last } = await supabase.from("questions").select("order_index").eq("quiz_id", quizId).order("order_index", { ascending: false }).limit(1).maybeSingle();
    ({ error } = await supabase.from("questions").insert({ ...payload, quiz_id: quizId, order_index: (last?.order_index ?? -1) + 1 }));
  }
  if (error) return { status: "error", message: "We couldn't save the question. Ensure choices are unique and the answer matches exactly", fields };
  redirect(`/teacher/quizzes/${quizId}?question=saved`);
}

export async function deleteQuestionAction(quizId: string, questionId: string) {
  const { supabase } = await authenticatedClient(); await supabase.from("questions").delete().eq("id", questionId).eq("quiz_id", quizId); revalidatePath(`/teacher/quizzes/${quizId}`);
}

export async function reorderQuestionAction(quizId: string, questionId: string, direction: "up" | "down") {
  const { supabase } = await authenticatedClient(); await supabase.rpc("reorder_question", { question_uuid: questionId, move_direction: direction }); revalidatePath(`/teacher/quizzes/${quizId}`);
}

export async function togglePublishAction(quizId: string, publish: boolean) {
  const { supabase } = await authenticatedClient();
  if (publish) { const { count } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("quiz_id", quizId); if (!count) redirect(`/teacher/quizzes/${quizId}?error=${encodeURIComponent("Add at least one question before publishing")}`); }
  await supabase.from("quizzes").update({ is_published: publish }).eq("id", quizId); revalidatePath(`/teacher/quizzes/${quizId}`);
}

export async function assignQuizAction(quizId: string, _state: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const fields = valuesOf(formData); const parsed = assignmentSchema.safeParse(fields);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, fields };
  const { supabase, user } = await authenticatedClient();
  const { data: quiz, error: quizError } = await supabase.from("quizzes").select("is_published").eq("id", quizId).single();
  if (quizError) {
    console.error("[quiz:assign] quiz lookup failed", { code: quizError.code, message: quizError.message, details: quizError.details, hint: quizError.hint, quizId, userId: user.id });
    return { status: "error", message: "We couldn't verify this quiz. Refresh the page and try again", fields };
  }
  if (!quiz?.is_published) return { status: "error", message: "Publish the quiz before assigning it", fields };
  const { error } = await supabase.from("assignments").insert({ quiz_id: quizId, class_id: parsed.data.classId, due_at: parsed.data.dueAt });
  if (error) {
    console.error("[quiz:assign] insert failed", { code: error.code, message: error.message, details: error.details, hint: error.hint, quizId, classId: parsed.data.classId, userId: user.id });
    const message = error.code === "23505"
      ? "This quiz is already assigned to that class"
      : error.code === "42501"
        ? "You can only assign your own quiz to your own class"
        : "We couldn't assign the quiz. Please try again";
    return { status: "error", message, fields };
  }
  redirect(`/teacher/quizzes/${quizId}?assigned=1`);
}
