-- Optional: for a dedicated schema, create it and set search_path before running the rest.
-- create schema if not exists listing_agent;
-- set search_path to listing_agent, public;

create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists realtor_notes (
  id uuid primary key default gen_random_uuid(),
  org_id text null,
  created_by text null,
  scope text not null default 'global',
  listing_key text null,
  building_key text null,
  neighborhood_key text null,
  content text not null,
  note_vector vector(1536),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint realtor_notes_scope_check check (scope in ('global', 'listing', 'building', 'neighborhood'))
);

create index if not exists realtor_notes_listing_key_idx on realtor_notes (listing_key);
create index if not exists realtor_notes_building_key_idx on realtor_notes (building_key);
create index if not exists realtor_notes_neighborhood_key_idx on realtor_notes (neighborhood_key);

create index if not exists realtor_notes_embedding_idx
  on realtor_notes using ivfflat (note_vector vector_cosine_ops)
  with (lists = 100);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_realtor_notes_updated_at
before update on realtor_notes
for each row execute function set_updated_at();

alter table realtor_notes enable row level security;

create policy "notes_read_authenticated" on realtor_notes
  for select using (auth.role() = 'authenticated');

create policy "notes_write_authenticated" on realtor_notes
  for insert with check (auth.role() = 'authenticated');

create or replace function match_realtor_notes(
  query_embedding vector(1536),
  match_keys text[] default null,
  match_count int default 6
)
returns table (
  id uuid,
  content text,
  listing_key text,
  building_key text,
  neighborhood_key text,
  similarity float
)
language sql stable as $$
  select
    id,
    content,
    listing_key,
    building_key,
    neighborhood_key,
    1 - (note_vector <=> query_embedding) as similarity
  from realtor_notes
  where note_vector is not null
    and (
      match_keys is null
      or listing_key = any(match_keys)
      or building_key = any(match_keys)
      or neighborhood_key = any(match_keys)
    )
  order by note_vector <=> query_embedding
  limit match_count;
$$;
