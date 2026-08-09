import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GuideStep = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  action?: string;
  tips?: string[];
};

type GettingStartedGuideProps = {
  audience: "Teacher" | "Student";
  title: string;
  description: string;
  steps: GuideStep[];
};

export function GettingStartedGuide({ audience, title, description, steps }: GettingStartedGuideProps) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="font-medium text-primary">{audience} guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p>
      </div>

      <ol className="mt-10 space-y-5">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <li key={step.title} className="relative rounded-3xl border bg-card p-6 sm:p-8">
              <div className="flex gap-5">
                <div className="relative shrink-0">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                  <p className="mt-2 leading-7 text-muted-foreground">{step.description}</p>
                  {step.tips && (
                    <ul className="mt-4 space-y-2">
                      {step.tips.map((tip) => (
                        <li key={tip} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.href && step.action && (
                    <Button className="mt-5" variant="outline" asChild>
                      <Link href={step.href}>{step.action}<ArrowRight aria-hidden="true" /></Link>
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
