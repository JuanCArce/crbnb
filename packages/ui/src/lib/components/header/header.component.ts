/**
 * HeaderComponent — Airbnb-style compact header.
 *
 * Logo left, nav center (desktop), user actions right.
 * Sticky con borde sutil al hacer scroll.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
        </nav>

        <div class="crbnb-header__right">
          <a routerLink="/host/onboarding" class="crbnb-header__host-link">
            Conviértete en host
          </a>

          <crbnb-language-switcher />

          @if (auth.isAuthenticated()) {
            <div class="crbnb-header__user">
              <button type="button" class="crbnb-header__user-btn" aria-label="Menú de usuario">
                <span class="crbnb-header__user-avatar" aria-hidden="true">
                  {{ initial() }}
                </span>
              </button>
            </div>
          } @else {
            <a class="crbnb-header__login" routerLink="/auth/login">Iniciar sesión</a>
          }
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);

  initial(): string {
    const name = this.auth.user()?.user_metadata?.['full_name'] ?? this.auth.userEmail() ?? '?';
    return name.charAt(0).toUpperCase();
  }
}