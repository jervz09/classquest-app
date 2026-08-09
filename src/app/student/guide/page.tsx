import type { Metadata } from "next";
import { BookOpen, DoorOpen, Medal, Send, Trophy } from "lucide-react";
import { GettingStartedGuide, type GuideStep } from "@/components/getting-started-guide";

export const metadata: Metadata = { title: "Student Guide | ClassQuest" };

const steps: GuideStep[] = [
  {
    title: "Get your class code",
    description: "Ask your teacher for the unique six-character code for your classroom. Each class has its own code.",
    icon: DoorOpen,
    tips: ["Make sure you are signed in with a verified student account."],
  },
  {
    title: "Join the class",
    description: "Enter the code on the Join class page. Once accepted, the classroom will appear on your dashboard.",
    icon: Send,
    href: "/student/classes/join",
    action: "Join a class",
    tips: ["Class codes are not case-sensitive.", "Check the code with your teacher if the class cannot be found."],
  },
  {
    title: "Open an assignment",
    description: "Choose your class to see quizzes assigned by your teacher, including their due dates and completion status.",
    icon: BookOpen,
    href: "/student/classes",
    action: "View classes",
  },
  {
    title: "Complete the quiz",
    description: "Read each question carefully, select an answer, and submit the quiz when you are finished. Your result is saved automatically after submission.",
    icon: Medal,
    tips: ["Check all your answers before submitting.", "Do not refresh or close the page while taking a quiz."],
  },
  {
    title: "Track your progress",
    description: "Review your scores, earned XP, level, and completed quizzes. Visit the class leaderboard to see how your progress compares with classmates.",
    icon: Trophy,
    href: "/student/progress",
    action: "View progress",
  },
];

export default function StudentGuidePage() {
  return <GettingStartedGuide audience="Student" title="Start your ClassQuest adventure" description="Join your classroom, complete assigned quizzes, and watch your XP and progress grow." steps={steps} />;
}
