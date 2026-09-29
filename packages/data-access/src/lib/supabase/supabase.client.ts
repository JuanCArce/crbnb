/**
 * Cliente Supabase para Angular SSR.
 *
 * Estrategia:
 *   - En el servidor: cliente que lee/escribe cookies del request (Angular SSR)
 *   - En el navegador: cliente con persistencia local (cookies httpOnly via SSR)
 *
 * Usa @supabase/ssr que es la versión oficial para SSR (reemplazo de @supabase/auth-helpers).
 *
 * Uso:
 *   import { createSupabaseClient } from '@crbnb/data-access';
 *
 *   // En un componente / servicio Angular:
 *   const supabase = inject(SupabaseService);
 *   const { data, error } = await supabase.client.from('properties').select();
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Database } from './database.types';

// Helper: el tipado estricto de Supabase v2.117+ requiere genéricos adicionales.
// Usamos un type alias más flexible para evitar fricción al upgrade.
export type AppSupabaseClient = SupabaseClient<Database, 'public'>;

export interface SupabaseEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Lee las variables de entorno de Supabase.
 * En SSR se leen del process.env (Node); en browser del globalThis.
 */
function readSupabaseEnv(): SupabaseEnv {
  const isBrowser = typeof window !== 'undefined';
  const envSource = isBrowser ? globalThis : (globalThis as { process?: { env?: Record<string, string> } });
  const env = envSource.process?.env ?? {};

  const supabaseUrl =
    env['SUPABASE_URL'] ??
    (isBrowser ? (window as unknown as { __SUPABASE_URL__?: string }).__SUPABASE_URL__ : undefined) ??
    'http://localhost:54321'; // fallback para dev local

  const supabaseAnonKey =
    env['SUPABASE_ANON_KEY'] ??
    (isBrowser ? (window as unknown as { __SUPABASE_ANON_KEY__?: string }).__SUPABASE_ANON_KEY__ : undefined) ??
    'public-anon-key-placeholder';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars no configuradas. Verifica SUPABASE_URL y SUPABASE_ANON_KEY.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Servicio inyectable que expone el cliente Supabase tipado con nuestra DB.
 *
 * Importante: este servicio es lazy — el cliente se crea al primer inject(),
 * no al cargar el módulo. Esto evita errores en SSR si las env vars no están listas.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private _client: AppSupabaseClient | null = null;

  get client(): AppSupabaseClient {
    if (!this._client) {
      this._client = this.createClient();
    }
    return this._client;
  }

  private createClient(): AppSupabaseClient {
    const isBrowser = isPlatformBrowser(this.platformId);
    const { supabaseUrl, supabaseAnonKey } = readSupabaseEnv();

    if (isBrowser) {
      // Cliente browser: usa cookies del documento
      return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) as unknown as AppSupabaseClient;
    }

    // Cliente servidor: persistSession false para no contaminar el singleton.
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as unknown as AppSupabaseClient;
  }

  /**
   * Crea un cliente servidor con acceso a las cookies del request actual.
   * Llamar desde un server-side resolver/interceptor que tenga acceso a Request.
   */
  createServerClientWithCookies(
    request: Request,
    response: { headers: Headers }
  ): AppSupabaseClient {
    const { supabaseUrl, supabaseAnonKey } = readSupabaseEnv();
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
          getAll: () => {
            const cookieHeader = request.headers.get('cookie') ?? '';
            return cookieHeader.split('; ').filter(Boolean).map((kv) => {
              const eq = kv.indexOf('=');
              const name = eq === -1 ? kv : kv.slice(0, eq);
              const value = eq === -1 ? '' : kv.slice(eq + 1);
              return { name, value: decodeURIComponent(value) };
            });
          },
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) => {
            for (const { name, value, options } of cookiesToSet) {
              const cookieOptions: CookieOptions = options ?? {};
              const parts = [`${name}=${encodeURIComponent(value)}`];
              if (cookieOptions.maxAge) parts.push(`Max-age=${cookieOptions.maxAge}`);
              if (cookieOptions.path) parts.push(`Path=${cookieOptions.path}`);
              if (cookieOptions.domain) parts.push(`Domain=${cookieOptions.domain}`);
              if (cookieOptions.sameSite) parts.push(`SameSite=${cookieOptions.sameSite}`);
              if (cookieOptions.secure) parts.push('Secure');
              if (cookieOptions.httpOnly) parts.push('HttpOnly');
              response.headers.append('Set-Cookie', parts.join('; '));
            }
          },
        },
    }) as unknown as AppSupabaseClient;
  }
}