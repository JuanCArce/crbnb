/**
 * Stripe — global card payments + subscriptions.
 *
 * Capabilities:
 *   - both: payout_to_host + collect_for_platform (subscriptions)
 *   - Card payments
 *   - Webhooks nativos con firma verificable
 *
 * Status: STUB — implementación completa en Fase 7+ cuando se active este gateway.
 *
 * Para activarlo: actualizar `is_active: true` en la fila `payment_gateways` desde admin.
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

export class StripeAdapter extends PaymentGatewayAdapter {
  readonly code = 'stripe' as const;
  readonly displayName = 'Stripe';
  readonly type: GatewayType = 'both';
  readonly category: GatewayCategory = 'card';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['USD', 'EUR', 'CRC', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL'];
  readonly capability: GatewayCapability = {
    subscriptions: true,
    oneTime: true,
    refunds: true,
    webhooks: true,
    requiresMerchantOnboarding: true,
  };

  getRequiredConfigFields() {
    return [
      { key: 'secretKey', label: 'Secret Key', type: 'password' as const, required: true, placeholder: 'sk_live_... or sk_test_...' },
      { key: 'publishableKey', label: 'Publishable Key', type: 'text' as const, required: true, placeholder: 'pk_live_...' },
      { key: 'webhookSecret', label: 'Webhook Signing Secret', type: 'password' as const, required: true, placeholder: 'whsec_...' },
      { key: 'connectAccountId', label: 'Connect Account ID (para Connect)', type: 'text' as const, required: false, helpText: 'Solo si usas Stripe Connect para payouts a hosts' },
    ];
  }

  async authorize(_input: AuthorizeInput): Promise<PaymentIntent> {
    // TODO Fase 7+
    // const stripe = new Stripe(input.credentials.secretKey!);
    // return stripe.paymentIntents.create({
    //   amount: input.amountCents,
    //   currency: input.currency.toLowerCase(),
    //   automatic_payment_methods: { enabled: true },
    //   metadata: input.metadata,
    // });
    throw new Error('StripeAdapter.authorize no implementado aún (Fase 7+)');
  }

  async capture(_input: CaptureInput): Promise<Receipt> {
    throw new Error('StripeAdapter.capture no implementado aún (Fase 7+)');
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new Error('StripeAdapter.refund no implementado aún (Fase 7+)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new Error('StripeAdapter.createSubscription no implementado aún (Fase 7+)');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new Error('StripeAdapter.cancelSubscription no implementado aún (Fase 7+)');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    // Stripe usa stripe.webhooks.constructEvent con signing secret
    throw new Error('StripeAdapter.verifyWebhook no implementado aún (Fase 7+)');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new Error('StripeAdapter.parseWebhook no implementado aún (Fase 7+)');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    // const stripe = new Stripe(credentials.secretKey!);
    // await stripe.balance.retrieve();
    throw new Error('StripeAdapter.testCredentials no implementado aún (Fase 7+)');
  }
}