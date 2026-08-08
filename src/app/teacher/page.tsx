import Link from "next/link";
import { BookOpen, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: classes }, { count: activeQuizzes }] = await Promise.all([
    supabase.from("classes").select("id").eq("teacher_id", user!.id),
    supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("teacher_id", user!.id).eq("is_published", true),
  ]);
  const classIds = classes?.map((item) => item.id) ?? [];
  const { data: memberships } = classIds.length ? await supabase.from("class_members").select("student_id").in("class_id", classIds) : { data: [] };
  const uniqueStudents = new Set(memberships?.map((item) => item.student_id)).size;
  const stats = [[Users, "Classes", classIds.length], [Users, "Students", uniqueStudents], [BookOpen, "Active quizzes", activeQuizzes ?? 0]] as const;

  return <main className="mx-auto max-w-6xl px-5 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-medium text-primary">Teacher dashboard</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Build your next learning quest</h1><p className="mt-3 text-muted-foreground">Create a class, invite students, then assign their first quiz.</p></div><Button asChild><Link href="/teacher/classes/new"><Plus />Create class</Link></Button></div><div className="mt-10 grid gap-4 sm:grid-cols-3">{stats.map(([Icon, label, value]) => <section key={label} className="rounded-2xl border bg-card p-6"><Icon className="text-primary" /><p className="mt-5 text-3xl font-bold">{value}</p><h2 className="mt-1 text-sm text-muted-foreground">{label}</h2></section>)}</div>{classIds.length === 0 && <section className="mt-10 rounded-3xl border border-dashed bg-card p-10 text-center"><h2 className="text-xl font-semibold">Create your first classroom</h2><p className="mx-auto mt-2 max-w-md text-muted-foreground">You’ll receive a secure join code to share with students.</p><Button className="mt-5" asChild><Link href="/teacher/classes/new">Create class</Link></Button></section>}</main>;
}
