"use server";

import { redirect } from "next/navigation";
import { quizAnswersSchema, type QuizSubmissionState } from "@/lib/validations/game";
import { logActionError, requireActionUser } from "./shared";

export async function submitQuizAction(assignmentId: string, _state: QuizSubmissionState, formData: FormData): Promise<QuizSubmissionState> {
  const rawAnswers = formData.get("answers");
  let candidate: unknown;
  try { candidate = typeof rawAnswers === "string" ? JSON.parse(rawAnswers) : null; }
  catch { return { status: "error", message: "Your answers could not be read. Please try again" }; }
  const parsed = quizAnswersSchema.safeParse(candidate);
  if (!parsed.success) return { status: "error", message: "Answer every question before submitting" };

  const { supabase, user } = await requireActionUser();
  const { data, error } = await supabase.rpc("submit_quiz_attempt", { assignment_uuid: assignmentId, answers: parsed.data });
  if (error || !data?.[0]) {
    logActionError("quiz.submit", error, { assignmentId, userId: user.id });
    const message = error?.code === "23505" || error?.message.includes("already submitted")
      ? "You have already completed this quiz"
      : error?.code === "22023"
        ? "Answer every question before submitting"
        : "We couldn't submit your quiz. Please try again";
    return { status: "error", message };
  }
  redirect(`/student/results/${data[0].attempt_id}`);
}
