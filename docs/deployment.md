# ClassQuest deployment runbook

ClassQuest uses GitHub → Vercel → Supabase. Vercel Git integration should create Preview deployments for pull requests and deploy `main` to Production only after CI passes.

## 1. Preflight

From a clean checkout:

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm verify
git status --short
```

`pnpm verify` must pass and the worktree must be clean before deployment.

## 2. Database migrations

Link the intended Supabase project and inspect pending migrations before deploying application code:

```bash
pnpm dlx supabase@2.109.0 link --project-ref YOUR_PROJECT_REF
pnpm dlx supabase@2.109.0 db push --dry-run
pnpm dlx supabase@2.109.0 db push
pnpm db:types
```

Review generated type changes and commit them with the migration. Never point a Preview deployment at a production database when testing destructive or incompatible migrations.

## 3. Vercel project configuration

Import the GitHub repository into Vercel with:

- Framework preset: Next.js
- Root directory: repository root
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Node.js version: 24.x

Configure these variables separately for Development, Preview, and Production:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key is sensitive and server-only. Never prefix it with `NEXT_PUBLIC_`, expose it in logs, or reuse a production key in untrusted Preview deployments.

## 4. Supabase authentication URLs

In Supabase Authentication URL configuration:

- Set the production Site URL to the final Vercel/custom domain.
- Add `<production-url>/auth/callback`, `<production-url>/auth/confirm`, and `<production-url>/update-password` to Redirect URLs.
- Add approved Vercel Preview callback patterns only when Preview authentication is required.
- Keep localhost callback URLs for local development.

If an email verification link points to `localhost:3000` in production, the production URL is missing from this configuration or the email template is not using Supabase's `{{ .ConfirmationURL }}` value. Update the Site URL and Redirect URLs, then send a new verification email; previously sent links do not change.

The application callback path is `/auth/callback`; email verification uses `/auth/confirm`.

## 5. Preview smoke test

Before promotion, verify on the Preview URL:

1. Register and verify one teacher and one student.
2. Create a class and join it using the class code.
3. Create, publish, and assign a quiz.
4. Complete the quiz as the student.
5. Confirm score, XP, achievement, leaderboard, and progress history.
6. Confirm teacher results and question analytics.
7. Check mobile layout, dark mode, 404, and sign-out behavior.
8. Inspect Vercel runtime logs for new errors.

## 6. Production release

With Git integration, merge the validated commit to `main`. Prefer promoting the exact tested Preview artifact when the team uses manual promotion. After release, repeat the critical smoke flow against Production without creating unnecessary permanent data.

## 7. Rollback

If the application deployment fails, roll back or promote the last known-good Vercel deployment. Database migrations are forward-only: fix schema problems with a new migration rather than editing or deleting an applied migration.

Record the failed deployment URL, commit SHA, runtime error, and corrective migration or code commit.
