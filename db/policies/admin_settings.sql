-- ===========================================================
-- RLS Policies: admin_settings
-- ===========================================================

alter table public.admin_settings enable row level security;

-- Lectura pública: cualquier visitante puede leer settings
-- (son datos no sensibles: fees, feature flags, copy pública)
create policy "admin_settings_select_public"
  on public.admin_settings
  for select
  using (true);

-- Escritura solo service_role (admin) — ningún usuario autenticado puede modificar
-- No creamos policy de INSERT/UPDATE/DELETE para usuarios normales → service_role bypasea RLS

-- Grant
grant select on public.admin_settings to anon, authenticated;