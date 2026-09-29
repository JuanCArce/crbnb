/**
 * PayPal — global wallet + card payments.
 *
 * Capabilities:
 *   - both: payout_to_host + collect_for_platform
 *   - Wallet + Card
 *   - Webhooks con verificación
 *
 * Status: STUB — implementación completa en Fase 7+ cuando se active este gateway.
 */

import {
  PaymentGatewayAdapter,
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

export class PaypalAdapter extends PaymentGatewayAdapter {
  readonly code = 'paypal' as const;
  readonly displayName = 'PayPal';
  readonly type: GatewayType = 'both';
  readonly category: GatewayCategory = 'wallet';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['USD', 'EUR', 'MXN', 'ARS', 'BRL', 'CRC'];
  readonly capability: GatewayCapability = {
    subscriptions: true,
    oneTime: true,
    refunds: true,
    webhooks: true,
    requiresMerchantOnboarding: true,
  };

  getRequiredConfigFields() {
    return [
      { key: 'clientId', label: 'Client ID', type: 'text' as const, required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' as const, required: true },
      { key: 'webhookId', label: 'Webhook ID', type: 'text' as const, required: true, helpText: 'Para verificar firma de webhooks' },
      { key: 'merchantEmail', label: 'Email PayPal del merchant', type: 'email' as const, required: true, helpText: 'Cuenta que recibe los payouts' },
    ];
  }

  async authorize(_input: AuthorizeInput): Promise<PaymentIntent> {
    throw new Error('PaypalAdapter.authorize no implementado aún (Fase 7+)');
  }

  async capture(_input: CaptureInput): Promise<Receipt> {
    throw new Error('PaypalAdapter.capture no implementado aún (Fase 7+)');
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new Error('PaypalAdapter.refund no implementado aún (Fase 7+)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new Error('PaypalAdapter.createSubscription no implementado aún (Fase 7+)');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new Error('PaypalAdapter.cancelSubscription no implementado aún (Fase 7+)');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    throw new Error('PaypalAdapter.verifyWebhook no implementado aún (Fase 7+)');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new Error('PaypalAdapter.parseWebhook no implementado aún (Fase 7+)');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    throw new Error('PaypalAdapter.testCredentials no implementado aún (Fase 7+)');
  }
}