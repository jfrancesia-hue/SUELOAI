// ============================================
// Suelo v2 — Extended Types
// ============================================

// Re-exportar tipos base
export * from './base';

// ============================================
// WALLET
// ============================================
export type WalletMovementType =
  | 'deposit' | 'withdrawal' | 'investment' | 'return'
  | 'fee' | 'transfer_in' | 'transfer_out' | 'refund';

export type WalletMovementStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentProvider = 'mercadopago' | 'stripe' | 'manual' | 'internal';

export interface Wallet {
  id: string;
  user_id: string;
  balance_available: number;
  balance_locked: number;
  balance_returns: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletMovement {
  id: string;
  wallet_id: string;
  user_id: string;
  type: WalletMovementType;
  status: WalletMovementStatus;
  amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  provider: PaymentProvider | null;
  provider_reference: string | null;
  provider_metadata: Record<string, unknown> | null;
  description: string | null;
  reference_code: string;
  hash: string | null;
  related_investment_id: string | null;
  related_project_id: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  type: string;
  last_four: string | null;
  brand: string | null;
  is_default: boolean;
  provider_token: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// KYC
// ============================================
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';

export interface KycVerification {
  id: string;
  user_id: string;
  status: KycStatus;
  provider: string | null;
  provider_verification_id: string | null;
  document_type: string | null;
  document_number: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  verification_data: Record<string, unknown> | null;
  rejection_reason: string | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// CRM
// ============================================
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'interested' | 'invested' | 'lost';

export interface Lead {
  id: string;
  developer_id: string;
  project_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  tags: string[];
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  converted_user_id: string | null;
  converted_at: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmActivity {
  id: string;
  developer_id: string;
  lead_id: string | null;
  contact_user_id: string | null;
  type: string;
  subject: string;
  content: string | null;
  channel: string | null;
  completed: boolean;
  scheduled_for: string | null;
  created_at: string;
}

export interface CrmCampaign {
  id: string;
  developer_id: string;
  name: string;
  subject: string | null;
  body: string;
  channel: string;
  segment_filter: Record<string, unknown> | null;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

// ============================================
// INVOICES
// ============================================
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
export type InvoiceType = 'A' | 'B' | 'C' | 'E';
export type AfipStatus = 'not_sent' | 'pending' | 'approved' | 'rejected';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
}

export interface Invoice {
  id: string;
  issuer_id: string;
  recipient_id: string | null;
  investment_id: string | null;
  project_id: string | null;
  invoice_number: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  recipient_data: Record<string, unknown> | null;
  afip_status: AfipStatus;
  afip_cae: string | null;
  afip_cae_expiry: string | null;
  afip_response: Record<string, unknown> | null;
  pdf_url: string | null;
  hash: string | null;
  ai_classification: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AfipCredentials {
  id: string;
  user_id: string;
  cuit: string;
  business_name: string | null;
  iva_condition: string | null;
  gross_income_number: string | null;
  certificate_url: string | null;
  private_key_url: string | null;
  is_production: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export interface ExpenseReceipt {
  id: string;
  user_id: string;
  project_id: string | null;
  file_url: string | null;
  extracted_data: Record<string, unknown> | null;
  ai_category: string | null;
  ai_confidence: number | null;
  amount: number | null;
  tax_amount: number | null;
  supplier_name: string | null;
  supplier_cuit: string | null;
  issue_date: string | null;
  processed: boolean;
  created_at: string;
}

// ============================================
// SCORING
// ============================================
export type ScoringRating = 'A_plus' | 'A' | 'B' | 'C' | 'D';

export interface ProjectScore {
  id: string;
  project_id: string;
  rating: ScoringRating;
  overall_score: number;
  location_score: number | null;
  developer_score: number | null;
  financial_score: number | null;
  documentation_score: number | null;
  market_score: number | null;
  risk_factors: Record<string, unknown> | null;
  opportunities: Record<string, unknown> | null;
  ai_analysis: string | null;
  ai_model: string | null;
  computed_at: string;
  created_at: string;
}

// ============================================
// SECONDARY MARKET
// ============================================
export type SecondaryOrderType = 'buy' | 'sell';
export type SecondaryOrderStatus = 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';

export interface SecondaryOrder {
  id: string;
  user_id: string;
  investment_id: string | null;
  project_id: string;
  type: SecondaryOrderType;
  status: SecondaryOrderStatus;
  tokens_total: number;
  tokens_remaining: number;
  price_per_token: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecondaryTrade {
  id: string;
  sell_order_id: string;
  buy_order_id: string | null;
  seller_id: string;
  buyer_id: string;
  project_id: string;
  tokens_traded: number;
  price_per_token: number;
  total_amount: number;
  fee: number;
  hash: string | null;
  created_at: string;
}

// ============================================
// NOTIFICATIONS
// ============================================
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// REFERRALS
// ============================================
export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  code: string;
  first_investment_id: string | null;
  commission_percent: number;
  commission_amount: number;
  commission_paid: boolean;
  created_at: string;
}
