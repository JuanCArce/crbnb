/**
 * Tylopay — Latam card payments.
 *
 * Capabilities:
 *   - payout_to_host (Guest → Host directo)
 *   - Card payments
 *   - Webhooks nativos
 *
 * Documentación: https://docs.tylopay.com/
 *
 * Status: STUB — implementación completa en Fase 7 (Payments).
 */

import {
  GatewayError,
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

export class TylopayAdapter extends PaymentGatewayAdapter {
  readonly code = 'tylopay' as const;
  readonly displayName = 'Tylopay';
  readonly type: GatewayType = 'payout_to_host';
  readonly category: GatewayCategory = 'card';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['CRC', 'USD'];
  readonly capability: GatewayCapability = {
    subscriptions: false,
    oneTime: true,
    refunds: true,
    webhooks: true,
    requiresMerchantOnboarding: true,
  };

  getRequiredConfigFields() {
    return [
      { key: 'merchantId', label: 'Merchant ID', type: 'text' as const, required: true, placeholder: 'merchant_xxx' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' as const, required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' as const, required: true },
    ];
  }

  async authorize(_input: AuthorizeInput): Promise<PaymentIntent> {
    // TODO Fase 7
    throw new Error('TylopayAdapter.authorize no implementado aún (Fase 7)');
  }

  async capture(_input: CaptureInput): Promise<Receipt> {
    throw new UnsupportedOperation(this.code, 'capture');
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new Error('TylopayAdapter.refund no implementado aún (Fase 7)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new UnsupportedOperation(this.code, 'createSubscription');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new UnsupportedOperation(this.code, 'cancelSubscription');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    throw new Error('TylopayAdapter.verifyWebhook no implementado aún (Fase 7)');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new Error('TylopayAdapter.parseWebhook no implementado aún (Fase 7)');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    throw new Error('TylopayAdapter.testCredentials no implementado aún (Fase 7)');
  }
}