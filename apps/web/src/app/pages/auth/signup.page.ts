/**
 * SignupPage — registro con magic link.
 *
 * Por ahora signup y login son idénticos (magic link crea cuenta implícita).
 * En fases futuras se podrá añadir wizard de onboarding para hosts.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@crbnb/data-access';

@Component({
  selector: 'crbnb-signup-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-auth">
      <div class="crbnb-auth__card">
        <h1>Crear cuenta</h1>
        <p class="crbnb-auth__subtitle">
          Empieza con tu correo. Te enviaremos un link para acceder.
        </p>

        <form (submit)="onSubmit($event)" class="crbnb-auth__form">
          <label class="crbnb-auth__field">
            <span>Nombre</span>
            <input
              type="text"
              name="name"
              required
              autocomplete="name"
              placeholder="Tu nombre"
              [(ngModel)]="name"
              [disabled]="auth.loading()"
            />
          </label>

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
            <p class="crbnb-auth__error" role="alert">{{ auth.error() }}</p>
          }

          @if (sent()) {
            <p class="crbnb-auth__success" role="status">
              ✉️ ¡Link enviado! Revisa tu correo para completar el registro.
            </p>
          }

          <button type="submit" class="crbnb-auth__submit" [disabled]="auth.loading() || !email() || !name()">
            {{ auth.loading() ? 'Enviando…' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="crbnb-auth__divider"><span>o</span></div>

        <button
          type="button"
          class="crbnb-auth__google"
          (click)="signInWithGoogle()"
          [disabled]="auth.loading()"
        >
          <span aria-hidden="true">🇬</span> Registrarse con Google
        </button>

        <p class="crbnb-auth__footer">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login">Iniciar sesión</a>
        </p>
      </div>
    </section>
  `,
  styleUrl: './auth.page.scss',
})
export class SignupPage {
  protected readonly auth = inject(AuthService);

  readonly name = signal<string>('');
  readonly email = signal<string>('');
  readonly sent = signal<boolean>(false);

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.email() || !this.name()) return;

    const locale = 'es';
    const { error } = await this.auth.signInWithMagicLink(this.email(), locale);
    if (!error) this.sent.set(true);
  }

  async signInWithGoogle(): Promise<void> {
    await this.auth.signInWithGoogle('es');
  }
}