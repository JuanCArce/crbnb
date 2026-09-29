/**
 * Servicio de autenticación para CRBNB.
 *
 * Expone el estado del usuario actual como signals (Angular 22 reactive state).
 * Métodos soportados:
 *   - signInWithMagicLink(email): envía link de acceso al email
 *   - signInWithGoogle(): OAuth con Google
 *   - signOut(): cierra sesión
 *   - refreshSession(): fuerza refresh del JWT
 *
 * Patrón de uso:
 *   const auth = inject(AuthService);
 *   const user = auth.user();   // signal<User | null>
 *   const isLoggedIn = auth.isAuthenticated(); // computed<boolean>
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.client';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  // Estado interno como signals (read-only públicamente)
  private readonly _user = signal<User | null>(null);
  private readonly _session = signal<Session | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly session = this._session.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals derivados
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userId = computed(() => this._user()?.id ?? null);
  readonly userEmail = computed(() => this._user()?.email ?? null);
  readonly userLanguage = computed(() => {
    const meta = this._user()?.user_metadata;
    return (meta?.['language'] as 'es' | 'en' | undefined) ?? 'es';
  });

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa el estado de auth desde la sesión existente y suscribe a cambios.
   */
  private async initialize(): Promise<void> {
    try {
      const { data, error } = await this.supabase.client.auth.getSession();
      if (error) throw error;
      this._session.set(data.session);
      this._user.set(data.session?.user ?? null);
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this._loading.set(false);
    }

    // Suscribirse a cambios de auth (login, logout, token refresh)
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);
    });
  }

  /**
   * Envía un magic link al email del usuario.
   * El link redirige a /auth/callback que completa el flujo.
   */
  async signInWithMagicLink(email: string, locale: 'es' | 'en' = 'es'): Promise<{ error: string | null }> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const redirectTo = `${this.getOrigin()}/auth/callback`;
      const { error } = await this.supabase.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: { language: locale },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._error.set(msg);
      return { error: msg };
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Inicia OAuth con Google.
   */
  async signInWithGoogle(locale: 'es' | 'en' = 'es'): Promise<{ error: string | null }> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const redirectTo = `${this.getOrigin()}/auth/callback`;
      const { error } = await this.supabase.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { hl: locale },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._error.set(msg);
      return { error: msg };
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Cierra sesión.
   */
  async signOut(): Promise<void> {
    this._loading.set(true);
    try {
      await this.supabase.client.auth.signOut();
      this._user.set(null);
      this._session.set(null);
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Refresca el JWT (útil antes de operaciones sensibles).
   */
  async refreshSession(): Promise<void> {
    const { data, error } = await this.supabase.client.auth.refreshSession();
    if (error) {
      this._error.set(error.message);
      return;
    }
    this._session.set(data.session);
    this._user.set(data.session?.user ?? null);
  }

  private getOrigin(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:4200';
  }
}