# Server Action catalog

This directory is ClassQuest's controller layer for user-triggered mutations. UI routes and forms import actions directly from the relevant feature module.

## Structure

```text
src/server/actions/
├── auth.ts       # Authentication and account lifecycle
├── classes.ts    # Teacher class creation and student joining
├── gameplay.ts   # Student quiz submission
├── quizzes.ts    # Quiz, question, publication, and assignment mutations
└── shared.ts     # Server-only authentication, form, and logging helpers
```

Do not create a single application-wide action file. Add an action to the existing feature module, or create a new feature module when the domain is distinct.

## Action list

| Action | Module | Validation | Authorization / authority | Result |
| --- | --- | --- | --- | --- |
| `loginAction` | `auth.ts` | `loginSchema` | Supabase Auth | Role dashboard redirect |
| `registerAction` | `auth.ts` | `registerSchema` | Server-only admin client for validated role metadata | Confirmation message or dashboard redirect |
| `forgotPasswordAction` | `auth.ts` | `forgotPasswordSchema` | Trusted request origin + Supabase Auth | Generic recovery message |
| `updatePasswordAction` | `auth.ts` | `updatePasswordSchema` | Authenticated Supabase session | Success state |
| `logoutAction` | `auth.ts` | — | Authenticated Supabase session | Login redirect |
| `createClassAction` | `classes.ts` | `createClassSchema` | Authenticated user + teacher RLS | Class detail redirect |
| `joinClassAction` | `classes.ts` | `joinClassSchema` | `join_class_by_code` RPC | Student class redirect |
| `createQuizAction` | `quizzes.ts` | `quizSchema` | Authenticated user + quiz RLS | Quiz builder redirect |
| `updateQuizAction` | `quizzes.ts` | `quizSchema` | Quiz ownership RLS | Quiz detail redirect |
| `saveQuestionAction` | `quizzes.ts` | `questionSchema` | Quiz ownership RLS | Quiz detail redirect |
| `deleteQuestionAction` | `quizzes.ts` | Bound IDs | Quiz ownership RLS | Revalidated quiz page |
| `reorderQuestionAction` | `quizzes.ts` | Bound IDs/direction | `reorder_question` RPC | Revalidated quiz page |
| `togglePublishAction` | `quizzes.ts` | Bound ID/state | Quiz ownership RLS | Revalidated quiz page |
| `assignQuizAction` | `quizzes.ts` | `assignmentSchema` | Class and quiz ownership RLS | Quiz detail redirect |
| `submitQuizAction` | `gameplay.ts` | `quizAnswersSchema` | `submit_quiz_attempt` authoritative RPC | Student result redirect |

## Adding a feature action

1. Add or update a Zod schema in `src/lib/validations/` and cover it with a unit test.
2. Add an exported `async` function to the relevant `"use server"` feature module.
3. Parse untrusted `FormData` before authentication or database work.
4. Call `requireActionUser()` for authenticated mutations. RLS or an ownership-checked RPC remains the real authorization boundary.
5. Keep multi-table trusted calculations in a PostgreSQL RPC/migration rather than browser or action code.
6. Use `logActionError()` with IDs and error metadata, never credentials, tokens, answers, or other secrets.
7. Return a typed form state for recoverable validation errors. Use `redirect` or `revalidatePath` after success.
8. Import the action directly from `@/server/actions/<feature>` in the page or server component.
9. Update this catalog and run `pnpm verify`.

## Boundaries

- Action modules may export only async Server Actions.
- Shared synchronous helpers belong in `shared.ts`, which is protected by `server-only`.
- Reads stay in Server Components unless an external API needs a Route Handler.
- Correct answers, XP, scores, and role assignment remain server/database authoritative.
- Avoid a barrel `index.ts`; direct feature imports make ownership and bundle boundaries explicit.
