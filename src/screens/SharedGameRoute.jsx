import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.js';
import { PLAYER_COLORS } from '../data/constants.js';
import { ScoreSymbol } from '../components/ScoreSymbol.jsx';
import ScorecardScreen from './ScorecardScreen.jsx';

/* ─── Shared game: standalone viewer ─── */
function SharedViewer({ game, token, watchOnly, onJoinClick }) {
  const isLive = game.is_live;
  const players = game.players || [];
  const scores  = game.scores  || [];
  const fmtDate = game.date ? game.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').slice(0,5) : "";

  const scDiff = (pid) => {
    let d = 0;
    scores.forEach(h => { const v = h.playerScores?.[pid]; if (v != null) d += v - h.par; });
    return d;
  };
  const diffColor = d => d < -1 ? "#FBBF24" : d === -1 ? "#60A5FA" : d === 0 ? "#CAFF4D" : "#EF4444";

  const primaryPlayer = players[0];
  const primaryDiff = primaryPlayer ? scDiff(primaryPlayer.id) : 0;
  const primaryColor = diffColor(primaryDiff);

  return (
    <div style={{minHeight:"100dvh",background:"#0A0A0B",fontFamily:"Inter,sans-serif",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {/* Top bar */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",letterSpacing:".08em"}}>PITCH&CLUBS</div>
        {isLive ? (
          <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(239,68,68,.15)",color:"#EF4444",border:"1px solid rgba(239,68,68,.3)",borderRadius:3,padding:"2px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:4,height:4,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> EN DIRECTE
          </span>
        ) : (
          <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(85,87,97,.15)",color:"#555761",border:"1px solid #222327",borderRadius:3,padding:"2px 7px"}}>PARTIDA ACABADA</span>
        )}
      </div>

      {/* Header */}
      <div style={{padding:"14px 16px 12px",borderBottom:"1px solid #1A1B1E",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexShrink:0}}>
        <div style={{flex:1,minWidth:0}}>
          {primaryPlayer && (
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:2}}>
              {players.length === 1 ? primaryPlayer.name : game.course_name}
            </div>
          )}
          <div style={{fontSize:11,color:"#787C8A"}}>
            {game.course_name}{isLive ? ` · Forat ${game.current_hole||1}/${game.holes||18}` : ` · ${game.holes||18} forats`}{fmtDate ? ` · ${fmtDate}` : ""}
          </div>
        </div>
        {players.length === 1 && (
          <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:primaryColor,lineHeight:1,flexShrink:0,marginLeft:12}}>
            {primaryDiff>0?`+${primaryDiff}`:primaryDiff===0?"E":primaryDiff}
          </div>
        )}
      </div>

      {/* Players */}
      {players.length > 0 && (
        <div style={{padding:"12px 16px",borderBottom:"1px solid #1A1B1E",flexShrink:0}}>
          {players.map((p, i) => {
            const d = scDiff(p.id);
            const pc = PLAYER_COLORS[i] || "#CAFF4D";
            return (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<players.length-1?"1px solid #111214":"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:pc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                  {p.avatarUrl
                    ? <img src={p.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                    : (p.name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase() || "P"
                  }
                </div>
                <div style={{flex:1,fontWeight:600,fontSize:13}}>{p.name}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:diffColor(d)}}>
                  {d>0?`+${d}`:d===0?"E":d}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scorecard grid */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {scores.length > 0 ? (
          <>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:10}}>Forat a forat</div>
            <div style={{display:"grid",gridTemplateColumns:`40px repeat(${Math.min(players.length||1,4)},1fr)`,gap:4}}>
              <div style={{fontSize:9,color:"#555761",fontWeight:700,textAlign:"center",paddingBottom:4}}>F.</div>
              {players.slice(0,4).map((p,i)=>(
                <div key={p.id} style={{fontSize:9,color:PLAYER_COLORS[i]||"#CAFF4D",fontWeight:700,textAlign:"center",paddingBottom:4}}>
                  {(p.name||"P").split(" ")[0].slice(0,4).toUpperCase()}
                </div>
              ))}
              {scores.map((h, hi) => {
                const isActive = isLive && hi === (game.current_hole || 1) - 1;
                return (
                  <React.Fragment key={hi}>
                    <div style={{fontSize:10,fontWeight:700,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",height:34,color:isActive?"#CAFF4D":"#555761",borderRadius:isActive?5:0,background:isActive?"rgba(202,255,77,.08)":"transparent"}}>{h.hole}</div>
                    {players.slice(0,4).map((p) => (
                      <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"center",height:34,background:isActive?"rgba(202,255,77,.04)":"transparent",borderRadius:isActive?5:0}}>
                        <ScoreSymbol v={h.playerScores?.[p.id]} par={h.par} size={28}/>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"32px 16px",color:"#555761",fontSize:13}}>Sense puntuació encara</div>
        )}
      </div>

      {/* CTA: join as player */}
      {!watchOnly && game.share_mode === "play" && isLive && (
        <div style={{margin:"0 16px 16px",border:"1px solid rgba(202,255,77,.25)",borderRadius:12,padding:"16px",textAlign:"center",flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Uneix-te com a jugador</div>
          <div style={{fontSize:12,color:"#787C8A",marginBottom:12}}>Registra la teva puntuació en temps real</div>
          <button onClick={onJoinClick} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"#CAFF4D",color:"#0A0A0B",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            Uneix-te →
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{padding:"20px 16px",textAlign:"center",borderTop:"1px solid #1A1B1E",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#555761",letterSpacing:".1em",marginBottom:8}}>PITCH&CLUBS</div>
        <a href="/" style={{display:"inline-block",padding:"10px 20px",borderRadius:100,background:"#CAFF4D",color:"#0A0A0B",fontWeight:700,fontSize:12,textDecoration:"none"}}>
          Registra't gratis →
        </a>
      </div>
    </div>
  );
}

/* ─── Guest scorecard (joined player) ─── */
function GuestScorecard({ game, token, joinedPid, onLeave }) {
  const initRef = useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    const initKey = `pc_guest_init_${token}`;
    if (!localStorage.getItem(initKey) && (game.scores || []).length) {
      localStorage.setItem('pc_scores', JSON.stringify(game.scores));
      localStorage.setItem('pc_curHole', String(Math.max(0, (game.current_hole || 1) - 1)));
      localStorage.setItem(initKey, '1');
    }
  }

  const gameData = {
    course: { name: game.course_name, holes: game.holes || 18, par: game.par || 18 },
    players: game.players || [],
    date: game.date,
    gameMode: game.game_mode || 'stableford',
  };

  const handleLiveUpdate = async (scores, curHole) => {
    await supabase.from('games').update({ scores, current_hole: curHole + 1 }).eq('share_token', token);
  };

  return (
    <ScorecardScreen
      gameData={gameData}
      onFinish={onLeave}
      onDelete={onLeave}
      user={null}
      openAuth={() => {}}
      lang="ca"
      liveGameId={game.id}
      onLiveUpdate={handleLiveUpdate}
      liveShareToken={token}
    />
  );
}

/* ─── Join game screen ─── */
function JoinGameScreen({ game, token, onJoin, onBack }) {
  const [addNew, setAddNew]   = useState(false);
  const [name, setName]       = useState("");
  const [joining, setJoining] = useState(false);
  const [err, setErr]         = useState("");

  const handlePickExisting = (player) => {
    onJoin(player.id);
  };

  const handleAddNew = async () => {
    if (!name.trim()) { setErr("Escriu el teu nom"); return; }
    setJoining(true);
    const pid = crypto.randomUUID();
    const newPlayer = { id: pid, name: name.trim(), isMe: false };
    const updatedPlayers = [...(game.players||[]), newPlayer];
    const updatedScores  = (game.scores||[]).map(h => ({
      ...h, playerScores: { ...h.playerScores, [pid]: null }
    }));
    const { error } = await supabase.from("games").update({
      players: updatedPlayers, scores: updatedScores
    }).eq("share_token", token);
    if (error) { setErr("Error: " + error.message); setJoining(false); return; }
    onJoin(pid);
  };

  return (
    <div style={{minHeight:"100dvh",background:"#0A0A0B",fontFamily:"Inter,sans-serif",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:24}}>
      <button onClick={onBack} style={{alignSelf:"flex-start",background:"none",border:"none",color:"#555761",fontSize:13,cursor:"pointer",marginBottom:24,padding:0}}>← Tornar</button>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:".04em",marginBottom:4}}>QUI ETS?</div>
      <div style={{fontSize:12,color:"#787C8A",marginBottom:24}}>{game.course_name} · {game.holes||18} forats</div>

      {!addNew ? (
        <>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#555761",marginBottom:10}}>Selecciona el teu nom</div>
          {(game.players||[]).map((p, i) => (
            <button key={p.id} onClick={() => handlePickExisting(p)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"#1A1B1E",borderRadius:12,border:"1px solid #222327",color:"#fff",cursor:"pointer",marginBottom:8,textAlign:"left"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:PLAYER_COLORS[i]||"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>
                {(p.name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"P"}
              </div>
              <span style={{fontWeight:600,fontSize:15}}>{p.name}</span>
            </button>
          ))}
          <button onClick={() => setAddNew(true)}
            style={{width:"100%",padding:"12px",borderRadius:12,border:"1px dashed #333",background:"transparent",color:"#555761",cursor:"pointer",fontSize:13,marginTop:4}}>
            + No estic a la llista
          </button>
        </>
      ) : (
        <>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#555761",marginBottom:6}}>El teu nom</div>
          <input className="inp" placeholder="Marc Puig" value={name} autoFocus
            onChange={e=>{setName(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handleAddNew()}
            style={{marginBottom:8}}/>
          {err && <div style={{fontSize:12,color:"#EF4444",marginBottom:8}}>⚠ {err}</div>}
          <button className="btn btn-primary" onClick={handleAddNew} disabled={joining} style={{marginBottom:8}}>
            {joining ? "Unint-se…" : "Uneix-te a la partida →"}
          </button>
          <button onClick={() => { setAddNew(false); setErr(""); }}
            style={{background:"none",border:"none",color:"#555761",fontSize:13,cursor:"pointer",padding:"8px 0"}}>
            ← Tornar
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED GAME ROUTE — public /game/:token (no auth required)
═══════════════════════════════════════════════════════════════ */
export default function SharedGameRoute({ token }) {
  const [game, setGame]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [view, setView]         = useState("watch"); // "watch" | "join"
  const [joinedPid, setJoinedPid] = useState(() => localStorage.getItem(`pc_join_${token}`) || null);
  const watchOnly = new URLSearchParams(window.location.search).get("watch") === "1";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("games").select("*").eq("share_token", token).single();
      if (cancelled) return;
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setGame(data);
      setLoading(false);

      const ch = supabase.channel(`sg-${data.id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${data.id}` },
          payload => { if (!cancelled) setGame(payload.new); })
        .subscribe();
      return () => { cancelled = true; supabase.removeChannel(ch); };
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return (
    <div style={{minHeight:"100dvh",background:"#0A0A0B",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:"#CAFF4D",letterSpacing:".08em"}}>PITCH&CLUBS</div>
      <div style={{fontSize:12,color:"#555761"}}>Carregant partida…</div>
    </div>
  );

  if (notFound) return (
    <div style={{minHeight:"100dvh",background:"#0A0A0B",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24,textAlign:"center"}}>
      <div style={{fontSize:48}}>🏌️</div>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:"#CAFF4D"}}>Partida no trobada</div>
      <div style={{fontSize:13,color:"#555761"}}>El link ha caducat o la partida no existeix.</div>
      <a href="/" style={{color:"#CAFF4D",fontSize:13,fontWeight:700,textDecoration:"none"}}>Ves a pitchandclubs.cat →</a>
    </div>
  );

  if (view === "join") return (
    <JoinGameScreen game={game} token={token}
      onJoin={pid => { setJoinedPid(pid); localStorage.setItem(`pc_join_${token}`, pid); setView("watch"); }}
      onBack={() => setView("watch")}/>
  );

  if (joinedPid) return (
    <GuestScorecard game={game} token={token} joinedPid={joinedPid} onLeave={() => {
      localStorage.removeItem(`pc_join_${token}`);
      localStorage.removeItem(`pc_guest_init_${token}`);
      localStorage.removeItem('pc_scores');
      localStorage.removeItem('pc_curHole');
      setJoinedPid(null);
    }}/>
  );

  return <SharedViewer game={game} token={token} watchOnly={watchOnly} onJoinClick={() => setView("join")}/>;
}
