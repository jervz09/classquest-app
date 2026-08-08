import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JoinClassForm } from "@/components/classes/class-form";
import { joinClassAction } from "../actions";
export default function JoinClassPage() { return <main className="mx-auto max-w-xl px-5 py-10"><Link href="/student/classes" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to classes</Link><section className="mt-6 rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-8"><p className="font-medium text-primary">Enter your invitation</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Join a class</h1><p className="mb-8 mt-2 text-muted-foreground">Class codes use six letters and numbers.</p><JoinClassForm action={joinClassAction} /></section></main>; }
