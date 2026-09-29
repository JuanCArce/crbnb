/**
 * Guards de autenticación para Angular Router.
 *
 * Uso en app.routes.ts:
 *   {
 *     path: 'host/dashboard',
 *     canActivate: [authGuard],
 *     loadComponent: () => import('./pages/dashboard.component'),
 *   }
 */

import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protege rutas que necesitan usuario autenticado.
 * Si no está autenticado, redirige a /auth/login con returnUrl.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Protege rutas que NO deben ser accesibles si el usuario YA está autenticado.
 * (ej: /auth/login, /auth/signup — redirigen al home si ya hay sesión)
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

/**
 * Protege rutas que requieren rol de host.
 * El usuario debe estar autenticado Y tener una fila en public.hosts.
 */
export const hostGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // TODO Phase 2: verificar que el usuario tiene fila en hosts (via RPC o query)
  // Por ahora permitimos si está autenticado
  return true;
};

/**
 * Protege rutas de super-administrador.
 * Requiere rol 'admin' en profiles (se añadirá en fase de admin).
 */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // TODO Phase 10: verificar admin role
  return router.createUrlTree(['/']);
};