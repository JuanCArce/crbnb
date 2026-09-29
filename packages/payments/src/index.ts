/**
 * Public API de @crbnb/payments.
 */

export * from './lib/types';
export * from './lib/gateway-adapter';
export * from './lib/registry';

// Re-export adapters por si se necesitan directamente
export { TylopayAdapter } from './lib/adapters/tylopay.adapter';
export { OnvoAdapter } from './lib/adapters/onvo.adapter';
export { SinpeAdapter } from './lib/adapters/sinpe.adapter';
export { CashAdapter } from './lib/adapters/cash.adapter';
export { StripeAdapter } from './lib/adapters/stripe.adapter';
export { PaypalAdapter } from './lib/adapters/paypal.adapter';