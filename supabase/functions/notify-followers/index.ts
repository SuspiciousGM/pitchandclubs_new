import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import webpush from 'npm:web-push';

webpush.setVapidDetails(
  'mailto:hola@pitchandclubs.cat',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

serve(async (req) => {
  const { game } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  for (const player of (game.players || [])) {
    if (!player.user_id) continue;

    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', player.user_id);

    if (!followers?.length) continue;

    const followerIds = followers.map((f: { follower_id: string }) => f.follower_id);
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', followerIds);

    const diff = player.diff ?? 0;
    const fmtDiff = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;

    for (const { subscription } of (subs ?? [])) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify({
          title: `${player.name} ha acabat a ${game.course}`,
          body: `${fmtDiff} · ${game.scores?.length ?? 0} forats · Toca per veure la targeta`,
          url: 'https://pitchandclubs.cat',
        }));
      } catch (e) {
        console.error('Push error:', e);
      }
    }
  }

  return new Response('ok', { headers: { 'Content-Type': 'text/plain' } });
});
