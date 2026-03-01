import { useState, useRef, useEffect, useCallback } from "react";
import {
  Home, BarChart2, ShoppingBag, Trophy, User, Plus, ChevronRight, ChevronLeft,
  Check, X, Search, MapPin, Calendar, Users, Zap, Star, TrendingUp,
  Award, Flag, Target, Activity, Heart, Globe, Flame, Crown, ArrowRight,
  Play, Share2, Bell, AlertCircle, CheckCircle, Minus, Menu, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* ─── i18n ───────────────────────────────────────────────────── */
const T = {
  ca:{
    nav_home:"Inici",nav_ranking:"Rànquing",nav_game:"Partida",nav_tournaments:"Tornejos",nav_shop:"Botiga",nav_profile:"Perfil",
    hero_title:"PITCH&CLUBS",hero_sub:"L'Strava del golf.",hero_desc:"Registra partides, puja al rànquing i suporta el teu club.",hero_live:"Beta oberta · {n} jugadors",
    cta_new_game:"Nova Partida",cta_join:"Uneix-te",cta_join_free:"Uneix-te gratis →",cta_create_account:"Crea un compte →",
    cta_register_now:"Registrar ara →",cta_ready:"READY TO PLAY?",cta_ready_sub:"Registra la primera partida sense necessitat de fer login.",cta_ready_btn:"Registra una partida",cta_stats:"Les meves estadístiques →",
    sec_activity:"Activitat",sec_last_games:"ÚLTIMES PARTIDES",sec_ranking:"Classificació",sec_top_ranking:"TOP RÀNQUING",
    sec_how:"Com funciona",sec_how_title:"3 PASSOS. SIMPLE.",sec_levels:"Sistema de nivells",sec_levels_title:"PUJA. GUANYA.",sec_points:"Sistema de punts",
    sec_tournaments:"Competicions",sec_next_tournaments:"PROPERS TORNEJOS",sec_community:"Comunitat",sec_community_title:"LA GENT JUGA AVUI",
    sec_courses:"Cobertura",sec_courses_title:"61 CAMPS A ESPANYA",no_games:"Sense partides",no_games_sub:"Registra la primera partida sense necessitat de fer login",
    step1_t:"Registra la partida",step1_d:"Sense login. Tria entre 61 camps reals i registra cada cop forat a forat.",
    step2_t:"Puja al rànquing",step2_d:"Caddie → Player → Pro → Master. Cada partida i torneig suma punts P&C.",
    step3_t:"Suporta el teu club",step3_d:"10% de cada compra al kit oficial va directament al teu club. Automàtic.",
    stat_games:"Partides",stat_best:"Millor",stat_holes:"Forats",stat_hcp:"HCP",stat_streak:"Ratxa",
    pts_completion:"Partida completada",pts_tournament_win:"Victòria torneig",pts_inactivity:"Inactivitat",
    tier_caddie_desc:"Aprèn les bases",tier_player_desc:"Juga amb consistència",tier_pro_desc:"Nivell competitiu real",tier_master_desc:"Elit de l'elit P&C",
    tier_max:"🔥 Nivell màxim — Master!",pts_to:"pts per arribar a",
    setup_title:"NOVA PARTIDA",setup_sub:"Configura la teva sessió",setup_guest_sub:"Mode visitant · sense login",
    guest_banner_title:"Mode visitant actiu",guest_banner_desc:"Juga ara sense compte. {link} per guardar l'historial i acumular punts.",guest_create_link:"Crea un compte",
    label_date:"Data",label_course:"Camp",course_hint:"61 camps disponibles",course_placeholder:"Busca per nom, localitat o província...",
    course_not_found:"No trobat — configura'l manualment ↓",custom_course:"Camp personalitzat",custom_name:"Nom del camp",custom_name_ph:"Ex: Club de Golf de Lleida",
    custom_holes:"Forats",custom_par:"Par total",confirm_course:"Confirmar camp",label_mode:"Modalitat",label_players:"Jugadors",
    add_player:"Afegir",player_you:"Tu",player_name_ph:"Nom del jugador",live_share:"Retransmissió en directe",live_share_sub:"Els teus seguidors podran veure la partida",
    start_game:"Som-hi! →",guest_no_save:"Mode visitant · La partida no es guardarà automàticament",
    holes_label:"forats",prov_pts:"pts prov.",shots_label:"Cops",
    legend_eagle:"Eagle+",legend_birdie:"Birdie",legend_par:"Par",legend_bogey:"Bogey",legend_bad:"Pena",
    hole_next:"Forat {n} →",finish:"Finalitzar ✓",save_hint:"Mode visitant · {link} per guardar",scorecard_title:"Targeta de puntuació",total_row:"TOT",
    game_done:"PARTIDA ACABADA",level_up:"LEVEL UP! →",classification:"Classificació",score_label:"Score",pts_earned:"Punts guanyats",total_accum:"Total acumulat",
    save_game_q:"Vols guardar aquesta partida?",save_game_desc:"Crea un compte gratuït per guardar l'historial i acumular {pts} punts al rànquing.",save_game_btn:"Crea un compte — és gratis →",
    hole_summary:"Resum forat a forat",new_game:"Nova partida",back_setup:"Setup",back_home:"Tornar a l'inici",back:"← Tornar",
    ranking_title:"RÀNQUING P&C",ranking_global:"Global",ranking_week:"Setmana",ranking_course:"Per camp",
    ranking_week_note:"Rànquing de la setmana actual · es reinicia cada dilluns",ranking_course_note:"Millors scores per camp · tots els temps",
    ranking_join:"Crea un compte per aparèixer al rànquing",ranking_join_btn:"Uneix-te →",
    col_player:"Jugador",col_best:"Millor",col_pts:"Pts",pts_week:"Pts 7d",best_score:"millor score",games_reg:"partides registrades",leader:"Líder",avg_label:"avg",
    tourn_title:"TORNEJOS P&C",tourn_sub:"Competicions 2025",tourn_open:"● Obert",tourn_soon:"Aviat",
    tourn_full:"Complet",tourn_last_spots:"⚡ Últims {n} llocs!",tourn_spots_left:"{n} llocs disponibles",
    tourn_inscribe:"Inscriure\'m →",tourn_join_first:"Uneix-te per inscriure\'t →",tourn_notify:"Avisa\'m quan s\'obri →",tourn_no_cat:"Aviat hi haurà tornejos d\'aquesta categoria",
    cat_all:"Tots",cat_open:"Oberts",cat_club:"De club",cat_master:"Master",cat_social:"Social",
    shop_title:"BOTIGA P&C",shop_sub:"Kits & Gear",shop_soon_title:"AVIAT DISPONIBLE",
    shop_soon_desc:"La botiga oficial de P&C obrirà aviat. Kits de clubs, gear exclusiu P&C i molt més. El 10% de cada compra va al teu club.",
    shop_soon_btn_user:"Avisa'm quan obri →",shop_soon_btn_guest:"Crea un compte per ser el primer →",shop_preview:"Avantvisualització",
    shop_club_title:"El teu club cobra el 10%",shop_club_desc:"Cada compra al kit oficial del teu club li aporta un 10% directament. Suport real, no màrqueting.",
    profile_title:"Perfil",profile_score_trend:"Evolució de scores — últims 10 rounds",profile_hcp_trend:"Evolució Handicap",
    profile_hcp_current:"HCP actual: {v} · millora de {d} des de novembre",profile_dist:"Distribució de resultats",profile_best_courses:"Millors camps",
    profile_played:"partides",profile_tournaments:"Tornejos",profile_pts_month:"Pts aquest mes",profile_win:"1 victòria",profile_no_win:"Cap victòria",
    auth_register_title:"UNEIX-TE A P&C",auth_login_title:"ENTRAR",auth_register_sub:"Gratuït · Sense targeta de crèdit",auth_login_sub:"Benvingut de nou",
    auth_name:"Nom o àlies",auth_name_ph:"Marc Puig",auth_club:"Club (opcional)",auth_club_ph:"Pink Beaks, Canal Olímpic...",auth_email:"Email",
    auth_register_btn:"Crear compte gratuït →",auth_login_btn:"Entrar →",auth_to_login:"Ja tens compte?",auth_to_login_link:"Entra",
    auth_to_register:"No tens compte?",auth_to_register_link:"Crea'n un",err_name:"Escriu el teu nom o àlies",err_email:"Email invàlid",
    exit:"Sortir",courses_missing:"No trobes el teu camp? Afegeix-lo manualment o contacta'ns.",courses_add:"Afegir →",
    ticker:["Pitch & Clubs","61 camps","Registra · Puja · Domina","Kits Oficials","Less Elitist. More Real","Beta oberta","Tornejos 2025"],
  },
  es:{
    nav_home:"Inicio",nav_ranking:"Ranking",nav_game:"Partida",nav_tournaments:"Torneos",nav_shop:"Tienda",nav_profile:"Perfil",
    hero_title:"PITCH&CLUBS",hero_sub:"El Strava del golf.",hero_desc:"Registra partidas, sube en el ranking y apoya a tu club.",hero_live:"Beta abierta · {n} jugadores",
    cta_new_game:"Nueva Partida",cta_join:"Únete",cta_join_free:"Únete gratis →",cta_create_account:"Crea una cuenta — guarda tus stats →",
    cta_register_now:"Registrar ahora →",cta_ready:"¿LISTO PARA JUGAR?",cta_ready_sub:"Registra la primera partida sin necesidad de login.",cta_ready_btn:"Registra una partida",cta_stats:"Mis estadísticas →",
    sec_activity:"Actividad",sec_last_games:"ÚLTIMAS PARTIDAS",sec_ranking:"Clasificación",sec_top_ranking:"TOP RANKING",
    sec_how:"Cómo funciona",sec_how_title:"3 PASOS. SIMPLE.",sec_levels:"Sistema de niveles",sec_levels_title:"SUBE. GANA.",sec_points:"Sistema de puntos",
    sec_tournaments:"Competiciones",sec_next_tournaments:"PRÓXIMOS TORNEOS",sec_community:"Comunidad",sec_community_title:"LA GENTE JUEGA HOY",
    sec_courses:"Cobertura",sec_courses_title:"61 CAMPOS EN ESPAÑA",no_games:"Sin partidas",no_games_sub:"Registra la primera partida sin necesidad de login",
    step1_t:"Registra la partida",step1_d:"Sin login. Elige entre 61 campos reales y registra cada golpe hoyo a hoyo.",
    step2_t:"Sube en el ranking",step2_d:"Caddie → Player → Pro → Master. Cada partida y torneo suma puntos P&C.",
    step3_t:"Apoya a tu club",step3_d:"El 10% de cada compra en el kit oficial va directamente a tu club. Automático.",
    stat_games:"Partidas",stat_best:"Mejor",stat_holes:"Hoyos",stat_hcp:"HCP",stat_streak:"Racha",
    pts_completion:"Partida completada",pts_tournament_win:"Victoria torneo",pts_inactivity:"Inactividad",
    tier_caddie_desc:"Aprende las bases",tier_player_desc:"Juega con consistencia",tier_pro_desc:"Nivel competitivo real",tier_master_desc:"Élite de la élite P&C",
    tier_max:"🔥 ¡Nivel máximo — Master!",pts_to:"pts para llegar a",
    setup_title:"NUEVA PARTIDA",setup_sub:"Configura tu sesión",setup_guest_sub:"Modo visitante · sin login",
    guest_banner_title:"Modo visitante activo",guest_banner_desc:"Juega ahora sin cuenta. {link} para guardar el historial y acumular puntos.",guest_create_link:"Crea una cuenta",
    label_date:"Fecha",label_course:"Campo",course_hint:"61 campos disponibles",course_placeholder:"Busca por nombre, localidad o provincia...",
    course_not_found:"No encontrado — configúralo manualmente ↓",custom_course:"Campo personalizado",custom_name:"Nombre del campo",custom_name_ph:"Ej: Club de Golf de Madrid",
    custom_holes:"Hoyos",custom_par:"Par total",confirm_course:"Confirmar campo",label_mode:"Modalidad",label_players:"Jugadores",
    add_player:"Añadir",player_you:"Tú",player_name_ph:"Nombre del jugador",live_share:"Retransmisión en directo",live_share_sub:"Tus seguidores podrán ver la partida",
    start_game:"¡Vamos! →",guest_no_save:"Modo visitante · La partida no se guardará automáticamente",
    holes_label:"hoyos",prov_pts:"pts prov.",shots_label:"Golpes",
    legend_eagle:"Eagle+",legend_birdie:"Birdie",legend_par:"Par",legend_bogey:"Bogey",legend_bad:"Penal",
    hole_next:"Hoyo {n} →",finish:"Finalizar ✓",save_hint:"Modo visitante · {link} para guardar",scorecard_title:"Tarjeta de puntuación",total_row:"TOT",
    game_done:"PARTIDA TERMINADA",level_up:"LEVEL UP! →",classification:"Clasificación",score_label:"Score",pts_earned:"Puntos ganados",total_accum:"Total acumulado",
    save_game_q:"¿Quieres guardar esta partida?",save_game_desc:"Crea una cuenta gratuita para guardar el historial y acumular {pts} puntos en el ranking.",save_game_btn:"Crea una cuenta — es gratis →",
    hole_summary:"Resumen hoyo a hoyo",new_game:"Nueva partida",back_setup:"Setup",back_home:"Volver al inicio",back:"← Volver",
    ranking_title:"RANKING P&C",ranking_global:"Global",ranking_week:"Semana",ranking_course:"Por campo",
    ranking_week_note:"Ranking de la semana actual · se reinicia cada lunes",ranking_course_note:"Mejores scores por campo · todos los tiempos",
    ranking_join:"Crea una cuenta para aparecer en el ranking",ranking_join_btn:"Únete →",
    col_player:"Jugador",col_best:"Mejor",col_pts:"Pts",pts_week:"Pts 7d",best_score:"mejor score",games_reg:"partidas registradas",leader:"Líder",avg_label:"media",
    tourn_title:"TORNEOS P&C",tourn_sub:"Competiciones 2025",tourn_open:"● Abierto",tourn_soon:"Próximo",
    tourn_full:"Completo",tourn_last_spots:"⚡ ¡Últimas {n} plazas!",tourn_spots_left:"{n} plazas disponibles",
    tourn_inscribe:"Inscribirme →",tourn_join_first:"Únete para inscribirte →",tourn_notify:"Avísame cuando abra →",tourn_no_cat:"Próximamente habrá torneos de esta categoría",
    cat_all:"Todos",cat_open:"Abiertos",cat_club:"De club",cat_master:"Master",cat_social:"Social",
    shop_title:"TIENDA P&C",shop_sub:"Kits & Gear",shop_soon_title:"PRÓXIMAMENTE",
    shop_soon_desc:"La tienda oficial de P&C abrirá pronto. Kits de clubs, gear exclusivo P&C y mucho más. El 10% de cada compra va a tu club.",
    shop_soon_btn_user:"Avísame cuando abra →",shop_soon_btn_guest:"Crea una cuenta para ser el primero →",shop_preview:"Previsualización",
    shop_club_title:"Tu club cobra el 10%",shop_club_desc:"Cada compra en el kit oficial de tu club le aporta un 10% directamente. Apoyo real, no marketing.",
    profile_title:"Perfil",profile_score_trend:"Evolución de scores — últimos 10 rounds",profile_hcp_trend:"Evolución Hándicap",
    profile_hcp_current:"HCP actual: {v} · mejora de {d} desde noviembre",profile_dist:"Distribución de resultados",profile_best_courses:"Mejores campos",
    profile_played:"partidas",profile_tournaments:"Torneos",profile_pts_month:"Pts este mes",profile_win:"1 victoria",profile_no_win:"Sin victorias",
    auth_register_title:"ÚNETE A P&C",auth_login_title:"ENTRAR",auth_register_sub:"Gratis · Sin tarjeta de crédito",auth_login_sub:"Bienvenido de nuevo",
    auth_name:"Nombre o alias",auth_name_ph:"Marc Puig",auth_club:"Club (opcional)",auth_club_ph:"Pink Beaks, Canal Olímpic...",auth_email:"Email",
    auth_register_btn:"Crear cuenta gratis →",auth_login_btn:"Entrar →",auth_to_login:"¿Ya tienes cuenta?",auth_to_login_link:"Entra",
    auth_to_register:"¿No tienes cuenta?",auth_to_register_link:"Créate una",err_name:"Escribe tu nombre o alias",err_email:"Email inválido",
    exit:"Salir",courses_missing:"¿No encuentras tu campo? Añádelo manualmente o contáctanos.",courses_add:"Añadir →",
    ticker:["Pitch & Clubs","61 campos","Registra · Sube · Domina","Kits Oficiales","Less Elitist. More Real","Beta abierta","Torneos 2025"],
  },
  en:{
    nav_home:"Home",nav_ranking:"Ranking",nav_game:"Round",nav_tournaments:"Tournaments",nav_shop:"Shop",nav_profile:"Profile",
    hero_title:"PITCH&CLUBS",hero_sub:"The Strava of golf.",hero_desc:"Track rounds, climb the leaderboard and support your club.",hero_live:"Open beta · {n} players",
    cta_new_game:"New Round",cta_join:"Join",cta_join_free:"Join for free →",cta_create_account:"Create an account — save your stats →",
    cta_register_now:"Register now →",cta_ready:"READY TO PLAY?",cta_ready_sub:"Track your first round without signing up.",cta_ready_btn:"Track a round",cta_stats:"My statistics →",
    sec_activity:"Activity",sec_last_games:"RECENT ROUNDS",sec_ranking:"Leaderboard",sec_top_ranking:"TOP RANKING",
    sec_how:"How it works",sec_how_title:"3 STEPS. SIMPLE.",sec_levels:"Level system",sec_levels_title:"CLIMB. WIN.",sec_points:"Points system",
    sec_tournaments:"Competitions",sec_next_tournaments:"UPCOMING TOURNAMENTS",sec_community:"Community",sec_community_title:"PEOPLE PLAYING TODAY",
    sec_courses:"Coverage",sec_courses_title:"61 COURSES IN SPAIN",no_games:"No rounds yet",no_games_sub:"Track your first round without signing up",
    step1_t:"Track a round",step1_d:"No login needed. Pick from 61 real courses and log every shot hole by hole.",
    step2_t:"Climb the ranking",step2_d:"Caddie → Player → Pro → Master. Every round and tournament earns P&C points.",
    step3_t:"Support your club",step3_d:"10% of every official kit purchase goes directly to your club. Automatic.",
    stat_games:"Rounds",stat_best:"Best",stat_holes:"Holes",stat_hcp:"HCP",stat_streak:"Streak",
    pts_completion:"Round completed",pts_tournament_win:"Tournament win",pts_inactivity:"Inactivity",
    tier_caddie_desc:"Learn the basics",tier_player_desc:"Play consistently",tier_pro_desc:"Real competitive level",tier_master_desc:"P&C elite",
    tier_max:"🔥 Max level — Master!",pts_to:"pts to reach",
    setup_title:"NEW ROUND",setup_sub:"Set up your session",setup_guest_sub:"Guest mode · no login",
    guest_banner_title:"Guest mode active",guest_banner_desc:"Play now without an account. {link} to save history and earn points.",guest_create_link:"Create an account",
    label_date:"Date",label_course:"Course",course_hint:"61 courses available",course_placeholder:"Search by name, city or province...",
    course_not_found:"Not found — set it up manually ↓",custom_course:"Custom course",custom_name:"Course name",custom_name_ph:"e.g. My Local Golf Club",
    custom_holes:"Holes",custom_par:"Total par",confirm_course:"Confirm course",label_mode:"Format",label_players:"Players",
    add_player:"Add",player_you:"You",player_name_ph:"Player name",live_share:"Live broadcast",live_share_sub:"Your followers can watch the round",
    start_game:"Let's go! →",guest_no_save:"Guest mode · Round won't be saved automatically",
    holes_label:"holes",prov_pts:"pts est.",shots_label:"Shots",
    legend_eagle:"Eagle+",legend_birdie:"Birdie",legend_par:"Par",legend_bogey:"Bogey",legend_bad:"Penalty",
    hole_next:"Hole {n} →",finish:"Finish ✓",save_hint:"Guest mode · {link} to save",scorecard_title:"Scorecard",total_row:"TOT",
    game_done:"ROUND COMPLETE",level_up:"LEVEL UP! →",classification:"Leaderboard",score_label:"Score",pts_earned:"Points earned",total_accum:"Total accumulated",
    save_game_q:"Want to save this round?",save_game_desc:"Create a free account to save your history and earn {pts} points on the leaderboard.",save_game_btn:"Create an account — it's free →",
    hole_summary:"Hole-by-hole summary",new_game:"New round",back_setup:"Setup",back_home:"Back to home",back:"← Back",
    ranking_title:"P&C RANKING",ranking_global:"Global",ranking_week:"This week",ranking_course:"By course",
    ranking_week_note:"Current week ranking · resets every Monday",ranking_course_note:"Best scores by course · all time",
    ranking_join:"Create an account to appear on the ranking",ranking_join_btn:"Join →",
    col_player:"Player",col_best:"Best",col_pts:"Pts",pts_week:"Pts 7d",best_score:"best score",games_reg:"rounds logged",leader:"Leader",avg_label:"avg",
    tourn_title:"P&C TOURNAMENTS",tourn_sub:"Competitions 2025",tourn_open:"● Open",tourn_soon:"Coming soon",
    tourn_full:"Full",tourn_last_spots:"⚡ Last {n} spots!",tourn_spots_left:"{n} spots left",
    tourn_inscribe:"Sign me up →",tourn_join_first:"Join to sign up →",tourn_notify:"Notify me when open →",tourn_no_cat:"Tournaments in this category coming soon",
    cat_all:"All",cat_open:"Open",cat_club:"Club",cat_master:"Master",cat_social:"Social",
    shop_title:"P&C SHOP",shop_sub:"Kits & Gear",shop_soon_title:"COMING SOON",
    shop_soon_desc:"The official P&C shop is opening soon. Club kits, exclusive P&C gear and more. 10% of every purchase goes to your club.",
    shop_soon_btn_user:"Notify me when open →",shop_soon_btn_guest:"Create an account to be first →",shop_preview:"Preview",
    shop_club_title:"Your club gets 10%",shop_club_desc:"Every purchase from your club's official kit gives them 10% directly. Real support, not marketing.",
    profile_title:"Profile",profile_score_trend:"Score evolution — last 10 rounds",profile_hcp_trend:"Handicap evolution",
    profile_hcp_current:"Current HCP: {v} · improved {d} since November",profile_dist:"Score distribution",profile_best_courses:"Best courses",
    profile_played:"rounds",profile_tournaments:"Tournaments",profile_pts_month:"Pts this month",profile_win:"1 win",profile_no_win:"No wins",
    auth_register_title:"JOIN P&C",auth_login_title:"SIGN IN",auth_register_sub:"Free · No credit card",auth_login_sub:"Welcome back",
    auth_name:"Name or alias",auth_name_ph:"Marc Puig",auth_club:"Club (optional)",auth_club_ph:"Pink Beaks, Canal Olímpic...",auth_email:"Email",
    auth_register_btn:"Create free account →",auth_login_btn:"Sign in →",auth_to_login:"Already have an account?",auth_to_login_link:"Sign in",
    auth_to_register:"No account?",auth_to_register_link:"Create one",err_name:"Enter your name or alias",err_email:"Invalid email",
    exit:"Exit",courses_missing:"Can't find your course? Add it manually or contact us.",courses_add:"Add →",
    ticker:["Pitch & Clubs","61 courses","Track · Climb · Dominate","Official Kits","Less Elitist. More Real","Open beta","Tournaments 2025"],
  },
};
const t = (lang,key,vars={}) => { let s=T[lang]?.[key]??T.ca[key]??key; Object.entries(vars).forEach(([k,v])=>{s=s.replace(`{${k}}`,v);}); return s; };

/* ─── TIER / GAME DATA ───────────────────────────────────────── */
const TIERS = [
  { id:"caddie", name:"Caddie", emoji:"🎒", color:"#34D399", bg:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.3)",  min:0,    max:699   },
  { id:"player", name:"Player", emoji:"⛳", color:"#60A5FA", bg:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.3)",  min:700,  max:1799  },
  { id:"pro",    name:"Pro",    emoji:"🏆", color:"#A78BFA", bg:"rgba(167,139,250,.12)",border:"rgba(167,139,250,.3)", min:1800, max:3999  },
  { id:"master", name:"Master", emoji:"👑", color:"#CAFF4D", bg:"rgba(202,255,77,.12)", border:"rgba(202,255,77,.3)",  min:4000, max:99999 },
];
const getTier = (pts) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
const getTierPct = (pts) => {
  const t = getTier(pts);
  if (t.max === 99999) return 100;
  return Math.round(((pts - t.min) / (t.max - t.min)) * 100);
};

/* ─── PUNTUACIÓ ──────────────────────────────────────────────── */
const calcPCPoints = (score, par, hcp) => {
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

const scoreInfo = (s, p) => {
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
html{height:100%;background:#0A0A0B;width:100%;overflow-x:hidden;}
body{
  min-height:100%;
  width:100%;
  max-width:100vw;
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
  width:100%;
  max-width:430px;
  margin:0 auto;
  position:relative;
  overflow-x:hidden;
}

/* ── HEADER */
.app-header{
  position:sticky;top:0;z-index:100;
  background:rgba(17,18,20,.94);
  border-bottom:1px solid #1A1B1E;
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:flex;align-items:center;justify-content:space-between;
  padding:env(safe-area-inset-top) 18px 0;
  height:calc(52px + env(safe-area-inset-top));
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
.page-scroll{padding:16px max(16px,env(safe-area-inset-right)) calc(80px + env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));overflow-y:auto;overflow-x:hidden;}

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
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:400;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s;}
.modal-sheet{background:#1A1B1E;border-radius:16px 16px 0 0;padding:20px 18px calc(32px + env(safe-area-inset-bottom));width:100%;max-width:430px;border-top:1px solid #2A2B30;animation:slideUp .22s ease;max-height:85vh;overflow-y:auto;}
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
@keyframes pulse-border{0%,100%{border-color:rgba(202,255,77,.35)}50%{border-color:rgba(202,255,77,.9)}}
`;

/* ─── HELPERS ────────────────────────────────────────────────── */

/* ─── TIER BADGE ─────────────────────────────────────────────── */
function TierBadge({ tierId, size }) {
  const tier = TIERS.find(t=>t.id===tierId)||TIERS[0];
  const sz = size==="lg" ? {fontSize:12,padding:"4px 12px"} : {fontSize:9,padding:"3px 9px"};
  return (
    <span style={{...sz,fontFamily:"'Bebas Neue'",letterSpacing:".1em",borderRadius:4,border:`1px solid ${tier.border}`,color:tier.color,background:tier.bg,display:"inline-block",lineHeight:1.4}}>
      {tier.emoji} {tier.name}
    </span>
  );
}

/* ─── TICKER ─────────────────────────────────────────────────── */
function Ticker({ lang }) {
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

/* ─── BOTTOM NAV ─────────────────────────────────────────────── */
function BottomNav({ screen, setScreen, lang }) {
  const isGame = screen==="game-setup"||screen==="scorecard"||screen==="summary";
  const lbl = (k) => t(lang,k);
  return (
    <nav className="bottom-nav">
      <button className={`nav-item${screen==="home"?" active":""}`} onClick={()=>setScreen("home")}>
        <Home size={21} strokeWidth={screen==="home"?2.5:1.8}/><span>{lbl("nav_home")}</span>
      </button>
      <button className={`nav-item${screen==="ranking"?" active":""}`} onClick={()=>setScreen("ranking")}>
        <BarChart2 size={21} strokeWidth={screen==="ranking"?2.5:1.8}/><span>{lbl("nav_ranking")}</span>
      </button>
      <button onClick={()=>setScreen("game-setup")}
        style={{flex:"0 0 56px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
          border:"none",background:"transparent",cursor:"pointer",padding:"4px 0",gap:3,paddingTop:2}}>
        <div style={{width:48,height:48,background:"#CAFF4D",borderRadius:"50%",display:"flex",alignItems:"center",
          justifyContent:"center",marginTop:-18,flexShrink:0,
          boxShadow:"0 0 0 3px #111214, 0 6px 20px rgba(202,255,77,.45)"}}>
          <Flag size={20} strokeWidth={2.5} color="#0A0A0B"/>
        </div>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",
          color:isGame?"#CAFF4D":"#555761"}}>{lbl("nav_game")}</span>
      </button>
      <button className={`nav-item${screen==="tournaments"?" active":""}`} onClick={()=>setScreen("tournaments")}>
        <Trophy size={21} strokeWidth={screen==="tournaments"?2.5:1.8}/><span>{lbl("nav_tournaments")}</span>
      </button>
      <button className={`nav-item${screen==="shop"?" active":""}`} onClick={()=>setScreen("shop")}>
        <ShoppingBag size={21} strokeWidth={screen==="shop"?2.5:1.8}/><span>{lbl("nav_shop")}</span>
      </button>
    </nav>
  );
}

/* ─── APP HEADER ─────────────────────────────────────────────── */
const LANGS = [{id:"ca",label:"CAT"},{id:"es",label:"ESP"},{id:"en",label:"ENG"}];

function AppHeader({ screen, setScreen, user, openAuth, onSignOut, userPts, lang, setLang }) {
  const [showLang, setShowLang] = useState(false);
  const tl = (k) => t(lang, k);
  const tier = getTier(userPts);
  const isGameFlow = screen==="game-setup"||screen==="scorecard"||screen==="summary";
  return (
    <header className="app-header">
      <div className="header-logo" onClick={()=>setScreen("home")}>P<em>&</em>C</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {/* Language selector */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLang(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:4,background:"#1A1B1E",border:"1px solid #222327",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:10,fontWeight:700,color:"#787C8A",letterSpacing:".08em"}}>
            <Globe size={12} strokeWidth={2}/>{LANGS.find(l=>l.id===lang)?.label}
          </button>
          {showLang && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#1A1B1E",border:"1px solid #222327",borderRadius:8,overflow:"hidden",zIndex:200,minWidth:80}}>
              {LANGS.map(l=>(
                <button key={l.id} onClick={()=>{setLang(l.id);setShowLang(false);}}
                  style={{display:"block",width:"100%",padding:"9px 14px",fontSize:11,fontWeight:700,color:lang===l.id?"#CAFF4D":"#787C8A",background:lang===l.id?"rgba(202,255,77,.07)":"transparent",border:"none",cursor:"pointer",textAlign:"left",letterSpacing:".06em"}}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isGameFlow && (
          <button className="btn btn-sm btn-ghost" style={{width:"auto",display:"flex",alignItems:"center",gap:5}} onClick={()=>{
            localStorage.removeItem('pc_gameData');
            localStorage.removeItem('pc_scores');
            localStorage.removeItem('pc_curHole');
            localStorage.removeItem('pc_screen');
            setScreen("home");
          }}>
            <X size={14}/>{tl("exit")}
          </button>
        )}
        {user && !isGameFlow && (
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",padding:"4px 8px",borderRadius:8}} onClick={()=>setScreen("profile")}>
              <div style={{width:30,height:30,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  : user.name.split(" ").map(w=>w[0]).slice(0,2).join("")
                }
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,fontWeight:700,color:tier.color,letterSpacing:".06em",textTransform:"uppercase",lineHeight:1}}>{tier.emoji} {tier.name}</div>
                <div style={{fontSize:9,color:"#555761",lineHeight:1.4}}>{userPts} pts</div>
              </div>
            </div>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",color:"#555761",padding:"4px",display:"flex",alignItems:"center"}} title="Sign out">
              <LogOut size={14}/>
            </button>
          </div>
        )}
        {!user && !isGameFlow && (
          <button className="btn btn-sm" style={{background:"#CAFF4D",color:"#0A0A0B",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:700,textTransform:"uppercase"}} onClick={openAuth}>
            {tl("cta_join")}
          </button>
        )}
      </div>
    </header>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────── */
function SectionHeader({ sub, title, limeWord }) {
  return (
    <div style={{marginBottom:14,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{sub}</div>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,32px)",letterSpacing:".04em",lineHeight:1}}>
        {title}{limeWord&&<> <span style={{color:"#CAFF4D"}}>{limeWord}</span></>}
      </div>
    </div>
  );
}

/* ─── MOCK DATA ──────────────────────────────────────────────── */
const mapGameToFeedItem = (g) => {
  const me = g.players?.find(p => p.isMe);
  const diff = me?.diff ?? 0;
  const label = diff <= -3 ? "Eagle+" : diff === -2 ? "Eagle" : diff === -1 ? "Birdie" : diff === 0 ? "Par" : diff === 1 ? "Bogey" : `+${diff}`;
  const lc = diff < -1 ? "#FBBF24" : diff === -1 ? "#60A5FA" : diff === 0 ? "#CAFF4D" : "#9CA3AF";
  return { id: g.id, user: me?.name || "?", course: g.course, diff, label, lc, points: me?.points ?? 0, created_at: g.created_at };
};

const timeAgo = (isoStr) => {
  const mins = Math.floor((Date.now() - new Date(isoStr)) / 60000);
  if (mins < 1) return "ara";
  if (mins < 60) return `fa ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `fa ${hrs}h`;
  return `fa ${Math.floor(hrs / 24)}d`;
};

const UGC_FEED = [
  {id:1,user:"marc_pitchking",club:"Pink Beaks",label:"Eagle",course:"Vallromanes",hole:12,time:"fa 2h",likes:47,img:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=75",caption:"Millor ronda de la temporada!",lc:"#FBBF24"},
  {id:2,user:"sonia_ros",club:"Canal Olímpic",label:"Birdie",course:"HCP1",hole:7,time:"fa 3h",likes:23,img:"https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=75",caption:"Primera ronda a HCP1",lc:"#60A5FA"},
  {id:3,user:"pink_beaks_cc",club:"Pink Beaks",label:"Par",course:"Áccura Teià",hole:15,time:"fa 5h",likes:31,img:"https://images.unsplash.com/photo-1600167957935-f21a51b0b1c2?w=600&q=75",caption:"Dia de vent perfecte",lc:"#CAFF4D"},
  {id:4,user:"jordi_mas",club:"Áccura Teià",label:"Eagle",course:"Vallromanes",hole:3,time:"fa 6h",likes:58,img:"https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=75",caption:"Tres sous seguits",lc:"#FBBF24"},
];

// ── TOURNAMENTS: fallback data (used if Google Sheets API unavailable) ──
// To update live: edit the Google Sheet linked in TournamentsScreen
const TOURNAMENTS_FALLBACK = [
  {id:1,name:"P&C Spring Open",dateS:"15/06",course:"Vallromanes",location:"Vilanova del Vallès",format:"Strokeplay 18H",minTier:"player",spots:24,left:8,prize:"Kit P&C + 200 pts",status:"open",fee:"€15",category:"open"},
  {id:2,name:"Copa Canal Olímpic",dateS:"22/06",course:"Canal Olímpic",location:"Castelldefels",format:"Matchplay 9H",minTier:"caddie",spots:16,left:3,prize:"150 pts + greenfees",status:"open",fee:"€10",category:"club"},
  {id:3,name:"Master Series — R1",dateS:"05/07",course:"HCP1",location:"Sant Vicenç",format:"Strokeplay 18H",minTier:"master",spots:12,left:12,prize:"300 pts + trofeu",status:"soon",fee:"€25",category:"master"},
  {id:4,name:"Nit de Sant Joan",dateS:"23/06",course:"P&P Badalona",location:"Badalona",format:"Stableford 9H",minTier:"caddie",spots:32,left:19,prize:"Festa + 80 pts",status:"open",fee:"Gratis",category:"social"},
];
// ── Keep alias for HomeScreen previews ──
const TOURNAMENTS_DATA = TOURNAMENTS_FALLBACK;

// ── Google Sheets config ──────────────────────────────────────
// 1. Crea un Google Sheet públic (veure instruccions a README)
// 2. Publica'l com a CSV: Arxiu → Compartir → Publicar al web → CSV
// 3. Copia la URL i pega-la aquí:
const SHEETS_CSV_URL = ""; // <-- posa aquí la URL del teu Google Sheet publicat

// Converteix una fila CSV a objecte torneig
function parseSheetRow(row) {
  const [id,name,dateS,course,location,format,minTier,spots,left,prize,status,fee,category] = row;
  if (!name || !name.trim()) return null;
  return {
    id: parseInt(id)||0, name:name.trim(), dateS:dateS.trim(),
    course:course.trim(), location:location.trim(), format:format.trim(),
    minTier:(minTier||'caddie').trim().toLowerCase(),
    spots:parseInt(spots)||0, left:parseInt(left)||0,
    prize:prize.trim(), status:(status||'soon').trim().toLowerCase(),
    fee:fee.trim(), category:(category||'open').trim().toLowerCase(),
  };
}

async function fetchTournamentsFromSheet() {
  if (!SHEETS_CSV_URL) return null;
  try {
    const res  = await fetch(SHEETS_CSV_URL);
    const text = await res.text();
    const rows = text.trim().split('\n').slice(1); // skip header row
    const parsed = rows.map(r => {
      // Basic CSV parse (handles simple cases; no embedded commas in fields)
      const cols = r.split(',').map(c => c.replace(/^"|"$/g,'').trim());
      return parseSheetRow(cols);
    }).filter(Boolean);
    return parsed.length ? parsed : null;
  } catch(e) {
    console.warn('P&C: Could not load tournaments from Google Sheet:', e.message);
    return null;
  }
}

const PRODUCTS_DATA = [
  {id:1,name:"Kit Oficial Pink Beaks 24/25",club:"Pink Beaks",price:"€49",emoji:"👕",tag:"Kit Oficial"},
  {id:2,name:"Gorra Club Canal Olímpic",club:"Canal Olímpic",price:"€32",emoji:"🧢",tag:"Kit Oficial"},
  {id:3,name:"Polo Pro HCP1",club:"HCP1",price:"€65",emoji:"👕",tag:"Kit Oficial"},
  {id:4,name:"Pack Iniciació P&P",club:"P&C Gear",price:"€89",emoji:"🎒",tag:"Gear"},
  {id:5,name:'Samarreta "Less Elitist"',club:"P&C Originals",price:"€35",emoji:"🖤",tag:"Original"},
  {id:6,name:"Polo Vallromanes Ed.",club:"Vallromanes",price:"€44",emoji:"👕",tag:"Kit Oficial"},
];

const PLAYER_PROFILE = {
  handle:"marc_pitchking",name:"Marc Puig",club:"Pink Beaks",
  pts:2840,hcp:3.2,games:42,color:"#CAFF4D",streak:7,tourWon:1,
  trend:[{date:"01/03",s:-1},{date:"08/03",s:-2},{date:"15/03",s:0},{date:"22/03",s:-2},{date:"29/03",s:-3},{date:"05/04",s:-1},{date:"12/04",s:-4},{date:"19/04",s:-2},{date:"26/04",s:-3},{date:"03/05",s:-4}],
  hcpHist:[{m:"Nov",v:6.8},{m:"Des",v:5.9},{m:"Gen",v:5.1},{m:"Feb",v:4.4},{m:"Mar",v:3.8},{m:"Abr",v:3.2}],
  bestCourses:[{name:"Vallromanes",best:-4,avg:-2.1,played:18,f:"🏆"},{name:"HCP1",best:-2,avg:-1.4,played:12,f:"🥈"},{name:"Áccura Teià",best:-1,avg:-0.8,played:8,f:"🥉"},{name:"Canal Olímpic",best:-1,avg:-0.5,played:4,f:""}],
  dist:{eagle:3,birdie:48,par:127,bogey:62,double:14,triple:5},
};

const LEADERBOARD_WEEK = [
  {rank:1,name:"Sònia Ros",avatar:"SR",color:"#60A5FA",pts:180,best:-2,club:"Canal Olímpic"},
  {rank:2,name:"Jordi Mas",avatar:"JM",color:"#A78BFA",pts:144,best:-1,club:"Áccura Teià"},
  {rank:3,name:"Marc Puig",avatar:"MP",color:"#CAFF4D",pts:120,best:-3,club:"Pink Beaks"},
  {rank:4,name:"Laura Fernández",avatar:"LF",color:"#F472B6",pts:96,best:0,club:"HCP1"},
  {rank:5,name:"Marta Vilà",avatar:"MV",color:"#FBBF24",pts:72,best:1,club:"Vallromanes"},
];
const LEADERBOARD_CAMP = [
  {camp:"Vallromanes",leader:"Marc Puig",avg:-2.1,games:18,best:-4,avatar:"MP",color:"#CAFF4D"},
  {camp:"HCP1",leader:"Sònia Ros",avg:-1.4,games:12,best:-2,avatar:"SR",color:"#60A5FA"},
  {camp:"Canal Olímpic",leader:"Jordi Mas",avg:-0.8,games:8,best:-1,avatar:"JM",color:"#A78BFA"},
  {camp:"Áccura Teià",leader:"Laura Fernández",avg:-0.5,games:6,best:-1,avatar:"LF",color:"#F472B6"},
  {camp:"Pitch&Putt Badalona",leader:"Pau Serra",avg:0.2,games:9,best:0,avatar:"PS",color:"#34D399"},
];

/* ═══════════════════════════════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════════════════════════════ */
function HomeScreen({ user, userPts, history, setScreen, openAuth, leads, lang, activeGame, onResumeGame, activityFeed }) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [liked, setLiked] = useState({});
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(x=>x.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const myGames = history.filter(g=>g.players.some(p=>p.isMe));
  const myScores = myGames.flatMap(g=>g.players.filter(p=>p.isMe).map(p=>p.diff));
  const bestGame = myScores.length ? Math.min(...myScores) : null;
  const tl = (k,v={}) => t(lang,k,v);

  return (
    <div className="page-scroll ani-up">

      {/* ── PARTIDA EN CURS ── */}
      {activeGame && (
        <div onClick={onResumeGame} style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'rgba(202,255,77,.08)',border:'1px solid rgba(202,255,77,.3)',
          borderRadius:10,padding:'12px 14px',marginBottom:14,cursor:'pointer',
        }}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#CAFF4D',marginBottom:2}}>
              ⛳ {lang==='en'?'Game in progress':lang==='es'?'Partida en curso':'Partida en curs'}
            </div>
            <div style={{fontSize:13,fontWeight:600}}>{activeGame.course?.name}</div>
          </div>
          <div style={{
            background:'#CAFF4D',color:'#0A0A0B',borderRadius:8,
            padding:'7px 14px',fontSize:11,fontWeight:700,flexShrink:0,
          }}>
            {lang==='en'?'Resume →':lang==='es'?'Continuar →':'Continuar →'}
          </div>
        </div>
      )}

      {/* ── PLAYER CARD / HERO ── */}
      {user ? (
        <div className="card card-lime" style={{marginBottom:14,background:`linear-gradient(135deg,${tier.bg} 0%,rgba(17,18,20,0) 100%)`,borderColor:tier.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#555761",fontWeight:500,marginBottom:4}}>
                {lang==="ca"?"Hola de nou,":lang==="es"?"Hola de nuevo,":"Welcome back,"}
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:".04em",lineHeight:1}}>{user.name}</div>
              {user.club && <div style={{fontSize:11,color:"#787C8A",marginTop:2}}>{user.club}</div>}
            </div>
            <div style={{fontSize:44,lineHeight:1}}>{tier.emoji}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            <TierBadge tierId={tier.id}/>
            <span className="pill" style={{color:tier.color,display:"flex",alignItems:"center",gap:4}}>
              <Zap size={11} strokeWidth={2.5}/>{userPts} pts
            </span>
          </div>
          {nextTier ? (
            <>
              <div style={{fontSize:11,color:"#555761",marginBottom:5}}>
                {nextTier.min-userPts} {tl("pts_to")} <span style={{color:nextTier.color,fontWeight:700}}>{nextTier.name} {nextTier.emoji}</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{width:`${pct}%`,background:tier.color}}/></div>
            </>
          ) : <div style={{fontSize:12,color:"#CAFF4D",fontWeight:700}}>{tl("tier_max")}</div>}
          <button className="btn btn-ghost btn-sm" style={{marginTop:12,fontSize:11,width:"auto",borderRadius:100,display:"flex",alignItems:"center",gap:5}} onClick={()=>setScreen("profile")}>
            <TrendingUp size={12}/>{tl("cta_stats")}
          </button>
        </div>
      ) : (
        <div style={{marginBottom:14,paddingTop:8}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
            <div className="live-dot"/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
              {tl("hero_live",{n:234+leads.current.length})}
            </span>
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(52px,14vw,100px)",lineHeight:.82,marginBottom:10,letterSpacing:"-.01em"}}>
            {tl("hero_title")}
          </div>
          <div style={{fontSize:14,color:"#787C8A",fontWeight:500,marginBottom:10,letterSpacing:".01em"}}>{tl("hero_sub")}</div>
          <p style={{fontSize:13,color:"#555761",lineHeight:1.7,marginBottom:14,fontWeight:400,maxWidth:400}}>{tl("hero_desc")}</p>
        </div>
      )}

      {/* ── PRIMARY CTA ── */}
      <button className="btn btn-primary" style={{marginBottom:10,fontSize:17,letterSpacing:".04em",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
        onClick={()=>setScreen("game-setup")}>
        <Flag size={18} strokeWidth={2.5}/>{tl("cta_new_game")}
      </button>
      {!user && (
        <button className="btn btn-ghost" style={{marginBottom:16,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={openAuth}>
          <User size={14}/>{tl("cta_create_account")}
        </button>
      )}

      {/* ── QUICK STATS ── */}
      {myGames.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{l:tl("stat_games"),v:myGames.length,icon:<Activity size={14}/>},
            {l:tl("stat_best"),v:bestGame!==null?(bestGame>0?`+${bestGame}`:`${bestGame}`):"—",icon:<TrendingUp size={14}/>},
            {l:tl("stat_holes"),v:myGames.reduce((a,g)=>a+g.scores.length,0),icon:<Target size={14}/>}].map(s=>(
            <div key={s.l} className="card" style={{padding:"12px 8px",textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:4,color:"#555761"}}>{s.icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,color:"#555761",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ÚLTIMES PARTIDES ── */}
      {myGames.length > 0 && (
        <div style={{marginBottom:16}}>
          <SectionHeader sub={tl("sec_activity")} title={tl("sec_last_games")}/>
          {myGames.slice(0,3).map(g=>{
            const me = g.players.find(p=>p.isMe);
            return (
              <div key={g.id} className="card card-press" style={{padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.course}</div>
                    <div style={{fontSize:11,color:"#555761",marginTop:2,display:"flex",alignItems:"center",gap:4}}>
                      <Calendar size={10}/>{g.date} · {g.scores.length} {tl("holes_label")}
                    </div>
                  </div>
                  {me && <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:26,lineHeight:1,color:me.diff<0?"#FBBF24":me.diff===0?"#CAFF4D":"#FFFFFF"}}>{me.diff>0?`+${me.diff}`:me.diff}</div>
                    <div style={{fontSize:10,color:"#CAFF4D",fontWeight:700,display:"flex",alignItems:"center",gap:2,justifyContent:"flex-end"}}><Zap size={9}/>+{me.points} pts</div>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myGames.length===0 && !user && (
        <div className="card" style={{textAlign:"center",padding:"28px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,color:"#2A2B30"}}><Flag size={40} strokeWidth={1}/></div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:".04em",marginBottom:6}}>{tl("no_games")}</div>
          <div style={{fontSize:12,color:"#555761",lineHeight:1.6,marginBottom:14}}>{tl("no_games_sub")}</div>
          <button className="btn btn-ghost btn-sm" style={{width:"auto",margin:"0 auto"}} onClick={()=>setScreen("game-setup")}>{tl("cta_register_now")}</button>
        </div>
      )}

      {/* ── MINI LEADERBOARD ── */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{tl("sec_ranking")}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,30px)",letterSpacing:".04em",lineHeight:1}}>{tl("sec_top_ranking")}</div>
          </div>
          <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#CAFF4D",cursor:"pointer",border:"none",background:"none",display:"flex",alignItems:"center",gap:4}} onClick={()=>setScreen("ranking")}>
            {lang==="en"?"All":tl("cat_all")} <ChevronRight size={13}/>
          </button>
        </div>
        <div className="card" style={{overflow:"hidden",padding:0}}>
          {LEADERBOARD.slice(0,5).map((p,i)=>{
            const tier=getTier(p.pts);
            return (
              <div key={p.rank} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<4?"1px solid #111214":"none"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:i<3?17:13,color:i<3?"#CAFF4D":"#2A2B30",width:22,textAlign:"center",flexShrink:0}}>0{p.rank}</div>
                <div style={{width:27,height:27,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:9,color:"#555761"}}>{tier.emoji} {tier.name} · {p.club}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{p.best>0?`+${p.best}`:p.best}</div>
                  <div style={{fontSize:9,color:"#CAFF4D",fontWeight:700}}>{p.pts}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COM FUNCIONA ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub={tl("sec_how")} title={tl("sec_how_title")}/>
        {[[<Flag size={20}/>,tl("step1_t"),tl("step1_d")],[<TrendingUp size={20}/>,tl("step2_t"),tl("step2_d")],[<ShoppingBag size={20}/>,tl("step3_t"),tl("step3_d")]].map(([icon,title,desc],i)=>(
          <div key={i} className="card" style={{padding:"14px",display:"flex",gap:14,alignItems:"flex-start",marginBottom:8}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#1A1B1E",lineHeight:1,flexShrink:0,width:32,textAlign:"center"}}>0{i+1}</div>
            <div>
              <div style={{color:"#CAFF4D",marginBottom:6}}>{icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:".04em",marginBottom:4}}>{title}</div>
              <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,fontWeight:400}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SISTEMA DE NIVELLS ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub={tl("sec_levels")} title={tl("sec_levels_title")}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
          {TIERS.map(tier=>{
            const descs={ca:[tl("tier_caddie_desc"),tl("tier_player_desc"),tl("tier_pro_desc"),tl("tier_master_desc")]};
            const descArr=[tl("tier_caddie_desc"),tl("tier_player_desc"),tl("tier_pro_desc"),tl("tier_master_desc")];
            const di=TIERS.findIndex(x=>x.id===tier.id);
            return (
              <div key={tier.id} className="card card-press" style={{padding:"14px 12px",textAlign:"center",borderColor:tier.border,background:tier.bg}}>
                <div style={{fontSize:24,marginBottom:4}}>{tier.emoji}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:tier.color,marginBottom:2}}>{tier.name}</div>
                <div style={{fontSize:9,color:"#555761",marginBottom:8,fontWeight:600}}>{tier.min}–{tier.max===99999?"∞":tier.max} pts</div>
                <div style={{fontSize:10,color:"#787C8A",lineHeight:1.5,fontWeight:400}}>{descArr[di]}</div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{tl("sec_points")}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {[{l:"Hole in One 🎯",p:"+25",c:"#FBBF24"},{l:"Birdie (−1)",p:"+12",c:"#60A5FA"},{l:"Par",p:"+6",c:"#CAFF4D"},{l:"Bogey (+1)",p:"+2",c:"#9CA3AF"},{l:tl("pts_tournament_win"),p:"+100",c:"#CAFF4D"},{l:tl("pts_inactivity"),p:"−15/m",c:"#EF4444"}].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#111214",borderRadius:7}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:r.p.startsWith("-")||r.p.startsWith("−")?"#EF4444":"#CAFF4D",width:38,textAlign:"right",flexShrink:0}}>{r.p}</div>
                <div style={{fontSize:11,color:"#787C8A",fontWeight:500}}>{r.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROPERS TORNEJOS ── */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{tl("sec_tournaments")}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,30px)",letterSpacing:".04em",lineHeight:1}}>{tl("sec_next_tournaments")}</div>
          </div>
          <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#CAFF4D",cursor:"pointer",border:"none",background:"none",display:"flex",alignItems:"center",gap:4}} onClick={()=>setScreen("tournaments")}>
            {lang==="en"?"All":tl("cat_all")} <ChevronRight size={13}/>
          </button>
        </div>
        {TOURNAMENTS_DATA.filter(x=>x.status==="open").slice(0,2).map(tourn=>{
          const mt=TIERS.find(x=>x.id===tourn.minTier);
          return (
            <div key={tourn.id} className="card card-press" style={{padding:"13px 15px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tourn.name}</div>
                  <div style={{fontSize:11,color:"#787C8A",marginTop:2,display:"flex",alignItems:"center",gap:4}}><MapPin size={9}/>{tourn.course} · {tourn.location}</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#CAFF4D",flexShrink:0,lineHeight:1}}>{tourn.dateS}</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <span className="pill" style={{fontSize:9,display:"flex",alignItems:"center",gap:3}}><Activity size={8}/>{tourn.format}</span>
                <span className="pill" style={{fontSize:9,color:mt?.color,borderColor:mt?.border}}>{lang==="en"?"Min:":"Min:"} {mt?.emoji} {mt?.name}</span>
                <span className="pill" style={{fontSize:9,display:"flex",alignItems:"center",gap:3}}><Award size={8}/>{tourn.fee}</span>
              </div>
            </div>
          );
        })}
      </div>



      {/* ── LA GENT JUGA AVUI (live feed) ── */}
      {(() => {
        const feed = activityFeed.length > 0 ? activityFeed : UGC_FEED.map(g => ({ id: g.id, user: g.user, course: g.course, diff: 0, label: g.label, lc: g.lc, points: 0, created_at: null }));
        return (
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:4}}>{tl("sec_community")}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(20px,5vw,30px)",letterSpacing:".04em",lineHeight:1,display:"flex",alignItems:"center",gap:8}}>
                  {tl("sec_community_title")}
                  {activityFeed.length > 0 && <span style={{width:7,height:7,borderRadius:"50%",background:"#EF4444",display:"inline-block",boxShadow:"0 0 6px #EF4444"}}/>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {feed.slice(0,5).map(item => (
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#1A1B1E",borderRadius:10,border:"1px solid #222327"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:item.lc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>
                    {item.user.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.user}</div>
                    <div style={{fontSize:10,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.course}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:item.lc}}>{item.label}</div>
                    {item.created_at && <div style={{fontSize:9,color:"#555761"}}>{timeAgo(item.created_at)}</div>}
                    {item.points > 0 && <div style={{fontSize:9,color:"#CAFF4D"}}>+{item.points} pts</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── TICKER ── */}
      <Ticker lang={lang}/>

      {/* ── READY TO PLAY ── */}
      <div style={{marginTop:14,background:"#CAFF4D",borderRadius:12,padding:"28px 18px",textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,9vw,52px)",color:"#0A0A0B",letterSpacing:".04em",lineHeight:.9,marginBottom:10}}>{tl("cta_ready")}</div>
        <p style={{fontSize:12,color:"rgba(10,10,11,.6)",marginBottom:16,fontWeight:500}}>{tl("cta_ready_sub")}</p>
        {!emailSent ? (
          <div style={{display:"flex",gap:8,maxWidth:300,margin:"0 auto 12px"}}>
            <input className="inp" style={{flex:1,fontSize:13,background:"rgba(255,255,255,.35)",border:"1px solid rgba(0,0,0,.12)",color:"#0A0A0B"}} type="email" placeholder="email@..." value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&(setEmailSent(true),leads.current.push(email))}/>
            <button className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:8,padding:"0 13px",flexShrink:0}} onClick={()=>{if(email.includes("@")){setEmailSent(true);leads.current.push(email);}}}><ArrowRight size={16}/></button>
          </div>
        ) : <div style={{fontSize:12,fontWeight:700,color:"#0A0A0B",marginBottom:12}}>{lang==="en"?"Noted! You're on the list.":lang==="es"?"¡Apuntado! Te avisamos pronto.":"Apuntat! T'avisem aviat."} {234+leads.current.length} {lang==="en"?"players":"jugadors"}.</div>}
        <button className="btn" style={{background:"#0A0A0B",color:"#CAFF4D",borderRadius:10,fontSize:13,fontWeight:700,padding:"13px 24px",display:"inline-flex",alignItems:"center",gap:7}} onClick={()=>setScreen("game-setup")}>
          <Flag size={16} strokeWidth={2.5}/>{tl("cta_ready_btn")}
        </button>
      </div>
    </div>
  );
}
function GameSetupScreen({ user, openAuth, onStart, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
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
  const [players, setPlayers] = useState([{ id:1, name: user?.name || "Tu", isMe:true }]);
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
        <div style={{fontSize:13,color:"#555761",fontWeight:400}}>{tl("setup_sub")}</div>
      </div>

      {/* DATE */}
      <div style={{marginBottom:16}}>
        <span className="label">{tl("label_date")}</span>
        <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} />
      </div>

      {/* COURSE SEARCH */}
      <div style={{marginBottom:16}}>
        <span className="label">{tl("label_course")} ({COURSES.length} {tl("course_hint").split(" ")[0]})</span>
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
            <span className="label">{tl("custom_name")}</span>
            <input className="inp" style={{marginBottom:10}} placeholder="Ex: Club de Golf de Lleida" value={customName} onChange={e=>setCustomName(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}>
                <span className="label">{tl("custom_holes")}</span>
                <select className="inp" value={customHoles} onChange={e=>{setCustomHoles(Number(e.target.value));setCustomPar(Number(e.target.value)===9?27:54);}}>
                  <option value={9}>9 forats</option>
                  <option value={18}>18 forats</option>
                </select>
              </div>
              <div style={{flex:1}}>
                <span className="label">{tl("custom_par")}</span>
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
        <span className="label">{tl("label_mode")}</span>
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
          <span className="label" style={{marginBottom:0}}>{tl("label_players")} ({players.length}/4)</span>
          {players.length < 4 && <button className="btn btn-ghost btn-sm" onClick={addPlayer}>+ Afegir</button>}
        </div>
        {players.map((p,i) => (
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"#1A1B1E",border:"1px solid #222327",borderRadius:8,marginBottom:6}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:PLAYER_COLORS[i],flexShrink:0}} />
            <div style={{flex:1,position:"relative"}}>
              <input className="inp" style={{width:"100%",padding:"6px 8px",fontSize:14,background:"transparent",border:"none",borderBottom:"1px solid #222327",borderRadius:0}} 
                placeholder={p.isMe ? (user?.name || "El teu nom") : "Nom del jugador"} 
                value={p.name === "Tu" && p.isMe ? (user?.name || "") : p.name} 
                onChange={e=>updateName(p.id,e.target.value)} />
              {p.isMe && <span style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#555761",fontWeight:600,pointerEvents:"none"}}>TU</span>}
            </div>
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
   SCORECARD SCREEN — Dial C1 + Global D1 + Wheel
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   SCORECARD SCREEN — Dial C1 + Global D1 (tab intern)
═══════════════════════════════════════════════════════════════ */
/* ─── NUMBER PICKER ───────────────────────────────────────── */
function NumberPicker({ value, par, onChange, lang }) {
  const scoreColor = (v) => {
    const d = v - par;
    if (d <= -2) return '#FBBF24';
    if (d === -1) return '#60A5FA';
    if (d === 0)  return '#CAFF4D';
    if (d === 1)  return '#FFFFFF';
    return '#EF4444';
  };
  const scoreLabel = (v) => {
    const d = v - par;
    if (d <= -2) return 'HiO 🎯';
    if (d === -1) return 'Birdie';
    if (d === 0)  return 'Par';
    if (d === 1)  return 'Bogey';
    if (d === 2)  return 'D.Bogey';
    return `+${d}`;
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,width:'100%',maxWidth:320}}>
      {/* Big number + label */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:80,lineHeight:1,
          color:scoreColor(value),transition:'color .15s',
          textShadow:`0 0 40px ${scoreColor(value)}30`}}>
          {value}
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:'.08em',
          color:scoreColor(value),transition:'color .15s'}}>
          {scoreLabel(value)}
        </div>
      </div>

      {/* Number grid 1–9 (3×3) */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,width:'100%'}}>
        {[1,2,3,4,5,6,7,8,9].map(v => {
          const active = v === value;
          const col = scoreColor(v);
          return (
            <div key={v} onClick={()=>onChange(v)} style={{
              height:52,borderRadius:10,
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',
              border: active ? `2px solid ${col}` : '1px solid #222327',
              background: active ? `${col}18` : '#1A1B1E',
              transition:'all .1s',
            }}>
              <span style={{fontFamily:"'Bebas Neue'",fontSize:26,
                color: active ? col : '#555761',
                transition:'color .1s'}}>
                {v}
              </span>
            </div>
          );
        })}
      </div>

      {/* −1 / +1 controls */}
      <div style={{display:'flex',gap:8,width:'100%'}}>
        {[{label:'−1',delta:-1},{label:'+1',delta:1}].map(({label,delta})=>(
          <div key={label} onClick={()=>onChange(Math.max(1, value+delta))} style={{
            flex:1,height:40,borderRadius:10,
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer',border:'1px solid #2A2B30',background:'#111214',
            transition:'all .1s',
          }}>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:20,color:'#787C8A'}}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{fontSize:9,color:'#555761',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>
        {lang==='en'?'SHOTS':lang==='es'?'GOLPES':'COPS'} · Par {par}
      </div>
    </div>
  );
}

function ScorecardScreen({ gameData, onFinish, onDelete, user, openAuth, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const { course, date, gameMode, players, liveShare } = gameData;
  const pph = Math.round(course.par / course.holes);

  /* ── State ── */
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('pc_scores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return Array.from({length:course.holes}, (_,i) => ({
      hole: i+1, par: pph,
      playerScores: Object.fromEntries(players.map(p => [p.id, null])),
    }));
  });
  const [curHole, setCurHole] = useState(() => {
    const saved = localStorage.getItem('pc_curHole');
    return saved ? parseInt(saved) : 0;
  });
  const [activePlayerId, setActivePlayerId] = useState(players[0].id);
  const [panel, setPanel]                   = useState('dial'); // 'dial' | 'global'
  const [confirmed, setConfirmed]           = useState(new Set()); // holes explicitly confirmed
  const [confirmDelete, setConfirmDelete]   = useState(false);

  const confirmHole = (holeIdx, pid) => {
    setConfirmed(prev => new Set([...prev, holeIdx]));
  };

  /* ── Derived ── */
  const hole    = scores[curHole];
  const par     = hole.par;
  const myScore = hole.playerScores[activePlayerId];

  const filledHoles  = confirmed.size;
  const allDone      = confirmed.size >= course.holes;
  const allThisHole  = confirmed.has(curHole);

  const playerAccum = (pid, upTo) => {
    let tot=0, cnt=0;
    for(let i=0; i<upTo; i++) {
      const v=scores[i].playerScores[pid];
      if(v!==null){ tot+=v; cnt++; }
    }
    return cnt ? tot - pph*cnt : null;
  };

  const fmtDiff = (d) => {
    if(d===null) return '—';
    if(d>0)  return `+${d}`;
    if(d===0) return 'E';
    return `${d}`;
  };

  const dialBg = (v) => {
    const d=v-par;
    if(d<=-2) return '#FBBF24';
    if(d===-1) return '#60A5FA';
    if(d===0)  return '#CAFF4D';
    if(d===1)  return '#EF4444';
    return '#7F1D1D';
  };

  const diffColor = (d) =>
    d===null?'#555761':d<0?'#CAFF4D':d===0?'#fff':'#EF4444';

  /* ── Score setter ── */
  const setHoleScore = (pid, val) => {
    setScores(prev => {
      const next = prev.map((h,i) =>
        i===curHole ? {...h, playerScores:{...h.playerScores,[pid]:val}} : h
      );
      localStorage.setItem('pc_scores', JSON.stringify(next));
      return next;
    });
    confirmHole(curHole, pid);
  };

  const changeDial = (delta) => {
    const cur = myScore ?? par;
    const newVal = Math.max(1, cur + delta);
    setHoleScore(activePlayerId, newVal);
    // Auto-advance to next player
    const pidx = players.findIndex(p=>p.id===activePlayerId);
    if (pidx < players.length - 1) {
      setTimeout(() => setActivePlayerId(players[pidx+1].id), 300);
    }
  };

  const goToHole = (idx) => {
    setCurHole(idx);
    localStorage.setItem('pc_curHole', idx);
    setActivePlayerId(players[0].id);
    setPanel('dial');
  };

  /* Auto-advance to next player after registering */
  const advancePlayer = () => {
    const pidx = players.findIndex(p=>p.id===activePlayerId);
    if(pidx < players.length-1) setActivePlayerId(players[pidx+1].id);
  };

  /* ── Badge style for global table ── */
  const badgeStyle = (v, p) => {
    const d=v-p;
    if(d<=-2) return {background:'rgba(251,191,36,.12)',border:'1px solid rgba(251,191,36,.35)',color:'#FBBF24'};
    if(d===-1) return {background:'rgba(96,165,250,.12)',border:'1px solid rgba(96,165,250,.35)',color:'#60A5FA'};
    if(d===0)  return {background:'rgba(202,255,77,.1)', border:'1px solid rgba(202,255,77,.3)', color:'#CAFF4D'};
    if(d===1)  return {background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)',  color:'#EF4444'};
    return     {background:'rgba(127,29,29,.4)',  border:'1px solid rgba(239,68,68,.4)',  color:'#EF4444'};
  };

  const curVal    = myScore ?? par;
  const curSI     = scoreInfo(curVal, par);
  const curBg     = dialBg(curVal);
  const labelText = curSI?.label.replace(/ [🎯🦅🐦✓😬]/u,'') ?? '';

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div style={{
      position:'fixed', inset:0, background:'#0A0A0B',
      display:'flex', flexDirection:'column', overflow:'hidden',
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>

      {/* ══ TOP BAR ══ */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 16px 8px', borderBottom:'1px solid #1A1B1E', flexShrink:0,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          {/* Exit button — saves to localStorage */}
          <button onClick={()=>onFinish(scores, true)} style={{
            display:'flex',alignItems:'center',gap:5,
            padding:'6px 10px',borderRadius:100,cursor:'pointer',
            border:'1px solid #222327',background:'#1A1B1E',
            color:'#555761',fontSize:11,fontWeight:700,fontFamily:'Inter',
          }}>
            ← {lang==='en'?'Save & exit':lang==='es'?'Guardar y salir':'Guardar i sortir'}
          </button>
          {/* Delete button */}
          {confirmDelete ? (
            <button onClick={onDelete} style={{
              display:'flex',alignItems:'center',gap:4,
              padding:'6px 10px',borderRadius:100,cursor:'pointer',
              border:'1px solid rgba(239,68,68,.5)',background:'rgba(239,68,68,.12)',
              color:'#EF4444',fontSize:11,fontWeight:700,fontFamily:'Inter',
            }}>
              {lang==='en'?'Delete?':lang==='es'?'Borrar?':'Eliminar?'}
            </button>
          ) : (
            <button onClick={()=>setConfirmDelete(true)} style={{
              display:'flex',alignItems:'center',justifyContent:'center',
              width:30,height:30,borderRadius:100,cursor:'pointer',
              border:'1px solid #222327',background:'#1A1B1E',
              color:'#555761',fontSize:13,fontFamily:'Inter',
            }}>
              🗑
            </button>
          )}
        </div>
        <div style={{minWidth:0,flex:1,marginRight:8,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{course.name}</div>
        </div>
        {/* Global button */}
        <button onClick={()=>setPanel(p=>p==='global'?'dial':'global')} style={{
          display:'flex',alignItems:'center',gap:5,flexShrink:0,
          padding:'6px 12px',borderRadius:100,cursor:'pointer',
          border: panel==='global'?'1px solid rgba(202,255,77,.5)':'1px solid #222327',
          background: panel==='global'?'rgba(202,255,77,.1)':'#1A1B1E',
          color: panel==='global'?'#CAFF4D':'#555761',
          fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',fontFamily:'Inter',
          transition:'all .15s',
        }}>
          <span style={{fontSize:13}}>📋</span>
          <span>{panel==='global'?(lang==='en'?'← Score':lang==='es'?'← Jugar':'← Reg.'):'Global'}</span>
        </button>
      </div>

      {/* ══ PROGRESS ══ */}
      <div style={{display:'flex',gap:2,padding:'6px 16px 0',flexShrink:0}}>
        {Array.from({length:course.holes},(_,i)=>(
          <div key={i} style={{
            flex:1, height:3, borderRadius:2,
            background: i<curHole?'#CAFF4D':i===curHole?'rgba(202,255,77,.45)':'#1A1B1E',
            transition:'background .3s',
          }}/>
        ))}
      </div>

      {/* ══ HOLE HEADER ══ */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',padding:'6px 16px 4px',flexShrink:0}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'#555761'}}>
            {lang==='en'?'Hole':lang==='es'?'Hoyo':'Forat'}
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:52,color:'#CAFF4D',lineHeight:1}}>
            {String(curHole+1).padStart(2,'0')}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#555761'}}>Par</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,lineHeight:1}}>{par}</div>
          <div style={{fontSize:9,color:'#2A2B30',marginTop:1}}>{filledHoles}/{course.holes} {lang==='en'?'done':lang==='es'?'hechos':'fets'}</div>
        </div>
      </div>

      {/* ══ ACUM PILLS ══ */}
      <div style={{display:'flex',gap:5,padding:'0 16px 6px',flexWrap:'wrap',flexShrink:0}}>
        {players.map((p,i)=>{
          const d = playerAccum(p.id, curHole);
          return (
            <div key={p.id} style={{
              display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:100,
              border:'1px solid #1A1B1E',background:'#0D0D0F',fontSize:10,fontWeight:700,
            }}>
              <div style={{width:5,height:5,borderRadius:'50%',background:PLAYER_COLORS[i]}}/>
              <span style={{color:'#555761'}}>{p.name.split(' ')[0]}</span>
              <span style={{fontFamily:"'Bebas Neue'",fontSize:14,lineHeight:1,color:diffColor(d)}}>{fmtDiff(d)}</span>
            </div>
          );
        })}
      </div>

      <div style={{height:1,background:'#1A1B1E',margin:'0 16px',flexShrink:0}}/>

      {/* ══════════════════════════════════════════
          PANEL: DIAL (registrar)
      ══════════════════════════════════════════ */}
      {panel==='dial' && (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 16px',gap:10,overflow:'hidden'}}>

          {/* Player tabs with arrows */}
          {players.length > 1 && (
            <div style={{display:'flex',alignItems:'center',gap:6,width:'100%',justifyContent:'center'}}>
              {/* Left arrow */}
              <button onClick={()=>{
                const idx = players.findIndex(p=>p.id===activePlayerId);
                if(idx > 0) setActivePlayerId(players[idx-1].id);
              }} style={{
                width:32,height:32,borderRadius:'50%',border:'1px solid #222327',
                background: players.findIndex(p=>p.id===activePlayerId)>0?'#1A1B1E':'transparent',
                color: players.findIndex(p=>p.id===activePlayerId)>0?'#CAFF4D':'#2A2B30',
                cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              }}>‹</button>

              {/* Active player tab */}
              {players.map((p,i)=>{
                const scored = hole.playerScores[p.id] !== null;
                const active = p.id === activePlayerId;
                const sv     = hole.playerScores[p.id];
                if (!active) return null;
                return (
                  <div key={p.id} style={{
                    display:'flex',alignItems:'center',gap:6,padding:'8px 20px',borderRadius:100,
                    border:`1px solid ${PLAYER_COLORS[i]}55`,
                    background:`${PLAYER_COLORS[i]}10`,
                    position:'relative',flex:1,justifyContent:'center',maxWidth:200,
                  }}>
                    <div style={{
                      width:24,height:24,borderRadius:'50%',background:PLAYER_COLORS[i],
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:'#0A0A0B',flexShrink:0,
                    }}>{p.name[0]}</div>
                    <span style={{fontSize:14,fontWeight:700,color:PLAYER_COLORS[i]}}>{p.name.split(' ')[0]}</span>
                    <span style={{fontFamily:"'Bebas Neue'",fontSize:18,color:PLAYER_COLORS[i],lineHeight:1}}>
                      {sv ?? '?'}
                    </span>
                    {scored && (
                      <div style={{
                        position:'absolute',top:-4,right:-4,width:16,height:16,
                        borderRadius:'50%',background:'#34D399',border:'2px solid #111214',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:9,color:'#fff',fontWeight:700,
                      }}>✓</div>
                    )}
                  </div>
                );
              })}

              {/* Right arrow */}
              <button onClick={()=>{
                const idx = players.findIndex(p=>p.id===activePlayerId);
                if(idx < players.length-1) setActivePlayerId(players[idx+1].id);
              }} style={{
                width:32,height:32,borderRadius:'50%',border:'1px solid #222327',
                background: players.findIndex(p=>p.id===activePlayerId)<players.length-1?'#1A1B1E':'transparent',
                color: players.findIndex(p=>p.id===activePlayerId)<players.length-1?'#CAFF4D':'#2A2B30',
                cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              }}>›</button>
            </div>
          )}

          {/* Result label */}
          <div style={{
            fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:'.06em',
            color: curVal===par ? '#CAFF4D' : curSI?.color ?? '#fff',
            transition:'color .2s',
          }}>
            {labelText || 'Par'}
          </div>

          {/* ── NUMBER PICKER ── */}
          <NumberPicker value={curVal} par={par} onChange={(v) => {
            setHoleScore(activePlayerId, v);
            const pidx = players.findIndex(p=>p.id===activePlayerId);
            if (pidx < players.length - 1) {
              setTimeout(() => setActivePlayerId(players[pidx+1].id), 400);
            }
          }} lang={lang} />

          {/* Score legend */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',marginTop:2}}>
            {[['HiO 🎯','#FBBF24'],['Birdie','#60A5FA'],['Par','#CAFF4D'],['Bogey','#fff'],['D.Bogey','#EF4444']].map(([l,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:3}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:c,flexShrink:0}}/>
                <span style={{fontSize:9,color:'#555761',fontWeight:600}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PANEL: GLOBAL TABLE
      ══════════════════════════════════════════ */}
      {panel==='global' && (
        <div style={{flex:1,overflowY:'auto',padding:'10px 14px'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{fontSize:8,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#555761',padding:'5px 4px 6px',textAlign:'left',borderBottom:'1px solid #1A1B1E'}}>
                  {lang==='en'?'H.':lang==='es'?'H.':'F.'}
                </th>
                <th style={{fontSize:8,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#555761',padding:'5px 4px 6px',textAlign:'center',borderBottom:'1px solid #1A1B1E'}}>Par</th>
                {players.map((p,i)=>(
                  <th key={p.id} style={{fontSize:8,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:PLAYER_COLORS[i],padding:'5px 4px 6px',textAlign:'center',borderBottom:'1px solid #1A1B1E'}}>
                    {p.name.split(' ')[0].slice(0,5).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map((h,idx)=>{
                const isCur  = idx===curHole;
                const isPast = idx<curHole;
                return (
                  <tr key={idx}
                    onClick={()=>goToHole(idx)}
                    style={{cursor:'pointer',background:isCur?'rgba(202,255,77,.04)':'transparent'}}>
                    <td style={{
                      fontFamily:"'Bebas Neue'",fontSize:13,padding:'5px 4px',
                      borderBottom:'1px solid #111214',textAlign:'left',
                      color:isCur?'#fff':isPast?'#CAFF4D':'#2A2B30',
                    }}>
                      {String(h.hole).padStart(2,'0')}{isCur?' ▶':''}
                    </td>
                    <td style={{fontSize:10,color:'#555761',padding:'5px 4px',borderBottom:'1px solid #111214',textAlign:'center'}}>{h.par}</td>
                    {players.map((p)=>{
                      const v=h.playerScores[p.id];
                      if(v===null){
                        return (
                          <td key={p.id} style={{padding:'5px 4px',borderBottom:'1px solid #111214',textAlign:'center'}}>
                            <div style={{
                              width:26,height:26,borderRadius:6,margin:'0 auto',
                              border:isCur?'1.5px dashed rgba(202,255,77,.5)':'1px solid #1A1B1E',
                              display:'flex',alignItems:'center',justifyContent:'center',
                              fontFamily:"'Bebas Neue'",fontSize:11,
                              color:isCur?'rgba(202,255,77,.6)':'transparent',
                            }}>?</div>
                          </td>
                        );
                      }
                      const bs=badgeStyle(v,h.par);
                      return (
                        <td key={p.id} style={{padding:'5px 4px',borderBottom:'1px solid #111214',textAlign:'center'}}>
                          <div style={{
                            width:26,height:26,borderRadius:6,margin:'0 auto',
                            ...bs,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontFamily:"'Bebas Neue'",fontSize:16,
                          }}>{v}</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{
                  fontSize:9,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',
                  color:'#555761',padding:'7px 4px',borderTop:'1px solid #222327',
                }}>TOTAL</td>
                {players.map((p,i)=>{
                  let tot=0,cnt=0;
                  scores.forEach(h=>{const v=h.playerScores[p.id];if(v!==null){tot+=v;cnt++;}});
                  const d=cnt?tot-pph*cnt:null;
                  return (
                    <td key={p.id} style={{padding:'7px 4px',borderTop:'1px solid #222327',textAlign:'center'}}>
                      <span style={{fontFamily:"'Bebas Neue'",fontSize:16,color:diffColor(d)}}>
                        {fmtDiff(d)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
          <div style={{fontSize:10,color:'#555761',textAlign:'center',marginTop:10,fontWeight:500,lineHeight:1.5}}>
            {lang==='en'?'Tap any hole to jump back to scoring':lang==='es'?'Toca un hoyo para volver':'Toca un forat per tornar al dial'}
          </div>
        </div>
      )}

      {/* ══ BOTTOM NAV ══ */}
      <div style={{display:'flex',gap:8,padding:'8px 16px',borderTop:'1px solid #1A1B1E',flexShrink:0}}>

        {panel==='global' ? (
          /* ── Global view nav: back button + hole jump info ── */
          <>
            <button onClick={()=>setPanel('dial')} style={{
              flex:1,padding:'13px 8px',borderRadius:10,border:'none',
              background:'#CAFF4D',color:'#0A0A0B',
              fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'.04em',textTransform:'uppercase',
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              ⛳ {lang==='en'?'Back to scoring':lang==='es'?'Volver a jugar':'Tornar a registrar'}
            </button>
            {allDone && (
              <button onClick={()=>onFinish(scores)} style={{
                flex:1,padding:'13px 8px',borderRadius:10,border:'none',
                background:'#FBBF24',color:'#0A0A0B',
                fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'.04em',textTransform:'uppercase',
              }}>
                {tl('finish')}
              </button>
            )}
          </>
        ) : (
          /* ── Dial view nav: prev / next ── */
          <>
            <button
              onClick={()=>{if(curHole>0)goToHole(curHole-1);}}
              disabled={curHole===0}
              style={{
                flex:1,padding:'13px 8px',borderRadius:10,border:'1px solid #222327',
                background:'#1A1B1E',color:curHole===0?'#2A2B30':'#787C8A',
                fontSize:11,fontWeight:700,cursor:curHole===0?'default':'pointer',
                letterSpacing:'.04em',textTransform:'uppercase',
              }}>
              ← {lang==='en'?'H':lang==='es'?'H':'F'}{String(curHole).padStart(2,'0')}
            </button>

            {allDone ? (
              <button onClick={()=>onFinish(scores)} style={{
                flex:2,padding:'13px 8px',borderRadius:10,border:'none',
                background:'#FBBF24',color:'#0A0A0B',
                fontSize:13,fontWeight:700,cursor:'pointer',letterSpacing:'.04em',textTransform:'uppercase',
              }}>
                {tl('finish')}
              </button>
            ) : (
              <button onClick={()=>{
                if(!allThisHole){ confirmHole(curHole); }
                if(curHole<course.holes-1){ goToHole(curHole+1); }
              }} style={{
                flex:2,padding:'13px 8px',borderRadius:10,border:'none',
                background:'#CAFF4D',color:'#0A0A0B',
                fontSize:11,fontWeight:700,cursor:'pointer',letterSpacing:'.04em',textTransform:'uppercase',
              }}>
                {lang==='en'?'H':lang==='es'?'H':'F'}{String(curHole+2).padStart(2,'0')} →
              </button>
            )}
          </>
        )}
      </div>

      {!user && (
        <div style={{textAlign:'center',fontSize:10,color:'#555761',padding:'4px 16px 6px',flexShrink:0}}>
          {lang==='en'?'Guest mode ·':lang==='es'?'Modo visitante ·':'Mode visitant ·'}{' '}
          <span style={{color:'#CAFF4D',cursor:'pointer',fontWeight:600}} onClick={openAuth}>
            {lang==='en'?'Create account':lang==='es'?'Crea cuenta':'Crea compte'}
          </span>
        </div>
      )}
    </div>
  );
}

function SummaryScreen({ game, userPts, prevPts, setScreen, openAuth, user, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
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
          <div className="sec-title">{tl("classification")}</div>
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
              <div style={{fontSize:11,color:"#555761",marginBottom:2,fontWeight:500}}>{tl("pts_earned")}</div>
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
        <div className="sec-title">{tl("hole_summary")}</div>
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
function RankingScreen({ user, openAuth, setScreen, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [filter, setFilter] = useState("global");
  const tabs = [["global",tl("ranking_global")],["setmana",tl("ranking_week")],["camp",tl("ranking_course")]];
  const goProfile = () => setScreen("profile");
  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>{tl("classification")}</div>
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
          <Activity size={12} color="#EF4444"/><span style={{fontSize:11,fontWeight:600,color:"#787C8A"}}>{tl("ranking_week_note")} actual · es reinicia cada dilluns</span>
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
function TournamentsScreen({ openAuth, user, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [cat, setCat]         = useState("all");
  const [liveData, setLiveData] = useState(null);   // null = not loaded yet
  const [loading, setLoading]   = useState(!!SHEETS_CSV_URL);
  const [lastSync, setLastSync] = useState(null);

  // Fetch live data on mount (and every 5 min if visible)
  useEffect(() => {
    if (!SHEETS_CSV_URL) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await fetchTournamentsFromSheet();
      if (!cancelled) {
        setLiveData(data);
        setLastSync(new Date());
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const allTournaments = liveData ?? TOURNAMENTS_FALLBACK;
  const cats = [{id:"all",l:tl("cat_all")},{id:"open",l:tl("cat_open")}];
  const filtered = cat==="all" ? allTournaments : allTournaments.filter(t=>t.category===cat);
  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Competicions 2025</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>TORNEJOS <span className="lime">P&C</span></div>
          </div>
          {SHEETS_CSV_URL && (
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
              {loading
                ? <span style={{fontSize:9,color:"#555761",fontWeight:700,letterSpacing:".06em"}}>↻ Sincronitzant...</span>
                : liveData
                  ? <span style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#34D399",fontWeight:700,letterSpacing:".06em"}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:"#34D399",display:"inline-block",flexShrink:0}}/>
                      EN DIRECTE
                    </span>
                  : <span style={{fontSize:9,color:"#EF4444",fontWeight:700,letterSpacing:".06em"}}>⚠ Fallback</span>
              }
            </div>
          )}
        </div>
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
                    {t.status==="open"?tl("tourn_open"):tl("tourn_soon")}
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
              <span style={{fontSize:10,color:"#555761",fontWeight:500}}>{isFull?tl("tourn_full"):spotsLeft<=5?tl("tourn_last_spots",{n:spotsLeft}):tl("tourn_spots_left",{n:spotsLeft})}</span>
              <span style={{fontSize:10,color:"#555761"}}>{t.spots-t.left}/{t.spots}</span>
            </div>
            <div className="prog" style={{marginBottom:12}}>
              <div className="prog-fill" style={{width:`${((t.spots-t.left)/t.spots)*100}%`,background:spotsLeft<=5?"#FBBF24":"#CAFF4D"}}/>
            </div>
            {t.status==="open" ? (
              <button className="btn btn-primary" style={{fontSize:13,padding:"11px"}} disabled={isFull} onClick={!user?openAuth:undefined}>
                {isFull?tl("tourn_full"):!user?tl("tourn_join_first"):tl("tourn_inscribe")}
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
function ShopScreen({ openAuth, user, lang }) {
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


/* ═══════════════════════════════════════════════════════════════
   PROFILE / STATS SCREEN
═══════════════════════════════════════════════════════════════ */
function ProfileScreen({ user, userPts, setScreen, lang, onAvatarChange, history }) {
  const tl = (k,v={}) => t(lang,k,v);
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(t=>t.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const myGames = (history||[]).filter(g => g.players?.some(p => p.isMe));
  const myDiffs = myGames.map(g => g.players.find(p => p.isMe)?.diff).filter(d => d !== undefined && d !== null);
  const bestDiff = myDiffs.length ? Math.min(...myDiffs) : null;
  const trendData = myGames.slice(0, 10).reverse().map(g => ({
    date: g.date,
    s: g.players.find(p => p.isMe)?.diff ?? 0,
  }));
  const courseMap = {};
  myGames.forEach(g => {
    const me = g.players.find(p => p.isMe);
    if (!me) return;
    if (!courseMap[g.course]) courseMap[g.course] = { name: g.course, diffs: [] };
    courseMap[g.course].diffs.push(me.diff);
  });
  const bestCourses = Object.values(courseMap)
    .map(c => ({ name: c.name, played: c.diffs.length, best: Math.min(...c.diffs), avg: +(c.diffs.reduce((a,b)=>a+b,0)/c.diffs.length).toFixed(1) }))
    .sort((a,b) => a.best - b.best)
    .slice(0, 4);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onAvatarChange(file);
    setUploading(false);
  };

  return (
    <div className="page-scroll">
      {/* Header */}
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",overflow:"hidden"}}>
        <div style={{flex:1,minWidth:0,paddingRight:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>Perfil</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(26px,7vw,40px)",letterSpacing:".04em",lineHeight:1}}>{user?.name||profile.name}</div>
          {(user?.club||profile.club) && <div style={{fontSize:12,color:"#787C8A",marginTop:3}}>{user?.club||profile.club}</div>}
        </div>
        <div style={{position:"relative",flexShrink:0}} onClick={()=>fileInputRef.current?.click()}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",display:"block"}} alt="avatar"/>
            : <div style={{width:54,height:54,borderRadius:"50%",background:tier.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:18,color:"#0A0A0B"}}>{(user?.name||profile.name).split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
          }
          <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,borderRadius:"50%",background:"#1A1B1E",border:"1px solid #222327",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {uploading ? <span style={{fontSize:8,color:"#787C8A"}}>…</span> : <span style={{fontSize:10}}>📷</span>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileSelect}/>
        </div>
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
        {[
          {l:tl("stat_games"), v:myGames.length},
          {l:tl("stat_best"),  v:bestDiff !== null ? (bestDiff > 0 ? `+${bestDiff}` : bestDiff === 0 ? "E" : bestDiff) : "—"},
          {l:tl("stat_holes"), v:myGames.reduce((a,g)=>a+(g.scores?.length||0),0)||"—"},
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Score trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>{tl("profile_score_trend")}</div>
        {trendData.length >= 2 ? <>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:56,marginBottom:6}}>
            {trendData.map((r,i) => {
              const worst = Math.max(...trendData.map(x=>x.s));
              const best  = Math.min(...trendData.map(x=>x.s));
              const range = worst - best || 1;
              const h = Math.round(((worst-r.s)/range)*44)+8;
              const c = r.s<=-2?"#FBBF24":r.s<0?"#60A5FA":r.s===0?"#CAFF4D":"#9CA3AF";
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                <div style={{fontSize:8,color:c,fontWeight:700,letterSpacing:".04em"}}>{r.s>0?`+${r.s}`:r.s===0?"E":r.s}</div>
                <div style={{width:"100%",background:c,borderRadius:"2px 2px 0 0",height:h,opacity:.9}}/>
              </div>;
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:8,color:"#555761"}}>{trendData[0].date}</div>
            <div style={{fontSize:8,color:"#555761"}}>{trendData[trendData.length-1].date}</div>
          </div>
        </> : <div style={{textAlign:"center",padding:"16px 0",fontSize:12,color:"#555761"}}>{lang==="en"?"Play more rounds to see your trend":lang==="es"?"Juega más partidas para ver tu evolución":"Juga més partides per veure la teva evolució"}</div>}
      </div>

      {/* Best courses */}
      {bestCourses.length > 0 && (
        <div className="card" style={{marginBottom:12,padding:"14px"}}>
          <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{tl("profile_best_courses")}</div>
          {bestCourses.map((c,i)=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<bestCourses.length-1?"1px solid #111214":"none"}}>
              <div style={{fontSize:16,width:24,textAlign:"center",flexShrink:0}}>{["🏆","🥈","🥉",""][i]||`0${i+1}`}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:10,color:"#555761"}}>{c.played} {tl("profile_played")} · avg {c.avg>0?`+${c.avg}`:c.avg===0?"E":c.avg}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#CAFF4D",lineHeight:1}}>{c.best>0?`+${c.best}`:c.best===0?"E":c.best}</div>
                <div style={{fontSize:9,color:"#555761"}}>best</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setScreen("home")}>{tl("back")}</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════════ */
function AuthModal({ onClose, onAuth, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [club, setClub] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (mode==="register" && !name.trim()) { setErr(tl("err_name")); return; }
    if (!email.includes("@") || !email.includes(".")) { setErr(tl("err_email")); return; }
    if (!password || password.length < 6) { setErr(lang==="en"?"Password must be at least 6 characters":lang==="es"?"La contraseña debe tener al menos 6 caracteres":"La contrasenya ha de tenir almenys 6 caràcters"); return; }

    setLoading(true);
    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim(), club: club.trim() } },
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      const u = data.user;
      onAuth({ name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "" });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setErr(error.message); setLoading(false); return; }
      const u = data.user;
      onAuth({ name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "" });
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:".04em",marginBottom:4}}>
          {mode==="register"?tl("auth_register_title"):tl("auth_login_title")}
        </div>
        <div style={{fontSize:12,color:"#787C8A",marginBottom:20,fontWeight:400}}>
          {mode==="register"?tl("auth_register_sub"):tl("auth_login_sub")}
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
              <span className="label">{tl("auth_club")}</span>
              <input className="inp" placeholder="Pink Beaks, Canal Olímpic..." value={club}
                onChange={e=>setClub(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </>
        )}

        <div style={{marginBottom:12}}>
          <span className="label">Email</span>
          <input className="inp" type="email" placeholder="tu@email.com" value={email}
            onChange={e=>{setEmail(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        <div style={{marginBottom:20}}>
          <span className="label">{lang==="en"?"Password":lang==="es"?"Contraseña":"Contrasenya"}</span>
          <input className="inp" type="password" placeholder="••••••••" value={password}
            onChange={e=>{setPassword(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        {err && (
          <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#EF4444",marginBottom:12}}>
            ⚠ {err}
          </div>
        )}

        <button className="btn btn-primary" style={{fontSize:14,marginBottom:14,width:"100%"}} onClick={submit} disabled={loading}>
          {loading?(lang==="en"?"Loading...":lang==="es"?"Cargando...":"Carregant..."):(mode==="register"?tl("auth_register_btn"):tl("auth_login_btn"))}
        </button>

        <div style={{textAlign:"center",fontSize:12,color:"#555761"}}>
          {mode==="register"
            ? <>{tl("auth_to_login")} <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:700}} onClick={()=>{setMode("login");setErr("");}}>{tl("auth_to_login_link")}</span></>
            : <>{tl("auth_to_register")} <span style={{color:"#CAFF4D",cursor:"pointer",fontWeight:700}} onClick={()=>{setMode("register");setErr("");}}>{tl("auth_to_register_link")}</span></>
          }
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem('pc_screen');
    return saved === 'scorecard' ? 'scorecard' : 'home';
  });
  const [lang, setLang] = useState("ca");
  const [user, setUser] = useState(null);
  const [userPts, setUserPts] = useState(0);
  const [history, setHistory] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [gameData, setGameData] = useState(() => {
    try { const s = localStorage.getItem('pc_gameData'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [lastGame, setLastGame] = useState(null);
  const [prevPts, setPrevPts] = useState(0);
  const [activityFeed, setActivityFeed] = useState([]);
  const leads = useRef([]);

  useEffect(() => {
    supabase.from("games").select("*").order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setActivityFeed(data.map(mapGameToFeedItem)); });

    const channel = supabase
      .channel("games-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "games" }, (payload) => {
        setActivityFeed(prev => [mapGameToFeedItem(payload.new), ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ name: u.user_metadata?.name || u.email.split("@")[0], email: u.email, club: u.user_metadata?.club || "", avatarUrl: u.user_metadata?.avatar_url || null });
        supabase.from("games").select("*").order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data) {
              setHistory(data.map(g => ({ id: g.id, course: g.course, date: g.date, mode: g.mode, players: g.players, scores: g.scores })));
              setUserPts(data.reduce((sum, g) => { const me = g.players.find(p => p.isMe); return sum + (me?.points || 0); }, 0));
            }
          });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const openAuth = () => setShowAuth(true);

  const handleAvatarChange = async (file) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const userId = authData.user.id;
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { showToast("Error uploading avatar"); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    setUser(prev => ({ ...prev, avatarUrl: publicUrl }));
  };

  const handleGameDelete = () => {
    localStorage.removeItem('pc_gameData');
    localStorage.removeItem('pc_scores');
    localStorage.removeItem('pc_curHole');
    localStorage.removeItem('pc_screen');
    setGameData(null);
    setScreen("home");
    window.scrollTo(0, 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserPts(0);
    setHistory([]);
    setScreen("home");
    window.scrollTo(0, 0);
  };

  const handleAuth = (u) => {
    setUser(u);
    setShowAuth(false);
    const greet = lang==="en"?`👋 Welcome, ${u.name.split(" ")[0]}!`:lang==="es"?`👋 Bienvenido/a, ${u.name.split(" ")[0]}!`:`👋 Benvingut/da, ${u.name.split(" ")[0]}!`;
    showToast(greet);
  };

  const handleGameStart = (data) => {
    localStorage.setItem('pc_gameData', JSON.stringify(data));
    localStorage.setItem('pc_screen', 'scorecard');
    setGameData(data);
    setScreen("scorecard");
  };

  const handleGameFinish = async (scores, saveAndExit=false) => {
    if (!gameData) return;
    if (saveAndExit) {
      // Save scores to localStorage and go home, keeping game alive
      localStorage.setItem('pc_scores', JSON.stringify(scores));
      setScreen("home");
      return;
    }
    const totalPar = gameData.course.par;
    const players = gameData.players.map(p => {
      const pPts = scores.reduce((a,h) => { const s=h.playerScores[p.id]; return a+(s!==null?calcPCPoints(s,h.par):0); },0) + 8;
      const pScore = scores.reduce((a,h)=>a+(h.playerScores[p.id]??h.par),0);
      return {...p,score:pScore,diff:pScore-totalPar,points:pPts};
    });
    const game = { id:Date.now(), course:gameData.course.name, date:gameData.date, mode:gameData.gameMode, players, scores:[...scores] };
    setHistory(prev=>[game,...prev]);
    const me = players.find(p=>p.isMe);
    if (me) { setPrevPts(userPts); setUserPts(p=>p+me.points); }
    setLastGame(game);

    if (user) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        await supabase.from("games").insert({
          user_id: authData.user.id,
          course: game.course,
          date: game.date,
          mode: game.mode,
          players: game.players,
          scores: game.scores,
        });
      }
    }

    localStorage.removeItem('pc_gameData');
    localStorage.removeItem('pc_scores');
    localStorage.removeItem('pc_curHole');
    localStorage.removeItem('pc_screen');
    setScreen("summary");
  };

  const setScreenSafe = (s) => { setScreen(s); window.scrollTo(0,0); };
  const isGameFlow = screen==="game-setup"||screen==="scorecard"||screen==="summary";

  return (
    <>
      <style>{G}</style>
      <style>{`
        @media (min-width: 431px) {
          body { display:flex; justify-content:center; background:#0A0A0B; }
          .app { box-shadow: 0 0 60px rgba(0,0,0,.5); }
        }
      `}</style>
      <div className="app">
        {screen!=="scorecard" && <AppHeader screen={screen} setScreen={setScreenSafe} user={user} openAuth={openAuth} onSignOut={handleSignOut} userPts={userPts} lang={lang} setLang={setLang}/>}

        {screen==="home"       && <HomeScreen       user={user} userPts={userPts} history={history} setScreen={setScreenSafe} openAuth={openAuth} leads={leads} lang={lang} activeGame={gameData} onResumeGame={()=>setScreen("scorecard")} activityFeed={activityFeed}/>}
        {screen==="game-setup" && <GameSetupScreen   user={user} openAuth={openAuth} onStart={handleGameStart} lang={lang}/>}
        {screen==="scorecard"  && gameData && <ScorecardScreen gameData={gameData} onFinish={handleGameFinish} onDelete={handleGameDelete} user={user} openAuth={openAuth} lang={lang}/>}
        {screen==="summary"    && lastGame && <SummaryScreen   game={lastGame} userPts={userPts} prevPts={prevPts} setScreen={setScreenSafe} openAuth={openAuth} user={user} lang={lang}/>}
        {screen==="ranking"    && <RankingScreen    user={user} openAuth={openAuth} setScreen={setScreenSafe} lang={lang}/>}
        {screen==="tournaments" && <TournamentsScreen user={user} openAuth={openAuth} lang={lang}/>}
        {screen==="shop"       && <ShopScreen       user={user} openAuth={openAuth} lang={lang}/>}
        {screen==="profile"    && <ProfileScreen    user={user} userPts={userPts} setScreen={setScreenSafe} lang={lang} onAvatarChange={handleAvatarChange} history={history}/>}

        {!isGameFlow && <BottomNav screen={screen} setScreen={setScreenSafe} lang={lang}/>}

        {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth} lang={lang}/>}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
