-- ============================================
-- Suelo v3 - Crypto Integration Migration (antes PropChain)
-- Payment Rail + Blockchain Anchoring
-- ============================================

-- ============================================
-- NUEVOS ENUMS
-- ============================================
CREATE TYPE crypto_network AS ENUM (
  'tron', 'ethereum', 'polygon', 'bsc', 'solana', 'base', 'arbitrum'
);
CREATE TYPE crypto_token AS ENUM (
  'USDT', 'USDC', 'DAI', 'BTC', 'ETH', 'MATIC'
);
CREATE TYPE crypto_tx_status AS ENUM (
  'pending', 'confirming', 'completed', 'failed', 'dropped', 'refunded'
);
CREATE TYPE crypto_tx_direction AS ENUM ('inbound', 'outbound');

-- Agregar nuevos providers al enum de payment_provider
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'circle';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'bitso';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'lemon';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'tron_direct';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'polygon_direct';

-- Agregar tipos de movimiento crypto
ALTER TYPE wallet_movement_type ADD VALUE IF NOT EXISTS 'crypto_deposit';
ALTER TYPE wallet_movement_type ADD VALUE IF NOT EXISTS 'crypto_withdrawal';
ALTER TYPE wallet_movement_type ADD VALUE IF NOT EXISTS 'conversion_fee';

-- ============================================
-- 1. CRYPTO WALLETS (addresses por usuario/red)
-- ============================================
CREATE TABLE crypto_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  network crypto_network NOT NULL,
  address TEXT NOT NULL,
  token crypto_token NOT NULL,
  derivation_path TEXT,
  provider TEXT,
  provider_address_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  memo TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, network, token)
);

CREATE INDEX idx_crypto_addresses_user ON crypto_addresses(user_id);
CREATE INDEX idx_crypto_addresses_address ON crypto_addresses(address);

-- ============================================
-- 2. CRYPTO TRANSACTIONS (on-chain)
-- ============================================
CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_movement_id UUID REFERENCES wallet_movements(id) ON DELETE SET NULL,
  direction crypto_tx_direction NOT NULL,
  network crypto_network NOT NULL,
  token crypto_token NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_crypto NUMERIC(20, 8) NOT NULL,
  amount_usd NUMERIC(15, 2) NOT NULL,
  exchange_rate NUMERIC(15, 4),
  network_fee_crypto NUMERIC(20, 8),
  network_fee_usd NUMERIC(15, 2),
  platform_fee_usd NUMERIC(15, 2) DEFAULT 0,
  status crypto_tx_status NOT NULL DEFAULT 'pending',
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3,
  block_number BIGINT,
  block_timestamp TIMESTAMPTZ,
  explorer_url TEXT,
  raw_data JSONB,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crypto_tx_user ON crypto_transactions(user_id);
CREATE INDEX idx_crypto_tx_status ON crypto_transactions(status);
CREATE INDEX idx_crypto_tx_hash ON crypto_transactions(tx_hash);
CREATE INDEX idx_crypto_tx_network ON crypto_transactions(network);

-- ============================================
-- 3. BLOCKCHAIN ANCHORS (verificación pública)
-- ============================================
CREATE TABLE blockchain_anchors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash_record_id UUID REFERENCES hash_records(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  hash TEXT NOT NULL,
  network crypto_network NOT NULL DEFAULT 'polygon',
  contract_address TEXT,
  tx_hash TEXT NOT NULL,
  block_number BIGINT,
  block_timestamp TIMESTAMPTZ,
  explorer_url TEXT NOT NULL,
  gas_used BIGINT,
  cost_usd NUMERIC(10, 4),
  status TEXT DEFAULT 'confirmed',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anchors_hash_record ON blockchain_anchors(hash_record_id);
CREATE INDEX idx_anchors_tx_hash ON blockchain_anchors(tx_hash);

-- ============================================
-- 4. EXCHANGE RATES (histórico)
-- ============================================
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(20, 8) NOT NULL,
  source TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rates_currencies ON exchange_rates(from_currency, to_currency, timestamp DESC);

-- ============================================
-- 5. CRYPTO WITHDRAWAL REQUESTS (requieren KYC)
-- ============================================
CREATE TABLE crypto_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount_usd NUMERIC(15, 2) NOT NULL,
  amount_crypto NUMERIC(20, 8) NOT NULL,
  network crypto_network NOT NULL,
  token crypto_token NOT NULL,
  destination_address TEXT NOT NULL,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  crypto_transaction_id UUID REFERENCES crypto_transactions(id) ON DELETE SET NULL,
  network_fee_estimated NUMERIC(20, 8),
  platform_fee_usd NUMERIC(15, 2) DEFAULT 0,
  total_debit_usd NUMERIC(15, 2),
  two_fa_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user ON crypto_withdrawal_requests(user_id);
CREATE INDEX idx_withdrawals_status ON crypto_withdrawal_requests(status);

-- ============================================
-- EXTENSIÓN DE WALLETS: soporte multi-currency
-- ============================================
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT ARRAY['USD', 'ARS', 'PYG', 'USDT', 'USDC'];
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS default_deposit_network crypto_network DEFAULT 'tron';

-- ============================================
-- EXTENSIÓN DE PROJECTS: aceptar crypto
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS accepts_crypto BOOLEAN DEFAULT TRUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS blockchain_anchor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_blockchain_anchor_id UUID REFERENCES blockchain_anchors(id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER crypto_tx_updated_at BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: cuando una crypto_transaction se completa, crear wallet_movement
CREATE OR REPLACE FUNCTION process_crypto_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC(15, 2);
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') AND NEW.direction = 'inbound' THEN
    SELECT id, balance_available INTO v_wallet_id, v_current_balance
    FROM wallets WHERE user_id = NEW.user_id;

    IF v_wallet_id IS NOT NULL THEN
      INSERT INTO wallet_movements (
        wallet_id, user_id, type, status, amount,
        balance_before, balance_after, currency,
        provider, provider_reference, description, hash
      ) VALUES (
        v_wallet_id, NEW.user_id, 'crypto_deposit', 'completed',
        NEW.amount_usd - COALESCE(NEW.platform_fee_usd, 0),
        v_current_balance,
        v_current_balance + NEW.amount_usd - COALESCE(NEW.platform_fee_usd, 0),
        'USD', 'tron_direct', NEW.tx_hash,
        'Depósito crypto ' || NEW.token::text || ' ' || NEW.amount_crypto::text,
        NEW.tx_hash
      )
      RETURNING id INTO NEW.wallet_movement_id;

      NEW.confirmed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_crypto_tx_completed
  BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW EXECUTE FUNCTION process_crypto_completion();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Crypto addresses: solo el dueño
CREATE POLICY "Users see own crypto addresses" ON crypto_addresses FOR ALL USING (auth.uid() = user_id);

-- Crypto transactions: solo el dueño
CREATE POLICY "Users see own crypto transactions" ON crypto_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System creates crypto transactions" ON crypto_transactions FOR INSERT WITH CHECK (true);

-- Blockchain anchors: públicos (verificación pública)
CREATE POLICY "Anchors are public" ON blockchain_anchors FOR SELECT USING (true);
CREATE POLICY "Authenticated users create anchors" ON blockchain_anchors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Exchange rates: públicos
CREATE POLICY "Rates are public" ON exchange_rates FOR SELECT USING (true);

-- Withdrawals: solo el dueño
CREATE POLICY "Users manage own withdrawals" ON crypto_withdrawal_requests FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN HELPER: obtener tasa de conversión reciente
-- ============================================
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_from TEXT,
  p_to TEXT
) RETURNS NUMERIC AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from
    AND to_currency = p_to
    AND timestamp > NOW() - INTERVAL '10 minutes'
  ORDER BY timestamp DESC
  LIMIT 1;

  IF v_rate IS NULL THEN
    IF p_from = 'USD' AND p_to IN ('USDT', 'USDC') THEN RETURN 1.0;
    ELSIF p_from IN ('USDT', 'USDC') AND p_to = 'USD' THEN RETURN 1.0;
    ELSE RETURN NULL;
    END IF;
  END IF;

  RETURN v_rate;
END;
$$ LANGUAGE plpgsql;
