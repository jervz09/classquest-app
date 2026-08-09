begin;

alter table public.classes alter column class_code set default '';

create or replace function public.set_class_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.class_code is null or new.class_code = '' then
    for i in 1..20 loop
      new.class_code := public.generate_class_code();
      exit when not exists(select 1 from public.classes where class_code = new.class_code);
      new.class_code := null;
    end loop;
    if new.class_code is null then
      raise exception 'Unable to generate class code';
    end if;
  end if;
  return new;
end
$$;

commit;
