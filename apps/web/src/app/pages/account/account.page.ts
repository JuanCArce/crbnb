/**
 * AccountPage — vista básica del usuario autenticado.
 * En Fase 2+ se expande con perfil, propiedades, reservas, etc.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@crbnb/data-access';

@Component({
  selector: 'crbnb-account-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-account">
      <div class="crbnb-container">
        <h1>Mi cuenta</h1>

        @if (auth.user(); as user) {
          <div class="crbnb-account__card">
            <h2>Hola, {{ user.user_metadata?.['full_name'] ?? user.email }}</h2>
            <dl>
              <dt>Email</dt>
              <dd>{{ user.email }}</dd>
              <dt>Idioma</dt>
              <dd>{{ user.user_metadata?.['language'] === 'en' ? 'English' : 'Español' }}</dd>
              <dt>ID</dt>
              <dd><code>{{ user.id }}</code></dd>
            </dl>
          </div>
        }

        <p class="crbnb-account__next">
          Próximamente podrás gestionar tus propiedades y reservas aquí.
        </p>

        <p><a routerLink="/">← Volver al inicio</a></p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .crbnb-account { padding: 3rem 1.5rem 5rem; }
    .crbnb-account__card {
      max-width: 32rem;
      padding: 2rem;
      background: var(--crbnb-bg);
      border: 1px solid var(--crbnb-border);
      border-radius: var(--crbnb-radius-lg);
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    dl { margin: 0; }
    dt { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--crbnb-fg-faint); margin-top: 1rem; }
    dd { margin: 0.25rem 0 0; font-size: 0.95rem; }
    code { background: var(--crbnb-bg-muted); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.85em; }
    .crbnb-account__next { color: var(--crbnb-fg-muted); margin-bottom: 1rem; }
  `,
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
}