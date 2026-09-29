-- ===========================================================
-- CRBNB — Payment gateway registry + dual payments schema
-- Migration: 20250929000002_payments_registry
--
-- Tablas nuevas:
--   - payment_gateways: catálogo admin-managed de pasarelas
--   - host_gateway_access: qué gateways puede usar cada host
--   - subscription_plans: planes de suscripción (free, pro, etc.)
--   - host_subscriptions: suscripción activa de cada host
--   - platform_payments: pagos de hosts A CRBNB (suscripciones)
--
-- Flujos soportados:
--   A) Guest → Host: a través de booking.payment_intent_id (existente)
--   B) Host → CRBNB: a través de platform_payments (nuevo)
--
-- Estrategia:
--   - payment_gateways es admin-editable (insert/update via service_role)
--   - Adapters en código (TypeScript) — DB solo controla activación
--   - Añadir PayPal/Stripe = crear adapter + migration que inserta fila
-- ===========================================================

-- =========================
-- Enums
-- =========================
create type public.payment_gateway_type as enum (
  'payout_to_host',    -- Envía dinero del guest al host
  'collect_for_platform', -- Recibe dinero del host para CRBNB
  'both'               -- Soporta ambos flujos
);

create type public.payment_gateway_category as enum (
  'card',          -- Tarjeta de crédito/débito
  'bank_transfer', -- Transferencia bancaria / SINPE
  'wallet',        -- Billetera digital (PayPal, Apple Pay)
  'cash',          -- Efectivo / pay-at-checkin
  'crypto'         -- Criptomonedas
);

create type public.host_subscription_status as enum (
  'active',
  'past_due',
  'cancelled',
  'trialing',
  'incomplete'
);

create type public.platform_payment_status as enum (
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'cancelled'
);

create type public.billing_interval as enum (
  'monthly',
  'quarterly',
  'yearly',
  'one_time'
);

-- =========================
-- payment_gateways
-- Catálogo admin-managed de pasarelas
-- Insertar/actualizar solo vía service_role (admin)
-- =========================
create table public.payment_gateways (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                 -- 'tylopay', 'onvo', 'stripe', 'paypal', 'sinpe', 'cash'
  display_name text not null,                  -- 'Tylopay', 'Stripe', 'Efectivo'
  display_icon text,                          -- Emoji o icon key
  type public.payment_gateway_type not null,
  category public.payment_gateway_category not null,
  supported_currencies text[] not null default '{CRC,USD}',
  is_active boolean not null default false,  -- Activo a nivel global (admin toggle)
  config_schema jsonb not null default '{}',  -- Describe campos requeridos al host
  webhook_url text,                           -- Para debug/admin
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payment_gateways is 'Catálogo de pasarelas. Admin controla activación global. Adapters en código (TS).';

-- Seed con gateways MVP
insert into public.payment_gateways (code, display_name, display_icon, type, category, is_active, sort_order) values
  ('tylopay', 'Tylopay', '💳', 'payout_to_host', 'card', true, 10),
  ('onvo', 'Onvo', '🔗', 'payout_to_host', 'card', true, 20),
  ('sinpe', 'SINPE Móvil', '🏦', 'payout_to_host', 'bank_transfer', true, 30),
  ('cash', 'Efectivo', '💵', 'payout_to_host', 'cash', true, 40),
  ('stripe', 'Stripe', '💳', 'both', 'card', false, 5),         -- Activo cuando se integre
  ('paypal', 'PayPal', '🅿️', 'both', 'wallet', false, 6)        -- Activo cuando se integre
on conflict (code) do nothing;

create index payment_gateways_code_idx on public.payment_gateways(code);
create index payment_gateways_active_idx on public.payment_gateways(is_active) where is_active;

-- =========================
-- subscription_plans
-- Planes disponibles (free, pro, etc.)
-- Admin-editable
-- =========================
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                  -- 'free', 'pro'
  display_name text not null,
  display_name_en text,
  description text,
  description_en text,
  price_cents int not null default 0,
  currency text not null default 'USD',
  billing_interval public.billing_interval not null default 'monthly',
  max_properties int,                         -- null = ilimitado
  max_listings int,                           -- legacy alias
  features jsonb not null default '{}',       -- {analytics: true, custom_domain: false, ...}
  allowed_gateways text[] not null default '{}', -- ['tylopay','onvo','cash','sinpe','stripe']
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscription_plans is 'Planes de suscripción. Admin-editable. Define límites y gateways permitidos.';

-- Seed planes MVP
insert into public.subscription_plans (code, display_name, display_name_en, description, description_en, price_cents, currency, billing_interval, max_properties, features, allowed_gateways, sort_order) values
  (
    'free',
    'Gratis',
    'Free',
    '1 propiedad activa. Comisión baja por reserva.',
    '1 active property. Low commission per booking.',
    0,
    'USD',
    'monthly',
    1,
    '{"analytics_basic": true, "support_email": true, "host_subdomain": true}'::jsonb,
    '{cash,sinpe}',
    10
  ),
  (
    'pro',
    'Pro',
    'Pro',
    'Propiedades ilimitadas, analytics avanzado, soporte prioritario.',
    'Unlimited properties, advanced analytics, priority support.',
    999,
    'USD',
    'monthly',
    null,
    '{"analytics_basic": true, "analytics_advanced": true, "support_priority": true, "host_subdomain": true, "custom_badges": true}'::jsonb,
    '{cash,sinpe,tylopay,onvo,stripe,paypal}',
    20
  )
on conflict (code) do nothing;

create index subscription_plans_code_idx on public.subscription_plans(code);
create index subscription_plans_active_idx on public.subscription_plans(is_active) where is_active;

-- =========================
-- host_subscriptions
-- Suscripción activa de cada host
-- =========================
create table public.host_subscriptions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null unique references public.hosts(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status public.host_subscription_status not null default 'active',
  gateway_code text references public.payment_gateways(code),  -- Cómo paga el host
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  provider_subscription_id text,             -- ID del gateway (Stripe sub_xxx)
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.host_subscriptions is 'Suscripción actual de cada host a un plan.';

create index host_subscriptions_host_idx on public.host_subscriptions(host_id);
create index host_subscriptions_status_idx on public.host_subscriptions(status);
create index host_subscriptions_period_end_idx on public.host_subscriptions(current_period_end);

-- Trigger: al crear un host, asignarle plan free por default
create or replace function public.assign_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from public.subscription_plans where code = 'free' limit 1;
  if free_plan_id is not null then
    insert into public.host_subscriptions (host_id, plan_id, status, current_period_end)
    values (
      new.id,
      free_plan_id,
      'active',
      now() + interval '100 years'  -- Free tier no expira
    )
    on conflict (host_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger hosts_assign_default_subscription
  after insert on public.hosts
  for each row execute function public.assign_default_subscription();

-- =========================
-- host_gateway_access
-- Qué gateways puede usar cada host + credenciales
-- =========================
create table public.host_gateway_access (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  gateway_id uuid not null references public.payment_gateways(id) on delete cascade,
  is_enabled boolean not null default true,
  credentials jsonb not null default '{}',    -- Encriptado con pgsodium en app layer
  verified_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (host_id, gateway_id)
);

comment on table public.host_gateway_access is 'Per-host enable + credenciales. Credentials encriptadas en app layer con pgsodium.';

create index host_gateway_access_host_idx on public.host_gateway_access(host_id);
create index host_gateway_access_gateway_idx on public.host_gateway_access(gateway_id);

-- =========================
-- platform_payments
-- Pagos de hosts A CRBNB (suscripciones)
-- =========================
create table public.platform_payments (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  subscription_id uuid references public.host_subscriptions(id) on delete set null,
  gateway_code text not null references public.payment_gateways(code),
  amount_cents int not null,
  currency text not null default 'USD',
  status public.platform_payment_status not null default 'pending',
  provider_payment_id text,                   -- ID en el gateway (Stripe pi_xxx)
  provider_event_id text unique,              -- Idempotencia
  description text,
  metadata jsonb not null default '{}',
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.platform_payments is 'Pagos recibidos por CRBNB de hosts (suscripciones). Flujo B (host→CRBNB).';

create index platform_payments_host_idx on public.platform_payments(host_id);
create index platform_payments_subscription_idx on public.platform_payments(subscription_id);
create index platform_payments_status_idx on public.platform_payments(status);
create index platform_payments_gateway_idx on public.platform_payments(gateway_code);

-- =========================
-- Triggers updated_at
-- =========================
create trigger payment_gateways_set_updated_at
  before update on public.payment_gateways
  for each row execute function public.set_updated_at();

create trigger subscription_plans_set_updated_at
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

create trigger host_subscriptions_set_updated_at
  before update on public.host_subscriptions
  for each row execute function public.set_updated_at();

create trigger host_gateway_access_set_updated_at
  before update on public.host_gateway_access
  for each row execute function public.set_updated_at();

create trigger platform_payments_set_updated_at
  before update on public.platform_payments
  for each row execute function public.set_updated_at();

-- =========================
-- Grants
-- =========================
grant usage on schema public to anon, authenticated;

-- Lectura pública: payment_gateways (para mostrar opciones a hosts)
grant select on public.payment_gateways to anon, authenticated;

-- Lectura pública: subscription_plans (para landing y signup)
grant select on public.subscription_plans to anon, authenticated;

-- host_subscriptions, host_gateway_access, platform_payments: solo service_role (RLS más estricto en policies)