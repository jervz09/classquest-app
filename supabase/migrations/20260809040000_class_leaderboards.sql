begin;

create function public.get_class_leaderboard(class_uuid uuid)
returns table(
  rank bigint,
  student_id uuid,
  full_name text,
  xp integer,
  level integer,
  quizzes_completed integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (public.owns_class(class_uuid) or public.is_class_member(class_uuid)) then
    raise exception 'Class unavailable' using errcode = '42501';
  end if;

  return query
  select
    rank() over (order by sp.xp desc, sp.quizzes_completed desc, cm.joined_at asc),
    p.id,
    p.full_name,
    sp.xp,
    sp.level,
    sp.quizzes_completed
  from public.class_members cm
  join public.profiles p on p.id = cm.student_id
  join public.student_progress sp on sp.student_id = cm.student_id
  where cm.class_id = class_uuid
  order by sp.xp desc, sp.quizzes_completed desc, cm.joined_at asc;
end
$$;

revoke all on function public.get_class_leaderboard(uuid) from public;
grant execute on function public.get_class_leaderboard(uuid) to authenticated;

commit;
