import { notFound, redirect } from "next/navigation";
import { QuizGame } from "@/components/game/quiz-game";
import { createClient } from "@/lib/supabase/server";
import { submitQuizAction } from "@/server/actions/gameplay";

type AssignmentQuestionRow = {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  choices: unknown;
  points: number;
  order_index: number;
  game_mode: "classic" | "time_attack" | "survival";
};

export default async function AssignmentGamePage({ params }: PageProps<"/student/assignments/[assignmentId]">) {
  const { assignmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");

  const [{ data: assignment, error: assignmentError }, { data: questions, error: questionsError }, { data: attempt }] = await Promise.all([
    supabase.from("assignments").select("id, due_at, quizzes(title, description, game_mode)").eq("id", assignmentId).single(),
    supabase.rpc("get_assignment_questions", { assignment_uuid: assignmentId }),
    supabase.from("attempts").select("id").eq("assignment_id", assignmentId).eq("student_id", user.id).maybeSingle(),
  ]);

  if (attempt) redirect(`/student/results/${attempt.id}`);
  if (assignmentError || questionsError || !assignment || !questions?.length) {
    console.error("[quiz:play] assignment unavailable", {
      assignmentCode: assignmentError?.code,
      assignmentMessage: assignmentError?.message,
      questionsCode: questionsError?.code,
      questionsMessage: questionsError?.message,
      assignmentId,
      userId: user.id,
    });
    notFound();
  }

  const quiz = Array.isArray(assignment.quizzes) ? assignment.quizzes[0] : assignment.quizzes;
  if (!quiz) notFound();
  const safeQuestions = (questions as AssignmentQuestionRow[]).map((question) => ({
    id: question.id,
    questionText: question.question_text,
    questionType: question.question_type as "multiple_choice" | "true_false",
    choices: question.question_type === "true_false" ? ["true", "false"] : Array.isArray(question.choices) ? question.choices.filter((choice: unknown): choice is string => typeof choice === "string") : [],
    points: question.points,
  }));

  return <main className="px-5 py-10"><QuizGame title={quiz.title} description={quiz.description} gameMode={quiz.game_mode} questions={safeQuestions} action={submitQuizAction.bind(null, assignmentId)} /></main>;
}
