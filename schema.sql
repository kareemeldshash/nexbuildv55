create table projects(
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users default auth.uid(),
  title text not null, description text,
  price numeric default 0, image_url text,
  status text default 'pending',
  created_at timestamptz default now());
alter table projects enable row level security;
create policy "read approved or own" on projects for select using (status='approved' or owner=auth.uid());
create policy "insert own pending" on projects for insert with check (owner=auth.uid() and status='pending');
