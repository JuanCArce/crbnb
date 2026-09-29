import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@crbnb/data-access';

/**
 * Routes de la app principal (apps/web).
 *
 * Estructura:
 *   /                      → Home (apex crbnb.com)
 *   /search                → Buscador (Fase 4)
 *   /host/onboarding       → Wizard para convertirse en host (Fase 2)
 *   /:hostSlug             → Página pública del host (Fase 3)
 *   /:hostSlug/:propertyId → Página de propiedad (Fase 3)
 *   /auth/login            → Magic link + Google
 *   /auth/signup           → Registro
 *   /auth/callback         → Retorno de OAuth/magic link
 *   /account               → Dashboard del usuario (protegido)
 *   /legal/:slug           → Páginas legales (privacy/terms/cookies)
 *   /help, /about, ...     → Páginas estáticas (próximas fases)
 *   **                     → 404
 */

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
    title: 'CRBNB — Hospedajes directos en Costa Rica',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/login.page').then((m) => m.LoginPage),
        title: 'Iniciar sesión · CRBNB',
      },
      {
        path: 'signup',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/signup.page').then((m) => m.SignupPage),
        title: 'Registrarse · CRBNB',
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./pages/auth/auth-callback.page').then((m) => m.AuthCallbackPage),
        title: 'Iniciando sesión… · CRBNB',
      },
    ],
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/account/account.page').then((m) => m.AccountPage),
    title: 'Mi cuenta · CRBNB',
  },
  {
    path: 'legal',
    children: [
      {
        path: ':slug',
        loadComponent: () =>
          import('./pages/legal/legal.page').then((m) => m.LegalPage),
      },
      { path: '', redirectTo: 'privacy', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: 'Página no encontrada · CRBNB',
  },
];