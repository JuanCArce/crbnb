# CRBNB — Arquitectura

Documentación técnica de las decisiones arquitectónicas.

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