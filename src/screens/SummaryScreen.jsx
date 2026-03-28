import React, { useState } from 'react';
import { Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { t } from '../data/i18n.js';
import { getTier, calcGranada } from '../utils/helpers.js';
import { TIERS, PLAYER_COLORS } from '../data/constants.js';
import { calcPCPoints } from '../utils/helpers.js';

/* ─── ShareCard (off-screen, 1080×1920 for Instagram Stories) ─── */
export function ShareCard({ game, cardRef, photo }) {
  const me = game?.players?.find(p => p.isMe);
  const allPlayers = game?.players || [];
  const par = game?.scores?.reduce((a,h)=>a+h.par,0) ?? 0;
  const holeCount = game?.scores?.length ?? 0;
  const fmtD = d => d > 0 ? `+${d}` : d === 0 ? "E" : `${d}`;
  const scoreBg = (d) => d == null ? "#222" : d <= -2 ? "rgba(251,191,36,.4)" : d === -1 ? "rgba(96,165,250,.35)" : d === 0 ? "rgba(202,255,77,.35)" : d === 1 ? "#1e1e26" : "rgba(239,68,68,.3)";
  const scoreCol = (d) => d == null ? "#333" : d <= -2 ? "#FBBF24" : d === -1 ? "#60A5FA" : d === 0 ? "#CAFF4D" : d === 1 ? "#787C8A" : "#EF4444";
  return (
    <div ref={cardRef} style={{
      position:"fixed", top:"-9999px", left:"-9999px",
      width:1080, height:1920, background:"#080909",
      fontFamily:"Inter, sans-serif", overflow:"hidden",
    }}>
      {/* Hero background */}
      <img src="/hero-bg.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.18}}/>
      {/* Round photo overlay */}
      {photo && <img src={photo} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.14}}/>}
      {/* gradient */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,9,9,.4) 0%,rgba(8,9,9,.65) 40%,rgba(8,9,9,.97) 70%,#080909 100%)"}}/>
      {/* subtle grid lines */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(202,255,77,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(202,255,77,.03) 1px,transparent 1px)",backgroundSize:"80px 80px"}}/>

      <div style={{position:"relative",zIndex:1,padding:"100px 90px",height:"100%",display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"auto"}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:52,letterSpacing:".06em",color:"#CAFF4D",lineHeight:1}}>PITCH<span style={{color:"#fff"}}>&</span>CLUBS</div>
            <div style={{fontSize:26,color:"rgba(255,255,255,.35)",marginTop:6,letterSpacing:".04em"}}>pitchandclubs.cat</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:26,color:"rgba(255,255,255,.4)",letterSpacing:".08em",textTransform:"uppercase"}}>{game?.date}</div>
          </div>
        </div>

        {/* Course name */}
        <div style={{marginTop:120}}>
          <div style={{fontSize:26,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(202,255,77,.7)",marginBottom:16}}>PARTIDA REGISTRADA</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:88,letterSpacing:".02em",lineHeight:1,color:"#fff"}}>{game?.course}</div>
          <div style={{fontSize:32,color:"rgba(255,255,255,.35)",marginTop:12}}>{holeCount} forats · Par {par}</div>
        </div>

        {/* Players scores */}
        <div style={{marginTop:80,display:"flex",flexDirection:"column",gap:24}}>
          {allPlayers.map((p, i) => {
            const diff = p.diff ?? 0;
            const diffColor = diff < 0 ? "#FBBF24" : diff === 0 ? "#CAFF4D" : "rgba(255,255,255,.6)";
            const initials = (p.name||"?").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
            const colors = ["#CAFF4D","#60A5FA","#A78BFA","#F472B6"];
            return (
              <div key={p.id||i} style={{display:"flex",alignItems:"center",gap:28,padding:"28px 36px",background:"rgba(255,255,255,.04)",borderRadius:20,border:`1px solid rgba(255,255,255,.07)`,borderLeft:`4px solid ${colors[i%4]}`}}>
                <div style={{width:72,height:72,borderRadius:"50%",background:`${colors[i%4]}22`,border:`2px solid ${colors[i%4]}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:colors[i%4],flexShrink:0}}>{initials}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:40,color:"#fff",lineHeight:1}}>{p.name}</div>
                  <div style={{fontSize:26,color:"rgba(255,255,255,.4)",marginTop:6}}>{p.score} cops</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:80,color:diffColor,lineHeight:1}}>{fmtD(diff)}</div>
              </div>
            );
          })}
        </div>

        {/* Hole grids — one per player */}
        {allPlayers.length > 0 && (
          <div style={{marginTop:60,display:"flex",flexDirection:"column",gap:36}}>
            {allPlayers.map((p, pi) => {
              const colors = ["#CAFF4D","#60A5FA","#A78BFA","#F472B6"];
              return (
                <div key={p.id||pi}>
                  <div style={{fontSize:22,color:colors[pi%4],letterSpacing:".1em",textTransform:"uppercase",marginBottom:16,fontWeight:700}}>TARGETA · {p.name}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:8}}>
                    {game?.scores?.map((h,i)=>{
                      const s = h.playerScores[p.id];
                      const d = s != null ? s - h.par : null;
                      return (
                        <div key={i} style={{height:72,borderRadius:10,background:scoreBg(d),display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,.06)"}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:38,color:scoreCol(d)}}>{s ?? "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:"auto",paddingTop:60,borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:26,color:"rgba(255,255,255,.3)"}}>Registra les teves partides</div>
          <div style={{fontSize:26,fontWeight:700,color:"rgba(202,255,77,.8)",letterSpacing:".04em"}}>pitchandclubs.cat</div>
        </div>
      </div>
    </div>
  );
}

export default function SummaryScreen({ game, userPts, prevPts, setScreen, openAuth, user, lang, shareCardRef, roundPhoto }) {
  const tl = (k,v={}) => t(lang,k,v);
  const me = game.players.find(p => p.isMe);
  const [sharing, setSharing] = useState(false);
  const [shareSheet, setShareSheet] = useState(false);
  const [shareBlob, setShareBlob] = useState(null);

  const captureCard = async () => {
    if (!shareCardRef?.current) return null;
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 1, useCORS: true, backgroundColor: null });
      return canvas;
    } catch(e) { console.error("html2canvas:", e); return null; }
  };

  const handleShare = async () => {
    setSharing(true);
    const canvas = await captureCard();
    if (!canvas) { setSharing(false); return; }
    canvas.toBlob(async (blob) => {
      if (!blob) { setSharing(false); return; }
      const file = new File([blob], "pitchandclubs-round.png", { type: "image/png" });
      const gameUrl = game.shareToken
        ? `https://pitchandclubs.cat/g/${game.shareToken}?watch=1`
        : "https://pitchandclubs.cat";
      const shareText = `He jugat a ${game.course} — veure la partida:`;
      // 1. Try native share with image file (iOS/Android opens full share sheet)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "La meva partida a Pitch & Clubs", text: shareText });
          setSharing(false); return;
        } catch(e) { if (e.name === "AbortError") { setSharing(false); return; } }
      }
      // 2. Try URL-only share (most modern browsers)
      if (navigator.share) {
        try {
          await navigator.share({ title: "La meva partida a Pitch & Clubs", text: shareText, url: gameUrl });
          setSharing(false); return;
        } catch(e) { if (e.name === "AbortError") { setSharing(false); return; } }
      }
      // 3. Fallback: show bottom sheet with options
      setShareBlob(blob);
      setShareSheet(true);
      setSharing(false);
    }, "image/png");
  };
  const diff = me?.diff ?? 0;
  const tierNow = getTier(userPts);
  const tierPrev = getTier(prevPts);
  const levelUp = tierNow.id !== tierPrev.id;

  return (
    <div className="page-scroll ani-up">
      {/* Hero */}
      <div style={{textAlign:"center",padding:"8px 0 16px"}}>
        <div style={{fontSize:56,marginBottom:8}}>{diff<=-2?"🔥":diff<0?"🎉":diff===0?"✅":"👊"}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:".04em",marginBottom:4}}>Partida finalitzada</div>
        <div style={{fontSize:13,color:"#555761",fontWeight:400}}>{game.course} · {game.date}</div>
      </div>

      {/* Fraud disclaimer */}
      {game.fraudFlags?.length > 0 && (() => {
        const msgs = game.fraudFlags.map(f => {
          if (f.code === 'SPEED') return lang==="en"?`Game too fast (${f.detail}) — minimum 40 min for 18 holes`:lang==="es"?`Partida demasiado rápida (${f.detail}) — mínimo 40 min para 18 hoyos`:`Partida massa ràpida (${f.detail}) — mínim 40 min per 18 forats`;
          if (f.code === 'SCORE') return lang==="en"?`Unusual score (${f.detail})`:lang==="es"?`Puntuación inusual (${f.detail})`:`Puntuació inusual (${f.detail})`;
          if (f.code === 'SOLO_DAY') return lang==="en"?"Solo play limit reached (1/day)":lang==="es"?"Límite de partida solitaria alcanzado (1/día)":"Límit de partida en solitari assolit (1/dia)";
          if (f.code === 'SOLO_WEEK') return lang==="en"?"Solo play limit reached (2/week)":lang==="es"?"Límite semanal alcanzado (2/semana)":"Límit setmanal assolit (2/setmana)";
          return f.code;
        });
        return (
          <div style={{marginBottom:14,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.3)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{fontSize:16}}>⚠️</div>
              <div style={{fontSize:12,fontWeight:700,color:"#EF4444"}}>{lang==="en"?"Points not counted":lang==="es"?"Puntos no contabilizados":"Punts no comptabilitzats"}</div>
            </div>
            {msgs.map((m,i) => <div key={i} style={{fontSize:11,color:"#9CA3AF",marginBottom:3,paddingLeft:24}}>· {m}</div>)}
            <div style={{fontSize:10,color:"#555761",marginTop:8,fontStyle:"italic",paddingLeft:24}}>{lang==="en"?"The game is saved but no ranking points are awarded.":lang==="es"?"La partida se guarda pero no se otorgan puntos de ranking.":"La partida es guarda però no s'atorguen punts de rànquing."}</div>
          </div>
        );
      })()}

      {/* Share — prominent, right after hero */}
      <button onClick={handleShare} disabled={sharing}
        style={{width:"100%",marginBottom:20,padding:"13px",borderRadius:12,border:"none",background:"#CAFF4D",color:"#0A0A0B",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:sharing?.6:1}}>
        <Share2 size={15}/>{sharing ? "Generant..." : "Compartir Partida"}
      </button>

      {/* Parelles team result */}
      {game.mode === "parelles" && game.players.some(p=>p.teamId) && (() => {
        const teamA = game.players.filter(p=>p.teamId==="A");
        const teamB = game.players.filter(p=>p.teamId==="B");
        const bestBallTotal = (teamPlayers) => game.scores.reduce((sum,h) => {
          const scores = teamPlayers.map(p=>h.playerScores?.[p.id]).filter(s=>s!=null);
          return sum + (scores.length ? Math.min(...scores) - h.par : 0);
        }, 0);
        const totA = bestBallTotal(teamA);
        const totB = bestBallTotal(teamB);
        const winnerA = totA < totB, winnerB = totB < totA;
        const fmtD = d => d > 0 ? `+${d}` : d === 0 ? "E" : `${d}`;
        return (
          <div style={{marginBottom:14}}>
            <div className="sec-title">{lang==="en"?"TEAM RESULT":lang==="es"?"RESULTADO POR EQUIPOS":"RESULTAT POR EQUIPS"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
              <div className="card" style={{textAlign:"center",padding:"16px 10px",borderColor:winnerA?"rgba(202,255,77,.5)":"#222327",background:winnerA?"rgba(202,255,77,.06)":"#1A1B1E"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:"#CAFF4D",marginBottom:4}}>EQUIP A</div>
                {teamA.map(p=><div key={p.id} style={{fontSize:10,color:"#787C8A"}}>{p.name}</div>)}
                <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:totA<0?"#FBBF24":totA===0?"#CAFF4D":"#fff",lineHeight:1,marginTop:6}}>{fmtD(totA)}</div>
                {winnerA && <div style={{fontSize:10,fontWeight:700,color:"#CAFF4D",marginTop:4}}>🏆 Guanyadors</div>}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:"#555761"}}>VS</div>
              <div className="card" style={{textAlign:"center",padding:"16px 10px",borderColor:winnerB?"rgba(96,165,250,.5)":"#222327",background:winnerB?"rgba(96,165,250,.06)":"#1A1B1E"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:"#60A5FA",marginBottom:4}}>EQUIP B</div>
                {teamB.map(p=><div key={p.id} style={{fontSize:10,color:"#787C8A"}}>{p.name}</div>)}
                <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:totB<0?"#FBBF24":totB===0?"#CAFF4D":"#fff",lineHeight:1,marginTop:6}}>{fmtD(totB)}</div>
                {winnerB && <div style={{fontSize:10,fontWeight:700,color:"#60A5FA",marginTop:4}}>🏆 Guanyadors</div>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Classificació multi */}
      {game.players.length > 1 && (
        <div style={{marginBottom:10}}>
          <div className="sec-title">{tl("classification")}</div>
          {[...game.players].sort((a,b)=>a.score-b.score).map((p,rank)=>{
            const pi = game.players.findIndex(x=>x.id===p.id);
            return (
              <div key={p.id} className="card" style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                <div style={{fontSize:22,width:28,textAlign:"center"}}>{["🥇","🥈","🥉"][rank]||`#${rank+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:PLAYER_COLORS[pi]}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#555761",fontWeight:400}}>{p.score} cops · {p.points} pts P&C</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:p.diff<0?"#FBBF24":p.diff===0?"#CAFF4D":"#fff"}}>
                  {p.diff>0?`+${p.diff}`:p.diff}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Granada final result */}
      {game.mode === 'granada' && game.granadaConfig && (() => {
        const result = calcGranada(game.scores, game.players, game.granadaConfig);
        const sorted = [...game.players].sort((a,b)=>(result.balances[b.id]||0)-(result.balances[a.id]||0));
        const medals = ["🥇","🥈","🥉"];
        const { doubleHoles=[], granadaHole=null, betBase=1 } = game.granadaConfig;
        return (
          <div style={{marginBottom:14}}>
            <div className="sec-title">💣 GRANADA — RESULTAT FINAL</div>
            <div className="card" style={{padding:"16px",borderColor:"rgba(239,68,68,.3)",background:"rgba(239,68,68,.04)"}}>
              {sorted.map((p,i)=>{
                const bal = result.balances[p.id] || 0;
                const pi = game.players.findIndex(x=>x.id===p.id);
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<sorted.length-1?"1px solid #1a1a1f":"none"}}>
                    <div style={{fontSize:20,width:28,textAlign:"center"}}>{medals[i]||`#${i+1}`}</div>
                    <div style={{flex:1,fontWeight:700,fontSize:14,color:PLAYER_COLORS[pi]||"#fff"}}>{p.name}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:bal>=0?"#CAFF4D":"#EF4444",lineHeight:1}}>
                      {bal>=0?`+${bal.toFixed(2)}€`:`${bal.toFixed(2)}€`}
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #1a1a1f",fontSize:10,color:"#555761"}}>
                {doubleHoles.length>0&&<span>⚡ {doubleHoles.sort((a,b)=>a-b).map(h=>`F${h}`).join(", ")} · </span>}
                {granadaHole&&<span>💣 F{granadaHole} · </span>}
                <span>Aposta base: {betBase}€/forat</span>
              </div>
            </div>
          </div>
        );
      })()}

      {me && (
        <>
          {/* Score */}
          <div className="card" style={{padding:"22px",textAlign:"center",marginBottom:10,
            borderColor:diff<0?"rgba(251,191,36,.4)":diff===0?"rgba(202,255,77,.3)":"#222327",
            background:diff<0?"rgba(251,191,36,.06)":diff===0?"rgba(202,255,77,.04)":"#1A1B1E"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:64,lineHeight:1,
              color:diff<0?"#FBBF24":diff===0?"#CAFF4D":"#FFFFFF"}}>
              {diff>0?`+${diff}`:diff}
            </div>
            <div style={{fontSize:12,color:"#555761",marginTop:4}}>Score {me.score} · Par {game.scores.reduce((a,h)=>a+h.par,0)}</div>
          </div>

          {/* Punts */}
          <div className="card card-lime" style={{padding:"16px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:"#555761",marginBottom:2,fontWeight:500}}>{tl("pts_earned")}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:38,color:"#CAFF4D",lineHeight:1}}>+{me.points}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#555761",marginBottom:2,fontWeight:500}}>Total acumulat</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26}}>{userPts}</div>
            </div>
          </div>
        </>
      )}

      {/* Level up */}
      {levelUp && (
        <div className="card ani-pop" style={{background:"rgba(202,255,77,.08)",borderColor:"rgba(202,255,77,.4)",padding:"18px",textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:40}}>{tierNow.emoji}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",letterSpacing:".04em",marginTop:6}}>LEVEL UP! → {tierNow.name}</div>
        </div>
      )}

      {/* Guest save CTA */}
      {!user && (
        <div className="card card-lime" style={{padding:"16px",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:5}}>💾 Vols guardar aquesta partida?</div>
          <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,marginBottom:12,fontWeight:400}}>Crea un compte gratuït per guardar l'historial i acumular <strong style={{color:"#CAFF4D"}}>{me?.points||0} punts</strong> al rànquing.</div>
          <button className="btn btn-primary" style={{fontSize:13}} onClick={openAuth}>Crea un compte — és gratis →</button>
        </div>
      )}


      {/* Hole breakdown */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">{tl("hole_summary")}</div>
        <div style={{overflowX:"auto"}}>
          <table className="sc-table">
            <thead>
              <tr>
                <th style={{textAlign:"left"}}>F.</th>
                <th>Par</th>
                {game.players.map((p,i)=><th key={p.id} style={{color:PLAYER_COLORS[i]}}>{p.name.split(" ")[0]}</th>)}
                {game.players.length===1 && <th style={{color:"#CAFF4D"}}>Pts</th>}
              </tr>
            </thead>
            <tbody>
              {game.scores.map((h,i)=>{
                const myP = game.players.find(p=>p.isMe);
                const myS = myP ? h.playerScores[myP.id] : null;
                return (
                  <tr key={i}>
                    <td style={{textAlign:"left",fontWeight:700}}>{h.hole}</td>
                    <td style={{color:"#555761"}}>{h.par}</td>
                    {game.players.map((p,pi)=>{
                      const s = h.playerScores[p.id]??h.par;
                      const d = s - h.par;
                      const c = d<0?"#FBBF24":d===0?"#CAFF4D":d===1?"#FFFFFF":"#EF4444";
                      return <td key={p.id} style={{color:c,fontWeight:700}}>{s}</td>;
                    })}
                    {game.players.length===1 && myS!==null && <td style={{color:"#CAFF4D",fontWeight:700}}>+{calcPCPoints(myS,h.par)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked players confirmation */}
      {(() => {
        const linked = game.players.filter(p => !p.isMe && p.isRegistered && p.userId);
        const guests = game.players.filter(p => !p.isMe && !p.isRegistered);
        if (!linked.length && !guests.length) return null;
        return (
          <div style={{background:"rgba(202,255,77,.04)",border:"1px solid rgba(202,255,77,.15)",borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:12,lineHeight:1.6}}>
            {linked.length > 0 && (
              <div style={{color:"#787C8A"}}>
                <span style={{color:"#CAFF4D",fontWeight:700}}>✓ Partida guardada al perfil de: </span>
                {linked.map(p=>p.name).join(", ")}
              </div>
            )}
            {guests.length > 0 && (
              <div style={{color:"#555761",marginTop:linked.length?4:0}}>
                Jugadors sense compte: {guests.map(p=>p.name).join(", ")}
              </div>
            )}
          </div>
        );
      })()}

      {/* Share bottom sheet (fallback for non-native-share browsers) */}
      {shareSheet && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={()=>setShareSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)"}}/>
          <div style={{position:"relative",background:"#1A1B1E",borderRadius:"20px 20px 0 0",padding:"20px 20px 40px"}}>
            <div style={{width:40,height:4,background:"#333",borderRadius:2,margin:"0 auto 18px"}}/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:".12em",color:"#555761",marginBottom:14,textAlign:"center"}}>COMPARTIR</div>
            {/* WhatsApp */}
            <button onClick={()=>{
              window.open(`https://wa.me/?text=${encodeURIComponent("La meva partida a Pitch & Clubs — https://pitchandclubs.cat")}`, "_blank");
            }} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"#222327",borderRadius:12,border:"none",color:"#fff",cursor:"pointer",marginBottom:8,fontSize:14,fontWeight:600}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,flexShrink:0}}>W</div>
              WhatsApp
            </button>
            {/* Copy link */}
            <button onClick={async()=>{
              await navigator.clipboard.writeText("https://pitchandclubs.cat");
              setShareSheet(false);
            }} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"#222327",borderRadius:12,border:"none",color:"#fff",cursor:"pointer",marginBottom:8,fontSize:14,fontWeight:600}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#333",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🔗</div>
              Copiar link
            </button>
            {/* Download image */}
            <button onClick={()=>{
              if (!shareBlob) return;
              const url = URL.createObjectURL(shareBlob);
              const a = document.createElement("a"); a.href = url; a.download = "pitchandclubs-round.png"; a.click();
              URL.revokeObjectURL(url);
              setShareSheet(false);
            }} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"#222327",borderRadius:12,border:"none",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#333",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Download size={16}/></div>
              Descarregar imatge
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{marginBottom:8,fontSize:15}} onClick={()=>setScreen("home")}>
        Tornar a l'inici
      </button>
      <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setScreen("game-setup")}>
        Nova partida
      </button>
    </div>
  );
}
