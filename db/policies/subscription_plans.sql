-- ===========================================================
-- RLS Policies: subscription_plans
-- ===========================================================

alter table public.subscription_plans enable row level security;

-- Lectura pública: planes disponibles siempre visibles
create policy "subscription_plans_select_active"
  on public.subscription_plans
  for select
  using (is_active = true);

-- Solo service_role puede modificar

grant select on public.subscription_plans to anon, authenticated;