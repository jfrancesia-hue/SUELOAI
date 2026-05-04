import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);

/**
 * Crea una preferencia de pago para cargar saldo en wallet
 */
export async function createDepositPreference(params: {
  userId: string;
  amount: number;
  email: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const preference = await mpPreference.create({
    body: {
      items: [
        {
          id: `deposit-${params.userId}-${Date.now()}`,
          title: 'Carga de saldo Suelo',
          quantity: 1,
          unit_price: params.amount,
          currency_id: 'ARS',
        },
      ],
      payer: { email: params.email },
      back_urls: {
        success: `${appUrl}/wallet?status=success`,
        failure: `${appUrl}/wallet?status=failure`,
        pending: `${appUrl}/wallet?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/wallet/webhook`,
      external_reference: params.userId,
      metadata: {
        user_id: params.userId,
        type: 'wallet_deposit',
      },
    },
  });

  return {
    preference_id: preference.id,
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  };
}

/**
 * Verifica el estado de un pago
 */
export async function getPaymentStatus(paymentId: string) {
  const payment = await mpPayment.get({ id: paymentId });
  return {
    id: payment.id,
    status: payment.status,
    status_detail: payment.status_detail,
    amount: payment.transaction_amount,
    external_reference: payment.external_reference,
    date_approved: payment.date_approved,
    metadata: payment.metadata,
    payer_email: payment.payer?.email,
  };
}
