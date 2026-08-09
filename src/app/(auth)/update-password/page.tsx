import Link from "next/link";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";
import { updatePasswordAction } from "@/server/actions/auth";
export default function UpdatePasswordPage() { return <AuthShell title="Choose a new password" description="Use at least eight characters."><AuthForm action={updatePasswordAction} submitLabel="Update password" fields={[{ name: "password", label: "New password", type: "password", autoComplete: "new-password" }, { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" }]} footer={<Link className="text-primary hover:underline" href="/login">Return to login</Link>} /></AuthShell>; }
