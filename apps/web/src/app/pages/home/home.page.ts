/**
 * HomePage — Landing estilo Airbnb (airbnb.co.cr).
 *
 * Estructura:
 *   1. Header (sticky)
 *   2. Search bar centrada con pill horizontal
 *   3. Carrusel de categorías con iconos
 *   4. Carruseles de listings:
 *      - Alojamientos populares en [zona]
 *      - Tipos de hospedaje destacados
 *      - Disponibles este fin de semana
 *   5. Sección "Inspiración para viajes futuros" (grid destinos)
 *   6. Footer
 *
 * SEO: title + meta description vía Angular Title/Meta service.
 */

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBarComponent, CarouselComponent, type SearchPayload } from '@crbnb/ui';

interface Category {
  id: string;
  label: string;
  icon: string; // Emoji o URL
}

interface Listing {
  id: string;
  title: string;
  location: string;
  priceCents: number;
  priceCurrency: 'CRC' | 'USD';
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  badge?: 'favorite' | 'new';
}

@Component({
  selector: 'crbnb-home-page',
  standalone: true,
  imports: [RouterLink, SearchBarComponent, CarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Search hero (centrado, sin headline grande) -->
    <section class="crbnb-hero">
      <div class="crbnb-container">
        <h1 class="crbnb-hero__title">Hospedajes en Costa Rica</h1>
        <crbnb-search-bar (search)="onSearch($event)" />
      </div>
    </section>

    <!-- Categorías con iconos -->
    <section class="crbnb-section">
      <div class="crbnb-container">
        <div class="crbnb-categories">
          @for (cat of categories; track cat.id) {
            <button type="button" class="crbnb-categories__item" (click)="onCategoryClick(cat)">
              <span class="crbnb-categories__icon" aria-hidden="true">{{ cat.icon }}</span>
              <span class="crbnb-categories__label">{{ cat.label }}</span>
            </button>
          }
        </div>
      </div>
    </section>

    <!-- Alojamientos populares en Puerto Viejo -->
    <section class="crbnb-section">
      <div class="crbnb-container">
        <h2 class="crbnb-section__title">Alojamientos populares en Puerto Viejo de Talamanca</h2>
        <crbnb-carousel>
          @for (listing of listings; track listing.id) {
            <article class="crbnb-card">
              <a [routerLink]="['/p', listing.id]" class="crbnb-card__link">
                <div class="crbnb-card__image">
                  <img [src]="listing.imageUrl" [alt]="listing.title" loading="lazy" />
                  @if (listing.badge === 'favorite') {
                    <span class="crbnb-card__badge">Favorito entre huéspedes</span>
                  }
                </div>
                <div class="crbnb-card__body">
                  <h3 class="crbnb-card__title">{{ listing.title }}</h3>
                  <p class="crbnb-card__location">{{ listing.location }}</p>
                  <p class="crbnb-card__price">
                    <strong>{{ formatPrice(listing.priceCents, listing.priceCurrency) }}</strong>
                    por 2 noches
                  </p>
                  @if (listing.rating) {
                    <p class="crbnb-card__rating">
                      ★ {{ listing.rating }}
                      @if (listing.reviewCount) {
                        <span class="crbnb-card__reviews">· {{ listing.reviewCount }} reseñas</span>
                      }
                    </p>
                  }
                </div>
              </a>
            </article>
          }
        </crbnb-carousel>
        <a routerLink="/search" class="crbnb-section__view-all">Ver todo</a>
      </div>
    </section>

    <!-- Hoteles increíbles -->
    <section class="crbnb-section">
      <div class="crbnb-container">
        <h2 class="crbnb-section__title">Hoteles increíbles para tu próximo viaje</h2>
        <crbnb-carousel>
          @for (listing of listings; track listing.id) {
            <article class="crbnb-card">
              <a [routerLink]="['/p', listing.id]" class="crbnb-card__link">
                <div class="crbnb-card__image">
                  <img [src]="listing.imageUrl" [alt]="listing.title" loading="lazy" />
                </div>
                <div class="crbnb-card__body">
                  <h3 class="crbnb-card__title">{{ listing.title }}</h3>
                  <p class="crbnb-card__location">{{ listing.location }}</p>
                  <p class="crbnb-card__price">
                    <strong>{{ formatPrice(listing.priceCents, listing.priceCurrency) }}</strong>
                    por noche
                  </p>
                </div>
              </a>
            </article>
          }
        </crbnb-carousel>
        <a routerLink="/search" class="crbnb-section__view-all">Ver todo</a>
      </div>
    </section>

    <!-- Inspiración para viajes futuros -->
    <section class="crbnb-section crbnb-inspiration">
      <div class="crbnb-container">
        <h2 class="crbnb-section__title">Inspiración para escapadas futuras</h2>

        <div class="crbnb-inspiration__tabs">
          @for (tab of inspirationTabs; track tab.id) {
            <button
              type="button"
              class="crbnb-inspiration__tab"
              [class.is-active]="activeTab() === tab.id"
              (click)="activeTab.set(tab.id)"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="crbnb-inspiration__grid">
          @for (city of inspirationCities; track city.name) {
            <a [routerLink]="['/search']" [queryParams]="{destination: city.name}" class="crbnb-inspiration__cell">
              <span class="crbnb-inspiration__city">{{ city.name }}</span>
              <span class="crbnb-inspiration__type">{{ city.type }}</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './home.page.scss',
})
export class HomePage {
  readonly activeTab = signal<string>('popular');

  readonly categories: ReadonlyArray<Category> = [
    { id: 'beach',    label: 'Playa',          icon: '🏖️' },
    { id: 'mountain', label: 'Montaña',        icon: '⛰️' },
    { id: 'cabin',    label: 'Cabañas',        icon: '🏕️' },
    { id: 'pool',     label: 'Con piscina',    icon: '🏊' },
    { id: 'city',     label: 'Ciudades',       icon: '🌆' },
    { id: 'jungle',   label: 'Selva',          icon: '🌴' },
    { id: 'romantic', label: 'Romántico',      icon: '💕' },
    { id: 'family',   label: 'Familiar',       icon: '👨‍👩‍👧' },
    { id: 'trending', label: 'Trending',       icon: '🔥' },
    { id: 'volcano',  label: 'Volcanes',       icon: '🌋' },
  ];

  readonly listings: ReadonlyArray<Listing> = [
    {
      id: '1',
      title: 'Cabaña frente al mar',
      location: 'Playa Negra, Puerto Viejo',
      priceCents: 95000,
      priceCurrency: 'CRC',
      rating: 4.9,
      reviewCount: 128,
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      badge: 'favorite',
    },
    {
      id: '2',
      title: 'Bungalow en la selva',
      location: 'Cahuita',
      priceCents: 78000,
      priceCurrency: 'CRC',
      rating: 4.8,
      reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
      badge: 'favorite',
    },
    {
      id: '3',
      title: 'Casa con piscina',
      location: 'Manuel Antonio',
      priceCents: 145000,
      priceCurrency: 'CRC',
      rating: 4.95,
      reviewCount: 214,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      badge: 'favorite',
    },
    {
      id: '4',
      title: 'Loft moderno',
      location: 'San José Centro',
      priceCents: 65000,
      priceCurrency: 'CRC',
      rating: 4.7,
      reviewCount: 56,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    },
    {
      id: '5',
      title: 'Villa con vista al volcán',
      location: 'La Fortuna',
      priceCents: 120000,
      priceCurrency: 'CRC',
      rating: 4.92,
      reviewCount: 178,
      imageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
      badge: 'favorite',
    },
    {
      id: '6',
      title: 'Cabaña en el bosque',
      location: 'Monteverde',
      priceCents: 88000,
      priceCurrency: 'CRC',
      rating: 4.85,
      reviewCount: 102,
      imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    },
    {
      id: '7',
      title: 'Casa de playa',
      location: 'Tamarindo',
      priceCents: 165000,
      priceCurrency: 'CRC',
      rating: 4.88,
      reviewCount: 145,
      imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
    },
    {
      id: '8',
      title: 'Apartamento céntrico',
      location: 'Puerto Viejo',
      priceCents: 55000,
      priceCurrency: 'CRC',
      rating: 4.6,
      reviewCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
    },
    {
      id: '9',
      title: 'Eco-lodge',
      location: 'Tortuguero',
      priceCents: 95000,
      priceCurrency: 'CRC',
      rating: 4.93,
      reviewCount: 167,
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      badge: 'favorite',
    },
  ];

  readonly inspirationTabs = [
    { id: 'popular',   label: 'Popular' },
    { id: 'beach',     label: 'Playa' },
    { id: 'mountain',  label: 'Montaña' },
    { id: 'city',      label: 'Ciudades' },
  ];

  readonly inspirationCities = [
    { name: 'San José',    type: 'Alojamientos' },
    { name: 'Manuel Antonio', type: 'Playas' },
    { name: 'La Fortuna',  type: 'Volcanes' },
    { name: 'Puerto Viejo', type: 'Selva' },
    { name: 'Tamarindo',   type: 'Surf' },
    { name: 'Monteverde',  type: 'Bosques' },
    { name: 'Tortuguero',  type: 'Canales' },
    { name: 'Nosara',      type: 'Yoga' },
    { name: 'Drake Bay',   type: 'Aventura' },
    { name: 'Cahuita',     type: 'Reef' },
    { name: 'Dominical',   type: 'Cascadas' },
    { name: 'Santa Teresa', type: 'Playa' },
  ];

  onSearch(payload: SearchPayload): void {
    const params = new URLSearchParams();
    if (payload.destination) params.set('destination', payload.destination);
    if (payload.checkIn) params.set('checkIn', payload.checkIn);
    if (payload.checkOut) params.set('checkOut', payload.checkOut);
    if (payload.guests) params.set('guests', String(payload.guests));
    window.location.href = `/search?${params.toString()}`;
  }

  onCategoryClick(category: Category): void {
    window.location.href = `/search?category=${category.id}`;
  }

  formatPrice(cents: number, currency: 'CRC' | 'USD'): string {
    const amount = cents / 100;
    if (currency === 'USD') return `$${amount.toFixed(0)}`;
    return `₡${amount.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}