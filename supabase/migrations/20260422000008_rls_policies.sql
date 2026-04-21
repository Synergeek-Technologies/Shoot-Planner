create or replace function public.current_role() returns public.user_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles        enable row level security;
alter table public.brands          enable row level security;
alter table public.shoots          enable row level security;
alter table public.reels           enable row level security;
alter table public.reel_references enable row level security;
alter table public.activity_log    enable row level security;

-- profiles
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_self_name" on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles_update_admin" on public.profiles for update to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
create policy "profiles_delete_admin" on public.profiles for delete to authenticated
  using (public.current_role() = 'admin');

-- brands
create policy "brands_select" on public.brands for select to authenticated using (true);
create policy "brands_insert_writer" on public.brands for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "brands_update_writer" on public.brands for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "brands_delete_admin" on public.brands for delete to authenticated
  using (public.current_role() = 'admin');

-- shoots
create policy "shoots_select" on public.shoots for select to authenticated using (true);
create policy "shoots_insert_writer" on public.shoots for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "shoots_update_writer" on public.shoots for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "shoots_delete_admin" on public.shoots for delete to authenticated
  using (public.current_role() = 'admin');

-- reels
create policy "reels_select" on public.reels for select to authenticated using (true);
create policy "reels_insert_writer" on public.reels for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "reels_update_writer" on public.reels for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "reels_delete_admin" on public.reels for delete to authenticated
  using (public.current_role() = 'admin');

-- reel_references
create policy "refs_select" on public.reel_references for select to authenticated using (true);
create policy "refs_insert_writer" on public.reel_references for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "refs_update_writer" on public.reel_references for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "refs_delete_admin" on public.reel_references for delete to authenticated
  using (public.current_role() = 'admin');

-- activity_log
create policy "activity_select" on public.activity_log for select to authenticated using (true);
create policy "activity_insert" on public.activity_log for insert to authenticated
  with check (actor_id = auth.uid());
