import React, { useState, useRef, useEffect, useCallback } from "react";
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
    nav_home:"Inici",nav_ranking:"Rànquing",nav_game:"Partida",nav_live:"Live",nav_shop:"Botiga",nav_profile:"Perfil",
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
    nav_home:"Inicio",nav_ranking:"Ranking",nav_game:"Partida",nav_live:"Live",nav_shop:"Tienda",nav_profile:"Perfil",
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
    nav_home:"Home",nav_ranking:"Ranking",nav_game:"Round",nav_live:"Live",nav_shop:"Shop",nav_profile:"Profile",
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
  height:100dvh;
  width:100%;
  max-width:430px;
  margin:0 auto;
  position:relative;
  overflow:hidden;
  display:flex;
  flex-direction:column;
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
  width:100%;max-width:430px;z-index:200;
  background:rgba(10,10,11,.97);
  border-top:1px solid #1A1B1E;
  display:flex;
  padding:8px 0 calc(8px + env(safe-area-inset-bottom));
  backdrop-filter:blur(16px);
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
.page-scroll{flex:1;min-height:0;padding:16px 16px calc(80px + env(safe-area-inset-bottom));overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}

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
  max-width:calc(100% - 32px);
}

/* ── TICKER */
.ticker{background:#CAFF4D;height:34px;display:flex;align-items:center;overflow:hidden;}
.ticker-track{display:flex;gap:40px;white-space:nowrap;animation:tick 22s linear infinite;}
@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{font-family:'Bebas Neue';font-size:13px;letter-spacing:.1em;color:#0A0A0B;display:flex;align-items:center;gap:10px;}

/* ── LIVE DOT */
.live-dot{width:6px;height:6px;border-radius:50%;background:#EF4444;animation:blink 1.2s infinite;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes pulse-border{0%,100%{border-color:rgba(202,255,77,.35)}50%{border-color:rgba(202,255,77,.9)}}

/* ── LIVE SCREEN */
.live-tab-bar{display:flex;border-bottom:1px solid #1A1B1E;margin-bottom:16px;gap:0;}
.live-tab{padding:9px 16px;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;background:none;font-size:12px;font-weight:700;color:#555761;cursor:pointer;white-space:nowrap;font-family:Inter;letter-spacing:.04em;text-transform:uppercase;transition:color .15s;}
.live-tab.active{border-bottom-color:#CAFF4D;color:#CAFF4D;}
.live-card{background:#1A1B1E;border:1px solid #222327;border-radius:10px;padding:13px 14px;margin-bottom:8px;cursor:pointer;transition:all .15s;}
.live-card:active{transform:scale(.98);}
.story-row{display:flex;gap:12px;overflow-x:auto;padding:0 0 10px;margin-bottom:16px;-webkit-overflow-scrolling:touch;}
.story-row::-webkit-scrollbar{display:none;}
.story-avatar{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;}
.story-ring{width:50px;height:50px;border-radius:50%;border:2px solid #CAFF4D;padding:2px;}
.story-inner{width:100%;height:100%;border-radius:50%;background:#1A1B1E;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;overflow:hidden;}
.ugc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;grid-auto-rows:160px;}
.ugc-card{border-radius:10px;overflow:hidden;background:#1A1B1E;cursor:pointer;transition:transform .15s;}
.ugc-card:active{transform:scale(.97);}
.map-container{position:relative;width:100%;aspect-ratio:1.15;background:#1A1B1E;border-radius:12px;overflow:hidden;border:1px solid #222327;}
.map-dot{position:absolute;transform:translate(-50%,-50%);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;}
.map-pin{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#0A0A0B;transition:transform .15s;box-shadow:0 2px 8px rgba(0,0,0,.4);}
.map-dot:hover .map-pin,.map-dot:active .map-pin{transform:scale(1.15);}
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
      <button className={`nav-item${screen==="live"?" active":""}`} onClick={()=>setScreen("live")}>
        <Activity size={21} strokeWidth={screen==="live"?2.5:1.8}/>
        <span>{lbl("nav_live")}</span>
      </button>
      <button className={`nav-item${screen==="profile"?" active":""}`} onClick={()=>setScreen("profile")}>
        <User size={21} strokeWidth={screen==="profile"?2.5:1.8}/><span>{lbl("nav_profile")}</span>
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
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>openAuth("login")}
              style={{background:"transparent",border:"1px solid #2A2B30",borderRadius:100,padding:"6px 12px",fontSize:11,fontWeight:700,color:"#FFFFFF",cursor:"pointer",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"Inter"}}>
              {lang==="en"?"Login":lang==="es"?"Entrar":"Entra"}
            </button>
            <button className="btn btn-sm" style={{background:"#CAFF4D",color:"#0A0A0B",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:700,textTransform:"uppercase"}} onClick={()=>openAuth("register")}>
              {tl("cta_join")}
            </button>
          </div>
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
function HomeScreen({ user, userPts, history, setScreen, openAuth, leads, lang, activeGame, onResumeGame, activityFeed, liveGames }) {
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
        <div style={{paddingTop:8,marginBottom:16}}>
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
      <button className="btn btn-primary" style={{marginBottom:10,fontSize:14}}
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

      {/* ── LIVE EN DIRECTE preview ── */}
      {(() => {
        const livePrev = (liveGames && liveGames.length) ? liveGames.filter(g=>g.is_live).slice(0,3) : MOCK_LIVE_GAMES.filter(g=>g.is_live).slice(0,3);
        return livePrev.length > 0 ? (
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #1A1B1E"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761"}}>En directe</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(18px,4.5vw,28px)",letterSpacing:".04em",lineHeight:1}}>LIVE ARA</div>
              </div>
              <button style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#EF4444",cursor:"pointer",border:"none",background:"none",display:"flex",alignItems:"center",gap:4}} onClick={()=>setScreen("live")}>
                Tot <ChevronRight size={13}/>
              </button>
            </div>
            {livePrev.map(g=><LiveGameCard key={g.id} game={g} compact/>)}
          </div>
        ) : null;
      })()}

      {/* ── ACTIVITAT GLOBAL ── */}
      {activityFeed && activityFeed.length > 0 && (
        <div style={{marginBottom:16}}>
          <SectionHeader sub="Activitat global" title="ÚLTIMES PARTIDES"/>
          {activityFeed.slice(0,4).map(item=>(
            <div key={item.id} className="card" style={{padding:"11px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#2A2B30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>
                {String(item.user||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.user}</div>
                <div style={{fontSize:10,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.course} · {timeAgo(item.created_at)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:item.lc,lineHeight:1}}>{item.diff>0?`+${item.diff}`:item.diff===0?"E":item.diff}</div>
                <div style={{fontSize:9,color:"#555761"}}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COM FUNCIONA ── */}
      <div style={{marginBottom:16}}>
        <SectionHeader sub={tl("sec_how")} title={tl("sec_how_title")}/>
        {[[<Flag size={16}/>,tl("step1_t"),tl("step1_d")],[<TrendingUp size={16}/>,tl("step2_t"),tl("step2_d")],[<ShoppingBag size={16}/>,tl("step3_t"),tl("step3_d")]].map(([icon,title,desc],i)=>(
          <div key={i} className="card" style={{padding:"14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{color:"#CAFF4D",display:"flex",alignItems:"center",flexShrink:0}}>{icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:".04em"}}>{title}</div>
            </div>
            <div style={{fontSize:12,color:"#787C8A",lineHeight:1.6,fontWeight:400}}>{desc}</div>
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

      {/* ── BOTIGA AVIAT ── */}
      <div className="card card-lime" style={{padding:"16px",marginBottom:16,display:"flex",gap:14,alignItems:"center"}}>
        <ShoppingBag size={22} color="#CAFF4D" style={{flexShrink:0}}/>
        <div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:".04em",marginBottom:3}}>{lang==="en"?"P&C Shop — Coming Soon":lang==="es"?"Tienda P&C — Próximamente":"Botiga P&C — Aviat"}</div>
          <div style={{fontSize:11,color:"#787C8A",lineHeight:1.5}}>{lang==="en"?"Official kit & gear. 10% of every purchase goes to your club.":lang==="es"?"Kit oficial y equipamiento. El 10% de cada compra va a tu club.":"Kit oficial i equipament. El 10% de cada compra va al teu club."}</div>
        </div>
      </div>

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
  const [players, setPlayers] = useState([{ id:1, name: user?.name || "", isMe:true }]);
  const [liveShare, setLiveShare] = useState(false);

  // Sync player 1 name when user auth resolves after mount
  useEffect(() => {
    if (user?.name) setPlayers(p => p.map(x => x.isMe ? {...x, name: user.name} : x));
  }, [user?.name]);

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
            <input className="inp" style={{flex:1,minWidth:0,padding:"6px 0",fontSize:14,background:"transparent",border:"none",borderBottom:"1px solid #222327",borderRadius:0,color:"#fff"}}
              placeholder={p.isMe ? "El teu nom" : `Jugador ${i+1}`}
              value={p.name}
              onChange={e=>updateName(p.id,e.target.value)}
              onFocus={e=>e.target.select()}
              autoFocus={!p.isMe && i===players.length-1}
            />
            {p.isMe && <span style={{fontSize:10,color:"#555761",fontWeight:600,flexShrink:0}}>TU</span>}
            {!p.isMe && <button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:18,padding:4,lineHeight:1,flexShrink:0}} onClick={()=>removePlayer(p.id)}>×</button>}
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
  const display = value ?? par;
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
          color:value===null?'#555761':scoreColor(display),transition:'color .15s',
          textShadow:value===null?'none':`0 0 40px ${scoreColor(display)}30`}}>
          {value===null ? '—' : display}
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:'.08em',
          color:value===null?'#555761':scoreColor(display),transition:'color .15s'}}>
          {value===null ? (lang==='en'?'No score':lang==='es'?'Sin score':'Sense score') : scoreLabel(display)}
        </div>
      </div>

      {/* Number grid 1–9 + "-" (5×2) */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,width:'100%'}}>
        {[1,2,3,4,5,6,7,8,9].map(v => {
          const active = value === v;
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
        {/* "-" = null score (hole skipped) */}
        <div onClick={()=>onChange(null)} style={{
          height:52,borderRadius:10,
          display:'flex',alignItems:'center',justifyContent:'center',
          cursor:'pointer',
          border: value===null ? '2px solid #555761' : '1px solid #222327',
          background: value===null ? 'rgba(85,87,97,.15)' : '#1A1B1E',
          transition:'all .1s',
        }}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:26,
            color: value===null ? '#fff' : '#555761',
            transition:'color .1s'}}>—</span>
        </div>
      </div>

      <div style={{fontSize:9,color:'#555761',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>
        {lang==='en'?'SHOTS':lang==='es'?'GOLPES':'COPS'} · Par {par}
      </div>
    </div>
  );
}

/* ── ScoreSymbol: golf standard notation ── */
function ScoreSymbol({ v, par, size=24 }) {
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

/* ── AnimPts: animated P&C counter ── */
function AnimPts({ value, prev }) {
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

function ScorecardScreen({ gameData, onFinish, onDelete, user, openAuth, lang, liveGameId, onLiveUpdate }) {
  const tl = (k,v={}) => t(lang,k,v);
  const { course, players } = gameData;
  const pph = Math.round(course.par / course.holes);

  /* ── helpers ── */
  const scDiffColor = d => d==null?'#3a3a42':d<=-2?'#FBBF24':d===-1?'#60A5FA':d===0?'#CAFF4D':d===1?'#d0d0d0':d===2?'#EF4444':'#9f1414';
  const scFmtTotal  = d => d==null?'—':d>0?`+${d}`:d===0?'E':`${d}`;
  const scHolePts   = d => d==null?0:d<=-2?25:d===-1?12:d===0?6:d===1?2:0;
  const scCalcPts   = (sc,pid) => sc.reduce((s,h)=>{ const v=h.playerScores[pid]; return s+(v!=null?scHolePts(v-h.par):0); },0);
  const scPlayerTot = (sc,pid) => { let t=0,c=0; sc.forEach(h=>{const v=h.playerScores[pid];if(v!=null){t+=v-h.par;c++;}}); return c?t:null; };
  const scDiffLabel = d => d==null?'—':d<=-2?(d===-2?'Eagle':'Hole in One'):d===-1?'Birdie':d===0?'Par':d===1?'Bogey':d===2?'Doble':'+'+d;
  const scRowLabel  = (n,par) => { const d=n-par; const lbl=d<=-2?(d===-2?'Eagle':'HiO'):d===-1?'Birdie':d===0?'Par':d===1?'Bogey':d===2?'Doble':'Triple'; const sign=d===0?'':d>0?`+${d}`:`${d}`; return sign?`${sign} ${lbl}`:lbl; };
  const scDiffBg    = d => d==null?'transparent':d<=-2?'rgba(251,191,36,.14)':d===-1?'rgba(96,165,250,.13)':d===0?'rgba(202,255,77,.10)':d===1?'rgba(255,255,255,.05)':d===2?'rgba(239,68,68,.13)':'rgba(127,29,29,.32)';

  /* ── State ── */
  const [scores, setScores] = useState(() => {
    try { const s=localStorage.getItem('pc_scores'); if(s) return JSON.parse(s); } catch {}
    return Array.from({length:course.holes},(_,i)=>({
      hole:i+1, par:pph,
      playerScores:Object.fromEntries(players.map(p=>[p.id,null])),
    }));
  });
  const [curHole,    setCurHole]    = useState(() => { const s=localStorage.getItem('pc_curHole'); return s?parseInt(s):0; });
  const [activePid,  setActivePid]  = useState(players[0].id);
  const [showFull,   setShowFull]   = useState(false);
  const [flashInfo,  setFlashInfo]  = useState(null);
  const stripRef = useRef(null);

  const hole = scores[curHole];
  const par  = hole.par;

  useEffect(()=>{
    stripRef.current?.querySelector(`[data-hole="${curHole}"]`)
      ?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  },[curHole]);

  /* ── Score setters ── */
  const applyScore = (pid, v) => {
    const next = scores.map((h,i)=>i===curHole?{...h,playerScores:{...h.playerScores,[pid]:v}}:h);
    setScores(next);
    localStorage.setItem('pc_scores', JSON.stringify(next));
    setFlashInfo({pid,label:scDiffLabel(v-par),d:v-par});
    setTimeout(()=>setFlashInfo(null),1500);
    // Push live update
    if (onLiveUpdate) onLiveUpdate(next, curHole);
  };

  const nudge = (pid,delta) => applyScore(pid, Math.max(1,(hole.playerScores[pid]??par)+delta));

  const commitParAndGo = (nextHole) => {
    // Commit par for the active player if they haven't scored the current hole yet
    let next = scores;
    if (next[curHole].playerScores[activePid] == null) {
      next = next.map((h,i) => i===curHole ? {...h, playerScores:{...h.playerScores,[activePid]:h.par}} : h);
      setScores(next);
      localStorage.setItem('pc_scores', JSON.stringify(next));
    }
    const ni=Math.max(0,Math.min(course.holes-1,nextHole));
    setCurHole(ni);
    localStorage.setItem('pc_curHole', ni);
    setActivePid(players[0].id);
    if (onLiveUpdate) onLiveUpdate(next, ni);
  };

  const allDone = players.every(p=>hole.playerScores[p.id]!=null);
  const allHolesDone = scores.every(h=>players.every(p=>h.playerScores[p.id]!=null));

  /* ── Targeta completa (full scorecard) ── */
  if (showFull) return (
    <div style={{position:'fixed',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'#0A0A0B',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'Inter,sans-serif'}}>
      <div style={{padding:'12px 14px',borderBottom:'1px solid #1a1a1f',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:'.06em',color:'#CAFF4D'}}>{lang==='en'?'Full Scorecard':lang==='es'?'Tarjeta completa':'Targeta Completa'}</div>
          <div style={{fontSize:9,color:'#555',fontWeight:600}}>{course.name} · Par {course.par}</div>
        </div>
        <button onClick={()=>setShowFull(false)} style={{padding:'6px 13px',borderRadius:8,border:'1px solid #222',background:'#1a1a1f',color:'#CAFF4D',fontSize:11,fontWeight:700,cursor:'pointer'}}>← {lang==='en'?'Back':lang==='es'?'Volver':'Tornar'}</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 14px 24px'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'2px solid #1a1a1f'}}>
              <th style={{fontSize:8,color:'#555',fontWeight:700,padding:'8px 4px',textAlign:'left',letterSpacing:'.1em',textTransform:'uppercase'}}>{lang==='en'?'H':lang==='es'?'H':'F'}</th>
              <th style={{fontSize:8,color:'#555',fontWeight:700,padding:'8px 4px',textAlign:'center'}}>Par</th>
              {players.map((p,i)=><th key={p.id} style={{fontSize:8,color:PLAYER_COLORS[i],fontWeight:700,padding:'8px 4px',textAlign:'center'}}>{p.name.split(' ')[0].slice(0,4).toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1].map(hi=>(
              <React.Fragment key={hi}>
                {scores.slice(hi*9,hi*9+9).map((h,i)=>{
                  const idx=hi*9+i;
                  return (
                    <tr key={idx} onClick={()=>{commitParAndGo(idx);setShowFull(false);}} style={{cursor:'pointer',background:idx===curHole?'rgba(202,255,77,.04)':'transparent',borderBottom:'1px solid #111'}}>
                      <td style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:idx===curHole?'#CAFF4D':'#555',padding:'5px 4px'}}>{String(h.hole).padStart(2,'0')}{idx===curHole?' ▶':''}</td>
                      <td style={{fontSize:9,color:'#444',padding:'5px 4px',textAlign:'center'}}>{h.par}</td>
                      {players.map(p=>(
                        <td key={p.id} style={{padding:'3px',textAlign:'center'}}>
                          <div style={{display:'flex',justifyContent:'center'}}><ScoreSymbol v={h.playerScores[p.id]} par={h.par} size={28}/></div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{background:'#111',borderTop:'1px solid #222',borderBottom:'1px solid #222'}}>
                  <td colSpan={2} style={{fontSize:8,fontWeight:700,color:'#555',padding:'6px 4px',textTransform:'uppercase',letterSpacing:'.08em'}}>{hi===0?'OUT':'IN'}</td>
                  {players.map((p,i)=>{
                    let tt=0,cc=0; scores.slice(hi*9,hi*9+9).forEach(h=>{const v=h.playerScores[p.id];if(v!=null){tt+=v-h.par;cc++;}});
                    const d=cc?tt:null;
                    return <td key={p.id} style={{padding:'6px 4px',textAlign:'center'}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:scDiffColor(d)}}>{scFmtTotal(d)}</span></td>;
                  })}
                </tr>
              </React.Fragment>
            ))}
            <tr style={{background:'#0f0f14',borderTop:'2px solid #222'}}>
              <td colSpan={2} style={{fontSize:9,fontWeight:700,color:'#555',padding:'9px 4px',textTransform:'uppercase',letterSpacing:'.08em'}}>TOTAL</td>
              {players.map(p=>{
                const d=scPlayerTot(scores,p.id);
                return <td key={p.id} style={{padding:'9px 4px',textAlign:'center'}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:scDiffColor(d)}}>{scFmtTotal(d)}</span></td>;
              })}
            </tr>
          </tbody>
        </table>
        <div style={{marginTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {players.map((p,i)=>{
            const pts=scCalcPts(scores,p.id),tot=scPlayerTot(scores,p.id);
            return (
              <div key={p.id} style={{background:'#111',borderRadius:10,padding:'10px 12px',border:`1px solid ${PLAYER_COLORS[i]}22`}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:PLAYER_COLORS[i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#0A0A0B'}}>{p.name[0]}</div>
                  <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>{p.name.split(' ')[0]}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:scDiffColor(tot),lineHeight:1}}>{scFmtTotal(tot)}</div><div style={{fontSize:8,color:'#555',marginTop:1}}>{lang==='en'?'result':lang==='es'?'resultado':'resultat'}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'#CAFF4D',lineHeight:1}}>{pts}</div><div style={{fontSize:8,color:'#555',marginTop:1}}>pts P&C</div></div>
                </div>
              </div>
            );
          })}
        </div>
        {allHolesDone && (
          <button onClick={()=>onFinish(scores)} style={{width:'100%',marginTop:16,padding:'14px',borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:14,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase'}}>
            {tl('finish')}
          </button>
        )}
      </div>
    </div>
  );

  /* ══ MAIN SCORING VIEW ══ */
  return (
    <div style={{position:'fixed',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'#0A0A0B',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'Inter,sans-serif',paddingBottom:'env(safe-area-inset-bottom)'}}>

      {/* TOP BAR */}
      <div style={{padding:'10px 14px 8px',borderBottom:'1px solid #1a1a1f',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0,flex:1}}>
            {/* Save & exit */}
            <button onClick={()=>onFinish(scores,true)} style={{padding:'5px 10px',borderRadius:100,border:'1px solid #222327',background:'#1A1B1E',color:'#555761',fontSize:10,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              ← {lang==='en'?'Save':lang==='es'?'Guardar':'Guardar'}
            </button>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:'.06em',color:'#CAFF4D',lineHeight:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{course.name}</div>
              <div style={{fontSize:11,color:'#787C8A',fontWeight:600,marginTop:2,letterSpacing:'.02em'}}>
                {lang==='en'?'Hole':lang==='es'?'Hoyo':'Forat'} <span style={{color:'#CAFF4D'}}>{curHole+1}</span>/{course.holes}
                <span style={{color:'#333',margin:'0 4px'}}>·</span>Par {par}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0}}>
            <button onClick={()=>setShowFull(true)} style={{padding:'6px 11px',borderRadius:8,border:'1px solid #222',background:'#1a1a1f',color:'#787C8A',fontSize:10,fontWeight:700,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase'}}>
              {lang==='en'?'Card':lang==='es'?'Tarjeta':'Targeta'}
            </button>
            <button onClick={()=>{ if(window.confirm(lang==='en'?'Abandon this round? Progress will be lost.':lang==='es'?'¿Abandonar la ronda? Se perderá el progreso.':'Abandonar la ronda? Es perdran els progressos.')) onDelete(); }} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #222',background:'#1a1a1f',color:'#555',fontSize:10,fontWeight:700,cursor:'pointer'}}>
              <X size={12}/>
            </button>
          </div>
        </div>

        {/* Hole strip */}
        <div ref={stripRef} style={{display:'flex',gap:3,overflowX:'auto'}} className="noscroll">
          {scores.map((h,i)=>{
            const done=players.every(p=>h.playerScores[p.id]!=null);
            const any =players.some(p=>h.playerScores[p.id]!=null);
            const isCur=i===curHole;
            return (
              <div key={i} data-hole={i} onClick={()=>commitParAndGo(i)}
                style={{flexShrink:0,width:isCur?28:20,height:22,borderRadius:5,cursor:'pointer',transition:'all .2s',
                  background:isCur?'#CAFF4D':done?'rgba(202,255,77,.28)':any?'rgba(202,255,77,.1)':'#1a1a1f',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isCur?11:10,color:isCur?'#0A0A0B':done?'#CAFF4D':'#444'}}>{h.hole}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER CARDS */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px',display:'flex',flexDirection:'column',gap:8}}>
        {players.map((p,pi)=>{
          const pcolor  = PLAYER_COLORS[pi];
          const v       = hole.playerScores[p.id];
          const d       = v!=null?v-par:null;
          const tot     = scPlayerTot(scores,p.id);
          const isAct   = activePid===p.id;
          const flash   = flashInfo?.pid===p.id;
          const played  = scores.filter(h=>h.playerScores[p.id]!=null).length;

          return (
            <div key={p.id} onClick={()=>setActivePid(p.id)}
              style={{borderRadius:14,transition:'all .2s',cursor:'pointer',position:'relative',
                background:isAct?'#15151c':'#0f0f13',
                border:isAct?`1.5px solid ${pcolor}60`:'1px solid #1a1a1f',
                boxShadow:isAct?`0 0 28px ${pcolor}14,inset 0 0 40px ${pcolor}05`:'none',
                padding:'12px 13px'}}>

              {flash&&(
                <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:scDiffColor(flashInfo.d),letterSpacing:'.1em',animation:'flashUp .9s ease forwards',pointerEvents:'none',zIndex:10,whiteSpace:'nowrap'}}>
                  {flashInfo.label}
                </div>
              )}

              {/* Card header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0,flex:1}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:isAct?pcolor:pcolor+'66',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#0A0A0B',flexShrink:0,transition:'background .2s'}}>
                    {p.name[0]}
                  </div>
                  <div style={{fontWeight:700,fontSize:13,color:isAct?'#fff':'#555',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'color .2s'}}>{p.name}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:scDiffColor(tot),lineHeight:1,transition:'color .3s',textShadow:tot!=null&&isAct?`0 0 30px ${scDiffColor(tot)}25`:'none'}}>
                    {scFmtTotal(tot)}
                  </div>
                  <div style={{fontSize:8,color:'#555',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginTop:1}}>{played}/{course.holes}</div>
                </div>
              </div>

              {/* Hole grid — 2 rows of 9 */}
              <div style={{marginBottom:isAct?12:0}}>
                {[0,1].map(row=>(
                  <div key={row}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,marginTop:row===1?6:0}}>
                      <span style={{fontSize:7,fontWeight:700,color:'#2a2a35',letterSpacing:'.1em',flexShrink:0}}>{row===0?`${lang==='en'?'H':lang==='es'?'H':'F'}1–9`:`${lang==='en'?'H':lang==='es'?'H':'F'}10–18`}</span>
                      <div style={{flex:1,height:1,background:'#1e1e28'}}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(9,1fr)',gap:3}}>
                      {scores.slice(row*9,row*9+9).map((h,ci)=>{
                        const i=row*9+ci;
                        const hv=h.playerScores[p.id];
                        const isCur=i===curHole;
                        return (
                          <div key={i} onClick={e=>{e.stopPropagation();commitParAndGo(i);setActivePid(p.id);}}
                            style={{cursor:'pointer',borderRadius:6,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:42,gap:1,transition:'all .15s',
                              border:isCur?`1.5px solid ${pcolor}70`:'1px solid #1e1e28',
                              background:isCur?`${pcolor}0d`:'#0c0c12'}}>
                            <span style={{fontSize:9,color:isCur?pcolor:'#2a2a38',fontWeight:700,lineHeight:1}}>{h.hole}</span>
                            <ScoreSymbol v={isCur&&hv==null?h.par:hv} par={h.par} size={28}/>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Scoring controls (active player only) */}
              {isAct&&(
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:2}}>
                  <button onClick={e=>{e.stopPropagation();nudge(p.id,-1);}}
                    style={{width:46,height:46,borderRadius:12,border:'1px solid #2a2a35',background:'#1c1c26',color:'#9a9aaa',fontSize:24,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,lineHeight:1}}>
                    −
                  </button>
                  <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <ScoreSymbol v={v??par} par={par} size={52}/>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:scDiffColor(d),letterSpacing:'.1em',lineHeight:1,transition:'color .2s'}}>
                      {v==null?'Par (default)':scRowLabel(v,par)}
                    </span>
                  </div>
                  <button onClick={e=>{e.stopPropagation();nudge(p.id,1);}}
                    style={{width:46,height:46,borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontSize:24,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,lineHeight:1}}>
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM NAV */}
      <div style={{display:'flex',gap:8,padding:'10px 14px 14px',borderTop:'1px solid #1e1e28',flexShrink:0}}>
        <button onClick={()=>curHole>0&&commitParAndGo(curHole-1)} disabled={curHole===0}
          style={{flex:1,padding:'13px',borderRadius:12,border:'1px solid #2e2e3a',background:curHole>0?'#1c1c26':'#111118',color:curHole>0?'#9a9aaa':'#2e2e3a',fontWeight:700,fontSize:12,cursor:curHole>0?'pointer':'default',letterSpacing:'.06em',textTransform:'uppercase',transition:'all .2s'}}>
          ← {lang==='en'?'H':lang==='es'?'H':'F'}{String(curHole).padStart(2,'0')}
        </button>
        {allHolesDone ? (
          <button onClick={()=>onFinish(scores)}
            style={{flex:2,padding:'13px',borderRadius:12,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontWeight:700,fontSize:13,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase'}}>
            {tl('finish')}
          </button>
        ) : (
          <button onClick={()=>{if(curHole<course.holes-1)commitParAndGo(curHole+1);}}
            style={{flex:2,padding:'13px',borderRadius:12,border:allDone?'none':'1px solid #2e2e3a',background:allDone?'#CAFF4D':'#1c1c26',color:allDone?'#0A0A0B':'#CAFF4D',fontWeight:700,fontSize:13,cursor:'pointer',letterSpacing:'.06em',textTransform:'uppercase',transition:'all .2s'}}>
            {curHole<course.holes-1?`${lang==='en'?'H':lang==='es'?'H':'F'}${String(curHole+2).padStart(2,'0')} →`:tl('finish')}
          </button>
        )}
      </div>

      {!user&&(
        <div style={{textAlign:'center',fontSize:10,color:'#555761',padding:'4px 16px 6px',flexShrink:0}}>
          {lang==='en'?'Guest mode ·':lang==='es'?'Modo visitante ·':'Mode visitant ·'}{' '}
          <span style={{color:'#CAFF4D',cursor:'pointer',fontWeight:600}} onClick={openAuth}>
            {lang==='en'?'Create account':lang==='es'?'Crea cuenta':'Crea compte'}
          </span>
        </div>
      )}

      <style>{`
        .noscroll::-webkit-scrollbar{display:none;}
        @keyframes flashUp{0%{opacity:1;transform:translateX(-50%) translateY(0);}55%{opacity:1;transform:translateX(-50%) translateY(-10px);}100%{opacity:0;transform:translateX(-50%) translateY(-20px);}}
        @keyframes ptsPop{0%{transform:scale(1);opacity:.6;}50%{transform:scale(1.22);opacity:1;}100%{transform:scale(1);opacity:1;}}
      `}</style>
    </div>
  );
}

function SummaryScreen({ game, userPts, prevPts, setScreen, openAuth, user, lang, onPhotoUpload }) {
  const tl = (k,v={}) => t(lang,k,v);
  const me = game.players.find(p => p.isMe);
  const diff = me?.diff ?? 0;
  const tierNow = getTier(userPts);
  const tierPrev = getTier(prevPts);
  const levelUp = tierNow.id !== tierPrev.id;
  const [showPhotoCard, setShowPhotoCard] = useState(!!user);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoLabel, setPhotoLabel] = useState("Par");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoShared, setPhotoShared] = useState(false);
  const handleSharePhoto = async () => {
    if (!photoFile || !onPhotoUpload) return;
    setPhotoUploading(true);
    await onPhotoUpload(photoFile, photoCaption, photoLabel, game.supabaseId);
    setPhotoUploading(false);
    setPhotoShared(true);
    setShowPhotoCard(false);
  };

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

      {/* Compartir foto */}
      {user && onPhotoUpload && showPhotoCard && !photoShared && (
        <div className="card" style={{marginBottom:14,padding:"15px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:13}}>📸 Compartir foto de la partida</div>
            <button onClick={()=>setShowPhotoCard(false)} style={{background:"none",border:"none",color:"#555761",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button>
          </div>
          <input type="file" accept="image/*" style={{width:"100%",marginBottom:8,fontSize:12,color:"#fff",background:"#111214",border:"1px solid #222327",borderRadius:6,padding:"6px 8px"}}
            onChange={e=>setPhotoFile(e.target.files[0])}/>
          <input type="text" placeholder="Descripció (ex: Eagle al 12!)" maxLength={80} value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)}
            style={{width:"100%",background:"#111214",border:"1px solid #222327",borderRadius:6,padding:"7px 10px",color:"#fff",fontSize:12,marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {["Eagle","Birdie","Par","Bogey"].map(l=>(
              <button key={l} onClick={()=>setPhotoLabel(l)} style={{flex:1,padding:"5px 0",borderRadius:6,border:`1px solid ${photoLabel===l?"#CAFF4D":"#222327"}`,background:photoLabel===l?"rgba(202,255,77,.1)":"transparent",color:photoLabel===l?"#CAFF4D":"#555761",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"Inter"}}>{l}</button>
            ))}
          </div>
          <button className="btn btn-primary" style={{fontSize:12}} onClick={handleSharePhoto} disabled={!photoFile||photoUploading}>{photoUploading?"Pujant...":"Compartir a la comunitat →"}</button>
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
  const [liveRanking, setLiveRanking] = useState(null);
  const [loading, setLoading]         = useState(true);
  const goProfile = () => setScreen("profile");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // Global: aggregate points per user from games table
        const { data: gamesData } = await supabase
          .from("games")
          .select("user_id, players, scores, created_at");

        if (gamesData && !cancelled) {
          // Build global leaderboard from games
          const userMap = {};
          gamesData.forEach(g => {
            const me = (g.players||[]).find(p => p.isMe);
            if (!me || !g.user_id) return;
            if (!userMap[g.user_id]) {
              userMap[g.user_id] = { name: me.name, pts: 0, scores: [], club: me.club||"" };
            }
            userMap[g.user_id].pts += (me.points || 0);
            userMap[g.user_id].scores.push(me.diff ?? 0);
          });
          const global = Object.entries(userMap)
            .map(([uid, v], i) => ({
              rank: i+1, name: v.name, club: v.club,
              pts: v.pts,
              best: v.scores.length ? Math.min(...v.scores) : 0,
              avatar: v.name.split(" ").map(w=>w[0]).slice(0,2).join(""),
              color: ["#CAFF4D","#60A5FA","#A78BFA","#F472B6","#34D399","#FBBF24"][i%6],
            }))
            .sort((a,b) => b.pts - a.pts)
            .map((p,i) => ({...p, rank:i+1}));
          if (global.length) setLiveRanking(global);

        }
      } catch(e) {
        console.warn("P&C: Could not load ranking from Supabase:", e.message);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const globalData = (liveRanking || LEADERBOARD).slice(0, 10);
  const isLive     = !!liveRanking;

  return (
    <div className="page-scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761",marginBottom:5}}>{tl("classification")}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,9vw,46px)",letterSpacing:".04em",lineHeight:1}}>RÀNQUING <span className="lime">P&C</span></div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".06em",display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
            {loading
              ? <span style={{color:"#555761"}}>↻ Carregant...</span>
              : isLive
                ? <><span style={{width:5,height:5,borderRadius:"50%",background:"#34D399",display:"inline-block"}}/><span style={{color:"#34D399"}}>LIVE</span></>
                : <span style={{color:"#555761"}}>DEMO</span>
            }
          </div>
        </div>
      </div>
      {/* ── LEADERBOARD */}
      <div className="card" style={{overflow:"hidden",padding:0,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",padding:"7px 13px",borderBottom:"1px solid #1A1B1E",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761"}}>
          <span>#</span><span>{lang==="en"?"Player":lang==="es"?"Jugador":"Jugador"}</span><span style={{textAlign:"center"}}>{lang==="en"?"Best":lang==="es"?"Mejor":"Millor"}</span><span style={{textAlign:"right"}}>Pts</span>
        </div>
        {globalData.map((p,i) => {
          const tier = getTier(p.pts);
          return (
            <div key={p.rank} style={{display:"grid",gridTemplateColumns:"34px 1fr 48px 58px",alignItems:"center",padding:"10px 13px",borderBottom:"1px solid #111214",cursor:"pointer"}} onClick={goProfile}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:i===0?"#FBBF24":i===1?"#9CA3AF":i===2?"#CD7F32":"#2A2B30"}}>{String(p.rank).padStart(2,"0")}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#0A0A0B",flexShrink:0}}>{p.avatar}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:9,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tier.emoji} {tier.name}{p.club?` · ${p.club}`:""}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,textAlign:"center",color:p.best<0?"#CAFF4D":p.best===0?"#fff":"#555761"}}>{p.best>0?`+${p.best}`:p.best}</div>
              <div style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#CAFF4D"}}>{p.pts}</div>
            </div>
          );
        })}
        {!user && <div style={{padding:"11px 13px",background:"rgba(202,255,77,.04)",borderTop:"1px solid #1A1B1E",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#787C8A"}}>{lang==="en"?"Create an account to appear in the ranking":lang==="es"?"Crea una cuenta para aparecer en el ranking":"Crea un compte per aparèixer al rànquing"}</span>
          <button className="btn btn-primary btn-sm" style={{borderRadius:100,padding:"7px 14px",fontSize:11,width:"auto"}} onClick={openAuth}>{lang==="en"?"Join →":lang==="es"?"Únete →":"Uneix-te →"}</button>
        </div>}
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOURNAMENTS SCREEN
═══════════════════════════════════════════════════════════════ */
function TournamentsScreen({ openAuth, user, lang }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [cat, setCat]         = useState("all");
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("id")
      .then(({ data }) => {
        if (data?.length) setLiveData(data.map(row => ({...row, dateS: row.date_s, minTier: row.min_tier})));
        setLoading(false);
        setLastSync(new Date());
      });
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
   LIVE SCREEN
═══════════════════════════════════════════════════════════════ */
const SPAIN_PINS = [
  { id:"bcn", label:"BCN",  x:76, y:30, games:8,  color:"#CAFF4D" },
  { id:"mad", label:"MAD",  x:42, y:42, games:5,  color:"#60A5FA" },
  { id:"vlc", label:"VLC",  x:62, y:55, games:3,  color:"#A78BFA" },
  { id:"bil", label:"BIL",  x:50, y:16, games:2,  color:"#F472B6" },
  { id:"mlg", label:"MLG",  x:38, y:78, games:4,  color:"#FBBF24" },
  { id:"zgz", label:"ZGZ",  x:58, y:28, games:1,  color:"#34D399" },
  { id:"svq", label:"SVQ",  x:28, y:72, games:2,  color:"#F87171" },
  { id:"pmi", label:"PMI",  x:88, y:50, games:6,  color:"#818CF8" },
];

const MOCK_LIVE_GAMES = [
  { id:1, player_name:"Marc Puig",     course_name:"Vallromanes",      current_hole:12, holes:18, score_total:-3, par_total:0, is_live:true,  avatar:"MP", color:"#CAFF4D", created_at: new Date(Date.now()-1200000).toISOString() },
  { id:2, player_name:"Sònia Ros",     course_name:"Canal Olímpic",    current_hole:7,  holes:18, score_total:-1, par_total:0, is_live:true,  avatar:"SR", color:"#60A5FA", created_at: new Date(Date.now()-2400000).toISOString() },
  { id:3, player_name:"Jordi Mas",     course_name:"HCP1",             current_hole:9,  holes:9,  score_total:0,  par_total:0, is_live:false, avatar:"JM", color:"#A78BFA", created_at: new Date(Date.now()-3600000).toISOString() },
  { id:4, player_name:"Laura Fernández",course_name:"Áccura Teià",    current_hole:15, holes:18, score_total:2,  par_total:0, is_live:true,  avatar:"LF", color:"#F472B6", created_at: new Date(Date.now()-4800000).toISOString() },
  { id:5, player_name:"Pau Serra",     course_name:"P&P Badalona",     current_hole:5,  holes:9,  score_total:-1, par_total:0, is_live:true,  avatar:"PS", color:"#34D399", created_at: new Date(Date.now()-600000).toISOString() },
];

function LiveGameCard({ game, compact }) {
  const diff = game.score_total ?? game.players?.find(p=>p.isMe)?.diff ?? 0;
  const scoreColor = diff < -1 ? "#FBBF24" : diff === -1 ? "#60A5FA" : diff === 0 ? "#CAFF4D" : "#EF4444";
  const pct = Math.round(((game.current_hole||1) / (game.holes||18)) * 100);

  if (compact) {
    return (
      <div className={`live-card${game.is_live?" is-live":""}`}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:game.color||"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
            {game.avatar_url ? <img src={game.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : (game.avatar||"?")}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              {game.is_live && <span style={{width:5,height:5,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block",flexShrink:0}}/>}
              <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{game.player_name}</div>
            </div>
            <div style={{fontSize:10,color:"#555761",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{game.course_name}</div>
            <div style={{height:3,background:"#111214",borderRadius:2,overflow:"hidden",marginTop:5}}>
              <div style={{height:"100%",width:`${pct}%`,background:game.is_live?"#EF4444":"#555761",borderRadius:2,transition:"width .5s"}}/>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:scoreColor,lineHeight:1}}>{diff>0?`+${diff}`:diff===0?"E":diff}</div>
            <div style={{fontSize:9,color:"#555761"}}>F{game.current_hole||"-"}/{game.holes||18}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`live-card${game.is_live?" is-live":""}`}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:game.color||"#CAFF4D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#0A0A0B",flexShrink:0,overflow:"hidden"}}>
            {game.avatar_url ? <img src={game.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : (game.avatar||"?")}
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              {game.is_live && (
                <span style={{fontSize:8,fontWeight:700,letterSpacing:".08em",background:"rgba(239,68,68,.15)",color:"#EF4444",border:"1px solid rgba(239,68,68,.3)",borderRadius:3,padding:"1px 6px",display:"flex",alignItems:"center",gap:3}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> LIVE
                </span>
              )}
            </div>
            <div style={{fontWeight:700,fontSize:14}}>{game.player_name}</div>
            <div style={{fontSize:11,color:"#787C8A",marginTop:1}}>{game.course_name}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:scoreColor,lineHeight:1}}>{diff>0?`+${diff}`:diff===0?"E":diff}</div>
          <div style={{fontSize:10,color:"#555761"}}>Forat {game.current_hole||"-"}/{game.holes||18}</div>
        </div>
      </div>
      <div style={{height:4,background:"#111214",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:game.is_live?"#EF4444":"#555761",borderRadius:2,transition:"width .5s"}}/>
      </div>
    </div>
  );
}

function LiveScreen({ user, openAuth, lang, liveGames }) {
  const games = (liveGames && liveGames.length) ? liveGames : MOCK_LIVE_GAMES;
  const liveNow = games.filter(g => g.is_live);
  const recent = games.filter(g => !g.is_live);

  return (
    <div className="page-scroll ani-up">
      {/* Header */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div className="live-dot"/>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#555761"}}>
            {liveNow.length} {lang==="en"?"live now":lang==="es"?"en directo ahora":"en directe ara"}
          </div>
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,8vw,44px)",letterSpacing:".04em",lineHeight:1}}>
          EN DIRECTE <span style={{color:"#EF4444"}}>P&C</span>
        </div>
      </div>

      {/* Stories row */}
      {liveNow.length > 0 && (
        <div className="story-row">
          {liveNow.map(g=>(
            <div key={g.id} className="story-avatar">
              <div className="story-ring">
                <div className="story-inner" style={{background:g.color||"#CAFF4D",color:"#0A0A0B"}}>
                  {g.avatar_url ? <img src={g.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : (g.player_name||"?").split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
              </div>
              <span style={{fontSize:9,fontWeight:600,color:"#787C8A",maxWidth:50,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center"}}>{(g.player_name||"?").split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live games */}
      {liveNow.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#EF4444",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#EF4444",animation:"blink 1.2s infinite",display:"inline-block"}}/> LIVE ARA
          </div>
          {liveNow.map(g=><LiveGameCard key={g.id} game={g}/>)}
        </div>
      )}

      {/* Recent games */}
      {recent.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:8}}>PARTIDES RECENTS</div>
          {recent.map(g=><LiveGameCard key={g.id} game={g}/>)}
        </div>
      )}

      {liveNow.length === 0 && recent.length === 0 && (
        <div className="card" style={{textAlign:"center",padding:"32px 16px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,color:"#555761"}}><Flag size={32}/></div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:".04em",marginBottom:6}}>Sense partides ara mateix</div>
          <div style={{fontSize:12,color:"#555761"}}>Activa la retransmissió en directe quan juguis</div>
        </div>
      )}

      {!user && (
        <div style={{background:"rgba(202,255,77,.06)",border:"1px solid rgba(202,255,77,.2)",borderRadius:10,padding:"13px 14px",marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{fontSize:12,color:"#787C8A"}}>Crea un compte per retransmetre les teves partides</div>
          <button className="btn btn-primary btn-sm" style={{borderRadius:100,padding:"7px 14px",fontSize:11,width:"auto",flexShrink:0}} onClick={openAuth}>Uneix-te →</button>
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
function ProfileScreen({ user, userPts, setScreen, lang, onAvatarChange, history, setUser }) {
  const tl = (k,v={}) => t(lang,k,v);
  const profile = PLAYER_PROFILE;
  const tier = getTier(userPts);
  const nextTier = TIERS[TIERS.findIndex(t=>t.id===tier.id)+1];
  const pct = getTierPct(userPts);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editClub, setEditClub] = useState(user?.club || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { name: editName.trim(), club: editClub.trim() } });
    if (setUser) setUser(prev => ({ ...prev, name: editName.trim(), club: editClub.trim() }));
    setSaving(false);
    setEditMode(false);
  };

  const myGames = (history||[]).filter(g => g.players?.some(p => p.isMe));
  const hasRealGames = myGames.length > 0;
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
  const realBestCourses = Object.values(courseMap)
    .map(c => ({ name: c.name, played: c.diffs.length, best: Math.min(...c.diffs), avg: +(c.diffs.reduce((a,b)=>a+b,0)/c.diffs.length).toFixed(1) }))
    .sort((a,b) => a.best - b.best)
    .slice(0, 4);
  const noDataMsg = lang==='en'?'Start playing to see your stats':lang==='es'?'Comienza a jugar para ver tus estadísticas':'Comença a jugar per veure les teves estadístiques';

  const scoreTrend = hasRealGames ? trendData : profile.trend;
  const bestCourses = hasRealGames ? realBestCourses : profile.bestCourses;
  const realDist = {eagle:0,birdie:0,par:0,bogey:0,double:0,triple:0};
  if (hasRealGames) {
    myGames.forEach(g=>{
      const me=g.players.find(p=>p.isMe); if(!me) return;
      (g.scores||[]).forEach(h=>{
        const s=h.playerScores?.[me.id]; if(s===null||s===undefined) return;
        const d=s-h.par;
        if(d<=-2) realDist.eagle++; else if(d===-1) realDist.birdie++; else if(d===0) realDist.par++;
        else if(d===1) realDist.bogey++; else if(d===2) realDist.double++; else realDist.triple++;
      });
    });
  }
  const dist = hasRealGames ? realDist : profile.dist;

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
          {user && !editMode && (
            <button onClick={()=>{setEditName(user.name||"");setEditClub(user.club||"");setEditMode(true);}}
              style={{marginTop:8,background:"none",border:"1px solid #222327",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#787C8A",cursor:"pointer",letterSpacing:".06em",textTransform:"uppercase"}}>
              Editar →
            </button>
          )}
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

      {/* Edit form */}
      {user && editMode && (
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#555761",marginBottom:12}}>Editar Perfil</div>
          <div style={{marginBottom:10}}>
            <span className="label">Nom</span>
            <input className="inp" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="El teu nom" autoFocus/>
          </div>
          <div style={{marginBottom:14}}>
            <span className="label">Club</span>
            <input className="inp" value={editClub} onChange={e=>setEditClub(e.target.value)} placeholder="El teu club (opcional)"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-primary" style={{fontSize:13}} onClick={handleSaveProfile} disabled={saving||!editName.trim()}>
              {saving?"Guardant…":"Guardar"}
            </button>
            <button className="btn btn-ghost" style={{fontSize:13,width:"auto",padding:"15px 20px"}} onClick={()=>setEditMode(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

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
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:hasRealGames?12:4}}>
        {[
          {l:tl("stat_games"), v:hasRealGames?myGames.length:profile.games},
          {l:tl("stat_best"),  v:hasRealGames?(bestDiff!==null?(bestDiff>0?`+${bestDiff}`:bestDiff===0?"E":bestDiff):"—"):`${profile.hcp}`},
          {l:tl("stat_holes"), v:hasRealGames?(myGames.reduce((a,g)=>a+(g.scores?.length||0),0)||"—"):profile.games*9},
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#CAFF4D",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555761",textTransform:"uppercase",letterSpacing:".06em",marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>
      {!hasRealGames && <div style={{textAlign:"center",fontSize:10,color:"#555761",marginBottom:12,fontStyle:"italic"}}>{noDataMsg}</div>}

      {/* Score trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:!hasRealGames?4:12}}>{tl("profile_score_trend")}</div>
        {!hasRealGames && <div style={{fontSize:10,color:"#555761",fontStyle:"italic",marginBottom:8,textAlign:"center"}}>{noDataMsg}</div>}
        {scoreTrend.length >= 2 && <>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:56,marginBottom:6}}>
            {scoreTrend.map((r,i) => {
              const worst = Math.max(...scoreTrend.map(x=>x.s));
              const best  = Math.min(...scoreTrend.map(x=>x.s));
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
            <div style={{fontSize:8,color:"#555761"}}>{scoreTrend[0].date}</div>
            <div style={{fontSize:8,color:"#555761"}}>{scoreTrend[scoreTrend.length-1].date}</div>
          </div>
        </>}
      </div>

      {/* HCP Trend */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:!hasRealGames?4:12}}>{tl("profile_hcp_trend")}</div>
        {!hasRealGames && <div style={{fontSize:10,color:"#555761",fontStyle:"italic",marginBottom:8,textAlign:"center"}}>{noDataMsg}</div>}
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:64,marginBottom:4}}>
          {profile.hcpHist.map((pt,i)=>{
            const vals=profile.hcpHist.map(x=>x.v);
            const maxV=Math.max(...vals), minV=Math.min(...vals);
            const range=maxV-minV||1;
            const h=Math.round(((maxV-pt.v)/range)*44)+8;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                <div style={{fontSize:7,color:"#60A5FA",fontWeight:700}}>{pt.v}</div>
                <div style={{width:"100%",background:"#60A5FA",borderRadius:"2px 2px 0 0",height:h,opacity:.7}}/>
                <div style={{fontSize:7,color:"#555761"}}>{pt.m}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score distribution */}
      <div className="card" style={{marginBottom:12,padding:"14px"}}>
        <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:!hasRealGames?4:12}}>{tl("profile_dist")}</div>
        {!hasRealGames && <div style={{fontSize:10,color:"#555761",fontStyle:"italic",marginBottom:8,textAlign:"center"}}>{noDataMsg}</div>}
        {(()=>{
          const total=Object.values(dist).reduce((a,b)=>a+b,0)||1;
          return [
            {l:"Eagle+",v:dist.eagle,c:"#FBBF24"},
            {l:"Birdie", v:dist.birdie,c:"#60A5FA"},
            {l:"Par",    v:dist.par,  c:"#CAFF4D"},
            {l:"Bogey",  v:dist.bogey, c:"#9CA3AF"},
            {l:"Double", v:dist.double,c:"#EF4444"},
            {l:"Triple+",v:dist.triple,c:"#991B1B"},
          ].map(r=>(
            <div key={r.l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:46,fontSize:9,color:r.c,fontWeight:700,textAlign:"right",flexShrink:0}}>{r.l}</div>
              <div style={{flex:1,background:"#111214",borderRadius:3,height:7,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round((r.v/total)*100)}%`,background:r.c,borderRadius:3}}/>
              </div>
              <div style={{width:22,fontSize:9,color:"#555761",textAlign:"right",flexShrink:0}}>{r.v}</div>
            </div>
          ));
        })()}
      </div>

      {/* Best courses */}
      {bestCourses.length > 0 && (
        <div className="card" style={{marginBottom:12,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:"#555761",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>{tl("profile_best_courses")}</div>
            {!hasRealGames && <div style={{fontSize:9,color:"#555761",fontStyle:"italic"}}>{noDataMsg}</div>}
          </div>
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
function AuthModal({ onClose, onAuth, lang, initialMode="register" }) {
  const tl = (k,v={}) => t(lang,k,v);
  const [mode, setMode] = useState(initialMode);
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
      onAuth({ id: u.id, name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "" });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setErr(error.message); setLoading(false); return; }
      const u = data.user;
      onAuth({ id: u.id, name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "" });
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
  const [authMode, setAuthMode] = useState("register");
  const [toast, setToast] = useState("");
  const [gameData, setGameData] = useState(() => {
    try { const s = localStorage.getItem('pc_gameData'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [lastGame, setLastGame] = useState(null);
  const [prevPts, setPrevPts] = useState(0);
  const [liveGameId, setLiveGameId] = useState(null); // Supabase row id for live game
  const [activityFeed, setActivityFeed] = useState([]);
  const [liveGames, setLiveGames]       = useState([]);
  const leads = useRef([]);
  const liveDebounce = useRef(null);

  useEffect(() => {
    // Fetch activity feed (all recent games for the public feed)
    supabase.from("games").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setActivityFeed(data.map(mapGameToFeedItem));
      });

    // Fetch recent games (live + finished) for Live screen
    supabase.from("games").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data?.length) setLiveGames(data);
      });

    // Real-time subscription for new games
    const channel = supabase
      .channel("games-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "games" }, (payload) => {
        setActivityFeed(prev => [mapGameToFeedItem(payload.new), ...prev].slice(0, 20));
        setLiveGames(prev => [payload.new, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games" }, (payload) => {
        setLiveGames(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ id: u.id, name: u.user_metadata?.name || u.email.split("@")[0], email: u.email, club: u.user_metadata?.club || "", avatarUrl: u.user_metadata?.avatar_url || null });
        // Scope games query to this user's games only
        supabase.from("games").select("*").eq("user_id", u.id).order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (error) { console.error("P&C: Error loading history:", error); return; }
            if (data) {
              setHistory(data.map(g => ({ id: g.id, course: g.course_name, date: g.date, mode: g.game_mode, players: g.players, scores: g.scores })));
              setUserPts(data.reduce((sum, g) => { const me = (g.players||[]).find(p => p.isMe); return sum + (me?.points || 0); }, 0));
            }
          });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const openAuth = (mode="register") => { setAuthMode(mode); setShowAuth(true); };

  const handleAvatarChange = async (file) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    // Compress to 200x200 JPEG and store as base64 in user_metadata (no storage bucket needed)
    const dataUrl = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200; canvas.height = 200;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        const ox = (img.width - s) / 2, oy = (img.height - s) / 2;
        ctx.drawImage(img, ox, oy, s, s, 0, 0, 200, 200);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = URL.createObjectURL(file);
    });
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: dataUrl } });
    if (error) { showToast("Error: " + error.message); return; }
    setUser(prev => ({ ...prev, avatarUrl: dataUrl }));
    showToast("Foto de perfil actualitzada! ✓");
  };

  const handlePhotoUpload = async (file, caption, label, gameId) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const uid = authData.user.id;
    const ext = file.name.split(".").pop();
    const path = `${uid}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("game-images").upload(path, file);
    if (error) { console.error("P&C: photo upload error:", error); showToast("Error: " + error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("game-images").getPublicUrl(path);
    await supabase.from("game_images").insert({
      user_id: uid,
      game_id: gameId || null,
      url: publicUrl,
      caption,
      label,
      player_name: user?.name || "",
      course_name: "",
    });
    showToast("Foto compartida! 📸");
  };

  const handleGameDelete = async () => {
    if (liveGameId) {
      await supabase.from("games").update({ is_live: false }).eq("id", liveGameId);
      setLiveGameId(null);
    }
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

  const handleAuth = async (u) => {
    setUser(u);
    setShowAuth(false);
    const greet = lang==="en"?`👋 Welcome, ${u.name.split(" ")[0]}!`:lang==="es"?`👋 Bienvenido/a, ${u.name.split(" ")[0]}!`:`👋 Benvingut/da, ${u.name.split(" ")[0]}!`;
    showToast(greet);
    const { data: games } = await supabase.from("games").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
    if (games?.length) {
      setHistory(games.map(g => ({ id: g.id, course: g.course_name, date: g.date, mode: g.game_mode, players: g.players, scores: g.scores })));
      setUserPts(games.reduce((sum, g) => { const me = (g.players||[]).find(p => p.isMe); return sum + (me?.points || 0); }, 0));
    }
  };

  const handleGameStart = async (data) => {
    localStorage.setItem('pc_gameData', JSON.stringify(data));
    localStorage.setItem('pc_screen', 'scorecard');
    setGameData(data);
    setScreen("scorecard");

    // If live share enabled and user is logged in, insert a live row immediately
    if (data.liveShare && user?.id) {
      const me = data.players.find(p => p.isMe) || data.players[0];
      const { data: row, error: liveErr } = await supabase.from("games").insert({
        user_id: user.id,
        course_name: data.course.name,
        player_name: me.name,
        players: data.players,
        scores: Array.from({length: data.course.holes}, (_,i) => ({
          hole: i+1, par: Math.round(data.course.par / data.course.holes),
          playerScores: Object.fromEntries(data.players.map(p => [p.id, null])),
        })),
        is_live: true,
        current_hole: 1,
        holes: data.course.holes,
        par: data.course.par,
        score_total: 0,
        date: data.date,
        game_mode: data.gameMode,
      }).select().single();
      if (liveErr) { console.error("P&C: live game insert error:", liveErr); }
      else if (row) {
        setLiveGameId(row.id);
        setLiveGames(prev => [row, ...prev].slice(0, 10));
      }
    }
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

    let dbGameId = null;
    if (user?.id) {
      try {
        if (liveGameId) {
          const { error } = await supabase.from("games").update({
            players: game.players,
            scores: game.scores,
            is_live: false,
            current_hole: game.scores.length,
          }).eq("id", liveGameId);
          if (error) throw error;
          dbGameId = liveGameId;
          setLiveGames(prev => prev.map(g => g.id === liveGameId ? {...g, is_live: false, players: game.players, scores: game.scores} : g));
          setLiveGameId(null);
        } else {
          const { data: rows, error } = await supabase.from("games").insert({
            user_id: user.id,
            course_name: game.course,
            date: game.date,
            game_mode: game.mode,
            players: game.players,
            scores: game.scores,
          }).select();
          if (error) throw error;
          dbGameId = rows?.[0]?.id || null;
        }
        // Reload history from DB so it survives refresh
        const { data: games, error: loadErr } = await supabase.from("games").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (loadErr) console.error("P&C: reload history error:", loadErr);
        if (games) {
          setHistory(games.map(g => ({ id: g.id, course: g.course_name, date: g.date, mode: g.game_mode, players: g.players, scores: g.scores })));
          setUserPts(games.reduce((sum, g) => { const me = (g.players||[]).find(p => p.isMe); return sum + (me?.points || 0); }, 0));
        }
        showToast("Partida guardada! ✓");
      } catch(e) {
        console.error("P&C: Error saving game:", e);
        alert("Error guardant la partida:\n" + (e.message || JSON.stringify(e)));
      }
    }
    setLastGame({...game, supabaseId: dbGameId});
    // Add finished game to live feed immediately (for "recent" section)
    const me2 = game.players.find(p => p.isMe);
    setLiveGames(prev => [{
      id: dbGameId || game.id,
      player_name: me2?.name || "",
      course_name: game.course,
      holes: game.scores.length,
      par: gameData.course.par,
      score_total: me2?.diff ?? 0,
      is_live: false,
      players: game.players,
      current_hole: game.scores.length,
      created_at: new Date().toISOString(),
    }, ...prev].slice(0, 20));

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

        {screen==="home"       && <HomeScreen       user={user} userPts={userPts} history={history} setScreen={setScreenSafe} openAuth={openAuth} leads={leads} lang={lang} activeGame={gameData} onResumeGame={()=>setScreen("scorecard")} activityFeed={activityFeed} liveGames={liveGames}/>}
        {screen==="game-setup" && <GameSetupScreen   user={user} openAuth={openAuth} onStart={handleGameStart} lang={lang}/>}
        {screen==="scorecard"  && gameData && <ScorecardScreen gameData={gameData} onFinish={handleGameFinish} onDelete={handleGameDelete} user={user} openAuth={openAuth} lang={lang} liveGameId={liveGameId} onLiveUpdate={(scores, curHole) => {
          if (!liveGameId) return;
          clearTimeout(liveDebounce.current);
          liveDebounce.current = setTimeout(async () => {
            const mePlayer = gameData.players.find(p => p.isMe);
            const scoreTot = mePlayer ? scores.reduce((a,h) => { const s=h.playerScores[mePlayer.id]; return s!=null?a+(s-h.par):a; }, 0) : 0;
            await supabase.from("games").update({
              scores,
              current_hole: curHole + 1,
              score_total: scoreTot,
            }).eq("id", liveGameId);
          }, 1500);
        }}/>}
        {screen==="summary"    && lastGame && <SummaryScreen   game={lastGame} userPts={userPts} prevPts={prevPts} setScreen={setScreenSafe} openAuth={openAuth} user={user} lang={lang} onPhotoUpload={handlePhotoUpload}/>}
        {screen==="ranking"    && <RankingScreen    user={user} openAuth={openAuth} setScreen={setScreenSafe} lang={lang}/>}
        {screen==="live"       && <LiveScreen        user={user} openAuth={openAuth} lang={lang} liveGames={liveGames}/>}
        {screen==="tournaments" && <TournamentsScreen user={user} openAuth={openAuth} lang={lang}/>}
        {screen==="profile"    && <ProfileScreen    user={user} userPts={userPts} setScreen={setScreenSafe} lang={lang} onAvatarChange={handleAvatarChange} history={history} setUser={setUser}/>}

        {!isGameFlow && <BottomNav screen={screen} setScreen={setScreenSafe} lang={lang}/>}

        {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth} lang={lang} initialMode={authMode}/>}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
