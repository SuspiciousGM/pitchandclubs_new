-- ============================================================
-- P&C FEDERATION INTEGRATION (FCPP / pitch.cat)
-- Phase 1: connect account, import official rounds, handicap history.
--
-- This migration is idempotent: it can be re-run safely as many
-- times as needed, on a fresh database or on top of itself.
-- Apply with `supabase db push`, or paste into SQL Editor.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 0. VAULT
--    Supabase Vault stores the federation password encrypted at
--    rest. The encryption key lives outside the database, so a
--    dump of the DB does not expose the secrets.
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'supabase_vault') THEN
    CREATE EXTENSION supabase_vault WITH SCHEMA vault;
  END IF;
END $$;


-- ──────────────────────────────────────────────────────────────
-- 1. GAMES: mark the origin of every round
--    'manual'     = entered by hand in the app (everything so far)
--    'federation' = imported from pitch.cat (read only)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE games ADD COLUMN IF NOT EXISTS source             text NOT NULL DEFAULT 'manual';
ALTER TABLE games ADD COLUMN IF NOT EXISTS federation_round_id text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS federation_meta     jsonb;

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_source_valid;
ALTER TABLE games ADD  CONSTRAINT games_source_valid
  CHECK (source IN ('manual', 'federation'));

-- A federation round belongs to exactly one row per user. The sync
-- upserts on this key, so re-running it never duplicates rounds.
--
-- Deliberately not a partial index: ON CONFLICT inference cannot target a
-- predicated index through PostgREST. Manual games leave the column NULL,
-- and NULLs are distinct in a unique index, so they are unaffected.
DROP INDEX IF EXISTS games_federation_round_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS games_federation_round_uniq
  ON games (user_id, federation_round_id);

CREATE INDEX IF NOT EXISTS games_user_source_idx ON games (user_id, source);

-- Imported rounds are never live.
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_federation_not_live;
ALTER TABLE games ADD  CONSTRAINT games_federation_not_live
  CHECK (source <> 'federation' OR is_live IS NOT TRUE);


-- ──────────────────────────────────────────────────────────────
-- 2. FEDERATION_CONNECTIONS
--    One row per user who linked their pitch.cat account.
--    The password is NOT here: this table only holds the pointer
--    to the Vault secret.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS federation_connections (
  user_id         uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  licencia        text NOT NULL,
  player_name     text,
  vault_secret_id uuid,
  status          text NOT NULL DEFAULT 'connected',
  last_sync_at    timestamptz,
  last_error      text,
  rounds_imported integer NOT NULL DEFAULT 0,
  consent_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE federation_connections DROP CONSTRAINT IF EXISTS federation_status_valid;
ALTER TABLE federation_connections ADD  CONSTRAINT federation_status_valid
  CHECK (status IN ('connected', 'syncing', 'auth_error', 'error'));

ALTER TABLE federation_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "federation_select_own" ON federation_connections;
DROP POLICY IF EXISTS "federation_delete_own" ON federation_connections;

-- Users can read their own connection status (never the password, which is
-- not in this table). Every write, disconnection included, goes through the
-- Edge Functions with the service role: deleting this row directly would
-- leave the Vault secret behind with nothing pointing at it.
CREATE POLICY "federation_select_own"
  ON federation_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 3. HANDICAP_HISTORY
--    Exact handicap after each official round, for the evolution
--    chart. Keyed by round so the sync is idempotent.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS handicap_history (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date       date NOT NULL,
  hcp_exact  numeric(4,1) NOT NULL,
  source     text NOT NULL DEFAULT 'federation',
  round_id   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DROP INDEX IF EXISTS handicap_history_round_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS handicap_history_round_uniq
  ON handicap_history (user_id, round_id);

CREATE INDEX IF NOT EXISTS handicap_history_user_date_idx
  ON handicap_history (user_id, date);

ALTER TABLE handicap_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "handicap_select_own" ON handicap_history;

CREATE POLICY "handicap_select_own"
  ON handicap_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 4. CREDENTIAL FUNCTIONS
--    SECURITY DEFINER so they can touch the vault schema, but
--    execution is granted to service_role ONLY. The browser can
--    never call these, and never sees a password.
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION federation_store_credentials(
  p_user_id  uuid,
  p_licencia text,
  p_password text,
  p_name     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_name text := 'federation_pw_' || p_user_id::text;
  v_secret_id   uuid;
BEGIN
  IF p_user_id IS NULL OR coalesce(trim(p_licencia), '') = '' OR coalesce(p_password, '') = '' THEN
    RAISE EXCEPTION 'licencia and password are required';
  END IF;

  -- Reuse the existing secret if there is one, so a reconnect does
  -- not leave orphaned secrets behind.
  SELECT id INTO v_secret_id FROM vault.secrets WHERE name = v_secret_name;

  IF v_secret_id IS NULL THEN
    v_secret_id := vault.create_secret(p_password, v_secret_name, 'FCPP password for ' || p_licencia);
  ELSE
    PERFORM vault.update_secret(v_secret_id, p_password);
  END IF;

  INSERT INTO federation_connections (user_id, licencia, player_name, vault_secret_id, status, last_error, consent_at, updated_at)
  VALUES (p_user_id, trim(p_licencia), p_name, v_secret_id, 'connected', NULL, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    licencia        = excluded.licencia,
    player_name     = coalesce(excluded.player_name, federation_connections.player_name),
    vault_secret_id = excluded.vault_secret_id,
    status          = 'connected',
    last_error      = NULL,
    consent_at      = excluded.consent_at,
    updated_at      = now();
END;
$$;

CREATE OR REPLACE FUNCTION federation_read_credentials(p_user_id uuid)
RETURNS TABLE (licencia text, password text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT fc.licencia::text, s.decrypted_secret::text
  FROM federation_connections fc
  JOIN vault.decrypted_secrets s ON s.id = fc.vault_secret_id
  WHERE fc.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION federation_delete_credentials(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id uuid;
BEGIN
  SELECT vault_secret_id INTO v_secret_id
  FROM federation_connections WHERE user_id = p_user_id;

  DELETE FROM federation_connections WHERE user_id = p_user_id;

  IF v_secret_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = v_secret_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION federation_mark_sync(
  p_user_id uuid,
  p_status  text,
  p_error   text DEFAULT NULL,
  p_rounds  integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE federation_connections SET
    status          = p_status,
    last_error      = p_error,
    last_sync_at    = CASE WHEN p_status = 'connected' THEN now() ELSE last_sync_at END,
    rounds_imported = coalesce(p_rounds, rounds_imported),
    updated_at      = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Lock every credential function down to the service role.
REVOKE ALL ON FUNCTION federation_store_credentials(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION federation_read_credentials(uuid)                    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION federation_delete_credentials(uuid)                  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION federation_mark_sync(uuid, text, text, integer)      FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION federation_store_credentials(uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION federation_read_credentials(uuid)                    TO service_role;
GRANT EXECUTE ON FUNCTION federation_delete_credentials(uuid)                  TO service_role;
GRANT EXECUTE ON FUNCTION federation_mark_sync(uuid, text, text, integer)      TO service_role;
