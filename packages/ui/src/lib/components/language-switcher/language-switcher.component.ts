/**
 * LanguageSwitcherComponent
 *
 * Selector dropdown para cambiar el idioma de la UI (es/en).
 * Persiste en localStorage y notifica a un signal compartido.
 *
 * Uso:
 *   <crbnb-language-switcher />
 */

import { ChangeDetectionStrategy, Component, computed, signal, inject, DOCUMENT } from '@angular/core';

export type Locale = 'es' | 'en';

const LOCALE_STORAGE_KEY = 'crbnb.locale';

@Component({
  selector: 'crbnb-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crbnb-locale" data-testid="language-switcher">
      <button
        type="button"
        class="crbnb-locale__toggle"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        (click)="toggle()"
      >
        <span class="crbnb-locale__flag" aria-hidden="true">{{ flag() }}</span>
        <span class="crbnb-locale__code">{{ locale().toUpperCase() }}</span>
        <span class="crbnb-locale__caret" aria-hidden="true">▾</span>
      </button>

      @if (open()) {
        <ul class="crbnb-locale__menu" role="listbox" aria-label="Idioma">
          @for (opt of options; track opt.code) {
            <li>
              <button
                type="button"
                role="option"
                [attr.aria-selected]="locale() === opt.code"
                [class.is-active]="locale() === opt.code"
                (click)="select(opt.code)"
              >
                <span aria-hidden="true">{{ opt.flag }}</span>
                <span>{{ opt.label }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  private readonly doc = inject(DOCUMENT);

  readonly options: ReadonlyArray<{ code: Locale; label: string; flag: string }> = [
    { code: 'es', label: 'Español', flag: '🇨🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  readonly locale = signal<Locale>(this.detectInitialLocale());
  readonly open = signal<boolean>(false);
  readonly flag = computed(() => this.options.find((o) => o.code === this.locale())?.flag ?? '🌐');

  toggle(): void {
    this.open.update((v) => !v);
  }

  select(code: Locale): void {
    this.locale.set(code);
    this.open.set(false);
    try {
      this.doc.defaultView?.localStorage?.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      // localStorage no disponible (modo privado SSR), ignorar
    }
    // Disparar evento custom para que i18n service reaccione
    this.doc.defaultView?.dispatchEvent(
      new CustomEvent<Locale>('crbnb:locale-change', { detail: code })
    );
  }

  private detectInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'es';
    try {
      const stored = window.localStorage?.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === 'es' || stored === 'en') return stored;
      const nav = window.navigator?.language?.toLowerCase() ?? '';
      if (nav.startsWith('en')) return 'en';
    } catch {
      // ignore
    }
    return 'es';
  }
}