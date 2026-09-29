# CRBNB — Arquitectura

Documentación técnica de las decisiones arquitectónicas.

## Índice
1. [Multi-tenancy: Single DB + RLS](#1-multi-tenancy-single-db--rls)
2. [Subdominios: Cloudflare Worker en el edge](#2-subdominios-cloudflare-worker-en-el-edge)
3. [Pagos: Registry dinámico + dual flow](#3-pagos-registry-dinámico--dual-flow)
4. [Calendar sync: OAuth + push + pull](#4-calendar-sync-oauth--push--pull)
5. [i18n: @angular/localize build-time](#5-i18n-angularlocalize-build-time)
6. [Búsqueda: Postgres FTS ahora, Meilisearch después](#6-búsqueda-postgres-fts-ahora-meilisearch-después)
7. [Storage: Supabase Storage + CDN Cloudflare](#7-storage-supabase-storage--cdn-cloudflare)
8. [Auth: Magic link + Google OAuth](#8-auth-magic-link--google-oauth)
9. [Realtime: Supabase Realtime](#9-realtime-supabase-realtime-phoenix-channels)
10. [Estructura del monorepo](#10-estructura-del-monorepo)
11. [UI: Patrón Airbnb](#11-ui-patrón-airbnb)

---

## 3. Pagos: Registry dinámico + dual flow

**Decisión:** Catálogo admin-managed de pasarelas (`payment_gateways` table) + interfaz `PaymentGatewayAdapter` extensible.

### Dos flujos distintos

| Flujo | Quién paga | A quién | Tabla |
|---|---|---|---|
| **A. Guest → Host** | Huésped | Host (directo, sin intermediarios) | `bookings.payment_intent_id` + `payment_events` |
| **B. Host → CRBNB** | Host | CRBNB (suscripciones Pro) | `platform_payments` |

### Registry dinámico

`payment_gateways` (tabla DB, admin-editable):
```sql
code text                  -- 'tylopay', 'onvo', 'stripe', 'paypal', 'sinpe', 'cash'
display_name text
type gateway_type          -- 'payout_to_host' | 'collect_for_platform' | 'both'
category gateway_category  -- 'card' | 'bank_transfer' | 'wallet' | 'cash' | 'crypto'
is_active boolean          -- Admin toggle global
supported_currencies text[]
config_schema jsonb        -- Describe campos requeridos al host
```

`host_gateway_access` (per-host enable + credenciales):
```sql
host_id uuid
gateway_id uuid
is_enabled boolean
credentials jsonb          -- Encriptado con pgsodium
verified_at timestamptz
```

### Planes con gateways permitidos

`subscription_plans.allowed_gateways` (text[]) — qué gateways ve cada host según su plan:
- `free`: `{cash, sinpe}` (manuales, sin API)
- `pro`: `{cash, sinpe, tylopay, onvo, stripe, paypal}` (todas las opciones)

Admin puede modificar `allowed_gateways` sin deploy.

### Adapter pattern

`packages/payments/src/lib/gateway-adapter.ts`:

```typescript
abstract class PaymentGatewayAdapter {
  abstract readonly code: GatewayCode;
  abstract readonly type: 'payout_to_host' | 'collect_for_platform' | 'both';
  abstract readonly capability: { subscriptions, oneTime, refunds, webhooks };

  abstract authorize(input): Promise<PaymentIntent>
  abstract capture(input): Promise<Receipt>
  abstract refund(input): Promise<Refund>
  abstract createSubscription(input): Promise<Subscription>
  abstract cancelSubscription(id, creds): Promise<void>
  abstract verifyWebhook(req): Promise<boolean>
  abstract parseWebhook(req): Promise<WebhookEvent>
  abstract testCredentials(creds): Promise<{valid, error?}>
  abstract getRequiredConfigFields(): ConfigField[]
}
```

Adapters actuales (en `packages/payments/src/lib/adapters/`):
- `tylopay.adapter.ts` — Tylopay (Latam, card)
- `onvo.adapter.ts` — Onvo (Latam, link de pago)
- `sinpe.adapter.ts` — SINPE Móvil (Costa Rica, manual)
- `cash.adapter.ts` — Efectivo/check-in (100% manual)
- `stripe.adapter.ts` — Stripe (global, both)
- `paypal.adapter.ts` — PayPal (global, both)

### Cómo añadir un nuevo gateway

1. **Código:** Crear `packages/payments/src/lib/adapters/<code>.adapter.ts` con clase que extiende `PaymentGatewayAdapter`. Registrar en `registry.ts`.

2. **DB:** Crear migration que inserta fila en `payment_gateways` con `is_active: false`. Seed del config_schema.

3. **Admin:** Desde panel admin (Fase 10), cambiar `is_active: true` y configurar `allowed_gateways` por plan.

**No se requiere redeploy** para activar/desactivar gateways. Solo añadir uno nuevo requiere deploy (código).

### Limitaciones MVP

- Tylopay/Onvo/Stripe/PayPal: STUBS — implementación completa en Fase 7+
- SINPE: completamente manual (sin API)
- Cash: 100% manual

### Dinero nunca toca CRBNB

En flujo A (guest → host), el dinero va directo del guest al host. CRBNB solo procesa la autorización/captura y registra el evento. Los gateways `payout_to_host` deben soportar split-payout o cuenta destino configurada.

En flujo B (host → CRBNB), el dinero va a la cuenta de CRBNB vía Stripe/PayPal/etc.

---

## 11. UI: Patrón Airbnb

**Decisión:** UI/UX inspirada en airbnb.co.cr — minimal, clean, blanco + acentos puntuales.

### Principios

- **Sin hero gigante** — el foco es la búsqueda funcional
- **Search bar pill** centrada horizontal con 3-4 campos inline
- **Categorías con iconos** redondos arriba del contenido
- **Carruseles de listings** con scroll snap y cards cuadradas
- **Sección inspiración** con grid de destinos y tabs
- **Whitespace generoso**, colores sutiles

### Paleta

```
--crbnb-bg: #ffffff           (fondo principal)
--crbnb-fg: #222222           (texto principal — estilo Airbnb)
--crbnb-fg-muted: #717171     (texto secundario)
--crbnb-fg-faint: #b0b0b0     (placeholders)
--crbnb-border: #ebebeb
--crbnb-accent: #ff385c       (rojo Airbnb-style para CTAs)
--crbnb-gradient: linear-gradient(135deg, #2563eb, #7c3aed)  (brand CRBNB)
```

### Estructura del home

1. **Header sticky** con logo + nav + user menu
2. **Hero compacto** con search bar centrada (`<crbnb-search-bar />`)
3. **Categorías** con iconos (Playa, Montaña, Cabañas, etc.)
4. **3 carruseles de listings** (populares por zona, tipos, fin de semana)
5. **Inspiración** con grid de destinos + tabs (Popular, Playa, Montaña, Ciudades)
6. **Footer** con 4 columnas

### Componentes reutilizables

| Componente | Uso |
|---|
| `<crbnb-search-bar />` | Search bar estilo pill, 4 campos inline (destination, checkIn, checkOut, guests) + botón |
| `<crbnb-carousel />` | Carrusel horizontal con prev/next arrows, scroll snap, responsive |
| `<crbnb-language-switcher />` | Selector es/en con dropdown |
| `<crbnb-header />` | Header sticky Airbnb-style |
| `<crbnb-footer />` | Footer 4 columnas |

Todos en `packages/ui/src/lib/components/`.

### Responsive

- **Mobile:** Search bar colapsa a 1 campo expandible. Categorías scroll horizontal. Carruseles swipe nativo (sin arrows). Grid de inspiración 2 columnas.
- **Desktop:** Layout completo con whitespace generoso. Arrows visibles en carruseles.

---

## 1. Multi-tenancy: Single DB + RLS

**Decisión:** Una sola base de datos PostgreSQL con Row-Level Security (RLS).

**Por qué:**
- Supabase soporta RLS de primera clase
- Escalar a miles de tenants sin problemas operacionales
- Migraciones de schema aplican a todos a la vez

**Cómo:**
- `public.profiles` (1:1 con `auth.users`)
- `public.hosts` (1:1 con `profiles` para quien publica)
- Toda tabla tiene `RLS enabled` + policies
- `host_id` se extrae del JWT en policies (`auth.uid()`)

**Rejected:**
- DB-per-tenant: costo/operación prohibitiva
- Schema-per-tenant: no escala >100 tenants

Ver `db/policies/*.sql` para policies específicas.

## 2. Subdominios: Cloudflare Worker en el edge

**Decisión:** `*.crbnb.com` → Cloudflare Proxy → Worker → Angular SSR.

**Por qué:**
- Worker ejecuta en <30ms globalmente
- KV cache barata y rápida
- Universal SSL cubre `*.crbnb.com` automáticamente

**Flujo:**
1. Worker lee `Host` header (`casa1.crbnb.com`)
2. Extrae subdominio (`casa1`)
3. Busca `slug → host_id` en KV (TTL 5min)
4. Cache miss → Supabase REST (TTL 60s)
5. Inyecta headers `x-crbnb-host-id`, `x-crbnb-host-slug`
6. Forward al origen Angular SSR

**Headers inyectados** son leídos por Angular SSR vía `TransferState` para
que la hidratación cliente conozca el tenant desde el primer paint.

Ver `infra/cloudflare/workers/subdomain-router.ts`.

## 3. Pagos: Adapter Pattern

**Decisión:** Interfaz `PaymentProvider` con implementaciones por proveedor.

```typescript
interface PaymentProvider {
  authorize(amount, currency, metadata): Promise<PaymentIntent>
  capture(intentId): Promise<Receipt>
  refund(intentId, amount): Promise<Refund>
  getStatus(intentId): Promise<PaymentStatus>
  verifyWebhookSignature(req): boolean
}
```

**Implementaciones MVP:**
- `TylopayAdapter` — tarjetas de crédito/débito (Latam)
- `OnvoAdapter` — Link de pago (Latam)
- `SinpeAdapter` — SINPE Móvil Costa Rica (manual)
- `CashAdapter` — efectivo/check-in (manual con foto)

**Por qué:**
- Cada proveedor de Latam es inestable — adapter permite cambiar sin tocar dominio
- `authorize` (no `charge`) permite confirmar después
- Webhooks idempotentes vía `provider_event_id`

**Dinero nunca toca CRBNB.** Cada proveedor envía directo a la cuenta del host.

## 4. Calendar sync: OAuth + push + pull

**Decisión:** Dos canales de sincronización, redundante y resiliente.

- **OAuth flow:** Google Calendar con scope `calendar.events`
- **Push:** `watch` channel de Google POSTa a Edge Function en cambios
- **Pull fallback:** cron diario con `sync_token` (sync incremental de Google)
- **Conflict resolution:** calendario del proveedor es fuente de verdad
- **Outlook:** añadir fila `provider='outlook'` con mismo motor

`calendar_providers` guarda tokens encriptados (pgsodium).

## 5. i18n: @angular/localize build-time

**Decisión:** Build-time locale splitting (es, en).

- Strings extraídos a XLIFF (`packages/i18n/es.xlf`, `en.xlf`)
- Build genera bundle por idioma → SEO óptimo, TTI rápido
- Sin prefijo de locale en URL (locale por host via `profiles.preferred_language`)
- hreflang en cada página apunta a la versión del otro idioma (mismo URL)

**Por qué build-time:**
- 0 JS runtime de i18n
- Cada bundle solo carga su idioma
- SEO friendly sin hacks

## 6. Búsqueda: Postgres FTS ahora, Meilisearch después

**Decisión:** Postgres Full Text Search + PostGIS para MVP.

- `pg_trgm` + `tsvector` en `properties.title_es/en`, `description_es/en`
- PostGIS `ST_DWithin` para geo search
- Índices GIN para ranking rápido

**Trigger de migración a Meilisearch:** >5,000 listings OR p95 >200ms.

**Por qué no Algolia:** costo por operación.

## 7. Storage: Supabase Storage + CDN Cloudflare

- Bucket `property-images` privado
- Signed URLs para lectura
- Endpoint de transformación `/storage/v1/render/image/...?width=...`
- Client-side `createImageBitmap` + resize a 1600px antes de upload
- Cloudflare cachea assets delante de Supabase

## 8. Auth: Magic link + Google OAuth

- Email magic link (default, passwordless)
- Google OAuth como alternativa
- Trigger SQL crea `public.profiles` automáticamente al signup
- `auth.jwt() ->> 'host_id'` claim (Fase 2) para policies

## 9. Realtime: Supabase Realtime (Phoenix channels)

- Conexión WebSocket persistente
- Suficiente para mensajería MVP (<5k concurrentes)
- Si crece: migrar a Ably sin tocar código de dominio

## 10. Estructura del monorepo

Ver [README.md](../README.md#estructura-del-monorepo).

## Diagrama de alto nivel

```
                         ┌─────────────────────────────────────┐
                         │        Cloudflare Edge             │
                         │   ┌──────────────────────────┐     │
                         │   │  subdomain-router        │     │
   casa1.crbnb.com ──────┼──▶│  (Worker)                │     │
                         │   │  - KV lookup             │     │
   www.crbnb.com ────────┼──▶│  - Supabase REST fallback│     │
                         │   └──────────────────────────┘     │
                         │            │ headers              │
                         └────────────┼───────────────────────┘
                                      ▼
                         ┌─────────────────────────────────────┐
                         │   Angular SSR (Cloudflare Pages)    │
                         │   - TransferState (tenant)          │
                         │   - Hydration                       │
                         └────────────┬───────────────────────┘
                                      ▼
                         ┌─────────────────────────────────────┐
                         │   Supabase                          │
                         │   - Postgres + RLS                  │
                         │   - Auth (magic link + Google)      │
                         │   - Realtime (WebSocket)            │
                         │   - Storage (imágenes)              │
                         │   - Edge Functions (webhooks)       │
                         └─────────────────────────────────────┘
```

## Decisiones diferidas

Estas NO se implementaron en MVP — se difieren a fases futuras:

- **Dominios custom por host:** Soporte para `casa-ejemplo.com` (Fase 5+)
- **Auth con password:** No, solo magic link (más seguro y simple)
- **Comentarios bidireccionales en reseñas:** Pos-Fase 9
- **Multi-currency dinámico:** CRC + USD en MVP, expandible después
- **App móvil nativa:** PWA primero, nativa si hay tracción