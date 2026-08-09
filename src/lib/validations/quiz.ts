import { z } from "zod";

export const quizSchema = z.object({
  title: z.string().trim().min(3, "Quiz title must contain at least 3 characters").max(150),
  description: z.string().trim().max(2000).optional(),
  subject: z.string().trim().max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  gameMode: z.enum(["classic", "time_attack", "survival"]),
});

export const questionSchema = z.discriminatedUnion("questionType", [
  z.object({
    questionType: z.literal("multiple_choice"), questionText: z.string().trim().min(3).max(2000),
    points: z.coerce.number().int().min(1).max(100), correctAnswer: z.string().trim().min(1),
    choice1: z.string().trim().min(1), choice2: z.string().trim().min(1), choice3: z.string().trim().optional(), choice4: z.string().trim().optional(),
  }).refine((value) => [value.choice1, value.choice2, value.choice3, value.choice4].filter(Boolean).includes(value.correctAnswer), { message: "Correct answer must exactly match one choice", path: ["correctAnswer"] })
    .refine((value) => { const choices = [value.choice1, value.choice2, value.choice3, value.choice4].filter((choice): choice is string => Boolean(choice)); return new Set(choices.map((choice) => choice.toLowerCase())).size === choices.length; }, { message: "Choices must be unique", path: ["choice2"] }),
  z.object({
    questionType: z.literal("true_false"), questionText: z.string().trim().min(3).max(2000), points: z.coerce.number().int().min(1).max(100), correctAnswer: z.enum(["true", "false"]),
  }),
]);

export const assignmentSchema = z.object({
  classId: z.uuid(),
  dueAt: z.string().optional().refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid due date").transform((value) => value ? new Date(value).toISOString() : null),
});

export type QuizActionState = { status: "idle" | "error"; message?: string; fields?: Record<string, string> };
export const initialQuizState: QuizActionState = { status: "idle" };
