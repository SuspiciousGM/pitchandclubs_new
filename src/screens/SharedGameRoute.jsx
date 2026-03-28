import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.js';
import { PLAYER_COLORS } from '../data/constants.js';
import { ScoreSymbol } from '../components/ScoreSymbol.jsx';
import ScorecardScreen from './ScorecardScreen.jsx';

/* ─── Shared game: standalone viewer ─── */
function SharedViewer({ game, token, watchOnly, onJoinClick }) {
  const [tab, setTab]           = useState("rank"); // "rank" | "card"
  const [expandedPid, setExpandedPid] = useState(null);

  const isLive  = game.is_live;
  const players = game.players || [];
  const scores  = game.scores  || [];
  const fmtDate = game.date ? game.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').slice(0,5) : "";
  const gameCode = token; // 6-char code

  const playerStats = (pid) => {
    let strokes = 0, par = 0, holesPlayed = 0;
    scores.forEach(h => {
      const v = h.playerScores?.[pid];
      if (v != null) { strokes += v; par += h.par; holesPlayed++; }
    });
    return { strokes, par, diff: strokes - par, holesPlayed };
  };
  const diffColor = d => d < -1 ? "#FBBF24" : d === -1 ? "#60A5FA" : d === 0 ? "#CAFF4D" : d > 0 ? "#EF4444" : "#fff";
  const diffLabel = d => d > 0 ? `+${d}` : d === 0 ? "E" : String(d);

  // Sort players by diff ascending (best first)
  const ranked = [...players]
    .map((p, origIdx) => ({ ...p, origIdx, stats: playerStats(p.id) }))
    .sort((a, b) => a.stats.diff - b.stats.diff);

  return (
    <div style={{minHeight:"100dvh",background:"#0A0A0B",fontFamily:"Inter,sans-serif",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {/* Top bar */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",letterSpacing:".08em"}}>PITCH&CLUBS</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Game code chip */}
          <span style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:".15em",color:"#fff",background:"#1A1B1E",border:"1px solid #2a2a35",borderRadius:6,padding:"3px 8px"}}>{gameCode}</span>
          {isLive ? (
            <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(239,68,68,.15)",color:"#EF4444",border:"1px solid rgba(239,68,68,.3)",borderRadius:3,padding:"2px 7px",display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:4,height:4,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> EN DIRECTE
            </span>
          ) : (
            <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(85,87,97,.15)",color:"#555761",border:"1px solid #222327",borderRadius:3,padding:"2px 7px"}}>ACABADA</span>
          )}
        </div>
      </div>

      {/* Course header */}
      <div style={{padding:"14px 16px 12px",borderBottom:"1px solid #1A1B1E",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:".04em",lineHeight:1,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {game.course_name}
        </div>
        <div style={{fontSize:11,color:"#787C8A"}}>
          {isLive ? `Forat ${game.current_hole||1}/${game.holes||18} en joc` : `${game.holes||18} forats · Partida acabada`}
          {fmtDate ? ` · ${fmtDate}` : ""}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #1A1B1E",flexShrink:0}}>
        {[["rank","CLASSIFICACIÓ"],["card","TARGETA"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:"11px 0",background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:".08em",color:tab===id?"#fff":"#555761",borderBottom:tab===id?"2px solid #CAFF4D":"2px solid transparent",transition:"color .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{flex:1,overflowY:"auto"}}>

        {/* ── CLASSIFICACIÓ ── */}
        {tab === "rank" && (
          <div style={{padding:"12px 16px"}}>
            {ranked.length === 0 && (
              <div style={{textAlign:"center",padding:"40px 0",color:"#555761",fontSize:13}}>Sense jugadors</div>
            )}
            {ranked.map((p, rankIdx) => {
              const { strokes, diff, holesPlayed } = p.stats;
              const color = PLAYER_COLORS[p.origIdx] || "#CAFF4D";
              const isExpanded = expandedPid === p.id;
              const playerHoles = scores.filter(h => h.playerScores?.[p.id] != null);
              return (
                <div key={p.id} style={{marginBottom:10,borderRadius:12,border:"1px solid #1A1B1E",overflow:"hidden"}}>
                  {/* Player row */}
                  <button onClick={()=>setExpandedPid(isExpanded ? null : p.id)}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px",background:"#111214",border:"none",cursor:"pointer",textAlign:"left"}}>
                    {/* Rank */}
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color: rankIdx===0?"#CAFF4D":"#555761",width:22,flexShrink:0,lineHeight:1}}>{rankIdx+1}</div>
                    {/* Avatar */}
                    <div style={{width:40,height:40,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                      {p.avatarUrl
                        ? <img src={p.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                        : (p.name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"P"
                      }
                    </div>
                    {/* Name + holes */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      <div style={{fontSize:11,color:"#555761",marginTop:1}}>{holesPlayed} de {game.holes||18} forats</div>
                    </div>
                    {/* Score */}
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:28,lineHeight:1,color:"#fff"}}>{strokes||"—"}</div>
                      {holesPlayed > 0 && <div style={{fontSize:11,fontWeight:700,color:diffColor(diff)}}>{diffLabel(diff)}</div>}
                    </div>
                  </button>

                  {/* Expanded hole grid */}
                  {isExpanded && playerHoles.length > 0 && (
                    <div style={{background:"#0D0D0F",padding:"10px 14px 14px",borderTop:"1px solid #1A1B1E"}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {scores.map((h, hi) => {
                          const v = h.playerScores?.[p.id];
                          const d = v != null ? v - h.par : null;
                          const isActive = isLive && hi === (game.current_hole||1)-1;
                          return (
                            <div key={hi} style={{display:"flex",flexDirection:"column",alignItems:"center",width:30}}>
                              <div style={{fontSize:8,color:isActive?"#CAFF4D":"#555761",fontWeight:700,marginBottom:2}}>{h.hole}</div>
                              <div style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <ScoreSymbol v={v} par={h.par} size={26}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"1px solid #1A1B1E"}}>
                        <div style={{fontSize:11,color:"#555761"}}>{holesPlayed} forats jugats</div>
                        <div style={{fontSize:11,fontWeight:700,color:diffColor(diff)}}>{strokes} cops · {diffLabel(diff)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TARGETA ── */}
        {tab === "card" && (
          <div style={{padding:"12px 16px"}}>
            {scores.length > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:`32px repeat(${Math.min(players.length||1,4)},1fr)`,gap:4}}>
                <div style={{fontSize:9,color:"#555761",fontWeight:700,textAlign:"center",paddingBottom:6}}>F.</div>
                {players.slice(0,4).map((p,i)=>(
                  <div key={p.id} style={{fontSize:9,color:PLAYER_COLORS[i]||"#CAFF4D",fontWeight:700,textAlign:"center",paddingBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {(p.name||"P").split(" ")[0].slice(0,5).toUpperCase()}
                  </div>
                ))}
                {scores.map((h, hi) => {
                  const isActive = isLive && hi === (game.current_hole||1)-1;
                  return (
                    <React.Fragment key={hi}>
                      <div style={{fontSize:10,fontWeight:700,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",height:32,color:isActive?"#CAFF4D":"#555761",borderRadius:isActive?5:0,background:isActive?"rgba(202,255,77,.08)":"transparent"}}>{h.hole}</div>
                      {players.slice(0,4).map((p) => (
                        <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"center",height:32,background:isActive?"rgba(202,255,77,.04)":"transparent",borderRadius:isActive?5:0}}>
                          <ScoreSymbol v={h.playerScores?.[p.id]} par={h.par} size={26}/>
                        </div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"40px 0",color:"#555761",fontSize:13}}>Sense puntuació encara</div>
            )}
          </div>
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

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
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

  // Mark joined player as isMe so ScorecardScreen focuses them
  const playersWithMe = (game.players || []).map(p => ({ ...p, isMe: p.id === joinedPid }));

  const gameData = {
    course: { name: game.course_name, holes: game.holes || 18, par: game.par || 18 },
    players: playersWithMe,
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
