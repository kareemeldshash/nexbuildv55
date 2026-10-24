-- EngiMarket initial schema for Supabase.
-- Run this once in Supabase Dashboard > SQL Editor.
-- Public project/profile data is readable; owner-only mutations are enforced by RLS.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9-]{0,29}$'),
  full_name text not null default 'New Engineer' check (char_length(full_name) <= 80),
  headline text not null default '' check (char_length(headline) <= 120),
  bio text not null default '' check (char_length(bio) <= 700),
  location text not null default '' check (char_length(location) <= 80),
  website text,
  github_url text,
  linkedin_url text,
  avatar_url text,
  skills text[] not null default '{}',
  is_founder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  summary text not null check (char_length(summary) between 15 and 240),
  description text not null default '' check (char_length(description) <= 10000),
  category text not null default 'Engineering' check (char_length(category) <= 60),
  tags text[] not null default '{}',
  cover_image_url text,
  repo_url text,
  demo_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_likes (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.project_bookmarks (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.creator_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, creator_id),
  constraint creator_follows_no_self_follow check (follower_id <> creator_id)
);

create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists projects_owner_idx on public.projects (owner_id, created_at desc);
create index if not exists projects_published_idx on public.projects (is_published, created_at desc);
create index if not exists projects_category_idx on public.projects (category);
create index if not exists project_likes_project_idx on public.project_likes (project_id);
create index if not exists project_bookmarks_user_idx on public.project_bookmarks (user_id, created_at desc);
create index if not exists creator_follows_creator_idx on public.creator_follows (creator_id, created_at desc);
create index if not exists project_comments_project_idx on public.project_comments (project_id, created_at desc);

-- Create a safe profile row when a user signs up. Username collisions are resolved with a suffix.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  candidate text;
  suffix text;
  display_name text;
  attempt integer := 0;
begin
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'New Engineer');
  base_name := lower(regexp_replace(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), display_name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_name := trim(both '-' from base_name);
  base_name := left(base_name, 22);
  if base_name = '' or base_name !~ '^[a-z0-9]' then base_name := 'engineer'; end if;
  candidate := base_name;

  while exists (select 1 from public.profiles p where p.username = candidate) loop
    attempt := attempt + 1;
    suffix := '-' || left(replace(new.id::text, '-', ''), 6 + least(attempt, 4));
    candidate := left(base_name, 30 - char_length(suffix)) || suffix;
    exit when attempt >= 10;
  end loop;

  insert into public.profiles (id, username, full_name)
  values (new.id, candidate, display_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Maintain updated_at automatically on editable tables.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute procedure public.set_updated_at();
drop trigger if exists project_comments_set_updated_at on public.project_comments;
create trigger project_comments_set_updated_at before update on public.project_comments
for each row execute procedure public.set_updated_at();

-- Enable RLS on every exposed table.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_likes enable row level security;
alter table public.project_bookmarks enable row level security;
alter table public.creator_follows enable row level security;
alter table public.project_comments enable row level security;

-- Profiles: fields here are intended to be public; users can only mutate their own row.
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Projects: visitors see published work; each creator can read and manage their own work.
drop policy if exists "Published projects or owner can view" on public.projects;
create policy "Published projects or owner can view" on public.projects for select to anon, authenticated using (is_published = true or (select auth.uid()) = owner_id);
drop policy if exists "Creators insert their own projects" on public.projects;
create policy "Creators insert their own projects" on public.projects for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Creators update their own projects" on public.projects;
create policy "Creators update their own projects" on public.projects for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Creators delete their own projects" on public.projects;
create policy "Creators delete their own projects" on public.projects for delete to authenticated using ((select auth.uid()) = owner_id);

-- Likes: visible publicly for counts, but only the signed-in owner may add/remove their own like.
drop policy if exists "Likes are viewable" on public.project_likes;
create policy "Likes are viewable" on public.project_likes for select to anon, authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.is_published = true));
drop policy if exists "Users add their own likes" on public.project_likes;
create policy "Users add their own likes" on public.project_likes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users remove their own likes" on public.project_likes;
create policy "Users remove their own likes" on public.project_likes for delete to authenticated using ((select auth.uid()) = user_id);

-- Bookmarks are private to the account that saved them.
drop policy if exists "Users view their own bookmarks" on public.project_bookmarks;
create policy "Users view their own bookmarks" on public.project_bookmarks for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users add their own bookmarks" on public.project_bookmarks;
create policy "Users add their own bookmarks" on public.project_bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users remove their own bookmarks" on public.project_bookmarks;
create policy "Users remove their own bookmarks" on public.project_bookmarks for delete to authenticated using ((select auth.uid()) = user_id);

-- Follows: each member can read and manage their own following list; self-following is blocked by a table constraint.
drop policy if exists "Users view their own follows" on public.creator_follows;
create policy "Users view their own follows" on public.creator_follows for select to authenticated using ((select auth.uid()) = follower_id);
drop policy if exists "Users follow creators as themselves" on public.creator_follows;
create policy "Users follow creators as themselves" on public.creator_follows for insert to authenticated with check ((select auth.uid()) = follower_id and (select auth.uid()) <> creator_id);
drop policy if exists "Users unfollow creators as themselves" on public.creator_follows;
create policy "Users unfollow creators as themselves" on public.creator_follows for delete to authenticated using ((select auth.uid()) = follower_id);

-- Comments: public read; authenticated users create their own and may only delete their own.
drop policy if exists "Comments on public projects are viewable" on public.project_comments;
create policy "Comments on public projects are viewable" on public.project_comments for select to anon, authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.is_published = true));
drop policy if exists "Signed-in users comment as themselves" on public.project_comments;
create policy "Signed-in users comment as themselves" on public.project_comments for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.projects p where p.id = project_id and p.is_published = true));
drop policy if exists "Authors delete their own comments" on public.project_comments;
create policy "Authors delete their own comments" on public.project_comments for delete to authenticated using ((select auth.uid()) = user_id);

-- Least-privilege table grants accompany RLS; grants and row policies work together.
-- In particular, no browser client can write the is_founder flag or alter profile timestamps.
grant usage on schema public to anon, authenticated;
revoke all on public.profiles, public.projects, public.project_likes, public.project_bookmarks, public.creator_follows, public.project_comments from anon, authenticated;

grant select on public.profiles, public.projects, public.project_likes, public.project_comments to anon;
grant select on public.profiles, public.projects, public.project_likes, public.project_bookmarks, public.creator_follows, public.project_comments to authenticated;
grant insert (id, username, full_name, headline, bio, location, website, github_url, linkedin_url, avatar_url, skills) on public.profiles to authenticated;
grant update (id, username, full_name, headline, bio, location, website, github_url, linkedin_url, avatar_url, skills) on public.profiles to authenticated;
grant insert, update, delete on public.projects to authenticated;
grant insert, delete on public.project_likes to authenticated;
grant insert, delete on public.project_bookmarks to authenticated;
grant insert, delete on public.creator_follows to authenticated;
grant insert, delete on public.project_comments to authenticated;

-- After you create and confirm your personal account, optionally mark your own profile as founder:
-- update public.profiles set is_founder = true where username = 'your-username';
