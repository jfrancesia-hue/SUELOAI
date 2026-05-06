-- ============================================================
-- Suelo v4 — Migración 006: CRM + Invoicing + Secondary Market + KYC
--
-- Tablas nuevas:
--   · crm_contacts           → contactos (prospectos, clientes, inversores)
--   · crm_leads              → leads fríos
--   · crm_deal_stages        → etapas del pipeline (configurable por developer)
--   · crm_deals              → deals en pipeline
--   · crm_campaigns          → campañas WhatsApp/email
--   · invoices               → facturas emitidas (AFIP/SIFEN)
--   · secondary_market_listings → ofertas de venta de fracciones
--   · secondary_market_trades   → transacciones del mercado secundario
--   · kyc_requests           → solicitudes KYC (Didit / manual)
--
-- IDEMPOTENTE.
-- ============================================================

-- ============================================================
-- ENUMs
-- ============================================================
DO $$ BEGIN
  CREATE TYPE crm_lead_status AS ENUM ('new', 'contacted', 'qualified', 'unqualified', 'converted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE crm_campaign_channel AS ENUM ('whatsapp', 'email', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE crm_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_type AS ENUM ('A', 'B', 'C', 'FE'); -- FE = Factura Electrónica Paraguay
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'cancelled', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recipient_tax_condition AS ENUM ('consumidor_final', 'responsable_inscripto', 'monotributo', 'exento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sm_listing_status AS ENUM ('open', 'partial', 'sold', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sm_trade_status AS ENUM ('pending', 'confirmed', 'settled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_provider AS ENUM ('didit', 'manual', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- CRM: CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  country TEXT DEFAULT 'AR',
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner ON crm_contacts(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email) WHERE email IS NOT NULL;

-- ============================================================
-- CRM: LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source TEXT,
  status crm_lead_status DEFAULT 'new',
  budget_usd NUMERIC,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_owner ON crm_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);

-- ============================================================
-- CRM: DEAL STAGES (configurables por owner)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#00C853',
  is_win_stage BOOLEAN DEFAULT false,
  is_lost_stage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_deal_stages_owner ON crm_deal_stages(owner_id, order_index);

-- ============================================================
-- CRM: DEALS (pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES crm_deal_stages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value_usd NUMERIC DEFAULT 0,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_owner ON crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage_id);

-- ============================================================
-- CRM: CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel crm_campaign_channel NOT NULL DEFAULT 'whatsapp',
  status crm_campaign_status NOT NULL DEFAULT 'draft',
  message_template TEXT NOT NULL,
  recipients_filter JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{"sent":0,"delivered":0,"failed":0,"opened":0,"replied":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_owner ON crm_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status);

-- ============================================================
-- INVOICES (facturación AFIP/SIFEN)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_type invoice_type NOT NULL DEFAULT 'C',
  invoice_number TEXT NOT NULL,
  point_of_sale INTEGER DEFAULT 1,
  country TEXT DEFAULT 'AR',
  recipient_name TEXT NOT NULL,
  recipient_tax_id TEXT,
  recipient_condition recipient_tax_condition DEFAULT 'consumidor_final',
  recipient_email TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  currency TEXT DEFAULT 'ARS',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  cae TEXT,
  cae_expiry DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  pdf_url TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_issuer ON invoices(issuer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);

-- ============================================================
-- SECONDARY MARKET: LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS secondary_market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tokens_offered INTEGER NOT NULL CHECK (tokens_offered > 0),
  tokens_remaining INTEGER NOT NULL,
  price_per_token NUMERIC NOT NULL CHECK (price_per_token > 0),
  currency TEXT DEFAULT 'USD',
  status sm_listing_status NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sm_listings_project ON secondary_market_listings(project_id) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_sm_listings_seller ON secondary_market_listings(seller_id);

-- ============================================================
-- SECONDARY MARKET: TRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS secondary_market_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES secondary_market_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_traded INTEGER NOT NULL CHECK (tokens_traded > 0),
  price_per_token NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  platform_fee_usd NUMERIC DEFAULT 0,
  net_to_seller_usd NUMERIC NOT NULL,
  status sm_trade_status NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sm_trades_buyer ON secondary_market_trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sm_trades_seller ON secondary_market_trades(seller_id);

-- ============================================================
-- KYC REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS kyc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider kyc_provider NOT NULL DEFAULT 'didit',
  status kyc_status NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  workflow_id TEXT,
  documents_submitted JSONB DEFAULT '[]'::jsonb,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_requests_user ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_status ON kyc_requests(status);

-- ============================================================
-- TRIGGER: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'crm_contacts', 'crm_leads', 'crm_deals', 'crm_campaigns',
    'invoices', 'secondary_market_listings', 'kyc_requests'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_market_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Helper: policies owner-only (drop-and-recreate para idempotencia)
DO $$
BEGIN
  -- crm_contacts
  DROP POLICY IF EXISTS crm_contacts_owner ON crm_contacts;
  CREATE POLICY crm_contacts_owner ON crm_contacts
    FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

  -- crm_leads
  DROP POLICY IF EXISTS crm_leads_owner ON crm_leads;
  CREATE POLICY crm_leads_owner ON crm_leads
    FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

  -- crm_deal_stages
  DROP POLICY IF EXISTS crm_deal_stages_owner ON crm_deal_stages;
  CREATE POLICY crm_deal_stages_owner ON crm_deal_stages
    FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

  -- crm_deals
  DROP POLICY IF EXISTS crm_deals_owner ON crm_deals;
  CREATE POLICY crm_deals_owner ON crm_deals
    FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

  -- crm_campaigns
  DROP POLICY IF EXISTS crm_campaigns_owner ON crm_campaigns;
  CREATE POLICY crm_campaigns_owner ON crm_campaigns
    FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

  -- invoices
  DROP POLICY IF EXISTS invoices_issuer ON invoices;
  CREATE POLICY invoices_issuer ON invoices
    FOR ALL USING (issuer_id = auth.uid()) WITH CHECK (issuer_id = auth.uid());

  -- secondary_market_listings: lectura pública de 'open', escritura solo seller
  DROP POLICY IF EXISTS sm_listings_read ON secondary_market_listings;
  CREATE POLICY sm_listings_read ON secondary_market_listings
    FOR SELECT USING (status = 'open' OR seller_id = auth.uid());

  DROP POLICY IF EXISTS sm_listings_write ON secondary_market_listings;
  CREATE POLICY sm_listings_write ON secondary_market_listings
    FOR INSERT WITH CHECK (seller_id = auth.uid());

  DROP POLICY IF EXISTS sm_listings_update ON secondary_market_listings;
  CREATE POLICY sm_listings_update ON secondary_market_listings
    FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

  DROP POLICY IF EXISTS sm_listings_delete ON secondary_market_listings;
  CREATE POLICY sm_listings_delete ON secondary_market_listings
    FOR DELETE USING (seller_id = auth.uid());

  -- secondary_market_trades: participantes pueden leer, solo servicio puede escribir
  DROP POLICY IF EXISTS sm_trades_read ON secondary_market_trades;
  CREATE POLICY sm_trades_read ON secondary_market_trades
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

  -- kyc_requests: solo el usuario ve/escribe su propio request
  DROP POLICY IF EXISTS kyc_requests_owner ON kyc_requests;
  CREATE POLICY kyc_requests_owner ON kyc_requests
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
END $$;

-- ============================================================
-- SEED: default deal stages para un usuario (helper, no auto-run)
-- Uso: SELECT seed_default_deal_stages('<user_id>');
-- ============================================================
CREATE OR REPLACE FUNCTION seed_default_deal_stages(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO crm_deal_stages (owner_id, name, order_index, color, is_win_stage, is_lost_stage) VALUES
    (p_user_id, 'Nuevo',        0, '#94A3B8', false, false),
    (p_user_id, 'Contactado',   1, '#60A5FA', false, false),
    (p_user_id, 'Calificado',   2, '#818CF8', false, false),
    (p_user_id, 'Propuesta',    3, '#A78BFA', false, false),
    (p_user_id, 'Negociación',  4, '#F59E0B', false, false),
    (p_user_id, 'Ganado',       5, '#00C853', true,  false),
    (p_user_id, 'Perdido',      6, '#EF4444', false, true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
