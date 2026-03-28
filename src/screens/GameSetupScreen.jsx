import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { COURSES, GAME_MODES, PLAYER_COLORS } from '../data/constants.js';

export default function GameSetupScreen({ user, openAuth, onStart, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [courseQ, setCourseQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [selCourse, setSelCourse] = useState(null);
  const [customCourse, setCustomCourse] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHoles, setCustomHoles] = useState(18);
  const [customPar, setCustomPar] = useState(54);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gameMode, setGameMode] = useState("stableford");
  const [granadaConfig, setGranadaConfig] = useState({ betBase: 1, doubleHoles: [], granadaHole: null, decideLater: false });
  const [players, setPlayers] = useState([{ id:1, name: user?.name || "", isMe:true }]);
  const [teams, setTeams] = useState([{id:"A",players:[]},{id:"B",players:[]}]);
  const [playerSuggestions, setPlayerSuggestions] = useState({});
  const [focusedPlayerId, setFocusedPlayerId] = useState(null);
  const searchDebounce = useRef({});

  const searchPlayers = (playerId, query) => {
    clearTimeout(searchDebounce.current[playerId]);
    if (!query || query.trim().length < 1) {
      setPlayerSuggestions(ps => ({...ps, [playerId]: []}));
      return;
    }
    searchDebounce.current[playerId] = setTimeout(async () => {
      const q = query.trim();
      const excludedIds = new Set();
      if (user?.id) excludedIds.add(user.id);
      players.forEach(p => { if (p.userId) excludedIds.add(p.userId); });

      // Search profiles table — finds all registered users even with no games yet
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, club, avatar_url')
        .ilike('name', `%${q}%`)
        .limit(10);

      const results = (profilesData || [])
        .filter(p => p.name && !excludedIds.has(p.id))
        .slice(0, 6)
        .map(p => ({
          name: p.name,
          userId: p.id,
          initials: p.name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase(),
          isRegistered: true,
          avatarUrl: p.avatar_url || null,
          club: p.club || "",
        }));
      setPlayerSuggestions(ps=>({...ps,[playerId]:results}));
    }, 300);
  };

  // Sync player 1 name when user auth resolves after mount
  useEffect(() => {
    if (user?.name) setPlayers(p => p.map(x => x.isMe ? {...x, name: user.name} : x));
  }, [user?.name]);

  // Sync teams when gameMode switches to parelles
  useEffect(() => {
    if (gameMode === "parelles") {
      setTeams([
        {id:"A", players: players.slice(0,2).map(p=>p.id)},
        {id:"B", players: players.slice(2,4).map(p=>p.id)},
      ]);
    }
  }, [gameMode]);

  const activeCourse = customCourse || selCourse;

  const filtered = COURSES.filter(c => {
    if (courseQ.length < 1) return false;
    const q = courseQ.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.province.toLowerCase().includes(q);
  }).slice(0, 8);

  const addPlayer = () => {
    if (players.length >= 4) return;
    const newId = Date.now();
    const newPlayer = {id:newId, name:"", isMe:false, userId:null, isRegistered:false};
    setPlayers(p => [...p, newPlayer]);
    if (gameMode === "parelles") {
      // Fill Team A first (slots 0-1), then Team B (slots 2-3)
      const teamId = players.length < 2 ? "A" : "B";
      setTeams(ts => ts.map(t => t.id === teamId ? {...t, players:[...t.players, newId]} : t));
    }
  };
  const removePlayer = (id) => {
    setPlayers(p => p.filter(x => x.id !== id));
    setTeams(ts => ts.map(t => ({...t, players: t.players.filter(pid => pid !== id)})));
  };
  const updateName = (id, name) => setPlayers(p => p.map(x => x.id === id ? {...x, name, userId:null, isRegistered:false} : x));
  const selectSuggestion = (playerId, s) => {
    setPlayers(p => p.map(x => x.id === playerId ? {...x, name: s.name, userId: s.userId||null, isRegistered: !!s.userId} : x));
    setPlayerSuggestions(ps=>({...ps,[playerId]:[]}));
  };
  const switchTeam = (playerId) => {
    setTeams(ts => {
      const inA = ts[0].players.includes(playerId);
      if (inA) {
        return [{...ts[0], players:ts[0].players.filter(id=>id!==playerId)},{...ts[1], players:[...ts[1].players, playerId]}];
      } else {
        return [{...ts[0], players:[...ts[0].players, playerId]},{...ts[1], players:ts[1].players.filter(id=>id!==playerId)}];
      }
    });
  };
  const getPlayerTeam = (playerId) => teams[0].players.includes(playerId) ? "A" : teams[1].players.includes(playerId) ? "B" : null;

  const handleStart = () => {
    if (!activeCourse) return;
    if (players.some(p => !p.name?.trim())) {
      alert("Tots els jugadors han de tenir nom");
      return;
    }
    let playersWithTeam = players;
    if (gameMode === "parelles") {
      playersWithTeam = players.map(p => ({...p, teamId: getPlayerTeam(p.id)}));
    }
    // 9-hole courses are played twice (18 holes total)
    const effectiveCourse = activeCourse.holes === 9
      ? { ...activeCourse, holes: 18, par: activeCourse.par * 2 }
      : activeCourse;
    onStart({ course: effectiveCourse, date, gameMode, players: playersWithTeam, granadaConfig: gameMode === 'granada' ? granadaConfig : null });
  };

  return (
    <div className="page-scroll ani-up">
      {/* Guest banner */}
      {!user && (
        <div style={{background:"rgba(202,255,77,.07)",border:"1px solid rgba(202,255,77,.2)",borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:18,flexShrink:0}}>⚡</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#CAFF4D",marginBottom:2}}>Mode visitant — sense login</div>
            <div style={{fontSize:11,color:"#787C8A",lineHeight:1.5,fontWeight:400}}>Pots jugar ara. <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:600}} onClick={openAuth}>Crea un compte</span> per guardar l'historial i acumular punts.</div>
          </div>
        </div>
      )}

      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:".04em",marginBottom:2}}>Nova Partida</div>
        <div style={{fontSize:13,color:"#555761",fontWeight:400}}>{tl("setup_sub")}</div>
      </div>

      {/* DATE */}
      <div style={{marginBottom:16}}>
        <span className="label">{tl("label_date")}</span>
        <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} />
      </div>

      {/* COURSE SEARCH */}
      <div style={{marginBottom:16}}>
        <span className="label">{tl("label_course")} ({COURSES.length} {tl("course_hint").split(" ")[0]})</span>
        <div style={{position:"relative"}}>
          <input className="inp" placeholder="🔍  Cerca per nom, localitat o província..."
            value={courseQ}
            onChange={e=>{setCourseQ(e.target.value);setShowDrop(true);setSelCourse(null);setCustomCourse(null);}}
            onFocus={()=>setShowDrop(true)}
            style={{borderRadius:showDrop&&filtered.length?"8px 8px 0 0":8}}
          />
          {showDrop && courseQ.length >= 1 && (
            <div className="sdrop">
              {filtered.map(c=>(
                <div key={c.id} className="sdrop-item" onClick={()=>{setSelCourse(c);setCustomCourse(null);setCourseQ(c.name);setShowDrop(false);}}>
                  <div style={{fontWeight:600,fontSize:14}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#555761",marginTop:2,fontWeight:400}}>📍 {c.location}, {c.province} · {c.holes===9?`18H (2×9) · Par ${c.par*2}`:`${c.holes}H · Par ${c.par}`}</div>
                </div>
              ))}
              {filtered.length===0 && <div className="sdrop-item" style={{color:"#555761",fontStyle:"italic"}}>No trobat — configura'l manualment ↓</div>}
            </div>
          )}
        </div>
        {activeCourse && (
          <div style={{marginTop:6,display:"flex",alignItems:"center",gap:7}}>
            <span style={{color:"#CAFF4D",fontSize:14}}>✓</span>
            <span style={{fontWeight:600,fontSize:13}}>{activeCourse.name}</span>
            <span className="pill" style={{fontSize:10}}>{activeCourse.holes===9?`18H (2×9) · Par ${activeCourse.par*2}`:`${activeCourse.holes}H · Par ${activeCourse.par}`}</span>
          </div>
        )}

        <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={()=>setShowCustom(v=>!v)}>
          {showCustom?"▲ Tancar":"⚙ Camp personalitzat"}
        </button>

        {showCustom && (
          <div className="card ani-up" style={{marginTop:10,padding:"14px"}}>
            <span className="label">{tl("custom_name")}</span>
            <input className="inp" style={{marginBottom:10}} placeholder="Ex: Club de Golf de Lleida" value={customName} onChange={e=>setCustomName(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}>
                <span className="label">{tl("custom_holes")}</span>
                <select className="inp" value={customHoles} onChange={e=>{setCustomHoles(Number(e.target.value));setCustomPar(Number(e.target.value)===9?27:54);}}>
                  <option value={9}>9 forats</option>
                  <option value={18}>18 forats</option>
                </select>
              </div>
              <div style={{flex:1}}>
                <span className="label">{tl("custom_par")}</span>
                <select className="inp" value={customPar} onChange={e=>setCustomPar(Number(e.target.value))}>
                  {customHoles===9 ? [27,28,29,30].map(v=><option key={v} value={v}>Par {v}</option>) : [52,54,56,58,72].map(v=><option key={v} value={v}>Par {v}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{marginTop:12,fontSize:14}} disabled={!customName.trim()} onClick={()=>{setCustomCourse({name:customName,holes:customHoles,par:customPar});setSelCourse(null);setCourseQ(customName);setShowCustom(false);setShowDrop(false);}}>
              Confirmar camp
            </button>
          </div>
        )}
      </div>

      {/* GAME MODE */}
      <div style={{marginBottom:16}}>
        <span className="label">{tl("label_mode")}</span>
        <div style={{display:"flex",gap:8}}>
          {GAME_MODES.map(m => (
            <div key={m.id} className="card" style={{flex:1,padding:"11px 13px",cursor:"pointer",marginBottom:0,borderColor:gameMode===m.id?"#CAFF4D":"#222327",background:gameMode===m.id?"rgba(202,255,77,.06)":"#1A1B1E"}} onClick={()=>setGameMode(m.id)}>
              <div style={{fontWeight:700,fontSize:14}}>{m.label}</div>
              <div style={{fontSize:11,color:"#555761",fontWeight:400,marginTop:2}}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Granada config */}
      {gameMode === 'granada' && !user && (
        <div style={{marginTop:10,padding:"14px",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,textAlign:"center"}}>
          <div style={{fontSize:14,marginBottom:6}}>💣</div>
          <div style={{fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:4}}>{tl("granada_login_required")}</div>
          <button className="btn btn-primary btn-sm" style={{width:"auto",borderRadius:100,padding:"8px 18px",fontSize:12,marginTop:8}} onClick={openAuth}>{tl("cta_create_account")}</button>
        </div>
      )}
      {gameMode === 'granada' && user && (
        <div style={{marginTop:10,padding:"14px",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.25)",borderRadius:12}}>
          {/* Bet base */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#EF4444",marginBottom:8}}>{tl("granada_bet")}</div>
            <div style={{display:"flex",gap:8}}>
              {[0.5,1,2,5].map(b=>(
                <button key={b} onClick={()=>setGranadaConfig(c=>({...c,betBase:b}))}
                  style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1px solid ${granadaConfig.betBase===b?"#EF4444":"#333"}`,background:granadaConfig.betBase===b?"rgba(239,68,68,.15)":"#1A1B1E",color:granadaConfig.betBase===b?"#EF4444":"#787C8A",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {b}€
                </button>
              ))}
            </div>
          </div>
          {/* Decide later toggle */}
          <div style={{marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#111214",borderRadius:8}}>
            <div>
              <div style={{fontSize:12,fontWeight:600}}>{tl("granada_decide_later")}</div>
              <div style={{fontSize:10,color:"#555761",marginTop:1}}>Assigneu els forats especials sobre la marxa</div>
            </div>
            <button onClick={()=>setGranadaConfig(c=>({...c,decideLater:!c.decideLater}))}
              style={{width:40,height:22,borderRadius:11,background:granadaConfig.decideLater?"#EF4444":"#333",border:"none",cursor:"pointer",position:"relative",flexShrink:0,transition:"background .2s"}}>
              <span style={{position:"absolute",top:2,left:granadaConfig.decideLater?18:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",display:"block"}}/>
            </button>
          </div>
          {!granadaConfig.decideLater && (
            <>
              {/* Double holes */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#FBBF24",marginBottom:8}}>⚡ {tl("granada_double")} ({granadaConfig.doubleHoles.length}/3)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {Array.from({length:18},(_,i)=>i+1).map(n=>{
                    const isDouble = granadaConfig.doubleHoles.includes(n);
                    const isGranada = granadaConfig.granadaHole === n;
                    return (
                      <button key={n} onClick={()=>{
                        if (isGranada) return;
                        if (isDouble) setGranadaConfig(c=>({...c,doubleHoles:c.doubleHoles.filter(h=>h!==n)}));
                        else if (granadaConfig.doubleHoles.length < 3) setGranadaConfig(c=>({...c,doubleHoles:[...c.doubleHoles,n]}));
                      }}
                        style={{width:34,height:34,borderRadius:8,border:`1px solid ${isDouble?"#FBBF24":isGranada?"#EF4444":"#333"}`,background:isDouble?"rgba(251,191,36,.2)":isGranada?"rgba(239,68,68,.15)":"#1A1B1E",color:isDouble?"#FBBF24":isGranada?"#EF4444":"#555761",fontWeight:700,fontSize:12,cursor:isGranada?"default":"pointer"}}>
                        {isGranada?"💣":n}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Granada hole */}
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#EF4444",marginBottom:8}}>💣 {tl("granada_hole_label")} ({granadaConfig.granadaHole?'F'+granadaConfig.granadaHole:'cap'})</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {Array.from({length:18},(_,i)=>i+1).map(n=>{
                    const isGranada = granadaConfig.granadaHole === n;
                    const isDouble = granadaConfig.doubleHoles.includes(n);
                    return (
                      <button key={n} onClick={()=>{
                        if (isGranada) setGranadaConfig(c=>({...c,granadaHole:null}));
                        else {
                          setGranadaConfig(c=>({...c,granadaHole:n,doubleHoles:c.doubleHoles.filter(h=>h!==n)}));
                        }
                      }}
                        style={{width:34,height:34,borderRadius:8,border:`1px solid ${isGranada?"#EF4444":"#333"}`,background:isGranada?"rgba(239,68,68,.3)":"#1A1B1E",color:isGranada?"#EF4444":"#555761",fontWeight:700,fontSize:isGranada?16:12,cursor:"pointer"}}>
                        {isGranada?"💣":n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* PLAYERS */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span className="label" style={{marginBottom:0}}>{tl("label_players")} ({players.length}/{gameMode==="parelles"?4:4})</span>
          {players.length < 4 && <button className="btn btn-ghost btn-sm" onClick={addPlayer}>+ {tl("add_player")}</button>}
        </div>

        {gameMode === "parelles" ? (
          /* ── PARELLES team UI ── */
          <div>
            {[{id:"A",color:"#CAFF4D"},{id:"B",color:"#60A5FA"}].map(team => {
              const teamPlayers = players.filter(p => getPlayerTeam(p.id) === team.id);
              return (
                <div key={team.id} style={{marginBottom:10,padding:"12px",border:`1px dashed ${team.color}44`,borderRadius:10,background:`${team.color}08`}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:team.color,marginBottom:8}}>EQUIP {team.id}</div>
                  {teamPlayers.length === 0 && <div style={{fontSize:11,color:"#555761",fontStyle:"italic"}}>Sense jugadors</div>}
                  {teamPlayers.map((p,i) => {
                    const pi = players.findIndex(x=>x.id===p.id);
                    return (
                      <div key={p.id} style={{position:"relative",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:"50%",background:PLAYER_COLORS[pi],flexShrink:0}}/>
                          <input className="inp" style={{flex:1,minWidth:0,padding:"6px 0",fontSize:13,background:"transparent",border:"none",borderBottom:"1px solid #222327",borderRadius:0,color:"#fff"}}
                            placeholder={p.isMe?"El teu nom":"Cerca jugador registrat..."}
                            value={p.name}
                            onChange={e=>{updateName(p.id,e.target.value);if(!p.isMe)searchPlayers(p.id,e.target.value);}}
                            onFocus={()=>{setFocusedPlayerId(p.id);if(!p.isMe&&p.name?.trim().length>=1)searchPlayers(p.id,p.name);}}
                            onBlur={()=>setTimeout(()=>setFocusedPlayerId(null),200)}/>
                          {p.isMe && <span style={{fontSize:9,color:"#555761",fontWeight:600,flexShrink:0}}>TU</span>}
                          {p.isRegistered && !p.isMe && <span style={{fontSize:9,color:"#CAFF4D",fontWeight:700,flexShrink:0}}>✓</span>}
                          <button onClick={()=>switchTeam(p.id)} style={{background:"transparent",border:`1px solid ${team.color}55`,borderRadius:6,color:team.color,fontSize:10,fontWeight:700,cursor:"pointer",padding:"3px 7px",flexShrink:0,fontFamily:"Inter"}}>
                            {team.id==="A"?"→B":"←A"}
                          </button>
                          {!p.isMe && <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:16,padding:2,lineHeight:1,flexShrink:0}} onClick={()=>removePlayer(p.id)}>×</button>}
                        </div>
                        {!p.isMe && focusedPlayerId===p.id && (playerSuggestions[p.id]||[]).length>0 && (
                          <div style={{position:"absolute",left:0,right:0,top:"100%",zIndex:50,background:"#1A1B1E",border:"1px solid #333",borderRadius:8,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
                            <div style={{padding:"6px 12px 4px",fontSize:9,fontWeight:700,letterSpacing:".1em",color:"#555761",textTransform:"uppercase",borderBottom:"1px solid #222327"}}>Usuaris registrats</div>
                            {(playerSuggestions[p.id]||[]).map((s,si)=>(
                              <div key={si} onPointerDown={()=>selectSuggestion(p.id,s)}
                                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer",borderBottom:si<(playerSuggestions[p.id].length-1)?"1px solid #1a1a1f":"none"}}
                                onMouseEnter={e=>e.currentTarget.style.background="#222327"}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                <div style={{width:32,height:32,borderRadius:"50%",background:PLAYER_COLORS[pi],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{s.initials}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                                  {s.club && <div style={{fontSize:10,color:"#555761"}}>{s.club}</div>}
                                </div>
                                <span style={{fontSize:9,color:"#CAFF4D",fontWeight:700,flexShrink:0}}>✓</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {teamPlayers.length < 2 && <div style={{fontSize:10,color:"#555761",marginTop:4}}>• {2-teamPlayers.length} {lang==="en"?"slot":"lloc"}{2-teamPlayers.length>1?"s":""} lliure{2-teamPlayers.length>1?"s":""}</div>}
                </div>
              );
            })}
            {players.length < 4 && (
              <div style={{fontSize:11,color:"#EF4444",fontWeight:600,textAlign:"center",marginTop:4}}>
                {lang==="en"?`Add ${4-players.length} more player${4-players.length>1?"s":""}`:lang==="es"?`Añadir ${4-players.length} jugador${4-players.length>1?"es":"es"} más`:`Cal afegir ${4-players.length} jugador${4-players.length>1?"s":""} més`}
              </div>
            )}
          </div>
        ) : (
          /* ── Standard player list ── */
          players.map((p,i) => (
            <div key={p.id} style={{position:"relative",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"#1A1B1E",border:"1px solid #222327",borderRadius:8}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:PLAYER_COLORS[i],flexShrink:0}} />
                <input className="inp" style={{flex:1,minWidth:0,padding:"6px 0",fontSize:14,background:"transparent",border:"none",borderBottom:"1px solid #222327",borderRadius:0,color:"#fff"}}
                  placeholder={p.isMe ? "El teu nom" : "Cerca jugador registrat..."}
                  value={p.name}
                  onChange={e=>{updateName(p.id,e.target.value);if(!p.isMe)searchPlayers(p.id,e.target.value);}}
                  onFocus={()=>{setFocusedPlayerId(p.id);if(!p.isMe&&p.name?.trim().length>=1)searchPlayers(p.id,p.name);}}
                  onBlur={()=>setTimeout(()=>setFocusedPlayerId(null),200)}
                  autoFocus={!p.isMe && i===players.length-1}
                />
                {p.isMe && <span style={{fontSize:10,color:"#555761",fontWeight:600,flexShrink:0}}>TU</span>}
                {p.isRegistered && !p.isMe && <span style={{fontSize:9,color:"#CAFF4D",fontWeight:700,flexShrink:0}}>✓</span>}
                {!p.isMe && <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:18,padding:4,lineHeight:1,flexShrink:0}} onClick={()=>removePlayer(p.id)}>×</button>}
              </div>
              {!p.isMe && focusedPlayerId===p.id && (playerSuggestions[p.id]||[]).length>0 && (
                <div style={{position:"absolute",left:0,right:0,top:"100%",zIndex:50,background:"#1A1B1E",border:"1px solid #333",borderRadius:8,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
                  <div style={{padding:"6px 12px 4px",fontSize:9,fontWeight:700,letterSpacing:".1em",color:"#555761",textTransform:"uppercase",borderBottom:"1px solid #222327"}}>Usuaris registrats</div>
                  {(playerSuggestions[p.id]||[]).map((s,si)=>(
                    <div key={si} onPointerDown={()=>selectSuggestion(p.id,s)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer",borderBottom:si<(playerSuggestions[p.id].length-1)?"1px solid #1a1a1f":"none"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#222327"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:PLAYER_COLORS[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{s.initials}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                        {s.club && <div style={{fontSize:10,color:"#555761"}}>{s.club}</div>}
                      </div>
                      <span style={{fontSize:9,color:"#CAFF4D",fontWeight:700,flexShrink:0}}>✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* INFO */}
      <div style={{fontSize:11,color:"#555761",marginBottom:20,lineHeight:1.5}}>
        ℹ️ Tu portes el marcador. Tots els jugadors veuran la partida al seu historial.
      </div>

      <button className="btn btn-primary" disabled={!activeCourse || (gameMode==="parelles" && players.length < 4)} onClick={handleStart} style={{marginBottom:10,fontSize:17}}>
        {tl("start_game")}
      </button>
    </div>
  );
}
