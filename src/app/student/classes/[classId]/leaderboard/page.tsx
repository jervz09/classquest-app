import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Leaderboard, type LeaderboardEntry } from "@/components/classes/leaderboard";
import { createClient } from "@/lib/supabase/server";

export default async function StudentClassLeaderboardPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in to continue");
  const [{ data: classItem }, { data: entries, error }] = await Promise.all([
    supabase.from("classes").select("id, name, section").eq("id", classId).single(),
    supabase.rpc("get_class_leaderboard", { class_uuid: classId }),
  ]);
  if (!classItem) notFound();
  if (error) console.error("[student:leaderboard] RPC failed", { code: error.code, message: error.message, details: error.details, hint: error.hint, classId, userId: user.id });

  return <main className="mx-auto max-w-4xl px-5 py-10"><Link href={`/student/classes/${classId}`} className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to class</Link><div className="mt-7 flex items-start gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Trophy /></div><div><p className="font-medium text-primary">Class leaderboard</p><h1 className="mt-1 text-4xl font-bold tracking-tight">{classItem.name}</h1><p className="mt-2 text-muted-foreground">Earn XP from quizzes to climb the rankings.</p></div></div><section className="mt-8"><Leaderboard entries={(entries ?? []) as LeaderboardEntry[]} currentStudentId={user.id} /></section></main>;
}
