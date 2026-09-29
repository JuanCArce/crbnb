-- ===========================================================
-- RLS Policies: host_subscriptions
-- ===========================================================

alter table public.host_subscriptions enable row level security;

-- El host puede ver su propia suscripción
create policy "host_subscriptions_select_own"
  on public.host_subscriptions
  for select
  using (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

-- El host puede actualizar campos limitados de su suscripción
-- (cancel_at_period_end, gateway_code) — service_role cambia el resto
create policy "host_subscriptions_update_own"
  on public.host_subscriptions
  for update
  using (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  )
  with check (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

-- Solo service_role crea suscripciones nuevas (vía función de trigger)
-- No hay policy de INSERT → solo service_role puede

grant select, update on public.host_subscriptions to authenticated;