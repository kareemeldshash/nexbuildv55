-- Forge marketplace schema + compatibility migration for the previous EngiMarket schema.
-- Run in Supabase SQL Editor. Only the anon/publishable key belongs in the browser.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default 'New Engineer',
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  website text,
  website_url text,
  github_url text,
  linkedin_url text,
  avatar_url text,
  skills text[] not null default '{}',
  university text not null default '',
  is_founder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists university text not null default '';
alter table public.profiles add column if not exists website_url text;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique,
  summary text not null,
  description text not null default '',
  category text not null default 'Engineering',
  tags text[] not null default '{}',
  cover_image_url text,
  cover_url text,
  repo_url text,
  demo_url text,
  is_published boolean not null default true,
  visibility boolean not null default true,
  status text not null default 'In progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects add column if not exists visibility boolean not null default true;
alter table public.projects add column if not exists status text not null default 'In progress';
alter table public.projects add column if not exists cover_url text;
update public.projects set visibility = is_published where visibility is distinct from is_published;

create table if not exists public.project_likes (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(project_id,user_id)
);
create table if not exists public.project_bookmarks (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(project_id,user_id)
);
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,following_id),
  constraint forge_no_self_follow check (follower_id <> following_id)
);
create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forge_profiles_username_idx on public.profiles(username);
create index if not exists forge_projects_owner_idx on public.projects(owner_id,created_at desc);
create index if not exists forge_projects_feed_idx on public.projects(visibility,updated_at desc);
create index if not exists forge_likes_project_idx on public.project_likes(project_id);
create index if not exists forge_bookmarks_user_idx on public.project_bookmarks(user_id,created_at desc);
create index if not exists forge_follows_target_idx on public.follows(following_id);
create index if not exists forge_comments_project_idx on public.project_comments(project_id,created_at desc);

create or replace function public.forge_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.forge_set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.forge_set_updated_at();
drop trigger if exists forge_comments_set_updated_at on public.project_comments;
create trigger forge_comments_set_updated_at before update on public.project_comments for each row execute function public.forge_set_updated_at();

-- Old versions required slug and summary. This trigger keeps inserts from the new UI compatible.
create or replace function public.forge_project_defaults()
returns trigger language plpgsql set search_path = '' as $$
declare base_slug text; summary_text text;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base_slug := trim(both '-' from regexp_replace(lower(coalesce(new.title,'project')),'[^a-z0-9]+','-','g'));
    if char_length(base_slug) < 2 then base_slug := 'project'; end if;
    new.slug := left(base_slug,58) || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,8);
  end if;
  if new.summary is null or char_length(btrim(new.summary)) < 15 then
    summary_text := coalesce(nullif(btrim(new.description),''),'Engineering project: ' || coalesce(new.title,'a new build') || ' is being shared here.');
    if char_length(summary_text) < 15 then summary_text := 'Engineering project: ' || coalesce(new.title,'new build') || ' is in progress.'; end if;
    new.summary := left(summary_text,240);
  elsif char_length(new.summary) > 240 then
    new.summary := left(new.summary,240);
  end if;
  new.is_published := coalesce(new.is_published,true);
  new.visibility := coalesce(new.visibility,new.is_published,true);
  return new;
end $$;
drop trigger if exists forge_project_defaults_trigger on public.projects;
create trigger forge_project_defaults_trigger before insert on public.projects for each row execute function public.forge_project_defaults();

create or replace function public.forge_new_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare display_name text; base_name text;
begin
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'),''),split_part(coalesce(new.email,'builder'),'@',1),'New Engineer');
  base_name := trim(both '-' from regexp_replace(lower(split_part(coalesce(new.email,'builder'),'@',1)),'[^a-z0-9]+','-','g'));
  if base_name = '' then base_name := 'builder'; end if;
  insert into public.profiles(id,full_name,username)
  values(new.id,display_name,left(base_name,22)||'-'||substr(replace(new.id::text,'-',''),1,6))
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists forge_auth_user_created on auth.users;
create trigger forge_auth_user_created after insert on auth.users for each row execute function public.forge_new_profile();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_likes enable row level security;
alter table public.project_bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.project_comments enable row level security;

drop policy if exists "Forge profiles public read" on public.profiles;
create policy "Forge profiles public read" on public.profiles for select to anon,authenticated using(true);
drop policy if exists "Forge profile owner insert" on public.profiles;
create policy "Forge profile owner insert" on public.profiles for insert to authenticated with check(auth.uid()=id);
drop policy if exists "Forge profile owner update" on public.profiles;
create policy "Forge profile owner update" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);

drop policy if exists "Forge public projects read" on public.projects;
create policy "Forge public projects read" on public.projects for select to anon,authenticated using(visibility=true or owner_id=auth.uid());
drop policy if exists "Forge project owner insert" on public.projects;
create policy "Forge project owner insert" on public.projects for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists "Forge project owner update" on public.projects;
create policy "Forge project owner update" on public.projects for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "Forge project owner delete" on public.projects;
create policy "Forge project owner delete" on public.projects for delete to authenticated using(owner_id=auth.uid());

drop policy if exists "Forge public likes read" on public.project_likes;
create policy "Forge public likes read" on public.project_likes for select to anon,authenticated using(true);
drop policy if exists "Forge owner like" on public.project_likes;
create policy "Forge owner like" on public.project_likes for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "Forge owner unlike" on public.project_likes;
create policy "Forge owner unlike" on public.project_likes for delete to authenticated using(user_id=auth.uid());

drop policy if exists "Forge private bookmark read" on public.project_bookmarks;
create policy "Forge private bookmark read" on public.project_bookmarks for select to authenticated using(user_id=auth.uid());
drop policy if exists "Forge private bookmark insert" on public.project_bookmarks;
create policy "Forge private bookmark insert" on public.project_bookmarks for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "Forge private bookmark delete" on public.project_bookmarks;
create policy "Forge private bookmark delete" on public.project_bookmarks for delete to authenticated using(user_id=auth.uid());

drop policy if exists "Forge follows read" on public.follows;
create policy "Forge follows read" on public.follows for select to anon,authenticated using(true);
drop policy if exists "Forge own follow" on public.follows;
create policy "Forge own follow" on public.follows for insert to authenticated with check(follower_id=auth.uid() and following_id<>auth.uid());
drop policy if exists "Forge unfollow" on public.follows;
create policy "Forge unfollow" on public.follows for delete to authenticated using(follower_id=auth.uid());

drop policy if exists "Forge comments read" on public.project_comments;
create policy "Forge comments read" on public.project_comments for select to anon,authenticated using(true);
drop policy if exists "Forge comment insert" on public.project_comments;
create policy "Forge comment insert" on public.project_comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "Forge comment delete" on public.project_comments;
create policy "Forge comment delete" on public.project_comments for delete to authenticated using(user_id=auth.uid());

grant usage on schema public to anon,authenticated;
revoke all on public.profiles,public.projects,public.project_likes,public.project_bookmarks,public.follows,public.project_comments from anon,authenticated;
grant select on public.profiles,public.projects,public.project_likes,public.project_comments to anon;
grant select on public.profiles,public.projects,public.project_likes,public.project_bookmarks,public.follows,public.project_comments to authenticated;
-- Intentionally omit is_founder from client column grants.
grant insert(id,username,full_name,headline,bio,location,website_url,github_url,linkedin_url,avatar_url,skills,university) on public.profiles to authenticated;
grant update(username,full_name,headline,bio,location,website_url,github_url,linkedin_url,avatar_url,skills,university) on public.profiles to authenticated;
grant insert,update,delete on public.projects to authenticated;
grant insert,delete on public.project_likes to authenticated;
grant insert,delete on public.project_bookmarks to authenticated;
grant insert,delete on public.follows to authenticated;
grant insert,delete on public.project_comments to authenticated;

-- Optional founder badge: only run it for your own confirmed account.
-- update public.profiles set is_founder = true where username = 'your-username';
