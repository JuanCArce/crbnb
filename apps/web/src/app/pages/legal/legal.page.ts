/**
 * Componente genérico para páginas legales (privacy, terms, cookies).
 *
 * Lee el contenido desde un signal estático según la ruta.
 *
 * TODO Fase 12: Reemplazar con copy revisado legalmente. Esta es plantilla MVP.
 */

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';

interface LegalDoc {
  slug: 'privacy' | 'terms' | 'cookies';
  title: string;
  updated: string;
  sections: Array<{ heading: string; body: string }>;
}

const DOCS: Record<LegalDoc['slug'], LegalDoc> = {
  privacy: {
    slug: 'privacy',
    title: 'Política de Privacidad',
    updated: '2026-09-29',
    sections: [
      {
        heading: '1. Datos que recopilamos',
        body: 'Recopilamos la información que nos proporcionas directamente al registrarte (nombre, correo, teléfono) y datos generados al usar la plataforma (reservas, mensajes, actividad).',
      },
      {
        heading: '2. Cómo usamos tus datos',
        body: 'Usamos tus datos para operar la plataforma: procesar reservas, facilitar la comunicación entre hosts y huéspedes, mejorar el servicio y cumplir obligaciones legales.',
      },
      {
        heading: '3. Base legal (Ley 8968 Costa Rica)',
        body: 'Tratamos tus datos con tu consentimiento explícito al registrarte, para la ejecución del servicio contratado y para cumplir obligaciones legales. Tienes derecho a acceder, rectificar, suprimir y portar tus datos.',
      },
      {
        heading: '4. Transferencias internacionales',
        body: 'Algunos de nuestros proveedores (Supabase, Cloudflare, Resend) almacenan datos en servidores fuera de Costa Rica. Publicamos un registro de actividades de tratamiento (RoPA) detallado.',
      },
      {
        heading: '5. Cookies',
        body: 'Usamos cookies estrictamente necesarias para autenticación y sesión. Las cookies analíticas solo se activan con tu consentimiento explícito.',
      },
      {
        heading: '6. Tus derechos',
        body: 'Puedes solicitar acceso, rectificación, supresión u oposición al tratamiento de tus datos escribiendo a privacidad@crbnb.com. Responderemos en un plazo máximo de 10 días hábiles.',
      },
      {
        heading: '7. Retención de datos',
        body: 'Conservamos tus datos mientras tu cuenta esté activa y durante 5 años después para cumplir obligaciones contables y fiscales.',
      },
      {
        heading: '8. Contacto DPO',
        body: 'Para temas de protección de datos: dpo@crbnb.com.',
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Términos del Servicio',
    updated: '2026-09-29',
    sections: [
      {
        heading: '1. Aceptación',
        body: 'Al usar CRBNB aceptas estos términos. Si no estás de acuerdo, no noas la plataforma.',
      },
      {
        heading: '2. El servicio',
        body: 'CRBNB es una plataforma que conecta a hospedajes (hosts) con huéspedes. No somos parte del contrato entre host y huésped; somos un intermediario tecnológico.',
      },
      {
        heading: '3. Comisiones',
        body: 'CRBNB cobra una comisión del 3% sobre cada reserva completada. Los pagos van directamente al host mediante los medios que el host haya configurado.',
      },
      {
        heading: '4. Responsabilidad del host',
        body: 'El host es responsable de la veracidad de su anuncio, del estado del hospedaje, del cumplimiento de regulations locales y de sus obligaciones fiscales.',
      },
      {
        heading: '5. Responsabilidad del huésped',
        body: 'El huésped es responsable de cualquier daño causado al hospedaje y de cumplir las reglas de la casa.',
      },
      {
        heading: '6. Cancelaciones y reembols',
        body: 'Las políticas de cancelación las define cada host. Las disputas se mediarán según el caso.',
      },
      {
        heading: '7. Suspensión',
        body: 'Podemos suspender cuentas que violen estos términos, cometan fraude o afecten negativamente a la comunidad.',
      },
      {
        heading: '8. Ley aplicable',
        body: 'Estos términos se rigen por las leyes de la República de Costa Rica. Cualquier disputa se resolverá en los tribunales de San José.',
      },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Política de Cookies',
    updated: '2026-09-29',
    sections: [
      {
        heading: '¿Qué son las cookies?',
        body: 'Las cookies son pequeños archivos que un sitio web guarda en tu navegador para recordar información entre visitas.',
      },
      {
        heading: 'Cookies que usamos',
        body: 'Cookies estrictamente necesarias: autenticación (sb-*-auth-token), sesión, preferencias de idioma. Sin ellas la plataforma no funciona.',
      },
      {
        heading: 'Cookies analíticas',
        body: 'Solo se activan con tu consentimiento. Usamos métricas agregadas y anónimas para entender cómo se usa la plataforma y mejorarla.',
      },
      {
        heading: 'Gestionar cookies',
        body: 'Puedes borrar o bloquear cookies en cualquier momento desde tu navegador. Algunas funciones podrían dejar de funcionar.',
      },
    ],
  },
};

@Component({
  selector: 'crbnb-legal-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="crbnb-legal">
      <header>
        <p class="crbnb-legal__crumb">
          <a routerLink="/">Inicio</a> ·
          <a routerLink="/legal/privacy">Legal</a>
        </p>
        <h1>{{ doc().title }}</h1>
        <p class="crbnb-legal__updated">Última actualización: {{ doc().updated }}</p>
      </header>

      @for (section of doc().sections; track section.heading) {
        <section>
          <h2>{{ section.heading }}</h2>
          <p>{{ section.body }}</p>
        </section>
      }

      <footer>
        <p><a routerLink="/">← Volver al inicio</a></p>
      </footer>
    </article>
  `,
  styles: `
    :host { display: block; }
    .crbnb-legal {
      max-width: 48rem;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
      color: var(--crbnb-fg);

      &__crumb { font-size: 0.875rem; color: var(--crbnb-fg-muted); margin-bottom: 1rem; }
      &__crumb a { color: var(--crbnb-fg-muted); text-decoration: none; }
      &__crumb a:hover { text-decoration: underline; }
      &__updated { color: var(--crbnb-fg-faint); font-size: 0.875rem; margin-bottom: 2.5rem; }

      h1 { font-size: 2rem; margin-bottom: 0.5rem; }
      h2 { font-size: 1.25rem; margin: 2rem 0 0.5rem; }
      p { color: var(--crbnb-fg-muted); line-height: 1.7; }

      section { padding-bottom: 0.5rem; }

      footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--crbnb-border); }
    }
  `,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly url = toSignal(this.route.url, { initialValue: [] });

  readonly doc = computed<LegalDoc>(() => {
    const segments = this.url().map((s) => s.path);
    const slug = (segments[0] ?? 'privacy') as LegalDoc['slug'];
    return DOCS[slug] ?? DOCS.privacy;
  });
}