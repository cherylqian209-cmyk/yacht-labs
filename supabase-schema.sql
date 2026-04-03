-- Yacht Labs Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  idea text,
  analysis jsonb default '{}',
  status text default 'planning' check (status in ('planning', 'building', 'shipping', 'live', 'archived')),
  phase text default 'think' check (phase in ('think', 'build', 'ship', 'listen', 'repeat')),
  tech_stack jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ship_date timestamp with time zone,
  metadata jsonb default '{}'
);

alter table projects enable row level security;

create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  phase text not null check (phase in ('setup', 'build', 'ship', 'listen', 'repeat')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_hours numeric,
  actual_hours numeric,
  ai_generated boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  metadata jsonb default '{}'
);

alter table tasks enable row level security;

create policy "Users can view tasks for their projects"
  on tasks for select
  using (exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.user_id = auth.uid()
  ));

create policy "Users can manage tasks for their projects"
  on tasks for all
  using (exists (
    select 1 from projects
    where projects.id = tasks.project_id
    and projects.user_id = auth.uid()
  ));

-- Auto-update updated_at on projects
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at_column();
