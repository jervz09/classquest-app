"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { initialClassState, type ClassActionState } from "@/lib/validations/class";

type Action = (state: ClassActionState, formData: FormData) => Promise<ClassActionState>;

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button className="w-full sm:w-auto" size="lg" disabled={pending}>{pending ? "Please wait…" : children}</Button>;
}

export function CreateClassForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, initialClassState);
  return <form action={formAction} className="space-y-5">
    {state.message && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
    <label className="block space-y-2"><span className="text-sm font-medium">Class name</span><input name="name" required maxLength={100} defaultValue={state.fields?.name} placeholder="Grade 8 Science" className="h-11 w-full rounded-xl border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block space-y-2"><span className="text-sm font-medium">Section <span className="text-muted-foreground">(optional)</span></span><input name="section" maxLength={50} defaultValue={state.fields?.section} placeholder="Section A" className="h-11 w-full rounded-xl border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
      <label className="block space-y-2"><span className="text-sm font-medium">Subject <span className="text-muted-foreground">(optional)</span></span><input name="subject" maxLength={100} defaultValue={state.fields?.subject} placeholder="Science" className="h-11 w-full rounded-xl border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
    </div>
    <SubmitButton>Create class</SubmitButton>
  </form>;
}

export function JoinClassForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, initialClassState);
  return <form action={formAction} className="space-y-5">
    {state.message && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
    <label className="block space-y-2"><span className="text-sm font-medium">Class code</span><input name="code" required minLength={6} maxLength={6} autoCapitalize="characters" autoComplete="off" defaultValue={state.fields?.code} placeholder="K7M4QX" className="h-14 w-full rounded-xl border bg-background px-4 text-center font-mono text-2xl font-bold uppercase tracking-[0.3em] outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
    <SubmitButton>Join class</SubmitButton>
  </form>;
}
