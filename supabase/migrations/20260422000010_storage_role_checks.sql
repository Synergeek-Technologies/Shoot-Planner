drop policy if exists "brand_logos_insert" on storage.objects;
drop policy if exists "brand_logos_update" on storage.objects;
drop policy if exists "brand_logos_delete" on storage.objects;
drop policy if exists "reel_assets_select" on storage.objects;
drop policy if exists "reel_assets_insert" on storage.objects;
drop policy if exists "reel_assets_update" on storage.objects;
drop policy if exists "reel_assets_delete" on storage.objects;

-- brand-logos: public read (bucket is public); editor/admin insert/update; admin delete
create policy "brand_logos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-logos' and public.current_role() in ('admin','editor'));
create policy "brand_logos_update" on storage.objects for update to authenticated
  using (bucket_id = 'brand-logos' and public.current_role() in ('admin','editor'));
create policy "brand_logos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-logos' and public.current_role() = 'admin');

-- reel-assets: authenticated read; editor/admin insert/update; admin delete
create policy "reel_assets_select" on storage.objects for select to authenticated
  using (bucket_id = 'reel-assets');
create policy "reel_assets_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'reel-assets' and public.current_role() in ('admin','editor'));
create policy "reel_assets_update" on storage.objects for update to authenticated
  using (bucket_id = 'reel-assets' and public.current_role() in ('admin','editor'));
create policy "reel_assets_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'reel-assets' and public.current_role() = 'admin');
