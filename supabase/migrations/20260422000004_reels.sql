create type public.reel_status as enum ('planning', 'ready_to_shoot', 'shot', 'edited', 'posted');

create table public.reels (
  id uuid primary key default gen_random_uuid(),
  shoot_id uuid not null references public.shoots(id) on delete cascade,
  title text not null,
  status public.reel_status not null default 'planning',
  script_text text not null default '',
  script_file_url text,
  product_name text not null default '',
  product_image_url text,
  location_text text not null default '',
  location_image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index reels_shoot_idx on public.reels(shoot_id, position);
create index reels_status_idx on public.reels(status);
