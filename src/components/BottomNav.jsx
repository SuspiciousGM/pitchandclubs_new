import React from 'react';
import { Home, BarChart2, Activity, User, Flag } from 'lucide-react';
import { t } from '../data/i18n.js';

export default function BottomNav({ screen, setScreen, lang, gameData }) {
  const isGame = screen==="game-setup"||screen==="scorecard"||screen==="summary";
  const hasActiveGame = !!gameData;
  const lbl = (k) => t(lang,k);
  return (
    <nav className="bottom-nav">
      <button className={`nav-item${screen==="home"?" active":""}`} onClick={()=>setScreen("home")}>
        <Home size={21} strokeWidth={screen==="home"?2.5:1.8}/><span>{lbl("nav_home")}</span>
      </button>
      <button className={`nav-item${screen==="ranking"?" active":""}`} onClick={()=>setScreen("ranking")}>
        <BarChart2 size={21} strokeWidth={screen==="ranking"?2.5:1.8}/><span>{lbl("nav_ranking")}</span>
      </button>
      <button onClick={()=>setScreen(hasActiveGame?"scorecard":"game-setup")}
        style={{flex:"0 0 56px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
          border:"none",background:"transparent",cursor:"pointer",padding:"4px 0",gap:3,paddingTop:2}}>
        <div style={{position:"relative",width:48,height:48,flexShrink:0,marginTop:-18}}>
          <div style={{width:48,height:48,background:"#CAFF4D",borderRadius:"50%",display:"flex",alignItems:"center",
            justifyContent:"center",
            boxShadow:"0 0 0 3px #111214, 0 6px 20px rgba(202,255,77,.45)"}}>
            <Flag size={20} strokeWidth={2.5} color="#0A0A0B"/>
          </div>
          {hasActiveGame && !isGame && (
            <span style={{position:"absolute",top:0,right:0,width:10,height:10,borderRadius:"50%",
              background:"#EF4444",border:"2px solid #111214",display:"block"}}/>
          )}
        </div>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",
          color:isGame?"#CAFF4D":"#555761"}}>{lbl("nav_game")}</span>
      </button>
      <button className={`nav-item${screen==="live"?" active":""}`} onClick={()=>setScreen("live")}>
        <Activity size={21} strokeWidth={screen==="live"?2.5:1.8}/>
        <span>{lbl("nav_live")}</span>
      </button>
      <button className={`nav-item${screen==="profile"?" active":""}`} onClick={()=>setScreen("profile")}>
        <User size={21} strokeWidth={screen==="profile"?2.5:1.8}/><span>{lbl("nav_profile")}</span>
      </button>
    </nav>
  );
}
