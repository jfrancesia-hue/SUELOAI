-- ============================================
-- Suelo v4 - AI Module + Rebrand Migration
-- ============================================

-- ============================================
-- NUEVOS ENUMS
-- ============================================
CREATE TYPE ai_channel AS ENUM ('web', 'whatsapp', 'email', 'voice', 'api');
CREATE TYPE ai_interaction_type AS ENUM (
  'onboarding', 'portfolio_advice', 'project_analysis',
  'general_query', 'fiscal_query', 'investment_recommendation',
  'rebalancing', 'tax_planning', 'fraud_alert'
);
CREATE TYPE risk_profile AS ENUM ('conservative', 'moderate', 'aggressive', 'unset');
CREATE TYPE time_horizon AS ENUM ('short', 'medium', 'long', 'unset');
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'unset');
CREATE TYPE recommendation_status AS ENUM ('active', 'accepted', 'dismissed', 'expired', 'acted_on');
CREATE TYPE recommendation_type AS ENUM (
  'project_match', 'rebalance', 'tax_optimization',
  'diversification', 'exit_signal', 'new_opportunity'
);

-- ============================================
-- 1. AI USER PROFILES (perfil de inversor)
-- ============================================
CREATE TABLE ai_user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  risk_profile risk_profile NOT NULL DEFAULT 'unset',
  investment_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  time_horizon time_horizon NOT NULL DEFAULT 'unset',
  experience_level experience_level NOT NULL DEFAULT 'unset',
  preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_project_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  monthly_capacity NUMERIC(15, 2),
  total_capacity NUMERIC(15, 2),
  auto_invest_enabled BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_assessment_at TIMESTAMPTZ,
  ai_insights JSONB,
  language_preference TEXT DEFAULT 'es',
  notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false, "in_app": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. AI CONVERSATIONS (historial conversacional)
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel ai_channel NOT NULL DEFAULT 'web',
  title TEXT,
  context JSONB,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10, 4) DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. AI MESSAGES (mensajes individuales)
-- ============================================
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd NUMERIC(10, 6),
  model TEXT,
  feedback_rating INTEGER,
  feedback_comment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. AI RECOMMENDATIONS (recomendaciones generadas)
-- ============================================
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type recommendation_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_ids UUID[] DEFAULT ARRAY[]::UUID[],
  match_score NUMERIC(5, 2),
  reasoning TEXT,
  expected_return NUMERIC(5, 2),
  risk_score INTEGER,
  status recommendation_status NOT NULL DEFAULT 'active',
  action_url TEXT,
  priority INTEGER DEFAULT 5,
  expires_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  dismissed_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. AI PROJECT ANALYSES (análisis de proyectos)
-- ============================================
CREATE TABLE ai_project_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL DEFAULT 'initial',
  data_sources JSONB,
  findings JSONB,
  red_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  opportunities TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggested_price_range JSONB,
  comparables JSONB,
  executive_summary TEXT,
  detailed_analysis TEXT,
  confidence_score NUMERIC(3, 2),
  ai_model TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. AI GENERATED CONTENT (para developers)
-- ============================================
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'es',
  context JSONB,
  used BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. AI ALERTS & INSIGHTS (insights proactivos)
-- ============================================
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_label TEXT,
  action_url TEXT,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  related_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. AI DOCUMENT EXTRACTIONS (Vision API)
-- ============================================
CREATE TABLE ai_document_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extracted_data JSONB,
  confidence NUMERIC(3, 2),
  validation_status TEXT DEFAULT 'pending',
  validated_by UUID REFERENCES profiles(id),
  ai_model TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. AI USAGE TRACKING (billing y metrics)
-- ============================================
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  interaction_type ai_interaction_type NOT NULL,
  feature TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXTENSIÓN DE PROFILES: AI features flags
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_monthly_tokens_limit INTEGER DEFAULT 100000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_monthly_tokens_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_preferences JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_ai_profiles_user ON ai_user_profiles(user_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, last_message_at DESC);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, status, priority DESC);
CREATE INDEX idx_ai_analyses_project ON ai_project_analyses(project_id, created_at DESC);
CREATE INDEX idx_ai_insights_user ON ai_insights(user_id, read, dismissed);
CREATE INDEX idx_ai_usage_user_month ON ai_usage_log(user_id, created_at);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER ai_profile_updated_at BEFORE UPDATE ON ai_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_conv_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create AI profile cuando se crea profile
CREATE OR REPLACE FUNCTION create_ai_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_user_profiles (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_create_ai_profile
  AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_ai_profile();

-- Auto-update message count y last_message_at en conversation
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET message_count = message_count + 1,
      last_message_at = NEW.created_at,
      total_tokens = total_tokens + COALESCE(NEW.tokens_input, 0) + COALESCE(NEW.tokens_output, 0),
      total_cost_usd = total_cost_usd + COALESCE(NEW.cost_usd, 0),
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ai_message_created
  AFTER INSERT ON ai_messages FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Trigger: al crear proyecto, schedule análisis IA async
CREATE OR REPLACE FUNCTION schedule_project_ai_analysis()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_project_analyses (project_id, analysis_type)
  VALUES (NEW.id, 'initial');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created_schedule_ai
  AFTER INSERT ON projects FOR EACH ROW EXECUTE FUNCTION schedule_project_ai_analysis();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_project_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI profile" ON ai_user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own messages" ON ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users create own messages" ON ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users see own recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Analyses are public (for project detail)" ON ai_project_analyses FOR SELECT USING (true);
CREATE POLICY "Users manage own content" ON ai_generated_content FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own insights" ON ai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own extractions" ON ai_document_extractions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own usage" ON ai_usage_log FOR SELECT USING (auth.uid() = user_id);
