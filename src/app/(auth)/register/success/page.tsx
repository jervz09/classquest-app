import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Check your email | ClassQuest" };

export default function RegistrationSuccessPage() {
  return (
    <AuthShell title="Check your email" description="Your ClassQuest account was created successfully.">
      <div role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <MailCheck aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-emerald-800 dark:text-emerald-200">Verification email sent</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-200/80">
              Open the message from ClassQuest and select the verification link before signing in.
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
        <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Check your spam or junk folder if it is not in your inbox.</li>
        <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Use the latest verification email if you requested more than one.</li>
      </ul>

      <Button className="mt-7 w-full" size="lg" asChild>
        <Link href="/login">Continue to log in</Link>
      </Button>
    </AuthShell>
  );
}
