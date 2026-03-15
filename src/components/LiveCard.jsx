import React from 'react';
import { ScoreSymbol } from './ScoreSymbol.jsx';
import { PLAYER_COLORS } from '../data/constants.js';

export default function LiveGameCard({ game, compact, onClick }) {
  const diff = game.score_total ?? game.players?.find(p=>p.isMe)?.diff ?? 0;
  const scoreColor = diff < -1 ? "#FBBF24" : diff === -1 ? "#60A5FA" : diff === 0 ? "#CAFF4D" : "#EF4444";
  const pct = Math.round(((game.current_hole||1) / (game.holes||18)) * 100);

  if (compact) {
    return (
      <div className={`live-card${game.is_live?" is-live":""}`} onClick={onClick?()=>onClick(game):undefined} style={onClick?{cursor:"pointer"}:{}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:game.color||"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
            {game.avatar_url ? <img src={game.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : (game.avatar || (game.player_name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("") || "P")}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              {game.is_live && <span style={{width:5,height:5,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block",flexShrink:0}}/>}
              <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{game.player_name}</div>
            </div>
            <div style={{fontSize:10,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{game.course_name}</div>
            <div style={{height:3,background:"#111214",borderRadius:2,overflow:"hidden",marginTop:5}}>
              <div style={{height:"100%",width:`${pct}%`,background:game.is_live?"#EF4444":"#555761",borderRadius:2,transition:"width .5s"}}/>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:scoreColor,lineHeight:1}}>{diff>0?`+${diff}`:diff===0?"E":diff}</div>
            <div style={{fontSize:9,color:"#555761"}}>F{game.current_hole||"-"}/{game.holes||18}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`live-card${game.is_live?" is-live":""}`} onClick={onClick?()=>onClick(game):undefined} style={onClick?{cursor:"pointer"}:{}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:game.color||"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
            {game.avatar_url ? <img src={game.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : (game.avatar || (game.player_name||"P").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("") || "P")}
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              {game.is_live && (
                <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(239,68,68,.15)",color:"#EF4444",border:"1px solid rgba(239,68,68,.3)",borderRadius:3,padding:"1px 6px",display:"flex",alignItems:"center",gap:3}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> LIVE
                </span>
              )}
            </div>
            <div style={{fontWeight:700,fontSize:14}}>{game.player_name}</div>
            <div style={{fontSize:11,color:"#787C8A",marginTop:1}}>{game.course_name}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:scoreColor,lineHeight:1}}>{diff>0?`+${diff}`:diff===0?"E":diff}</div>
          <div style={{fontSize:10,color:"#555761"}}>Forat {game.current_hole||"-"}/{game.holes||18}</div>
        </div>
      </div>
      <div style={{height:4,background:"#111214",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:game.is_live?"#EF4444":"#555761",borderRadius:2,transition:"width .5s"}}/>
      </div>
      {onClick && game.is_live && (
        <button onClick={e=>{e.stopPropagation();onClick(game);}}
          style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",
            background:"rgba(239,68,68,.07)",color:"#EF4444",fontSize:11,fontWeight:700,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,letterSpacing:".04em"}}>
          Seguir en directe
        </button>
      )}
    </div>
  );
}
