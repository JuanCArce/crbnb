/**
 * SearchBarComponent — Airbnb-style centered search pill.
 *
 * Features:
 *   - Píldora horizontal con 4 secciones inline (destination, dates, guests, button)
 *   - Modo expandible en mobile (campos aparecen al hacer focus)
 *   - Hover/active states sutiles
 *   - Click en cada sección la expande
 *
 * Uso:
 *   <crbnb-search-bar (search)="onSearch($event)" />
 */

import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchPayload {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

@Component({
  selector: 'crbnb-search-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      class="crbnb-search"
      [class.is-expanded]="expandedField() !== null"
      (submit)="onSubmit($event)"
      role="search"
    >
      <button
        type="button"
        class="crbnb-search__field"
        [class.is-active]="expandedField() === 'destination'"
        (click)="expand('destination')"
      >
        <span class="crbnb-search__label">Dónde</span>
        <input
          type="text"
          name="destination"
          placeholder="Busca un destino"
          [(ngModel)]="destination"
          autocomplete="off"
        />
      </button>

      <button
        type="button"
        class="crbnb-search__field"
        [class.is-active]="expandedField() === 'checkIn'"
        (click)="expand('checkIn')"
      >
        <span class="crbnb-search__label">Entrada</span>
        <span class="crbnb-search__value">{{ checkIn || 'Agrega fechas' }}</span>
      </button>

      <button
        type="button"
        class="crbnb-search__field"
        [class.is-active]="expandedField() === 'checkOut'"
        (click)="expand('checkOut')"
      >
        <span class="crbnb-search__label">Salida</span>
        <span class="crbnb-search__value">{{ checkOut || 'Agrega fechas' }}</span>
      </button>

      <button
        type="button"
        class="crbnb-search__field crbnb-search__field--guests"
        [class.is-active]="expandedField() === 'guests'"
        (click)="expand('guests')"
      >
        <span class="crbnb-search__label">Huéspedes</span>
        <span class="crbnb-search__value">{{ guests() > 0 ? guests() + ' huéspedes' : '¿Cuántos?' }}</span>
      </button>

      <button type="submit" class="crbnb-search__submit" aria-label="Buscar">
        <span class="crbnb-search__submit-icon" aria-hidden="true">🔍</span>
        <span class="crbnb-search__submit-text">Buscar</span>
      </button>
    </form>
  `,
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  readonly search = output<SearchPayload>();

  readonly destination = signal<string>('');
  readonly checkIn = signal<string>('');
  readonly checkOut = signal<string>('');
  readonly guests = signal<number>(0);
  readonly expandedField = signal<'destination' | 'checkIn' | 'checkOut' | 'guests' | null>(null);

  expand(field: 'destination' | 'checkIn' | 'checkOut' | 'guests'): void {
    this.expandedField.set(field);
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.search.emit({
      destination: this.destination(),
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      guests: this.guests(),
    });
  }
}