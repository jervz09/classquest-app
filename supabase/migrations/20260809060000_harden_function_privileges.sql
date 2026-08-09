begin;

revoke all on function public.handle_new_user() from public;

revoke all on function public.is_teacher() from public;
revoke all on function public.is_student() from public;
revoke all on function public.owns_class(uuid) from public;
revoke all on function public.is_class_member(uuid) from public;
revoke all on function public.can_access_assignment(uuid) from public;

grant execute on function public.is_teacher() to authenticated;
grant execute on function public.is_student() to authenticated;
grant execute on function public.owns_class(uuid) to authenticated;
grant execute on function public.is_class_member(uuid) to authenticated;
grant execute on function public.can_access_assignment(uuid) to authenticated;

commit;
