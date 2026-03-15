import React from 'react';
import { T } from '../data/i18n.js';

export default function Ticker({ lang }) {
  const items = T[lang]?.ticker || T.ca.ticker;
  return (
    <div style={{overflow:"hidden",borderTop:"1px solid #1A1B1E",borderBottom:"1px solid #1A1B1E",padding:"9px 0",marginBottom:16,background:"#CAFF4D"}}>
      <div className="ticker-track">
        {[...items,...items,...items].map((it,i)=>(
          <span key={i} className="ticker-item">{it} <span style={{color:"#0A0A0B",opacity:.4,margin:"0 8px"}}>·</span></span>
        ))}
      </div>
    </div>
  );
}
