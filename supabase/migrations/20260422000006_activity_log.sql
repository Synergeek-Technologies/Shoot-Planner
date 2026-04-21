create type public.activity_entity as enum ('shoot', 'reel', 'brand');

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type public.activity_entity not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid not null references public.profiles(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_created_idx on public.activity_log(created_at desc);
create index activity_log_entity_idx on public.activity_log(entity_type, entity_id);
