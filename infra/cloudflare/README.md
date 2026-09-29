# CRBNB — Cloudflare Worker: subdomain-router

Este Worker resuelve el subdominio `casa1.crbnb.com` al host_id correspondiente
y lo inyecta en headers HTTP al origen Angular SSR.

## Prerequisitos

- Cuenta en [Cloudflare](https://dash.cloudflare.com/) con plan **Workers Paid** (KV)
- Dominio `crbnb.com` agregado a Cloudflare
- Wrangler CLI: `pnpm dlx wrangler`

## Setup

```bash
# 1. Login
pnpm dlx wrangler login

# 2. Crear KV namespace (production + preview)
pnpm dlx wrangler kv namespace create CRBNB_HOST_CACHE
pnpm dlx wrangler kv namespace create CRBNB_HOST_CACHE --preview

# 3. Actualizar infra/cloudflare/wrangler.toml con los IDs devueltos

# 4. Configurar secretos
pnpm dlx wrangler secret put SUPABASE_URL
pnpm dlx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm dlx wrangler secret put ORIGIN_URL   # e.g. https://crbnb-web.pages.dev

# 5. Configurar DNS wildcard en Cloudflare dashboard:
#    Tipo: CNAME  Nombre: *  Contenido: crbnb-subdomain-router.<account>.workers.dev
#    Proxy: habilitado (naranja)

# 6. Configurar SSL:
#    SSL/TLS → Edge Certificates → Universal SSL (ya cubre *.crbnb.com automáticamente)
#    SSL mode: Full (Strict)
```

## Desarrollo local

```bash
pnpm dlx wrangler dev --config infra/cloudflare/wrangler.toml
```

## Deploy

```bash
pnpm dlx wrangler deploy --config infra/cloudflare/wrangler.toml
```

## Headers inyectados

| Header | Descripción |
|---|---|
| `x-crbnb-host-id` | UUID del host en la DB |
| `x-crbnb-host-slug` | Slug legible (mismo que subdominio) |

Si la petición es al apex (`crbnb.com` o `www.crbnb.com`), los headers NO se inyectan.

## Cache

- **KV TTL:** 5 minutos
- **Invalidación:** Al actualizar un host en Supabase, trigger SQL puede llamar
  al endpoint de invalidación (`POST /api/internal/invalidate-host?slug=X`).
  Esto se implementará en Fase 3.

## TODO Fase 3

- [ ] Endpoint de invalidación (`POST /api/internal/invalidate-host`)
- [ ] Trigger SQL en `public.hosts` que llame al endpoint via `pg_net`
- [ ] Soporte para `staging.crbnb.com`
- [ ] Cron handler para refresh proactivo