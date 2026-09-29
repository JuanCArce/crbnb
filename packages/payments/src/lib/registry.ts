/**
 * Registry de adapters de pago.
 *
 * Para añadir un nuevo gateway:
 *   1. Crear archivo en `adapters/<code>.adapter.ts` con clase que extiende `PaymentGatewayAdapter`
 *   2. Importar aquí y añadir al objeto `ADAPTERS`
 *   3. Crear migration SQL que añada fila a `payment_gateways` con `is_active: false`
 *   4. Admin activa desde panel (no requiere deploy)
 *
 * Importante: el código define la IMPLEMENTACIÓN; la tabla `payment_gateways`
 * controla la ACTIVACIÓN. Esto permite añadir/retirar gateways sin tocar código.
 */

import { TylopayAdapter } from '../adapters/tylopay.adapter';
import { OnvoAdapter } from '../adapters/onvo.adapter';
import { SinpeAdapter } from '../adapters/sinpe.adapter';
import { CashAdapter } from '../adapters/cash.adapter';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { PaypalAdapter } from '../adapters/paypal.adapter';
import type { GatewayCode } from './gateway-adapter';
import type { PaymentGatewayAdapter } from './gateway-adapter';

const ADAPTERS: Record<GatewayCode, PaymentGatewayAdapter> = {
  tylopay: new TylopayAdapter(),
  onvo: new OnvoAdapter(),
  sinpe: new SinpeAdapter(),
  cash: new CashAdapter(),
  stripe: new StripeAdapter(),
  paypal: new PaypalAdapter(),
};

/**
 * Obtiene el adapter por código. Lanza si no existe (no debería pasar en producción
 * porque la lista está sincronizada con la tabla payment_gateways).
 */
export function getAdapter(code: GatewayCode): PaymentGatewayAdapter {
  const adapter = ADAPTERS[code];
  if (!adapter) {
    throw new Error(`No existe adapter para gateway "${code}". ¿Actualizaste el registry?`);
  }
  return adapter;
}

/**
 * Lista todos los adapters conocidos (código + capabilities).
 * Útil para admin/debug.
 */
export function listAdapters(): ReadonlyArray<{
  code: GatewayCode;
  displayName: string;
  type: PaymentGatewayAdapter['type'];
  category: PaymentGatewayAdapter['category'];
}> {
  return Object.values(ADAPTERS).map((a) => ({
    code: a.code,
    displayName: a.displayName,
    type: a.type,
    category: a.category,
  }));
}

export function isKnownGateway(code: string): code is GatewayCode {
  return code in ADAPTERS;
}