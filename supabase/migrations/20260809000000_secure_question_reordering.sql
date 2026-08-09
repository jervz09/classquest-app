begin;

create function public.reorder_question(question_uuid uuid, move_direction text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_question public.questions;
  neighbor public.questions;
  temporary_index integer;
begin
  if move_direction not in ('up', 'down') then raise exception 'Invalid direction'; end if;
  select qn.* into current_question from public.questions qn join public.quizzes q on q.id = qn.quiz_id
    where qn.id = question_uuid and q.teacher_id = auth.uid() for update of qn;
  if current_question.id is null then raise exception 'Question unavailable' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_question.quiz_id::text, 0));
  if move_direction = 'up' then
    select * into neighbor from public.questions where quiz_id = current_question.quiz_id and order_index < current_question.order_index order by order_index desc limit 1 for update;
  else
    select * into neighbor from public.questions where quiz_id = current_question.quiz_id and order_index > current_question.order_index order by order_index asc limit 1 for update;
  end if;
  if neighbor.id is null then return; end if;
  select coalesce(max(order_index), 0) + 1000 into temporary_index from public.questions where quiz_id = current_question.quiz_id;
  update public.questions set order_index = temporary_index where id = current_question.id;
  update public.questions set order_index = current_question.order_index where id = neighbor.id;
  update public.questions set order_index = neighbor.order_index where id = current_question.id;
end $$;

revoke all on function public.reorder_question(uuid, text) from public;
grant execute on function public.reorder_question(uuid, text) to authenticated;

commit;
