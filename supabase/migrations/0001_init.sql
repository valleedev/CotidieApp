-- Esquema inicial Cotidie (spec §2.3, §5.4).
-- IDs generados en cliente (uuid). updated_at lo fija el cliente (base del
-- last-write-wins); no hay triggers que lo pisen. Borrado = deleted_at
-- (tombstone), nunca DELETE real.

create table habits (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  days_of_week smallint[] not null,
  target_per_day integer not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table completions (
  id uuid primary key,
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table reminders (
  id uuid primary key,
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  time text not null,
  days_of_week smallint[],
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  week_starts_on smallint not null default 1,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  updated_at timestamptz not null default now()
);

create index habits_user_id_idx on habits (user_id);
create index completions_habit_id_date_idx on completions (habit_id, date);
create index completions_user_id_idx on completions (user_id);
create index reminders_habit_id_idx on reminders (habit_id);

alter table habits enable row level security;
alter table completions enable row level security;
alter table reminders enable row level security;
alter table settings enable row level security;

create policy "habits_owner" on habits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "completions_owner" on completions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reminders_owner" on reminders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "settings_owner" on settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
