-- Run once in Supabase > SQL Editor
create table profiles(id uuid primary key references auth.users on delete cascade, username text unique not null, bio text default '', skills text default '', created_at timestamptz default now());
create table projects(id uuid primary key default gen_random_uuid(), owner uuid not null references profiles(id) on delete cascade, title text not null, description text default '', category text default 'Other', price numeric default 0, cover text, views int default 0, created_at timestamptz default now());
create table likes(project uuid references projects(id) on delete cascade, usr uuid references profiles(id) on delete cascade, primary key(project,usr));

alter table profiles enable row level security;
alter table projects enable row level security;
alter table likes enable row level security;

create policy "profiles read" on profiles for select using(true);
create policy "profiles edit own" on profiles for update using(auth.uid()=id);
create policy "projects read" on projects for select using(true);
create policy "projects add own" on projects for insert with check(auth.uid()=owner);
create policy "projects edit own" on projects for update using(auth.uid()=owner);
create policy "projects delete own" on projects for delete using(auth.uid()=owner);
create policy "likes read" on likes for select using(true);
create policy "likes add own" on likes for insert with check(auth.uid()=usr);
create policy "likes remove own" on likes for delete using(auth.uid()=usr);

-- profile is created automatically at sign-up
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare u text := coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1));
begin
  if exists(select 1 from profiles where username=u) then u := u || floor(random()*9999)::int; end if;
  insert into profiles(id,username) values(new.id,u);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function add_view(pid uuid) returns void language sql security definer set search_path=public as $$
  update projects set views=views+1 where id=pid $$;

create view project_feed with (security_invoker=on) as
select p.*, f.username, (select count(*) from likes l where l.project=p.id)::int as likes
from projects p join profiles f on f.id=p.owner;

create view leaderboard with (security_invoker=on) as
select f.id, f.username, f.bio, f.skills,
 (select count(*) from projects x where x.owner=f.id)::int as projects,
 (select coalesce(sum(views),0) from projects x where x.owner=f.id)::int as views,
 (select count(*) from likes l join projects x on x.id=l.project where x.owner=f.id)::int as likes
from profiles f;

-- project cover images
insert into storage.buckets(id,name,public) values('covers','covers',true) on conflict do nothing;
create policy "covers read" on storage.objects for select using(bucket_id='covers');
create policy "covers upload" on storage.objects for insert to authenticated with check(bucket_id='covers');
