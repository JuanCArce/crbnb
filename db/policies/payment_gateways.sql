-- ===========================================================
-- RLS Policies: payment_gateways
-- ===========================================================

alter table public.payment_gateways enable row level security;

-- Lectura pública: cualquier visitante puede ver gateways activos
create policy "payment_gateways_select_active"
  on public.payment_gateways
  for select
  using (is_active = true);

-- Solo service_role puede INSERT/UPDATE/DELETE (no policy para usuarios)

grant select on public.payment_gateways to anon, authenticated;