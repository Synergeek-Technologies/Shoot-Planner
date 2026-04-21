insert into storage.buckets (id, name, public)
values
  ('brand-logos', 'brand-logos', true),
  ('reel-assets', 'reel-assets', false)
on conflict (id) do nothing;

create policy "brand_logos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-logos');
create policy "brand_logos_update" on storage.objects for update to authenticated
  using (bucket_id = 'brand-logos');
create policy "brand_logos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-logos');

create policy "reel_assets_select" on storage.objects for select to authenticated
  using (bucket_id = 'reel-assets');
create policy "reel_assets_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'reel-assets');
create policy "reel_assets_update" on storage.objects for update to authenticated
  using (bucket_id = 'reel-assets');
create policy "reel_assets_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'reel-assets');
