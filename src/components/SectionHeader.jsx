import React from 'react';

export default function SectionHeader({ sub, title, limeWord }) {
  return (
    <div style={{marginBottom:14,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{sub}</div>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,32px)",letterSpacing:".04em",lineHeight:1}}>
        {title}{limeWord&&<> <span style={{color:"#CAFF4D"}}>{limeWord}</span></>}
      </div>
    </div>
  );
}
