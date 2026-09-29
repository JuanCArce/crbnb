-- ===========================================================
-- Seed: amenities
-- Catálogo de amenidades con etiquetas en ES y EN
-- ===========================================================

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_es text not null,
  label_en text not null,
  icon text,  -- Font Awesome / Material icon key
  created_at timestamptz not null default now()
);

comment on table public.amenities is 'Catálogo de amenidades que los hosts pueden asignar a sus propiedades.';

insert into public.amenities (key, label_es, label_en, icon) values
  -- Básicos
  ('wifi', 'Wi-Fi', 'Wi-Fi', 'fa-wifi'),
  ('kitchen', 'Cocina', 'Kitchen', 'fa-kitchen-set'),
  ('washer', 'Lavadora', 'Washer', 'fa-jug-detergent'),
  ('dryer', 'Secadora', 'Dryer', 'fa-shirt'),
  ('ac', 'Aire acondicionado', 'Air conditioning', 'fa-snowflake'),
  ('heating', 'Calefacción', 'Heating', 'fa-temperature-high'),
  ('tv', 'Televisor', 'TV', 'fa-tv'),
  ('workspace', 'Espacio de trabajo', 'Workspace', 'fa-laptop'),
  -- Baño
  ('hair_dryer', 'Secador de pelo', 'Hair dryer', 'fa-wind'),
  ('shampoo', 'Shampoo', 'Shampoo', 'fa-pump-soap'),
  ('hot_water', 'Agua caliente', 'Hot water', 'fa-droplet'),
  -- Exterior
  ('pool', 'Piscina', 'Pool', 'fa-person-swimming'),
  ('hot_tub', 'Jacuzzi', 'Hot tub', 'fa-hot-tub-person'),
  ('bbq', 'Parrilla', 'BBQ grill', 'fa-fire'),
  ('garden', 'Jardín', 'Garden', 'fa-tree'),
  ('patio', 'Patio', 'Patio', 'fa-umbrella-beach'),
  ('parking', 'Estacionamiento', 'Parking', 'fa-car'),
  ('beach_access', 'Acceso a playa', 'Beach access', 'fa-umbrella-beach'),
  -- Vistas
  ('ocean_view', 'Vista al mar', 'Ocean view', 'fa-water'),
  ('mountain_view', 'Vista a la montaña', 'Mountain view', 'fa-mountain'),
  -- Seguridad
  ('smoke_alarm', 'Detector de humo', 'Smoke alarm', 'fa-bell'),
  ('co_alarm', 'Detector de CO', 'CO alarm', 'fa-bell'),
  ('first_aid', 'Botiquín', 'First aid kit', 'fa-briefcase-medical'),
  ('fire_extinguisher', 'Extintor', 'Fire extinguisher', 'fa-fire-extinguisher'),
  -- Servicios
  ('breakfast', 'Desayuno incluido', 'Breakfast included', 'fa-mug-saucer'),
  ('pets_allowed', 'Mascotas permitidas', 'Pets allowed', 'fa-paw'),
  ('smoking_allowed', 'Fumar permitido', 'Smoking allowed', 'fa-smoking'),
  -- Familia
  ('crib', 'Cuna', 'Crib', 'fa-baby'),
  ('high_chair', 'Silla para bebé', 'High chair', 'fa-baby'),
  -- Accesibilidad
  ('step_free', 'Sin escalones', 'Step-free access', 'fa-wheelchair'),
  ('wide_doorways', 'Puertas anchas', 'Wide doorways', 'fa-door-open')
on conflict (key) do nothing;

grant select on public.amenities to anon, authenticated;