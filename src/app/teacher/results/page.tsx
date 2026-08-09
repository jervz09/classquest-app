import { BarChart3, CheckCircle2, Filter, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { oneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

type NamedRelation = { id: string; name?: string; title?: string };
type AttemptRow = {
  id: string;
  student_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  xp_earned: number;
  completed_at: string;
  quizzes: NamedRelation | NamedRelation[] | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
  assignments: ({ classes: NamedRelation | NamedRelation[] | null }) | ({ classes: NamedRelation | NamedRelation[] | null })[] | null;
};

type ResultsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TeacherResultsPage({ searchParams }: ResultsPageProps) {
  const query = await searchParams;
  const classFilter = typeof query.classId === "string" ? query.classId : "all";
  const quizFilter = typeof query.quizId === "string" ? query.quizId : "all";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: attemptsData, error: attemptsError }, { data: classes }, { data: quizzes }] = await Promise.all([
    supabase.from("attempts").select("id, student_id, score, correct_answers, total_questions, xp_earned, completed_at, quizzes(id, title), profiles!attempts_student_id_fkey(full_name), assignments(classes(id, name))").order("completed_at", { ascending: false }),
    supabase.from("classes").select("id, name").eq("teacher_id", user!.id).order("name"),
    supabase.from("quizzes").select("id, title").eq("teacher_id", user!.id).order("title"),
  ]);

  if (attemptsError) console.error("[teacher:results] attempts query failed", { code: attemptsError.code, message: attemptsError.message, details: attemptsError.details, hint: attemptsError.hint, userId: user!.id });
  const attempts = (attemptsData ?? []) as AttemptRow[];
  const filtered = attempts.filter((attempt) => {
    const quiz = oneRelation(attempt.quizzes);
    const assignment = oneRelation(attempt.assignments);
    const classItem = oneRelation(assignment?.classes);
    return (quizFilter === "all" || quiz?.id === quizFilter) && (classFilter === "all" || classItem?.id === classFilter);
  });
  const averageScore = filtered.length ? Math.round(filtered.reduce((sum, attempt) => sum + attempt.score, 0) / filtered.length) : 0;
  const perfectScores = filtered.filter((attempt) => attempt.score === 100).length;
  const activeStudents = new Set(filtered.map((attempt) => attempt.student_id)).size;
  const metrics: { icon: LucideIcon; label: string; value: string | number }[] = [
    { icon: CheckCircle2, label: "Completions", value: filtered.length },
    { icon: BarChart3, label: "Average score", value: `${averageScore}%` },
    { icon: Users, label: "Active students", value: activeStudents },
    { icon: Trophy, label: "Perfect scores", value: perfectScores },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div><p className="font-medium text-primary">Teacher analytics</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Results and performance</h1><p className="mt-3 text-muted-foreground">Track completions, scores, and question-level learning gaps.</p></div>

      <form className="mt-8 flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end" method="get">
        <div className="flex items-center gap-2 self-start pb-2 text-sm font-semibold sm:self-end"><Filter className="size-4" />Filters</div>
        <label className="grid flex-1 gap-1.5 text-sm"><span className="font-medium">Class</span><select name="classId" defaultValue={classFilter} className="h-10 rounded-xl border bg-background px-3"><option value="all">All classes</option>{classes?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid flex-1 gap-1.5 text-sm"><span className="font-medium">Quiz</span><select name="quizId" defaultValue={quizFilter} className="h-10 rounded-xl border bg-background px-3"><option value="all">All quizzes</option>{quizzes?.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <Button type="submit">Apply filters</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value }) => <section key={label} className="rounded-2xl border bg-card p-5"><Icon className="text-primary" /><p className="mt-4 text-3xl font-bold">{value}</p><h2 className="mt-1 text-sm text-muted-foreground">{label}</h2></section>)}
      </div>

      <section className="mt-8 rounded-2xl border bg-card">
        <div className="border-b p-5"><h2 className="text-xl font-semibold">Student attempts</h2><p className="mt-1 text-sm text-muted-foreground">Newest completions appear first.</p></div>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/60 text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Quiz</th><th className="px-5 py-3 font-medium">Class</th><th className="px-5 py-3 font-medium">Score</th><th className="px-5 py-3 font-medium">Correct</th><th className="px-5 py-3 font-medium">Completed</th></tr></thead><tbody className="divide-y">{filtered.map((attempt) => { const quiz = oneRelation(attempt.quizzes); const assignment = oneRelation(attempt.assignments); const classItem = oneRelation(assignment?.classes); const profile = oneRelation(attempt.profiles); return <tr key={attempt.id}><td className="px-5 py-4 font-medium">{profile?.full_name ?? "Student"}</td><td className="px-5 py-4">{quiz ? <Link className="font-medium text-primary hover:underline" href={`/teacher/results/${quiz.id}`}>{quiz.title}</Link> : "Quiz"}</td><td className="px-5 py-4 text-muted-foreground">{classItem?.name ?? "Class"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 font-semibold ${attempt.score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : attempt.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"}`}>{attempt.score}%</span></td><td className="px-5 py-4">{attempt.correct_answers}/{attempt.total_questions}</td><td className="px-5 py-4 text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completed_at))}</td></tr>; })}</tbody></table></div> : <div className="p-10 text-center"><h3 className="font-semibold">No results for these filters</h3><p className="mt-2 text-sm text-muted-foreground">Student attempts will appear after assigned quizzes are completed.</p></div>}
      </section>
    </main>
  );
}
