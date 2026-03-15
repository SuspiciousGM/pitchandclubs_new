import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { TIERS, TOURNAMENTS_FALLBACK } from '../data/constants.js';

export default function TournamentsScreen({ openAuth, user, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [cat, setCat]           = useState("all");
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("id")
      .then(({ data }) => {
        if (data?.length) setLiveData(data.map(row => ({...row, dateS: row.date_s, minTier: row.min_tier})));
        setLoading(false);
        setLastSync(new Date());
      });
  }, []);

  const allTournaments = liveData ?? TOURNAMENTS_FALLBACK;
  const cats = [{id:"all",l:tl("cat_all")},{id:"open",l:tl("cat_open")}];
  const filtered = cat==="all" ? allTournaments : allTournaments.filter(t=>t.category===cat);

  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Competicions 2025</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>TORNEJOS <span className="lime">P&C</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
            {loading
              ? <span style={{fontSize:9,color:"#555761",fontWeight:700,letterSpacing:".06em"}}>↻ Sincronitzant...</span>
              : liveData
                ? <span style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#34D399",fontWeight:700,letterSpacing:".06em"}}>
                    <span style={{width:5,height:5,borderRadius:"50%",background:"#34D399",display:"inline-block",flexShrink:0}}/>
                    EN DIRECTE
                  </span>
                : <span style={{fontSize:9,color:"#EF4444",fontWeight:700,letterSpacing:".06em"}}>⚠ Fallback</span>
            }
          </div>
        </div>
      </div>
      {/* Category filter */}
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        {cats.map(c => (
          <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"6px 13px",borderRadius:100,border:`1px solid ${cat===c.id?"#CAFF4D":"#222327"}`,background:cat===c.id?"rgba(202,255,77,.1)":"transparent",color:cat===c.id?"#CAFF4D":"#555761",fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Inter",letterSpacing:".04em",flexShrink:0}}>{c.l}</button>
        ))}
      </div>
      {filtered.map(t => {
        const mt = TIERS.find(x=>x.id===t.minTier);
        const spotsLeft = t.left;
        const isFull = spotsLeft === 0;
        return (
          <div key={t.id} className="card" style={{padding:"15px",marginBottom:10,borderColor:t.status==="soon"?"#222327":spotsLeft<=5?"rgba(251,191,36,.3)":"#222327"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:3,background:t.status==="open"?"rgba(52,211,153,.15)":"rgba(96,165,250,.1)",color:t.status==="open"?"#34D399":"#60A5FA",border:`1px solid ${t.status==="open"?"rgba(52,211,153,.3)":"rgba(96,165,250,.2)"}`}}>
                    {t.status==="open"?tl("tourn_open"):tl("tourn_soon")}
                  </span>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#555761"}}>{t.category.toUpperCase()}</span>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                <div style={{fontSize:11,color:"#787C8A",marginTop:2}}>{t.course} · {t.location}</div>
              </div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",lineHeight:1}}>{t.dateS}</div>
                <div style={{fontSize:10,color:"#555761"}}>2025</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              <span className="pill" style={{fontSize:9}}>🏌️ {t.format}</span>
              <span className="pill" style={{fontSize:9,color:mt?.color,borderColor:mt?.border}}>Min: {mt?.emoji} {mt?.name}</span>
              <span className="pill" style={{fontSize:9}}>💰 {t.fee}</span>
              <span className="pill" style={{fontSize:9,color:"#CAFF4D",borderColor:"rgba(202,255,77,.25)"}}>🏅 {t.prize}</span>
            </div>
            {/* Spots bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:10,color:"#555761",fontWeight:500}}>{isFull?tl("tourn_full"):spotsLeft<=5?tl("tourn_last_spots",{n:spotsLeft}):tl("tourn_spots_left",{n:spotsLeft})}</span>
              <span style={{fontSize:10,color:"#555761"}}>{t.spots-t.left}/{t.spots}</span>
            </div>
            <div className="prog" style={{marginBottom:12}}>
              <div className="prog-fill" style={{width:`${((t.spots-t.left)/t.spots)*100}%`,background:spotsLeft<=5?"#FBBF24":"#CAFF4D"}}/>
            </div>
            {t.status==="open" ? (
              <button className="btn btn-primary" style={{fontSize:13,padding:"11px"}} disabled={isFull} onClick={!user?openAuth:undefined}>
                {isFull?tl("tourn_full"):!user?tl("tourn_join_first"):tl("tourn_inscribe")}
              </button>
            ) : (
              <button className="btn btn-ghost" style={{fontSize:12,padding:"10px"}} onClick={!user?openAuth:undefined}>Avisa'm quan s'obri →</button>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="card" style={{padding:"32px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>🏆</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:".04em"}}>Aviat hi haurà tornejos d'aquesta categoria</div>
        </div>
      )}
    </div>
  );
}
