import React, { useState } from 'react';
import { Globe, X, LogOut } from 'lucide-react';
import { t } from '../data/i18n.js';
import { LANGS } from '../data/constants.js';
import { getTier } from '../utils/helpers.js';

export default function AppHeader({ screen, setScreen, user, openAuth, onSignOut, userPts, lang, setLang }) {
  const [showLang, setShowLang] = useState(false);
  const tl = (k) => t(lang, k);
  const tier = getTier(userPts);
  const isGameFlow = screen==="game-setup"||screen==="scorecard"||screen==="summary";
  return (
    <header className="app-header">
      <div className="header-logo" onClick={()=>setScreen("home")}>P<em>&</em>C</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {/* Language selector */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLang(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:4,background:"#1A1B1E",border:"1px solid #222327",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:10,fontWeight:700,color:"#787C8A",letterSpacing:".08em"}}>
            <Globe size={12} strokeWidth={2}/>{LANGS.find(l=>l.id===lang)?.label}
          </button>
          {showLang && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#1A1B1E",border:"1px solid #222327",borderRadius:8,overflow:"hidden",zIndex:200,minWidth:80}}>
              {LANGS.map(l=>(
                <button key={l.id} onClick={()=>{setLang(l.id);setShowLang(false);}}
                  style={{display:"block",width:"100%",padding:"9px 14px",fontSize:11,fontWeight:700,color:lang===l.id?"#CAFF4D":"#787C8A",background:lang===l.id?"rgba(202,255,77,.07)":"transparent",border:"none",cursor:"pointer",textAlign:"left",letterSpacing:".06em"}}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isGameFlow && (
          <button className="btn btn-sm btn-ghost" style={{width:"auto",display:"flex",alignItems:"center",gap:5}} onClick={()=>setScreen("home")}>
            <X size={14}/>{tl("exit")}
          </button>
        )}
        {user && !isGameFlow && (
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",padding:"4px 8px",borderRadius:8}} onClick={()=>setScreen("profile")}>
              <div style={{width:30,height:30,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  : user.name.split(" ").map(w=>w[0]).slice(0,2).join("")
                }
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,fontWeight:700,color:tier.color,letterSpacing:".06em",textTransform:"uppercase",lineHeight:1}}>{tier.emoji} {tier.name}</div>
                <div style={{fontSize:9,color:"#555761",lineHeight:1.4}}>{userPts} pts</div>
              </div>
            </div>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",color:"#555761",padding:"4px",display:"flex",alignItems:"center"}} title="Sign out">
              <LogOut size={14}/>
            </button>
          </div>
        )}
        {!user && !isGameFlow && (
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>openAuth("login")}
              style={{background:"transparent",border:"1px solid #2A2B30",borderRadius:100,padding:"6px 12px",fontSize:11,fontWeight:700,color:"#FFFFFF",cursor:"pointer",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"Inter"}}>
              {lang==="en"?"Login":lang==="es"?"Entrar":"Entra"}
            </button>
            <button className="btn btn-sm" style={{background:"#CAFF4D",color:"#0A0A0B",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:700,textTransform:"uppercase"}} onClick={()=>openAuth("register")}>
              {tl("cta_join")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
