import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { logoutAction } from "@/server/actions/auth";
export function AppHeader({ name, role }: { name: string; role: "teacher" | "student" }) {
  const home = `/${role}`; const classes = `/${role}/classes`;
  return <header className="border-b bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4"><div className="flex items-center gap-5"><Link href={home} className="font-bold">ClassQuest</Link><nav aria-label="Main navigation" className="hidden items-center gap-4 sm:flex"><Link href={classes} className="text-sm font-medium text-muted-foreground hover:text-foreground">Classes</Link>{role === "student" && <Link href="/student/progress" className="text-sm font-medium text-muted-foreground hover:text-foreground">Progress</Link>}{role === "teacher" && <><Link href="/teacher/quizzes" className="text-sm font-medium text-muted-foreground hover:text-foreground">Quizzes</Link><Link href="/teacher/results" className="text-sm font-medium text-muted-foreground hover:text-foreground">Results</Link></>}</nav></div><div className="flex items-center gap-2"><span className="hidden text-sm text-muted-foreground md:inline">{name}</span><ThemeToggle /><form action={logoutAction}><Button variant="outline" size="sm">Log out</Button></form></div></div></header>;
}
