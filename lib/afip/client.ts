/**
 * AFIP Client - Facturación electrónica Argentina (STUB)
 *
 * El paquete `afip.ts@1.0.1` está deprecated y sin type declarations, así que
 * este módulo queda como stub hasta que se integre un SDK oficial soportado
 * (candidatos: SDK propio via afip.soap, afipsdk.com, o wrapper REST).
 *
 * Contrato público estable: `createAfipClient`, `issueInvoice`,
 * `getInvoiceTypeByCondition`. El resto de la app consume solo estas
 * funciones, así que reemplazar el backend es trivial.
 *
 * Comportamiento actual:
 *   - createAfipClient → retorna un objeto de configuración (sin SDK real)
 *   - issueInvoice     → retorna un CAE mock con status "mocked"
 *                        (NO emitir facturas en producción hasta integrar SDK real)
 */

export type AfipInvoiceType = 'A' | 'B' | 'C';

export type IssuerCondition =
  | 'monotributo'
  | 'responsable_inscripto'
  | 'exento';

export type RecipientCondition =
  | 'consumidor_final'
  | 'responsable_inscripto'
  | 'monotributo'
  | 'exento';

export interface AfipClientParams {
  cuit: string;
  certificate: string;
  privateKey: string;
  production?: boolean;
}

export interface AfipClient {
  cuit: string;
  production: boolean;
  certificate: string;
  privateKey: string;
}

export function createAfipClient({
  cuit,
  certificate,
  privateKey,
  production = false,
}: AfipClientParams): AfipClient {
  if (!cuit || !certificate || !privateKey) {
    throw new Error('AFIP: cuit, certificate y privateKey son obligatorios.');
  }
  return { cuit, certificate, privateKey, production };
}

/**
 * Emite una factura electrónica.
 *
 * ⚠️ STUB: retorna CAE mock. Antes de producción, integrar SDK AFIP oficial
 *     y reemplazar la implementación preservando esta misma firma.
 */
export async function issueInvoice(
  _client: AfipClient,
  params: {
    invoiceType: AfipInvoiceType;
    total: number;
    subtotal: number;
    taxAmount: number;
    recipientCuit?: string;
    recipientName?: string;
    pointOfSale?: number;
  }
): Promise<{
  cae: string;
  caeExpiry: string;
  voucherNumber: number;
  status: 'mocked' | 'approved' | 'rejected';
  rawResponse: unknown;
}> {
  const ptoVta = params.pointOfSale || 1;
  const mockVoucherNumber = Math.floor(Date.now() / 1000) % 1_000_000;
  const expiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '');

  console.warn(
    '[afip/client] issueInvoice stub: integrar SDK AFIP real antes de producción.',
    { invoiceType: params.invoiceType, total: params.total, ptoVta }
  );

  return {
    cae: `MOCK-${mockVoucherNumber}`,
    caeExpiry: expiry,
    voucherNumber: mockVoucherNumber,
    status: 'mocked',
    rawResponse: { mocked: true, params },
  };
}

/**
 * Determina el tipo de factura según condición IVA.
 */
export function getInvoiceTypeByCondition(
  issuerCondition: IssuerCondition,
  recipientCondition: RecipientCondition
): AfipInvoiceType {
  if (issuerCondition === 'monotributo') return 'C';
  if (issuerCondition === 'responsable_inscripto') {
    return recipientCondition === 'responsable_inscripto' ? 'A' : 'B';
  }
  return 'C';
}
