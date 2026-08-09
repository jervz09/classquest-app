import { z } from "zod";

export const quizAnswersSchema = z.record(z.uuid(), z.string().trim().min(1)).refine(
  (answers) => Object.keys(answers).length > 0,
  "Answer every question before submitting",
);

export type QuizSubmissionState = {
  status: "idle" | "error";
  message?: string;
};

export const initialQuizSubmissionState: QuizSubmissionState = { status: "idle" };
