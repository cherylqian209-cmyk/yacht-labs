-- ============================================================
-- Yacht Labs v2 Migration  (idempotent — safe to re-run)
-- Supabase SQL Editor → supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Add missing columns to projects
alter table projects
  add column if not exists last_ship_date  date,
  add column if not exists current_streak  integer default 0,
  add column if not exists longest_streak  integer default 0,
  add column if not exists is_public       boolean default false,
  add column if not exists slug            text unique,
  add column if not exists view_count      integer default 0,
  add column if not exists shared_count    integer default 0;

create index if not exists projects_slug_idx
  on projects(slug) where slug is not null;

create index if not exists projects_public_idx
  on projects(is_public) where is_public = true;

-- 2. Public projects RLS
drop policy if exists "Public projects are viewable by everyone" on projects;
create policy "Public projects are viewable by everyone"
  on projects for select
  using (is_public = true);

-- 3. daily_ships table
create table if not exists daily_ships (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users not null,
  project_id       uuid references projects(id) on delete cascade,
  ship_description text not null,
  ship_date        date not null default current_date,
  created_at       timestamptz default now() not null,
  unique (project_id, ship_date)
);

alter table daily_ships enable row level security;

-- 4. daily_ships RLS policies
drop policy if exists "Users see their own ships"                 on daily_ships;
drop policy if exists "Users create their own ships"             on daily_ships;
drop policy if exists "Public ships visible for public projects" on daily_ships;

create policy "Users see their own ships"
  on daily_ships for select
  using (auth.uid() = user_id);

create policy "Users create their own ships"
  on daily_ships for insert
  with check (auth.uid() = user_id);

create policy "Public ships visible for public projects"
  on daily_ships for select
  using (
    project_id in (
      select id from projects where is_public = true
    )
  );

-- 5. Atomic view/share counters
create or replace function increment_project_views(project_slug text)
returns void as $$
begin
  update projects set view_count = view_count + 1
  where slug = project_slug and is_public = true;
end;
$$ language plpgsql;

create or replace function increment_project_shares(project_slug text)
returns void as $$
begin
  update projects set shared_count = shared_count + 1
  where slug = project_slug and is_public = true;
end;
$$ language plpgsql;
