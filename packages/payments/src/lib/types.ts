/**
 * Tipos compartidos del módulo de pagos.
 */

export type Currency = 'CRC' | 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN' | 'BRL';

export const SUPPORTED_CURRENCIES: ReadonlyArray<Currency> = [
  'CRC', 'USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL',
];

/** Tasas de cambio aproximadas desde CRC (renovar vía API de tipo de cambio) */
export const CRC_TO_OTHER: Record<Currency, number> = {
  CRC: 1,
  USD: 0.0019,   // 1 CRC = 0.0019 USD (1 USD ≈ 525 CRC)
  EUR: 0.0017,
  MXN: 0.034,
  COP: 7.6,
  ARS: 1.7,
  CLP: 1.7,
  PEN: 0.007,
  BRL: 0.0095,
};

/** Convierte un monto entre monedas */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Partial<Record<Currency, number>> = {}
): number {
  if (from === to) return amount;
  const effectiveRates = { ...CRC_TO_OTHER, ...rates };
  const inCRC = from === 'CRC' ? amount : amount / effectiveRates[from];
  return to === 'CRC' ? inCRC : inCRC * effectiveRates[to];
}