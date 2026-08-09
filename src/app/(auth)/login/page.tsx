import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";
import { getHomeForCurrentUser } from "@/lib/auth/guards";
import { loginAction } from "@/server/actions/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const home = await getHomeForCurrentUser(); if (home) redirect(home);
  const message = (await searchParams).message;
  return <AuthShell title="Welcome back" description="Continue your classroom adventure.">{message && <p role="status" className="mb-5 rounded-xl border bg-muted p-3 text-sm">{String(message)}</p>}<AuthForm action={loginAction} submitLabel="Log in" fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]} footer={<><Link className="text-primary hover:underline" href="/forgot-password">Forgot password?</Link><span className="mx-2">·</span><Link className="text-primary hover:underline" href="/register">Create account</Link></>} /></AuthShell>;
}
