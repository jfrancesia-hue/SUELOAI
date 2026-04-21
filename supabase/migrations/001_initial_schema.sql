-- ============================================
-- Suelo Database Schema - Initial Migration (antes PropChain)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('investor', 'developer', 'admin');
CREATE TYPE project_status AS ENUM ('draft', 'funding', 'funded', 'in_progress', 'completed', 'cancelled');
CREATE TYPE investment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');
CREATE TYPE transaction_type AS ENUM ('investment', 'return', 'fee', 'refund');
CREATE TYPE document_type AS ENUM ('contract', 'deed', 'report', 'certificate', 'other');

-- PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'investor',
  phone TEXT,
  dni TEXT,
  company_name TEXT,
  avatar_url TEXT,
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  total_invested NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_returns NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  status project_status NOT NULL DEFAULT 'draft',
  total_value NUMERIC(15, 2) NOT NULL,
  token_price NUMERIC(15, 2) NOT NULL,
  total_tokens INTEGER NOT NULL,
  sold_tokens INTEGER NOT NULL DEFAULT 0,
  min_investment NUMERIC(15, 2) NOT NULL DEFAULT 100,
  expected_return NUMERIC(5, 2) NOT NULL DEFAULT 0,
  return_period_months INTEGER NOT NULL DEFAULT 12,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVESTMENTS
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tokens_purchased INTEGER NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status investment_status NOT NULL DEFAULT 'pending',
  contract_hash TEXT,
  contract_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  reference_code TEXT UNIQUE DEFAULT ('TX-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8))),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type document_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HASH RECORDS
CREATE TABLE hash_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  hash TEXT NOT NULL UNIQUE,
  algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  data_snapshot JSONB,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  verification_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_developer ON projects(developer_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_project ON investments(project_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_hash_records_hash ON hash_records(hash);

-- TRIGGERS: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- TRIGGER: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'investor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- TRIGGER: update sold_tokens on investment confirmation
CREATE OR REPLACE FUNCTION update_project_tokens()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE projects SET sold_tokens = sold_tokens + NEW.tokens_purchased WHERE id = NEW.project_id;
    UPDATE profiles SET total_invested = total_invested + NEW.amount WHERE id = NEW.investor_id;
  END IF;
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'refunded') THEN
    UPDATE projects SET sold_tokens = sold_tokens - OLD.tokens_purchased WHERE id = OLD.project_id;
    UPDATE profiles SET total_invested = total_invested - OLD.amount WHERE id = OLD.investor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_investment_status_change
  AFTER INSERT OR UPDATE OF status ON investments FOR EACH ROW EXECUTE FUNCTION update_project_tokens();

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hash_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Developers can create projects" ON projects FOR INSERT WITH CHECK (
  auth.uid() = developer_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);
CREATE POLICY "Developers can update own projects" ON projects FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Investors see own investments" ON investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Developers see project investments" ON investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND developer_id = auth.uid())
);
CREATE POLICY "Investors can create investments" ON investments FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users see own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Documents viewable by participants" ON documents FOR SELECT USING (
  auth.uid() = uploaded_by
  OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND developer_id = auth.uid())
  OR EXISTS (SELECT 1 FROM investments WHERE id = investment_id AND investor_id = auth.uid())
);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Hash records are public" ON hash_records FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hash records" ON hash_records FOR INSERT WITH CHECK (auth.uid() = created_by);
