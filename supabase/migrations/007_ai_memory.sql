-- ============================================================
-- Suelo v4.2 — Migración 007: Memoria persistente del AI Analyst
--
-- Permite que el analyst recuerde preferencias, decisiones y
-- contexto importante entre sesiones. Cada memoria tiene importancia
-- (0-10) para priorización y tipo para organización.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE ai_memory_type AS ENUM (
    'user_preference',   -- "prefiere proyectos residenciales"
    'decision',          -- "rechazó invertir en X por riesgo alto"
    'context',           -- "se mudó a Uruguay en 2026"
    'important_fact',    -- "es contador matriculado"
    'goal',              -- "quiere ahorrar USD 10k en 12 meses"
    'concern'            -- "preocupado por inflación ARS"
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS ai_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type ai_memory_type NOT NULL DEFAULT 'context',
  summary TEXT NOT NULL,               -- memoria en 1 oración
  details TEXT,                        -- contexto adicional opcional
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 0 AND importance <= 10),
  source_conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  accessed_count INTEGER DEFAULT 0,    -- cuántas veces se usó en context
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,              -- null = permanente
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_memories_user
  ON ai_memories(user_id, importance DESC, updated_at DESC)
  WHERE expires_at IS NULL OR expires_at > now();

CREATE INDEX IF NOT EXISTS idx_ai_memories_type
  ON ai_memories(user_id, memory_type);

-- Trigger updated_at (reusa set_updated_at de migración 006)
DROP TRIGGER IF EXISTS set_updated_at ON ai_memories;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON ai_memories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_memories_owner ON ai_memories;
CREATE POLICY ai_memories_owner ON ai_memories
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Helper: incrementar accessed_count cuando se recupera
CREATE OR REPLACE FUNCTION touch_ai_memory(p_memory_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ai_memories
  SET accessed_count = accessed_count + 1,
      last_accessed_at = now()
  WHERE id = p_memory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
