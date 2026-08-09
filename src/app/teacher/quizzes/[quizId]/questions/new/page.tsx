import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuestionForm } from "@/components/quizzes/quiz-forms";
import { saveQuestionAction } from "../../../actions";
export default async function NewQuestionPage({ params }: PageProps<"/teacher/quizzes/[quizId]/questions/new">) { const { quizId } = await params; return <main className="mx-auto max-w-2xl px-5 py-10"><Link href={`/teacher/quizzes/${quizId}`} className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to quiz</Link><section className="mt-6 rounded-3xl border bg-card p-6 sm:p-8"><h1 className="text-3xl font-bold">Add a question</h1><p className="mb-7 mt-2 text-muted-foreground">Correct answers stay private from students.</p><QuestionForm action={saveQuestionAction.bind(null, quizId, null)} submitLabel="Add question" /></section></main>; }
