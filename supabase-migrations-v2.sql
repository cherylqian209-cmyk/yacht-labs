-- ============================================================
-- Yacht Labs v2 Migration
-- Run in Supabase SQL Editor → dashboard.supabase.com
-- ============================================================

-- 1. Add streak columns to projects
alter table projects
  add column if not exists last_ship_date date,
  add column if not exists current_streak  integer default 0,
  add column if not exists longest_streak  integer default 0;

-- 2. Add public project fields to projects
alter table projects
  add column if not exists is_public   boolean default false,
  add column if not exists slug        text unique,
  add column if not exists view_count  integer default 0;

create index if not exists projects_slug_idx
  on projects(slug) where slug is not null;

-- 3. Daily ships log
create table if not exists daily_ships (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users not null,
  project_id       uuid references projects(id) on delete cascade,
  ship_description text not null,
  ship_date        date not null default current_date,
  created_at       timestamptz default now() not null,
  unique (project_id, ship_date)   -- one log per project per day
);

alter table daily_ships enable row level security;

create policy "Users see their own ships"
  on daily_ships for select
  using (auth.uid() = user_id);

create policy "Users create their own ships"
  on daily_ships for insert
  with check (auth.uid() = user_id);

-- 4. Allow public reads of daily_ships for public projects
create policy "Public ships visible for public projects"
  on daily_ships for select
  using (
    project_id in (
      select id from projects where is_public = true
    )
  );
