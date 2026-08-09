import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5 py-12"><section className="max-w-lg text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Compass className="size-8" /></div><p className="mt-6 font-medium text-primary">404 · Quest not found</p><h1 className="mt-2 text-4xl font-bold tracking-tight">This path is off the map</h1><p className="mt-3 text-muted-foreground">The page may have moved, or you may not have access to this quest.</p><Button className="mt-7" asChild><Link href="/">Return to ClassQuest</Link></Button></section></main>;
}
