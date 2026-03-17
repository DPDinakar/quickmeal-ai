-- Run this in Supabase SQL Editor.

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  input jsonb not null,
  output jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists meal_plans_user_day_idx on public.meal_plans (user_id, day desc);
create index if not exists meal_plans_created_at_idx on public.meal_plans (created_at desc);

alter table public.meal_plans enable row level security;

-- Users can read their own plans
drop policy if exists "meal_plans_select_own" on public.meal_plans;
create policy "meal_plans_select_own"
on public.meal_plans
for select
to authenticated
using (auth.uid() = user_id);

-- Users can insert their own plans
drop policy if exists "meal_plans_insert_own" on public.meal_plans;
create policy "meal_plans_insert_own"
on public.meal_plans
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can delete their own plans (optional)
drop policy if exists "meal_plans_delete_own" on public.meal_plans;
create policy "meal_plans_delete_own"
on public.meal_plans
for delete
to authenticated
using (auth.uid() = user_id);

