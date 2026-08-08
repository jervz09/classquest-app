import { z } from "zod";

const email = z.email("Enter a valid email address").max(254);
const password = z.string().min(8, "Password must contain at least 8 characters").max(72);

export const loginSchema = z.object({ email, password: z.string().min(1, "Password is required") });
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100), email, password,
  role: z.enum(["teacher", "student"], { error: "Choose an account type" }),
});
export const forgotPasswordSchema = z.object({ email });
export const updatePasswordSchema = z.object({ password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export type AuthActionState = { status: "idle" | "error" | "success"; message?: string; fields?: Record<string, string> };
export const initialAuthState: AuthActionState = { status: "idle" };
