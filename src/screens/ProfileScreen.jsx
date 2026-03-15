import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { getTier, getTierPct } from '../utils/helpers.js';
import { TIERS, PLAYER_PROFILE } from '../data/constants.js';
import TierBadge from '../components/TierBadge.jsx';

export default function ProfileScreen({ user, userPts, setScreen, lang, onAvatarChange, history, setUser, follows, followsNames, onFollow, enableNotifications }) {
  const tl = (k,v={}) => t(lang,k,v);
  const profile = PLAYER_PROFILE;
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(t=>t.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editClub, setEditClub] = useState(user?.club || "");
  const [editHcp, setEditHcp] = useState(user?.hcp != null ? String(user.hcp) : "");
  const [editLicense, setEditLicense] = useState(user?.license || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const newName = editName.trim();
    const newClub = editClub.trim();
    const hcpVal = editHcp.trim() !== "" ? parseFloat(editHcp.replace(",", ".")) : null;
    const hcp = isNaN(hcpVal) ? null : hcpVal;

    // 1. Save to profiles table (source of truth)
    await supabase.from("profiles").upsert({ id: user.id, name: newName, club: newClub }, { onConflict: "id" });

    // 2. Backfill all existing games with the new name
    await supabase.from("games").update({ player_name: newName }).eq("user_id", user.id);
    const { data: userGames } = await supabase.from("games").select("id, players").eq("user_id", user.id);
    if (userGames?.length) {
      await Promise.all(userGames.map(g => {
        const updated = (g.players || []).map(p => p.isMe ? { ...p, name: newName } : p);
        return supabase.from("games").update({ players: updated }).eq("id", g.id);
      }));
    }

    // 3. Update user_metadata in background (non-blocking)
    supabase.auth.updateUser({ data: { name: newName, club: newClub, hcp, license: editLicense.trim() } }).catch(() => {});

    // 4. Update local state and close edit
    if (setUser) setUser(prev => ({ ...prev, name: newName, club: newClub, hcp, license: editLicense.trim() }));
    setSaving(false);
    setEditMode(false);
  };

  const myGames = (history||[]).filter(g => g.players?.some(p => p.isMe));
  const hasRealGames = myGames.length > 0;
  const myDiffs = myGames.map(g => g.players.find(p => p.isMe)?.diff).filter(d => d !== undefined && d !== null && !isNaN(parseFloat(d)));
  const bestDiff = myDiffs.length ? Math.min(...myDiffs.map(d=>parseFloat(d))) : null;
  const trendData = myGames.slice(0, 10).reverse().map(g => {
    const dateStr = g.date || "";
    const d = new Date(dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr);
    const label = !isNaN(d.getTime())
      ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
      : dateStr.slice(0,5);
    return { date: label, s: parseFloat(g.players.find(p => p.isMe)?.diff) || 0 };
  });

  const realHcpHist = (() => {
    if (!hasRealGames) return null;
    const games = [...myGames].reverse()
      .filter(g => { const me = g.players?.find(p=>p.isMe); return me && !isNaN(parseFloat(me?.diff)); });
    if (!games.length) return null;
    const firstDiff = parseFloat(games[0].players.find(p=>p.isMe).diff);
    let running = user?.hcp != null ? user.hcp : firstDiff;
    return games.slice(-10).map((g, i) => {
      const me = g.players.find(p=>p.isMe);
      const diff = parseFloat(me.diff);
      const alpha = diff > running ? 0.35 : 0.15;
      running = Math.round((running * (1 - alpha) + diff * alpha) * 10) / 10;
      const dateStr = g.date || "";
      const d = new Date(dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr);
      const label = !isNaN(d.getTime())
        ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
        : `P${i+1}`;
      return { m: label, v: running };
    });
  })();
  const hcpHist = realHcpHist || profile.hcpHist;
  const courseMap = {};
  myGames.forEach(g => {
    const me = g.players.find(p => p.isMe);
    if (!me) return;
    if (!courseMap[g.course]) courseMap[g.course] = { name: g.course, diffs: [] };
    courseMap[g.course].diffs.push(me.diff);
  });
  const realBestCourses = Object.values(courseMap)
    .map(c => ({ name: c.name, played: c.diffs.length, best: Math.min(...c.diffs), avg: +(c.diffs.reduce((a,b)=>a+b,0)/c.diffs.length).toFixed(1) }))
    .sort((a,b) => a.best - b.best)
    .slice(0, 4);
  const noDataMsg = lang==='en'?'Start playing to see your stats':lang==='es'?'Comienza a jugar para ver tus estadísticas':'Comença a jugar per veure les teves estadístiques';

  const scoreTrend = hasRealGames ? trendData : profile.trend;
  const bestCourses = hasRealGames ? realBestCourses : profile.bestCourses;
  const realDist = {eagle:0,birdie:0,par:0,bogey:0,double:0,triple:0};
  if (hasRealGames) {
    myGames.forEach(g=>{
      const me=g.players.find(p=>p.isMe); if(!me) return;
      (g.scores||[]).forEach(h=>{
        const s=h.playerScores?.[me.id]; if(s===null||s===undefined) return;
        const d=s-h.par;
        if(d<=-2) realDist.eagle++; else if(d===-1) realDist.birdie++; else if(d===0) realDist.par++;
        else if(d===1) realDist.bogey++; else if(d===2) realDist.double++; else realDist.triple++;
      });
    });
  }
  const dist = hasRealGames ? realDist : profile.dist;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onAvatarChange(file);
    setUploading(false);
  };

  return (
    <div className="page-scroll">
      {/* Header */}
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",overflow:"hidden"}}>
        <div style={{flex:1,minWidth:0,paddingRight:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Perfil</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(26px,7vw,40px)",letterSpacing:".04em",lineHeight:1}}>{user?.name||profile.name}</div>
          {(user?.club||profile.club) && <div style={{fontSize:12,color:"#787C8A",marginTop:3}}>{user?.club||profile.club}</div>}
          {user?.hcp != null && (
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5,flexWrap:"wrap"}}>
              <span style={{background:"rgba(202,255,77,.12)",border:"1px solid rgba(202,255,77,.3)",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,color:"#CAFF4D",letterSpacing:".04em"}}>
                HCP {user.hcp % 1 === 0 ? user.hcp : user.hcp.toFixed(1)}
              </span>
              {user.license && (
                <span style={{background:"rgba(255,255,255,.04)",border:"1px solid #222327",borderRadius:6,padding:"2px 8px",fontSize:10,color:"#555761",letterSpacing:".04em"}}>
                  Llicència {user.license}
                </span>
              )}
            </div>
          )}
          {user && !editMode && (
            <button onClick={()=>{setEditName(user.name||"");setEditClub(user.club||"");setEditHcp(user.hcp!=null?String(user.hcp):"");setEditLicense(user.license||"");setEditMode(true);}}
              style={{marginTop:8,background:"none",border:"1px solid #222327",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#787C8A",cursor:"pointer",letterSpacing:".06em",textTransform:"uppercase"}}>
              Editar →
            </button>
          )}
        </div>
        <div style={{position:"relative",flexShrink:0}} onClick={()=>fileInputRef.current?.click()}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",display:"block"}} alt="avatar"/>
            : <div style={{width:54,height:54,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:18,color:"#0A0A0B"}}>{(user?.name||profile.name).split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
          }
          <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,borderRadius:"50%",background:"#1A1B1E",border:"1px solid #222327",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {uploading ? <span style={{fontSize:8,color:"#787C8A"}}>…</span> : <span style={{fontSize:10}}>📷</span>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileSelect}/>
        </div>
      </div>

      {/* Edit form */}
      {user && editMode && (
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:12}}>Editar Perfil</div>
          <div style={{marginBottom:10}}>
            <span className="label">Nom</span>
            <input className="inp" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="El teu nom" autoFocus/>
          </div>
          <div style={{marginBottom:10}}>
            <span className="label">Club</span>
            <input className="inp" value={editClub} onChange={e=>setEditClub(e.target.value)} placeholder="El teu club (opcional)"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div>
              <span className="label">Hàndicap oficial</span>
              <input className="inp" value={editHcp} onChange={e=>setEditHcp(e.target.value)}
                placeholder="Ex: 18.4" inputMode="decimal" type="text"
                style={{borderColor:editHcp&&isNaN(parseFloat(editHcp.replace(",",".")))?"#EF4444":undefined}}/>
              <div style={{fontSize:9,color:"#555761",marginTop:3}}>Pitch&putt FCPP (0–36)</div>
            </div>
            <div>
              <span className="label">Núm. llicència</span>
              <input className="inp" value={editLicense} onChange={e=>setEditLicense(e.target.value)} placeholder="Ex: CAT-12345"/>
              <div style={{fontSize:9,color:"#555761",marginTop:3}}>Federació Catalana P&P</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-primary" style={{fontSize:13}} onClick={handleSaveProfile} disabled={saving||!editName.trim()}>
              {saving?"Guardant…":"Guardar"}
            </button>
            <button className="btn btn-ghost" style={{fontSize:13,width:"auto",padding:"15px 20px"}} onClick={()=>setEditMode(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* Tier card */}
      <div className="card card-lime" style={{marginBottom:12,borderColor:tier.border,background:tier.bg}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:7,alignItems:"center"}}><TierBadge tierId={tier.id}/><span className="pill" style={{color:tier.color}}>⚡ {userPts} pts</span></div>
          <div style={{fontSize:28}}>{tier.emoji}</div>
        </div>
        {nextTier ? <>
          <div style={{fontSize:11,color:"#555761",marginBottom:5}}>{nextTier.min-userPts} pts per arribar a <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name} {nextTier.emoji}</span></div>
          <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:tier.color}}/></div>
        </> : <div style={{fontSize:11,color:"#CAFF4D",fontWeight:700}}>🔥 Nivell màxim aconseguit!</div>}
      </div>

      {/* Key stats */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${user?.hcp!=null?4:3},1fr)`,gap:8,marginBottom:hasRealGames?12:4}}>
        {[
          {l:tl("stat_games"), v:hasRealGames?myGames.length:profile.games},
          {l:tl("stat_best"),  v:hasRealGames?(bestDiff!==null?(bestDiff>0?`+${bestDiff}`:bestDiff===0?"E":bestDiff):"—"):`${profile.hcp}`},
          {l:tl("stat_holes"), v:hasRealGames?(myGames.reduce((a,g)=>a+(g.scores?.length||0),0)||"—"):profile.games*9},
          ...(user?.hcp!=null ? [{l:"HCP oficial", v:user.hcp%1===0?user.hcp:user.hcp.toFixed(1), accent:"#CAFF4D"}] : []),
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:s.accent||"#CAFF4D",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>
      {!hasRealGames && <div style={{textAlign:"center",fontSize:10,color:"#555761",marginBottom:12,fontStyle:"italic"}}>{noDataMsg}</div>}

      {/* Score trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:!hasRealGames?4:12}}>{tl("profile_score_trend")}</div>
        {!hasRealGames && <div style={{fontSize:10,color:"#555761",fontStyle:"italic",marginBottom:8,textAlign:"center"}}>{noDataMsg}</div>}
        {scoreTrend.length >= 2 && <>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:64,marginBottom:4}}>
            {scoreTrend.map((r,i) => {
              const worst = Math.max(...scoreTrend.map(x=>x.s));
              const best  = Math.min(...scoreTrend.map(x=>x.s));
              const range = worst - best || 1;
              const h = Math.round(((r.s - best) / range) * 44) + 8;
              const isBest = r.s === best;
              const c = isBest ? "#CAFF4D" : "#60A5FA";
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                <div style={{fontSize:7,color:c,fontWeight:700}}>{r.s>0?`+${r.s}`:r.s===0?"E":r.s}</div>
                <div style={{width:"100%",background:c,borderRadius:"2px 2px 0 0",height:h,opacity:.85}}/>
                <div style={{fontSize:7,color:"#555761"}}>{r.date}</div>
              </div>;
            })}
          </div>
        </>}
      </div>

      {/* HCP Trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:hcpHist.length<2?4:12}}>{tl("profile_hcp_trend")}</div>
        {hcpHist.length < 2
          ? <div style={{fontSize:11,color:"#555761",fontStyle:"italic",textAlign:"center",padding:"12px 0"}}>{hasRealGames ? (lang==="en"?"Play at least 2 rounds to see the trend":lang==="es"?"Juega al menos 2 rondas para ver la evolución":"Juga almenys 2 rondes per veure l'evolució") : noDataMsg}</div>
          : <>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:64,marginBottom:4}}>
              {hcpHist.map((pt,i)=>{
                const vals=hcpHist.map(x=>x.v);
                const maxV=Math.max(...vals), minV=Math.min(...vals);
                const range=maxV-minV||1;
                const h=Math.round(((pt.v-minV)/range)*44)+8;
                const isBest=pt.v===minV;
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                    <div style={{fontSize:7,color:isBest?"#CAFF4D":"#60A5FA",fontWeight:700}}>{pt.v>0?`+${pt.v}`:pt.v===0?"E":pt.v}</div>
                    <div style={{width:"100%",background:isBest?"#CAFF4D":"#60A5FA",borderRadius:"2px 2px 0 0",height:h,opacity:.75}}/>
                    <div style={{fontSize:7,color:"#555761"}}>{pt.m}</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:9,color:"#60A5FA",fontWeight:600,textAlign:"center",opacity:.7}}>{lang==="en"?"Running performance HCP · consistent bad rounds raise it":lang==="es"?"HCP de rendimiento · rondas malas lo suben":"HCP de rendiment · rondes dolentes el pugen"}</div>
          </>
        }
      </div>

      {/* Score distribution */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:!hasRealGames?4:12}}>{tl("profile_dist")}</div>
        {!hasRealGames && <div style={{fontSize:10,color:"#555761",fontStyle:"italic",marginBottom:8,textAlign:"center"}}>{noDataMsg}</div>}
        {(()=>{
          const total=Object.values(dist).reduce((a,b)=>a+b,0)||1;
          return [
            {l:"Eagle+",v:dist.eagle,c:"#FBBF24"},
            {l:"Birdie", v:dist.birdie,c:"#60A5FA"},
            {l:"Par",    v:dist.par,  c:"#CAFF4D"},
            {l:"Bogey",  v:dist.bogey, c:"#9CA3AF"},
            {l:"Double", v:dist.double,c:"#EF4444"},
            {l:"Triple+",v:dist.triple,c:"#991B1B"},
          ].map(r=>(
            <div key={r.l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:46,fontSize:9,color:r.c,fontWeight:700,textAlign:"right",flexShrink:0}}>{r.l}</div>
              <div style={{flex:1,background:"#111214",borderRadius:3,height:7,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round((r.v/total)*100)}%`,background:r.c,borderRadius:3}}/>
              </div>
              <div style={{width:22,fontSize:9,color:"#555761",textAlign:"right",flexShrink:0}}>{r.v}</div>
            </div>
          ));
        })()}
      </div>

      {/* Best courses */}
      {bestCourses.length > 0 && (
        <div className="card" style={{marginBottom:12,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>{tl("profile_best_courses")}</div>
            {!hasRealGames && <div style={{fontSize:9,color:"#555761",fontStyle:"italic"}}>{noDataMsg}</div>}
          </div>
          {bestCourses.map((c,i)=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<bestCourses.length-1?"1px solid #111214":"none"}}>
              <div style={{fontSize:16,width:24,textAlign:"center",flexShrink:0}}>{["🏆","🥈","🥉",""][i]||`0${i+1}`}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:10,color:"#555761"}}>{c.played} {tl("profile_played")} · avg {c.avg>0?`+${c.avg}`:c.avg===0?"E":c.avg}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#CAFF4D",lineHeight:1}}>{c.best>0?`+${c.best}`:c.best===0?"E":c.best}</div>
                <div style={{fontSize:9,color:"#555761"}}>best</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CLOSE LIVE GAME ── */}
      {user && (
        <div className="card" style={{marginBottom:12,padding:"14px",borderColor:"rgba(239,68,68,.2)"}}>
          <div style={{fontSize:11,color:"#787C8A",marginBottom:10}}>
            Tens alguna partida en directe activa? Tanca-la si no estàs jugant.
          </div>
          <button onClick={async()=>{
            const {error}=await supabase.from("games").update({is_live:false}).eq("user_id",user.id).eq("is_live",true);
            if(!error) alert("Partides en directe tancades.");
            else alert("Error: "+error.message);
          }} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.07)",color:"#EF4444",fontWeight:700,fontSize:12,cursor:"pointer"}}>
            Tancar partida en directe
          </button>
        </div>
      )}

      {/* ── SEGUINT (follows) ── */}
      {user && (
        <div className="card" style={{marginBottom:12,padding:"14px"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>
            Els meus seguits ({follows?.length||0})
          </div>
          {(!follows || follows.length === 0) ? (
            <div style={{fontSize:11,color:"#555761",fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>
              Segueix jugadors des de la pantalla En Directe
            </div>
          ) : (
            follows.map(fid => {
              const name = followsNames?.[fid] || fid.slice(0,8)+"…";
              const initials = name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase() || "?";
              return (
                <div key={fid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #111214"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#1A1B1E",border:"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#CAFF4D",flexShrink:0}}>
                    {initials}
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,color:"#fff"}}>{name}</div>
                  <button onClick={()=>onFollow&&onFollow(fid)} style={{fontSize:10,fontWeight:700,color:"#EF4444",background:"none",border:"1px solid rgba(239,68,68,.3)",borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>
                    Deixar de seguir
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {user && (() => {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        const hasNotification = 'Notification' in window;
        const permission = hasNotification ? Notification.permission : null;
        if (isIOS && !isStandalone) return (
          <div className="card" style={{marginBottom:12,padding:"14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <Bell size={20} style={{color:"#CAFF4D",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Notificacions push</div>
                <div style={{fontSize:11,color:"#555761",lineHeight:1.5}}>
                  Per rebre avisos a iOS, afegeix l'app a la <b style={{color:"#ccc"}}>pantalla d'inici</b>:{" "}
                  toca <b style={{color:"#ccc"}}>Compartir</b> → <b style={{color:"#ccc"}}>Afegir a la pantalla d'inici</b> i torna a obrir-la des d'allà.
                </div>
              </div>
            </div>
          </div>
        );
        if (permission === 'granted') return (
          <div className="card" style={{marginBottom:12,padding:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Bell size={14} style={{color:"#CAFF4D"}}/>
              <div style={{flex:1,fontSize:13,fontWeight:600}}>Notificacions activades</div>
              <span style={{fontSize:10,color:"#CAFF4D",background:"rgba(202,255,77,.1)",border:"1px solid rgba(202,255,77,.3)",borderRadius:6,padding:"3px 8px",fontWeight:700}}>✓ ON</span>
            </div>
          </div>
        );
        return (
          <div className="card" style={{marginBottom:12,padding:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                  <Bell size={14} style={{color:"#CAFF4D"}}/> Notificacions push
                </div>
                <div style={{fontSize:11,color:"#555761",marginTop:3}}>Rep avisos quan els jugadors que segueixes acaben</div>
              </div>
              <button onClick={enableNotifications} style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(202,255,77,.3)",background:"rgba(202,255,77,.07)",color:"#CAFF4D",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                Activar
              </button>
            </div>
          </div>
        );
      })()}

      <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setScreen("home")}>{tl("back")}</button>
    </div>
  );
}
