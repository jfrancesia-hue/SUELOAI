-- ============================================================
-- Suelo v4 — SEED opcional de desarrollo
--
-- Uso: ejecutar en el SQL Editor de Supabase DESPUÉS de que el primer
--   usuario se registre (se necesita un auth.users real para FK).
--
-- Completar p_developer_id con el UUID del usuario developer que se creó
-- (se puede obtener con: SELECT id FROM auth.users WHERE email = 'dev@nativos.ar';)
-- ============================================================

DO $$
DECLARE
  v_dev_id UUID := '00000000-0000-0000-0000-000000000000'; -- REEMPLAZAR por UUID real
  v_project_a UUID := gen_random_uuid();
  v_project_b UUID := gen_random_uuid();
  v_contact_a UUID := gen_random_uuid();
  v_contact_b UUID := gen_random_uuid();
BEGIN
  -- Guard: skip si no reemplazaste el UUID
  IF v_dev_id = '00000000-0000-0000-0000-000000000000' THEN
    RAISE NOTICE 'Reemplazar v_dev_id con UUID real antes de ejecutar.';
    RETURN;
  END IF;

  -- Actualizar profile del developer con branding Nativos Consultora
  UPDATE profiles
  SET full_name = 'Jorge Francesia',
      company_name = 'Nativos Consultora',
      role = 'developer',
      country = 'AR'
  WHERE id = v_dev_id;

  -- 2 proyectos de ejemplo
  INSERT INTO projects (id, developer_id, title, description, location, total_value, token_price, total_tokens, sold_tokens, expected_return, return_period_months, status, project_type)
  VALUES
    (v_project_a, v_dev_id,
      'Residencial Villa Morra',
      'Desarrollo residencial premium de 24 unidades en Villa Morra, Asunción. Entrega Q4 2026. Nativos Consultora gestiona obra y comercialización.',
      'Asunción, Paraguay',
      540000, 1000, 540, 0, 18.5, 24, 'funding', 'residential'),
    (v_project_b, v_dev_id,
      'Torre Puerto Madero',
      'Proyecto mixto comercial-residencial en Puerto Madero, Buenos Aires. 15 locales + 40 deptos. Nativos Consultora + constructora asociada.',
      'Buenos Aires, Argentina',
      1200000, 500, 2400, 0, 14.0, 36, 'funding', 'mixed')
  ON CONFLICT DO NOTHING;

  -- Stages por default del developer
  PERFORM seed_default_deal_stages(v_dev_id);

  -- 2 contactos de ejemplo
  INSERT INTO crm_contacts (id, owner_id, full_name, email, phone, company, position, country, tags, source, notes)
  VALUES
    (v_contact_a, v_dev_id, 'María Alvarenga', 'maria@example.com', '+595 981 123 456', 'Alvarenga & Cia', 'CFO', 'PY',
      ARRAY['inversor','vip','py'], 'LinkedIn',
      'Interesada en proyectos de renta mensual. Capacidad USD 50k/año.'),
    (v_contact_b, v_dev_id, 'Ramiro Torres', 'ramiro@example.com', '+54 9 11 5555 1234', 'Torres Holdings', 'Director', 'AR',
      ARRAY['inversor','ar'], 'Referido',
      'Busca diversificar fuera de Argentina.')
  ON CONFLICT DO NOTHING;

  -- 1 lead y 1 deal
  INSERT INTO crm_leads (owner_id, contact_id, title, source, status, budget_usd, project_id, notes)
  VALUES (v_dev_id, v_contact_a, 'María — interés Villa Morra', 'LinkedIn', 'qualified', 25000, v_project_a,
    'Reunión agendada semana próxima.')
  ON CONFLICT DO NOTHING;

  INSERT INTO crm_deals (owner_id, contact_id, stage_id, title, value_usd, probability, expected_close_date, project_id, notes)
  SELECT v_dev_id, v_contact_b, s.id, 'Torres Holdings — 30 tokens Puerto Madero', 15000, 60,
         CURRENT_DATE + INTERVAL '15 days', v_project_b,
         'Propuesta enviada, espera aprobación del board.'
  FROM crm_deal_stages s
  WHERE s.owner_id = v_dev_id AND s.name = 'Propuesta'
  LIMIT 1
  ON CONFLICT DO NOTHING;

  -- 1 campaña draft
  INSERT INTO crm_campaigns (owner_id, name, channel, status, message_template, recipients_filter)
  VALUES (v_dev_id, 'Lanzamiento Villa Morra', 'whatsapp', 'draft',
    '¡Hola {{first_name}}! Te saluda el equipo de Nativos Consultora. Lanzamos Residencial Villa Morra (Asunción, 18.5% anual). ¿Querés que te mande la ficha?',
    '{"tags": ["inversor"]}'::jsonb)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seeds de Nativos Consultora cargados. Developer ID: %', v_dev_id;
END $$;
