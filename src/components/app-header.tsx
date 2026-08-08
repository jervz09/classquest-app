import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { logoutAction } from "@/app/(auth)/actions";
export function AppHeader({ name }: { name: string }) { return <header className="border-b bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/" className="font-bold">ClassQuest</Link><div className="flex items-center gap-2"><span className="hidden text-sm text-muted-foreground sm:inline">{name}</span><ThemeToggle /><form action={logoutAction}><Button variant="outline" size="sm">Log out</Button></form></div></div></header>; }
