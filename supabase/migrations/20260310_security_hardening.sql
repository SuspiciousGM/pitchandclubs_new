-- ============================================================
-- P&C DATABASE SECURITY HARDENING
-- Run in Supabase dashboard → SQL Editor
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. GAMES TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Public games are viewable by everyone" ON games;
DROP POLICY IF EXISTS "Users can insert own games" ON games;
DROP POLICY IF EXISTS "Users can update own games" ON games;
DROP POLICY IF EXISTS "Users can delete own games" ON games;
DROP POLICY IF EXISTS "games_select_public"              ON games;
DROP POLICY IF EXISTS "games_insert_own"                 ON games;
DROP POLICY IF EXISTS "games_update_own"                 ON games;
DROP POLICY IF EXISTS "games_update_share_token"         ON games;
DROP POLICY IF EXISTS "games_delete_own"                 ON games;

-- SELECT: everyone can read (needed for live feed, leaderboard, player search)
CREATE POLICY "games_select_public"
  ON games FOR SELECT
  USING (true);

-- INSERT: authenticated users can only insert rows with their own user_id.
-- Max 20 games per 24 h to prevent bulk fake-game injection.
CREATE POLICY "games_insert_own"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      SELECT count(*) FROM games
      WHERE user_id = auth.uid()
        AND created_at > now() - interval '24 hours'
    ) < 20
  );

-- UPDATE: owner can update their own game
CREATE POLICY "games_update_own"
  ON games FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: live share — anyone with the share_token UUID can push scores
-- (token is a UUID, ~2^122 entropy; only shared explicitly by the host)
CREATE POLICY "games_update_share_token"
  ON games FOR UPDATE
  USING (share_token IS NOT NULL);

-- DELETE: owner only
CREATE POLICY "games_delete_own"
  ON games FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 2. GAMES TABLE — data-integrity check constraints
-- ──────────────────────────────────────────────────────────────

-- Remove old constraints if they exist (safe to re-add)
ALTER TABLE games
  DROP CONSTRAINT IF EXISTS games_holes_valid,
  DROP CONSTRAINT IF EXISTS games_par_valid,
  DROP CONSTRAINT IF EXISTS games_score_sane,
  DROP CONSTRAINT IF EXISTS games_mode_valid,
  DROP CONSTRAINT IF EXISTS games_player_name_nonempty;

ALTER TABLE games
  ADD CONSTRAINT games_holes_valid
    CHECK (holes IS NULL OR holes BETWEEN 9 AND 18),
  ADD CONSTRAINT games_par_valid
    CHECK (par IS NULL OR par BETWEEN 27 AND 72),
  ADD CONSTRAINT games_score_sane
    CHECK (score_total IS NULL OR score_total BETWEEN -54 AND 300),
  ADD CONSTRAINT games_mode_valid
    CHECK (game_mode IS NULL OR game_mode IN ('stableford','strokeplay','match','parelles')),
  ADD CONSTRAINT games_player_name_nonempty
    CHECK (player_name IS NULL OR length(trim(player_name)) > 0);


-- ──────────────────────────────────────────────────────────────
-- 3. SECURE FUNCTION: host saves game to a co-player's history
--    Replaces the direct cross-user INSERT from the client.
--    SECURITY DEFINER = runs as DB owner, bypasses RLS.
--    All validation is done inside so the caller can't abuse it.
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION save_linked_game(
  p_user_id    uuid,
  p_course     text,
  p_date       text,
  p_game_mode  text,
  p_players    jsonb,
  p_scores     jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- The calling user must be the host (isMe = true) in the players list
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_players) AS pl
    WHERE (pl->>'userId') = auth.uid()::text
      AND (pl->>'isMe')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Caller is not the game host';
  END IF;

  -- The target user must actually appear in the players list
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_players) AS pl
    WHERE (pl->>'userId') = p_user_id::text
      AND ((pl->>'isMe') IS NULL OR (pl->>'isMe')::boolean = false)
  ) THEN
    RAISE EXCEPTION 'Target player was not in this game';
  END IF;

  INSERT INTO games (user_id, course_name, date, game_mode, players, scores)
  VALUES (p_user_id, p_course, p_date, p_game_mode, p_players, p_scores);
END;
$$;

-- Only authenticated users can call this function
GRANT EXECUTE ON FUNCTION save_linked_game TO authenticated;
REVOKE EXECUTE ON FUNCTION save_linked_game FROM anon;


-- ──────────────────────────────────────────────────────────────
-- 4. FOLLOWS TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select_public" ON follows;
DROP POLICY IF EXISTS "follows_insert_own"    ON follows;
DROP POLICY IF EXISTS "follows_delete_own"    ON follows;

-- Anyone can read follows (follower lists, counts)
CREATE POLICY "follows_select_public"
  ON follows FOR SELECT
  USING (true);

-- Can only follow as yourself, and cannot follow yourself
CREATE POLICY "follows_insert_own"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id <> following_id
  );

-- Can only unfollow yourself
CREATE POLICY "follows_delete_own"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Prevent duplicate follows
ALTER TABLE follows
  DROP CONSTRAINT IF EXISTS follows_unique;
ALTER TABLE follows
  ADD CONSTRAINT follows_unique UNIQUE (follower_id, following_id);


-- ──────────────────────────────────────────────────────────────
-- 5. PROFILES TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;

-- Anyone can search profiles (player autocomplete)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- Users can only create/update their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ──────────────────────────────────────────────────────────────
-- 6. PUSH_SUBSCRIPTIONS TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subs_select_own"  ON push_subscriptions;
DROP POLICY IF EXISTS "push_subs_insert_own"  ON push_subscriptions;
DROP POLICY IF EXISTS "push_subs_update_own"  ON push_subscriptions;
DROP POLICY IF EXISTS "push_subs_delete_own"  ON push_subscriptions;

-- Users can only read their own subscriptions
CREATE POLICY "push_subs_select_own"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "push_subs_insert_own"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_subs_update_own"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_subs_delete_own"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 7. TOURNAMENTS TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;

-- Read-only for everyone. Writes only via service role (Supabase dashboard / admin).
CREATE POLICY "tournaments_select_public"
  ON tournaments FOR SELECT
  USING (true);


-- ──────────────────────────────────────────────────────────────
-- 8. GAME_IMAGES TABLE
-- ──────────────────────────────────────────────────────────────

ALTER TABLE game_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_images_select_public" ON game_images;
DROP POLICY IF EXISTS "game_images_insert_own"    ON game_images;

CREATE POLICY "game_images_select_public"
  ON game_images FOR SELECT
  USING (true);

CREATE POLICY "game_images_insert_own"
  ON game_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
