-- Flip reel-assets bucket to public so getPublicUrl() works for product/location/reference images.
-- Writes are still gated by RLS policies in migration 20260422000010.
update storage.buckets set public = true where id = 'reel-assets';

-- Allow anonymous reads through the public endpoint.
create policy "reel_assets_public_select" on storage.objects for select to anon
  using (bucket_id = 'reel-assets');
