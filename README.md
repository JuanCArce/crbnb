# CRBNB

> Plataforma de bookings con bajas comisiones para hospedajes.
> Costa Rica MVP — expansión Latam.

**Dominio:** [crbnb.com](https://crbnb.com)
**Stack:** Angular 22 + Supabase + Cloudflare
**Estado:** Fase 1 — Foundation

---

## ¿Qué es CRBNB?

CRBNB es una alternativa a Airbnb/Booking donde los hospedajes:

- 💸 Pagen comisiones bajas (3% vs 14–20% de la competencia)
- 🌐 Tienen su propia página en `casa1.crbnb.com` para promover en redes sociales
- 💬 Chatean directo con huéspedes sin intermediarios
- 🔒 Reciben pagos directamente (Tylopay, Onvo, SINPE Móvil, efectivo)
- 📅 Sincronizan su calendario con Google Calendar (Outlook próximamente)

Los huéspedes descubren hospedajes desde el buscador general `crbnb.com` o desde las páginas individuales de cada host.

## Estado del proyecto

Actualmente en **Fase 1 — Foundation** (semanas 1–2 de 20).

✅ Workspace Nx + Angular 22 SSR + Supabase Auth + CI/CD + Worker stub
🚧 Fase 2: Property Management (próxima)

El plan completo de las 12 fases está en [docs/PLAN.md](docs/PLAN.md) y la propuesta arquitectónica en [`/home/jarce/.claude/plans/hola-quiero-que-me-wondrous-rain.md`](/home/jarce/.claude/plans/hola-quiero-que-me-wondrous-rain.md).

---

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de Supabase

# 3. Iniciar la app web
pnpm start
# → http://localhost:4200
```

Para instrucciones detalladas (crear proyecto Supabase, Cloudflare, deploy), ver [docs/SETUP.md](docs/SETUP.md).

---

## Estructura del monorepo

```
crbnb/
├ apps/
│  ├ web/              Angular 22 SSR — crbnb.com + *.crbnb.com
│  ├ web-e2e/          Tests E2E Playwright
│  └ admin/            (próximamente) Angular 22 SPA — admin.crbnb.com
│
├ packages/
│  ├ ui/               Componentes compartidos (header, footer, language-switcher)
│  ├ data-access/      Cliente Supabase + AuthService + guards
│  ├ domain/           (próximamente) Pricing, fees, currency — lógica pura
│  ├ i18n/             (próximamente) XLIFF es/en + helpers
│  ├ payments/         (próximamente) PaymentProvider + adapters
│  └ util/             (próximamente) Date, geo, slug, validation
│
├ db/
│  ├ migrations/       SQL de Supabase (versionado)
│  ├ policies/         RLS policies (versionado por separado)
│  └ seed/             Datos iniciales (amenities, países)
│
├ infra/
│  ├ cloudflare/       Worker subdomain-router + wrangler.toml
│  └ supabase/         (próximamente) Configuración de Edge Functions
│
├ docs/
│  ├ PLAN.md           Plan completo de 12 fases
│  ├ SETUP.md          Guía paso a paso para nuevos devs
│  ├ ARCHITECTURE.md   Decisiones arquitectónicas detalladas
│  └ COMPLIANCE.md     Ley 8968 Costa Rica + GDPR
│
└ .github/workflows/   CI/CD (lint, test, build, deploy)
```

## Comandos útiles

```bash
# Desarrollo
pnpm start                          # Levanta web (Angular SSR) en :4200
pnpm nx serve web                   # Equivalente explícito
pnpm nx build web                   # Build producción
pnpm nx test web                    # Tests unitarios (Vitest)
pnpm nx e2e web                     # Tests E2E (Playwright)
pnpm nx lint                        # Lint todos los proyectos
pnpm nx graph                       # Visualiza grafo de dependencias

# Database
pnpm db:types                       # Regenera tipos TS desde Supabase
pnpm db:migrate:local               # Aplica migrations en Supabase local
pnpm db:diff -f nombre_migration    # Genera nueva migration desde cambios

# Worker (Cloudflare)
pnpm dlx wrangler dev --config infra/cloudflare/wrangler.toml
pnpm dlx wrangler deploy --config infra/cloudflare/wrangler.toml
```

## Stack

| Componente | Tecnología |
| |
| **Frontend** | Angular 22 (SSR + standalone + signals) |
| **Backend / DB** | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| **Hosting web** | Cloudflare Pages |
| **Hosting worker** | Cloudflare Workers |
| **DNS + SSL** | Cloudflare (Universal SSL cubre `*.crbnb.com` automáticamente) |
| **Mapas** | Leaflet + OpenStreetMap + MapTiler |
| **i18n** | @angular/localize (es + en) |
| **Email** | Resend |
| **Pagos** | Tylopay, Onvo, SINPE Móvil, efectivo |
| **Tests** | Vitest (unit) + Playwright (E2E) |

## Decisiones arquitectónicas clave

1. **Multi-tenancy:** Una sola DB Postgres + Row-Level Security. Los hospedajes se aíslan vía `host_id` en policies.
2. **Subdominios:** Resueltos en el edge via Cloudflare Worker. `casa1.crbnb.com` → inyecta `x-crbnb-host-id` al Angular SSR.
3. **Pagos:** Adapter pattern. Tylopay, Onvo, SINPE, Cash. El dinero nunca pasa por CRBNB — va directo al host.
4. **Calendar sync:** OAuth + push (webhook) + pull (sync_token). Outlook soportado añadiendo adapter.
5. **i18n:** Build-time locale splitting (es, en). Locale por host via `profiles.preferred_language`.
6. **Búsqueda:** Postgres FTS ahora, Meilisearch cuando >5k listings.

Más detalles en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Compliance (Costa Rica)

CRBNB cumple con la **Ley 8968** (Protección de la Persona frente al Tratamiento de sus Datos Personales):

- ✅ Consentimiento explícito al signup
- ✅ Right to access, rectification, erasure
- ✅ Cookie banner con categorías (necesarias vs analíticas)
- ✅ RoPA (Records of Processing Activities) mantenido internamente
- ✅ Disclosure de transferencia cross-border (Supabase US-East)

Ver [docs/COMPLIANCE.md](docs/COMPLIANCE.md) para checklist completo.

## Contribuir

1. Fork + branch desde `main`
2. Commits con conventional commits (`feat:`, `fix:`, `chore:`)
3. PR con descripción + screenshots si aplica
4. CI debe pasar (lint, test, build, e2e)

## Licencia

Privado y propietario. © 2026 CRBNB. Todos los derechos reservados.