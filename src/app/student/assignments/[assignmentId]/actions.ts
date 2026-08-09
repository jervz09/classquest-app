"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { quizAnswersSchema, type QuizSubmissionState } from "@/lib/validations/game";

export async function submitQuizAction(assignmentId: string, _state: QuizSubmissionState, formData: FormData): Promise<QuizSubmissionState> {
  const rawAnswers = formData.get("answers");
  let candidate: unknown;
  try {
    candidate = typeof rawAnswers === "string" ? JSON.parse(rawAnswers) : null;
  } catch {
    return { status: "error", message: "Your answers could not be read. Please try again" };
  }

  const parsed = quizAnswersSchema.safeParse(candidate);
  if (!parsed.success) return { status: "error", message: "Answer every question before submitting" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");

  const { data, error } = await supabase.rpc("submit_quiz_attempt", {
    assignment_uuid: assignmentId,
    answers: parsed.data,
  });

  if (error || !data?.[0]) {
    console.error("[quiz:submit] RPC failed", error ? {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      assignmentId,
      userId: user.id,
    } : { message: "RPC returned no result", assignmentId, userId: user.id });
    const message = error?.code === "23505" || error?.message.includes("already submitted")
      ? "You have already completed this quiz"
      : error?.code === "22023"
        ? "Answer every question before submitting"
        : "We couldn't submit your quiz. Please try again";
    return { status: "error", message };
  }

  redirect(`/student/results/${data[0].attempt_id}`);
}
