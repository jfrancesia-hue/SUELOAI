-- ============================================================
-- Suelo v4 — Migración 005
-- Cambios:
--   1. Campo confirmation_token en crypto_withdrawal_requests
--      (usado por /api/crypto/withdraw para email de confirmación).
--   2. UNIQUE(project_id) en project_scores para permitir upsert
--      desde /api/ai/analyze-project.
--   3. UNIQUE(user_id) en ai_user_profiles para permitir upsert
--      desde /api/ai/onboarding.
--   4. Campos auxiliares en ai_recommendations para personalización.
--
-- IDEMPOTENTE: usa IF NOT EXISTS y DO blocks defensivos.
-- ============================================================

-- 1. confirmation_token en withdrawals
ALTER TABLE IF EXISTS crypto_withdrawal_requests
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT;

CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_confirm_token
  ON crypto_withdrawal_requests(confirmation_token)
  WHERE confirmation_token IS NOT NULL;

-- 2. UNIQUE en project_scores(project_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_scores_project_id_key'
  ) THEN
    -- Solo agregar si no hay duplicados previos
    IF (
      SELECT COUNT(*) FROM (
        SELECT project_id FROM project_scores GROUP BY project_id HAVING COUNT(*) > 1
      ) d
    ) = 0 THEN
      ALTER TABLE project_scores
        ADD CONSTRAINT project_scores_project_id_key UNIQUE (project_id);
    END IF;
  END IF;
END $$;

-- 3. UNIQUE en ai_user_profiles(user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ai_user_profiles_user_id_key'
  ) THEN
    IF (
      SELECT COUNT(*) FROM (
        SELECT user_id FROM ai_user_profiles GROUP BY user_id HAVING COUNT(*) > 1
      ) d
    ) = 0 THEN
      ALTER TABLE ai_user_profiles
        ADD CONSTRAINT ai_user_profiles_user_id_key UNIQUE (user_id);
    END IF;
  END IF;
END $$;

-- 4. Campos opcionales en ai_recommendations para personalización
ALTER TABLE IF EXISTS ai_recommendations
  ADD COLUMN IF NOT EXISTS suggested_amount_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS risk_alert TEXT;
