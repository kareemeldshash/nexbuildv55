create table if not exists projects (
  id text primary key,
  user_id text not null,
  title text not null,
  description text,
  price numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

insert into projects (id, user_id, title, description, price, status) values
  ('seed-arm', 'seed', 'Robotic arm', 'Original design built from scratch, with full part files.', 0, 'approved'),
  ('seed-sesame', 'seed', 'Sesame robot', 'Hardware and firmware build.', 0, 'approved'),
  ('seed-line', 'seed', 'Line follower', 'Self-driving LEGO SPIKE robot with two color sensors.', 0, 'approved'),
  ('seed-loader', 'seed', 'Wheel loader', 'LEGO SPIKE pushing and scooping robot.', 0, 'approved')
on conflict (id) do nothing;
