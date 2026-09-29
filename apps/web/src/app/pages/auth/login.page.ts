/**
 * LoginPage — magic link + Google OAuth.
 *
 * Diseño mobile-first. Toggle entre magic link y signup.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@crbnb/data-access';

@Component({
  selector: 'crbnb-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-auth">
      <div class="crbnb-auth__card">
        <h1>Iniciar sesión</h1>
        <p class="crbnb-auth__subtitle">
          Te enviaremos un link mágico a tu correo. Sin contraseñas.
        </p>

        <form (submit)="onSubmit($event)" class="crbnb-auth__form">
          <label class="crbnb-auth__field">
            <span>Correo electrónico</span>
            <input
              type="email"
              name="email"
              required
              autocomplete="email"
              placeholder="tu@correo.com"
              [(ngModel)]="email"
              [disabled]="auth.loading()"
            />
          </label>

          @if (auth.error()) {
            <p class="crbnb-auth__error" role="alert">
              {{ auth.error() }}
            </p>
          }

          @if (sent()) {
            <p class="crbnb-auth__success" role="status">
              ✉️ ¡Link enviado! Revisa tu correo.
            </p>
          }

          <button type="submit" class="crbnb-auth__submit" [disabled]="auth.loading() || !email()">
              {{ auth.loading() ? 'Enviando…' : 'Enviar link mágico' }}
            </button>
        </form>

        <div class="crbnb-auth__divider"><span>o</span></div>

        <button
          type="button"
          class="crbnb-auth__google"
          (click)="signInWithGoogle()"
          [disabled]="auth.loading()"
        >
          <span aria-hidden="true">🇬</span> Continuar con Google
        </button>

        <p class="crbnb-auth__footer">
          ¿No tienes cuenta?
          <a routerLink="/auth/signup">Regístrate</a>
        </p>
      </div>
    </section>
  `,
  styleUrl: './auth.page.scss',
})
export class LoginPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal<string>('');
  readonly sent = signal<boolean>(false);

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.email()) return;

    const locale = (this.email().endsWith('.com') ? 'en' : 'es') as 'es' | 'en';
    const { error } = await this.auth.signInWithMagicLink(this.email(), locale);
    if (!error) this.sent.set(true);
  }

  async signInWithGoogle(): Promise<void> {
    await this.auth.signInWithGoogle('es');
  }
}