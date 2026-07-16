-- Fase 4: dos columnas que ya existen en el modelo cliente (domain/types.ts)
-- pero faltaban en el esquema 0001. reminder_id: qué recordatorio disparó la
-- completion (para lógica de scheduling). display_name: nombre de perfil,
-- ahora sincronizable entre dispositivos (antes solo local).

alter table completions add column reminder_id uuid references reminders(id) on delete set null;
alter table settings add column display_name text not null default '';
