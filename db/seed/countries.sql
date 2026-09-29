-- ===========================================================
-- Seed: países soportados (Latam MVP, escalable)
-- ===========================================================

create table if not exists public.countries (
  iso2 text primary key,
  iso3 text not null,
  name_es text not null,
  name_en text not null,
  default_currency text not null,
  default_locale public.language_code not null,
  phone_prefix text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.countries is 'Países soportados por CRBNB. Inicialmente Costa Rica, expansión Latam.';

insert into public.countries (iso2, iso3, name_es, name_en, default_currency, default_locale, phone_prefix) values
  ('CR', 'CRI', 'Costa Rica', 'Costa Rica', 'CRC', 'es', '+506'),
  ('MX', 'MEX', 'México', 'Mexico', 'MXN', 'es', '+52'),
  ('CO', 'COL', 'Colombia', 'Colombia', 'COP', 'es', '+57'),
  ('AR', 'ARG', 'Argentina', 'Argentina', 'ARS', 'es', '+54'),
  ('CL', 'CHL', 'Chile', 'Chile', 'CLP', 'es', '+56'),
  ('PE', 'PER', 'Perú', 'Peru', 'PEN', 'es', '+51'),
  ('UY', 'URY', 'Uruguay', 'Uruguay', 'UYU', 'es', '+598'),
  ('PA', 'PAN', 'Panamá', 'Panama', 'PAB', 'es', '+507'),
  ('EC', 'ECU', 'Ecuador', 'Ecuador', 'USD', 'es', '+593'),
  ('BR', 'BRA', 'Brasil', 'Brazil', 'BRL', 'es', '+55'),
  ('US', 'USA', 'Estados Unidos', 'United States', 'USD', 'en', '+1'),
  ('ES', 'ESP', 'España', 'Spain', 'EUR', 'es', '+34')
on conflict (iso2) do nothing;

grant select on public.countries to anon, authenticated;