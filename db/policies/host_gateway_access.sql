-- ===========================================================
-- RLS Policies: host_gateway_access
-- ===========================================================

alter table public.host_gateway_access enable row level security;

-- El host puede ver sus propios accesos a gateways
create policy "host_gateway_access_select_own"
  on public.host_gateway_access
  for select
  using (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

-- El host puede gestionar (insert/update) sus propios accesos
create policy "host_gateway_access_insert_own"
  on public.host_gateway_access
  for insert
  with check (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

create policy "host_gateway_access_update_own"
  on public.host_gateway_access
  for update
  using (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

-- Solo el host puede desactivar (no policy de DELETE → service_role)

grant select, insert, update on public.host_gateway_access to authenticated;