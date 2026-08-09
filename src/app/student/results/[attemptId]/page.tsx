import { Award, CheckCircle2, CircleX, Medal, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { xpForLevel } from "@/lib/game/progression";
import { createClient } from "@/lib/supabase/server";

type AttemptReviewRow = {
  question_id: string;
  question_text: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points_awarded: number;
  points_possible: number;
  order_index: number;
};

export default async function StudentResultPage({ params }: PageProps<"/student/results/[attemptId]">) {
  const { attemptId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");

  const [{ data: attempt, error: attemptError }, { data: review, error: reviewError }, { data: progress }, { data: achievementRows }] = await Promise.all([
    supabase.from("attempts").select("id, score, total_questions, correct_answers, xp_earned, duration_seconds, completed_at, quizzes(title, subject), assignments(class_id)").eq("id", attemptId).eq("student_id", user.id).single(),
    supabase.rpc("get_attempt_review", { attempt_uuid: attemptId }),
    supabase.from("student_progress").select("xp, level, quizzes_completed").eq("student_id", user.id).single(),
    supabase.from("student_achievements").select("unlocked_at, achievements(slug, name, description)").eq("student_id", user.id),
  ]);

  if (attemptError || reviewError || !attempt) {
    console.error("[quiz:result] result unavailable", {
      attemptCode: attemptError?.code,
      attemptMessage: attemptError?.message,
      reviewCode: reviewError?.code,
      reviewMessage: reviewError?.message,
      attemptId,
      userId: user.id,
    });
    notFound();
  }

  const quiz = Array.isArray(attempt.quizzes) ? attempt.quizzes[0] : attempt.quizzes;
  const assignment = Array.isArray(attempt.assignments) ? attempt.assignments[0] : attempt.assignments;
  const completedAt = new Date(attempt.completed_at).getTime();
  const newlyUnlocked = (achievementRows ?? []).filter((row) => Math.abs(new Date(row.unlocked_at).getTime() - completedAt) < 10_000).flatMap((row) => Array.isArray(row.achievements) ? row.achievements : row.achievements ? [row.achievements] : []);
  const level = progress?.level ?? 1;
  const xp = progress?.xp ?? attempt.xp_earned;
  const levelStart = xpForLevel(level);
  const nextLevel = xpForLevel(level + 1);
  const levelProgress = Math.min(100, Math.max(0, ((xp - levelStart) / (nextLevel - levelStart)) * 100));

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-7 text-center sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><Trophy className="size-8" /></div>
          <p className="mt-5 font-semibold text-primary">Quest complete</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{quiz?.title ?? "Quiz result"}</h1>
          <p className="mt-3 text-muted-foreground">{attempt.score >= 80 ? "Excellent work—your algebra skills are growing!" : attempt.score >= 60 ? "Good effort. Review the answers and try the next quest." : "Every attempt builds mastery. Review each answer below."}</p>
        </div>
        <div className="grid gap-px border-t bg-border sm:grid-cols-3">
          <div className="bg-card p-6 text-center"><p className="text-4xl font-bold text-primary">{attempt.score}%</p><p className="mt-1 text-sm text-muted-foreground">Score</p></div>
          <div className="bg-card p-6 text-center"><p className="text-4xl font-bold">{attempt.correct_answers}/{attempt.total_questions}</p><p className="mt-1 text-sm text-muted-foreground">Correct answers</p></div>
          <div className="bg-card p-6 text-center"><p className="flex items-center justify-center gap-2 text-4xl font-bold text-amber-500"><Sparkles className="size-7" />+{attempt.xp_earned}</p><p className="mt-1 text-sm text-muted-foreground">XP earned</p></div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.65fr]">
        <section>
          <h2 className="text-xl font-semibold">Answer review</h2>
          <ol className="mt-4 space-y-3">
            {((review ?? []) as AttemptReviewRow[]).map((answer, index) => (
              <li key={answer.question_id} className={`rounded-2xl border p-5 ${answer.is_correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex gap-3">
                  {answer.is_correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" />}
                  <div>
                    <p className="font-semibold">{index + 1}. {answer.question_text}</p>
                    <p className="mt-2 text-sm"><span className="text-muted-foreground">Your answer:</span> {answer.selected_answer}</p>
                    {!answer.is_correct && <p className="mt-1 text-sm"><span className="text-muted-foreground">Correct answer:</span> <span className="font-medium text-emerald-600 dark:text-emerald-400">{answer.correct_answer}</span></p>}
                    <p className="mt-2 text-xs text-muted-foreground">{answer.points_awarded}/{answer.points_possible} points</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Medal className="text-primary" /><h2 className="font-semibold">Level {level}</h2></div><span className="text-sm font-medium">{xp} XP</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${levelProgress}%` }} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{nextLevel - xp} XP until Level {level + 1}</p>
          </section>
          {newlyUnlocked.length > 0 && <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"><div className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><Award /><h2 className="font-semibold">Achievement unlocked</h2></div>{newlyUnlocked.map((achievement) => <div key={achievement.slug} className="mt-3"><p className="font-semibold">{achievement.name}</p><p className="text-sm text-muted-foreground">{achievement.description}</p></div>)}</section>}
          <Button asChild className="w-full"><Link href={assignment?.class_id ? `/student/classes/${assignment.class_id}` : "/student/classes"}>Back to class</Link></Button>
        </aside>
      </div>
    </main>
  );
}
