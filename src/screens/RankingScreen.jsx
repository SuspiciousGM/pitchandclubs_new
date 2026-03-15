import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { getTier } from '../utils/helpers.js';
import { TIERS, LEADERBOARD } from '../data/constants.js';

export default function RankingScreen({ user, openAuth, setScreen, lang, follows, onFollow }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [liveRanking, setLiveRanking] = useState(null);
  const [clubLeaders, setClubLeaders] = useState([]);
  const [courseLeaders, setCourseLeaders] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("global");
  const goProfile = () => setScreen("profile");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // Global: aggregate points per user from games table
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("user_id, players, scores, created_at, course_name, date");
        if (gamesError) console.warn("P&C ranking query error:", gamesError.message);

        if (gamesData && !cancelled) {
          const userMap = {};
          gamesData.forEach(g => {
            const me = (g.players||[]).find(p => p.isMe);
            if (!me || !g.user_id) return;
            if (!userMap[g.user_id]) {
              userMap[g.user_id] = { name: me.name, pts: 0, scores: [], club: me.club||"", games: 0, avatarUrl: g.avatar_url || null };
            }
            // Keep the most recent avatar_url seen for this user
            if (g.avatar_url) userMap[g.user_id].avatarUrl = g.avatar_url;
            userMap[g.user_id].pts += (me.points || 0);
            userMap[g.user_id].games += 1;
            const d = me.diff;
            if (typeof d === "number" && !isNaN(d)) userMap[g.user_id].scores.push(d);
          });
          // Fetch profiles (avatar + club, source of truth)
          const userIds = Object.keys(userMap);
          const { data: profilesData } = await supabase
            .from("profiles").select("id, avatar_url, club").in("id", userIds);
          const profileAvatars = {};
          (profilesData || []).forEach(p => {
            if (p.avatar_url) profileAvatars[p.id] = p.avatar_url;
            if (p.club && userMap[p.id]) userMap[p.id].club = p.club; // prefer profiles club
          });

          const global = Object.entries(userMap)
            .map(([uid, v]) => ({
              uid, name: v.name, club: v.club,
              pts: v.pts, games: v.games,
              best: v.scores.length ? Math.min(...v.scores) : null,
              avatar: v.name.split(" ").map(w=>w[0]).slice(0,2).join(""),
              avatarUrl: profileAvatars[uid] || v.avatarUrl || null,
            }))
            .sort((a,b) => b.pts - a.pts)
            .map((p, i) => ({
              ...p, rank: i+1,
              color: ["#CAFF4D","#60A5FA","#A78BFA","#F472B6","#34D399","#FBBF24"][i%6],
            }));
          if (global.length) setLiveRanking(global);

          // Club leaderboard: group players by club, sum pts
          const clubMap = {};
          Object.entries(userMap).forEach(([uid, v]) => {
            const clubName = (v.club || "").trim();
            if (!clubName) return;
            const key = clubName.toLowerCase();
            if (!clubMap[key]) clubMap[key] = { name: clubName, pts: 0, members: 0, best: null, topPlayer: "", topAvatar: profileAvatars[uid] || null };
            clubMap[key].pts += v.pts;
            clubMap[key].members += 1;
            const bestScore = v.scores.length ? Math.min(...v.scores) : null;
            if (bestScore !== null && (clubMap[key].best === null || bestScore < clubMap[key].best)) {
              clubMap[key].best = bestScore;
              clubMap[key].topPlayer = v.name;
              clubMap[key].topAvatar = profileAvatars[uid] || null;
            }
          });
          if (!cancelled) setClubLeaders(Object.values(clubMap).sort((a,b) => b.pts - a.pts));

          // Course leaderboard: best score per course
          const courseMap = {};
          gamesData.forEach(g => {
            const me = (g.players||[]).find(p => p.isMe);
            if (!me || !g.user_id || !g.course_name) return;
            const d = me.diff;
            if (typeof d !== "number" || isNaN(d)) return;
            const cn = g.course_name;
            if (!courseMap[cn]) courseMap[cn] = { course: cn, best: null, bestPlayer: "", bestAvatar: "", date: "", games: 0 };
            courseMap[cn].games++;
            if (courseMap[cn].best === null || d < courseMap[cn].best) {
              courseMap[cn].best = d;
              courseMap[cn].bestPlayer = me.name;
              courseMap[cn].bestAvatar = me.name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
              courseMap[cn].date = g.date || "";
            }
          });
          if (!cancelled) setCourseLeaders(Object.values(courseMap).sort((a,b) => (a.best??999) - (b.best??999)));
        }
      } catch(e) {
        console.warn("P&C: Could not load ranking from Supabase:", e.message);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const MOCK_EXTRA = [
    { name:"Arnau Puig",  avatar:"AP", club:"Vallromanes",   pts:312, best:-3, color:"#60A5FA" },
    { name:"Marta Oller", avatar:"MO", club:"Mas Gurumbau",  pts:187, best:-1, color:"#F472B6" },
    { name:"Pere Vidal",  avatar:"PV", club:"Canal Olímpic", pts:94,  best: 0, color:"#FBBF24" },
  ];
  // Real players first; pad with mock players (no uid) to fill the board
  const base = liveRanking ? [...liveRanking, ...MOCK_EXTRA] : LEADERBOARD;
  const merged = base.sort((a,b) => b.pts - a.pts).map((p,i) => ({...p, rank:i+1}));
  const globalData = merged.slice(0, 10);
  const isLive     = !!liveRanking;
  // Current user's position (may be outside top 10)
  const myRow = user && liveRanking ? merged.find(p => p.uid === user.id) : null;
  const myInTop10 = myRow && myRow.rank <= 10;

  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>{tl("classification")}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,9vw,46px)",letterSpacing:".04em",lineHeight:1}}>RÀNQUING <span className="lime">P&C</span></div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".06em",display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
            {loading
              ? <span style={{color:"#555761"}}>↻ Carregant...</span>
              : isLive
                ? <><span style={{width:5,height:5,borderRadius:"50%",background:"#34D399",display:"inline-block"}}/><span style={{color:"#34D399"}}>LIVE</span></>
                : <span style={{color:"#555761"}}>DEMO</span>
            }
          </div>
        </div>
      </div>

      {/* ── TABS */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[{id:"global",label:"Global"},{id:"club",label:lang==="en"?"Clubs":lang==="es"?"Clubs":"Clubs"},{id:"course",label:lang==="en"?"Course":lang==="es"?"Campo":"Camp"}].map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{padding:"7px 18px",borderRadius:100,border:`1px solid ${activeTab===tab.id?"#CAFF4D":"#222327"}`,background:activeTab===tab.id?"rgba(202,255,77,.1)":"transparent",color:activeTab===tab.id?"#CAFF4D":"#555761",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Inter",letterSpacing:".04em"}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── COURSE LEADERBOARD */}
      {activeTab === "course" && (
        <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1A1B1E"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".06em",color:"#CAFF4D"}}>{lang==="en"?"BEST SCORE BY COURSE":lang==="es"?"MEJOR SCORE POR CAMPO":"MILLOR SCORE PER CAMP"}</div>
            <div style={{fontSize:10,color:"#555761",marginTop:1}}>{lang==="en"?"Course records on P&C":lang==="es"?"Récords de campo en P&C":"Rècords de camp a P&C"}</div>
          </div>
          {courseLeaders.length === 0 ? (
            <div style={{padding:"32px",textAlign:"center",color:"#555761",fontSize:13}}>
              {loading ? "Carregant…" : (lang==="en"?"No results yet":lang==="es"?"Sin resultados aún":"Encara no hi ha resultats")}
            </div>
          ) : courseLeaders.map((row, i) => {
            const diffFmt = row.best == null ? "—" : row.best > 0 ? `+${row.best}` : row.best === 0 ? "E" : `${row.best}`;
            const diffCol = row.best == null ? "#555761" : row.best < -1 ? "#FBBF24" : row.best === -1 ? "#60A5FA" : row.best === 0 ? "#CAFF4D" : "#EF4444";
            const colors = ["#CAFF4D","#60A5FA","#A78BFA","#F472B6","#34D399","#FBBF24"];
            const fmtDate = row.date ? row.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').slice(0,5) : "";
            const shortName = row.course.replace(/\s*Pitch\s*[&i]+\s*Putt/gi,"").replace(/\s*P&P/gi,"").replace(/\s*Golf\s*i\s*Pitch.*/gi," Golf").replace(/\s+/g," ").trim();
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid #111214"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"#2A2B30",width:22,flexShrink:0}}>{String(i+1).padStart(2,"0")}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortName || row.course}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:colors[i%6],display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{row.bestAvatar}</div>
                    <div style={{fontSize:10,color:"#787C8A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.bestPlayer}{fmtDate ? ` · ${fmtDate}` : ""}{row.games > 1 ? ` · ${row.games}p` : ""}</div>
                  </div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:diffCol,flexShrink:0}}>{diffFmt}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CLUB LEADERBOARD */}
      {activeTab === "club" && (
        <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1A1B1E"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".06em",color:"#CAFF4D"}}>RÀNQUING DE CLUBS</div>
            <div style={{fontSize:10,color:"#555761",marginTop:1}}>Punts acumulats per tots els membres</div>
          </div>
          {clubLeaders.length === 0 ? (
            <div style={{padding:"32px",textAlign:"center",color:"#555761",fontSize:13}}>
              {loading ? "Carregant…" : "Encara no hi ha clubs registrats"}
            </div>
          ) : clubLeaders.map((club, i) => {
            const colors = ["#CAFF4D","#60A5FA","#A78BFA","#F472B6","#34D399","#FBBF24"];
            const color = colors[i % 6];
            const bestFmt = club.best == null ? "—" : club.best > 0 ? `+${club.best}` : club.best === 0 ? "E" : `${club.best}`;
            const isMyClub = user?.club && user.club.toLowerCase() === club.name.toLowerCase();
            const initials = club.name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:"1px solid #111214",background:isMyClub?"rgba(202,255,77,.04)":"transparent"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:i===0?"#FBBF24":i===1?"#9CA3AF":i===2?"#CD7F32":"#2A2B30",width:22,flexShrink:0}}>{String(i+1).padStart(2,"0")}</div>
                <div style={{width:36,height:36,borderRadius:8,background:`${color}22`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:color,flexShrink:0}}>
                  {club.topAvatar ? <img src={club.topAvatar} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}} alt=""/> : initials}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isMyClub?"#CAFF4D":"#fff",display:"flex",alignItems:"center",gap:6}}>
                    {club.name}
                    {isMyClub && <span style={{fontSize:8,color:"#CAFF4D",fontWeight:700}}>TU</span>}
                  </div>
                  <div style={{fontSize:10,color:"#555761",marginTop:1}}>
                    {club.members} {club.members===1?"membre":"membres"}{club.topPlayer ? ` · Millor: ${club.topPlayer}` : ""}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",lineHeight:1}}>{club.pts}</div>
                  <div style={{fontSize:9,color:"#555761"}}>pts · millor {bestFmt}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LEADERBOARD */}
      {activeTab === "global" && (<>
      <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 44px 32px",padding:"7px 13px",borderBottom:"1px solid #1A1B1E",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
          <span>#</span><span>{lang==="en"?"Player":lang==="es"?"Jugador":"Jugador"}</span><span style={{textAlign:"center"}}>{lang==="en"?"Best":lang==="es"?"Mejor":"Millor"}</span><span style={{textAlign:"right"}}>Pts</span><span/>
        </div>
        {globalData.map((p,i) => {
          const tier = getTier(p.pts);
          const isMe = user && p.uid === user.id;
          const canFollow = user && p.uid && !isMe;
          const isFollowing = follows?.includes(p.uid);
          const bestFmt = p.best == null ? "—" : p.best > 0 ? `+${p.best}` : p.best === 0 ? "E" : `${p.best}`;
          return (
            <div key={p.rank} style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 44px 32px",alignItems:"center",padding:"10px 13px",borderBottom:"1px solid #111214",background:isMe?"rgba(202,255,77,.04)":"transparent"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:i===0?"#FBBF24":i===1?"#9CA3AF":i===2?"#CD7F32":"#2A2B30"}}>{String(p.rank).padStart(2,"0")}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0,border:isMe?"2px solid #CAFF4D":"none",overflow:"hidden"}}>
                  {p.avatarUrl ? <img src={p.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : p.avatar}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isMe?"#CAFF4D":"#fff",display:"flex",alignItems:"center",gap:5}}>
                    {p.name}{isMe&&<span style={{fontSize:8,color:"#CAFF4D",fontWeight:700}}>TU</span>}
                    {isMe&&user?.hcp!=null&&<span style={{fontSize:8,fontWeight:700,color:"#CAFF4D",background:"rgba(202,255,77,.12)",border:"1px solid rgba(202,255,77,.25)",borderRadius:4,padding:"0 4px",letterSpacing:".03em",flexShrink:0}}>HCP {user.hcp%1===0?user.hcp:user.hcp.toFixed(1)}</span>}
                  </div>
                  <div style={{fontSize:9,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tier.emoji} {tier.name}{p.club?` · ${p.club}`:""}{p.games?` · ${p.games}p`:""}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,textAlign:"center",color:p.best!=null&&p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{bestFmt}</div>
              <div style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#CAFF4D"}}>{p.pts}</div>
              <div style={{display:"flex",justifyContent:"center"}}>
                {canFollow && (
                  <button onClick={()=>onFollow&&onFollow(p.uid, p.name)}
                    style={{padding:"4px 5px",borderRadius:6,border:`1px solid ${isFollowing?"rgba(202,255,77,.3)":"#333"}`,background:isFollowing?"rgba(202,255,77,.08)":"transparent",color:isFollowing?"#CAFF4D":"#555",cursor:"pointer",display:"flex",alignItems:"center"}}>
                    <Bell size={10}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {/* Current user outside top 10 */}
        {myRow && !myInTop10 && (
          <>
            <div style={{padding:"5px 13px",background:"#111214",textAlign:"center",fontSize:9,color:"#2A2B30",letterSpacing:".06em"}}>· · ·</div>
            <div style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 44px 32px",alignItems:"center",padding:"10px 13px",background:"rgba(202,255,77,.04)"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:"#555761"}}>{String(myRow.rank).padStart(2,"0")}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:myRow.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0,border:"2px solid #CAFF4D",overflow:"hidden"}}>
                  {myRow.avatarUrl ? <img src={myRow.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : myRow.avatar}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:12,color:"#CAFF4D"}}>{myRow.name} <span style={{fontSize:8,fontWeight:700}}>TU</span></div>
                  <div style={{fontSize:9,color:"#555761"}}>{getTier(myRow.pts).emoji} {getTier(myRow.pts).name}{myRow.games?` · ${myRow.games}p`:""}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,textAlign:"center",color:myRow.best!=null&&myRow.best<0?"#CAFF4D":"#555761"}}>{myRow.best==null?"—":myRow.best>0?`+${myRow.best}`:myRow.best===0?"E":myRow.best}</div>
              <div style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#CAFF4D"}}>{myRow.pts}</div>
              <div/>
            </div>
          </>
        )}
        {!user && <div style={{padding:"11px 13px",background:"rgba(202,255,77,.04)",borderTop:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#787C8A"}}>{lang==="en"?"Create an account to appear in the ranking":lang==="es"?"Crea una cuenta para aparecer en el ranking":"Crea un compte per aparèixer al rànquing"}</span>
          <button className="btn btn-primary btn-sm" style={{borderRadius:100,padding:"7px 14px",fontSize:11,width:"auto"}} onClick={openAuth}>{lang==="en"?"Join →":lang==="es"?"Únete →":"Uneix-te →"}</button>
        </div>}
      </div>

      {/* ── SISTEMA DE NIVELLS ── */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>{tl("sec_levels")}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,28px)",letterSpacing:".04em",lineHeight:1,marginBottom:12}}>{tl("sec_levels_title")}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
          {TIERS.map((tier,di)=>{
            const descArr=[tl("tier_caddie_desc"),tl("tier_player_desc"),tl("tier_pro_desc"),tl("tier_master_desc")];
            return (
              <div key={tier.id} className="card" style={{padding:"14px 12px",textAlign:"center",borderColor:tier.border,background:tier.bg}}>
                <div style={{fontSize:24,marginBottom:4}}>{tier.emoji}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:tier.color,marginBottom:2}}>{tier.name}</div>
                <div style={{fontSize:9,color:"#555761",marginBottom:8,fontWeight:600}}>{tier.min}–{tier.max===99999?"∞":tier.max} pts</div>
                <div style={{fontSize:10,color:"#787C8A",lineHeight:1.5,fontWeight:400}}>{descArr[di]}</div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{tl("sec_points")}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {[{l:"Hole in One 🎯",p:"+25",c:"#FBBF24"},{l:"Birdie (−1)",p:"+12",c:"#60A5FA"},{l:"Par",p:"+6",c:"#CAFF4D"},{l:"Bogey (+1)",p:"+2",c:"#9CA3AF"},{l:tl("pts_tournament_win"),p:"+100",c:"#CAFF4D"},{l:tl("pts_inactivity"),p:"−15/m",c:"#EF4444"}].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#111214",borderRadius:7}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:r.p.startsWith("-")||r.p.startsWith("−")?"#EF4444":"#CAFF4D",width:38,textAlign:"right",flexShrink:0}}>{r.p}</div>
                <div style={{fontSize:11,color:"#787C8A",fontWeight:500}}>{r.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

    </div>
  );
}
