// Imports a player's official rounds from pitch.cat into games.
//
// Safe to run as often as you like: every round carries a derived identity
// (federation_round_id) and is upserted on it, so repeated syncs update
// rows instead of duplicating them.
//
// Callable two ways:
//   - by the player, with their own JWT (button in the app)
//   - by a scheduled job, with the service role key and { userId } in the
//     body, or no userId to sweep every connected account
//
// Scorecards ship inside the results pages, so a full history costs only
// one request per page of results. Per hole metres and stroke index come
// from the tournament sheets and are left for the statistics phase.

import { PitchCatClient, PitchCatError } from "../_shared/pitchcat.ts";
import { toGameRow, toHandicapRow } from "../_shared/rounds.ts";
import { json, preflight, resolveUser, serviceClient } from "../_shared/http.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await req.json().catch(() => ({})) as { userId?: string };
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const isScheduledCall = serviceKey.length > 0 && bearer === serviceKey;

  const supabase = serviceClient();

  // Scheduled sweep: no specific user, so walk every connected account.
  if (isScheduledCall && !body.userId) {
    const { data, error } = await supabase
      .from("federation_connections")
      .select("user_id")
      .in("status", ["connected", "error"]);

    if (error) return json({ error: error.message }, 500);

    const results = [];
    for (const row of data ?? []) {
      results.push({ userId: row.user_id, ...await syncUser(supabase, row.user_id) });
    }
    return json({ ok: true, synced: results.length, results });
  }

  let userId: string | null = null;
  if (isScheduledCall) {
    userId = body.userId ?? null;
  } else {
    const user = await resolveUser(req);
    userId = user?.id ?? null;
  }

  if (!userId) return json({ error: "unauthorized" }, 401);

  const result = await syncUser(supabase, userId);
  return json(result, result.ok ? 200 : (result.status ?? 500));
});

interface SyncResult {
  ok: boolean;
  error?: string;
  status?: number;
  total?: number;
  imported?: number;
  updated?: number;
}

async function syncUser(supabase: SupabaseClient, userId: string): Promise<SyncResult> {
  const { data: credentials, error: credentialsError } = await supabase
    .rpc("federation_read_credentials", { p_user_id: userId });

  if (credentialsError) {
    console.error("federation-sync: credential lookup failed", credentialsError.message);
    return { ok: false, error: "credential_lookup_failed", status: 500 };
  }

  const credential = Array.isArray(credentials) ? credentials[0] : credentials;
  if (!credential?.password) {
    return { ok: false, error: "not_connected", status: 404 };
  }

  await mark(supabase, userId, "syncing");

  const client = new PitchCatClient(credential.licencia, credential.password);
  let rounds;
  try {
    await client.login();
    rounds = await client.fetchRounds();
  } catch (error) {
    const isAuth = error instanceof PitchCatError && error.code === "auth";
    const message = error instanceof Error ? error.message : String(error);
    await mark(supabase, userId, isAuth ? "auth_error" : "error", message);
    return {
      ok: false,
      error: isAuth ? "invalid_credentials" : "federation_unavailable",
      status: isAuth ? 401 : 502,
    };
  }

  if (!rounds.length) {
    await mark(supabase, userId, "connected", null, 0);
    return { ok: true, total: 0, imported: 0, updated: 0 };
  }

  const playerName = await resolvePlayerName(supabase, userId, client.playerName());

  // Distinguish new rounds from ones already imported, so the caller can
  // tell the player what actually arrived.
  const { data: existing } = await supabase
    .from("games")
    .select("federation_round_id")
    .eq("user_id", userId)
    .eq("source", "federation");

  const known = new Set((existing ?? []).map((row) => row.federation_round_id));
  const imported = rounds.filter((round) => !known.has(round.roundId)).length;

  const gameRows = rounds.map((round) => toGameRow(round, userId, playerName));
  const handicapRows = rounds
    .map((round) => toHandicapRow(round, userId))
    .filter((row): row is NonNullable<typeof row> => row !== null);

  try {
    await upsertBatched(supabase, "games", gameRows, "user_id,federation_round_id");
    await upsertBatched(supabase, "handicap_history", handicapRows, "user_id,round_id");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("federation-sync: write failed", message);
    await mark(supabase, userId, "error", message);
    return { ok: false, error: "write_failed", status: 500 };
  }

  await mark(supabase, userId, "connected", null, rounds.length);

  return { ok: true, total: rounds.length, imported, updated: rounds.length - imported };
}

async function upsertBatched(
  supabase: SupabaseClient,
  table: string,
  rows: unknown[],
  onConflict: string,
): Promise<void> {
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/** Prefer the name the player set in the app over the federation's. */
async function resolvePlayerName(
  supabase: SupabaseClient,
  userId: string,
  fallback: string,
): Promise<string> {
  const { data } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
  return data?.name?.trim() || fallback;
}

function mark(
  supabase: SupabaseClient,
  userId: string,
  status: string,
  error: string | null = null,
  rounds: number | null = null,
) {
  return supabase.rpc("federation_mark_sync", {
    p_user_id: userId,
    p_status: status,
    p_error: error,
    p_rounds: rounds,
  });
}
