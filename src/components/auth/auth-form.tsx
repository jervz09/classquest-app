"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { initialAuthState, type AuthActionState } from "@/lib/validations/auth";

type Field = { name: string; label: string; type?: string; autoComplete?: string; placeholder?: string };
type Props = { action: (state: AuthActionState, data: FormData) => Promise<AuthActionState>; fields: Field[]; submitLabel: string; roleSelect?: boolean; footer?: React.ReactNode };

function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <Button className="w-full" size="lg" disabled={pending}>{pending ? "Please wait…" : label}</Button>; }

export function AuthForm({ action, fields, submitLabel, roleSelect, footer }: Props) {
  const [state, formAction] = useActionState(action, initialAuthState);
  return <form action={formAction} className="space-y-5">
    {state.message && <div role={state.status === "error" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${state.status === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{state.message}</div>}
    {fields.map((field) => <label key={field.name} className="block space-y-2"><span className="text-sm font-medium">{field.label}</span><input className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" name={field.name} type={field.type ?? "text"} autoComplete={field.autoComplete} placeholder={field.placeholder} defaultValue={state.fields?.[field.name]} required /></label>)}
    {roleSelect && <fieldset><legend className="mb-2 text-sm font-medium">Account type</legend><div className="grid grid-cols-2 gap-3">{["teacher", "student"].map((role) => <label key={role} className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 has-checked:border-primary has-checked:bg-primary/10"><input type="radio" name="role" value={role} defaultChecked={(state.fields?.role ?? "student") === role} /><span className="capitalize">{role}</span></label>)}</div></fieldset>}
    <Submit label={submitLabel} />{footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
  </form>;
}

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-12"><div className="w-full max-w-md"><Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">CQ</span>ClassQuest</Link><section className="rounded-3xl border bg-card p-6 shadow-xl sm:p-8"><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="mb-7 mt-2 text-muted-foreground">{description}</p>{children}</section></div></main>;
}
