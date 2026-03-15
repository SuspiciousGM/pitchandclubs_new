import { TIERS } from '../data/constants.js';

export const getTier = (pts) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];

export const getTierPct = (pts) => {
  const tier = getTier(pts);
  if (tier.max === 99999) return 100;
  return Math.round(((pts - tier.min) / (tier.max - tier.min)) * 100);
};

export const calcPCPoints = (score, par, hcp) => {
  const d = score - par;
  let pts = 0;
  if (d <= -3) pts = 25;  // HiO
  else if (d === -2) pts = 25; // HiO pitch&putt
  else if (d === -1) pts = 12; // Birdie
  else if (d === 0)  pts = 6;  // Par
  else if (d === 1)  pts = 2;  // Bogey
  else if (d === 2)  pts = -3; // Doble
  else pts = -8;               // Triple+
  // Penalització si score > hcp
  if (hcp !== undefined && score > hcp) pts -= 5;
  return pts;
};

export const scoreInfo = (s, p) => {
  if (s === null || s === undefined) return null;
  const d = s - p;
  if (d <= -3) return { label:"HiO! 🎯",    color:"#FBBF24", short:"HiO" };
  if (d === -2) return { label:"HiO! 🎯",   color:"#FBBF24", short:"HiO" };
  if (d === -1) return { label:"Birdie 🐦",  color:"#60A5FA", short:"BIR" };
  if (d === 0)  return { label:"Par ✓",      color:"#CAFF4D", short:"PAR" };
  if (d === 1)  return { label:"Bogey",       color:"#FFFFFF", short:"BOG" };
  if (d === 2)  return { label:"D.Bogey",     color:"#EF4444", short:"D.B" };
  return { label:`+${d} 😬`,               color:"#EF4444", short:`+${d}` };
};

export const scoreColor = (d) =>
  d <= -2 ? "#FBBF24" : d === -1 ? "#60A5FA" : d === 0 ? "#CAFF4D" : d === 1 ? "#FFFFFF" : "#EF4444";

export const mapGameToFeedItem = (g) => {
  const me = g.players?.find(p => p.isMe);
  const diff = me?.diff ?? 0;
  const label = diff <= -3 ? "Eagle+" : diff === -2 ? "Eagle" : diff === -1 ? "Birdie" : diff === 0 ? "Par" : diff === 1 ? "Bogey" : `+${diff}`;
  const lc = diff < -1 ? "#FBBF24" : diff === -1 ? "#60A5FA" : diff === 0 ? "#CAFF4D" : "#9CA3AF";
  return { id: g.id, user: me?.name || "Jugador", avatarUrl: me?.avatarUrl || null, course: g.course_name || g.course, diff, label, lc, points: me?.points ?? 0, created_at: g.created_at };
};

export const timeAgo = (isoStr) => {
  const mins = Math.floor((Date.now() - new Date(isoStr)) / 60000);
  if (mins < 1) return "ara";
  if (mins < 60) return `fa ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `fa ${hrs}h`;
  return `fa ${Math.floor(hrs / 24)}d`;
};

export const fmtScore = (d) => d == null ? "—" : d > 0 ? `+${d}` : d === 0 ? "E" : `${d}`;
