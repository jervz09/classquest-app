import { Crown, Medal, Trophy } from "lucide-react";

export type LeaderboardEntry = {
  rank: number;
  student_id: string;
  full_name: string;
  xp: number;
  level: number;
  quizzes_completed: number;
};

function rankStyle(rank: number) {
  if (rank === 1) return "border-amber-400/50 bg-amber-500/10";
  if (rank === 2) return "border-slate-400/50 bg-slate-400/10";
  if (rank === 3) return "border-orange-500/40 bg-orange-500/10";
  return "bg-card";
}

export function Leaderboard({ entries, currentStudentId }: { entries: LeaderboardEntry[]; currentStudentId?: string }) {
  if (!entries.length) return <div className="rounded-3xl border border-dashed bg-card p-10 text-center"><Trophy className="mx-auto text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">No rankings yet</h2><p className="mt-2 text-muted-foreground">Students will appear after joining this class.</p></div>;

  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const isCurrentStudent = entry.student_id === currentStudentId;
        return (
          <li key={entry.student_id} className={`flex items-center gap-4 rounded-2xl border p-4 sm:p-5 ${rankStyle(entry.rank)} ${isCurrentStudent ? "ring-2 ring-primary/40" : ""}`}>
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-background/80 font-bold shadow-sm">
              {entry.rank === 1 ? <Crown className="text-amber-500" /> : entry.rank <= 3 ? <Medal className={entry.rank === 2 ? "text-slate-500" : "text-orange-600"} /> : entry.rank}
            </div>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-semibold">{entry.full_name}</p>{isCurrentStudent && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">You</span>}</div><p className="mt-1 text-sm text-muted-foreground">Level {entry.level} · {entry.quizzes_completed} {entry.quizzes_completed === 1 ? "quiz" : "quizzes"} completed</p></div>
            <div className="text-right"><p className="text-xl font-bold text-primary">{entry.xp}</p><p className="text-xs text-muted-foreground">XP</p></div>
          </li>
        );
      })}
    </ol>
  );
}
