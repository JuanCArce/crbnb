-- ===========================================================
-- RLS Policies: audit_log
-- ===========================================================

alter table public.audit_log enable row level security;

-- audit_log es append-only para service_role
-- Ningún usuario (ni siquiera autenticado) puede leer o escribir
-- Las inserciones las hace service_role desde Edge Functions

-- Sin policies definidas → nadie excepto service_role tiene acceso

-- Bloqueamos explícitamente para que no haya ambigüedad:
revoke all on public.audit_log from anon, authenticated;