// Links a player's pitch.cat account.
//
// The credentials are verified against the federation before anything is
// stored, so a wrong password never creates a connection. The password goes
// straight into Supabase Vault through a service-role only function and is
// never written to a regular table, a log or the response.

import { PitchCatClient, PitchCatError } from "../_shared/pitchcat.ts";
import { json, preflight, resolveUser, serviceClient } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await resolveUser(req);
  if (!user) return json({ error: "unauthorized" }, 401);

  let payload: { licencia?: string; password?: string; consent?: boolean };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const licencia = (payload.licencia ?? "").trim();
  const password = payload.password ?? "";

  if (!licencia || !password) return json({ error: "missing_credentials" }, 400);
  // Consent is recorded explicitly: the user is authorising us to access the
  // federation on their behalf and to keep their password encrypted.
  if (payload.consent !== true) return json({ error: "consent_required" }, 400);

  const client = new PitchCatClient(licencia, password);
  let playerName = licencia;

  try {
    await client.login();
    playerName = client.playerName();
  } catch (error) {
    if (error instanceof PitchCatError && error.code === "auth") {
      return json({ error: "invalid_credentials" }, 401);
    }
    console.error("federation-connect: federation unreachable", String(error));
    return json({ error: "federation_unavailable" }, 502);
  }

  const supabase = serviceClient();
  const { error } = await supabase.rpc("federation_store_credentials", {
    p_user_id: user.id,
    p_licencia: licencia,
    p_password: password,
    p_name: playerName,
  });

  if (error) {
    console.error("federation-connect: could not store credentials", error.message);
    return json({ error: "storage_failed" }, 500);
  }

  return json({ ok: true, licencia, playerName });
});
