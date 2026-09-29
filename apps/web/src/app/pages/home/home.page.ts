/**
 * HomePage — landing del portal principal (crbnb.com).
 *
 * SEO:
 *   - title + meta description vía Angular Meta service (TODO: enlazar)
 *   - JSON-LD LodgingBusiness cuando existan listings
 *
 * Render: SSR con Prerender mode.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'crbnb-home-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-hero">
      <div class="crbnb-container">
        <h1 class="crbnb-hero__title">
          Hospedajes <span class="crbnb-hero__highlight">directos</span> en Costa Rica
        </h1>
        <p class="crbnb-hero__subtitle">
          Sin comisiones absurdas. Conecta directo con tu host. Tú reservas, el host recibe.
        </p>

        <form class="crbnb-hero__search" (submit)="onSearch($event)">
          <label class="crbnb-hero__field">
            <span>¿</span>
            <input
              type="text"
              name="destination"
              placeholder="Manuel Antonio, La Fortuna, Tamarindo…"
              autocomplete="off"
            />
          </label>
          <button type="submit" class="crbnb-hero__submit">Explorar</button>
        </form>

        <p class="crbnb-hero__trust">
          🌿 Pagos directos al host · 🔒 Verificación opcional · 💬 Mensajería directa
        </p>
      </div>
    </section>

    <section class="crbnb-features">
      <div class="crbnb-container">
        <h2>¿Por qué CRBNB?</h2>
        <div class="crbnb-features__grid">
          <article>
            <h3>💸 Comisiones bajas</h3>
            <p>3% de comisión por reserva — vs 14-20% en otras plataformas. El host recibe casi todo.</p>
          </article>
          <article>
            <h3>🌐 Tu propia página</h3>
            <p>Cada hospedaje tiene su subdominio <code>casa1.crbnb.com</code> para compartir en Instagram y TikTok.</p>
          </article>
          <article>
            <h3>💬 Mensajería directa</h3>
            <p>Habla directo con tu host antes de reservar. Sin intermediarios.</p>
          </article>
          <article>
            <h3>🔒 Pagos seguros</h3>
            <p>Tylopay, Onvo, SINPE Móvil o efectivo. Tú eliges cómo pagar.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="crbnb-cta">
      <div class="crbnb-container">
        <h2>¿Tienes un hospedaje?</h2>
        <p>Publica gratis. Mantén el control. Tus huéspedes, tu marca.</p>
        <a routerLink="/host/onboarding" class="crbnb-cta__button">Conviértete en host →</a>
      </div>
    </section>
  `,
  styleUrl: './home.page.scss',
})
export class HomePage {
  onSearch(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const destination = (form.elements.namedItem('destination') as HTMLInputElement)?.value ?? '';
    window.location.href = `/search?destination=${encodeURIComponent(destination)}`;
  }
}