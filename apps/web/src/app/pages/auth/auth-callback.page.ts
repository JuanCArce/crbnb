/**
 * AuthCallbackPage — maneja el retorno de OAuth/magic link.
 *
 * Supabase redirige aquí con tokens en el hash (#) o query (?). El cliente
 * automáticamente detecta la sesión y completa el flujo. Este componente
 * solo muestra feedback al usuario.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@crbnb/data-access';

@Component({
  selector: 'crbnb-auth-callback-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-auth-callback">
      <div class="crbnb-auth-callback__card">
        @if (auth.loading()) {
          <h1>Completando inicio de sesión…</h1>
          <p>Espera un momento.</p>
        } @else if (auth.isAuthenticated()) {
          <h1>¡Bienvenido a CRBNB! 🎉</h1>
          <p>Te llevamos a tu cuenta…</p>
        } @else {
          <h1>Link inválido o expirado</h1>
          <p>Por favor intenta iniciar sesión de nuevo.</p>
          <a routerLink="/auth/login">Iniciar sesión</a>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; padding: 4rem 1.5rem; }
    .crbnb-auth-callback { max-width: 28rem; margin: 0 auto; text-align: center; }
    .crbnb-auth-callback__card {
      padding: 2.5rem 2rem;
      background: var(--crbnb-bg);
      border: 1px solid var(--crbnb-border);
      border-radius: var(--crbnb-radius-lg);
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: var(--crbnb-fg-muted); margin-bottom: 1rem; }
  `,
})
export class AuthCallbackPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Supabase ya intercambió el código por sesión automáticamente.
    // Solo redirigimos cuando auth termine de cargar.
    setTimeout(() => {
      if (this.auth.isAuthenticated()) {
        this.router.navigate(['/account']);
      }
    }, 500);
  }
}