-- ============================================
-- Suelo v2 - Extensions Migration (antes PropChain)
-- Wallet + CRM + Invoicing + Scoring + Secondary Market
-- ============================================

-- ============================================
-- NUEVOS ENUMS
-- ============================================
CREATE TYPE wallet_movement_type AS ENUM (
  'deposit', 'withdrawal', 'investment', 'return', 'fee', 'transfer_in', 'transfer_out', 'refund'
);
CREATE TYPE wallet_movement_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_provider AS ENUM ('mercadopago', 'stripe', 'manual', 'internal');
CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected', 'expired');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'interested', 'invested', 'lost');
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'cancelled', 'overdue');
CREATE TYPE invoice_type AS ENUM ('A', 'B', 'C', 'E');
CREATE TYPE afip_status AS ENUM ('not_sent', 'pending', 'approved', 'rejected');
CREATE TYPE scoring_rating AS ENUM ('A_plus', 'A', 'B', 'C', 'D');
CREATE TYPE secondary_order_type AS ENUM ('buy', 'sell');
CREATE TYPE secondary_order_status AS ENUM ('open', 'partial', 'filled', 'cancelled', 'expired');

-- ============================================
-- 1. BILLETERA VIRTUAL (WALLET)
-- ============================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance_available NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance_locked NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance_returns NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type wallet_movement_type NOT NULL,
  status wallet_movement_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(15, 2) NOT NULL,
  balance_before NUMERIC(15, 2) NOT NULL,
  balance_after NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider payment_provider,
  provider_reference TEXT,
  provider_metadata JSONB,
  description TEXT,
  reference_code TEXT UNIQUE DEFAULT ('MV-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 10))),
  hash TEXT,
  related_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  type TEXT NOT NULL,
  last_four TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  provider_token TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. KYC (Know Your Customer)
-- ============================================
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  status kyc_status NOT NULL DEFAULT 'not_started',
  provider TEXT,
  provider_verification_id TEXT,
  document_type TEXT,
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  verification_data JSONB,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. CRM — LEADS, CONTACTS, ACTIVITIES
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  source TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  budget_min NUMERIC(15, 2),
  budget_max NUMERIC(15, 2),
  notes TEXT,
  converted_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  channel TEXT,
  completed BOOLEAN DEFAULT TRUE,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  channel TEXT NOT NULL,
  segment_filter JSONB,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. FACTURACIÓN (Invoices + AFIP)
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issuer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_type invoice_type NOT NULL DEFAULT 'B',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_data JSONB,
  afip_status afip_status DEFAULT 'not_sent',
  afip_cae TEXT,
  afip_cae_expiry DATE,
  afip_response JSONB,
  pdf_url TEXT,
  hash TEXT,
  ai_classification JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE afip_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  cuit TEXT NOT NULL,
  business_name TEXT,
  iva_condition TEXT,
  gross_income_number TEXT,
  certificate_url TEXT,
  private_key_url TEXT,
  is_production BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expense_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  file_url TEXT,
  extracted_data JSONB,
  ai_category TEXT,
  ai_confidence NUMERIC(3, 2),
  amount NUMERIC(15, 2),
  tax_amount NUMERIC(15, 2),
  supplier_name TEXT,
  supplier_cuit TEXT,
  issue_date DATE,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. PROJECT SCORING (IA-based)
-- ============================================
CREATE TABLE project_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rating scoring_rating NOT NULL,
  overall_score NUMERIC(5, 2) NOT NULL,
  location_score NUMERIC(5, 2),
  developer_score NUMERIC(5, 2),
  financial_score NUMERIC(5, 2),
  documentation_score NUMERIC(5, 2),
  market_score NUMERIC(5, 2),
  risk_factors JSONB,
  opportunities JSONB,
  ai_analysis TEXT,
  ai_model TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. MERCADO SECUNDARIO
-- ============================================
CREATE TABLE secondary_market_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type secondary_order_type NOT NULL,
  status secondary_order_status NOT NULL DEFAULT 'open',
  tokens_total INTEGER NOT NULL,
  tokens_remaining INTEGER NOT NULL,
  price_per_token NUMERIC(15, 2) NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE secondary_market_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sell_order_id UUID NOT NULL REFERENCES secondary_market_orders(id),
  buy_order_id UUID REFERENCES secondary_market_orders(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  tokens_traded INTEGER NOT NULL,
  price_per_token NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2) DEFAULT 0,
  hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. REFERRAL PROGRAM
-- ============================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  first_investment_id UUID REFERENCES investments(id),
  commission_percent NUMERIC(5, 2) DEFAULT 2.00,
  commission_amount NUMERIC(15, 2) DEFAULT 0,
  commission_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. AUDIT LOGS (inmutable)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXTENSIÓN DE PROJECTS: campos para scoring + imágenes
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS construction_start DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS construction_end DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS square_meters INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS unit_count INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- ============================================
-- EXTENSIÓN DE PROFILES: referral + scoring
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'not_started';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS investor_level TEXT DEFAULT 'bronze';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS risk_profile TEXT;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallet_movements_wallet ON wallet_movements(wallet_id);
CREATE INDEX idx_wallet_movements_user ON wallet_movements(user_id);
CREATE INDEX idx_wallet_movements_status ON wallet_movements(status);
CREATE INDEX idx_leads_developer ON leads(developer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_activities_developer ON crm_activities(developer_id);
CREATE INDEX idx_activities_lead ON crm_activities(lead_id);
CREATE INDEX idx_invoices_issuer ON invoices(issuer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_afip_status ON invoices(afip_status);
CREATE INDEX idx_scores_project ON project_scores(project_id);
CREATE INDEX idx_secondary_orders_project ON secondary_market_orders(project_id);
CREATE INDEX idx_secondary_orders_status ON secondary_market_orders(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create wallet cuando se crea el profile
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  -- Genera referral code único
  UPDATE profiles SET referral_code = 'PC-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Updated_at para nuevas tablas
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER kyc_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER secondary_orders_updated_at BEFORE UPDATE ON secondary_market_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Actualizar balance en wallet_movement completado
CREATE OR REPLACE FUNCTION process_wallet_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_balance NUMERIC(15, 2);
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    SELECT balance_available INTO current_balance FROM wallets WHERE id = NEW.wallet_id;

    IF NEW.type IN ('deposit', 'return', 'transfer_in', 'refund') THEN
      UPDATE wallets SET balance_available = balance_available + NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('withdrawal', 'investment', 'fee', 'transfer_out') THEN
      UPDATE wallets SET balance_available = balance_available - NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;

    NEW.processed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_wallet_movement_processed
  BEFORE INSERT OR UPDATE ON wallet_movements
  FOR EACH ROW EXECUTE FUNCTION process_wallet_movement();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE afip_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_market_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_market_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Wallet: solo el dueño
CREATE POLICY "Users see own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users see own wallet movements" ON wallet_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own wallet movements" ON wallet_movements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- KYC
CREATE POLICY "Users see own kyc" ON kyc_verifications FOR ALL USING (auth.uid() = user_id);

-- CRM: solo el developer dueño
CREATE POLICY "Developers see own leads" ON leads FOR ALL USING (auth.uid() = developer_id);
CREATE POLICY "Developers see own activities" ON crm_activities FOR ALL USING (auth.uid() = developer_id);
CREATE POLICY "Developers see own campaigns" ON crm_campaigns FOR ALL USING (auth.uid() = developer_id);

-- Invoices: emisor y receptor
CREATE POLICY "Users see invoices they issue or receive" ON invoices FOR SELECT USING (
  auth.uid() = issuer_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users create own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = issuer_id);
CREATE POLICY "Issuers update own invoices" ON invoices FOR UPDATE USING (auth.uid() = issuer_id);

CREATE POLICY "Users manage own afip credentials" ON afip_credentials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own receipts" ON expense_receipts FOR ALL USING (auth.uid() = user_id);

-- Scores: públicos para lectura
CREATE POLICY "Scores are public" ON project_scores FOR SELECT USING (true);

-- Secondary market: públicos para lectura, crean los dueños
CREATE POLICY "Orders are public" ON secondary_market_orders FOR SELECT USING (true);
CREATE POLICY "Users create own orders" ON secondary_market_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON secondary_market_orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Trades visible to participants" ON secondary_market_trades FOR SELECT USING (
  auth.uid() = seller_id OR auth.uid() = buyer_id
);

-- Notifications: solo el dueño
CREATE POLICY "Users see own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Referrals: referidor y referido
CREATE POLICY "Users see own referrals" ON referrals FOR SELECT USING (
  auth.uid() = referrer_id OR auth.uid() = referred_id
);

-- Audit logs: solo admins (por ahora, lectura propia)
CREATE POLICY "Users see own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
