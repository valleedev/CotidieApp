-- Suscripciones Web Push (canal de entrega para PWA en iOS/web — ver
-- CLAUDE.md notas de notificaciones locales vs. este canal remoto).
-- Una fila por dispositivo/navegador suscrito, nunca por usuario: el mismo
-- usuario puede tener varias PWAs instaladas en distintos dispositivos, cada
-- una con su propio endpoint/keys/timezone.

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index push_subscriptions_user_id_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_owner" on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
