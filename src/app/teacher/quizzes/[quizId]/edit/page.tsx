import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { QuizForm } from "@/components/quizzes/quiz-forms";
import { createClient } from "@/lib/supabase/server";
import { updateQuizAction } from "@/server/actions/quizzes";
export default async function EditQuizPage({ params }: PageProps<"/teacher/quizzes/[quizId]/edit">) { const { quizId } = await params; const supabase = await createClient(); const { data: quiz } = await supabase.from("quizzes").select("id, title, description, subject, difficulty, game_mode").eq("id", quizId).single(); if (!quiz) notFound(); return <main className="mx-auto max-w-2xl px-5 py-10"><Link href={`/teacher/quizzes/${quizId}`} className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to quiz</Link><section className="mt-6 rounded-3xl border bg-card p-6 sm:p-8"><h1 className="text-3xl font-bold">Edit quiz details</h1><div className="mt-7"><QuizForm action={updateQuizAction.bind(null, quizId)} defaults={quiz} submitLabel="Save changes" /></div></section></main>; }
