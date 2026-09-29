-- ===========================================================
-- RLS Policies: hosts
-- ===========================================================

alter table public.hosts enable row level security;

-- Lectura pública: cualquiera puede ver un host activo y no suspendido
create policy "hosts_select_public_active"
  on public.hosts
  for select
  using (not is_suspended);

-- El host puede ver todos sus datos (incluyendo suspended)
create policy "hosts_select_own_all"
  on public.hosts
  for select
  using (profile_id = auth.uid());

-- El host puede actualizar sus propios datos (excepto subscription_tier e is_suspended)
create policy "hosts_update_own"
  on public.hosts
  for update
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    -- subscription_tier e is_suspended solo los cambia service_role
    -- Validamos en trigger o función RPC para mantener la regla
  );

-- Cualquier usuario autenticado puede convertirse en host (crear su fila)
create policy "hosts_insert_own"
  on public.hosts
  for insert
  with check (profile_id = auth.uid());

-- Eliminar host: solo service_role (no permitimos al usuario borrar su host directamente)

-- Grant
grant select on public.hosts to anon, authenticated;
grant insert, update on public.hosts to authenticated;