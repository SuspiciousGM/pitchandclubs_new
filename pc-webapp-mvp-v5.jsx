import { useState, useRef, useEffect } from "react";

/* ─── TIERS (4) ──────────────────────────────────────────────
   CADDIE  0–349  / PLAYER 350–899 / PRO 900–1999 / MASTER 2000+
   SUMA: HiO+50 Eagle+30 Birdie+20 Par+12 Bogey+5 Completa+8
         TornVict+100 Top3+50 Participació+20
   RESTA: Doble−3 Triple−8 NoComplet−10 Inactivitat−5/mes
──────────────────────────────────────────────────────────────── */
const TIERS = [
  { id:"caddie", name:"Caddie", emoji:"🎒", color:"#34D399", bg:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.3)",  min:0,    max:349   },
  { id:"player", name:"Player", emoji:"⛳", color:"#60A5FA", bg:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.3)",  min:350,  max:899   },
  { id:"pro",    name:"Pro",    emoji:"🏆", color:"#A78BFA", bg:"rgba(167,139,250,.12)",border:"rgba(167,139,250,.3)", min:900,  max:1999  },
  { id:"master", name:"Master", emoji:"👑", color:"#CAFF4D", bg:"rgba(202,255,77,.12)", border:"rgba(202,255,77,.3)",  min:2000, max:99999 },
];
const getTier = (pts) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
const getTierPct = (pts) => {
  const t = getTier(pts);
  if (t.max === 99999) return 100;
  return Math.round(((pts - t.min) / (t.max - t.min)) * 100);
};

/* ─── PUNTUACIÓ ──────────────────────────────────────────────── */
const calcPCPoints = (score, par) => {
  const d = score - par;
  if (d <= -3) return 50;  // HiO / Albatros
  if (d === -2) return 30; // Eagle
  if (d === -1) return 20; // Birdie
  if (d === 0)  return 12; // Par
  if (d === 1)  return 5;  // Bogey
  if (d === 2)  return -3; // Doble
  return -8;               // Triple+
};

const scoreInfo = (s, p) => {
  if (s === null || s === undefined) return null;
  const d = s - p;
  if (d <= -3) return { label:"HiO! 🎯",    color:"#FBBF24", short:"HiO" };
  if (d === -2) return { label:"Eagle 🦅",   color:"#FBBF24", short:"EAG" };
  if (d === -1) return { label:"Birdie 🐦",  color:"#60A5FA", short:"BIR" };
  if (d === 0)  return { label:"Par ✓",      color:"#CAFF4D", short:"PAR" };
  if (d === 1)  return { label:"Bogey",       color:"#FFFFFF", short:"BOG" };
  if (d === 2)  return { label:"D.Bogey",     color:"#EF4444", short:"D.B" };
  return { label:`+${d} 😬`,               color:"#EF4444", short:`+${d}` };
};

const scoreColor = (d) =>
  d <= -2 ? "#FBBF24" : d === -1 ? "#60A5FA" : d === 0 ? "#CAFF4D" : d === 1 ? "#FFFFFF" : "#EF4444";

/* ─── BASE CAMPS (61) ────────────────────────────────────────── */
const COURSES = [
  { id:1,  name:"Áccura Teià Pitch & Putt",           holes:18, par:54, location:"Teià",                     province:"Barcelona",    region:"Catalunya" },
  { id:2,  name:"Can Cuyàs Golf i Pitch & Putt",      holes:18, par:54, location:"Sant Feliu de Llobregat",   province:"Barcelona",    region:"Catalunya" },
  { id:3,  name:"Canal Olímpic de Catalunya P&P",     holes:9,  par:27, location:"Castelldefels",             province:"Barcelona",    region:"Catalunya" },
  { id:4,  name:"El Vallès Golf - Pitch & Putt",      holes:18, par:54, location:"Terrassa",                  province:"Barcelona",    region:"Catalunya" },
  { id:5,  name:"HCP1 Pitch & Putt",                  holes:18, par:54, location:"Sant Vicenç de Montalt",    province:"Barcelona",    region:"Catalunya" },
  { id:6,  name:"Mas Gurumbau Golf i Pitch & Putt",   holes:18, par:54, location:"Taradell",                  province:"Barcelona",    region:"Catalunya" },
  { id:7,  name:"Oller del Mas Pitch & Putt",         holes:18, par:54, location:"Manresa",                   province:"Barcelona",    region:"Catalunya" },
  { id:8,  name:"Pitch & Putt Badalona",              holes:18, par:54, location:"Badalona",                  province:"Barcelona",    region:"Catalunya" },
  { id:9,  name:"Pitch & Putt Can Mascaró",           holes:18, par:54, location:"La Palma de Cervelló",      province:"Barcelona",    region:"Catalunya" },
  { id:10, name:"Pitch & Putt Can Rafel",             holes:18, par:54, location:"Cervelló",                  province:"Barcelona",    region:"Catalunya" },
  { id:11, name:"Pitch & Putt La Garriga",            holes:18, par:54, location:"La Garriga",                province:"Barcelona",    region:"Catalunya" },
  { id:12, name:"Pitch & Putt Montseny",              holes:18, par:54, location:"Gualba",                    province:"Barcelona",    region:"Catalunya" },
  { id:13, name:"Pitch & Putt Portal del Roc",        holes:18, par:54, location:"Vilanova i la Geltrú",      province:"Barcelona",    region:"Catalunya" },
  { id:14, name:"Pitch & Putt Vallromanes",           holes:18, par:54, location:"Vilanova del Vallès",       province:"Barcelona",    region:"Catalunya" },
  { id:15, name:"Pitch & Putt del Tennis Mora",       holes:18, par:54, location:"Sant Andreu de Llavaneres", province:"Barcelona",    region:"Catalunya" },
  { id:16, name:"Pitch and Putt Sant Cebrià",         holes:18, par:54, location:"Sant Cebrià de Vallalta",   province:"Barcelona",    region:"Catalunya" },
  { id:17, name:"Roc 3 Pitch & Putt",                 holes:18, par:54, location:"Santa Coloma de Cervelló",  province:"Barcelona",    region:"Catalunya" },
  { id:18, name:"Golf Lloret - Pitch & Putt",         holes:18, par:54, location:"Lloret de Mar",             province:"Girona",       region:"Catalunya" },
  { id:19, name:"Mas Pagès Pitch & Putt",             holes:18, par:54, location:"Vilademúls",                province:"Girona",       region:"Catalunya" },
  { id:20, name:"Pitch & Putt Can Pascual",           holes:18, par:54, location:"Arbúcies",                  province:"Girona",       region:"Catalunya" },
  { id:21, name:"Pitch & Putt Castelló Empuriabrava", holes:18, par:54, location:"Castelló d'Empúries",       province:"Girona",       region:"Catalunya" },
  { id:22, name:"Pitch & Putt Fornells",              holes:18, par:54, location:"Fornells de la Selva",      province:"Girona",       region:"Catalunya" },
  { id:23, name:"Pitch & Putt Franciac",              holes:18, par:54, location:"Caldes de Malavella",       province:"Girona",       region:"Catalunya" },
  { id:24, name:"Pitch & Putt Gualta",                holes:18, par:54, location:"Gualta",                   province:"Girona",       region:"Catalunya" },
  { id:25, name:"Pitch & Putt Mas Nou",               holes:18, par:54, location:"Platja d'Aro",             province:"Girona",       region:"Catalunya" },
  { id:26, name:"Pitch & Putt Mas Tapiolas",          holes:18, par:54, location:"Santa Cristina de Aro",    province:"Girona",       region:"Catalunya" },
  { id:27, name:"Pitch & Putt Mas Torrellas",         holes:18, par:54, location:"Santa Cristina de Aro",    province:"Girona",       region:"Catalunya" },
  { id:28, name:"Pitch & Putt Peralada",              holes:18, par:54, location:"Peralada",                 province:"Girona",       region:"Catalunya" },
  { id:29, name:"Pitch and Putt Platja d'Aro",        holes:18, par:54, location:"Platja d'Aro",             province:"Girona",       region:"Catalunya" },
  { id:30, name:"Pitch & Putt Bellpuig",              holes:18, par:54, location:"Bellpuig",                 province:"Lleida",       region:"Catalunya" },
  { id:31, name:"Pitch & Putt BonÀrea",               holes:18, par:54, location:"Massoteres",               province:"Lleida",       region:"Catalunya" },
  { id:32, name:"Pitch & Putt Lleida",                holes:18, par:54, location:"Torre-Serona",             province:"Lleida",       region:"Catalunya" },
  { id:33, name:"Club de Golf Bonmont",               holes:9,  par:27, location:"Mont-Roig del Camp",       province:"Tarragona",    region:"Catalunya" },
  { id:34, name:"GolfStar Cambrils",                  holes:18, par:54, location:"Cambrils",                 province:"Tarragona",    region:"Catalunya" },
  { id:35, name:"Pitch & Putt Costa Daurada",         holes:18, par:54, location:"El Catllar",               province:"Tarragona",    region:"Catalunya" },
  { id:36, name:"Pitch and Putt Vendrell",            holes:18, par:54, location:"El Vendrell",              province:"Tarragona",    region:"Catalunya" },
  { id:37, name:"Golf Park Madrid",                   holes:9,  par:27, location:"Madrid",                   province:"Madrid",       region:"Madrid"    },
  { id:38, name:"Club de Campo Villa de Madrid P&P",  holes:9,  par:27, location:"Madrid",                   province:"Madrid",       region:"Madrid"    },
  { id:39, name:"La Dehesa P&P",                      holes:18, par:54, location:"Villanueva del Pardillo",  province:"Madrid",       region:"Madrid"    },
  { id:40, name:"El Olivar de la Hinojosa P&P",       holes:9,  par:27, location:"Madrid",                   province:"Madrid",       region:"Madrid"    },
  { id:41, name:"Golf Las Colinas Madrid",            holes:9,  par:27, location:"Las Rozas",                province:"Madrid",       region:"Madrid"    },
  { id:42, name:"Alhaurín Golf P&P",                  holes:9,  par:27, location:"Alhaurín de la Torre",     province:"Málaga",       region:"Andalucía" },
  { id:43, name:"Green Life Golf P&P",                holes:9,  par:27, location:"Marbella",                 province:"Málaga",       region:"Andalucía" },
  { id:44, name:"La Cañada Golf P&P",                 holes:9,  par:27, location:"Guadiaro",                 province:"Málaga",       region:"Andalucía" },
  { id:45, name:"Mijas Golf P&P",                     holes:9,  par:27, location:"Mijas",                   province:"Málaga",       region:"Andalucía" },
  { id:46, name:"Pitch & Putt Artxanda",              holes:18, par:54, location:"Bilbao",                   province:"Bizkaia",      region:"País Vasco"},
  { id:47, name:"Laukariz Golf P&P",                  holes:18, par:54, location:"Mungia",                   province:"Bizkaia",      region:"País Vasco"},
  { id:48, name:"Real Golf de Zarautz P&P",           holes:9,  par:27, location:"Zarautz",                  province:"Gipuzkoa",     region:"País Vasco"},
  { id:49, name:"Abra del Pas Golf P&P",              holes:9,  par:27, location:"Medio Cudeyo",             province:"Cantabria",    region:"Cantabria" },
  { id:50, name:"Real Golf de Pedreña P&P",           holes:9,  par:27, location:"Pedreña",                  province:"Cantabria",    region:"Cantabria" },
  { id:51, name:"Costa Ballena Golf P&P",             holes:9,  par:27, location:"Rota",                     province:"Cádiz",        region:"Andalucía" },
  { id:52, name:"Real Club de Golf Sotogrande P&P",   holes:9,  par:27, location:"San Roque",                province:"Cádiz",        region:"Andalucía" },
  { id:53, name:"Pitch & Putt Foyos",                 holes:18, par:54, location:"Foyos",                   province:"Valencia",     region:"C. Valenciana"},
  { id:54, name:"Golf Escorpión P&P",                 holes:9,  par:27, location:"Bétera",                  province:"Valencia",     region:"C. Valenciana"},
  { id:55, name:"Real Aero Club de Vigo P&P",         holes:9,  par:27, location:"Vigo",                    province:"Pontevedra",   region:"Galicia"   },
  { id:56, name:"Real Club de Golf La Coruña P&P",    holes:9,  par:27, location:"A Coruña",                province:"A Coruña",     region:"Galicia"   },
  { id:57, name:"Golf Alcanada P&P",                  holes:9,  par:27, location:"Port d'Alcúdia",          province:"Illes Balears",region:"Illes Balears"},
  { id:58, name:"Pitch & Putt Zaragoza",              holes:18, par:54, location:"Zaragoza",                province:"Zaragoza",     region:"Aragón"    },
  { id:59, name:"Golf Año P&P",                       holes:9,  par:27, location:"Huesca",                  province:"Huesca",       region:"Aragón"    },
  { id:60, name:"El Cortijo Golf P&P",                holes:9,  par:27, location:"Las Palmas de GC",        province:"Las Palmas",   region:"Canarias"  },
  { id:61, name:"Golf Costa Adeje P&P",               holes:9,  par:27, location:"Adeje",                  province:"S.C. Tenerife",region:"Canarias"  },
];

const PLAYER_COLORS = ["#CAFF4D","#60A5FA","#FBBF24","#F472B6"];

const GAME_MODES = [
  { id:"stableford", label:"Stableford", desc:"Punts per forat" },
  { id:"medal",      label:"Medalplay",  desc:"Total de cops"   },
];

/* ─── MOCK LEADERBOARD ───────────────────────────────────────── */
const LEADERBOARD = [
  { rank:1, name:"Marc Puig",       handle:"marc_pitchking", club:"Pink Beaks",    pts:2840, best:-4, avatar:"MP", color:"#CAFF4D" },
  { rank:2, name:"Sònia Ros",       handle:"sonia_ros",      club:"Canal Olímpic", pts:1920, best:-2, avatar:"SR", color:"#60A5FA" },
  { rank:3, name:"Jordi Mas",       handle:"jordi_mas",      club:"Áccura Teià",   pts:1240, best:-1, avatar:"JM", color:"#A78BFA" },
  { rank:4, name:"Laura Fernández", handle:"laura_fg",       club:"HCP1",          pts:890,  best:0,  avatar:"LF", color:"#F472B6" },
  { rank:5, name:"Pau Serra",       handle:"pau_serra",      club:"Badalona P&P",  pts:520,  best:1,  avatar:"PS", color:"#34D399" },
];

/* ─── GLOBAL CSS ─────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;}
body{
  background:#0A0A0B;
  color:#FFFFFF;
  font-family:'Inter',sans-serif;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
  overscroll-behavior:none;
}
::-webkit-scrollbar{display:none;}
input,button,select,textarea{outline:none;font-family:'Inter',sans-serif;}

/* ── TOKENS */
.bb{font-family:'Bebas Neue',sans-serif;letter-spacing:.04em;}
.lime{color:#CAFF4D;}

/* ── APP SHELL */
.app{
  background:#111214;
  color:#FFFFFF;
  min-height:100svh;
  max-width:430px;
  margin:0 auto;
  position:relative;
}

/* ── HEADER */
.app-header{
  position:sticky;top:0;z-index:100;
  background:rgba(17,18,20,.94);
  border-bottom:1px solid #1A1B1E;
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 18px;height:52px;
}
.header-logo{font-family:'Bebas Neue';font-size:22px;letter-spacing:.06em;cursor:pointer;user-select:none;}
.header-logo em{color:#CAFF4D;font-style:normal;}

/* ── BOTTOM NAV */
.bottom-nav{
  position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:430px;
  background:rgba(10,10,11,.97);
  border-top:1px solid #1A1B1E;
  display:flex;
  padding:8px 0 calc(8px + env(safe-area-inset-bottom));
  backdrop-filter:blur(16px);z-index:200;
}
.nav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  cursor:pointer;padding:4px;
  border:none;background:transparent;
  color:#555761;font-family:'Inter';font-size:9px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  transition:color .15s;
}
.nav-item.active{color:#CAFF4D;}
.nav-item:active{opacity:.6;}
.nav-icon{font-size:21px;line-height:1;}
.nav-game-btn .nav-icon{
  width:46px;height:46px;background:#CAFF4D;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;margin-top:-18px;
  box-shadow:0 0 0 3px #111214,0 4px 18px rgba(202,255,77,.35);
}
.nav-game-btn{color:#CAFF4D!important;}

/* ── PAGE SCROLL */
.page-scroll{padding:16px 16px calc(80px + env(safe-area-inset-bottom));overflow-y:auto;}

/* ── CARDS */
.card{background:#1A1B1E;border:1px solid #222327;border-radius:10px;padding:16px;}
.card-lime{background:rgba(202,255,77,.06);border-color:rgba(202,255,77,.2);}
.card-press{cursor:pointer;transition:all .15s;}
.card-press:active{transform:scale(.98);}

/* ── BUTTONS */
.btn{border:none;cursor:pointer;font-family:'Inter';font-weight:700;letter-spacing:.04em;
  transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-primary{background:#CAFF4D;color:#0A0A0B;padding:15px 24px;
  font-size:16px;width:100%;border-radius:10px;text-transform:uppercase;}
.btn-primary:active{background:#b8f030;transform:scale(.98);}
.btn-primary:disabled{background:#1A1B1E;color:#555;cursor:not-allowed;transform:none;}
.btn-ghost{background:transparent;color:#FFFFFF;border:1px solid #2A2B30;
  padding:12px 20px;font-size:13px;width:100%;border-radius:10px;text-transform:uppercase;}
.btn-ghost:active{border-color:#CAFF4D;color:#CAFF4D;}
.btn-sm{padding:7px 14px;font-size:12px;border-radius:8px;width:auto;}
.btn-icon{width:44px;height:44px;border-radius:50%;padding:0;font-size:20px;}

/* ── INPUTS */
.inp{
  width:100%;padding:13px 14px;
  background:#1A1B1E;border:1px solid #222327;border-radius:8px;
  color:#FFFFFF;font-size:16px;font-weight:500;
  transition:border-color .15s;
}
.inp:focus{border-color:#CAFF4D;}
.inp::placeholder{color:#333;}
input[type="date"].inp{color-scheme:dark;}
.label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555761;margin-bottom:6px;display:block;}

/* ── PROGRESS */
.prog{height:4px;background:#1A1B1E;border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;border-radius:2px;transition:width .5s ease;}

/* ── SCORE RINGS */
.score-ring{
  width:52px;height:52px;border-radius:50%;
  border:2px solid #222327;background:#1A1B1E;color:#FFFFFF;
  font-family:'Bebas Neue';font-size:22px;
  cursor:pointer;transition:all .15s;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.score-ring:active{transform:scale(.94);}
.score-ring.active{border-width:3px;transform:scale(1.1);}

/* ── HOLE DOT */
.hole-dot{
  width:26px;height:26px;border-radius:5px;border:1px solid #222327;
  font-size:10px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .12s;font-family:'Bebas Neue';
}
.hole-dot:active{filter:brightness(1.3);}

/* ── SEARCH DROP */
.sdrop{
  position:absolute;top:100%;left:0;right:0;
  background:#1A1B1E;border:1px solid #2A2B30;
  border-radius:0 0 8px 8px;z-index:200;
  max-height:240px;overflow-y:auto;
}
.sdrop-item{padding:12px 14px;cursor:pointer;border-bottom:1px solid #1A1B1E;transition:background .1s;}
.sdrop-item:active,.sdrop-item:hover{background:#222327;}
.sdrop-item:last-child{border:none;}

/* ── PILL */
.pill{display:inline-flex;align-items:center;gap:4px;background:#1A1B1E;border:1px solid #222327;border-radius:100px;padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}

/* ── PLAYER TABS */
.player-tab{
  padding:7px 14px;border-radius:100px;
  border:2px solid #222327;background:#1A1B1E;
  color:#555761;font-weight:700;font-size:12px;
  cursor:pointer;white-space:nowrap;
  transition:all .15s;flex-shrink:0;
  text-transform:uppercase;letter-spacing:.04em;
}
.player-tab.active{border-color:var(--pc);color:var(--pc);}

/* ── SC TABLE */
.sc-table{width:100%;border-collapse:collapse;font-size:12px;}
.sc-table th{padding:5px 4px;color:#555761;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10px;text-align:center;}
.sc-table td{padding:5px 4px;text-align:center;border-top:1px solid #1A1B1E;}
.sc-table tr:active td{background:#1A1B1E;}

/* ── TOGGLE */
.toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.toggle-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}

/* ── SECTION TITLE */
.sec-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555761;margin-bottom:10px;}

/* ── MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:400;display:flex;align-items:flex-end;justify-content:center;max-width:430px;left:50%;transform:translateX(-50%);animation:fadeIn .2s;}
.modal-sheet{background:#1A1B1E;border-radius:16px 16px 0 0;padding:20px 18px calc(32px + env(safe-area-inset-bottom));width:100%;border-top:1px solid #2A2B30;animation:slideUp .22s ease;max-height:85vh;overflow-y:auto;}
.modal-handle{width:36px;height:4px;background:#2A2B30;border-radius:2px;margin:0 auto 18px;}

/* ── ANIMATIONS */
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
.ani-up{animation:fadeUp .25s ease forwards;}
.ani-pop{animation:pop .35s ease;}

/* ── TOAST */
.toast{
  position:fixed;bottom:calc(72px + env(safe-area-inset-bottom));
  left:50%;transform:translateX(-50%);
  background:#CAFF4D;color:#0A0A0B;
  padding:10px 20px;border-radius:100px;
  font-size:13px;font-weight:700;letter-spacing:.04em;
  z-index:500;animation:fadeUp .3s ease;white-space:nowrap;
}

/* ── TICKER */
.ticker{background:#CAFF4D;height:34px;display:flex;align-items:center;overflow:hidden;margin:0 -16px;}
.ticker-track{display:flex;gap:40px;white-space:nowrap;animation:tick 22s linear infinite;}
@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{font-family:'Bebas Neue';font-size:13px;letter-spacing:.1em;color:#0A0A0B;display:flex;align-items:center;gap:10px;}

/* ── LIVE DOT */
.live-dot{width:6px;height:6px;border-radius:50%;background:#EF4444;animation:blink 1.2s infinite;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
`;

/* ─── HELPERS ────────────────────────────────────────────────── */
function TierBadge({ tierId, size }) {
  const t = TIERS.find(x => x.id === tierId) || TIERS[0];
  return (
    <span style={{
      fontSize: size === "lg" ? 12 : 10, fontWeight:700, letterSpacing:".08em",
      textTransform:"uppercase", padding:"3px 9px", borderRadius:100,
      background:t.bg, color:t.color, border:`1px solid ${t.border}`, whiteSpace:"nowrap",
    }}>{t.emoji} {t.name}</span>
  );
}

function Ticker() {
  const items = ["Pitch & Clubs","61 camps","Registra · Puja · Domina","Kits Oficials","Less Elitist. More Real","Beta oberta","Tornejos 2025"];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...items,...items].map((t,i) => <span key={i} className="ticker-item">{t}<span style={{opacity:.3}}>×</span></span>)}
      </div>
    </div>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────────────── */
function BottomNav({ screen, setScreen }) {
  const isGame = screen === "game-setup" || screen === "scorecard" || screen === "summary";
  return (
    <nav className="bottom-nav">
      <button className={`nav-item${screen==="home"?" active":""}`} onClick={()=>setScreen("home")}>
        <span className="nav-icon">🏠</span><span>Inici</span>
      </button>
      <button className={`nav-item${screen==="ranking"?" active":""}`} onClick={()=>setScreen("ranking")}>
        <span className="nav-icon">📊</span><span>Rànquing</span>
      </button>
      {/* Centre game button */}
      <button className={`nav-item nav-game-btn${isGame?" active":""}`} onClick={()=>setScreen("game-setup")}>
        <span className="nav-icon">⛳</span>
      </button>
      <button className={`nav-item${screen==="tournaments"?" active":""}`} onClick={()=>setScreen("tournaments")}>
        <span className="nav-icon">🏆</span><span>Tornejos</span>
      </button>
      <button className={`nav-item${screen==="shop"?" active":""}`} onClick={()=>setScreen("shop")}>
        <span className="nav-icon">🛒</span><span>Botiga</span>
      </button>
    </nav>
  );
}

/* ─── APP HEADER ─────────────────────────────────────────────── */
function AppHeader({ screen, setScreen, user, openAuth, userPts }) {
  const tier = getTier(userPts);
  const isGameFlow = screen==="game-setup"||screen==="scorecard"||screen==="summary";
  return (
    <header className="app-header">
      <div className="header-logo" onClick={() => setScreen("home")}>P<em>&</em>C</div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {isGameFlow && (
          <button className="btn btn-sm btn-ghost" style={{width:"auto"}} onClick={() => setScreen("home")}>Sortir</button>
        )}
        {user && !isGameFlow && (
          <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",padding:"4px 8px",borderRadius:8}}
            onClick={() => setScreen("profile")}>
            <div style={{width:30,height:30,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>
              {user.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,fontWeight:700,color:tier.color,letterSpacing:".06em",textTransform:"uppercase",lineHeight:1}}>{tier.emoji} {tier.name}</div>
              <div style={{fontSize:9,color:"#555761",lineHeight:1.4}}>{userPts} pts</div>
            </div>
          </div>
        )}
        {!user && !isGameFlow && (
          <button className="btn btn-sm" style={{background:"#CAFF4D",color:"#0A0A0B",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:700,textTransform:"uppercase"}} onClick={openAuth}>Uneix-te</button>
        )}
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME SCREEN — Dashboard del jugador
═══════════════════════════════════════════════════════════════ */
const UGC_FEED = [
  {id:1,user:"marc_pitchking",club:"Pink Beaks",   label:"Eagle 🦅",  course:"Vallromanes",  hole:12,time:"fa 2h", likes:47, img:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=75",caption:"Millor ronda de la temporada 🦅",lc:"#FBBF24"},
  {id:2,user:"sonia_ros",     club:"Canal Olímpic",label:"Birdie 🐦", course:"HCP1",          hole:7, time:"fa 3h", likes:23, img:"https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=75",caption:"Primera ronda a HCP1 💪",lc:"#60A5FA"},
  {id:3,user:"pink_beaks_cc", club:"Pink Beaks",   label:"Par ✓",     course:"Áccura Teià",   hole:15,time:"fa 5h", likes:31, img:"https://images.unsplash.com/photo-1600167957935-f21a51b0b1c2?w=600&q=75",caption:"Dia de vent perfecte 😅",lc:"#CAFF4D"},
  {id:4,user:"jordi_mas",     club:"Áccura Teià",  label:"Eagle 🦅",  course:"Vallromanes",   hole:3, time:"fa 6h", likes:58, img:"https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=75",caption:"Tres sous seguits ⛳",lc:"#FBBF24"},
  {id:5,user:"club_canal",    club:"Canal Olímpic",label:"Torneig 🏆",course:"Canal Olímpic", hole:0, time:"ahir",  likes:112,img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",caption:"Torneig intern Canal 🏆",lc:"#A78BFA"},
  {id:6,user:"laura_fg",      club:"HCP1",         label:"Birdie 🐦", course:"HCP1",          hole:9, time:"ahir",  likes:19, img:"https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=75",caption:"Primer birdie de l'any!! 🎉",lc:"#60A5FA"},
];

const TOURNAMENTS_DATA = [
  {id:1,name:"P&C Spring Open",   dateS:"15/06",course:"Vallromanes", location:"Vilanova del Vallès",format:"Strokeplay 18H",minTier:"player",spots:24,left:8, prize:"Kit P&C + 200 pts",   status:"open",fee:"€15", category:"open"},
  {id:2,name:"Copa Canal Olímpic",dateS:"22/06",course:"Canal Olímpic",location:"Castelldefels",     format:"Matchplay 9H",  minTier:"caddie",spots:16,left:3, prize:"150 pts + greenfees", status:"open",fee:"€10", category:"club"},
  {id:3,name:"Master Series — R1",dateS:"05/07",course:"HCP1",        location:"Sant Vicenç",        format:"Strokeplay 18H",minTier:"master",spots:12,left:12,prize:"300 pts + trofeu",     status:"soon",fee:"€25", category:"master"},
  {id:4,name:"Nit de Sant Joan",  dateS:"23/06",course:"P&P Badalona",location:"Badalona",           format:"Stableford 9H", minTier:"caddie",spots:32,left:19,prize:"Festa + 80 pts",       status:"open",fee:"Gratis",category:"social"},
];

const PRODUCTS_DATA = [
  {id:1,name:"Kit Oficial Pink Beaks 24/25",club:"Pink Beaks",   price:"€49",emoji:"🎽",tag:"Kit Oficial"},
  {id:2,name:"Gorra Club Canal Olímpic",    club:"Canal Olímpic",price:"€32",emoji:"🧢",tag:"Kit Oficial"},
  {id:3,name:"Polo Pro HCP1 Llavaneres",    club:"HCP1",         price:"€65",emoji:"👕",tag:"Kit Oficial"},
  {id:4,name:"Pack Iniciació P&P",          club:"P&C Gear",     price:"€89",emoji:"⛳",tag:"Gear"},
  {id:5,name:'Samarreta "Less Elitist"',    club:"P&C Originals",price:"€35",emoji:"🖤",tag:"Original"},
  {id:6,name:"Polo Vallromanes Club Ed.",   club:"Vallromanes",  price:"€44",emoji:"🟢",tag:"Kit Oficial"},
];

const PLAYER_PROFILE = {
  handle:"marc_pitchking",name:"Marc Puig",club:"Pink Beaks",
  pts:2840,hcp:3.2,games:42,avatar:"MP",color:"#CAFF4D",streak:7,tourWon:1,
  trend:[{date:"01/03",s:-1},{date:"08/03",s:-2},{date:"15/03",s:0},{date:"22/03",s:-2},{date:"29/03",s:-3},{date:"05/04",s:-1},{date:"12/04",s:-4},{date:"19/04",s:-2},{date:"26/04",s:-3},{date:"03/05",s:-4}],
  hcpHist:[{m:"Nov",v:6.8},{m:"Des",v:5.9},{m:"Gen",v:5.1},{m:"Feb",v:4.4},{m:"Mar",v:3.8},{m:"Abr",v:3.2}],
  bestCourses:[{name:"Vallromanes",best:-4,avg:-2.1,played:18,f:"🏆"},{name:"HCP1",best:-2,avg:-1.4,played:12,f:"🥈"},{name:"Áccura Teià",best:-1,avg:-0.8,played:8,f:"🥉"},{name:"Canal Olímpic",best:-1,avg:-0.5,played:4,f:""}],
  dist:{eagle:3,birdie:48,par:127,bogey:62,double:14,triple:5},
};

function SectionHeader({ sub, title, limeWord, action, onAction }) {
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{sub}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(22px,5vw,36px)",letterSpacing:".04em",lineHeight:1}}>{title}{limeWord&&<> <span style={{color:"#CAFF4D"}}>{limeWord}</span></>}</div>
      </div>
      {action && <button onClick={onAction} style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#CAFF4D",cursor:"pointer",border:"none",background:"none",whiteSpace:"nowrap"}}>{action} →</button>}
    </div>
  );
}

function HomeScreen({ user, userPts, setUserPts, history, setScreen, openAuth, leads }) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [liked, setLiked] = useState({});
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(t => t.id === tier.id) + 1];
  const pct = getTierPct(userPts);
  const myGames = history.filter(g => g.players.some(p => p.isMe));
  const myScores = myGames.flatMap(g => g.players.filter(p => p.isMe).map(p => p.diff));
  const bestGame = myScores.length ? Math.min(...myScores) : null;

  return (
    <div className="page-scroll ani-up">

      {/* ── PLAYER CARD / HERO ── */}
      {user ? (
        <div className="card card-lime" style={{marginBottom:14,background:`linear-gradient(135deg,${tier.bg} 0%,rgba(17,18,20,0) 100%)`,borderColor:tier.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#555761",fontWeight:500,marginBottom:4}}>Hola de nou,</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:30,letterSpacing:".04em",lineHeight:1}}>{user.name}</div>
              {user.club && <div style={{fontSize:11,color:"#787C8A",marginTop:2}}>{user.club}</div>}
            </div>
            <div style={{fontSize:48,lineHeight:1}}>{tier.emoji}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            <TierBadge tierId={tier.id} />
            <span className="pill" style={{color:tier.color}}>⚡ {userPts} pts</span>
          </div>
          {nextTier ? (
            <>
              <div style={{fontSize:11,color:"#555761",marginBottom:5}}>
                {nextTier.min - userPts} pts per arribar a <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name} {nextTier.emoji}</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:tier.color}} /></div>
            </>
          ) : <div style={{fontSize:12,color:"#CAFF4D",fontWeight:700}}>🔥 Nivell màxim — Master!</div>}
          <button className="btn btn-ghost btn-sm" style={{marginTop:12,fontSize:11,width:"auto",borderRadius:100}} onClick={() => setScreen("profile")}>
            📊 Les meves estadístiques →
          </button>
        </div>
      ) : (
        <div style={{marginBottom:14,padding:"4px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
            <div className="live-dot"/><span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>Beta oberta · {234 + leads.current.length} jugadors</span>
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(44px,11vw,88px)",lineHeight:.88,marginBottom:12}}>
            L'STRAVA<br/><span style={{WebkitTextStroke:"1.5px #fff",color:"transparent"}}>DEL</span> <span className="lime">GOLF.</span>
          </div>
          <p style={{fontSize:14,color:"#787C8A",lineHeight:1.7,marginBottom:14,fontWeight:400,maxWidth:400}}>Registra partides, puja al rànquing i suporta el teu club.</p>
        </div>
      )}

      {/* ── PRIMARY CTA ── */}
      <button className="btn btn-primary" style={{marginBottom:10,fontSize:18,letterSpacing:".04em"}} onClick={() => setScreen("game-setup")}>
        ⛳ Nova Partida
      </button>
      {!user && (
        <button className="btn btn-ghost" style={{marginBottom:16,fontSize:13}} onClick={openAuth}>
          Crea un compte — guarda les teves stats →
        </button>
      )}

      {/* ── QUICK STATS ── */}
      {myGames.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{l:"Partides",v:myGames.length},{l:"Millor",v:bestGame!==null?(bestGame>0?`+${bestGame}`:`${bestGame}`):"—"},{l:"Forats",v:myGames.reduce((a,g)=>a+g.scores.length,0)}].map(s => (
            <div key={s.l} className="card" style={{padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,color:"#555761",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ÚLTIMES PARTIDES ── */}
      {myGames.length > 0 && (
        <div style={{marginBottom:16}}>
          <SectionHeader sub="Activitat" title="ÚLTIMES" limeWord="PARTIDES" />
          {myGames.slice(0,3).map(g => {
            const me = g.players.find(p => p.isMe);
            return (
              <div key={g.id} className="card card-press" style={{padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.course}</div>
                    <div style={{fontSize:11,color:"#555761",marginTop:2}}>{g.date} · {g.scores.length} forats</div>
                    {g.players.length > 1 && <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{g.players.map((p,i) => <span key={p.id} style={{fontSize:10,color:PLAYER_COLORS[i],fontWeight:700,background:"#111214",padding:"1px 7px",borderRadius:4}}>{p.name.split(" ")[0]}</span>)}</div>}
                  </div>
                  {me && <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:26,lineHeight:1,color:me.diff<0?"#FBBF24":me.diff===0?"#CAFF4D":"#FFFFFF"}}>{me.diff>0?`+${me.diff}`:me.diff}</div>
                    <div style={{fontSize:10,color:"#CAFF4D",fontWeight:700}}>+{me.points} pts</div>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {myGames.length === 0 && !user && (
        <div className="card" style={{textAlign:"center",padding:"28px 16px",marginBottom:16}}>
          <div style={{fontSize:36,marginBottom:8}}>⛳</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",marginBottom:6}}>Sense partides</div>
          <div style={{fontSize:12,color:"#555761",lineHeight:1.6,marginBottom:14}}>Registra la primera partida sense necessitat de fer login</div>
          <button className="btn btn-ghost btn-sm" style={{width:"auto",margin:"0 auto"}} onClick={() => setScreen("game-setup")}>Registrar ara →</button>
        </div>
      )}

      {/* ── MINI LEADERBOARD ── */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <SectionHeader sub="Classificació" title="TOP" limeWord="RÀNQUING" />
          <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#CAFF4D",cursor:"pointer",border:"none",background:"none",marginTop:-16}} onClick={() => setScreen("ranking")}>Tots →</button>
        </div>
        <div className="card" style={{overflow:"hidden",padding:0}}>
          {LEADERBOARD.slice(0,5).map((p,i) => {
            const t = getTier(p.pts);
            return (
              <div key={p.rank} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<4?"1px solid #111214":"none"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:i<3?18:14,color:i<3?"#CAFF4D":"#2A2B30",width:22,textAlign:"center",flexShrink:0}}>0{p.rank}</div>
                <div style={{width:28,height:28,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:10,color:"#555761"}}>{t.emoji} {t.name} · {p.club}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{p.best>0?`+${p.best}`:p.best}</div>
                  <div style={{fontSize:10,color:"#CAFF4D",fontWeight:700}}>{p.pts}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COM FUNCIONA ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub="Com funciona" title="3 PASSOS." limeWord="SIMPLE." />
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
          {[{n:"01",icon:"⛳",t:"Registra la partida",d:"Sense login. Tria entre 61 camps reals i registra cada cop forat a forat."},
            {n:"02",icon:"📈",t:"Puja al rànquing",d:"Caddie → Player → Pro → Master. Cada partida i torneig suma punts P&C."},
            {n:"03",icon:"💰",t:"Suporta el teu club",d:"10% de cada compra al kit oficial va directament al teu club. Automàtic."}].map((s,i) => (
            <div key={i} className="card" style={{padding:"16px",display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:"#1A1B1E",lineHeight:1,flexShrink:0,width:36,textAlign:"center"}}>{s.n}</div>
              <div>
                <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".04em",marginBottom:4}}>{s.t}</div>
                <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,fontWeight:400}}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SISTEMA DE NIVELLS ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub="Sistema de nivells" title="PUJA." limeWord="GUANYA." />
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
          {TIERS.map((t,i) => (
            <div key={t.id} className="card card-press" style={{padding:"14px 12px",textAlign:"center",borderColor:t.border,background:t.bg}}>
              <div style={{fontSize:26,marginBottom:4}}>{t.emoji}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:t.color,marginBottom:2}}>{t.name}</div>
              <div style={{fontSize:9,color:"#555761",marginBottom:8,fontWeight:600,letterSpacing:".04em"}}>{t.min}–{t.max===99999?"∞":t.max} pts</div>
              <div style={{fontSize:10,color:"#787C8A",lineHeight:1.5,fontWeight:400}}>{t.desc}</div>
            </div>
          ))}
        </div>
        {/* Points system mini */}
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Sistema de punts</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {[{l:"Eagle (−2)",p:"+30",c:"#FBBF24"},{l:"Birdie (−1)",p:"+20",c:"#60A5FA"},{l:"Par",p:"+12",c:"#CAFF4D"},{l:"Bogey (+1)",p:"+5",c:"#9CA3AF"},{l:"Victòria torn",p:"+100",c:"#CAFF4D"},{l:"Inactivitat",p:"−5/m",c:"#EF4444"}].map((r,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#111214",borderRadius:7}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:r.p.startsWith("-")?"#EF4444":"#CAFF4D",width:40,textAlign:"right",flexShrink:0}}>{r.p}</div>
                <div style={{fontSize:11,color:"#787C8A",fontWeight:500}}>{r.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROPERS TORNEJOS ── */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <SectionHeader sub="Competicions" title="PROPERS" limeWord="TORNEJOS" />
          <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#CAFF4D",cursor:"pointer",border:"none",background:"none",marginTop:-16}} onClick={() => setScreen("tournaments")}>Tots →</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {TOURNAMENTS_DATA.filter(t => t.status==="open").slice(0,2).map(t => {
            const mt = TIERS.find(x => x.id===t.minTier);
            return (
              <div key={t.id} className="card card-press" style={{padding:"13px 15px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:".04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                    <div style={{fontSize:11,color:"#787C8A",marginTop:1}}>{t.course} · {t.location}</div>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#CAFF4D",flexShrink:0,lineHeight:1}}>{t.dateS}</div>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <span className="pill" style={{fontSize:9}}>🏌️ {t.format}</span>
                  <span className="pill" style={{fontSize:9,color:mt?.color,borderColor:mt?.border}}>Min: {mt?.emoji} {mt?.name}</span>
                  <span className="pill" style={{fontSize:9}}>💰 {t.fee}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── UGC FEED (bloc, no pantalla separada) ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub="Comunitat" title="LA GENT" limeWord="JUGA AVUI" />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {UGC_FEED.slice(0,4).map((p,i) => (
            <div key={p.id} style={{gridColumn:i===0?"span 2":"span 1",height:i===0?250:180,borderRadius:10,overflow:"hidden",cursor:"pointer",position:"relative",border:"1px solid #1A1B1E"}}>
              <img src={p.img} alt={p.user} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,10,11,.93) 0%,transparent 55%)"}}/>
              <div style={{position:"absolute",top:10,left:10,background:"rgba(10,10,11,.75)",border:`1px solid ${p.lc}40`,borderRadius:4,padding:"3px 9px",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:p.lc}}>{p.label}</div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:i===0?4:0}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.user[0].toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{p.user}</div>
                    <div style={{fontSize:8,color:"rgba(255,255,255,.45)"}}>{p.course}{p.hole>0?` · F${p.hole}`:""} · {p.time}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setLiked(l=>({...l,[p.id]:!l[p.id]}));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:liked[p.id]?"#EF4444":"rgba(255,255,255,.4)",flexShrink:0,display:"flex",alignItems:"center",gap:2}}>
                    {liked[p.id]?"❤️":"🤍"}<span style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{p.likes+(liked[p.id]?1:0)}</span>
                  </button>
                </div>
                {i===0 && <p style={{fontSize:11,color:"rgba(255,255,255,.75)",lineHeight:1.4,fontWeight:400}}>{p.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 61 CAMPS ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub="Cobertura" title="61 CAMPS" limeWord="A ESPANYA" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
          {[["36","Catalunya"],["5","Madrid"],["4","Andalucía"],["16","Resta Espanya"]].map(([n,l]) => (
            <div key={l} className="card" style={{padding:"14px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#CAFF4D",lineHeight:1}}>{n}</div>
              <div style={{fontSize:10,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:2,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:"13px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{fontSize:12,color:"#787C8A",fontWeight:400}}>No trobes el teu camp? Afegeix-lo manualment o contacta'ns.</div>
          <button className="btn btn-ghost btn-sm" style={{whiteSpace:"nowrap",flexShrink:0}} onClick={() => setScreen("game-setup")}>Afegir →</button>
        </div>
      </div>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── READY TO PLAY ── */}
      <div style={{marginTop:14,background:"#CAFF4D",borderRadius:12,padding:"28px 18px",textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,9vw,56px)",color:"#0A0A0B",letterSpacing:".04em",lineHeight:.9,marginBottom:12}}>READY TO PLAY?</div>
        <p style={{fontSize:12,color:"rgba(10,10,11,.6)",marginBottom:18,fontWeight:500}}>Registra la primera partida sense necessitat de fer login.</p>
        {!emailSent ? (
          <form onSubmit={e=>{e.preventDefault();if(email.includes("@")){setEmailSent(true);leads.current.push(email);}}} style={{display:"flex",gap:8,maxWidth:300,margin:"0 auto 12px"}}>
            <input className="inp" style={{flex:1,fontSize:14,background:"rgba(255,255,255,.3)",border:"1px solid rgba(0,0,0,.15)",color:"#0A0A0B"}} type="email" placeholder="el-teu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            <button type="submit" className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:8,padding:"0 13px",flexShrink:0}}>→</button>
          </form>
        ) : <div style={{fontSize:12,fontWeight:700,color:"#0A0A0B",marginBottom:12}}>🎉 Apuntat! {234+leads.current.length} jugadors a la llista.</div>}
        <button className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:10,fontSize:13,fontWeight:700,padding:"13px 24px"}} onClick={() => setScreen("game-setup")}>⛳ Registra una partida</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GAME SETUP SCREEN
═══════════════════════════════════════════════════════════════ */
function GameSetupScreen({ user, openAuth, onStart }) {
  const [courseQ, setCourseQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [selCourse, setSelCourse] = useState(null);
  const [customCourse, setCustomCourse] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHoles, setCustomHoles] = useState(18);
  const [customPar, setCustomPar] = useState(54);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gameMode, setGameMode] = useState("stableford");
  const [players, setPlayers] = useState([{ id:1, name:"Tu", isMe:true }]);
  const [liveShare, setLiveShare] = useState(false);

  const activeCourse = customCourse || selCourse;

  const filtered = COURSES.filter(c => {
    if (courseQ.length < 1) return false;
    const q = courseQ.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.province.toLowerCase().includes(q);
  }).slice(0, 8);

  const addPlayer = () => { if (players.length >= 4) return; setPlayers(p => [...p, {id:Date.now(), name:`Jugador ${p.length+1}`, isMe:false}]); };
  const removePlayer = (id) => setPlayers(p => p.filter(x => x.id !== id));
  const updateName = (id, name) => setPlayers(p => p.map(x => x.id === id ? {...x, name} : x));

  const handleStart = () => {
    if (!activeCourse) return;
    onStart({ course:activeCourse, date, gameMode, players, liveShare });
  };

  return (
    <div className="page-scroll ani-up">
      {/* Guest banner */}
      {!user && (
        <div style={{background:"rgba(202,255,77,.07)",border:"1px solid rgba(202,255,77,.2)",borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:18,flexShrink:0}}>⚡</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#CAFF4D",marginBottom:2}}>Mode visitant — sense login</div>
            <div style={{fontSize:11,color:"#787C8A",lineHeight:1.5,fontWeight:400}}>Pots jugar ara. <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:600}} onClick={openAuth}>Crea un compte</span> per guardar l'historial i acumular punts.</div>
          </div>
        </div>
      )}

      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:".04em",marginBottom:2}}>Nova Partida</div>
        <div style={{fontSize:13,color:"#555761",fontWeight:400}}>Configura i comença</div>
      </div>

      {/* DATE */}
      <div style={{marginBottom:16}}>
        <span className="label">Data</span>
        <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} />
      </div>

      {/* COURSE SEARCH */}
      <div style={{marginBottom:16}}>
        <span className="label">Camp ({COURSES.length} disponibles)</span>
        <div style={{position:"relative"}}>
          <input className="inp" placeholder="🔍  Cerca per nom, localitat o província..."
            value={courseQ}
            onChange={e=>{setCourseQ(e.target.value);setShowDrop(true);setSelCourse(null);setCustomCourse(null);}}
            onFocus={()=>setShowDrop(true)}
            style={{borderRadius:showDrop&&filtered.length?"8px 8px 0 0":8}}
          />
          {showDrop && courseQ.length >= 1 && (
            <div className="sdrop">
              {filtered.map(c=>(
                <div key={c.id} className="sdrop-item" onClick={()=>{setSelCourse(c);setCustomCourse(null);setCourseQ(c.name);setShowDrop(false);}}>
                  <div style={{fontWeight:600,fontSize:14}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#555761",marginTop:2,fontWeight:400}}>📍 {c.location}, {c.province} · {c.holes}H · Par {c.par}</div>
                </div>
              ))}
              {filtered.length===0 && <div className="sdrop-item" style={{color:"#555761",fontStyle:"italic"}}>No trobat — configura'l manualment ↓</div>}
            </div>
          )}
        </div>
        {activeCourse && (
          <div style={{marginTop:6,display:"flex",alignItems:"center",gap:7}}>
            <span style={{color:"#CAFF4D",fontSize:14}}>✓</span>
            <span style={{fontWeight:600,fontSize:13}}>{activeCourse.name}</span>
            <span className="pill" style={{fontSize:10}}>{activeCourse.holes}H · Par {activeCourse.par}</span>
          </div>
        )}

        <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={()=>setShowCustom(v=>!v)}>
          {showCustom?"▲ Tancar":"⚙ Camp personalitzat"}
        </button>

        {showCustom && (
          <div className="card ani-up" style={{marginTop:10,padding:"14px"}}>
            <span className="label">Nom del camp</span>
            <input className="inp" style={{marginBottom:10}} placeholder="Ex: Club de Golf de Lleida" value={customName} onChange={e=>setCustomName(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}>
                <span className="label">Forats</span>
                <select className="inp" value={customHoles} onChange={e=>{setCustomHoles(Number(e.target.value));setCustomPar(Number(e.target.value)===9?27:54);}}>
                  <option value={9}>9 forats</option>
                  <option value={18}>18 forats</option>
                </select>
              </div>
              <div style={{flex:1}}>
                <span className="label">Par total</span>
                <select className="inp" value={customPar} onChange={e=>setCustomPar(Number(e.target.value))}>
                  {customHoles===9 ? [27,28,29,30].map(v=><option key={v} value={v}>Par {v}</option>) : [52,54,56,58,72].map(v=><option key={v} value={v}>Par {v}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{marginTop:12,fontSize:14}} disabled={!customName.trim()} onClick={()=>{setCustomCourse({name:customName,holes:customHoles,par:customPar});setSelCourse(null);setCourseQ(customName);setShowCustom(false);setShowDrop(false);}}>
              Confirmar camp
            </button>
          </div>
        )}
      </div>

      {/* GAME MODE */}
      <div style={{marginBottom:16}}>
        <span className="label">Modalitat</span>
        <div style={{display:"flex",gap:8}}>
          {GAME_MODES.map(m => (
            <div key={m.id} className="card" style={{flex:1,padding:"11px 13px",cursor:"pointer",marginBottom:0,borderColor:gameMode===m.id?"#CAFF4D":"#222327",background:gameMode===m.id?"rgba(202,255,77,.06)":"#1A1B1E"}} onClick={()=>setGameMode(m.id)}>
              <div style={{fontWeight:700,fontSize:14}}>{m.label}</div>
              <div style={{fontSize:11,color:"#555761",fontWeight:400,marginTop:2}}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PLAYERS */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span className="label" style={{marginBottom:0}}>Jugadors ({players.length}/4)</span>
          {players.length < 4 && <button className="btn btn-ghost btn-sm" onClick={addPlayer}>+ Afegir</button>}
        </div>
        {players.map((p,i) => (
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"#1A1B1E",border:"1px solid #222327",borderRadius:8,marginBottom:6}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:PLAYER_COLORS[i],flexShrink:0}} />
            {p.isMe
              ? <div style={{flex:1,fontWeight:600,fontSize:14}}>{p.name} <span style={{fontSize:11,color:"#555761",fontWeight:400}}>· Tu</span></div>
              : <input className="inp" style={{flex:1,padding:"6px 8px",fontSize:14,background:"transparent",border:"none",borderBottom:"1px solid #222327",borderRadius:0}} placeholder="Nom del jugador" value={p.name} onChange={e=>updateName(p.id,e.target.value)} />
            }
            {!p.isMe && <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:18,padding:4,lineHeight:1}} onClick={()=>removePlayer(p.id)}>×</button>}
          </div>
        ))}
      </div>

      {/* LIVE */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderTop:"1px solid #1A1B1E",borderBottom:"1px solid #1A1B1E",marginBottom:20}}>
        <div>
          <div style={{fontWeight:600,fontSize:14}}>Retransmissió en directe</div>
          <div style={{fontSize:11,color:"#555761",fontWeight:400,marginTop:2}}>Els teus seguidors podran veure la partida</div>
        </div>
        <button className="toggle" style={{background:liveShare?"#CAFF4D":"#222327"}} onClick={()=>setLiveShare(v=>!v)}>
          <div className="toggle-knob" style={{left:liveShare?22:3}} />
        </button>
      </div>

      <button className="btn btn-primary" disabled={!activeCourse} onClick={handleStart} style={{marginBottom:10,fontSize:17}}>
        Som-hi! →
      </button>
      <button className="btn btn-ghost" style={{fontSize:13}}>Cancel·lar</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCORECARD SCREEN
═══════════════════════════════════════════════════════════════ */
function ScorecardScreen({ gameData, onFinish, user, openAuth }) {
  const { course, date, gameMode, players, liveShare } = gameData;
  const pph = Math.round(course.par / course.holes);

  const [scores, setScores] = useState(() =>
    Array.from({length:course.holes}, (_,i) => ({
      hole: i+1,
      par: pph,
      playerScores: Object.fromEntries(players.map(p => [p.id, null])),
    }))
  );
  const [curHole, setCurHole] = useState(0);
  const [activePlayerId, setActivePlayerId] = useState(players[0].id);

  const hole = scores[curHole];
  const par = hole.par;
  const myScore = hole.playerScores[activePlayerId];

  const filled = scores.filter((_,i) => players.every(p => scores[i].playerScores[p.id] !== null)).length;
  const allDone = filled === course.holes;

  const playerTotalScore = (pid) => scores.reduce((a,h) => a + (h.playerScores[pid] ?? h.par), 0);
  const playerPCPts = (pid) => scores.reduce((a,h) => {
    const s = h.playerScores[pid];
    return a + (s !== null ? calcPCPoints(s, h.par) : 0);
  }, 0);

  const setHoleScore = (pid, val) => {
    setScores(prev => prev.map((h,i) =>
      i===curHole ? {...h, playerScores:{...h.playerScores,[pid]:val}} : h
    ));
  };

  const si = myScore !== null ? scoreInfo(myScore, par) : null;

  const getScoreClass = (s) => {
    const d = s - par;
    if (d <= -2) return "eagle-col";
    if (d === -1) return "birdie-col";
    if (d === 0)  return "par-col";
    if (d === 1)  return "bogey-col";
    return "bad-col";
  };

  return (
    <div className="page-scroll">
      {/* ── Header info */}
      <div style={{marginBottom:14}}>
        <div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
          <span style={{fontSize:11,color:"#555761",fontWeight:400}}>{filled}/{course.holes} forats · {GAME_MODES.find(m=>m.id===gameMode)?.label}</span>
          <span className="pill" style={{fontSize:10,color:"#CAFF4D",borderColor:"rgba(202,255,77,.25)"}}>{playerPCPts(players.find(p=>p.isMe)?.id||players[0].id)} pts prov.</span>
        </div>
        <div className="prog" style={{marginTop:6}}>
          <div className="prog-fill" style={{width:`${(filled/course.holes)*100}%`,background:"#CAFF4D"}}/>
        </div>
      </div>

      {/* ── Player tabs (multiplayer) */}
      {players.length > 1 && (
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
          {players.map((p,i) => {
            const done = hole.playerScores[p.id] !== null;
            return (
              <button key={p.id} className={`player-tab${activePlayerId===p.id?" active":""}`}
                style={{"--pc":PLAYER_COLORS[i]} as React.CSSProperties}
                onClick={()=>setActivePlayerId(p.id)}>
                {done ? `${p.name.split(" ")[0]} ✓` : p.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Hole navigation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button className="btn btn-ghost btn-icon" disabled={curHole===0} onClick={()=>setCurHole(h=>h-1)}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>Forat</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(60px,18vw,84px)",lineHeight:1,color:"#fff"}}>{curHole+1}</div>
          <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
            <span className="pill" style={{fontSize:11}}>Par {par}</span>
            {si && <span className="pill" style={{fontSize:11,color:si.color,borderColor:`${si.color}44`}}>{si.label}</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" disabled={curHole===course.holes-1} onClick={()=>setCurHole(h=>h+1)}>›</button>
      </div>

      {/* ── Score buttons */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",textAlign:"center",marginBottom:12}}>
          Cops{players.length>1?` — ${players.find(p=>p.id===activePlayerId)?.name}`:""}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {Array.from({length:par+4},(_,i)=>i+1).map(s => {
            const isOn = myScore===s;
            const si2 = scoreInfo(s,par);
            return (
              <button key={s} className={`score-ring ${getScoreClass(s)}${isOn?" active":""}`}
                style={isOn?{background:si2?.color||"#CAFF4D",borderColor:si2?.color||"#CAFF4D",color:"#0A0A0B"}:{borderColor:scoreColor(s-par)+"44"}}
                onClick={()=>{
                  setHoleScore(activePlayerId, s);
                  const pidx = players.findIndex(p=>p.id===activePlayerId);
                  if (pidx < players.length-1) {
                    setActivePlayerId(players[pidx+1].id);
                  }
                }}>{s}</button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
          {[["Eagle+","#FBBF24"],["Birdie","#60A5FA"],["Par","#CAFF4D"],["Bogey","#fff"],["Pena","#EF4444"]].map(([l,c])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:c}}/>
              <span style={{fontSize:10,color:"#555761",fontWeight:600}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mini scorecard */}
      <div className="card" style={{padding:"12px 13px",marginBottom:14}}>
        <div className="sec-title" style={{marginBottom:6}}>Targeta de puntuació</div>
        <div style={{overflowX:"auto"}}>
          <table className="sc-table">
            <thead>
              <tr>
                <th style={{textAlign:"left"}}>F.</th>
                <th>Par</th>
                {players.map((p,i)=><th key={p.id} style={{color:PLAYER_COLORS[i]}}>{p.name.split(" ")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {scores.slice(0,curHole+1).map((h,idx)=>(
                <tr key={idx} onClick={()=>setCurHole(idx)} style={{cursor:"pointer",background:idx===curHole?"#1A1B1E":"transparent"}}>
                  <td style={{textAlign:"left",fontWeight:700}}>{h.hole}</td>
                  <td style={{color:"#555761"}}>{h.par}</td>
                  {players.map((p,pi)=>{
                    const s = h.playerScores[p.id];
                    const d = s !== null ? s - h.par : null;
                    const c = d===null?"#555761":d<0?"#FBBF24":d===0?"#CAFF4D":d===1?"#FFFFFF":"#EF4444";
                    return <td key={p.id} style={{color:c,fontWeight:700}}>{s??"-"}</td>;
                  })}
                </tr>
              ))}
              {curHole > 0 && (
                <tr style={{borderTop:"2px solid #2A2B30"}}>
                  <td style={{textAlign:"left",fontSize:10,color:"#555761",letterSpacing:".06em"}}>TOT.</td>
                  <td style={{color:"#555761",fontWeight:700}}>{scores.slice(0,curHole+1).reduce((a,h)=>a+h.par,0)}</td>
                  {players.map((p)=>{
                    const tot = scores.slice(0,curHole+1).reduce((a,h)=>a+(h.playerScores[p.id]??h.par),0);
                    const totPar = scores.slice(0,curHole+1).reduce((a,h)=>a+h.par,0);
                    const d = tot - totPar;
                    return <td key={p.id} style={{fontWeight:700,color:d<0?"#FBBF24":d===0?"#CAFF4D":"#FFFFFF"}}>{d>0?`+${d}`:d}</td>;
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Nav & Finish */}
      <div style={{display:"flex",gap:8}}>
        {curHole < course.holes-1 && (
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>{setCurHole(h=>h+1);setActivePlayerId(players[0].id);}}>
            Forat {curHole+2} →
          </button>
        )}
        {allDone && (
          <button className="btn btn-primary" style={{flex:1,background:"#FBBF24",color:"#0A0A0B"}} onClick={()=>onFinish(scores)}>
            Finalitzar ✓
          </button>
        )}
      </div>

      {!user && (
        <div style={{marginTop:12,fontSize:11,color:"#555761",textAlign:"center",fontWeight:400}}>
          Mode visitant · <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:600}} onClick={openAuth}>Crea un compte</span> per guardar l'historial
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GAME SUMMARY SCREEN
═══════════════════════════════════════════════════════════════ */
function SummaryScreen({ game, userPts, prevPts, setScreen, openAuth, user }) {
  const me = game.players.find(p => p.isMe);
  const diff = me?.diff ?? 0;
  const tierNow = getTier(userPts);
  const tierPrev = getTier(prevPts);
  const levelUp = tierNow.id !== tierPrev.id;

  return (
    <div className="page-scroll ani-up">
      {/* Hero */}
      <div style={{textAlign:"center",padding:"8px 0 24px"}}>
        <div style={{fontSize:56,marginBottom:8}}>{diff<=-2?"🔥":diff<0?"🎉":diff===0?"✅":"👊"}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:".04em",marginBottom:4}}>Partida finalitzada</div>
        <div style={{fontSize:13,color:"#555761",fontWeight:400}}>{game.course} · {game.date}</div>
      </div>

      {/* Classificació multi */}
      {game.players.length > 1 && (
        <div style={{marginBottom:10}}>
          <div className="sec-title">Classificació</div>
          {[...game.players].sort((a,b)=>a.score-b.score).map((p,rank)=>{
            const pi = game.players.findIndex(x=>x.id===p.id);
            return (
              <div key={p.id} className="card" style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                <div style={{fontSize:22,width:28,textAlign:"center"}}>{["🥇","🥈","🥉"][rank]||`#${rank+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:PLAYER_COLORS[pi]}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#555761",fontWeight:400}}>{p.score} cops · {p.points} pts P&C</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:p.diff<0?"#FBBF24":p.diff===0?"#CAFF4D":"#fff"}}>
                  {p.diff>0?`+${p.diff}`:p.diff}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {me && (
        <>
          {/* Score */}
          <div className="card" style={{padding:"22px",textAlign:"center",marginBottom:10,
            borderColor:diff<0?"rgba(251,191,36,.4)":diff===0?"rgba(202,255,77,.3)":"#222327",
            background:diff<0?"rgba(251,191,36,.06)":diff===0?"rgba(202,255,77,.04)":"#1A1B1E"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:64,lineHeight:1,
              color:diff<0?"#FBBF24":diff===0?"#CAFF4D":"#FFFFFF"}}>
              {diff>0?`+${diff}`:diff}
            </div>
            <div style={{fontSize:12,color:"#555761",marginTop:4}}>Score {me.score} · Par {game.scores.reduce((a,h)=>a+h.par,0)}</div>
          </div>

          {/* Punts */}
          <div className="card card-lime" style={{padding:"16px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:"#555761",marginBottom:2,fontWeight:500}}>Punts guanyats</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:38,color:"#CAFF4D",lineHeight:1}}>+{me.points}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#555761",marginBottom:2,fontWeight:500}}>Total acumulat</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26}}>{userPts}</div>
            </div>
          </div>
        </>
      )}

      {/* Level up */}
      {levelUp && (
        <div className="card ani-pop" style={{background:"rgba(202,255,77,.08)",borderColor:"rgba(202,255,77,.4)",padding:"18px",textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:40}}>{tierNow.emoji}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",letterSpacing:".04em",marginTop:6}}>LEVEL UP! → {tierNow.name}</div>
        </div>
      )}

      {/* Guest save CTA */}
      {!user && (
        <div className="card card-lime" style={{padding:"16px",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:5}}>💾 Vols guardar aquesta partida?</div>
          <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,marginBottom:12,fontWeight:400}}>Crea un compte gratuït per guardar l'historial i acumular <strong style={{color:"#CAFF4D"}}>{me?.points||0} punts</strong> al rànquing.</div>
          <button className="btn btn-primary" style={{fontSize:13}} onClick={openAuth}>Crea un compte — és gratis →</button>
        </div>
      )}

      {/* Hole breakdown */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Resum forat a forat</div>
        <div style={{overflowX:"auto"}}>
          <table className="sc-table">
            <thead>
              <tr>
                <th style={{textAlign:"left"}}>F.</th>
                <th>Par</th>
                {game.players.map((p,i)=><th key={p.id} style={{color:PLAYER_COLORS[i]}}>{p.name.split(" ")[0]}</th>)}
                {game.players.length===1 && <th style={{color:"#CAFF4D"}}>Pts</th>}
              </tr>
            </thead>
            <tbody>
              {game.scores.map((h,i)=>{
                const myP = game.players.find(p=>p.isMe);
                const myS = myP ? h.playerScores[myP.id] : null;
                return (
                  <tr key={i}>
                    <td style={{textAlign:"left",fontWeight:700}}>{h.hole}</td>
                    <td style={{color:"#555761"}}>{h.par}</td>
                    {game.players.map((p,pi)=>{
                      const s = h.playerScores[p.id]??h.par;
                      const d = s - h.par;
                      const c = d<0?"#FBBF24":d===0?"#CAFF4D":d===1?"#FFFFFF":"#EF4444";
                      return <td key={p.id} style={{color:c,fontWeight:700}}>{s}</td>;
                    })}
                    {game.players.length===1 && myS!==null && <td style={{color:"#CAFF4D",fontWeight:700}}>+{calcPCPoints(myS,h.par)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="btn btn-primary" style={{marginBottom:8,fontSize:15}} onClick={()=>setScreen("home")}>
        Tornar a l'inici
      </button>
      <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setScreen("game-setup")}>
        Nova partida
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RANKING SCREEN — 3 filtres: Global / Setmana / Per camp
═══════════════════════════════════════════════════════════════ */
const LEADERBOARD_WEEK = [
  {rank:1,name:"Sònia Ros",      avatar:"SR",color:"#60A5FA",pts:180,best:-2,club:"Canal Olímpic"},
  {rank:2,name:"Jordi Mas",      avatar:"JM",color:"#A78BFA",pts:144,best:-1,club:"Áccura Teià"},
  {rank:3,name:"Marc Puig",      avatar:"MP",color:"#CAFF4D",pts:120,best:-3,club:"Pink Beaks"},
  {rank:4,name:"Laura Fernández",avatar:"LF",color:"#F472B6",pts:96, best:0, club:"HCP1"},
  {rank:5,name:"Marta Vilà",     avatar:"MV",color:"#FBBF24",pts:72, best:1, club:"Vallromanes"},
];
const LEADERBOARD_CAMP = [
  {camp:"Vallromanes",      leader:"Marc Puig",      avg:-2.1,games:18,best:-4,avatar:"MP",color:"#CAFF4D"},
  {camp:"HCP1",             leader:"Sònia Ros",       avg:-1.4,games:12,best:-2,avatar:"SR",color:"#60A5FA"},
  {camp:"Canal Olímpic",    leader:"Jordi Mas",       avg:-0.8,games:8, best:-1,avatar:"JM",color:"#A78BFA"},
  {camp:"Áccura Teià",      leader:"Laura Fernández", avg:-0.5,games:6, best:-1,avatar:"LF",color:"#F472B6"},
  {camp:"Pitch&Putt Badalona",leader:"Pau Serra",     avg:0.2, games:9, best:0, avatar:"PS",color:"#34D399"},
];

function RankingScreen({ user, openAuth, setScreen }) {
  const [filter, setFilter] = useState("global");
  const tabs = [["global","Global"],["setmana","Setmana"],["camp","Per camp"]];
  const goProfile = () => setScreen("profile");
  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Classificació</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,9vw,46px)",letterSpacing:".04em",lineHeight:1}}>RÀNQUING <span className="lime">P&C</span></div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #1A1B1E",marginBottom:18,gap:0}}>
        {tabs.map(([k,l]) => (
          <button key={k} style={{padding:"8px 16px",border:"none",borderBottom:filter===k?"2px solid #CAFF4D":"2px solid transparent",marginBottom:-1,background:"none",fontSize:12,fontWeight:700,color:filter===k?"#CAFF4D":"#555761",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Inter",letterSpacing:".04em",textTransform:"uppercase"}} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      {/* ── GLOBAL */}
      {filter==="global" && <>
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          {[LEADERBOARD[1],LEADERBOARD[0],LEADERBOARD[2]].map((p,col) => {
            const tier = getTier(p.pts); const isF = col===1;
            return (
              <div key={p.rank} className="card" style={{flexShrink:0,width:isF?152:128,padding:"14px 10px",textAlign:"center",borderColor:isF?"#CAFF4D":"#222327",background:isF?"rgba(202,255,77,.04)":"#1A1B1E",cursor:"pointer"}} onClick={goProfile}>
                <div style={{fontSize:isF?28:20,marginBottom:4}}>{["🥈","🥇","🥉"][col]}</div>
                <div style={{width:34,height:34,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0A0B",margin:"0 auto 7px"}}>{p.avatar}</div>
                <div style={{fontWeight:600,fontSize:11,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <TierBadge tierId={tier.id} />
                <div style={{fontFamily:"'Bebas Neue'",fontSize:isF?30:24,color:"#CAFF4D",lineHeight:1.2,marginTop:4}}>{p.pts}</div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",padding:"7px 13px",borderBottom:"1px solid #1A1B1E",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
            <span>#</span><span>Jugador</span><span style={{textAlign:"center"}}>Millor</span><span style={{textAlign:"right"}}>Pts</span>
          </div>
          {LEADERBOARD.map((p,i) => {
            const tier = getTier(p.pts);
            return (
              <div key={p.rank} style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",alignItems:"center",padding:"10px 13px",borderBottom:"1px solid #111214",cursor:"pointer"}} onClick={goProfile}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:i<3?17:13,color:i<3?"#CAFF4D":"#2A2B30"}}>0{p.rank}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.avatar}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize:9,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tier.emoji} {tier.name} · {tier.club||p.club}</div>
                  </div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:16,textAlign:"center",color:p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{p.best>0?`+${p.best}`:p.best}</div>
                <div style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#CAFF4D"}}>{p.pts}</div>
              </div>
            );
          })}
          {!user && <div style={{padding:"11px 13px",background:"rgba(202,255,77,.04)",borderTop:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"#787C8A"}}>Crea un compte per aparèixer al rànquing</span>
            <button className="btn btn-primary btn-sm" style={{borderRadius:100,padding:"7px 14px",fontSize:11,width:"auto"}} onClick={openAuth}>Uneix-te →</button>
          </div>}
        </div>
      </>}

      {/* ── SETMANA */}
      {filter==="setmana" && <>
        <div className="card" style={{padding:"10px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <div className="live-dot"/><span style={{fontSize:11,fontWeight:600,color:"#787C8A"}}>Rànquing de la setmana actual · es reinicia cada dilluns</span>
        </div>
        <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",padding:"7px 13px",borderBottom:"1px solid #1A1B1E",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
            <span>#</span><span>Jugador</span><span style={{textAlign:"center"}}>Millor</span><span style={{textAlign:"right"}}>Pts 7d</span>
          </div>
          {LEADERBOARD_WEEK.map((p,i) => (
            <div key={p.rank} style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",alignItems:"center",padding:"10px 13px",borderBottom:"1px solid #111214"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:i<3?17:13,color:i<3?"#CAFF4D":"#2A2B30"}}>0{p.rank}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.avatar}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:9,color:"#555761"}}>{p.club}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,textAlign:"center",color:p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{p.best>0?`+${p.best}`:p.best}</div>
              <div style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#CAFF4D"}}>{p.pts}</div>
            </div>
          ))}
        </div>
      </>}

      {/* ── PER CAMP */}
      {filter==="camp" && <>
        <div className="card" style={{padding:"10px 13px",marginBottom:12}}>
          <span style={{fontSize:11,fontWeight:500,color:"#787C8A"}}>Millors scores per camp · tots els temps</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {LEADERBOARD_CAMP.map((c,i) => (
            <div key={c.camp} className="card" style={{padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{c.camp}</div>
                  <div style={{fontSize:10,color:"#555761"}}>{c.games} partides registrades</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#CAFF4D",lineHeight:1}}>{c.best>0?`+${c.best}`:c.best}</div>
                  <div style={{fontSize:9,color:"#555761"}}>millor score</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{c.avatar}</div>
                <div style={{fontSize:11,color:"#787C8A"}}>Líder: <span style={{color:"#fff",fontWeight:600}}>{c.leader}</span> · avg {c.avg>0?`+${c.avg}`:c.avg}</div>
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOURNAMENTS SCREEN
═══════════════════════════════════════════════════════════════ */
function TournamentsScreen({ openAuth, user }) {
  const [cat, setCat] = useState("all");
  const cats = [{id:"all",l:"Tots"},{id:"open",l:"Oberts"},{id:"club",l:"De club"},{id:"master",l:"Master Series"},{id:"social",l:"Social"}];
  const filtered = cat==="all" ? TOURNAMENTS_DATA : TOURNAMENTS_DATA.filter(t=>t.category===cat);
  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Competicions 2025</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>TORNEJOS <span className="lime">P&C</span></div>
      </div>
      {/* Category filter */}
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        {cats.map(c => (
          <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"6px 13px",borderRadius:100,border:`1px solid ${cat===c.id?"#CAFF4D":"#222327"}`,background:cat===c.id?"rgba(202,255,77,.1)":"transparent",color:cat===c.id?"#CAFF4D":"#555761",fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Inter",letterSpacing:".04em",flexShrink:0}}>{c.l}</button>
        ))}
      </div>
      {filtered.map(t => {
        const mt = TIERS.find(x=>x.id===t.minTier);
        const spotsLeft = t.left;
        const isFull = spotsLeft === 0;
        return (
          <div key={t.id} className="card" style={{padding:"15px",marginBottom:10,borderColor:t.status==="soon"?"#222327":spotsLeft<=5?"rgba(251,191,36,.3)":"#222327"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:3,background:t.status==="open"?"rgba(52,211,153,.15)":"rgba(96,165,250,.1)",color:t.status==="open"?"#34D399":"#60A5FA",border:`1px solid ${t.status==="open"?"rgba(52,211,153,.3)":"rgba(96,165,250,.2)"}`}}>
                    {t.status==="open"?"● Obert":"Aviat"}
                  </span>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#555761"}}>{t.category.toUpperCase()}</span>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                <div style={{fontSize:11,color:"#787C8A",marginTop:2}}>{t.course} · {t.location}</div>
              </div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",lineHeight:1}}>{t.dateS}</div>
                <div style={{fontSize:10,color:"#555761"}}>2025</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              <span className="pill" style={{fontSize:9}}>🏌️ {t.format}</span>
              <span className="pill" style={{fontSize:9,color:mt?.color,borderColor:mt?.border}}>Min: {mt?.emoji} {mt?.name}</span>
              <span className="pill" style={{fontSize:9}}>💰 {t.fee}</span>
              <span className="pill" style={{fontSize:9,color:"#CAFF4D",borderColor:"rgba(202,255,77,.25)"}}>🏅 {t.prize}</span>
            </div>
            {/* Spots bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:10,color:"#555761",fontWeight:500}}>{isFull?"Complet":spotsLeft<=5?`⚡ Últims ${spotsLeft} llocs!`:`${spotsLeft} llocs disponibles`}</span>
              <span style={{fontSize:10,color:"#555761"}}>{t.spots-t.left}/{t.spots}</span>
            </div>
            <div className="prog" style={{marginBottom:12}}>
              <div className="prog-fill" style={{width:`${((t.spots-t.left)/t.spots)*100}%`,background:spotsLeft<=5?"#FBBF24":"#CAFF4D"}}/>
            </div>
            {t.status==="open" ? (
              <button className="btn btn-primary" style={{fontSize:13,padding:"11px"}} disabled={isFull} onClick={!user?openAuth:undefined}>
                {isFull?"Complet":!user?"Uneix-te per inscriure't →":"Inscriure'm →"}
              </button>
            ) : (
              <button className="btn btn-ghost" style={{fontSize:12,padding:"10px"}} onClick={!user?openAuth:undefined}>Avisa'm quan s'obri →</button>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="card" style={{padding:"32px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>🏆</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:".04em"}}>Aviat hi haurà tornejos d'aquesta categoria</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOP SCREEN — coming soon
═══════════════════════════════════════════════════════════════ */
function ShopScreen({ openAuth, user }) {
  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Kits & Gear</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>BOTIGA <span className="lime">P&C</span></div>
      </div>
      {/* Coming soon banner */}
      <div style={{background:"rgba(202,255,77,.07)",border:"1px solid rgba(202,255,77,.2)",borderRadius:12,padding:"22px 18px",textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:42,marginBottom:10}}>🛒</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:"#CAFF4D",letterSpacing:".04em",marginBottom:6}}>AVIAT DISPONIBLE</div>
        <div style={{fontSize:13,color:"#787C8A",lineHeight:1.7,marginBottom:14}}>La botiga oficial de P&C obrirà aviat. Kits de clubs, gear exclusiu P&C i molt més. El 10% de cada compra va al teu club.</div>
        <button className="btn btn-primary" style={{fontSize:13}} onClick={!user?openAuth:undefined}>
          {user?"Avisa'm quan obri →":"Crea un compte per ser el primer →"}
        </button>
      </div>
      {/* Preview products */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:12}}>Avantvisualització</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {PRODUCTS_DATA.map(p => (
          <div key={p.id} className="card" style={{padding:"14px 12px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#CAFF4D,rgba(202,255,77,0))"}}/>
            <div style={{fontSize:28,marginBottom:8}}>{p.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,marginBottom:3,lineHeight:1.3}}>{p.name}</div>
            <div style={{fontSize:10,color:"#555761",marginBottom:8}}>{p.club}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#CAFF4D"}}>{p.price}</div>
              <span style={{fontSize:8,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",padding:"2px 7px",borderRadius:3,background:"rgba(202,255,77,.1)",color:"#CAFF4D",border:"1px solid rgba(202,255,77,.2)"}}>{p.tag}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:24,flexShrink:0}}>💡</div>
        <div>
          <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>El teu club cobra el 10%</div>
          <div style={{fontSize:11,color:"#787C8A",lineHeight:1.6}}>Cada compra al kit oficial del teu club li aporta un 10% directament. Suport real, no màrqueting.</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE / STATS SCREEN
═══════════════════════════════════════════════════════════════ */
function ProfileScreen({ user, userPts, setScreen }) {
  const profile = PLAYER_PROFILE;
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(t=>t.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const distTotal = Object.values(profile.dist).reduce((a,b)=>a+b,0);
  const distPct = (k) => Math.round((profile.dist[k]/distTotal)*100);

  return (
    <div className="page-scroll">
      {/* Header */}
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Perfil</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(26px,7vw,40px)",letterSpacing:".04em",lineHeight:1}}>{user?.name||profile.name}</div>
          {(user?.club||profile.club) && <div style={{fontSize:12,color:"#787C8A",marginTop:3}}>{user?.club||profile.club}</div>}
        </div>
        <div style={{width:54,height:54,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:18,color:"#0A0A0B"}}>{(user?.name||profile.name).split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
      </div>

      {/* Tier card */}
      <div className="card card-lime" style={{marginBottom:12,borderColor:tier.border,background:tier.bg}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:7,alignItems:"center"}}><TierBadge tierId={tier.id}/><span className="pill" style={{color:tier.color}}>⚡ {userPts} pts</span></div>
          <div style={{fontSize:28}}>{tier.emoji}</div>
        </div>
        {nextTier ? <>
          <div style={{fontSize:11,color:"#555761",marginBottom:5}}>{nextTier.min-userPts} pts per arribar a <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name} {nextTier.emoji}</span></div>
          <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:tier.color}}/></div>
        </> : <div style={{fontSize:11,color:"#CAFF4D",fontWeight:700}}>🔥 Nivell màxim aconseguit!</div>}
      </div>

      {/* Key stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
        {[{l:"Partides",v:profile.games},{l:"HCP",v:profile.hcp},{l:"Ratxa",v:`${profile.streak}🔥`}].map(s=>(
          <div key={s.l} className="card" style={{padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Score trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Evolució de scores — últims 10 rounds</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:5,height:56,marginBottom:6}}>
          {profile.trend.map((r,i) => {
            const worst = Math.max(...profile.trend.map(x=>x.s));
            const best = Math.min(...profile.trend.map(x=>x.s));
            const range = worst - best || 1;
            const h = Math.round(((worst-r.s)/range)*44)+8;
            const c = r.s<=-2?"#FBBF24":r.s<0?"#60A5FA":r.s===0?"#CAFF4D":"#9CA3AF";
            return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
              <div style={{fontSize:8,color:c,fontWeight:700,letterSpacing:".04em"}}>{r.s>0?`+${r.s}`:r.s}</div>
              <div style={{width:"100%",background:c,borderRadius:"2px 2px 0 0",height:h,opacity:.9}}/>
            </div>;
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{fontSize:8,color:"#555761"}}>{profile.trend[0].date}</div>
          <div style={{fontSize:8,color:"#555761"}}>{profile.trend[profile.trend.length-1].date}</div>
        </div>
      </div>

      {/* HCP evolution */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Evolució Handicap</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:48,marginBottom:6}}>
          {profile.hcpHist.map((h,i) => {
            const max = Math.max(...profile.hcpHist.map(x=>x.v));
            const ht = Math.round((h.v/max)*40)+4;
            const isLast = i===profile.hcpHist.length-1;
            return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
              <div style={{fontSize:8,color:isLast?"#CAFF4D":"#555761",fontWeight:isLast?700:400}}>{h.v}</div>
              <div style={{width:"100%",background:isLast?"#CAFF4D":"#2A2B30",borderRadius:"2px 2px 0 0",height:ht,transition:"height .3s"}}/>
              <div style={{fontSize:8,color:"#555761"}}>{h.m}</div>
            </div>;
          })}
        </div>
        <div style={{fontSize:11,color:"#787C8A",fontWeight:400}}>HCP actual: <span style={{color:"#CAFF4D",fontWeight:700}}>{profile.hcp}</span> · millora de {(profile.hcpHist[0].v-profile.hcp).toFixed(1)} des de novembre</div>
      </div>

      {/* Distribution */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Distribució de resultats</div>
        {[{k:"eagle",l:"Eagle",c:"#FBBF24"},{k:"birdie",l:"Birdie",c:"#60A5FA"},{k:"par",l:"Par",c:"#CAFF4D"},{k:"bogey",l:"Bogey",c:"#9CA3AF"},{k:"double",l:"D.Bogey",c:"#EF4444"},{k:"triple",l:"Triple+",c:"#7F1D1D"}].map(r=>(
          <div key={r.k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:52,fontSize:10,fontWeight:600,color:r.c,textAlign:"right",flexShrink:0}}>{r.l}</div>
            <div style={{flex:1,height:14,background:"#111214",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${distPct(r.k)}%`,background:r.c,borderRadius:3,transition:"width .4s"}}/>
            </div>
            <div style={{width:36,fontSize:10,color:"#555761",flexShrink:0}}>{profile.dist[r.k]} ({distPct(r.k)}%)</div>
          </div>
        ))}
      </div>

      {/* Best courses */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Millors camps</div>
        {profile.bestCourses.map((c,i)=>(
          <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid #111214":"none"}}>
            <div style={{fontSize:18,width:24,textAlign:"center",flexShrink:0}}>{c.f||`0${i+1}`}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
              <div style={{fontSize:10,color:"#555761"}}>{c.played} partides · avg {c.avg>0?`+${c.avg}`:c.avg}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#CAFF4D",lineHeight:1}}>{c.best>0?`+${c.best}`:c.best}</div>
              <div style={{fontSize:9,color:"#555761"}}>best</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tournaments */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{l:"Tornejos",v:profile.tourWon===1?"1 victòria":"Cap victòria"},{l:"Pts aquest mes",v:`+${profile.ptsThisMonth||240}`}].map(s=>(
          <div key={s.l} className="card" style={{padding:"13px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:3,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setScreen("home")}>← Tornar</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════════ */
function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [club, setClub] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    setErr("");
    if (mode==="register" && !name.trim()) { setErr("Escriu el teu nom o àlies"); return; }
    if (!email.includes("@") || !email.includes(".")) { setErr("Email invàlid"); return; }
    onAuth({ name: name.trim() || email.split("@")[0], email: email.trim(), club: club.trim() });
  };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:".04em",marginBottom:4}}>
          {mode==="register"?"UNEIX-TE A P&C":"ENTRAR"}
        </div>
        <div style={{fontSize:12,color:"#787C8A",marginBottom:20,fontWeight:400}}>
          {mode==="register"?"Gratuït · Sense targeta de crèdit":"Benvingut de nou"}
        </div>

        {mode==="register" && (
          <>
            <div style={{marginBottom:12}}>
              <span className="label">Nom o àlies</span>
              <input className="inp" placeholder="Marc Puig" value={name}
                onChange={e=>{setName(e.target.value);setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&submit()}
                autoFocus/>
            </div>
            <div style={{marginBottom:12}}>
              <span className="label">Club (opcional)</span>
              <input className="inp" placeholder="Pink Beaks, Canal Olímpic..." value={club}
                onChange={e=>setClub(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </>
        )}

        <div style={{marginBottom:20}}>
          <span className="label">Email</span>
          <input className="inp" type="email" placeholder="tu@email.com" value={email}
            onChange={e=>{setEmail(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        {err && (
          <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#EF4444",marginBottom:12}}>
            ⚠ {err}
          </div>
        )}

        <button className="btn btn-primary" style={{fontSize:14,marginBottom:14,width:"100%"}} onClick={submit}>
          {mode==="register"?"Crear compte gratuït →":"Entrar →"}
        </button>

        <div style={{textAlign:"center",fontSize:12,color:"#555761"}}>
          {mode==="register"
            ? <>Ja tens compte? <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:700}} onClick={()=>{setMode("login");setErr("");}}>Entra</span></>
            : <>No tens compte? <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:700}} onClick={()=>{setMode("register");setErr("");}}>Crea'n un</span></>
          }
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState(null);
  const [userPts, setUserPts] = useState(340);
  const [history, setHistory] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [gameData, setGameData] = useState(null);
  const [lastGame, setLastGame] = useState(null);
  const [prevPts, setPrevPts] = useState(340);
  const leads = useRef([]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const openAuth = () => setShowAuth(true);
  const handleAuth = (u) => {
    setUser(u);
    setShowAuth(false);
    showToast(`👋 Benvingut/da, ${u.name.split(" ")[0]}!`);
  };

  const handleGameStart = (data) => {
    setGameData(data);
    setScreen("scorecard");
  };

  const handleGameFinish = (scores) => {
    if (!gameData) return;
    const totalPar = gameData.course.par;
    const players = gameData.players.map(p => {
      const pPts = scores.reduce((a,h) => {
        const s = h.playerScores[p.id];
        return a + (s !== null ? calcPCPoints(s, h.par) : 0);
      }, 0) + 8; // +8 partida completada
      const pScore = scores.reduce((a,h) => a + (h.playerScores[p.id] ?? h.par), 0);
      return { ...p, score:pScore, diff:pScore-totalPar, points:pPts };
    });
    const game = {
      id: Date.now(),
      course: gameData.course.name,
      date: gameData.date,
      mode: gameData.gameMode,
      players,
      scores: [...scores],
    };
    setHistory(prev => [game, ...prev]);
    const me = players.find(p => p.isMe);
    if (me) {
      setPrevPts(userPts);
      setUserPts(p => p + me.points);
    }
    setLastGame(game);
    setScreen("summary");
  };

  const setScreenSafe = (s) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  const isGameFlow = screen === "game-setup" || screen === "scorecard" || screen === "summary";

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <AppHeader screen={screen} setScreen={setScreenSafe} user={user} openAuth={openAuth} userPts={userPts} />

        {screen==="home"        && <HomeScreen        user={user} userPts={userPts} setUserPts={setUserPts} history={history} setScreen={setScreenSafe} openAuth={openAuth} leads={leads} />}
        {screen==="game-setup"  && <GameSetupScreen   user={user} openAuth={openAuth} onStart={handleGameStart} />}
        {screen==="scorecard"   && gameData && <ScorecardScreen gameData={gameData} onFinish={handleGameFinish} user={user} openAuth={openAuth} />}
        {screen==="summary"     && lastGame && <SummaryScreen   game={lastGame} userPts={userPts} prevPts={prevPts} setScreen={setScreenSafe} openAuth={openAuth} user={user} />}
        {screen==="ranking"     && <RankingScreen     user={user} openAuth={openAuth} setScreen={setScreenSafe} />}
        {screen==="tournaments"  && <TournamentsScreen  user={user} openAuth={openAuth} />}
        {screen==="shop"        && <ShopScreen        user={user} openAuth={openAuth} />}
        {screen==="profile"     && <ProfileScreen     user={user} userPts={userPts} setScreen={setScreenSafe} />}

        {!isGameFlow && <BottomNav screen={screen} setScreen={setScreenSafe} />}

        {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth} />}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
