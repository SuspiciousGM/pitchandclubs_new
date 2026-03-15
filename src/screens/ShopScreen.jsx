import React, { useState } from 'react';
import { t } from '../data/i18n.js';
import { PRODUCTS_DATA } from '../data/constants.js';

export default function ShopScreen({ openAuth, user, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [notified, setNotified] = useState({});

  return (
    <div className="page-scroll ani-up">
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>{tl("shop_sub")}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>
          {tl("shop_title").split(" ")[0]} <span style={{color:"#CAFF4D"}}>{tl("shop_title").split(" ").slice(1).join(" ")}</span>
        </div>
      </div>

      {/* Coming soon banner */}
      <div style={{background:"rgba(202,255,77,.06)",border:"1px solid rgba(202,255,77,.2)",borderRadius:12,padding:"18px 16px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:14}}>
        <div style={{fontSize:28,flexShrink:0,marginTop:2}}>🛒</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",letterSpacing:".04em",marginBottom:4}}>{tl("shop_soon_title")}</div>
          <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,marginBottom:12}}>{tl("shop_soon_desc")}</div>
          <button className="btn btn-primary" style={{fontSize:12,padding:"11px 16px",borderRadius:8}} onClick={!user?openAuth:undefined}>
            {user ? tl("shop_soon_btn_user") : tl("shop_soon_btn_guest")}
          </button>
        </div>
      </div>

      {/* Products preview */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:12}}>{tl("shop_preview")}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {PRODUCTS_DATA.map(p => (
          <div key={p.id} className="card" style={{padding:"14px 12px",position:"relative",overflow:"hidden",opacity:.85}}>
            {/* Coming soon overlay badge */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#CAFF4D,rgba(202,255,77,0))"}}/>
            <div style={{position:"absolute",top:9,right:9,fontSize:8,fontWeight:700,letterSpacing:".06em",
              textTransform:"uppercase",padding:"2px 7px",borderRadius:3,
              background:"rgba(202,255,77,.08)",color:"rgba(202,255,77,.5)",border:"1px solid rgba(202,255,77,.15)"}}>
              {tl("shop_soon_title")}
            </div>
            <div style={{fontSize:26,marginBottom:8,marginTop:2}}>{p.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,marginBottom:2,lineHeight:1.3,paddingRight:44}}>{p.name}</div>
            <div style={{fontSize:10,color:"#555761",marginBottom:10}}>{p.club}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#CAFF4D"}}>{p.price}</div>
              <span style={{fontSize:8,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",
                padding:"2px 7px",borderRadius:3,background:"rgba(202,255,77,.06)",color:"#555761",
                border:"1px solid #1A1B1E"}}>{p.tag}</span>
            </div>
            <button
              onClick={() => setNotified(n => ({...n,[p.id]:true}))}
              style={{width:"100%",padding:"8px 6px",borderRadius:7,border:"1px solid #222327",
                background:notified[p.id]?"rgba(202,255,77,.1)":"#111214",
                color:notified[p.id]?"#CAFF4D":"#555761",
                fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              {notified[p.id] ? "✓ Apuntat!" : (lang==="en"?"Notify me":lang==="es"?"Avisarme":"Avisa'm")}
            </button>
          </div>
        ))}
      </div>

      {/* 10% club info */}
      <div className="card" style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{fontSize:22,flexShrink:0,marginTop:2}}>💡</div>
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{tl("shop_club_title")}</div>
          <div style={{fontSize:11,color:"#787C8A",lineHeight:1.6}}>{tl("shop_club_desc")}</div>
        </div>
      </div>
    </div>
  );
}
