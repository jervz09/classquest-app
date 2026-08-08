import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";

export function ClassCard({ classItem, href, studentCount }: { classItem: { name: string; section: string | null; subject: string | null; class_code?: string }; href: string; studentCount?: number }) {
  return <Link href={href} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">{classItem.subject || "ClassQuest class"}</p><h2 className="mt-1 text-xl font-semibold">{classItem.name}</h2><p className="mt-1 text-sm text-muted-foreground">{classItem.section || "No section"}</p></div><ArrowRight className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div>
    <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">{typeof studentCount === "number" && <span className="flex items-center gap-1.5"><Users className="size-4" />{studentCount} {studentCount === 1 ? "student" : "students"}</span>}<span className="flex items-center gap-1.5"><BookOpen className="size-4" />View class</span>{classItem.class_code && <span className="ml-auto font-mono font-semibold text-foreground">{classItem.class_code}</span>}</div>
  </Link>;
}
