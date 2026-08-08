import Link from "next/link";
import { Plus } from "lucide-react";
import { ClassCard } from "@/components/classes/class-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherClassesPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  const { data: classes } = await supabase.from("classes").select("id, name, section, subject, class_code, class_members(count)").eq("teacher_id", user!.id).order("created_at", { ascending: false });
  return <main className="mx-auto max-w-6xl px-5 py-10"><div className="flex items-end justify-between gap-4"><div><p className="font-medium text-primary">Classes</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Your classrooms</h1></div><Button asChild><Link href="/teacher/classes/new"><Plus />Create class</Link></Button></div>{classes?.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{classes.map((item) => <ClassCard key={item.id} classItem={item} studentCount={item.class_members?.[0]?.count ?? 0} href={`/teacher/classes/${item.id}`} />)}</div> : <section className="mt-10 rounded-3xl border border-dashed p-10 text-center"><h2 className="text-xl font-semibold">Create your first classroom</h2><p className="mt-2 text-muted-foreground">Your class join code will appear here.</p></section>}</main>;
}
