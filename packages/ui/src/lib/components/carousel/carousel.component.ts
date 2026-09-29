/**
 * CarouselComponent — Reusable horizontal scroll carousel with navigation.
 *
 * Features:
 *   - Horizontal scroll con prev/next arrows
 *   - Snap scrolling
 *   - Cards con aspect ratio fijo
 *   - Responsive: oculta arrows en mobile, swipe nativo
 *
 * Uso:
 *   <crbnb-carousel>
 *     @for (item of items; track item.id) {
 *       <crbnb-carousel-item>
 *         <img [src]="item.image" [alt]="item.title" />
 *         <h3>{{ item.title }}</h3>
 *       </crbnb-carousel-item>
 *     }
 *   </crbnb-carousel>
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
  input,
  AfterViewInit,
  effect,
  inject,
} from '@angular/core';

@Component({
  selector: 'crbnb-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crbnb-carousel">
      @if (canScrollLeft()) {
        <button
          type="button"
          class="crbnb-carousel__nav crbnb-carousel__nav--prev"
          (click)="scrollBy(-1)"
          aria-label="Anterior"
        >
          <span aria-hidden="true">‹</span>
        </button>
      }

      <div
        #scroller
        class="crbnb-carousel__scroller"
        (scroll)="onScroll()"
      >
        <ng-content />
      </div>

      @if (canScrollRight()) {
        <button
          type="button"
          class="crbnb-carousel__nav crbnb-carousel__nav--next"
          (click)="scrollBy(1)"
          aria-label="Siguiente"
        >
          <span aria-hidden="true">›</span>
        </button>
      }
    </div>
  `,
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements AfterViewInit {
  /** Espaciado entre items (en px) */
  readonly gap = input<number>(16);
  /** Ancho mínimo de cada item (en px) */
  readonly itemMinWidth = input<number>(240);

  @ViewChild('scroller', { static: true })
  scrollerRef!: ElementRef<HTMLDivElement>;

  readonly canScrollLeft = signal<boolean>(false);
  readonly canScrollRight = signal<boolean>(true);

  ngAfterViewInit(): void {
    // Esperar un frame para que los hijos se hayan renderizado
    requestAnimationFrame(() => this.updateScrollState());
  }

  onScroll(): void {
    this.updateScrollState();
  }

  scrollBy(direction: -1 | 1): void {
    const scroller = this.scrollerRef.nativeElement;
    const itemWidth = scroller.clientWidth * 0.75; // Avanza ~75% del ancho visible
    scroller.scrollBy({
      left: itemWidth * direction,
      behavior: 'smooth',
    });
  }

  private updateScrollState(): void {
    const scroller = this.scrollerRef.nativeElement;
    this.canScrollLeft.set(scroller.scrollLeft > 4);
    this.canScrollRight.set(
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4
    );
  }
}