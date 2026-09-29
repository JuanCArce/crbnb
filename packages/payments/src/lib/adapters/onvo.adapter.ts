/**
 * Onvo — Latam payment links.
 *
 * Capabilities:
 *   - payout_to_host (link de pago → host recibe directo)
 *   - Card + wallets
 *   - Webhooks nativos
 *
 * Documentación: https://docs.onvo.com/
 *
 * Status: STUB — implementación completa en Fase 7.
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

export class OnvoAdapter extends PaymentGatewayAdapter {
  readonly code = 'onvo' as const;
  readonly displayName = 'Onvo';
  readonly type: GatewayType = 'payout_to_host';
  readonly category: GatewayCategory = 'card';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['CRC', 'USD', 'EUR'];
  readonly capability: GatewayCapability = {
    subscriptions: false,
    oneTime: true,
    refunds: true,
    webhooks: true,
    requiresMerchantOnboarding: true,
  };

  getRequiredConfigFields() {
    return [
      { key: 'merchantId', label: 'Merchant ID', type: 'text' as const, required: true },
      { key: 'secretKey', label: 'API Key', type: 'password' as const, required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' as const, required: true },
    ];
  }

  async authorize(_input: AuthorizeInput): Promise<PaymentIntent> {
    throw new Error('OnvoAdapter.authorize no implementado aún (Fase 7)');
  }

  async capture(_input: CaptureInput): Promise<Receipt> {
    throw new UnsupportedOperation(this.code, 'capture');
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new Error('OnvoAdapter.refund no implementado aún (Fase 7)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new UnsupportedOperation(this.code, 'createSubscription');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new UnsupportedOperation(this.code, 'cancelSubscription');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    throw new Error('OnvoAdapter.verifyWebhook no implementado aún (Fase 7)');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new Error('OnvoAdapter.parseWebhook no implementado aún (Fase 7)');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    throw new Error('OnvoAdapter.testCredentials no implementado aún (Fase 7)');
  }
}