# CRBNB — Contexto para agentes de IA

> **Generado por Nx** — deja los comentarios `<!-- nx configuration start -->` y `<!-- nx configuration end -->` para recibir actualizaciones automáticas del preset.

# Descripción del proyecto

**CRBNB** (crbnb.com) es una plataforma de bookings tipo marketplace para hospedajes, alternativa a Airbnb/Booking con comisiones bajas. Cada hospedaje obtiene su propio subdominio `casa1.crbnb.com` para promover su página en redes sociales y ser descubrible desde el buscador general `crbnb.com`.

**Mercado MVP:** Costa Rica, expansión posterior a Latam.
**Idiomas:** Español (primario) + Inglés.
**Stack:** Angular 22 + Supabase + Cloudflare Pages/Workers.

# Workspace Nx

## Reglas generales para Nx

- Para navegar/explorar el workspace, invoca el skill `nx-workspace` primero — tiene patrones para consultar proyectos, targets y dependencias.
- Al correr tareas (build, lint, test, e2e), prefiere usar `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) en lugar de las herramientas subyacentes.
- Prefija los comandos nx con el package manager del workspace (e.g. `pnpm nx build`) — evita usar la CLI global instalada.
- Tienes acceso al Nx MCP server y sus herramientas; úsalos para ayudar al usuario.
- Para mejores prácticas de plugins Nx, revisa `node_modules/@nx/<plugin>/PLUGIN.md`. No todos los plugins tienen este archivo — procede sin él si no está disponible.
- **NUNCA** adivines flags de CLI — siempre revisa `nx_docs` o `--help` primero cuando tengas dudas.

## Scaffolding y generadores

- Para tareas de scaffolding (crear apps, libs, estructura de proyecto, setup), **SIEMPRE** invoca el skill `nx-generate` ANTES de explorar o llamar MCP tools.

## Cuándo usar nx_docs

- ÚSALO para: opciones avanzadas de config, flags desconocidos, guías de migración, configuración de plugins, casos edge.
- NO LO USES para: sintaxis básica de generadores (`nx g @nx/angular:app`), comandos estándar, cosas que ya conoces.
- El skill `nx-generate` maneja descubrimiento de generadores internamente — no llames nx_docs solo para buscar sintaxis.

# Arquitectura de CRBNB

## Apps
- `apps/web` — Angular 22 SSR. Sirve `crbnb.com` (portal búsqueda) y `*.crbnb.com` (subdominios de hosts).
- `apps/admin` — Angular 22 SPA. Sirve `admin.crbnb.com`. Bundle separado, RLS estricto.
- `apps/functions` — Supabase Edge Functions (Deno). Webhooks de pago, cron de calendar sync, OAuth callbacks.

## Packages (libs)
- `packages/ui` — Componentes compartidos (button, modal, calendar, map, language-switcher, header, footer).
- `packages/data-access` — Wrappers tipados de Supabase, queries tipadas, AuthService.
- `packages/domain` — Lógica de dominio pura: pricing, fees, currency conversion, availability (sin Angular).
- `packages/i18n` — Fuentes XLIFF (es.xlf, en.xlf) y helpers de localización.
- `packages/payments` — Interfaz `PaymentProvider` + adapters (Tylopay, Onvo, SINPE, Cash).
- `packages/util` — Utilidades: date, geo, slug, validation.

## db/
- `db/migrations/` — SQL migrations de Supabase, versionadas.
- `db/policies/` — Políticas RLS, versionadas por separado de las migrations de schema.
- `db/seed/` — Datos iniciales (amenities, países, currencies).

## infra/
- `infra/cloudflare/workers/` — Cloudflare Workers (subdomain-router, etc.).
- `infra/supabase/` — Configuración de Supabase + scripts de deploy de Edge Functions.
- `infra/ci/` — Configuraciones adicionales de CI.

# Decisiones técnicas clave

1. **Multi-tenancy:** Una sola DB Postgres + Row-Level Security. NO DB-per-tenant ni schema-per-tenant.
2. **Subdominios:** Resueltos en el edge via Cloudflare Worker que inyecta headers al Angular SSR.
3. **Pagos:** Adapter pattern con Tylopay/Onvo/SINPE/Cash. El dinero nunca pasa por CRBNB.
4. **Calendar sync:** OAuth + push (webhook) + pull (sync_token). Outlook soportado añadiendo adapter.
5. **i18n:** @angular/localize build-time splitting (es + en). URLs sin prefijo de locale.
6. **Búsqueda:** Postgres FTS ahora, Meilisearch después (>5k listings).

# Convenciones del proyecto

- **Standalone components:** Todos los componentes son standalone, sin NgModules.
- **Signals:** Usar signals para estado reactivo.
- **Nuevo control flow:** `@if`, `@for`, `@switch` (nunca `*ngIf`, `*ngFor`).
- **Estilos:** SCSS con CSS variables. Mobile-first responsive.
- **Tests:** Vitest para unit/integration, Playwright para E2E multi-tenant.
- **Idioma del código:** Comentarios y mensajes en español cuando aplique a UI/UX; variables y nombres en inglés (estándar).
- **Idioma del usuario:** El usuario se comunica en español. Respuestas en español, términos técnicos en inglés cuando es estándar.

# Documentación adicional

- Plan completo del proyecto: `docs/PLAN.md` (referencia, no editar)
- Setup para nuevos devs: `docs/SETUP.md`
- Compliance Ley 8968: `docs/COMPLIANCE.md`