import React, { useState } from 'react';
import { Flag, TrendingUp, ShoppingBag, User, Zap, Target, Activity, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';
import { getTier, getTierPct } from '../utils/helpers.js';
import { TIERS } from '../data/constants.js';
import SectionHeader from '../components/SectionHeader.jsx';
import TierBadge from '../components/TierBadge.jsx';
import LiveGameCard from '../components/LiveCard.jsx';

export default function HomeScreen({ user, userPts, history, setScreen, openAuth, leads, lang, activeGame, onResumeGame, activityFeed, liveGames, onSelectGame }) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [liked, setLiked] = useState({});
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(x=>x.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const myGames = history.filter(g=>g.players.some(p=>p.isMe));
  // A complete game has a valid numeric diff (not NaN/null) for the "me" player
  const isComplete = g => { const d = g.players.find(p=>p.isMe)?.diff; return typeof d === "number" && !isNaN(d); };
  const completedGames = myGames.filter(isComplete);
  const myScores = completedGames.map(g=>g.players.find(p=>p.isMe).diff);
  const bestGame = myScores.length ? Math.min(...myScores) : null;
  const tl = (k,v={}) => t(lang,k,v);

  // ── GUEST LANDING PAGE ──
  if (!user) return (
    <div className="page-scroll" style={{padding:0}}>
      <style>{`
        .guest-features{display:flex;flex-direction:column;}
        @media(min-width:640px){
          .guest-landing-inner{max-width:500px;margin:0 auto;}
          .guest-features{flex-direction:row;}
          .guest-features-item{flex:1;border-bottom:none!important;border-right:1px solid rgba(202,255,77,.12);}
          .guest-features-item:last-child{border-right:none!important;}
        }
      `}</style>
      <div style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Background photo */}
        <div style={{
          position:"absolute",inset:0,
          backgroundImage:"url('/hero-bg.jpg')",
          backgroundSize:"cover",backgroundPosition:"center",zIndex:0,
        }}/>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1}}/>

        {/* Hero content */}
        <div className="guest-landing-inner" style={{
          position:"relative",zIndex:2,
          flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          padding:"64px 24px 0",textAlign:"center",width:"100%",boxSizing:"border-box",
        }}>
          {/* Logo */}
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(50px,14vw,86px)",lineHeight:.88,letterSpacing:".02em",marginBottom:14}}>
            PITCH<span style={{color:"#CAFF4D"}}>&amp;</span>CLUBS<span style={{color:"#CAFF4D",fontSize:".42em",verticalAlign:"top",lineHeight:2.1}}>●</span>
          </div>
          {/* Subtitle */}
          <div style={{fontSize:15,fontWeight:300,color:"rgba(255,255,255,.85)",marginBottom:18,letterSpacing:".015em"}}>
            {lang==="en"?"Your golfers' community.":lang==="es"?"Tu comunidad de jugadores.":"La teva comunitat de jugadors."}
          </div>
          {/* Separator */}
          <div style={{width:"70%",maxWidth:260,height:1,background:"rgba(255,255,255,.2)",marginBottom:18}}/>
          {/* Body text */}
          <div style={{fontSize:14,color:"rgba(255,255,255,.75)",lineHeight:1.75,marginBottom:38,maxWidth:300,textShadow:"0 1px 6px rgba(0,0,0,.8)"}}>
            {lang==="en"?"Record every round, improve your swing and boost your club.":lang==="es"?"Registra cada partida, mejora tu swing e impulsa tu club.":"Registra cada partida, millora el teu swing i impulsa el teu club."}
          </div>

          {/* Buttons */}
          <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:11}}>
            {/* NOVA PARTIDA */}
            <button onClick={()=>setScreen("game-setup")} style={{
              width:"100%",padding:"15px 24px",borderRadius:50,border:"none",
              background:"#CAFF4D",color:"#0A0A0B",
              fontFamily:"'Bebas Neue'",fontSize:19,letterSpacing:".1em",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            }}>
              <Flag size={19} strokeWidth={2.5}/>
              {lang==="en"?"NEW GAME":lang==="es"?"NUEVA PARTIDA":"NOVA PARTIDA"}
            </button>
            {/* CREA UN COMPTE */}
            <button onClick={openAuth} style={{
              width:"100%",padding:"14px 24px",borderRadius:50,
              border:"1.5px solid rgba(255,255,255,.65)",
              background:"rgba(0,0,0,.25)",color:"#fff",
              fontFamily:"'Bebas Neue'",fontSize:19,letterSpacing:".1em",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            }}>
              <User size={17}/>
              {lang==="en"?"CREATE ACCOUNT":lang==="es"?"CREA UNA CUENTA":"CREA UN COMPTE"}
            </button>
            {/* Entra amb Google */}
            <button onClick={async()=>{ await supabase.auth.signInWithOAuth({ provider:"google", options:{redirectTo:window.location.origin} }); }} style={{
              width:"100%",padding:"12px 24px",borderRadius:50,border:"none",
              background:"rgba(238,238,238,.92)",color:"#111",
              fontSize:13,fontWeight:600,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            }}>
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              {lang==="en"?"Sign in with Google":lang==="es"?"Entrar con Google":"Entra amb Google"}
            </button>
          </div>
        </div>

        {/* Features panel */}
        <div style={{
          position:"relative",zIndex:2,
          marginTop:52,
          background:"rgba(15,16,18,0.92)",
          borderRadius:"40px 40px 0 0",
          padding:"36px 24px calc(90px + env(safe-area-inset-bottom))",
        }}>
          <div className="guest-features">
            {[
              {
                icon:<Flag size={28} strokeWidth={1.5}/>,
                title:lang==="en"?"TRACK YOUR ROUND":lang==="es"?"REGISTRA LA PARTIDA":"REGISTRA LA PARTIDA",
                desc:lang==="en"?"Live virtual scorecard. Pick from 61 courses and save every shot.":lang==="es"?"Tarjeta virtual en directo. Elige entre 61 campos y guarda cada golpe.":"Targeta virtual en directe. Tria entre 61 camps i guarda cada cop.",
              },
              {
                icon:<TrendingUp size={28} strokeWidth={1.5}/>,
                title:lang==="en"?"CLIMB THE RANKING":lang==="es"?"PUJA AL RÀNQUING":"PUJA AL RÀNQUING",
                desc:lang==="en"?"Earn points and lead the P&C ranking. Caddie - Player - Pro - Master.":lang==="es"?"Suma puntos y lidera el ránking P&C. Caddie - Player - Pro - Master.":"Suma punts i lidera el rànquing P&C. Caddie - Player - Pro - Master.",
              },
              {
                icon:<ShoppingBag size={28} strokeWidth={1.5}/>,
                title:lang==="en"?"BOOST YOUR CLUB":lang==="es"?"IMPULSA EL TU CLUB":"IMPULSA EL TEU CLUB",
                desc:lang==="en"?"Play against the best and share your rounds.":lang==="es"?"Juega contra los mejores y comparte tus partidas.":"Juga contra els millors i comparteix les teves partides.",
              },
            ].map((f,i,arr)=>(
              <div key={i} className="guest-features-item" style={{
                textAlign:"center",
                padding:"28px 16px",
                borderBottom:i<arr.length-1?"1px solid rgba(202,255,77,.12)":"none",
              }}>
                <div style={{color:"#CAFF4D",display:"flex",justifyContent:"center",marginBottom:14}}>{f.icon}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:".08em",color:"#fff",marginBottom:8}}>{f.title}</div>
                <div style={{fontSize:12,color:"#787C8A",lineHeight:1.7}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-scroll ani-up">

      {/* ── PARTIDA EN CURS ── */}
      {activeGame && (
        <div onClick={onResumeGame} style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'rgba(202,255,77,.08)',border:'1px solid rgba(202,255,77,.3)',
          borderRadius:10,padding:'12px 14px',marginBottom:14,cursor:'pointer',
        }}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#CAFF4D',marginBottom:2}}>
              ⛳ {lang==='en'?'Game in progress':lang==='es'?'Partida en curso':'Partida en curs'}
            </div>
            <div style={{fontSize:13,fontWeight:600}}>{activeGame.course?.name}</div>
          </div>
          <div style={{
            background:'#CAFF4D',color:'#0A0A0B',borderRadius:8,
            padding:'7px 14px',fontSize:11,fontWeight:700,flexShrink:0,
          }}>
            {lang==='en'?'Resume →':lang==='es'?'Continuar →':'Continuar →'}
          </div>
        </div>
      )}

      {/* ── HERO TITLE — always visible ── */}
      <div style={{paddingTop:4,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <div className="live-dot"/>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
            {tl("hero_live",{n:234+leads.current.length})}
          </span>
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(44px,12vw,80px)",lineHeight:.85,marginBottom:8,letterSpacing:"-.01em"}}>
          {tl("hero_title")}
        </div>
        <div style={{fontSize:13,color:"#787C8A",fontWeight:500,letterSpacing:".01em"}}>{tl("hero_sub")}</div>
      </div>

      {/* ── PLAYER CARD (logged in) / GUEST CTA ── */}
      {user ? (
        <div className="card card-lime" style={{marginBottom:14,background:`linear-gradient(135deg,${tier.bg} 0%,rgba(17,18,20,0) 100%)`,borderColor:tier.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#555761",fontWeight:500,marginBottom:4}}>
                {lang==="ca"?"Hola de nou,":lang==="es"?"Hola de nuevo,":"Welcome back,"}
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:".04em",lineHeight:1}}>{user.name}</div>
              {user.club && <div style={{fontSize:11,color:"#787C8A",marginTop:2}}>{user.club}</div>}
            </div>
            <div style={{fontSize:44,lineHeight:1}}>{tier.emoji}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            <TierBadge tierId={tier.id}/>
            <span className="pill" style={{color:tier.color,display:"flex",alignItems:"center",gap:4}}>
              <Zap size={11} strokeWidth={2.5}/>{userPts} pts
            </span>
          </div>
          {nextTier ? (
            <>
              <div style={{fontSize:11,color:"#555761",marginBottom:5}}>
                {nextTier.min-userPts} {tl("pts_to")} <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name} {nextTier.emoji}</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:tier.color}}/></div>
            </>
          ) : <div style={{fontSize:12,color:"#CAFF4D",fontWeight:700}}>{tl("tier_max")}</div>}
          <button className="btn btn-ghost btn-sm" style={{marginTop:12,fontSize:11,width:"auto",borderRadius:100,display:"flex",alignItems:"center",gap:5}} onClick={()=>setScreen("profile")}>
            <TrendingUp size={12}/>{tl("cta_stats")}
          </button>
        </div>
      ) : null}

      {/* ── PRIMARY CTA ── */}
      <button className="btn btn-primary" style={{marginBottom:10,fontSize:14}}
        onClick={()=>setScreen("game-setup")}>
        <Flag size={18} strokeWidth={2.5}/>{tl("cta_new_game")}
      </button>
      {!user && (
        <button className="btn btn-ghost" style={{marginBottom:16,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={openAuth}>
          <User size={14}/>{tl("cta_create_account")}
        </button>
      )}

      {/* ── QUICK STATS ── */}
      {myGames.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{l:tl("stat_games"),v:completedGames.length,icon:<Activity size={14}/>},
            {l:tl("stat_best"),v:bestGame!==null&&!isNaN(bestGame)?(bestGame>0?`+${bestGame}`:`${bestGame}`):"—",icon:<TrendingUp size={14}/>},
            {l:tl("stat_holes"),v:completedGames.reduce((a,g)=>a+g.scores.length,0),icon:<Target size={14}/>}].map(s=>(
            <div key={s.l} className="card" style={{padding:"12px 8px",textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:4,color:"#555761"}}>{s.icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,color:"#555761",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ÚLTIMES PARTIDES ── */}
      {completedGames.length > 0 && (
        <div style={{marginBottom:16}}>
          <SectionHeader sub={tl("sec_activity")} title={tl("sec_last_games")}/>
          {completedGames.slice(0,3).map(g=>{
            const me = g.players.find(p=>p.isMe);
            return (
              <div key={g.id} className="card card-press" style={{padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.course}</div>
                    <div style={{fontSize:11,color:"#555761",marginTop:2}}>
                      {g.scores.length} {tl("holes_label")}
                    </div>
                  </div>
                  {me && <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:26,lineHeight:1,color:me.diff<0?"#FBBF24":me.diff===0?"#CAFF4D":"#FFFFFF"}}>{me.diff>0?`+${me.diff}`:me.diff}</div>
                    <div style={{fontSize:10,color:"#CAFF4D",fontWeight:700,display:"flex",alignItems:"center",gap:2,justifyContent:"flex-end"}}><Zap size={9}/>+{me.points} pts</div>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myGames.length===0 && !user && (
        <div className="card" style={{textAlign:"center",padding:"28px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,color:"#2A2B30"}}><Flag size={40} strokeWidth={1}/></div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",marginBottom:6}}>{tl("no_games")}</div>
          <div style={{fontSize:12,color:"#555761",lineHeight:1.6,marginBottom:14}}>{tl("no_games_sub")}</div>
          <button className="btn btn-ghost btn-sm" style={{width:"auto",margin:"0 auto"}} onClick={()=>setScreen("game-setup")}>{tl("cta_register_now")}</button>
        </div>
      )}

      {myGames.length===0 && user && (
        <div className="card" style={{textAlign:"center",padding:"32px 20px",marginBottom:16,borderColor:"rgba(202,255,77,.15)"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14,color:"#CAFF4D"}}><Flag size={36} strokeWidth={1.5}/></div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:".06em",marginBottom:8}}>
            {lang==="en"?"START PLAYING.":lang==="es"?"EMPIEZA A JUGAR.":"COMENÇA A JUGAR."}
          </div>
          <div style={{fontSize:13,color:"#787C8A",lineHeight:1.75,marginBottom:20,maxWidth:260,margin:"0 auto 20px"}}>
            {lang==="en"
              ? "Every round feeds your game. Track your first round today and start building your story."
              : lang==="es"
              ? "Cada partida nutre tu juego. Registra la primera hoy y empieza a construir tu historial."
              : "Cada partida millora el teu joc. Registra la primera avui i comença a construir la teva història."}
          </div>
          <button className="btn btn-primary" style={{width:"auto",margin:"0 auto",padding:"14px 28px",fontSize:14}} onClick={()=>setScreen("game-setup")}>
            {tl("cta_new_game")} →
          </button>
        </div>
      )}

      {/* ── LIVE EN DIRECTE preview ── */}
      {(() => {
        const livePrev = (liveGames||[]).filter(g=>g.is_live).slice(0,3);
        return livePrev.length > 0 ? (
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761"}}>En directe</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(18px,4.5vw,28px)",letterSpacing:".04em",lineHeight:1}}>LIVE ARA</div>
              </div>
              <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#EF4444",cursor:"pointer",border:"none",background:"none",display:"flex",alignItems:"center",gap:4}} onClick={()=>setScreen("live")}>
                Tot <ChevronRight size={13}/>
              </button>
            </div>
            {livePrev.map(g=><LiveGameCard key={g.id} game={g} compact onClick={g=>{ if(!user){openAuth();return;} if(onSelectGame)onSelectGame(g); }}/>)}
          </div>
        ) : null;
      })()}

      {/* ── TESTIMONIALS ── */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:10}}>
          {lang==="en"?"WHAT THE COMMUNITY SAYS":lang==="es"?"LO QUE DICE LA COMUNIDAD":"EL QUE DIU LA COMUNITAT"}
        </div>
        <div style={{display:"flex",gap:10,overflowX:"auto",scrollSnapType:"x mandatory",paddingBottom:4,WebkitOverflowScrolling:"touch"}}
          className="noscroll">
          {[
            {initials:"GR",color:"#34D399",quote:lang==="en"?"Finally a pitch & putt app made by players":lang==="es"?"Por fin una app de pitch & putt hecha por jugadores":"Finalment una app de pitch & putt feta per jugadors",author:"Gerard R.",club:"Vallromanes"},
            {initials:"MO",color:"#60A5FA",quote:lang==="en"?"The live ranking makes every hole count":lang==="es"?"El ranking en directo hace que cada hoyo cuente":"El rànquing en directe fa que cada forat compti",author:"Marta O.",club:"Mas Gurumbau"},
            {initials:"JV",color:"#A78BFA",quote:lang==="en"?"The best way to track my handicap progress":lang==="es"?"La mejor manera de seguir la progresión de mi hándicap":"La millor manera de seguir la progressió del meu hàndicap",author:"Jordi V.",club:"Àccura Teià"},
            {initials:"AP",color:"#CAFF4D",quote:lang==="en"?"Signing up took 30 seconds and now I can\'t stop checking my ranking":lang==="es"?"Me registré en 30 segundos y ahora no puedo dejar de mirar el ranking":"Em vaig registrar en 30 segons i ara no paro de mirar el rànquing",author:"Anna P.",club:"Prat de Llobregat"},
            {initials:"RF",color:"#FBBF24",quote:lang==="en"?"Playing in tournaments has never been this fun":lang==="es"?"Jugar en torneos nunca había sido tan divertido":"Mai havia sigut tan divertit jugar en tornejos",author:"Raimon F.",club:"Canal Olímpic"},
          ].map((testimonial,i)=>(
            <div key={i} style={{minWidth:280,background:"#111118",borderLeft:`3px solid ${testimonial.color}`,borderRadius:"0 8px 8px 0",padding:"14px",scrollSnapAlign:"start",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:testimonial.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{testimonial.initials}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>{testimonial.author}</div>
                  <div style={{fontSize:10,color:"#555761"}}>{testimonial.club}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:"#D1D5DB",lineHeight:1.6,fontWeight:400,fontStyle:"italic",marginBottom:8}}>"{testimonial.quote}"</div>
              <div style={{fontSize:12,color:"#FBBF24"}}>★★★★★</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COM FUNCIONA ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub={tl("sec_how")} title={tl("sec_how_title")}/>
        {[[<Flag size={16}/>,tl("step1_t"),tl("step1_d")],[<TrendingUp size={16}/>,tl("step2_t"),tl("step2_d")],[<ShoppingBag size={16}/>,tl("step3_t"),tl("step3_d")]].map(([icon,title,desc],i)=>(
          <div key={i} className="card" style={{padding:"14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{color:"#CAFF4D",display:"flex",alignItems:"center",flexShrink:0}}>{icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:".04em"}}>{title}</div>
            </div>
            <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,fontWeight:400}}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── BOTIGA AVIAT ── */}
      <div className="card card-lime" style={{padding:"16px",marginBottom:16,display:"flex",gap:14,alignItems:"center"}}>
        <ShoppingBag size={22} color="#CAFF4D" style={{flexShrink:0}}/>
        <div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".04em",marginBottom:3}}>{lang==="en"?"P&C Shop — Coming Soon":lang==="es"?"Tienda P&C — Próximamente":"Botiga P&C — Aviat"}</div>
          <div style={{fontSize:11,color:"#787C8A",lineHeight:1.5}}>{lang==="en"?"Official kit & gear. 10% of every purchase goes to your club.":lang==="es"?"Kit oficial y equipamiento. El 10% de cada compra va a tu club.":"Kit oficial i equipament. El 10% de cada compra va al teu club."}</div>
        </div>
      </div>

      {/* ── READY TO PLAY ── */}
      <div style={{marginTop:14,background:"#CAFF4D",borderRadius:12,padding:"28px 18px",textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,9vw,52px)",color:"#0A0A0B",letterSpacing:".04em",lineHeight:.9,marginBottom:10}}>{tl("cta_ready")}</div>
        <p style={{fontSize:12,color:"rgba(10,10,11,.6)",marginBottom:16,fontWeight:500}}>{tl("cta_ready_sub")}</p>
        {!emailSent ? (
          <div style={{display:"flex",gap:8,maxWidth:300,margin:"0 auto 12px"}}>
            <input className="inp" style={{flex:1,fontSize:13,background:"rgba(255,255,255,.35)",border:"1px solid rgba(0,0,0,.12)",color:"#0A0A0B"}} type="email" placeholder="email@..." value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&(setEmailSent(true),leads.current.push(email))}/>
            <button className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:8,padding:"0 13px",flexShrink:0}} onClick={()=>{if(email.includes("@")){setEmailSent(true);leads.current.push(email);}}}><ArrowRight size={16}/></button>
          </div>
        ) : <div style={{fontSize:12,fontWeight:700,color:"#0A0A0B",marginBottom:12}}>{lang==="en"?"Noted! You're on the list.":lang==="es"?"¡Apuntado! Te avisamos pronto.":"Apuntat! T'avisem aviat."} {234+leads.current.length} {lang==="en"?"players":"jugadors"}.</div>}
        <button className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:10,fontSize:13,fontWeight:700,padding:"13px 24px",display:"inline-flex",alignItems:"center",gap:7}} onClick={()=>setScreen("game-setup")}>
          <Flag size={16} strokeWidth={2.5}/>{tl("cta_ready_btn")}
        </button>
      </div>
    </div>
  );
}
