import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().trim().min(2, "Class name must contain at least 2 characters").max(100),
  section: z.string().trim().max(50).optional(),
  subject: z.string().trim().max(100).optional(),
});

export const joinClassSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{6}$/, "Enter a valid 6-character class code"),
});

export type ClassActionState = {
  status: "idle" | "error";
  message?: string;
  fields?: Record<string, string>;
};

export const initialClassState: ClassActionState = { status: "idle" };
