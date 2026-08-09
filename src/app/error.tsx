"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[app:error-boundary]", error); }, [error]);
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle /></div>
        <h1 className="mt-5 text-3xl font-bold">Your quest hit a snag</h1>
        <p className="mt-3 text-muted-foreground">The request could not be completed. Try again, or return to your dashboard.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <div className="mt-7 flex justify-center gap-3"><Button onClick={reset}><RotateCcw />Try again</Button><Button variant="outline" asChild><Link href="/">Go home</Link></Button></div>
      </section>
    </main>
  );
}
