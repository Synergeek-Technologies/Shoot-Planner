-- Prevent non-admins from changing their own (or anyone's) role via direct UPDATE.
-- Belt-and-suspenders alongside RLS: even if RLS lets the row through, this fires.

create or replace function public.enforce_role_change_guard() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if old.role is distinct from new.role then
    if (select role from public.profiles where id = auth.uid()) <> 'admin' then
      raise exception 'only admins can change user roles' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_role_change
  before update on public.profiles
  for each row execute function public.enforce_role_change_guard();
