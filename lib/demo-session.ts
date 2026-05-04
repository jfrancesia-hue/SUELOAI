import type { Profile, Wallet, WalletMovement } from '@/types';

const truthyValues = new Set(['1', 'true', 'yes', 'on']);

export function isDemoModeEnabled() {
  const explicit = process.env.NEXT_PUBLIC_DEMO_MODE ?? process.env.DEMO_MODE;
  if (explicit != null) return truthyValues.has(explicit.trim().toLowerCase());
  return process.env.NODE_ENV !== 'production';
}

export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'SueloDemo123!';
export const DEMO_PASSWORDS = [DEMO_PASSWORD];

const demoEmailAliases: Record<string, 'investor' | 'developer'> = {
  'inversor@demo.suelo.ai': 'investor',
  'inversor@suelo.ai': 'investor',
  'demo@suelo.ai': 'investor',
  'investor@suelo.ai': 'investor',
  'jfrancesia@gmail.com': 'investor',
  'developer@demo.suelo.ai': 'developer',
  'developer@suelo.ai': 'developer',
  'desarrollador@suelo.ai': 'developer',
};

export const demoProfiles: Record<'investor' | 'developer', Profile> = {
  investor: {
    id: '00000000-0000-4000-8000-000000000101',
    email: 'jfrancesia@gmail.com',
    full_name: 'Jorge Francesia',
    role: 'investor',
    phone: '+595 981 000 101',
    dni: 'DEMO-INV',
    company_name: null,
    avatar_url: null,
    kyc_verified: true,
    total_invested: 2450,
    total_returns: 184,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  developer: {
    id: '00000000-0000-4000-8000-000000000202',
    email: 'developer@demo.suelo.ai',
    full_name: 'Developer Demo Suelo',
    role: 'developer',
    phone: '+595 981 000 202',
    dni: 'DEMO-DEV',
    company_name: 'Nativos Real Estate Lab',
    avatar_url: null,
    kyc_verified: true,
    total_invested: 0,
    total_returns: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function getDemoRoleFromEmail(email: string): 'investor' | 'developer' | null {
  if (!isDemoModeEnabled()) return null;
  const normalized = email.trim().toLowerCase();
  return demoEmailAliases[normalized] || null;
}

export function isDemoPassword(password: string) {
  return isDemoModeEnabled() && DEMO_PASSWORDS.includes(password.trim());
}

export function normalizeDemoRole(value: string | undefined | null): 'investor' | 'developer' | null {
  if (!isDemoModeEnabled()) return null;
  return value === 'investor' || value === 'developer' ? value : null;
}

export function demoWallet(role: 'investor' | 'developer', balance = role === 'investor' ? 10000 : 2500): Wallet {
  return {
    id: role === 'investor' ? 'demo-wallet-investor' : 'demo-wallet-developer',
    user_id: demoProfiles[role].id,
    balance_available: balance,
    balance_locked: role === 'investor' ? 2450 : 0,
    balance_returns: role === 'investor' ? 184 : 0,
    currency: 'USD',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function demoMovements(role: 'investor' | 'developer', balance: number): WalletMovement[] {
  const userId = demoProfiles[role].id;
  const walletId = role === 'investor' ? 'demo-wallet-investor' : 'demo-wallet-developer';

  return [
    {
      id: 'demo-movement-current',
      wallet_id: walletId,
      user_id: userId,
      type: 'deposit',
      status: 'completed',
      amount: balance,
      balance_before: 0,
      balance_after: balance,
      currency: 'USD',
      provider: 'manual',
      provider_reference: 'DEMO-BALANCE',
      provider_metadata: { mode: 'demo' },
      description: 'Saldo demo disponible para probar Suelo',
      reference_code: 'MV-DEMO-BALANCE',
      hash: null,
      related_investment_id: null,
      related_project_id: null,
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    },
    {
      id: 'demo-movement-investment',
      wallet_id: walletId,
      user_id: userId,
      type: 'investment',
      status: 'completed',
      amount: 500,
      balance_before: balance + 500,
      balance_after: balance,
      currency: 'USD',
      provider: 'internal',
      provider_reference: 'INV-DEMO-001',
      provider_metadata: { project_title: 'Torre Asuncion Eje', mode: 'demo' },
      description: 'Inversion demo en Torre Asuncion Eje',
      reference_code: 'MV-DEMO-INVEST',
      hash: 'demo-hash-wallet-investment',
      related_investment_id: 'demo-investment-001',
      related_project_id: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      processed_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}
