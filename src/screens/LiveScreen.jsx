import React, { useState, useEffect } from 'react';
import { X, Bell, Flag } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { PLAYER_COLORS } from '../data/constants.js';
import { ScoreSymbol } from '../components/ScoreSymbol.jsx';
import LiveGameCard from '../components/LiveCard.jsx';

/* ═══════════════════════════════════════════════════════════════
   LIVE GAME VIEW — full-screen overlay for watching a live game
═══════════════════════════════════════════════════════════════ */
export function LiveGameView({ game, liveGames, onClose, lang, user, openAuth, follows, onFollow }) {
  // Auto-update: find latest version from live feed
  const live = (liveGames && liveGames.find(g => g.id === game.id)) || game;
  const diff = live.score_total ?? 0;
  const scoreColor = diff < -1 ? "#FBBF24" : diff === -1 ? "#60A5FA" : diff === 0 ? "#CAFF4D" : "#EF4444";
  const fmtDate = live.date ? live.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').slice(0,5) : "";

  return (
    <div className="page-scroll ani-up" style={{display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"14px 0",borderBottom:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            {live.is_live ? (
              <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(239,68,68,.15)",color:"#EF4444",border:"1px solid rgba(239,68,68,.3)",borderRadius:3,padding:"2px 7px",display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> EN DIRECTE
              </span>
            ) : (
              <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(85,87,97,.15)",color:"#555761",border:"1px solid #222327",borderRadius:3,padding:"2px 7px"}}>PARTIDA ACABADA</span>
            )}
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{live.player_name}</div>
          <div style={{fontSize:11,color:"#787C8A",marginTop:1}}>{live.course_name} · {lang==="en"?"Hole":lang==="es"?"Hoyo":"Forat"} {live.current_hole||1}/{live.holes||18}{fmtDate ? ` · ${fmtDate}` : ""}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:scoreColor,lineHeight:1}}>{diff>0?`+${diff}`:diff===0?"E":diff}</div>
          </div>
          {live.user_id && user && (
            <button onClick={()=>onFollow&&onFollow(live.user_id)}
              style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${follows?.includes(live.user_id)?"rgba(202,255,77,.3)":"#333"}`,background:follows?.includes(live.user_id)?"rgba(202,255,77,.08)":"#1A1B1E",color:follows?.includes(live.user_id)?"#CAFF4D":"#787C8A",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
              <Bell size={10}/>{follows?.includes(live.user_id)?"Seguint":"Seguir"}
            </button>
          )}
          <button onClick={onClose} style={{width:34,height:34,borderRadius:"50%",border:"1px solid #222327",background:"#1A1B1E",color:"#787C8A",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* Players */}
      {live.players && live.players.length > 0 && (
        <div style={{padding:"12px 16px",borderBottom:"1px solid #1A1B1E",flexShrink:0}}>
          {live.players.map((p, i) => {
            const pDiff = p.diff ?? 0;
            const pc = PLAYER_COLORS[i] || "#CAFF4D";
            const pScoreColor = pDiff < -1 ? "#FBBF24" : pDiff === -1 ? "#60A5FA" : pDiff === 0 ? "#CAFF4D" : "#EF4444";
            return (
              <div key={p.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<live.players.length-1?"1px solid #111214":"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:pc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                  {p.avatarUrl
                    ? <img src={p.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                    : (p.name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase() || "P"
                  }
                </div>
                <div style={{flex:1,fontWeight:600,fontSize:13}}>{p.name}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:pScoreColor}}>
                  {pDiff>0?`+${pDiff}`:pDiff===0?"E":pDiff}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scorecard grid */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {live.scores && live.scores.length > 0 ? (
          <>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:10}}>
              {lang==="en"?"Hole by hole":lang==="es"?"Hoyo a hoyo":"Forat a forat"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:`40px repeat(${Math.min(live.players?.length||1,4)},1fr)`,gap:4}}>
              {/* Header row */}
              <div style={{fontSize:9,color:"#555761",fontWeight:700,textAlign:"center",paddingBottom:4}}>F.</div>
              {(live.players||[]).map((p,i)=>(
                <div key={p.id||i} style={{fontSize:9,color:PLAYER_COLORS[i]||"#CAFF4D",fontWeight:700,textAlign:"center",paddingBottom:4}}>
                  {(p.name||"P").split(" ")[0].slice(0,4).toUpperCase()}
                </div>
              ))}
              {/* Score rows — guests see only first 3 holes */}
              {live.scores.map((h, hi) => {
                const isBlurred = !user && hi >= 3;
                const isActiveHole = hi === (live.current_hole || 1) - 1;
                return (
                  <React.Fragment key={hi}>
                    <div style={{fontSize:10,fontWeight:700,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",height:34,filter:isBlurred?"blur(4px)":"none",userSelect:isBlurred?"none":"auto",color:isActiveHole?"#CAFF4D":"#555761",borderRadius:isActiveHole?5:0,background:isActiveHole?"rgba(202,255,77,.08)":"transparent"}}>{h.hole}</div>
                    {(live.players||[{id:"0"}]).map((p, pi) => (
                      <div key={p.id||pi} style={{display:"flex",alignItems:"center",justifyContent:"center",height:34,filter:isBlurred?"blur(5px)":"none",userSelect:isBlurred?"none":"auto",background:isActiveHole?"rgba(202,255,77,.04)":"transparent",borderRadius:isActiveHole?5:0}}>
                        <ScoreSymbol v={h.playerScores?.[p.id]} par={h.par} size={28}/>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
            {!user && live.scores?.length > 3 && (
              <div style={{textAlign:"center",padding:"16px",marginTop:12,background:"rgba(10,10,11,.95)",borderRadius:10,border:"1px solid rgba(202,255,77,.25)"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#CAFF4D",marginBottom:6}}>
                  {lang==="en"?"Create a free account to watch the full round →":lang==="es"?"Crea cuenta gratuita para ver la partida completa →":"Crea un compte per veure la partida completa →"}
                </div>
                <button className="btn btn-primary btn-sm" style={{width:"auto",borderRadius:100,padding:"8px 20px",fontSize:12}} onClick={()=>{onClose();openAuth();}}>
                  {lang==="en"?"Join free →":lang==="es"?"Únete gratis →":"Uneix-te gratis →"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{textAlign:"center",padding:"32px 16px",color:"#555761",fontSize:13}}>
            {lang==="en"?"No scores yet":"Sense puntuació encara"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE SCREEN
═══════════════════════════════════════════════════════════════ */
export default function LiveScreen({ user, openAuth, lang, liveGames, setLiveGames, onSelectGame, setScreen }) {
  const tl = (k) => t(lang,k);
  const [recentGames, setRecentGames] = useState([]);

  // Re-fetch live games on mount and every 30s (Realtime fallback)
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("games").select("*").eq("is_live", true)
        .order("created_at", { ascending: false }).limit(20);
      if (!data?.length) return;
      const ids = [...new Set(data.map(g => g.user_id).filter(Boolean))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, avatar_url").in("id", ids)
        : { data: [] };
      const avatarMap = {};
      (profiles || []).forEach(p => { if (p.avatar_url) avatarMap[p.id] = p.avatar_url; });
      setLiveGames(data.map(g => ({ ...g, avatar_url: avatarMap[g.user_id] || g.avatar_url || null })));
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, []);

  // Fetch 10 most recent finished games, enriched with profile avatars
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("games")
        .select("id,user_id,player_name,course_name,date,scores,players,created_at")
        .eq("is_live", false)
        .not("scores", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!data?.length) return;
      const ids = [...new Set(data.map(g => g.user_id).filter(Boolean))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, avatar_url").in("id", ids)
        : { data: [] };
      const avatarMap = {};
      (profiles || []).forEach(p => { if (p.avatar_url) avatarMap[p.id] = p.avatar_url; });
      setRecentGames(data.map(g => ({ ...g, avatar_url: avatarMap[g.user_id] || g.avatar_url || null })));
    };
    load();
  }, []);

  const liveNow = (liveGames||[]).filter(g => g.is_live);
  const handleCardClick = (game) => {
    if (!user) { openAuth(); return; }
    if (onSelectGame) onSelectGame(game);
  };

  return (
    <div className="page-scroll ani-up">
      {/* Header */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div className="live-dot"/>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761"}}>
            {liveNow.length} {lang==="en"?"live now":lang==="es"?"en directo ahora":"en directe ara"}
          </div>
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>
          EN DIRECTE <span style={{color:"#EF4444"}}>P&C</span>
        </div>
      </div>

      {/* Stories row */}

      {/* Live games */}
      {liveNow.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#EF4444",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> LIVE ARA
          </div>
          {liveNow.map(g=><LiveGameCard key={g.id} game={g} onClick={handleCardClick}/>)}
        </div>
      )}

      {liveNow.length === 0 && (
        <div className="card" style={{textAlign:"center",padding:"32px 16px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,color:"#555761"}}><Flag size={32}/></div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:".04em",marginBottom:6}}>Sense partides ara mateix</div>
          <div style={{fontSize:12,color:"#555761"}}>Activa la retransmissió en directe quan juguis</div>
        </div>
      )}

      {/* ── ÚLTIMES PARTIDES ── */}
      {recentGames.length > 0 && (
        <div style={{marginTop:24,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>
                {lang==="en"?"Community":lang==="es"?"Comunidad":"Comunitat"}
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,30px)",letterSpacing:".04em",lineHeight:1}}>
                {lang==="en"?"RECENT GAMES":lang==="es"?"ÚLTIMAS PARTIDAS":"ÚLTIMES PARTIDES"}
              </div>
            </div>
          </div>
          {recentGames.map(g => {
            const scoreDiff = (() => {
              try {
                const sc = typeof g.scores === "string" ? JSON.parse(g.scores) : g.scores;
                const pl = typeof g.players === "string" ? JSON.parse(g.players) : g.players;
                if (!Array.isArray(sc) || !Array.isArray(pl)) return null;
                const me = pl[0];
                if (!me) return null;
                let tot = 0, cnt = 0;
                sc.forEach(h => { const v = h.playerScores?.[me.id]; if (v != null) { tot += v - h.par; cnt++; } });
                return cnt ? tot : null;
              } catch { return null; }
            })();
            const diffColor = scoreDiff == null ? "#555" : scoreDiff < 0 ? "#FBBF24" : scoreDiff === 0 ? "#CAFF4D" : "#d0d0d0";
            const diffLabel = scoreDiff == null ? "—" : scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? "E" : `${scoreDiff}`;
            const initials = (g.player_name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
            const daysAgo = (() => { const d = Math.floor((Date.now() - new Date(g.created_at)) / 86400000); return d === 0 ? (lang==="en"?"Today":lang==="es"?"Hoy":"Avui") : d === 1 ? (lang==="en"?"Yesterday":lang==="es"?"Ayer":"Ahir") : `${d}d`; })();
            return (
              <div key={g.id} className="card" style={{padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:g.color||"#1A1B1E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                  {g.avatar_url ? <img src={g.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : initials}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.player_name||"—"}</div>
                  <div style={{fontSize:10,color:"#555761",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.course_name||g.course} · {daysAgo}</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:diffColor,lineHeight:1,flexShrink:0}}>{diffLabel}</div>
              </div>
            );
          })}
        </div>
      )}

      {!user && (
        <div style={{background:"rgba(202,255,77,.06)",border:"1px solid rgba(202,255,77,.2)",borderRadius:10,padding:"13px 14px",marginTop:8}}>
          <div style={{fontSize:13,fontWeight:700,color:"#CAFF4D",marginBottom:4}}>
            {lang==="en"?"Sign up to follow games live →":lang==="es"?"Regístrate para seguir partidas en directo →":"Registra't per seguir partides en directe →"}
          </div>
          <div style={{fontSize:12,color:"#787C8A",marginBottom:10}}>{lang==="en"?"Create a free account to watch and broadcast live rounds":lang==="es"?"Crea una cuenta gratuita para ver y retransmitir partidas":"Crea un compte gratuït per veure i retransmetre partides"}</div>
          <button className="btn btn-primary btn-sm" style={{borderRadius:100,padding:"7px 14px",fontSize:11,width:"auto"}} onClick={openAuth}>{lang==="en"?"Join free →":lang==="es"?"Únete gratis →":"Uneix-te gratis →"}</button>
        </div>
      )}
    </div>
  );
}
