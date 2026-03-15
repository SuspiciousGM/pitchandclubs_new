import React from 'react';

export function ScoreSymbol({ v, par, size=24 }) {
  if (v==null) return (
    <div style={{width:size,height:size,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:size*.52,color:'#252530',lineHeight:1}}>·</span>
    </div>
  );
  const d=v-par, s=size;
  const col = d==null?'#3a3a42':d<=-2?'#FBBF24':d===-1?'#60A5FA':d===0?'#CAFF4D':d===1?'#d0d0d0':d===2?'#EF4444':'#9f1414';
  const num = <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:s*.62,color:col,lineHeight:1,position:'relative',zIndex:2}}>{v}</span>;
  if (v===1) return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid #FBBF24',opacity:.4}}/>
      <div style={{position:'absolute',inset:3,borderRadius:'50%',border:'2px solid #FBBF24'}}/>
      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:s*.62,color:'#FBBF24',lineHeight:1,position:'relative',zIndex:2}}>{v}</span>
    </div>
  );
  if (d<=-2) return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`1.5px solid ${col}`,opacity:.35}}/>
      <div style={{position:'absolute',inset:3,borderRadius:'50%',border:`1.5px solid ${col}`}}/>
      {num}
    </div>
  );
  if (d===-1) return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`1.5px solid ${col}`}}/>
      {num}
    </div>
  );
  if (d===0) return <div style={{width:s,height:s,display:'flex',alignItems:'center',justifyContent:'center'}}>{num}</div>;
  if (d===1) return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:1,borderRadius:Math.round(s*.14),border:`1.5px solid ${col}`,opacity:.45}}/>
      {num}
    </div>
  );
  if (d===2) return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,borderRadius:Math.round(s*.14),border:`1.5px solid ${col}`,opacity:.35}}/>
      <div style={{position:'absolute',inset:3,borderRadius:Math.round(s*.1),border:`1.5px solid ${col}`}}/>
      {num}
    </div>
  );
  return (
    <div style={{width:s,height:s,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,borderRadius:Math.round(s*.14),background:'rgba(127,29,29,.5)',border:`1.5px solid ${col}`}}/>
      {num}
    </div>
  );
}
