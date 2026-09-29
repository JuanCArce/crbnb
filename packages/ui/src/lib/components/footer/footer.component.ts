/**
 * FooterComponent
 *
 * Pie de página global con links secundarios y copyright.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'crbnb-footer',
  standalone: true,
  imports: [RouterLink, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="crbnb-footer">
      <div class="crbnb-footer__inner">
        <div class="crbnb-footer__col">
          <h3>CRBNB</h3>
          <ul>
            <li><a routerLink="/about">Sobre nosotros</a></li>
            <li><a routerLink="/careers">Trabaja con nosotros</a></li>
            <li><a routerLink="/press">Prensa</a></li>
            <li><a routerLink="/blog">Blog</a></li>
          </ul>
        </div>

        <div class="crbnb-footer__col">
          <h3>Comunidad</h3>
          <ul>
            <li><a routerLink="/host/onboarding">Conviértete en host</a></li>
            <li><a routerLink="/help">Centro de ayuda</a></li>
            <li><a routerLink="/safety">Seguridad</a></li>
            <li><a routerLink="/contact">Contacto</a></li>
          </ul>
        </div>

        <div class="crbnb-footer__col">
          <h3>Legal</h3>
          <ul>
            <li><a routerLink="/legal/privacy">Privacidad</a></li>
            <li><a routerLink="/legal/terms">Términos</a></li>
            <li><a routerLink="/legal/cookies">Cookies</a></li>
            <li><a routerLink="/legal/iva">Información fiscal</a></li>
          </ul>
        </div>

        <div class="crbnb-footer__col">
          <h3>Idioma</h3>
          <crbnb-language-switcher />
        </div>
      </div>

      <div class="crbnb-footer__bottom">
        <p>© {{year}} CRBNB. Hecho en Costa Rica con 🌿.</p>
        <p class="crbnb-footer__disclaimer">
          Plataforma independiente — no afiliada a Airbnb, Inc. ni Booking Holdings.
        </p>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}