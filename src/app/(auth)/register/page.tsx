import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";
import { getHomeForCurrentUser } from "@/lib/auth/guards";
import { registerAction } from "@/server/actions/auth";

export default async function RegisterPage() {
  const home = await getHomeForCurrentUser(); if (home) redirect(home);
  return <AuthShell title="Begin your quest" description="Create a secure ClassQuest account."><AuthForm action={registerAction} submitLabel="Create account" roleSelect fields={[{ name: "fullName", label: "Full name", autoComplete: "name" }, { name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" }]} footer={<>Already registered? <Link className="text-primary hover:underline" href="/login">Log in</Link></>} /></AuthShell>;
}
