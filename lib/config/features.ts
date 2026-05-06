function boolEnv(name: string, defaultValue = false): boolean {
  const value = process.env[name];
  if (value == null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export const features = {
  admin: boolEnv('NEXT_PUBLIC_ENABLE_ADMIN', true),
  aiAnalyst: boolEnv('NEXT_PUBLIC_ENABLE_AI_ANALYST', true),
  kyc: boolEnv('NEXT_PUBLIC_ENABLE_KYC', true),
  fiscalIssuing: boolEnv('ENABLE_FISCAL_ISSUING', false),
  crypto: boolEnv('NEXT_PUBLIC_ENABLE_CRYPTO', false),
  secondaryMarket: boolEnv('NEXT_PUBLIC_ENABLE_SECONDARY_MARKET', false),
  bankTransferDeposits: boolEnv('ENABLE_BANK_TRANSFER_DEPOSITS', true),
  mercadoPagoDeposits: boolEnv('ENABLE_MERCADOPAGO_DEPOSITS', true),
} as const;

export type FeatureName = keyof typeof features;

export function requireFeature(name: FeatureName) {
  if (!features[name]) {
    const err = new Error(`Feature disabled: ${name}`);
    err.name = 'FeatureDisabledError';
    throw err;
  }
}
