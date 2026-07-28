// Unlinks a pitch.cat account.
//
// Always removes the stored password and the connection. Imported rounds are
// kept unless the player asks for them to go too, which covers the right to
// have their data erased.

import { json, preflight, resolveUser, serviceClient } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await resolveUser(req);
  if (!user) return json({ error: "unauthorized" }, 401);

  const { deleteData = false } = await req.json().catch(() => ({})) as { deleteData?: boolean };

  const supabase = serviceClient();

  if (deleteData) {
    const { error: gamesError } = await supabase
      .from("games").delete().eq("user_id", user.id).eq("source", "federation");
    if (gamesError) {
      console.error("federation-disconnect: could not remove rounds", gamesError.message);
      return json({ error: "delete_failed" }, 500);
    }
    await supabase
      .from("handicap_history").delete().eq("user_id", user.id).eq("source", "federation");
  }

  const { error } = await supabase.rpc("federation_delete_credentials", { p_user_id: user.id });
  if (error) {
    console.error("federation-disconnect: could not remove credentials", error.message);
    return json({ error: "disconnect_failed" }, 500);
  }

  return json({ ok: true, dataDeleted: deleteData });
});
