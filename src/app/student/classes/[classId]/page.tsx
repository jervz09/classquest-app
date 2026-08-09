import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentClassPage({ params, searchParams }: PageProps<"/student/classes/[classId]">) {
  const { classId } = await params;
  const joined = (await searchParams).joined === "1";
  const supabase = await createClient();
  const [{ data: classItem }, { data: assignments, error: assignmentsError }] = await Promise.all([
    supabase.from("classes").select("id, name, section, subject").eq("id", classId).single(),
    supabase.from("assignments").select("id, due_at, quizzes(id, title, description, subject, difficulty, game_mode)").eq("class_id", classId).order("created_at", { ascending: false }),
  ]);

  if (!classItem) notFound();
  if (assignmentsError) {
    console.error("[student:assignments] query failed", {
      code: assignmentsError.code,
      message: assignmentsError.message,
      details: assignmentsError.details,
      hint: assignmentsError.hint,
      classId,
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/student/classes" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All classes</Link>
      {joined && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" />You joined the class successfully.</p>}
      <section className="mt-6 rounded-3xl border bg-card p-6 sm:p-8">
        <p className="font-medium text-primary">{classItem.subject || "ClassQuest class"}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{classItem.name}</h1>
        <p className="mt-2 text-muted-foreground">{classItem.section || "No section"}</p>
      </section>
      <section className="mt-8">
        <div className="flex items-center gap-2"><BookOpen className="text-primary" /><h2 className="text-xl font-semibold">Assigned quests</h2></div>
        {assignments?.length ? (
          <div className="mt-4 grid gap-4">
            {assignments.map((assignment) => {
              const quiz = Array.isArray(assignment.quizzes) ? assignment.quizzes[0] : assignment.quizzes;
              return (
                <article key={assignment.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-sm font-medium capitalize text-primary">{quiz?.difficulty} · {quiz?.game_mode?.replace("_", " ")}</p>
                      <h3 className="mt-1 text-lg font-semibold">{quiz?.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{quiz?.description || "A new learning quest awaits."}</p>
                    </div>
                    {assignment.due_at && <p className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground"><CalendarDays className="size-4" />Due {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(assignment.due_at))}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed bg-card p-10 text-center"><h3 className="font-semibold">You&apos;re all caught up!</h3><p className="mt-2 text-muted-foreground">Your teacher hasn’t assigned a quest yet.</p></div>
        )}
      </section>
    </main>
  );
}
