import React from 'react';
import { TIERS } from '../data/constants.js';

export default function TierBadge({ tierId, size }) {
  const tier = TIERS.find(t=>t.id===tierId)||TIERS[0];
  const sz = size==="lg" ? {fontSize:12,padding:"4px 12px"} : {fontSize:9,padding:"3px 9px"};
  return (
    <span style={{...sz,fontFamily:"'Bebas Neue'",letterSpacing:".1em",borderRadius:4,border:`1px solid ${tier.border}`,color:tier.color,background:tier.bg,display:"inline-block",lineHeight:1.4}}>
      {tier.emoji} {tier.name}
    </span>
  );
}
