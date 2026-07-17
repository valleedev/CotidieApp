-- Fase 5: subtítulo de categoría para las tarjetas de "Hoy" (ej. "Reto de
-- salud"). Campo opcional a nivel de producto, pero no-nullable en el
-- esquema (default '') para mantener el tipo TS `category: string` sin
-- necesidad de manejar null en toda la cadena de sync/UI.

alter table habits add column category text not null default '';
