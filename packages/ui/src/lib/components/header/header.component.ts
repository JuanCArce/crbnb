/**
 * HeaderComponent
 *
 * Header global de la app con logo, navegación principal, y estado de auth.
 *
 * Uso:
 *   <crbnb-header />
 */

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@crbnb/data-access';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'crbnb-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="crbnb-header">
      <div class="crbnb-header__inner">
        <a class="crbnb-header__logo" routerLink="/" aria-label="CRBNB inicio">
          <span class="crbnb-header__brand">CRBNB</span>
        </a>

        <nav class="crbnb-header__nav" aria-label="Navegación principal">
          <a routerLink="/search" routerLinkActive="is-active">Explorar</a>
          <a routerLink="/host/onboarding" routerLinkActive="is-active">Publicar</a>
          <a routerLink="/help" routerLinkActive="is-active">Ayuda</a>
        </nav>

        <div class="crbnb-header__actions">
          <crbnb-language-switcher />

          @if (auth.isAuthenticated()) {
            <a class="crbnb-header__user" routerLink="/account">
              {{ auth.userEmail() }}
            </a>
            <button type="button" class="crbnb-header__signout" (click)="signOut()">
              Salir
            </button>
          } @else {
            <a class="crbnb-header__login" routerLink="/auth/login">Iniciar sesión</a>
            <a class="crbnb-header__signup" routerLink="/auth/signup">Registrarse</a>
          }
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}