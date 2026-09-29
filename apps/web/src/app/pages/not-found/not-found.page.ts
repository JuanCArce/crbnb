/**
 * NotFoundPage — 404 con copy amigable y CTAs.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'crbnb-not-found-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="crbnb-404">
      <div class="crbnb-404__inner">
        <p class="crbnb-404__code">404</p>
        <h1 class="crbnb-404__title">No encontramos esta página</h1>
        <p class="crbnb-404__body">
          Tal vez el link está roto, o la propiedad fue removida. ¿Qué te gustaría hacer?
        </p>
        <div class="crbnb-404__actions">
          <a routerLink="/" class="crbnb-404__primary">Ir al inicio</a>
          <a routerLink="/search" class="crbnb-404__secondary">Explorar hospedajes</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .crbnb-404 {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }
    .crbnb-404__inner {
      text-align: center;
      max-width: 32rem;
    }
    .crbnb-404__code {
      font-size: 5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--crbnb-gradient-start), var(--crbnb-gradient-end));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .crbnb-404__title { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .crbnb-404__body { color: var(--crbnb-fg-muted); margin-bottom: 2rem; }
    .crbnb-404__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .crbnb-404__primary, .crbnb-404__secondary {
      padding: 0.75rem 1.5rem;
      border-radius: var(--crbnb-radius-full);
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .crbnb-404__primary { background: var(--crbnb-accent); color: #fff; }
    .crbnb-404__primary:hover { background: var(--crbnb-accent-hover); text-decoration: none; }
    .crbnb-404__secondary { background: transparent; color: var(--crbnb-fg); border: 1px solid var(--crbnb-border); }
    .crbnb-404__secondary:hover { background: var(--crbnb-hover); text-decoration: none; }
  `,
})
export class NotFoundPage {}