import Link from "next/link";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";
import { forgotPasswordAction } from "@/server/actions/auth";
export default function ForgotPasswordPage() { return <AuthShell title="Reset your password" description="We'll send a secure recovery link if the account exists."><AuthForm action={forgotPasswordAction} submitLabel="Send reset link" fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]} footer={<Link className="text-primary hover:underline" href="/login">Back to login</Link>} /></AuthShell>; }
