import Link from "next/link";
import { Medal, Plus, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassCard } from "@/components/classes/class-card";
import { createClient } from "@/lib/supabase/server";

export default async function StudentPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  const [{ data: progress }, { data: memberships }] = await Promise.all([
    supabase.from("student_progress").select("xp, level, quizzes_completed").eq("student_id", user!.id).single(),
    supabase.from("class_members").select("joined_at, classes(id, name, section, subject)").eq("student_id", user!.id).order("joined_at", { ascending: false }),
  ]);
  const classes = (memberships ?? []).flatMap((item) => item.classes ?? []);
  return <main className="mx-auto max-w-6xl px-5 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-medium text-primary">Student dashboard</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Your adventure starts here</h1><p className="mt-3 text-muted-foreground">Join a classroom and take on your assigned quests.</p></div><div className="flex gap-2"><Button variant="outline" asChild><Link href="/student/progress"><Medal />View progress</Link></Button><Button asChild><Link href="/student/classes/join"><Plus />Join class</Link></Button></div></div><div className="mt-10 grid gap-4 sm:grid-cols-3">{[[Users,"Classes",classes.length],[Sparkles,"XP",progress?.xp ?? 0],[Medal,"Level",progress?.level ?? 1]].map(([Icon,label,value]) => <section key={label as string} className="rounded-2xl border bg-card p-6"><Icon className="text-primary" /><p className="mt-5 text-3xl font-bold">{value as number}</p><h2 className="mt-1 text-sm text-muted-foreground">{label as string}</h2></section>)}</div><section className="mt-10"><h2 className="text-xl font-semibold">Your classes</h2>{classes.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{classes.map((item) => <ClassCard key={item.id} classItem={item} href={`/student/classes/${item.id}`} />)}</div> : <div className="mt-4 rounded-3xl border border-dashed bg-card p-10 text-center"><h3 className="text-xl font-semibold">Join a class to begin your adventure</h3><p className="mt-2 text-muted-foreground">Ask your teacher for the six-character class code.</p><Button className="mt-5" asChild><Link href="/student/classes/join">Join class</Link></Button></div>}</section></main>;
}
