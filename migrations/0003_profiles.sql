create table if not exists profiles (
  user_id text primary key,
  display_name text not null,
  headline text,
  bio text,
  location text,
  skills text not null default '',
  updated_at timestamptz not null default now()
);

update projects set user_id = 'seed-layla' where id in ('seed-arm', 'seed-sesame');
update projects set user_id = 'seed-omar' where id = 'seed-line';
update projects set user_id = 'seed-nour' where id = 'seed-loader';

insert into projects (id, user_id, title, description, price, status) values
  ('seed-drone', 'seed-omar', 'Indoor mapping drone', 'Quadcopter frame, flight controller notes, and a short test log.', 25, 'approved'),
  ('seed-pump', 'seed-nour', 'Solar water pump', 'Off-grid pump sized for a small greenhouse.', 0, 'approved'),
  ('seed-grip', 'seed-layla', 'Soft gripper', '3D-printed fingers with a simple servo mount.', 12, 'approved')
on conflict (id) do nothing;

insert into profiles (user_id, display_name, headline, bio, location, skills) values
  ('seed-layla', 'Layla Hassan', 'Robotics builder', 'I design mechanisms from scratch and publish the files so someone else can rebuild them.', 'Cairo', 'CAD, Arduino, 3D print'),
  ('seed-omar', 'Omar Farid', 'Embedded & robots', 'Line followers, drones, and firmware I actually tested on the bench.', 'Alexandria', 'C++, SPIKE, sensors'),
  ('seed-nour', 'Nour Adel', 'Machines that move water and dirt', 'Student builds that solve a real job: scoop, pump, or lift.', 'Giza', 'Mechanisms, solar, LEGO SPIKE')
on conflict (user_id) do nothing;
