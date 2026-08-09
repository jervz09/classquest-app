import { ArrowLeft, BarChart3, CheckCircle2, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { oneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

type AttemptRow = {
  id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  xp_earned: number;
  completed_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
  assignments: ({ classes: { name: string } | { name: string }[] | null }) | ({ classes: { name: string } | { name: string }[] | null })[] | null;
};
type QuestionAnalyticsRow = { question_id: string; question_text: string; order_index: number; response_count: number; correct_count: number; accuracy: number };

type QuizResultsPageProps = { params: Promise<{ quizId: string }> };

export default async function TeacherQuizResultsPage({ params }: QuizResultsPageProps) {
  const { quizId } = await params;
  const supabase = await createClient();
  const [{ data: quiz }, { data: attemptsData, error: attemptsError }, { data: questionData, error: questionError }] = await Promise.all([
    supabase.from("quizzes").select("id, title, subject, difficulty").eq("id", quizId).single(),
    supabase.from("attempts").select("id, score, correct_answers, total_questions, xp_earned, completed_at, profiles!attempts_student_id_fkey(full_name), assignments(classes(name))").eq("quiz_id", quizId).order("completed_at", { ascending: false }),
    supabase.rpc("get_teacher_quiz_question_analytics", { quiz_uuid: quizId }),
  ]);
  if (!quiz) notFound();
  if (attemptsError || questionError) console.error("[teacher:quiz-analytics] query failed", { attemptsCode: attemptsError?.code, attemptsMessage: attemptsError?.message, questionCode: questionError?.code, questionMessage: questionError?.message, quizId });

  const attempts = (attemptsData ?? []) as AttemptRow[];
  const questions = (questionData ?? []) as QuestionAnalyticsRow[];
  const averageScore = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : 0;
  const perfectScores = attempts.filter((attempt) => attempt.score === 100).length;
  const averageAccuracy = questions.length ? Math.round(questions.reduce((sum, question) => sum + question.accuracy, 0) / questions.length) : 0;
  const metrics: { icon: LucideIcon; label: string; value: string | number }[] = [
    { icon: CheckCircle2, label: "Completions", value: attempts.length },
    { icon: BarChart3, label: "Average score", value: `${averageScore}%` },
    { icon: Target, label: "Question accuracy", value: `${averageAccuracy}%` },
    { icon: Trophy, label: "Perfect scores", value: perfectScores },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <Link href="/teacher/results" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All results</Link>
      <div className="mt-6"><p className="font-medium text-primary">{quiz.subject || "Quiz analytics"}</p><h1 className="mt-2 text-4xl font-bold tracking-tight">{quiz.title}</h1><p className="mt-2 capitalize text-muted-foreground">{quiz.difficulty} difficulty · Performance overview</p></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(({ icon: Icon, label, value }) => <section key={label} className="rounded-2xl border bg-card p-5"><Icon className="text-primary" /><p className="mt-4 text-3xl font-bold">{value}</p><h2 className="mt-1 text-sm text-muted-foreground">{label}</h2></section>)}</div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="text-xl font-semibold">Question performance</h2><p className="mt-1 text-sm text-muted-foreground">Low accuracy highlights concepts that may need review.</p></div>{questions.length ? <ol className="divide-y">{questions.map((question, index) => <li key={question.question_id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{index + 1}. {question.question_text}</p><p className="mt-1 text-sm text-muted-foreground">{question.correct_count}/{question.response_count} correct</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold ${question.accuracy >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : question.accuracy >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"}`}>{question.accuracy}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${question.accuracy >= 80 ? "bg-emerald-500" : question.accuracy >= 60 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${question.accuracy}%` }} /></div></li>)}</ol> : <p className="p-8 text-center text-muted-foreground">No questions available.</p>}</section>

        <section className="rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="text-xl font-semibold">Student results</h2></div>{attempts.length ? <ul className="divide-y">{attempts.map((attempt) => { const profile = oneRelation(attempt.profiles); const assignment = oneRelation(attempt.assignments); const classItem = oneRelation(assignment?.classes); return <li key={attempt.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold">{profile?.full_name ?? "Student"}</p><p className="mt-1 text-sm text-muted-foreground">{classItem?.name ?? "Class"} · {attempt.correct_answers}/{attempt.total_questions} correct</p></div><div className="text-right"><p className="text-xl font-bold">{attempt.score}%</p><p className="text-xs text-amber-600">+{attempt.xp_earned} XP</p></div></li>; })}</ul> : <div className="p-8 text-center"><h3 className="font-semibold">No attempts yet</h3><p className="mt-2 text-sm text-muted-foreground">Results appear when students complete this quiz.</p></div>}</section>
      </div>
    </main>
  );
}
