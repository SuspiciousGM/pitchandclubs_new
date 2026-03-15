/* ─── TIER / GAME DATA ───────────────────────────────────────── */
export const TIERS = [
  { id:"caddie", name:"Caddie", emoji:"🎒", color:"#34D399", bg:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.3)",  min:0,    max:699   },
  { id:"player", name:"Player", emoji:"⛳", color:"#60A5FA", bg:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.3)",  min:700,  max:1799  },
  { id:"pro",    name:"Pro",    emoji:"🏆", color:"#A78BFA", bg:"rgba(167,139,250,.12)",border:"rgba(167,139,250,.3)", min:1800, max:3999  },
  { id:"master", name:"Master", emoji:"👑", color:"#CAFF4D", bg:"rgba(202,255,77,.12)", border:"rgba(202,255,77,.3)",  min:4000, max:99999 },
];

/* ─── BASE CAMPS (61) ────────────────────────────────────────── */
export const COURSES = [
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

export const PLAYER_COLORS = ["#CAFF4D","#60A5FA","#FBBF24","#F472B6"];

export const GAME_MODES = [
  { id:"stableford", label:"Stableford", desc:"Punts per forat" },
  { id:"medal",      label:"Medalplay",  desc:"Total de cops"   },
  { id:"parelles",   label:"Parelles",   desc:"Best ball · 2 o 4 jugadors" },
];

/* ─── MOCK LEADERBOARD ───────────────────────────────────────── */
export const LEADERBOARD = [
  { rank:1, name:"Marc Puig",       handle:"marc_pitchking", club:"Pink Beaks",    pts:2840, best:-4, avatar:"MP", color:"#CAFF4D" },
  { rank:2, name:"Sònia Ros",       handle:"sonia_ros",      club:"Canal Olímpic", pts:1920, best:-2, avatar:"SR", color:"#60A5FA" },
  { rank:3, name:"Jordi Mas",       handle:"jordi_mas",      club:"Áccura Teià",   pts:1240, best:-1, avatar:"JM", color:"#A78BFA" },
  { rank:4, name:"Laura Fernández", handle:"laura_fg",       club:"HCP1",          pts:890,  best:0,  avatar:"LF", color:"#F472B6" },
  { rank:5, name:"Pau Serra",       handle:"pau_serra",      club:"Badalona P&P",  pts:520,  best:1,  avatar:"PS", color:"#34D399" },
];

// ── TOURNAMENTS: fallback data (used if Google Sheets API unavailable) ──
export const TOURNAMENTS_FALLBACK = [
  {id:1,name:"P&C Spring Open",dateS:"18/04",course:"Vallromanes",location:"Vilanova del Vallès",format:"Strokeplay 18H",minTier:"player",spots:24,left:11,prize:"Kit P&C + 200 pts",status:"open",fee:"€15",category:"open"},
  {id:2,name:"Copa Canal Olímpic",dateS:"10/05",course:"Canal Olímpic",location:"Castelldefels",format:"Matchplay 9H",minTier:"caddie",spots:16,left:5,prize:"150 pts + greenfees",status:"open",fee:"€10",category:"club"},
  {id:3,name:"Master Series — R1",dateS:"07/06",course:"HCP1",location:"Sant Vicenç",format:"Strokeplay 18H",minTier:"master",spots:12,left:12,prize:"300 pts + trofeu",status:"soon",fee:"€25",category:"master"},
  {id:4,name:"Torneig Sant Joan",dateS:"21/06",course:"P&P Badalona",location:"Badalona",format:"Stableford 9H",minTier:"caddie",spots:32,left:24,prize:"Festa + 80 pts",status:"soon",fee:"Gratis",category:"social"},
];

// ── Keep alias for HomeScreen previews ──
export const TOURNAMENTS_DATA = TOURNAMENTS_FALLBACK;

export const PRODUCTS_DATA = [
  {id:1,name:"Kit Oficial Pink Beaks 24/25",club:"Pink Beaks",price:"€49",emoji:"👕",tag:"Kit Oficial"},
  {id:2,name:"Gorra Club Canal Olímpic",club:"Canal Olímpic",price:"€32",emoji:"🧢",tag:"Kit Oficial"},
  {id:3,name:"Polo Pro HCP1",club:"HCP1",price:"€65",emoji:"👕",tag:"Kit Oficial"},
  {id:4,name:"Pack Iniciació P&P",club:"P&C Gear",price:"€89",emoji:"🎒",tag:"Gear"},
  {id:5,name:'Samarreta "Less Elitist"',club:"P&C Originals",price:"€35",emoji:"🖤",tag:"Original"},
  {id:6,name:"Polo Vallromanes Ed.",club:"Vallromanes",price:"€44",emoji:"👕",tag:"Kit Oficial"},
];

export const PLAYER_PROFILE = {
  handle:"marc_pitchking",name:"Marc Puig",club:"Pink Beaks",
  pts:2840,hcp:3.2,games:42,color:"#CAFF4D",streak:7,tourWon:1,
  trend:[{date:"01/03",s:-1},{date:"08/03",s:-2},{date:"15/03",s:0},{date:"22/03",s:-2},{date:"29/03",s:-3},{date:"05/04",s:-1},{date:"12/04",s:-4},{date:"19/04",s:-2},{date:"26/04",s:-3},{date:"03/05",s:-4}],
  hcpHist:[{m:"Nov",v:6.8},{m:"Des",v:5.9},{m:"Gen",v:5.1},{m:"Feb",v:4.4},{m:"Mar",v:3.8},{m:"Abr",v:3.2}],
  bestCourses:[{name:"Vallromanes",best:-4,avg:-2.1,played:18,f:"🏆"},{name:"HCP1",best:-2,avg:-1.4,played:12,f:"🥈"},{name:"Áccura Teià",best:-1,avg:-0.8,played:8,f:"🥉"},{name:"Canal Olímpic",best:-1,avg:-0.5,played:4,f:""}],
  dist:{eagle:3,birdie:48,par:127,bogey:62,double:14,triple:5},
};

export const LEADERBOARD_WEEK = [
  {rank:1,name:"Sònia Ros",avatar:"SR",color:"#60A5FA",pts:180,best:-2,club:"Canal Olímpic"},
  {rank:2,name:"Jordi Mas",avatar:"JM",color:"#A78BFA",pts:144,best:-1,club:"Áccura Teià"},
  {rank:3,name:"Marc Puig",avatar:"MP",color:"#CAFF4D",pts:120,best:-3,club:"Pink Beaks"},
  {rank:4,name:"Laura Fernández",avatar:"LF",color:"#F472B6",pts:96,best:0,club:"HCP1"},
  {rank:5,name:"Marta Vilà",avatar:"MV",color:"#FBBF24",pts:72,best:1,club:"Vallromanes"},
];

export const LEADERBOARD_CAMP = [
  {camp:"Vallromanes",leader:"Marc Puig",avg:-2.1,games:18,best:-4,avatar:"MP",color:"#CAFF4D"},
  {camp:"HCP1",leader:"Sònia Ros",avg:-1.4,games:12,best:-2,avatar:"SR",color:"#60A5FA"},
  {camp:"Canal Olímpic",leader:"Jordi Mas",avg:-0.8,games:8,best:-1,avatar:"JM",color:"#A78BFA"},
  {camp:"Áccura Teià",leader:"Laura Fernández",avg:-0.5,games:6,best:-1,avatar:"LF",color:"#F472B6"},
  {camp:"Pitch&Putt Badalona",leader:"Pau Serra",avg:0.2,games:9,best:0,avatar:"PS",color:"#34D399"},
];

export const MOCK_EXTRA = [
  { name:"Arnau Puig",  avatar:"AP", club:"Vallromanes",   pts:312, best:-3, color:"#60A5FA" },
  { name:"Marta Oller", avatar:"MO", club:"Mas Gurumbau",  pts:187, best:-1, color:"#F472B6" },
  { name:"Pere Vidal",  avatar:"PV", club:"Canal Olímpic", pts:94,  best: 0, color:"#FBBF24" },
];

export const SPAIN_PINS = [
  { id:"bcn", label:"BCN",  x:76, y:30, games:8,  color:"#CAFF4D" },
  { id:"mad", label:"MAD",  x:42, y:42, games:5,  color:"#60A5FA" },
  { id:"vlc", label:"VLC",  x:62, y:55, games:3,  color:"#A78BFA" },
  { id:"bil", label:"BIL",  x:50, y:16, games:2,  color:"#F472B6" },
  { id:"mlg", label:"MLG",  x:38, y:78, games:4,  color:"#FBBF24" },
  { id:"zgz", label:"ZGZ",  x:58, y:28, games:1,  color:"#34D399" },
  { id:"svq", label:"SVQ",  x:28, y:72, games:2,  color:"#F87171" },
  { id:"pmi", label:"PMI",  x:88, y:50, games:6,  color:"#818CF8" },
];

export const UGC_FEED = [
  {id:1, user:"marc_pitchking",  club:"Pink Beaks",    label:"Eagle",  course:"Vallromanes",   hole:12, time:"fa 2h",  likes:47, img:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=75", caption:"Millor ronda de la temporada!", lc:"#FBBF24"},
  {id:2, user:"sonia_ros",       club:"Canal Olímpic", label:"Birdie", course:"HCP1",          hole:7,  time:"fa 3h",  likes:23, img:"https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=75", caption:"Primera ronda a HCP1",          lc:"#60A5FA"},
  {id:3, user:"pink_beaks_cc",   club:"Pink Beaks",    label:"Par",    course:"Áccura Teià",   hole:15, time:"fa 5h",  likes:31, img:"https://images.unsplash.com/photo-1600167957935-f21a51b0b1c2?w=600&q=75", caption:"Dia de vent perfecte",          lc:"#CAFF4D", tall:true},
  {id:4, user:"jordi_mas",       club:"Áccura Teià",   label:"Eagle",  course:"Vallromanes",   hole:3,  time:"fa 6h",  likes:58, img:"https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=75", caption:"Tres sous seguits",             lc:"#FBBF24"},
  {id:5, user:"laura_f",         club:"P&P Badalona",  label:"Birdie", course:"P&P Badalona",  hole:9,  time:"fa 7h",  likes:19, img:"https://images.unsplash.com/photo-1592919505780-303950ba33a8?w=600&q=75", caption:"Birdie al 9!",                  lc:"#60A5FA"},
  {id:6, user:"pau_serra",       club:"HCP1",          label:"Par",    course:"HCP1",          hole:11, time:"fa 8h",  likes:34, img:"https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=75", caption:"Ronda sòlida avui",             lc:"#CAFF4D"},
  {id:7, user:"marta_g",         club:"Vallromanes",   label:"Eagle",  course:"Vallromanes",   hole:4,  time:"fa 9h",  likes:72, img:"https://images.unsplash.com/photo-1530028716-4b9e4ef1f8b0?w=600&q=75", caption:"Eagle al 4!",                   lc:"#FBBF24", tall:true},
  {id:8, user:"albertpga",       club:"Canal Olímpic", label:"Birdie", course:"Canal Olímpic", hole:6,  time:"fa 10h", likes:41, img:"https://images.unsplash.com/photo-1561486246-bd47a59f06cb?w=600&q=75", caption:"Matinada de golf",              lc:"#60A5FA"},
  {id:9, user:"nuria_p",         club:"Áccura Teià",   label:"Par",    course:"Áccura Teià",   hole:18, time:"fa 11h", likes:28, img:"https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=75", caption:"Última ronda de la setmana",    lc:"#CAFF4D"},
  {id:10,user:"roger_golfcat",   club:"Pink Beaks",    label:"Birdie", course:"Vallromanes",   hole:13, time:"fa 12h", likes:15, img:"https://images.unsplash.com/photo-1571019613914-ce674fce5a4a?w=600&q=75", caption:"El 13 sempre dóna sort",        lc:"#60A5FA"},
  {id:11,user:"xavi_fairway",    club:"P&P Badalona",  label:"Par",    course:"P&P Badalona",  hole:2,  time:"fa 13h", likes:9,  img:"https://images.unsplash.com/photo-1565073619-9eba99a53d48?w=600&q=75", caption:"Primer forat del dia",          lc:"#CAFF4D"},
  {id:12,user:"irene_swing",     club:"HCP1",          label:"Eagle",  course:"HCP1",          hole:17, time:"fa 14h", likes:63, img:"https://images.unsplash.com/photo-1504435237997-a6f7a9a98b88?w=600&q=75", caption:"La millor de l'any!",           lc:"#FBBF24"},
];

export const LANGS = [{id:"ca",label:"CAT"},{id:"es",label:"ESP"},{id:"en",label:"ENG"}];
