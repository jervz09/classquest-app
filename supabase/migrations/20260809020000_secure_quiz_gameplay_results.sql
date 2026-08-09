begin;

create or replace function public.submit_quiz_attempt(assignment_uuid uuid, answers jsonb)
returns table(attempt_id uuid, score integer, total_questions integer, correct_answers integer, xp_earned integer, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.assignments;
  new_attempt uuid;
  total integer;
  submitted integer;
  correct integer;
  points_total integer;
  awarded integer;
  earned integer;
  new_xp integer;
  started timestamptz := now();
begin
  if auth.uid() is null or not public.is_student() or not public.can_access_assignment(assignment_uuid) then
    raise exception 'Assignment unavailable' using errcode = '42501';
  end if;
  if jsonb_typeof(answers) <> 'object' then
    raise exception 'Answers must be an object' using errcode = '22023';
  end if;

  select * into target from public.assignments where id = assignment_uuid;
  select count(*) into total from public.questions where quiz_id = target.quiz_id;
  select count(*) into submitted from jsonb_each_text(answers);

  if total = 0 then
    raise exception 'Quiz has no questions' using errcode = '22023';
  end if;
  if submitted <> total
    or exists (
      select 1
      from public.questions q
      where q.quiz_id = target.quiz_id
        and nullif(trim(answers ->> q.id::text), '') is null
    )
    or exists (
      select 1
      from jsonb_object_keys(answers) as submitted_keys(answer_key)
      where not exists (
        select 1 from public.questions q
        where q.quiz_id = target.quiz_id and q.id::text = answer_key
      )
    ) then
    raise exception 'Answer every question before submitting' using errcode = '22023';
  end if;

  select
    count(*) filter (where lower(trim(answers ->> q.id::text)) = lower(trim(q.correct_answer))),
    coalesce(sum(q.points), 0),
    coalesce(sum(q.points) filter (where lower(trim(answers ->> q.id::text)) = lower(trim(q.correct_answer))), 0)
  into correct, points_total, awarded
  from public.questions q
  where q.quiz_id = target.quiz_id;

  earned := correct * 10 + 20 + case when correct = total then 50 else 0 end;
  insert into public.attempts(student_id, quiz_id, assignment_id, score, total_questions, correct_answers, xp_earned, started_at)
  values (auth.uid(), target.quiz_id, assignment_uuid, round(100.0 * awarded / greatest(points_total, 1)), total, correct, earned, started)
  returning id into new_attempt;

  insert into public.attempt_answers(attempt_id, question_id, selected_answer, is_correct, points_awarded)
  select
    new_attempt,
    q.id,
    answers ->> q.id::text,
    lower(trim(answers ->> q.id::text)) = lower(trim(q.correct_answer)),
    case when lower(trim(answers ->> q.id::text)) = lower(trim(q.correct_answer)) then q.points else 0 end
  from public.questions q
  where q.quiz_id = target.quiz_id;

  update public.student_progress
  set xp = xp + earned,
      level = public.level_for_xp(xp + earned),
      quizzes_completed = quizzes_completed + 1
  where student_id = auth.uid()
  returning xp into new_xp;

  insert into public.student_achievements(student_id, achievement_id)
  select auth.uid(), id from public.achievements where slug = 'FIRST_QUIZ'
  on conflict do nothing;
  if correct = total then
    insert into public.student_achievements(student_id, achievement_id)
    select auth.uid(), id from public.achievements where slug = 'PERFECT_SCORE'
    on conflict do nothing;
  end if;

  return query select new_attempt, round(100.0 * awarded / greatest(points_total, 1))::integer, total, correct, earned, public.level_for_xp(new_xp);
exception
  when unique_violation then
    raise exception 'Assignment already submitted' using errcode = '23505';
end
$$;

create function public.get_attempt_review(attempt_uuid uuid)
returns table(
  question_id uuid,
  question_text text,
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  points_awarded integer,
  points_possible integer,
  order_index integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.attempts a
    join public.assignments x on x.id = a.assignment_id
    where a.id = attempt_uuid
      and (a.student_id = auth.uid() or public.owns_class(x.class_id))
  ) then
    raise exception 'Attempt unavailable' using errcode = '42501';
  end if;

  return query
  select q.id, q.question_text, aa.selected_answer, q.correct_answer,
         aa.is_correct, aa.points_awarded, q.points, q.order_index
  from public.attempt_answers aa
  join public.questions q on q.id = aa.question_id
  where aa.attempt_id = attempt_uuid
  order by q.order_index;
end
$$;

revoke all on function public.get_attempt_review(uuid) from public;
grant execute on function public.get_attempt_review(uuid) to authenticated;

commit;
