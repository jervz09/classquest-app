import { Award, CheckCircle2, Flame, Medal, ScrollText, Sparkles, Timer, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { xpForLevel } from "@/lib/game/progression";
import { oneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

type AttemptRow = { id: string; score: number; correct_answers: number; total_questions: number; xp_earned: number; completed_at: string; quizzes: { title: string; subject: string | null } | { title: string; subject: string | null }[] | null };
type AchievementRow = { id: string; slug: string; name: string; description: string; icon: string };

const achievementIcons: Record<string, LucideIcon> = { scroll: ScrollText, sparkles: Sparkles, flame: Flame, timer: Timer };

export default async function StudentProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");

  const [{ data: profile }, { data: progress }, { data: attemptsData }, { data: achievementsData }, { data: unlocks }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("student_progress").select("xp, level, quizzes_completed").eq("student_id", user.id).single(),
    supabase.from("attempts").select("id, score, correct_answers, total_questions, xp_earned, completed_at, quizzes(title, subject)").eq("student_id", user.id).order("completed_at", { ascending: false }),
    supabase.from("achievements").select("id, slug, name, description, icon").order("created_at"),
    supabase.from("student_achievements").select("achievement_id, unlocked_at").eq("student_id", user.id),
  ]);

  const attempts = (attemptsData ?? []) as AttemptRow[];
  const achievements = (achievementsData ?? []) as AchievementRow[];
  const unlockedById = new Map((unlocks ?? []).map((unlock) => [unlock.achievement_id, unlock.unlocked_at]));
  const xp = progress?.xp ?? 0;
  const level = progress?.level ?? 1;
  const levelStart = xpForLevel(level);
  const nextLevel = xpForLevel(level + 1);
  const levelPercent = Math.min(100, Math.max(0, ((xp - levelStart) / (nextLevel - levelStart)) * 100));
  const averageScore = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div><p className="font-medium text-primary">Student progress</p><h1 className="mt-2 text-4xl font-bold tracking-tight">{profile?.full_name ?? "Your"}’s quest log</h1><p className="mt-3 text-muted-foreground">Track your XP, quiz history, and unlocked achievements.</p></div>

      <section className="mt-8 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><Medal className="size-8" /></div><div><p className="text-sm font-medium text-primary">Current level</p><p className="text-4xl font-bold">Level {level}</p></div></div><div className="sm:text-right"><p className="text-3xl font-bold">{xp} XP</p><p className="text-sm text-muted-foreground">{nextLevel - xp} XP to Level {level + 1}</p></div></div><div className="mt-7 h-3 overflow-hidden rounded-full bg-background/70"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${levelPercent}%` }} /></div><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{levelStart} XP</span><span>{nextLevel} XP</span></div></div>
        <div className="grid gap-px border-t bg-border sm:grid-cols-3"><div className="bg-card p-5 text-center"><p className="text-3xl font-bold">{progress?.quizzes_completed ?? 0}</p><p className="text-sm text-muted-foreground">Quizzes completed</p></div><div className="bg-card p-5 text-center"><p className="text-3xl font-bold">{averageScore}%</p><p className="text-sm text-muted-foreground">Average score</p></div><div className="bg-card p-5 text-center"><p className="text-3xl font-bold">{unlocks?.length ?? 0}/{achievements.length}</p><p className="text-sm text-muted-foreground">Achievements</p></div></div>
      </section>

      <section className="mt-10"><div className="flex items-center gap-2"><Award className="text-primary" /><h2 className="text-xl font-semibold">Achievements</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{achievements.map((achievement) => { const unlockedAt = unlockedById.get(achievement.id); const Icon = achievementIcons[achievement.icon] ?? Trophy; return <article key={achievement.id} className={`rounded-2xl border p-5 ${unlockedAt ? "bg-card" : "border-dashed bg-muted/30 opacity-65"}`}><div className={`grid size-11 place-items-center rounded-xl ${unlockedAt ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}><Icon /></div><h3 className="mt-4 font-semibold">{achievement.name}</h3><p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p><p className="mt-4 flex items-center gap-1.5 text-xs font-medium">{unlockedAt ? <><CheckCircle2 className="size-4 text-emerald-500" />Unlocked {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(unlockedAt))}</> : "Locked"}</p></article>; })}</div></section>

      <section className="mt-10 rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="text-xl font-semibold">Quiz history</h2><p className="mt-1 text-sm text-muted-foreground">Review your completed learning quests.</p></div>{attempts.length ? <ul className="divide-y">{attempts.map((attempt) => { const quiz = oneRelation(attempt.quizzes); return <li key={attempt.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><p className="text-sm font-medium text-primary">{quiz?.subject || "Quiz"}</p><h3 className="mt-1 font-semibold">{quiz?.title ?? "Completed quiz"}</h3><p className="mt-1 text-sm text-muted-foreground">{attempt.correct_answers}/{attempt.total_questions} correct · +{attempt.xp_earned} XP · {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(attempt.completed_at))}</p></div><div className="flex items-center gap-3"><span className="text-2xl font-bold">{attempt.score}%</span><Button variant="outline" asChild><Link href={`/student/results/${attempt.id}`}>Review</Link></Button></div></li>; })}</ul> : <div className="p-10 text-center"><h3 className="font-semibold">No completed quizzes yet</h3><p className="mt-2 text-sm text-muted-foreground">Your results and XP history will appear here.</p><Button className="mt-5" asChild><Link href="/student/classes">View classes</Link></Button></div>}</section>
    </main>
  );
}
