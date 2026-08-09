import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateClassForm } from "@/components/classes/class-form";
import { createClassAction } from "@/server/actions/classes";
export default function NewClassPage() { return <main className="mx-auto max-w-2xl px-5 py-10"><Link href="/teacher/classes" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to classes</Link><section className="mt-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-8"><p className="font-medium text-primary">New classroom</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Create a class</h1><p className="mb-8 mt-2 text-muted-foreground">We’ll generate a private six-character code for your students.</p><CreateClassForm action={createClassAction} /></section></main>; }
