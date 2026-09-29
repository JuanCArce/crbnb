/**
 * Interfaz común para todos los adapters de pago de CRBNB.
 *
 * Un adapter soporta uno o varios flujos:
 *   - payout_to_host:   Guest → Host (dinero va al host)
 *   - collect_for_platform: Host → CRBNB (suscripciones)
 *   - both: ambos flujos
 *
 * Añadir un nuevo gateway (PayPal, Stripe, etc.) = crear nueva clase que
 * implementa esta interfaz + registrar en `registry.ts`. La activación
 * se controla vía tabla `payment_gateways` (admin-managed).
 */

import type { Currency } from './types';

export type GatewayCode =
  | 'tylopay'
  | 'onvo'
  | 'sinpe'
  | 'cash'
  | 'stripe'
  | 'paypal'
  // Próximos a integrar:
  | 'mercadopago'
  | 'wompi'
  | 'square';

export type GatewayType = 'payout_to_host' | 'collect_for_platform' | 'both';
export type GatewayCategory = 'card' | 'bank_transfer' | 'wallet' | 'cash' | 'crypto';

export interface GatewayCapability {
  /** ¿Soporta pagos recurrentes (suscripciones)? */
  readonly subscriptions: boolean;
  /** ¿Soporta pagos únicos? */
  readonly oneTime: boolean;
  /** ¿Soporta refunds? */
  readonly refunds: boolean;
  /** ¿Tiene webhook nativo (no polling)? */
  readonly webhooks: boolean;
  /** ¿Requiere verificación de cuenta del merchant antes de pagos? */
  readonly requiresMerchantOnboarding: boolean;
}

export interface PaymentCredentials {
  /** ID del merchant/account en el gateway */
  merchantId?: string;
  /** API key pública */
  publicKey?: string;
  /** API key privada (encriptada en DB) */
  secretKey?: string;
  /** Webhook secret (para verificar firmas) */
  webhookSecret?: string;
  /** Cuenta destino para payouts (email, número de cuenta, etc.) */
  payoutDestination?: string;
  /** Cualquier config adicional específica del gateway */
  metadata?: Record<string, unknown>;
}

/**
 * Input para autorizar un pago. El caller (CRBNB backend) calcula el monto;
 * el gateway solo ejecuta la transacción.
 */
export interface AuthorizeInput {
  amountCents: number;
  currency: Currency;
  /** Identificador único de la orden (booking_id o subscription_id) — idempotencia */
  orderId: string;
  /** Detalle humano del cobro */
  description: string;
  /** Metadata adicional (booking_id, guest_email, etc.) */
  metadata?: Record<string, string>;
  /** Email del pagador (guest o host según el flujo) */
  payerEmail: string;
  /** URL de retorno post-pago */
  returnUrl: string;
  /** URL de webhook para notificaciones asíncronas */
  webhookUrl: string;
  /** Credenciales del merchant configuradas por el host */
  credentials: PaymentCredentials;
}

export interface PaymentIntent {
  /** ID del intent en el gateway */
  id: string;
  /** URL de checkout (si requiere redirección) */
  checkoutUrl?: string;
  /** Estado inmediato */
  status: 'requires_action' | 'processing' | 'succeeded' | 'failed';
  /** Datos crudos del gateway para debug */
  raw?: unknown;
}

export interface CaptureInput {
  intentId: string;
  credentials: PaymentCredentials;
}

export interface Receipt {
  intentId: string;
  status: 'succeeded' | 'failed';
  amountCents: number;
  currency: Currency;
  paidAt?: string;
  failureReason?: string;
  raw?: unknown;
}

export interface RefundInput {
  intentId: string;
  amountCents: number;
  reason?: string;
  credentials: PaymentCredentials;
}

export interface Refund {
  refundId: string;
  intentId: string;
  amountCents: number;
  status: 'succeeded' | 'pending' | 'failed';
  raw?: unknown;
}

export interface SubscriptionInput {
  planCode: string;
  customerEmail: string;
  amountCents: number;
  currency: Currency;
  returnUrl: string;
  webhookUrl: string;
  metadata?: Record<string, string>;
  credentials: PaymentCredentials;
}

export interface Subscription {
  subscriptionId: string;
  status: 'active' | 'pending' | 'failed';
  checkoutUrl?: string;
  raw?: unknown;
}

export interface WebhookEvent {
  type: 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'subscription.created' | 'subscription.cancelled';
  intentId: string;
  amountCents?: number;
  currency?: Currency;
  timestamp: string;
  raw: unknown;
}

/**
 * Adapter base para todos los gateways.
 *
 * Cualquier gateway nuevo debe implementar esta interfaz.
 * Los gateways que no soportan alguna operación (ej. SINPE no tiene webhooks)
 * deben lanzar `UnsupportedOperation` con mensaje claro.
 */
export abstract class PaymentGatewayAdapter {
  abstract readonly code: GatewayCode;
  abstract readonly displayName: string;
  abstract readonly type: GatewayType;
  abstract readonly category: GatewayCategory;
  abstract readonly capability: GatewayCapability;
  abstract readonly supportedCurrencies: ReadonlyArray<Currency>;

  /** Configuración requerida al host (campos visibles en onboarding UI) */
  abstract getRequiredConfigFields(): ReadonlyArray<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'password';
    required: boolean;
    placeholder?: string;
    helpText?: string;
  }>;

  /**
   * Autoriza un pago. Devuelve URL de checkout si requiere acción del usuario,
   * o el intent ya confirmado si es asíncrono (ej. Tylopay link de pago).
   */
  abstract authorize(input: AuthorizeInput): Promise<PaymentIntent>;

  /** Captura un intent previamente autorizado */
  abstract capture(input: CaptureInput): Promise<Receipt>;

  /** Reembolsa total o parcial */
  abstract refund(input: RefundInput): Promise<Refund>;

  /**
   * Crea una suscripción recurrente (host paga CRBNB).
   * Solo aplicable a gateways con `capability.subscriptions = true`.
   */
  abstract createSubscription(input: SubscriptionInput): Promise<Subscription>;

  /** Cancela una suscripción */
  abstract cancelSubscription(subscriptionId: string, credentials: PaymentCredentials): Promise<void>;

  /** Verifica la firma de un webhook request */
  abstract verifyWebhook(request: Request): Promise<boolean>;

  /** Parsea un webhook verificado a evento normalizado */
  abstract parseWebhook(request: Request): Promise<WebhookEvent>;

  /** Verifica que las credenciales son válidas (test call al gateway) */
  abstract testCredentials(credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }>;
}

export class UnsupportedOperation extends Error {
  constructor(gatewayCode: GatewayCode, operation: string) {
    super(`Gateway "${gatewayCode}" no soporta la operación "${operation}"`);
    this.name = 'UnsupportedOperation';
  }
}

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly gatewayCode: GatewayCode,
    public readonly httpStatus?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}