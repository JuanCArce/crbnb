/**
 * SINPE Móvil — Costa Rica central bank instant transfer.
 *
 * Capabilities:
 *   - payout_to_host (manual — guest reporta comprobante)
 *   - bank_transfer
 *   - NO webhooks (reconciliation manual)
 *
 * Status: STUB — implementación completa en Fase 7.
 *
 * Flujo SINPE:
 *   1. Host configura número de teléfono SINPE
 *   2. Guest transfiere al número desde su banco
 *   3. Guest sube foto del comprobante a CRBNB
 *   4. Host confirma recepción desde su dashboard
 *   5. CRBNB marca booking como pagado
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

export class SinpeAdapter extends PaymentGatewayAdapter {
  readonly code = 'sinpe' as const;
  readonly displayName = 'SINPE Móvil';
  readonly type: GatewayType = 'payout_to_host';
  readonly category: GatewayCategory = 'bank_transfer';
  readonly supportedCurrencies: ReadonlyArray<Currency> = ['CRC'];
  readonly capability: GatewayCapability = {
    subscriptions: false,
    oneTime: true,
    refunds: false, // SINPE no permite reversar; se coordina manualmente
    webhooks: false,
    requiresMerchantOnboarding: false,
  };

  getRequiredConfigFields() {
    return [
      { key: 'phone', label: 'Teléfono SINPE', type: 'tel' as const, required: true, placeholder: '+506 8888 8888', helpText: 'Número registrado en SINPE Móvil' },
      { key: 'holderName', label: 'Nombre del titular', type: 'text' as const, required: true },
    ];
  }

  async authorize(_input: AuthorizeInput): Promise<PaymentIntent> {
    // SINPE es manual — devolvemos "instrucciones" al guest
    throw new Error('SinpeAdapter.authorize no implementado (Fase 7)');
  }

  async capture(_input: CaptureInput): Promise<Receipt> {
    throw new UnsupportedOperation(this.code, 'capture');
  }

  async refund(_input: RefundInput): Promise<Refund> {
    throw new UnsupportedOperation(this.code, 'refund (manual vía banco)');
  }

  async createSubscription(_input: SubscriptionInput): Promise<Subscription> {
    throw new UnsupportedOperation(this.code, 'createSubscription');
  }

  async cancelSubscription(_subscriptionId: string, _credentials: PaymentCredentials): Promise<void> {
    throw new UnsupportedOperation(this.code, 'cancelSubscription');
  }

  async verifyWebhook(_request: Request): Promise<boolean> {
    throw new UnsupportedOperation(this.code, 'verifyWebhook (no hay webhooks en SINPE)');
  }

  async parseWebhook(_request: Request): Promise<WebhookEvent> {
    throw new UnsupportedOperation(this.code, 'parseWebhook');
  }

  async testCredentials(_credentials: PaymentCredentials): Promise<{ valid: boolean; error?: string }> {
    // SINPE no tiene API — validación es solo formato del teléfono
    return { valid: true };
  }
}