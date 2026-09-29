# CRBNB — Guía de setup para nuevos devs

Esta guía te lleva de cero a un entorno local funcional en 30 minutos.

## 1. Prerequisitos

| Herramienta | Versión | Cómo instalar |
|---|---|---|
| Node | ≥ 20.x | [nvm](https://github.com/nvm-sh/nvm) o [fnm](https://github.com/Schniz/fnm) |
| pnpm | ≥ 9.x | `npm install -g pnpm` |
| Git | ≥ 2.30 | tu distro |
| Docker | última | para Supabase local |

Verifica:
```bash
node --version   # v20+
pnpm --version   # 9+
git --version    # 2.30+
```

## 2. Clonar e instalar

```bash
git clone git@github.com:crbnb/crbnb.git
cd crbnb
pnpm install
```

Si ves warnings sobre build scripts ignorados, ejecuta:
```bash
pnpm approve-builds
# Marca: esbuild, @swc/core, sharp, workerd
```

## 3. Configurar Supabase

### Opción A: Supabase Cloud (recomendado para desarrollo real)

1. Crear cuenta en [supabase.com](https://supabase.com/)
2. Crear nuevo proyecto:
   - Name: `crbnb-dev` (o el que prefieras)
   - Database password: **guardar en lugar seguro**
   - Region: `US East (North Virginia)` (más cercano a CR con HIPAA)
3. Esperar ~2 minutos a que se aprovisione
4. Ir a **Settings → API** y copiar:
   - `URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ NUNCA exponer al browser
5. Ir a **Settings → General** y copiar `Reference ID` → `SUPABASE_PROJECT_ID`

### Opción B: Supabase local (Docker)

```bash
# Requiere Docker corriendo
npx supabase start
# → Imprime las env vars en consola. Cópialas a tu .env
```

## 4. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus claves
```

Variables mínimas para arrancar:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 5. Aplicar migrations a la DB

### Si usas Supabase Cloud:

```bash
# Vincular proyecto
npx supabase link --project-ref <SUPABASE_PROJECT_ID>

# Aplicar migrations
npx supabase db push
```

### Si usas Supabase local:

```bash
npx supabase db reset
# Aplica todas las migrations desde cero + seed
```

## 6. Regenerar tipos TypeScript

```bash
pnpm db:types
# → packages/data-access/src/lib/supabase/database.types.ts
```

Este archivo debe commitearse. CI lo regenera automáticamente en deploy.

## 7. Levantar la app

```bash
pnpm start
# → http://localhost:4200
```

Deberías ver el landing con:
- Hero "Hospedajes directos en Costa Rica"
- Botón "Iniciar sesión" en el header
- Footer con links a páginas legales

## 8. Probar el flujo de auth

1. Click "Iniciar sesión"
2. Ingresa tu email
3. Click "Enviar link mágico"
4. Revisa tu bandeja (Supabase manda un email real en sandbox)
5. Click en el link → te redirige a `/auth/callback`
6. → → te lleva a `/account` con tu email visible

> **Nota:** Para que los emails lleguen, configura SMTP custom en
> Supabase (dashboard → Auth → SMTP Settings). En sandbox puede llegar
> a `trash` o tener delays.

## 9. Configurar Cloudflare (opcional para dev local)

Solo necesario si quieres probar subdominios `casa1.crbnb.com` localmente.

1. Crear cuenta en [cloudflare.com](https://cloudflare.com/)
2. Agregar dominio `crbnb.com` (o un subdominio para dev: `crbnb.localtest.me`)
3. Crear KV namespace:
   ```bash
   pnpm dlx wrangler kv namespace create CRBNB_HOST_CACHE
   # → actualizar wrangler.toml con el ID devuelto
   ```
4. Configurar secretos:
   ```bash
   pnpm dlx wrangler secret put SUPABASE_URL
   pnpm dlx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   pnpm dlx wrangler secret put ORIGIN_URL
   ```

## 10. Tests

```bash
# Unit (Vitest)
pnpm nx test web

# E2E (Playwright) — requiere app corriendo
pnpm start &
pnpm nx e2e web
```

## 11. Troubleshooting

### "Cannot find module '@crbnb/data-access'"

Asegúrate que `pnpm install` se ejecutó. Si el problema persiste:
```bash
rm -rf node_modules .nx/cache
pnpm install
```

### "Supabase env vars no configuradas"

Verifica que `.env` existe y tiene `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
La app lee env vars en `globalThis.process.env` para SSR y del `window.__SUPABASE_*__` para browser.

### "Build budget exceeded"

Si añades muchas dependencias, ajusta budgets en `apps/web/project.json`:
```json
"budgets": [
  { "type": "initial", "maximumWarning": "1mb", "maximumError": "2mb" }
]
```

### "Tailwind no aplica"

CRBNB usa **SCSS puro con CSS variables**, no Tailwind. Estilos globales en `apps/web/src/styles.scss`. Variables en `:root { --crbnb-* }`.

## Próximos pasos

- Lee [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para entender decisiones de diseño
- Lee [docs/PLAN.md](docs/PLAN.md) para ver el roadmap de 12 fases
- Si vas a trabajar en una fase, lee su spec primero