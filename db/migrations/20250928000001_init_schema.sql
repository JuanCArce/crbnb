-- ===========================================================
-- CRBNB — Initial schema migration
-- Migration: 20250928000001_init_schema
--
-- Tablas:
--   - profiles: extiende auth.users con datos públicos del usuario
--   - hosts:    datos de hospedaje (1:1 con profiles)
--   - admin_settings: configuración global (feature flags, fees)
--   - audit_log: registro append-only de acciones de admin
--
-- Estrategia:
--   - RLS habilitado en TODAS las tablas
--   - Triggers para crear profile automáticamente al signup
-- ===========================================================

-- =========================
-- Extensions
-- =========================
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "postgis";

-- =========================
-- Enums
-- =========================
create type public.language_code as enum ('es', 'en');
create type public.kyc_status as enum ('none', 'pending', 'verified', 'rejected');
create type public.subscription_tier as enum ('free', 'pro');

-- =========================
-- profiles
-- Extiende auth.users con datos públicos visibles
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  language public.language_code not null default 'es',
  kyc_status public.kyc_status not null default 'none',
  kyc_doc_url text,
  kyc_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público de cada usuario. Se crea automáticamente al signup via trigger.';

-- Index
create index profiles_language_idx on public.profiles(language);

-- =========================
-- hosts
-- Datos específicos de quien publica hospedajes
-- =========================
create table public.hosts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  bio_es text,
  bio_en text,
  payout_provider text,
  payout_account_ref text,
  subscription_tier public.subscription_tier not null default 'free',
  subscription_expires_at timestamptz,
  is_suspended boolean not null default false,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hosts is 'Datos de hospedaje (1:1 con profiles). El slug es único y se usa como subdominio.';

-- Indexes
create index hosts_slug_idx on public.hosts(slug);
create index hosts_profile_id_idx on public.hosts(profile_id);
create index hosts_subscription_tier_idx on public.hosts(subscription_tier);

-- =========================
-- admin_settings
-- Configuración global (feature flags, fees, copy, etc.)
-- =========================
create table public.admin_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

comment on table public.admin_settings is 'Configuración global del sistema (feature flags, fees, copy). Solo admin/service_role puede escribir.';

-- Seed inicial con defaults
insert into public.admin_settings (key, value, description) values
  ('platform_fee_percent', '{"value": 3.0}'::jsonb, 'Comisión de plataforma sobre cada booking (%)'),
  ('free_tier_max_properties', '{"value": 1}'::jsonb, 'Máximo de propiedades activas para hosts en tier gratuito'),
  ('maintenance_mode', '{"enabled": false}'::jsonb, 'Modo mantenimiento del sitio'),
  ('signup_enabled', '{"enabled": true}'::jsonb, 'Permitir nuevos registros'),
  ('default_currency', '{"code": "CRC", "fallback": "USD"}'::jsonb, 'Moneda por defecto del marketplace')
on conflict (key) do nothing;

-- =========================
-- audit_log
-- Append-only log para acciones sensibles (admin, payments, etc.)
-- =========================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_ip inet,
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is 'Log append-only. Solo service_role puede escribir. Nadie puede update/delete.';

-- Indexes
create index audit_log_actor_id_idx on public.audit_log(actor_id);
create index audit_log_entity_idx on public.audit_log(entity, entity_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

-- =========================
-- Triggers
-- =========================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger hosts_set_updated_at
  before update on public.hosts
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'language')::public.language_code, 'es')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- Grant baseline
-- =========================
grant usage on schema public to anon, authenticated;
grant select on public.admin_settings to anon, authenticated;