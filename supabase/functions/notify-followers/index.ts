// @deno-types="npm:@types/web-push"
import webpush from "npm:web-push"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } })
  }

  try {
    const body = await req.json()
    const game = body.game ?? {}

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") ?? ""
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? ""

    if (!vapidPublic || !vapidPrivate) {
      return new Response(JSON.stringify({ ok: false, error: "Missing VAPID keys" }), { status: 500 })
    }

    webpush.setVapidDetails("mailto:hola@pitchandclubs.cat", vapidPublic, vapidPrivate)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    let sent = 0

    for (const player of (game.players ?? [])) {
      if (!player.user_id) continue

      const { data: followers } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", player.user_id)

      if (!followers || followers.length === 0) continue

      const followerIds = followers.map((f: { follower_id: string }) => f.follower_id)

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .in("user_id", followerIds)

      if (!subs || subs.length === 0) continue

      const diff = player.diff ?? 0
      const fmtDiff = diff === 0 ? "E" : diff > 0 ? "+" + diff : String(diff)

      const payload = JSON.stringify({
        title: player.name + " ha acabat a " + game.course,
        body: fmtDiff + " · " + (game.scores?.length ?? 0) + " forats",
        url: "https://pitchandclubs.cat",
      })

      for (const row of subs) {
        try {
          await webpush.sendNotification(row.subscription, payload)
          sent++
        } catch (e) {
          console.error("push error:", e)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })

  } catch (e) {
    console.error("function error:", e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})
