import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuración de SSR por ruta.
 *
 * Estrategia por defecto:
 *   - Páginas públicas estáticas (home, legal) → Prerender (HTML en build)
 *   - Páginas con auth (account) → Server (render por request)
 *   - 404 → Server (render dinámico)
 *
 * Las páginas que cargan datos dinámicos deben declararse explícitamente.
 */

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/signup',
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/callback',
    renderMode: RenderMode.Server,
  },
  {
    path: 'account',
    renderMode: RenderMode.Server,
  },
  {
    path: 'legal/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      { slug: 'privacy' },
      { slug: 'terms' },
      { slug: 'cookies' },
    ],
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];