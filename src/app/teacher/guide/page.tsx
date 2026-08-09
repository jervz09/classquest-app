import type { Metadata } from "next";
import { BarChart3, BookOpenCheck, CirclePlus, Send, Trophy, Users } from "lucide-react";
import { GettingStartedGuide, type GuideStep } from "@/components/getting-started-guide";

export const metadata: Metadata = { title: "Teacher Guide | ClassQuest" };

const steps: GuideStep[] = [
  {
    title: "Create your class",
    description: "Set up a classroom with a name, subject, and section. ClassQuest will generate a unique join code for your students.",
    icon: Users,
    href: "/teacher/classes/new",
    action: "Create a class",
    tips: ["Share the six-character code only with students who belong in the class."],
  },
  {
    title: "Invite your students",
    description: "Open the class page and give students its join code. Students will appear in your class roster after joining.",
    icon: Send,
    href: "/teacher/classes",
    action: "View classes",
    tips: ["Students need a verified ClassQuest student account before they can join."],
  },
  {
    title: "Build a quiz",
    description: "Create a quiz, then add multiple-choice or true-or-false questions. You can edit and reorder questions before publishing.",
    icon: CirclePlus,
    href: "/teacher/quizzes/new",
    action: "Create a quiz",
    tips: ["Set the correct answer and points for every question.", "Preview your question order before publishing."],
  },
  {
    title: "Publish and assign it",
    description: "Publish the finished quiz, choose a class, and optionally add a due date. Assigned quizzes immediately appear for students in that class.",
    icon: BookOpenCheck,
    href: "/teacher/quizzes",
    action: "Manage quizzes",
    tips: ["A quiz must be published before it can be assigned."],
  },
  {
    title: "Review results",
    description: "Track attempts, scores, accuracy, and question performance from the Results area after students submit their quizzes.",
    icon: BarChart3,
    href: "/teacher/results",
    action: "View results",
  },
  {
    title: "Celebrate progress",
    description: "Open a class leaderboard to see earned XP, completed quizzes, and student rankings. Use it to recognize effort and improvement.",
    icon: Trophy,
    href: "/teacher/classes",
    action: "Open a class",
  },
];

export default function TeacherGuidePage() {
  return <GettingStartedGuide audience="Teacher" title="Teach with ClassQuest" description="From creating your first classroom to reviewing quiz performance, follow these steps to run a complete learning quest." steps={steps} />;
}
