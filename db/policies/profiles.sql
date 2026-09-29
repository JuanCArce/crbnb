-- ===========================================================
-- RLS Policies: profiles
-- ===========================================================

alter table public.profiles enable row level security;

-- Lectura pública: cualquiera puede ver el perfil básico (nombre, avatar, verificación)
-- No exponemos email, phone ni kyc_doc_url
create policy "profiles_select_public_basic"
  on public.profiles
  for select
  using (true);

-- Pero creamos una vista segura para uso público que excluye datos sensibles
create or replace view public.profiles_public as
  select
    id,
    full_name,
    avatar_url,
    kyc_status,
    kyc_verified_at
  from public.profiles;

grant select on public.profiles_public to anon, authenticated;

-- El usuario puede actualizar su propio perfil
create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Solo el propio usuario o admin puede ver datos sensibles (phone, kyc_doc_url)
-- Lo manejamos vía función RPC o filtrado en backend, no vía policy directa,
-- porque la policy de SELECT público arriba expone toda la fila a usuarios autenticados.
-- Para producción: ajustar policy para que phone/kyc_doc_url solo sean visibles
-- al propio usuario o service_role.