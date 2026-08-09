begin;

create function public.owns_quiz(quiz_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.quizzes
    where id = quiz_uuid and teacher_id = auth.uid()
  )
$$;

create function public.can_student_read_quiz(quiz_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.quizzes q
    join public.assignments a on a.quiz_id = q.id
    join public.class_members cm on cm.class_id = a.class_id
    where q.id = quiz_uuid
      and q.is_published
      and cm.student_id = auth.uid()
  )
$$;

revoke all on function public.owns_quiz(uuid) from public;
revoke all on function public.can_student_read_quiz(uuid) from public;
grant execute on function public.owns_quiz(uuid) to authenticated;
grant execute on function public.can_student_read_quiz(uuid) to authenticated;

drop policy if exists quizzes_student_read on public.quizzes;
create policy quizzes_student_read
on public.quizzes for select to authenticated
using (public.can_student_read_quiz(id));

drop policy if exists questions_teacher_all on public.questions;
create policy questions_teacher_all
on public.questions for all to authenticated
using (public.owns_quiz(quiz_id))
with check (public.owns_quiz(quiz_id));

drop policy if exists assignments_teacher_all on public.assignments;
create policy assignments_teacher_all
on public.assignments for all to authenticated
using (public.owns_class(class_id))
with check (public.owns_class(class_id) and public.owns_quiz(quiz_id));

commit;
