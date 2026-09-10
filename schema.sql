-- ==============================================================================
-- SAATHI Database Schema & Production RLS Policies
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create tables
create table if not exists users_profile (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'user', -- 'user' | 'counsellor' | 'admin'
  language text default 'en',
  consent_text boolean default true,
  consent_voice boolean default false,
  consent_video boolean default false,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_opt_in boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id) on delete cascade,
  type text, -- 'chat' | 'journal' | 'voice'
  content text,
  sentiment_score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists distress_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id) on delete cascade,
  score integer,
  tier text, -- 'low' | 'moderate' | 'high'
  explanation text,
  computed_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id) on delete cascade,
  tier text,
  status text default 'pending', -- 'pending' | 'contacted' | 'resolved'
  assigned_counsellor uuid references users_profile(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
alter table users_profile enable row level security;
alter table entries enable row level security;
alter table distress_scores enable row level security;
alter table escalations enable row level security;

-- ==============================================================================
-- 3. DROP OLD POLICIES TO PREVENT RECURSION OR DUPLICATE CONFLICTS
-- ==============================================================================
drop policy if exists "Users can view and update their own profile" on users_profile;
drop policy if exists "Users can view their own profile" on users_profile;
drop policy if exists "Allow users to read their own profile" on users_profile;
drop policy if exists "Allow users to insert their own profile" on users_profile;
drop policy if exists "Allow users to update their own profile" on users_profile;
drop policy if exists "Counsellors can view all profiles for escalation queue" on users_profile;
drop policy if exists "Admins can view all profiles for aggregate stats" on users_profile;

drop policy if exists "Users can view and write their own entries" on entries;
drop policy if exists "Allow users to read own entries" on entries;
drop policy if exists "Allow users to insert own entries" on entries;

drop policy if exists "Users can view their own scores" on distress_scores;
drop policy if exists "Users can insert their own scores" on distress_scores;
drop policy if exists "Counsellors can view scores of escalated users" on distress_scores;
drop policy if exists "Allow users to read own scores" on distress_scores;
drop policy if exists "Allow users to insert own scores" on distress_scores;

drop policy if exists "Users can view their own escalations" on escalations;
drop policy if exists "Counsellors can view and update all escalations" on escalations;
drop policy if exists "Admins can view escalations for aggregate analytics" on escalations;
drop policy if exists "Allow users to view own escalations" on escalations;
drop policy if exists "Allow users to insert escalations" on escalations;

-- ==============================================================================
-- 4. CLEAN, PRODUCTION-READY RLS POLICIES (No recursive loops)
-- ==============================================================================

-- USERS_PROFILE POLICIES
create policy "Allow users to read their own profile"
  on users_profile for select
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on users_profile for insert
  with check (auth.uid() = id);

create policy "Allow users to update their own profile"
  on users_profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ENTRIES POLICIES
create policy "Allow users to read own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Allow users to insert own entries"
  on entries for insert
  with check (auth.uid() = user_id);

-- DISTRESS SCORES POLICIES
create policy "Allow users to read own scores"
  on distress_scores for select
  using (auth.uid() = user_id);

create policy "Allow users to insert own scores"
  on distress_scores for insert
  with check (auth.uid() = user_id);

-- ESCALATIONS POLICIES
create policy "Allow users to view own escalations"
  on escalations for select
  using (auth.uid() = user_id);

create policy "Allow users to insert escalations"
  on escalations for insert
  with check (auth.uid() = user_id);

create policy "Allow users to update own escalations"
  on escalations for update
  using (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER (RECOMMENDED BY SUPABASE)
-- Runs with SECURITY DEFINER: automatically creates the profile row whenever
-- ANY user signs in via Google or signs up with Email, bypassing RLS safely.
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, full_name, role, consent_text)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'User'
    ),
    'user',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
