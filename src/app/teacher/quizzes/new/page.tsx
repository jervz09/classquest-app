import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuizForm } from "@/components/quizzes/quiz-forms";
import { createQuizAction } from "@/server/actions/quizzes";
export default function NewQuizPage() { return <main className="mx-auto max-w-2xl px-5 py-10"><Link href="/teacher/quizzes" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to quizzes</Link><section className="mt-6 rounded-3xl border bg-card p-6 sm:p-8"><p className="font-medium text-primary">New quest</p><h1 className="mt-2 text-3xl font-bold">Create a quiz</h1><p className="mb-8 mt-2 text-muted-foreground">You can add questions and publish after saving these details.</p><QuizForm action={createQuizAction} submitLabel="Create quiz" /></section></main>; }
