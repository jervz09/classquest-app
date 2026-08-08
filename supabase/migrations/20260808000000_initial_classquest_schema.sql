begin;

create extension if not exists pgcrypto with schema extensions;
create type public.user_role as enum ('teacher', 'student');
create type public.quiz_difficulty as enum ('easy', 'medium', 'hard');
create type public.game_mode as enum ('classic', 'time_attack', 'survival');
create type public.question_type as enum ('multiple_choice', 'true_false');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  role public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.student_progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= current_streak),
  quizzes_completed integer not null default 0 check (quizzes_completed >= 0),
  updated_at timestamptz not null default now()
);
create table public.classes (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100), section text check (char_length(section) <= 50), subject text check (char_length(subject) <= 100),
  class_code text not null unique check (class_code ~ '^[A-Z2-9]{6}$'), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.class_members (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade, joined_at timestamptz not null default now(), unique (class_id, student_id)
);
create table public.quizzes (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 150), description text check (char_length(description) <= 2000), subject text check (char_length(subject) <= 100),
  difficulty public.quiz_difficulty not null default 'medium', game_mode public.game_mode not null default 'classic', is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.questions (
  id uuid primary key default gen_random_uuid(), quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null check (char_length(trim(question_text)) between 1 and 2000), question_type public.question_type not null,
  choices jsonb, correct_answer text not null check (char_length(trim(correct_answer)) > 0), points integer not null default 1 check (points between 1 and 100), order_index integer not null check (order_index >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (quiz_id, order_index),
  constraint valid_question_shape check (
    (question_type = 'multiple_choice' and jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 8 and choices ? correct_answer)
    or (question_type = 'true_false' and choices is null and lower(correct_answer) in ('true', 'false'))
  )
);
create table public.assignments (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade, due_at timestamptz, created_at timestamptz not null default now(), unique (class_id, quiz_id)
);
create table public.attempts (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete restrict, assignment_id uuid not null references public.assignments(id) on delete restrict,
  score integer not null check (score >= 0), total_questions integer not null check (total_questions > 0), correct_answers integer not null check (correct_answers between 0 and total_questions),
  xp_earned integer not null check (xp_earned >= 0), duration_seconds integer check (duration_seconds >= 0), started_at timestamptz not null, completed_at timestamptz not null default now(),
  unique (student_id, assignment_id), check (completed_at >= started_at)
);
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict, selected_answer text not null, is_correct boolean not null,
  points_awarded integer not null check (points_awarded >= 0), answered_at timestamptz not null default now(), unique (attempt_id, question_id)
);
create table public.achievements (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[A-Z0-9_]+$'), name text not null, description text not null,
  icon text not null, xp_reward integer not null default 0 check (xp_reward >= 0), created_at timestamptz not null default now()
);
create table public.student_achievements (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade, unlocked_at timestamptz not null default now(), unique (student_id, achievement_id)
);

create index classes_teacher_idx on public.classes(teacher_id);
create index class_members_student_idx on public.class_members(student_id);
create index quizzes_teacher_idx on public.quizzes(teacher_id);
create index questions_quiz_idx on public.questions(quiz_id);
create index assignments_class_idx on public.assignments(class_id);
create index assignments_quiz_idx on public.assignments(quiz_id);
create index attempts_student_idx on public.attempts(student_id);
create index attempts_quiz_idx on public.attempts(quiz_id);
create index attempts_assignment_idx on public.attempts(assignment_id);
create index attempt_answers_attempt_idx on public.attempt_answers(attempt_id);
create index student_achievements_student_idx on public.student_achievements(student_id);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger progress_updated before update on public.student_progress for each row execute function public.set_updated_at();
create trigger classes_updated before update on public.classes for each row execute function public.set_updated_at();
create trigger quizzes_updated before update on public.quizzes for each row execute function public.set_updated_at();
create trigger questions_updated before update on public.questions for each row execute function public.set_updated_at();

create function public.protect_profile_fields() returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then raise exception 'Role cannot be changed through profile updates' using errcode = '42501'; end if;
  return new;
end $$;
create trigger profiles_protected before update on public.profiles for each row execute function public.protect_profile_fields();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare safe_role public.user_role := 'student';
begin
  if new.raw_app_meta_data ->> 'account_role' = 'teacher' then safe_role := 'teacher'; end if;
  insert into public.profiles(id, full_name, role) values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Learner'), safe_role);
  if safe_role = 'student' then insert into public.student_progress(student_id) values (new.id); end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.is_teacher() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher') $$;
create function public.is_student() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'student') $$;
create function public.owns_class(class_uuid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.classes where id = class_uuid and teacher_id = auth.uid()) $$;
create function public.is_class_member(class_uuid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.class_members where class_id = class_uuid and student_id = auth.uid()) $$;
create function public.can_access_assignment(assignment_uuid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.assignments a join public.quizzes q on q.id = a.quiz_id where a.id = assignment_uuid and q.is_published and (public.owns_class(a.class_id) or public.is_class_member(a.class_id))) $$;

create function public.generate_class_code() returns text language plpgsql volatile set search_path = '' as $$
declare alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; entropy bytea := extensions.gen_random_bytes(6); result text := ''; i integer;
begin for i in 0..5 loop result := result || substr(alphabet, 1 + (get_byte(entropy, i) % length(alphabet)), 1); end loop; return result; end $$;
create function public.set_class_code() returns trigger language plpgsql set search_path = '' as $$
begin if new.class_code is null then for i in 1..20 loop new.class_code := public.generate_class_code(); exit when not exists(select 1 from public.classes where class_code = new.class_code); new.class_code := null; end loop; if new.class_code is null then raise exception 'Unable to generate class code'; end if; end if; return new; end $$;
create trigger classes_code before insert on public.classes for each row execute function public.set_class_code();

create function public.join_class_by_code(code text) returns table(id uuid, name text, section text, subject text) language plpgsql security definer set search_path = '' as $$
declare target public.classes;
begin
  if auth.uid() is null or not public.is_student() then raise exception 'Student authentication required' using errcode = '42501'; end if;
  select * into target from public.classes c where c.class_code = upper(trim(code));
  if target.id is null then raise exception 'Invalid class code' using errcode = 'P0002'; end if;
  insert into public.class_members(class_id, student_id) values (target.id, auth.uid()) on conflict (class_id, student_id) do nothing;
  return query select target.id, target.name, target.section, target.subject;
end $$;

create function public.get_assignment_questions(assignment_uuid uuid)
returns table(id uuid, question_text text, question_type public.question_type, choices jsonb, points integer, order_index integer, game_mode public.game_mode)
language sql stable security definer set search_path = '' as $$
  select qn.id, qn.question_text, qn.question_type, qn.choices, qn.points, qn.order_index, q.game_mode
  from public.assignments a join public.quizzes q on q.id = a.quiz_id join public.questions qn on qn.quiz_id = q.id
  where a.id = assignment_uuid and public.can_access_assignment(a.id) and q.is_published order by qn.order_index
$$;

create function public.level_for_xp(value integer) returns integer language sql immutable set search_path = '' as $$ select floor(sqrt(greatest(value, 0)::numeric / 100))::integer + 1 $$;
create function public.submit_quiz_attempt(assignment_uuid uuid, answers jsonb)
returns table(attempt_id uuid, score integer, total_questions integer, correct_answers integer, xp_earned integer, level integer)
language plpgsql security definer set search_path = '' as $$
declare target public.assignments; new_attempt uuid; total integer; correct integer; points_total integer; awarded integer; earned integer; new_xp integer; started timestamptz := now();
begin
  if auth.uid() is null or not public.is_student() or not public.can_access_assignment(assignment_uuid) then raise exception 'Assignment unavailable' using errcode = '42501'; end if;
  if jsonb_typeof(answers) <> 'object' then raise exception 'Answers must be an object'; end if;
  select * into target from public.assignments where id = assignment_uuid;
  select count(*), count(*) filter (where lower(trim(a.value)) = lower(trim(q.correct_answer))), coalesce(sum(q.points), 0), coalesce(sum(q.points) filter (where lower(trim(a.value)) = lower(trim(q.correct_answer))), 0)
    into total, correct, points_total, awarded from public.questions q left join lateral jsonb_each_text(answers) a on a.key = q.id::text where q.quiz_id = target.quiz_id;
  if total = 0 then raise exception 'Quiz has no questions'; end if;
  earned := correct * 10 + 20 + case when correct = total then 50 else 0 end;
  insert into public.attempts(student_id, quiz_id, assignment_id, score, total_questions, correct_answers, xp_earned, started_at)
    values (auth.uid(), target.quiz_id, assignment_uuid, round(100.0 * awarded / greatest(points_total, 1)), total, correct, earned, started) returning id into new_attempt;
  insert into public.attempt_answers(attempt_id, question_id, selected_answer, is_correct, points_awarded)
    select new_attempt, q.id, coalesce(a.value, ''), lower(trim(coalesce(a.value, ''))) = lower(trim(q.correct_answer)), case when lower(trim(coalesce(a.value, ''))) = lower(trim(q.correct_answer)) then q.points else 0 end
    from public.questions q left join lateral jsonb_each_text(answers) a on a.key = q.id::text where q.quiz_id = target.quiz_id;
  update public.student_progress set xp = xp + earned, level = public.level_for_xp(xp + earned), quizzes_completed = quizzes_completed + 1 where student_id = auth.uid() returning xp into new_xp;
  insert into public.student_achievements(student_id, achievement_id) select auth.uid(), id from public.achievements where slug = 'FIRST_QUIZ' on conflict do nothing;
  if correct = total then insert into public.student_achievements(student_id, achievement_id) select auth.uid(), id from public.achievements where slug = 'PERFECT_SCORE' on conflict do nothing; end if;
  return query select new_attempt, round(100.0 * awarded / greatest(points_total, 1))::integer, total, correct, earned, public.level_for_xp(new_xp);
exception when unique_violation then raise exception 'Assignment already submitted' using errcode = '23505';
end $$;

alter table public.profiles enable row level security; alter table public.student_progress enable row level security; alter table public.classes enable row level security;
alter table public.class_members enable row level security; alter table public.quizzes enable row level security; alter table public.questions enable row level security;
alter table public.assignments enable row level security; alter table public.attempts enable row level security; alter table public.attempt_answers enable row level security;
alter table public.achievements enable row level security; alter table public.student_achievements enable row level security;

create policy profiles_read_self_or_class on public.profiles for select to authenticated using (
  id = auth.uid()
  or exists(select 1 from public.class_members target join public.classes c on c.id = target.class_id where target.student_id = profiles.id and c.teacher_id = auth.uid())
  or exists(select 1 from public.class_members target join public.class_members caller on caller.class_id = target.class_id where target.student_id = profiles.id and caller.student_id = auth.uid())
);
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update(role) on public.profiles from authenticated;
create policy progress_read_context on public.student_progress for select to authenticated using (student_id = auth.uid() or exists(select 1 from public.class_members cm where cm.student_id = student_progress.student_id and (public.owns_class(cm.class_id) or public.is_class_member(cm.class_id))));
create policy classes_teacher_all on public.classes for all to authenticated using (teacher_id = auth.uid() and public.is_teacher()) with check (teacher_id = auth.uid() and public.is_teacher());
create policy classes_member_read on public.classes for select to authenticated using (public.is_class_member(id));
create policy members_read on public.class_members for select to authenticated using (student_id = auth.uid() or public.owns_class(class_id));
create policy quizzes_teacher_all on public.quizzes for all to authenticated using (teacher_id = auth.uid() and public.is_teacher()) with check (teacher_id = auth.uid() and public.is_teacher());
create policy quizzes_student_read on public.quizzes for select to authenticated using (is_published and exists(select 1 from public.assignments a where a.quiz_id = quizzes.id and public.is_class_member(a.class_id)));
create policy questions_teacher_all on public.questions for all to authenticated using (exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid())) with check (exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid()));
create policy assignments_teacher_all on public.assignments for all to authenticated using (public.owns_class(class_id)) with check (public.owns_class(class_id) and exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid()));
create policy assignments_student_read on public.assignments for select to authenticated using (public.is_class_member(class_id) and exists(select 1 from public.quizzes q where q.id = quiz_id and q.is_published));
create policy attempts_read on public.attempts for select to authenticated using (student_id = auth.uid() or exists(select 1 from public.assignments a where a.id = assignment_id and public.owns_class(a.class_id)));
create policy answers_read on public.attempt_answers for select to authenticated using (exists(select 1 from public.attempts a join public.assignments x on x.id = a.assignment_id where a.id = attempt_id and (a.student_id = auth.uid() or public.owns_class(x.class_id))));
create policy achievements_read on public.achievements for select to authenticated using (true);
create policy student_achievements_read on public.student_achievements for select to authenticated using (student_id = auth.uid() or exists(select 1 from public.class_members cm where cm.student_id = student_achievements.student_id and (public.owns_class(cm.class_id) or public.is_class_member(cm.class_id))));

revoke all on function public.join_class_by_code(text) from public; grant execute on function public.join_class_by_code(text) to authenticated;
revoke all on function public.get_assignment_questions(uuid) from public; grant execute on function public.get_assignment_questions(uuid) to authenticated;
revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public; grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
revoke all on public.questions, public.attempts, public.attempt_answers, public.student_progress from anon, authenticated;
grant select, insert, update, delete on public.questions to authenticated; grant select on public.attempts, public.attempt_answers, public.student_progress to authenticated;

insert into public.achievements(slug, name, description, icon, xp_reward) values
('FIRST_QUIZ', 'First Quest', 'Complete your first quiz.', 'scroll', 0), ('PERFECT_SCORE', 'Perfect Run', 'Score 100% on a quiz.', 'sparkles', 0),
('STREAK_5', 'On Fire', 'Build a five-quiz streak.', 'flame', 0), ('SPEEDSTER', 'Speedster', 'Complete an eligible quiz within its time goal.', 'timer', 0)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, xp_reward = excluded.xp_reward;

commit;
