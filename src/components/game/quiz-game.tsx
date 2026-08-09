"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Gamepad2, ShieldCheck, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { initialQuizSubmissionState, type QuizSubmissionState } from "@/lib/validations/game";

type Question = {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  points: number;
};

type SubmitAction = (state: QuizSubmissionState, formData: FormData) => Promise<QuizSubmissionState>;

export function QuizGame({ title, description, gameMode, questions, action }: {
  title: string;
  description: string | null;
  gameMode: string;
  questions: Question[];
  action: SubmitAction;
}) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState(action, initialQuizSubmissionState);
  const reduceMotion = useReducedMotion();
  const current = questions[currentIndex];
  const selected = current ? answers[current.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === questions.length - 1;

  if (!started) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Gamepad2 className="size-7" /></div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">{gameMode.replace("_", " ")} quest</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{description || "Complete every question and earn XP for your progress."}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted p-4"><p className="text-2xl font-bold">{questions.length}</p><p className="text-sm text-muted-foreground">Questions</p></div>
          <div className="rounded-2xl bg-muted p-4"><p className="text-2xl font-bold">{questions.reduce((sum, question) => sum + question.points, 0)}</p><p className="text-sm text-muted-foreground">Total points</p></div>
          <div className="rounded-2xl bg-muted p-4"><ShieldCheck className="mb-1 text-emerald-500" /><p className="text-sm text-muted-foreground">One secure attempt</p></div>
        </div>
        <Button className="mt-8 h-11 px-5" onClick={() => setStarted(true)}><Sparkles />Start quest</Button>
      </section>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl">
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />
      <div className="mb-5 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
        <span className="text-muted-foreground">{answeredCount}/{questions.length} answered</span>
      </div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-muted" aria-label={`${Math.round(((currentIndex + 1) / questions.length) * 100)}% complete`}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>
      {state.message && <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={current.id}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
          className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold leading-snug">{current.questionText}</h2>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{current.points} pts</span>
          </div>
          <fieldset className="mt-7 grid gap-3">
            <legend className="sr-only">Choose your answer</legend>
            {current.choices.map((choice) => {
              const checked = selected === choice;
              return (
                <label key={choice} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${checked ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:border-primary/40 hover:bg-muted/60"}`}>
                  <input className="sr-only" type="radio" name={`question-${current.id}`} value={choice} checked={checked} onChange={() => setAnswers((previous) => ({ ...previous, [current.id]: choice }))} />
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{checked && <Check className="size-4" />}</span>
                  <span className="font-medium">{choice}</span>
                </label>
              );
            })}
          </fieldset>
        </motion.section>
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between gap-4">
        <Button type="button" variant="outline" disabled={currentIndex === 0 || pending} onClick={() => setCurrentIndex((index) => index - 1)}><ArrowLeft />Previous</Button>
        {isLast ? (
          <Button type="submit" className="h-10 px-5" disabled={!selected || answeredCount !== questions.length || pending}>{pending ? "Submitting…" : "Finish quest"}<Sparkles /></Button>
        ) : (
          <Button type="button" disabled={!selected || pending} onClick={() => setCurrentIndex((index) => index + 1)}>Next<ArrowRight /></Button>
        )}
      </div>
    </form>
  );
}
