/**
 * CRBNB — Cloudflare Worker: subdomain-router
 *
 * Resuelve el subdominio `casa1.crbnb.com` al host_id correspondiente y lo
 * inyecta como header en la petición al origen (Angular SSR).
 *
 * Flujo:
 *   1. Lee header `Host`
 *   2. Si es apex o www → forward directo sin inyectar nada
 *   3. Si es subdominio *.crbnb.com → busca slug → host_id en KV (5 min TTL)
 *   4. Si cache miss → fallback a Supabase REST (60s TTL) para popular cache
 *   5. Si host no existe → 404 con página amigable
 *   6. Forward al origen con headers inyectados:
 *        - x-crbnb-host-id
 *        - x-crbnb-host-slug
 *
 * Headers inyectados son leídos por Angular SSR via TransferState para que
 * la hidratación conozca el tenant desde el primer paint.
 */

interface Env {
  HOST_CACHE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ORIGIN_URL: string; // e.g. https://crbnb-web.pages.dev
}

interface HostInfo {
  id: string;
  slug: string;
  is_suspended: boolean;
}

const KV_TTL_SECONDS = 300; // 5 minutos
const APEX_HOSTS = new Set(['crbnb.com', 'www.crbnb.com']);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // 1. Determinar si es apex/www (portal principal) o subdominio (host)
    if (APEX_HOSTS.has(hostname) || hostname === 'crbnb.com') {
      return forwardToOrigin(request, env, null);
    }

    // 2. Extraer subdominio
    const slug = extractSubdomain(hostname);
    if (!slug) {
      return notFound('Subdominio inválido');
    }

    // 3. Buscar en KV cache primero
    const cacheKey = `host:${slug}`;
    let host: HostInfo | null = (await env.HOST_CACHE.get(cacheKey, 'json')) as HostInfo | null;

    // 4. Cache miss → consultar Supabase
    if (!host) {
      try {
        host = await fetchHostFromSupabase(slug, env);
        if (host) {
          // Escribir en KV (no esperar, fire-and-forget via ctx.waitUntil)
          ctx.waitUntil(
            env.HOST_CACHE.put(cacheKey, JSON.stringify(host), {
              expirationTtl: KV_TTL_SECONDS,
            })
          );
        }
      } catch (err) {
        console.error('Supabase lookup failed', err);
        return errorResponse('Servicio temporalmente no disponible', 503);
      }
    }

    if (!host) {
      return notFound(`No encontramos el hospedaje "${slug}"`);
    }

    if (host.is_suspended) {
      return notFound('Este hospedaje está temporalmente suspendido', 403);
    }

    // 5. Forward al origen con headers inyectados
    return forwardToOrigin(request, env, host);
  },

  /**
   * Cron handler para invalidar cache de hosts suspendidos/actualizados.
   * Configurar en wrangler.toml con triggers = [{cron = "*/15 * * * *"}]
   */
  // async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  //   // TODO: refrescar lista de hosts suspendidos para limpieza proactiva de cache
  // },
};

function extractSubdomain(hostname: string): string | null {
  // casa1.crbnb.com → 'casa1'
  // staging.casa1.crbnb.com → 'casa1' (segundo segmento)
  // *.localhost → no soportado en MVP
  const parts = hostname.split('.');
  if (parts.length < 3) return null;
  // Para *.crbnb.com, parts = [slug, 'crbnb', 'com']
  if (parts[parts.length - 2] === 'crbnb' && parts[parts.length - 1] === 'com') {
    return parts[0];
  }
  return null;
}

async function fetchHostFromSupabase(slug: string, env: Env): Promise<HostInfo | null> {
  const endpoint = `${env.SUPABASE_URL}/rest/v1/hosts?select=id,slug,is_suspended&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Supabase returned', response.status);
    return null;
  }

  const rows = (await response.json()) as Array<{ id: string; slug: string; is_suspended: boolean }>;
  if (rows.length === 0) return null;
  return rows[0];
}

async function forwardToOrigin(request: Request, env: Env, host: HostInfo | null): Promise<Response> {
  const originUrl = new URL(request.url);
  originUrl.hostname = new URL(env.ORIGIN_URL).hostname;
  originUrl.protocol = new URL(env.ORIGIN_URL).protocol;

  const headers = new Headers(request.headers);
  if (host) {
    headers.set('x-crbnb-host-id', host.id);
    headers.set('x-crbnb-host-slug', host.slug);
  } else {
    headers.delete('x-crbnb-host-id');
    headers.delete('x-crbnb-host-slug');
  }

  return fetch(new Request(originUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  }));
}

function notFound(message: string, status = 404): Response {
  return new Response(notFoundHtml(message), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain' } });
}

function notFoundHtml(message: string): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>No encontrado · CRBNB</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: grid; place-items: center;
      min-height: 100vh; margin: 0;
      background: #f9fafb; color: #111827;
    }
    main { text-align: center; max-width: 32rem; padding: 2rem; }
    h1 { font-size: 5rem; margin: 0; color: #2563eb; }
    p { color: #4b5563; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <main>
    <h1>404</h1>
    <h2>${message}</h2>
    <p>¿Quieres explorar hospedajes? <a href="https://crbnb.com">crbnb.com</a></p>
  </main>
</body>
</html>`;
}