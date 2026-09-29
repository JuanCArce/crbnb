/**
 * Cash — pago en efectivo / pay-at-checkin.
 *
 * Capabilities:
 *   - payout_to_host (100% manual)
 *   - No API externa
 *   - Host marca como recibido desde dashboard
 *
 * Status: COMPLETO (lógica mínima, sin integración externa).
 */

import {
  PaymentGatewayAdapter,
  UnsupportedOperation,
  type AuthorizeInput,
  type CaptureInput,
  type GatewayCapability,
  type GatewayCategory,
  type GatewayType,
  type PaymentCredentials,
  type PaymentIntent,
  type Receipt,
  type Refund,
  type RefundInput,
  type Subscription,
  type SubscriptionInput,
  type WebhookEvent,
  type Currency,
} from '../gateway-adapter';

export class CashAdapter extends PaymentGatewayAdapter {
  readonly code = 'cash' as const;
  readonly displayName = 'Efectivo / Pago en check-in';
  readonly type: GatewayType = 'payout_to_host';
  readonly category: GatewayCategory = 'cash';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['CRC', 'USD', 'EUR'];
  readonly capability: GatewayCapability = {
    subscriptions: false,
    oneTime: true,
    refunds: false,
    webhooks: false,
    requiresMerchantOnboarding: false,
  };

  getRequiredConfigFields() {
    return []; // No requiere config
  }

  async authorize(input: AuthorizeInput): Promise<PaymentIntent> {
    // Cash no se autoriza en el gateway — solo creamos un intent "pending"
    // que el host marcará como "received" cuando cobre en persona
    return {
      id: `cash_${input.orderId}`,
      status: 'requires_action',
      raw: { instructions: 'Pagar en efectivo al host al momento del check-in.' },
    };
  }

  async capture(input: CaptureInput): Promise<Receipt> {
    // El host confirma recepción vía dashboard
    return {
      intentId: input.intentId,
      status: 'succeeded',
      amountCents: 0, // monto confirmado por separado
      currency: 'CRC',
      paidAt: new Date().toISOString(),
    };
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new UnsupportedOperation(this.code, 'refund (manual, sin API)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new UnsupportedOperation(this.code, 'createSubscription');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new UnsupportedOperation(this.code, 'cancelSubscription');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    throw new UnsupportedOperation(this.code, 'verifyWebhook');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new UnsupportedOperation(this.code, 'parseWebhook');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    return { valid: true };
  }
}