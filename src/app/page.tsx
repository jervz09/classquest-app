import Link from "next/link";
import { BookOpenCheck, ChartNoAxesCombined, Sparkles, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const features = [
  [BookOpenCheck, "Playful quizzes", "Turn curriculum into focused challenges students enjoy completing."],
  [Sparkles, "Visible progress", "XP, levels, and achievements reward consistent learning."],
  [Trophy, "Friendly competition", "Private class leaderboards celebrate growth without exposing student data."],
  [ChartNoAxesCombined, "Useful insight", "See results and difficult questions, not invented vanity metrics."],
] as const;

export default function Home() {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-violet-100),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,oklch(0.28_0.12_292),transparent_34%)]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/" className="flex items-center gap-2 font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">CQ</span>ClassQuest</Link><ThemeToggle /></header>
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
      <div className="flex flex-col items-start justify-center"><span className="mb-5 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-primary">Learning, leveled up</span><h1 className="max-w-2xl text-5xl font-bold tracking-[-0.04em] text-balance sm:text-6xl">Turn lessons into quests.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">A gamified classroom platform where teachers create learning challenges and students learn through quizzes, XP, achievements, and friendly competition.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/register">Start Teaching</Link></Button><Button size="lg" variant="outline" asChild><Link href="/register">Join a Class</Link></Button><Button size="lg" variant="ghost" asChild><Link href="/login">Log in</Link></Button></div></div>
      <div className="rounded-3xl border bg-card/85 p-5 shadow-2xl shadow-primary/10 backdrop-blur sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today&apos;s quest</p><h2 className="text-xl font-semibold">Solar System Sprint</h2></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-400/20 dark:text-amber-200">+80 XP</span></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/4 rounded-full bg-primary" /></div><div className="mt-8 rounded-2xl border bg-background p-5"><p className="text-sm font-medium text-primary">Question 6 of 8</p><p className="mt-3 text-lg font-semibold">Which planet has the shortest year?</p><div className="mt-5 grid grid-cols-2 gap-3">{["Venus", "Mercury", "Mars", "Jupiter"].map((answer, index) => <div key={answer} className={`rounded-xl border p-3 text-sm font-medium ${index === 1 ? "border-primary bg-primary/10 text-primary" : "bg-card"}`}>{answer}</div>)}</div></div><div className="mt-5 flex items-center justify-between rounded-2xl bg-muted/70 p-4"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Class rank</p><p className="font-semibold">#3 · Level 7</p></div><Trophy className="text-amber-500" aria-hidden="true" /></div></div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{features.map(([Icon, title, text]) => <article key={title} className="rounded-2xl border bg-card p-5"><Icon className="mb-4 text-primary" aria-hidden="true" /><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</section>
  </main>;
}
