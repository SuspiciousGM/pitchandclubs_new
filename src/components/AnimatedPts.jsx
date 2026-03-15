import React, { useState, useEffect, useRef } from 'react';

export default function AnimPts({ value, prev }) {
  const [disp, setDisp] = useState(value);
  const [dir,  setDir]  = useState(null);
  const [delta,setDelta]= useState(0);
  const init = useRef(true);
  useEffect(() => {
    if (init.current) { init.current=false; setDisp(value); return; }
    if (value===prev) return;
    const diff=value-prev;
    setDir(diff>0?'up':'dn'); setDelta(diff);
    const steps=Math.min(Math.abs(diff),12), step=diff/steps;
    let cur=prev, i=0;
    const iv=setInterval(()=>{
      i++; cur+=step; setDisp(Math.round(cur));
      if(i>=steps){clearInterval(iv);setDisp(value);setTimeout(()=>setDir(null),900);}
    },40);
    return ()=>clearInterval(iv);
  },[value]);
  const arrowCol = dir==='up'?'#CAFF4D':dir==='dn'?'#EF4444':'transparent';
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:1}}>
      <div style={{height:13,overflow:'hidden',opacity:dir?1:0,transition:'opacity .2s'}}>
        <div style={{fontSize:8,fontWeight:700,color:arrowCol,whiteSpace:'nowrap'}}>
          {dir==='up'?`▲ +${delta}`:`▼ ${delta}`} pts
        </div>
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:2}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:'#CAFF4D',lineHeight:1}}>{disp}</span>
        <span style={{fontSize:8,color:'#555',fontWeight:700,letterSpacing:'.07em',marginBottom:1}}>PTS</span>
      </div>
    </div>
  );
}
