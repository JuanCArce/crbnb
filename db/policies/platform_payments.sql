-- ===========================================================
-- RLS Policies: platform_payments
-- ===========================================================

alter table public.platform_payments enable row level security;

-- El host puede ver sus propios pagos a CRBNB
create policy "platform_payments_select_own"
  on public.platform_payments
  for select
  using (
    host_id in (select id from public.hosts where profile_id = auth.uid())
  );

-- INSERT/UPDATE solo service_role (webhooks desde Edge Functions)

grant select on public.platform_payments to authenticated;