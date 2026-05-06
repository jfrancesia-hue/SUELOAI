import type { SupabaseClient } from '@supabase/supabase-js';
import { generateHash } from '@/utils/hash';

type WalletRow = {
  id: string;
  user_id: string;
  balance_available: number | string;
  balance_locked: number | string;
  balance_returns: number | string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function ensureWallet(admin: SupabaseClient, userId: string): Promise<WalletRow> {
  const { data: existing, error: existingError } = await admin
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as WalletRow;

  const { data: created, error: createError } = await admin
    .from('wallets')
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (createError) throw createError;
  return created as WalletRow;
}

export function normalizeAmount(value: unknown): number {
  const amount = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export async function buildMovementHash(params: Record<string, unknown>) {
  return generateHash({
    ...params,
    generated_at: new Date().toISOString(),
  });
}

export function walletNumber(value: number | string | null | undefined): number {
  return Number(value || 0);
}
