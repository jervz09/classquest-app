import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/quizzes/quiz-forms";
import { createClient } from "@/lib/supabase/server";
import { saveQuestionAction } from "@/server/actions/quizzes";
export default async function EditQuestionPage({ params }: PageProps<"/teacher/quizzes/[quizId]/questions/[questionId]/edit">) { const { quizId, questionId } = await params; const supabase = await createClient(); const { data: question } = await supabase.from("questions").select("id, question_text, question_type, choices, correct_answer, points").eq("id", questionId).eq("quiz_id", quizId).single(); if (!question) notFound(); return <main className="mx-auto max-w-2xl px-5 py-10"><Link href={`/teacher/quizzes/${quizId}`} className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to quiz</Link><section className="mt-6 rounded-3xl border bg-card p-6 sm:p-8"><h1 className="text-3xl font-bold">Edit question</h1><div className="mt-7"><QuestionForm action={saveQuestionAction.bind(null, quizId, questionId)} defaults={question} submitLabel="Save question" /></div></section></main>; }
