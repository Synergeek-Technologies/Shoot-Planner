create table public.shoots (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  location_notes text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index shoots_brand_idx on public.shoots(brand_id);
create index shoots_scheduled_idx on public.shoots(scheduled_at);
