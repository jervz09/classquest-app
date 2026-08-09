# ClassQuest

ClassQuest is a gamified classroom learning platform where teachers create quiz quests and students earn XP, level up, unlock achievements, and compete on private class leaderboards.

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui, Motion, Supabase Auth/PostgreSQL/RLS, Zod, Vitest, pnpm, GitHub Actions, and Vercel.

## Local setup

Prerequisites: Node.js 24+ and pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

In Supabase, open **Project Settings → API**. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL` and the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Older projects may label the publishable key as the anon key. Never put a service-role key in a `NEXT_PUBLIC_*` variable.

The trusted registration Server Action also requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. This variable is server-only and must never be exposed to browser code, committed, logged, or shared in chat.

In Supabase **Authentication → URL Configuration**, configure:

```text
Site URL: http://localhost:3000
Redirect URLs:
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/update-password
```

Add the equivalent HTTPS URLs when a Vercel preview or production domain is available. `/auth/callback` handles the default PKCE email confirmation and recovery flow. `/auth/confirm` supports token-hash email templates.

## Database

The repository is the schema source of truth. The initial migration is:

`supabase/migrations/20260808000000_initial_classquest_schema.sql`

### Hosted project status

- Project: **ClassQuest**
- Project ref: `edfganqqeyoulxnduezk` (public identifier, not a credential)
- Initial migration applied successfully on **August 8, 2026**
- Applied migration: `20260808000000_initial_classquest_schema.sql`
- Supabase reported that the pre-existing `pgcrypto` extension was retained; this is expected because the migration uses `create extension if not exists`.

The migration was previewed before application:

```bash
pnpm dlx supabase@2.109.0 link --project-ref edfganqqeyoulxnduezk
pnpm dlx supabase@2.109.0 db push --dry-run
pnpm dlx supabase@2.109.0 db push
```

CLI `2.109.0` was pinned because `2.110.0` failed while parsing the Management API's `inserted_at` timestamp during `supabase link`. Version `2.109.0` linked and pushed successfully. Re-test newer CLI releases before changing the pinned version.

To use a local Supabase stack:

```bash
pnpm dlx supabase@2.109.0 start
pnpm dlx supabase@2.109.0 db reset
pnpm dlx supabase@2.109.0 gen types typescript --local > src/types/database.ts
```

To apply to the existing hosted project, first review the SQL, install/authenticate the Supabase CLI, then run:

```bash
pnpm dlx supabase@2.109.0 login
pnpm dlx supabase@2.109.0 link --project-ref YOUR_PROJECT_REF
pnpm dlx supabase@2.109.0 db push --dry-run
pnpm dlx supabase@2.109.0 db push
pnpm db:types
```

The project ref is in Supabase **Project Settings → General**. The final command changes the remote database; run it only after reviewing the dry run. Alternatively, paste the migration into the Supabase SQL Editor, but CLI migrations are preferred because they preserve version history.

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify
```

`src/types/database.ts` is generated from the applied Supabase schema. Regenerate and commit it after every schema migration.

## Application architecture

ClassQuest uses feature-organized Server Actions as its controller layer. UI forms import mutations from `src/server/actions/<feature>`, Zod schemas live in `src/lib/validations`, and trusted multi-table operations remain in version-controlled PostgreSQL functions.

See the [Server Action catalog](src/server/actions/README.md) for every mutation and the checklist for adding new features.

## Security model

- `student_progress` is the sole authority for mutable XP and level data.
- Signup metadata cannot directly grant teacher access. The profile trigger reads only protected `raw_app_meta_data`; a future trusted server registration flow must validate the requested role and set that field with server-only credentials.
- Students cannot select `questions` directly. `get_assignment_questions` returns only display-safe fields.
- `submit_quiz_attempt` validates access, scores private answers, writes analytics, awards XP, and unlocks achievements transactionally.
- Class codes are generated from a non-ambiguous random alphabet and joining happens only through `join_class_by_code`.
- Every classroom/user-data table has RLS enabled. Frontend role checks are never the authorization boundary.

## Authentication

Implemented flows:

- Email/password teacher and student registration
- Server-validated role assignment using a server-only admin client
- Email-confirmation callback with invalid/expired-link handling
- Login and logout
- Forgot-password and update-password flows
- Protected teacher and student layouts with database-backed role checks
- Generic recovery responses that do not reveal whether an email is registered

The service-role client is imported through a `server-only` module. Normal application reads remain subject to RLS; elevated access is limited to the registration role-assignment operation.

## Class workflow

Implemented flows:

- Teacher dashboard with real class, unique-student, and published-quiz counts
- Teacher class creation with server-generated collision-safe join codes
- Teacher class list and class details
- Copyable class code and enrolled-student roster
- Student dashboard with real progression and joined classes
- Secure student joining through `join_class_by_code` without exposing searchable class codes
- Student class details and assigned-quest empty state
- Friendly invalid-code, loading, success, and empty states

Class creation is protected by teacher RLS policies. Class joining and code resolution remain inside the authenticated database function; the browser never searches the `classes` table by code.

## Quiz workflow

Implemented flows:

- Teacher quiz list with draft/published and question-count states
- Quiz metadata creation and editing
- Multiple-choice and true/false question creation and editing
- Question validation, deletion, and atomic up/down reordering
- Publish/unpublish controls that require at least one question
- Assignment to owned classes with optional due dates and duplicate protection
- Student visibility of published assignments through existing RLS

Question reordering uses `supabase/migrations/20260809000000_secure_question_reordering.sql`. Apply pending migrations with a dry run before using the reorder controls:

```bash
pnpm dlx supabase@2.109.0 db push --dry-run
pnpm dlx supabase@2.109.0 db push
```

`supabase/migrations/20260809010000_fix_quiz_policy_recursion.sql` replaces cross-table quiz policies with security-definer boolean helpers. This prevents PostgreSQL `42P17` recursion while preserving teacher ownership and published-assignment access rules.

## Student gameplay

Classic Mode is implemented end to end:

- Assigned quiz cards link to a secure start screen and question-by-question game UI
- `get_assignment_questions` sends question text, choices, and points without exposing correct answers
- Students must answer every question before submitting their one allowed attempt
- `submit_quiz_attempt` calculates score, correct answers, and XP transactionally in PostgreSQL
- Results show score, XP, level progress, achievements, and a post-attempt answer review
- Completed assignments link back to their existing result instead of allowing duplicate attempts

`supabase/migrations/20260809020000_secure_quiz_gameplay_results.sql` hardens complete-answer validation and adds `get_attempt_review`, which reveals correct answers only after an authorized attempt exists.

## Teacher results and analytics

Teacher analytics are available at `/teacher/results`:

- Filter attempts by owned class and quiz
- Track completion count, average score, active students, and perfect scores
- Review per-student scores, correct answers, XP, class, and completion time
- Drill into a quiz to identify low-accuracy questions and individual student performance

Attempt rows remain protected by RLS. `supabase/migrations/20260809030000_teacher_quiz_analytics.sql` adds an ownership-checked aggregation RPC for per-question response counts and accuracy.

## Leaderboards and student progress

Class leaderboards are available from teacher and student class pages. Rankings display only student names, XP, level, and completed quizzes. `supabase/migrations/20260809040000_class_leaderboards.sql` restricts leaderboard access to the class teacher and enrolled students.

The student Progress page includes:

- Current XP, level, and progress toward the next level
- Quiz completion count and average score
- Locked and unlocked achievement cards
- Completed quiz history with links back to answer reviews

## Deployment

Connect the GitHub repository to Vercel and configure the two public Supabase variables plus the server-only service-role variable for registration. Scope Preview and Production credentials deliberately; never expose the service-role key to the browser. Vercel Git integration handles deployments, while CI verifies lint, types, tests, and the production build.

Follow the complete [deployment runbook](docs/deployment.md) for migration order, environment setup, Preview smoke testing, production release, and rollback.

## Current scope

The complete MVP loop and initial production-hardening pass are ready. All migrations have been applied to the hosted project. The next release step is configuring Vercel environments and validating a Preview deployment before production promotion.
