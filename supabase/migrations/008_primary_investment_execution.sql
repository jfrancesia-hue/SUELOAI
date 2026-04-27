-- ============================================================
-- Suelo v4 - Atomic primary investment execution
--
-- Runs the money movement, investment, hash record, transaction and
-- notification in one database transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION execute_primary_investment(
  p_user_id UUID,
  p_project_id UUID,
  p_tokens INTEGER,
  p_contract_hash TEXT,
  p_snapshot JSONB,
  p_verification_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project projects%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_investment investments%ROWTYPE;
  v_movement wallet_movements%ROWTYPE;
  v_amount NUMERIC(15, 2);
  v_available_tokens INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario requerido';
  END IF;

  IF p_project_id IS NULL OR p_tokens IS NULL OR p_tokens < 1 THEN
    RAISE EXCEPTION 'Datos de inversion invalidos';
  END IF;

  SELECT * INTO v_project
  FROM projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proyecto no encontrado';
  END IF;

  IF v_project.status <> 'funding' THEN
    RAISE EXCEPTION 'Proyecto no acepta inversiones actualmente';
  END IF;

  v_available_tokens := v_project.total_tokens - v_project.sold_tokens;
  IF p_tokens > v_available_tokens THEN
    RAISE EXCEPTION 'Solo quedan % tokens disponibles', v_available_tokens;
  END IF;

  v_amount := ROUND((p_tokens * v_project.token_price)::NUMERIC, 2);
  IF v_amount < v_project.min_investment THEN
    RAISE EXCEPTION 'Inversion minima: USD %', v_project.min_investment;
  END IF;

  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_wallet;
  END IF;

  IF NOT v_wallet.is_active THEN
    RAISE EXCEPTION 'La billetera esta inactiva';
  END IF;

  IF v_wallet.balance_available < v_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente. Necesitas USD % y tenes USD %',
      v_amount,
      v_wallet.balance_available;
  END IF;

  INSERT INTO investments (
    investor_id,
    project_id,
    tokens_purchased,
    amount,
    status,
    contract_hash,
    notes
  )
  VALUES (
    p_user_id,
    p_project_id,
    p_tokens,
    v_amount,
    'confirmed',
    p_contract_hash,
    'Ejecutada desde wallet Suelo'
  )
  RETURNING * INTO v_investment;

  INSERT INTO wallet_movements (
    wallet_id,
    user_id,
    type,
    status,
    amount,
    balance_before,
    balance_after,
    currency,
    provider,
    provider_reference,
    provider_metadata,
    description,
    hash,
    related_investment_id,
    related_project_id
  )
  VALUES (
    v_wallet.id,
    p_user_id,
    'investment',
    'completed',
    v_amount,
    v_wallet.balance_available,
    v_wallet.balance_available - v_amount,
    v_wallet.currency,
    'internal',
    'INV-' || UPPER(SUBSTRING(v_investment.id::TEXT, 1, 10)),
    jsonb_build_object('tokens', p_tokens, 'project_title', v_project.title),
    'Inversion en ' || v_project.title,
    p_contract_hash,
    v_investment.id,
    p_project_id
  )
  RETURNING * INTO v_movement;

  INSERT INTO hash_records (
    investment_id,
    project_id,
    hash,
    algorithm,
    data_snapshot,
    verified,
    verification_url,
    created_by
  )
  VALUES (
    v_investment.id,
    p_project_id,
    p_contract_hash,
    'SHA-256',
    p_snapshot,
    TRUE,
    p_verification_url,
    p_user_id
  );

  INSERT INTO transactions (
    user_id,
    investment_id,
    project_id,
    type,
    amount,
    description
  )
  VALUES (
    p_user_id,
    v_investment.id,
    p_project_id,
    'investment',
    v_amount,
    'Inversion de ' || p_tokens || ' tokens en ' || v_project.title
  );

  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    link,
    metadata
  )
  VALUES (
    p_user_id,
    'investment_confirmed',
    'Inversion confirmada',
    'Tu inversion en ' || v_project.title || ' fue confirmada y ya tiene hash verificable.',
    '/verify/' || p_contract_hash,
    jsonb_build_object(
      'investment_id', v_investment.id,
      'project_id', p_project_id,
      'amount', v_amount,
      'tokens', p_tokens,
      'hash', p_contract_hash
    )
  );

  RETURN jsonb_build_object(
    'investment', to_jsonb(v_investment),
    'wallet_movement', to_jsonb(v_movement),
    'verification_url', p_verification_url
  );
END;
$$;

REVOKE ALL ON FUNCTION execute_primary_investment(UUID, UUID, INTEGER, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_primary_investment(UUID, UUID, INTEGER, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_primary_investment(UUID, UUID, INTEGER, TEXT, JSONB, TEXT) TO service_role;
