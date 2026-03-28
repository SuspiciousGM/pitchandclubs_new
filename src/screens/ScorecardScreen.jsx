import React, { useState, useEffect, useRef } from 'react';
import { Share2, Flag, X, Users, ChevronRight, Check, Play } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { PLAYER_COLORS } from '../data/constants.js';
import { ScoreSymbol } from '../components/ScoreSymbol.jsx';
import { calcGranada } from '../utils/helpers.js';

/* ─── NUMBER PICKER ───────────────────────────────────────── */
function NumberPicker({ value, par, onChange, lang }) {
  const display = value ?? par;
  const scoreColor = (v) => {
    const d = v - par;
    if (d <= -2) return '#FBBF24';
    if (d === -1) return '#60A5FA';
    if (d === 0)  return '#CAFF4D';
    if (d === 1)  return '#FFFFFF';
    return '#EF4444';
  };
  const scoreLabel = (v) => {
    const d = v - par;
    if (d <= -2) return 'HiO 🎯';
    if (d === -1) return 'Birdie';
    if (d === 0)  return 'Par';
    if (d === 1)  return 'Bogey';
    if (d === 2)  return 'D.Bogey';
    return `+${d}`;
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,width:'100%',maxWidth:320}}>
      {/* Big number + label */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:80,lineHeight:1,
          color:value===null?'#555761':scoreColor(display),transition:'color .15s',
          textShadow:value===null?'none':`0 0 40px ${scoreColor(display)}30`}}>
          {value===null ? '—' : display}
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:'.08em',
          color:value===null?'#555761':scoreColor(display),transition:'color .15s'}}>
          {value===null ? (lang==='en'?'No score':lang==='es'?'Sin score':'Sense score') : scoreLabel(display)}
        </div>
      </div>

      {/* Number grid 1–9 + "-" (5×2) */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,width:'100%'}}>
        {[1,2,3,4,5,6,7,8,9].map(v => {
          const active = value === v;
          const col = scoreColor(v);
          return (
            <div key={v} onClick={()=>onChange(v)} style={{
              height:52,borderRadius:10,
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',
              border: active ? `2px solid ${col}` : '1px solid #222327',
              background: active ? `${col}18` : '#1A1B1E',
              transition:'all .1s',
            }}>
              <span style={{fontFamily:"'Bebas Neue'",fontSize:26,
                color: active ? col : '#555761',
                transition:'color .1s'}}>
                {v}
              </span>
            </div>
          );
        })}
        {/* "-" = null score (hole skipped) */}
        <div onClick={()=>onChange(null)} style={{
          height:52,borderRadius:10,
          display:'flex',alignItems:'center',justifyContent:'center',
          cursor:'pointer',
          border: value===null ? '2px solid #555761' : '1px solid #222327',
          background: value===null ? 'rgba(85,87,97,.15)' : '#1A1B1E',
          transition:'all .1s',
        }}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:26,
            color: value===null ? '#fff' : '#555761',
            transition:'color .1s'}}>—</span>
        </div>
      </div>

      <div style={{fontSize:9,color:'#555761',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>
        {lang==='en'?'SHOTS':lang==='es'?'GOLPES':'COPS'} · Par {par}
      </div>
    </div>
  );
}

export default function ScorecardScreen({ gameData, onFinish, onDelete, user, openAuth, lang, liveGameId, onLiveUpdate, onPhotoCapture, liveShareToken, onCreateLive }) {
  const tl = (k,v={}) => t(lang,k,v);
  const { course, players } = gameData;
  const pph = Math.round(course.par / course.holes);

  /* ── helpers ── */
  const scDiffColor = d => d==null?'#3a3a42':d<=-2?'#FBBF24':d===-1?'#60A5FA':d===0?'#CAFF4D':d===1?'#d0d0d0':d===2?'#EF4444':'#9f1414';
  const scFmtTotal  = d => d==null?'—':d>0?`+${d}`:d===0?'E':`${d}`;
  const scHolePts   = d => d==null?0:d<=-2?25:d===-1?12:d===0?6:d===1?2:0;
  const scCalcPts   = (sc,pid) => sc.reduce((s,h)=>{ const v=h.playerScores[pid]; return s+(v!=null?scHolePts(v-h.par):0); },0);
  const scPlayerTot = (sc,pid) => { let t=0,c=0; sc.forEach(h=>{const v=h.playerScores[pid];if(v!=null){t+=v-h.par;c++;}}); return c?t:null; };
  const scDiffLabel = d => d==null?'—':d<=-2?'Hole in One':d===-1?'Birdie':d===0?'Par':d===1?'Bogey':d===2?'Doble':'+'+d;
  const scRowLabel  = (n,par) => { const d=n-par; const lbl=d<=-2?'HiO':d===-1?'Birdie':d===0?'Par':d===1?'Bogey':d===2?'Doble':'Triple'; const sign=d===0?'':d>0?`+${d}`:`${d}`; return sign?`${sign} ${lbl}`:lbl; };
  const scDiffBg    = d => d==null?'transparent':d<=-2?'rgba(251,191,36,.14)':d===-1?'rgba(96,165,250,.13)':d===0?'rgba(202,255,77,.10)':d===1?'rgba(255,255,255,.05)':d===2?'rgba(239,68,68,.13)':'rgba(127,29,29,.32)';

  /* ── State ── */
  const [scores, setScores] = useState(() => {
    try { const s=localStorage.getItem('pc_scores'); if(s) return JSON.parse(s); } catch {}
    return Array.from({length:course.holes},(_,i)=>({
      hole:i+1, par:pph,
      playerScores:Object.fromEntries(players.map(p=>[p.id,null])),
    }));
  });
  const [curHole,    setCurHole]    = useState(() => { const s=localStorage.getItem('pc_curHole'); return s?parseInt(s):0; });
  const [activePid,  setActivePid]  = useState(players[0].id);
  const [showFull,        setShowFull]        = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showCodePanel,   setShowCodePanel]   = useState(false);
  const [codeCopied,      setCodeCopied]      = useState(false);
  const gameCode = liveShareToken || null; // 6-char code e.g. JAY7MJ
  const [flashInfo,  setFlashInfo]  = useState(null);
  const [liveRemote, setLiveRemote] = useState(null); // remote game state (joined players + their scores)
  const stripRef = useRef(null);

  // Granada state
  const granadaConfig = gameData.granadaConfig || null;
  const isGranada = gameData.gameMode === 'granada';
  const [granadaDoubles, setGranadaDoubles] = useState(granadaConfig?.doubleHoles || []);
  const [granadaHoleNum, setGranadaHoleNum] = useState(granadaConfig?.granadaHole || null);

  // Subscribe to Realtime updates on the live game row (to pick up joined players)
  useEffect(() => {
    if (!liveGameId) return;
    const ch = supabase.channel(`sc-${liveGameId}`)
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'games', filter:`id=eq.${liveGameId}` },
        payload => setLiveRemote(payload.new))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [liveGameId]);

  // allPlayers: original players + any that joined remotely
  const allPlayers = liveRemote
    ? [...players, ...(liveRemote.players||[]).filter(rp => !players.find(p => p.id === rp.id))]
    : players;

  // mergedScores: host's local scores + remote scores from ALL non-me players (existing or newly joined)
  const mergedScores = scores.map((h, i) => {
    if (!liveRemote?.scores?.[i]) return h;
    const remotePs = liveRemote.scores[i].playerScores || {};
    const ps = { ...h.playerScores };
    // Merge remote scores for existing non-me players (they're scoring from their own device)
    players.forEach(p => { if (!p.isMe && remotePs[p.id] != null) ps[p.id] = remotePs[p.id]; });
    // Also add brand-new players who joined remotely
    (liveRemote.players||[]).forEach(rp => {
      if (!players.find(p => p.id === rp.id)) ps[rp.id] = remotePs[rp.id] ?? null;
    });
    return { ...h, playerScores: ps };
  });

  const effectiveGranadaConfig = isGranada ? { ...(granadaConfig||{}), doubleHoles: granadaDoubles, granadaHole: granadaHoleNum } : null;
  const granadaResult = isGranada ? calcGranada(mergedScores, allPlayers, effectiveGranadaConfig) : null;

  const hole = mergedScores[curHole];
  const par  = hole.par;

  useEffect(()=>{
    stripRef.current?.querySelector(`[data-hole="${curHole}"]`)
      ?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  },[curHole]);

  /* ── Score setters ── */
  const applyScore = (pid, v) => {
    const next = scores.map((h,i)=>i===curHole?{...h,playerScores:{...h.playerScores,[pid]:v}}:h);
    setScores(next);
    localStorage.setItem('pc_scores', JSON.stringify(next));
    if (v != null) setFlashInfo({pid,label:scDiffLabel(v-par),d:v-par});
    setTimeout(()=>setFlashInfo(null),1500);
    // Push live update: merge with remote scores so joined players' data is preserved
    const merged = next.map((h,i) => {
      if (!liveRemote?.scores?.[i]) return h;
      const remotePs = liveRemote.scores[i].playerScores || {};
      const ps = { ...h.playerScores };
      players.forEach(p => { if (!p.isMe && remotePs[p.id] != null && ps[p.id] == null) ps[p.id] = remotePs[p.id]; });
      (liveRemote.players||[]).forEach(rp => { if (!players.find(p=>p.id===rp.id)) ps[rp.id] = remotePs[rp.id]??null; });
      return { ...h, playerScores: ps };
    });
    if (onLiveUpdate) onLiveUpdate(merged, curHole);
  };

  const nudge = (pid, delta) => {
    const cur = hole.playerScores[pid];
    if (cur == null) { if (delta > 0) applyScore(pid, 1); return; }
    const next = cur + delta;
    if (next < 1) { applyScore(pid, null); return; } // reset to unscored
    applyScore(pid, next);
  };

  const commitParAndGo = (nextHole) => {
    const next = scores;
    const ni=Math.max(0,Math.min(course.holes-1,nextHole));
    setCurHole(ni);
    localStorage.setItem('pc_curHole', ni);
    // Merge remote scores for non-me players before pushing
    const toSync = liveRemote ? next.map((h,i) => {
      const remotePs = liveRemote.scores?.[i]?.playerScores || {};
      const ps = { ...h.playerScores };
      players.forEach(p => { if (!p.isMe && remotePs[p.id] != null && ps[p.id] == null) ps[p.id] = remotePs[p.id]; });
      (liveRemote.players||[]).forEach(rp => { if (!players.find(p=>p.id===rp.id)) ps[rp.id] = remotePs[rp.id]??null; });
      return { ...h, playerScores: ps };
    }) : next;
    if (onLiveUpdate) onLiveUpdate(toSync, ni);
  };

  const allDone = allPlayers.every(p=>hole.playerScores[p.id]!=null);
  const allHolesDone = scores.every(h=>players.every(p=>h.playerScores[p.id]!=null)); // only require original players to finish

  /* ── Targeta completa (full scorecard) ── */
  if (showFull) {
    const ballBg  = d => d==null?'transparent':d<=-1?'transparent':d===0?'rgba(202,255,77,.12)':d===1?'rgba(208,208,208,.1)':'rgba(239,68,68,.15)';
    const ballCol = d => d==null?'#2A2B30':d<=-2?'#FBBF24':d===-1?'#60A5FA':d===0?'#CAFF4D':d===1?'#d0d0d0':d===2?'#EF4444':'#9f1414';
    const ballBorder = (d, isActive, v) => {
      if (d==null) return isActive ? '1.5px dashed rgba(202,255,77,.4)' : '1px solid #1E2025';
      return 'none';
    };
    const ballRadius = d => (d==null||d<0) ? '50%' : '7px';
    const totColor  = d => d==null?'#555':d<0?'#CAFF4D':d===0?'#fff':'#EF4444';
    return (
      <div style={{position:'fixed',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'#0A0A0B',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'Inter,sans-serif'}}>
        {/* Header */}
        <div style={{padding:'12px 14px',borderBottom:'1px solid #1a1a1f',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:'.06em',color:'#CAFF4D'}}>{lang==='en'?'Full Scorecard':lang==='es'?'Tarjeta completa':'Targeta Completa'}</div>
            <div style={{fontSize:9,color:'#555',fontWeight:600}}>{course.name} · Par {course.par}</div>
          </div>
          <button onClick={()=>setShowFull(false)} style={{padding:'6px 13px',borderRadius:8,border:'1px solid #222',background:'#1a1a1f',color:'#CAFF4D',fontSize:11,fontWeight:700,cursor:'pointer'}}>← {lang==='en'?'Back':lang==='es'?'Volver':'Tornar'}</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'0 14px 24px'}}>
          {/* Granada live balances */}
          {isGranada && granadaResult && (
            <div style={{margin:"12px 0 16px",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:"14px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#EF4444",marginBottom:12}}>💣 {tl("granada_result")}</div>
              {[...allPlayers].sort((a,b)=>(granadaResult.balances[b.id]||0)-(granadaResult.balances[a.id]||0)).map((p,i)=>{
                const bal = granadaResult.balances[p.id] || 0;
                const color = PLAYER_COLORS[allPlayers.indexOf(p)] || "#CAFF4D";
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<allPlayers.length-1?"1px solid #1a1a1f":"none"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>
                      {(p.name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"P"}
                    </div>
                    <div style={{flex:1,fontWeight:600,fontSize:13}}>{p.name}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:20,fontWeight:700,color:bal>=0?"#CAFF4D":"#EF4444"}}>
                      {bal>=0?`+${bal.toFixed(2)}€`:`${bal.toFixed(2)}€`}
                    </div>
                  </div>
                );
              })}
              {granadaResult.carryPot > 0 && (
                <div style={{marginTop:10,padding:"6px 10px",background:"rgba(251,191,36,.1)",borderRadius:6,fontSize:11,color:"#FBBF24",fontWeight:700}}>
                  💰 {tl("granada_carry")}: +{granadaResult.carryPot.toFixed(2)}€
                </div>
              )}
              <div style={{marginTop:8,fontSize:10,color:"#555761"}}>
                {[...granadaDoubles].sort((a,b)=>a-b).map(h=>`F${h}⚡`).join(" ")}
                {granadaHoleNum ? ` F${granadaHoleNum}💣` : ""}
                {granadaConfig?.betBase ? ` · ${granadaConfig.betBase}€/forat` : ""}
              </div>
            </div>
          )}
          {/* Player header row */}
          <div style={{display:'flex',alignItems:'center',padding:'10px 0 8px',borderBottom:'2px solid #2A2B35'}}>
            <div style={{width:36,flexShrink:0}}/>
            <div style={{flex:1,display:'flex',justifyContent:'space-around'}}>
              {allPlayers.map((p,i)=>(
                <div key={p.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:PLAYER_COLORS[i]+'33',border:`2px solid ${PLAYER_COLORS[i]}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:PLAYER_COLORS[i]}}>
                    {(p.name||"?")[0].toUpperCase()}
                  </div>
                  <div style={{fontSize:8,fontWeight:700,color:PLAYER_COLORS[i],letterSpacing:'.04em'}}>{(p.name||"?").slice(0,5).toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Hole rows */}
          {mergedScores.map((h,idx)=>{
            const isCur = idx===curHole;
            return (
              <div key={idx} onClick={()=>{commitParAndGo(idx);setShowFull(false);}}
                style={{display:'flex',alignItems:'center',padding:'5px 0',cursor:'pointer',background:isCur?'rgba(202,255,77,.04)':'transparent',borderBottom:'1px solid #252630'}}>
                {/* Hole label */}
                <div style={{width:36,flexShrink:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:isCur?'#CAFF4D':'#fff',lineHeight:1}}>{h.hole}</div>
                  <div style={{fontSize:8,color:'#3A3B42',marginTop:2}}>p{h.par}</div>
                </div>
                {/* Balls */}
                <div style={{flex:1,display:'flex',justifyContent:'space-around',alignItems:'center'}}>
                  {allPlayers.map((p)=>{
                    const v = h.playerScores[p.id];
                    const d = v!=null ? v-h.par : null;
                    const col = ballCol(d);
                    return (
                      <div key={p.id} style={{
                        width:30,height:30,
                        borderRadius:ballRadius(d),
                        background:ballBg(d),
                        border:ballBorder(d,isCur,v),
                        display:'flex',alignItems:'center',justifyContent:'center',
                      }}>
                        <span style={{fontWeight:800,fontSize:14,color:v!=null?col:'#2A2B30',lineHeight:1}}>{v!=null?v:'·'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Total row */}
          <div style={{display:'flex',alignItems:'center',padding:'10px 0 4px',borderTop:'2px solid #2A2B35',marginTop:4}}>
            <div style={{width:36,flexShrink:0,fontSize:8,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.1em'}}>TOT</div>
            <div style={{flex:1,display:'flex',justifyContent:'space-around',alignItems:'center'}}>
              {allPlayers.map(p=>{
                const d = scPlayerTot(mergedScores,p.id);
                return (
                  <div key={p.id} style={{fontWeight:900,fontSize:18,color:totColor(d),lineHeight:1}}>
                    {scFmtTotal(d)}
                  </div>
                );
              })}
            </div>
          </div>
          {allHolesDone && (
            <button onClick={()=>onFinish(scores)} style={{width:'100%',marginTop:16,padding:'14px',borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:14,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase'}}>
              {tl('finish')}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══ MAIN SCORING VIEW ══ */
  return (
    <div style={{position:'fixed',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'#0A0A0B',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'Inter,sans-serif',paddingBottom:'env(safe-area-inset-bottom)'}}>

      {/* TOP BAR — compact 2-row */}
      <div style={{padding:'8px 12px 6px',borderBottom:'1px solid #1a1a1f',flexShrink:0,background:'#0D0E12'}}>
        {/* Row 1: save | course + hole | invite + exit */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
          <button onClick={()=>onFinish(scores,true)} style={{padding:'5px 11px',borderRadius:100,border:'1px solid #333',background:'#1A1B1E',color:'#ccc',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            ←
          </button>
          <div style={{flex:1,minWidth:0}}>
            {(()=>{ const short=course.name.replace(/\s*Pitch\s*[&i]+\s*Putt/gi,'').replace(/\s*P&P/gi,'').replace(/\s*Golf\s*i\s*Pitch.*/gi,' Golf').replace(/\s+/g,' ').trim()||course.name; return (
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:short.length>18?15:18,letterSpacing:'.05em',color:'#CAFF4D',lineHeight:1.1,maxWidth:180}}>{short}</div>
            );})()}
            <div style={{fontSize:10,color:'#555761',fontWeight:600,marginTop:1,display:'flex',alignItems:'center',flexWrap:'wrap',gap:4}}>
              <span>{lang==='en'?'H':lang==='es'?'H':'F'}<span style={{color:'#CAFF4D',fontSize:14,fontWeight:700}}>{curHole+1}</span>/{course.holes} · Par {par}</span>
              {isGranada && (()=>{
                const hNum = curHole + 1;
                const isMult2 = granadaDoubles.includes(hNum);
                const isMult3 = granadaHoleNum === hNum;
                if (isMult3) return <span style={{fontSize:11,fontWeight:700,background:"rgba(239,68,68,.2)",color:"#EF4444",border:"1px solid rgba(239,68,68,.4)",borderRadius:6,padding:"2px 7px"}}>💣 ×3</span>;
                if (isMult2) return <span style={{fontSize:11,fontWeight:700,background:"rgba(251,191,36,.15)",color:"#FBBF24",border:"1px solid rgba(251,191,36,.3)",borderRadius:6,padding:"2px 7px"}}>⚡ ×2</span>;
                return null;
              })()}
            </div>
            {isGranada && granadaConfig?.decideLater && (
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>{
                  const h = curHole+1;
                  setGranadaDoubles(prev => prev.includes(h) ? prev.filter(x=>x!==h) : prev.length<3 ? [...prev,h] : prev);
                  if(granadaHoleNum===h) setGranadaHoleNum(null);
                }} style={{fontSize:10,padding:"3px 8px",borderRadius:6,border:`1px solid ${granadaDoubles.includes(curHole+1)?"#FBBF24":"#333"}`,background:granadaDoubles.includes(curHole+1)?"rgba(251,191,36,.15)":"transparent",color:granadaDoubles.includes(curHole+1)?"#FBBF24":"#555761",fontWeight:700,cursor:"pointer"}}>⚡ Doble</button>
                <button onClick={()=>{
                  const h = curHole+1;
                  setGranadaHoleNum(prev => prev===h ? null : h);
                  setGranadaDoubles(prev => prev.filter(x=>x!==h));
                }} style={{fontSize:10,padding:"3px 8px",borderRadius:6,border:`1px solid ${granadaHoleNum===curHole+1?"#EF4444":"#333"}`,background:granadaHoleNum===curHole+1?"rgba(239,68,68,.2)":"transparent",color:granadaHoleNum===curHole+1?"#EF4444":"#555761",fontWeight:700,cursor:"pointer"}}>💣 Granada</button>
              </div>
            )}
          </div>
          <button onClick={()=>{setShowInviteSheet(true);setShowCodePanel(!!gameCode);}} style={{padding:'6px 10px',borderRadius:8,border:'1px solid rgba(202,255,77,.35)',background:'rgba(202,255,77,.1)',color:'#CAFF4D',fontSize:10,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
            {gameCode
              ? <><Share2 size={12}/> <span style={{fontFamily:"'Bebas Neue'",letterSpacing:'.15em',fontSize:13}}>{gameCode}</span></>
              : <><Share2 size={12}/> Invita</>
            }
          </button>
          <button onClick={()=>setShowFull(true)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #333',background:'#1a1a1f',color:'#999',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}>
            <Flag size={13}/>
          </button>
          <button onClick={()=>{ if(window.confirm(lang==='en'?'Abandon?':lang==='es'?'¿Abandonar?':'Abandonar?')) onDelete(); }} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #333',background:'#1a1a1f',color:'#999',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}>
            <X size={13}/>
          </button>
        </div>

        {/* Hole strip */}
        <div ref={stripRef} style={{display:'flex',gap:3,overflowX:'auto'}} className="noscroll">
          {mergedScores.map((h,i)=>{
            const done=allPlayers.every(p=>h.playerScores[p.id]!=null);
            const any =allPlayers.some(p=>h.playerScores[p.id]!=null);
            const isCur=i===curHole;
            return (
              <div key={i} data-hole={i} onClick={()=>commitParAndGo(i)}
                style={{flexShrink:0,width:isCur?28:20,height:22,borderRadius:5,cursor:'pointer',transition:'all .2s',
                  background:isCur?'#CAFF4D':done?'rgba(202,255,77,.28)':any?'rgba(202,255,77,.1)':'#1a1a1f',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isCur?11:10,color:isCur?'#0A0A0B':done?'#CAFF4D':'#444'}}>{h.hole}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER CARDS */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px',display:'flex',flexDirection:'column',gap:8}}>
        {/* For parelles mode: compute best ball per team per hole */}
        {(() => {
          const isParelles = gameData.gameMode === "parelles";
          const getBestBallPlayer = (holeScores, teamPlayers) => {
            let best = null, bestPid = null;
            teamPlayers.forEach(p => {
              const s = holeScores[p.id];
              if (s != null && (best === null || s < best)) { best = s; bestPid = p.id; }
            });
            return bestPid;
          };
          return null;
        })()}
        {allPlayers.map((p,pi)=>{
          const pcolor  = PLAYER_COLORS[pi];
          const v       = hole.playerScores[p.id];
          const d       = v!=null?v-par:null;
          const tot     = scPlayerTot(mergedScores,p.id);
          const isAct   = activePid===p.id;
          const flash   = flashInfo?.pid===p.id;
          const played  = scores.filter(h=>h.playerScores[p.id]!=null).length;
          // Parelles: best ball highlighting
          const isParelles = gameData.gameMode === "parelles";
          const myTeamId = p.teamId;
          const teamMates = isParelles ? players.filter(x => x.teamId === myTeamId) : [];
          const isBestBall = isParelles && teamMates.length > 1 && (() => {
            const scores_cur = hole.playerScores;
            let best = null;
            teamMates.forEach(tm => { const s = scores_cur[tm.id]; if (s != null && (best === null || s < best)) best = s; });
            return v != null && v === best;
          })();

          return (
            <div key={p.id} onClick={()=>setActivePid(p.id)}
              style={{borderRadius:14,transition:'all .2s',cursor:'pointer',position:'relative',
                background:'#15151c',
                border: isBestBall ? '2px solid rgba(202,255,77,.7)' : isAct?`2px solid ${pcolor}90`:`1px solid ${pcolor}30`,
                boxShadow:isAct?`0 0 28px ${pcolor}20,inset 0 0 40px ${pcolor}08`:`0 0 12px ${pcolor}06`,
                padding:'12px 13px'}}>

              {flash&&(
                <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:scDiffColor(flashInfo.d),letterSpacing:'.1em',animation:'flashUp .9s ease forwards',pointerEvents:'none',zIndex:10,whiteSpace:'nowrap'}}>
                  {flashInfo.label}
                </div>
              )}

              {/* Card header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0,flex:1}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:pcolor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#0A0A0B',flexShrink:0,transition:'background .2s'}}>
                    {p.name[0]}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'color .2s',display:'flex',alignItems:'center',gap:4}}>
                      {p.isRegistered && <span style={{fontSize:7,color:'#CAFF4D',flexShrink:0}}>●</span>}
                      {p.name}
                    </div>
                    {isParelles && myTeamId && <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',color:myTeamId==="A"?"#CAFF4D":"#60A5FA",textTransform:'uppercase'}}>EQUIP {myTeamId}{isBestBall?" · ★ BEST BALL":""}</div>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:scDiffColor(tot),lineHeight:1,transition:'color .3s',textShadow:tot!=null?`0 0 30px ${scDiffColor(tot)}25`:'none'}}>
                    {scFmtTotal(tot)}
                  </div>
                  <div style={{fontSize:8,color:'#555',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginTop:1}}>{played}/{course.holes}</div>
                </div>
              </div>

              {/* Hole grid — 2 rows of 9 */}
              <div style={{marginBottom:12}}>
                {[0,1].map(row=>(
                  <div key={row}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,marginTop:row===1?6:0}}>
                      <span style={{fontSize:7,fontWeight:700,color:'#2a2a35',letterSpacing:'.1em',flexShrink:0}}>{row===0?`${lang==='en'?'H':lang==='es'?'H':'F'}1–9`:`${lang==='en'?'H':lang==='es'?'H':'F'}10–18`}</span>
                      <div style={{flex:1,height:1,background:'#1e1e28'}}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(9,1fr)',gap:3}}>
                      {scores.slice(row*9,row*9+9).map((h,ci)=>{
                        const i=row*9+ci;
                        const hv=h.playerScores[p.id];
                        const isCur=i===curHole;
                        return (
                          <div key={i} onClick={e=>{e.stopPropagation();commitParAndGo(i);setActivePid(p.id);}}
                            style={{cursor:'pointer',borderRadius:6,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:42,gap:1,transition:'all .15s',
                              border:isCur?`1.5px solid ${pcolor}70`:'1px solid #1e1e28',
                              background:isCur?`${pcolor}0d`:'#0c0c12'}}>
                            <span style={{fontSize:11,color:isCur?pcolor:'#2a2a38',fontWeight:700,lineHeight:1}}>{h.hole}</span>
                            <ScoreSymbol v={hv} par={h.par} size={28}/>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active indicator */}
              {isAct&&<div style={{fontSize:8,fontWeight:700,letterSpacing:'.12em',color:pcolor,textTransform:'uppercase',marginBottom:8,opacity:.85}}>▶ ENTRANT</div>}

              {/* Scoring controls (active player only) */}
              {isAct&&(
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:2}}>
                  <button onClick={e=>{e.stopPropagation();nudge(p.id,-1);}}
                    style={{width:46,height:46,borderRadius:12,border:'1px solid #2a2a35',background:'#1c1c26',color:'#9a9aaa',fontSize:24,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,lineHeight:1}}>
                    −
                  </button>
                  <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    {v==null
                      ? <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:52,color:'#2A2B35',lineHeight:1}}>—</span>
                      : <ScoreSymbol v={v} par={par} size={52}/>
                    }
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:v==null?'#333':scDiffColor(d),letterSpacing:'.1em',lineHeight:1,transition:'color .2s'}}>
                      {v==null?'sense puntuació':scRowLabel(v,par)}
                    </span>
                  </div>
                  <button onClick={e=>{e.stopPropagation();nudge(p.id,1);}}
                    style={{width:46,height:46,borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontSize:24,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,lineHeight:1}}>
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM NAV */}
      <div style={{display:'flex',gap:8,padding:'10px 14px 14px',borderTop:'1px solid #1e1e28',flexShrink:0}}>
        <button onClick={()=>curHole>0&&commitParAndGo(curHole-1)} disabled={curHole===0}
          style={{flex:1,padding:'13px',borderRadius:12,border:'1px solid #2e2e3a',background:curHole>0?'#1c1c26':'#111118',color:curHole>0?'#9a9aaa':'#2e2e3a',fontWeight:700,fontSize:12,cursor:curHole>0?'pointer':'default',letterSpacing:'.06em',textTransform:'uppercase',transition:'all .2s'}}>
          ← {lang==='en'?'H':lang==='es'?'H':'F'}{String(curHole).padStart(2,'0')}
        </button>
        {allHolesDone ? (
          <button onClick={()=>onFinish(scores)}
            style={{flex:2,padding:'13px',borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:13,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase'}}>
            {tl('finish')}
          </button>
        ) : (
          <button onClick={()=>{if(curHole<course.holes-1)commitParAndGo(curHole+1);}}
            style={{flex:2,padding:'13px',borderRadius:12,border:allDone?'none':'1px solid #2e2e3a',background:allDone?'#CAFF4D':'#1c1c26',color:allDone?'#0A0A0B':'#CAFF4D',fontWeight:700,fontSize:13,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase',transition:'all .2s'}}>
            {curHole<course.holes-1?`${lang==='en'?'H':lang==='es'?'H':'F'}${String(curHole+2).padStart(2,'0')} →`:tl('finish')}
          </button>
        )}
      </div>

      {!user&&(
        <div style={{textAlign:'center',fontSize:10,color:'#555761',padding:'4px 16px 6px',flexShrink:0}}>
          {lang==='en'?'Guest mode ·':lang==='es'?'Modo visitante ·':'Mode visitant ·'}{' '}
          <span style={{color:'#CAFF4D',cursor:'pointer',fontWeight:600}} onClick={openAuth}>
            {lang==='en'?'Create account':lang==='es'?'Crea cuenta':'Crea compte'}
          </span>
        </div>
      )}

      {/* Invite sheet */}
      {showInviteSheet && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div onClick={()=>{setShowInviteSheet(false);setShowCodePanel(false);}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.7)'}}/>
          <div style={{position:'relative',background:'#1A1B1E',borderRadius:'20px 20px 0 0',padding:'20px 20px 40px'}}>
            <div style={{width:40,height:4,background:'#333',borderRadius:2,margin:'0 auto 18px'}}/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:'.12em',color:'#555761',marginBottom:16,textAlign:'center'}}>COMPARTIR PARTIDA</div>

            {/* Option 1: Join game → expands code panel */}
            <button onClick={()=>setShowCodePanel(v=>!v)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px',background:'#111214',borderRadius:12,border:`1px solid ${showCodePanel?'rgba(202,255,77,.4)':'rgba(202,255,77,.2)'}`,color:'#fff',cursor:'pointer',marginBottom:showCodePanel?0:10,textAlign:'left'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'rgba(202,255,77,.1)',border:'1px solid rgba(202,255,77,.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Users size={18} color='#CAFF4D'/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#CAFF4D'}}>Uneix-te a la partida</div>
                <div style={{fontSize:11,color:'#555761',marginTop:2}}>Comparteix el codi per jugar</div>
              </div>
              <ChevronRight size={16} color='#555761' style={{transform:showCodePanel?'rotate(90deg)':'none',transition:'transform .2s'}}/>
            </button>

            {/* Code panel */}
            {showCodePanel && (
              <div style={{background:'#111214',borderRadius:'0 0 12px 12px',padding:'14px 14px 16px',marginBottom:10,borderTop:'1px solid #1A1B1E'}}>
                {gameCode ? <>
                  <div style={{fontSize:9,color:'#555761',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Codi de partida</div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:40,color:'#CAFF4D',letterSpacing:'.25em',flex:1,lineHeight:1}}>{gameCode}</div>
                    <button onClick={()=>{
                      navigator.clipboard.writeText(gameCode).then(()=>{setCodeCopied(true);setTimeout(()=>setCodeCopied(false),2000);});
                    }} style={{padding:'8px 14px',borderRadius:8,border:'1px solid rgba(202,255,77,.3)',background:codeCopied?'rgba(202,255,77,.15)':'transparent',color:codeCopied?'#CAFF4D':'#787C8A',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
                      {codeCopied?<><Check size={12}/>Copiat!</>:<>Copiar</>}
                    </button>
                  </div>
                  <button onClick={async()=>{
                    const url=`${window.location.origin}/g/${liveShareToken}`;
                    const data={title:'Pitch & Clubs',text:`Uneix-te a la partida! Codi: ${gameCode}\n${url}`,url};
                    if(navigator.share){try{await navigator.share(data);}catch(e){}}
                    else{navigator.clipboard.writeText(url);setCodeCopied(true);setTimeout(()=>setCodeCopied(false),2000);}
                  }} style={{width:'100%',padding:'11px',borderRadius:10,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <Share2 size={14}/> Compartir link
                  </button>
                </> : (
                  <div style={{textAlign:'center',padding:'8px 0'}}>
                    <div style={{fontSize:12,color:'#555761',marginBottom:10}}>La partida no s'ha pogut iniciar en directe</div>
                    <button onClick={async()=>{
                      if(onCreateLive){ await onCreateLive(); }
                    }} style={{padding:'9px 20px',borderRadius:10,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      Reintentar ↺
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Option 2: Watch live → share link only */}
            <button onClick={async()=>{
              const url = liveShareToken ? `${window.location.origin}/g/${liveShareToken}?watch=1` : 'https://pitchandclubs.cat';
              const data = {title:'Pitch & Clubs — En directe',text:'Segueix la partida en directe!',url};
              if(navigator.share){try{await navigator.share(data);}catch(e){}}
              else{navigator.clipboard.writeText(url);setShowInviteSheet(false);}
            }} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px',background:'#111214',borderRadius:12,border:'1px solid #222327',color:'#fff',cursor:'pointer',textAlign:'left'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'#1a1a1f',border:'1px solid #2a2a35',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Play size={18} color='#787C8A'/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>Seguir en directe</div>
                <div style={{fontSize:11,color:'#555761',marginTop:2}}>Veure la partida sense participar</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .noscroll::-webkit-scrollbar{display:none;}
        @keyframes flashUp{0%{opacity:1;transform:translateX(-50%) translateY(0);}55%{opacity:1;transform:translateX(-50%) translateY(-10px);}100%{opacity:0;transform:translateX(-50%) translateY(-20px);}}
        @keyframes ptsPop{0%{transform:scale(1);opacity:.6;}50%{transform:scale(1.22);opacity:1;}100%{transform:scale(1);opacity:1;}}
      `}</style>
    </div>
  );
}
