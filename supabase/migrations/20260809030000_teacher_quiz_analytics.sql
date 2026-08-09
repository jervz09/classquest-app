begin;

create function public.get_teacher_quiz_question_analytics(quiz_uuid uuid)
returns table(
  question_id uuid,
  question_text text,
  order_index integer,
  response_count bigint,
  correct_count bigint,
  accuracy integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.owns_quiz(quiz_uuid) then
    raise exception 'Quiz unavailable' using errcode = '42501';
  end if;

  return query
  select
    q.id,
    q.question_text,
    q.order_index,
    count(aa.id),
    count(aa.id) filter (where aa.is_correct),
    case
      when count(aa.id) = 0 then 0
      else round(100.0 * count(aa.id) filter (where aa.is_correct) / count(aa.id))::integer
    end
  from public.questions q
  left join public.attempt_answers aa on aa.question_id = q.id
  where q.quiz_id = quiz_uuid
  group by q.id, q.question_text, q.order_index
  order by q.order_index;
end
$$;

revoke all on function public.get_teacher_quiz_question_analytics(uuid) from public;
grant execute on function public.get_teacher_quiz_question_analytics(uuid) to authenticated;

commit;
