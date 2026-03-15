import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "./supabaseClient";
import { mapGameToFeedItem, calcPCPoints } from "./utils/helpers";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import AuthModal from "./components/AuthModal";
import HomeScreen from "./screens/HomeScreen";
import GameSetupScreen from "./screens/GameSetupScreen";
import ScorecardScreen from "./screens/ScorecardScreen";
import SummaryScreen, { ShareCard } from "./screens/SummaryScreen";
import RankingScreen from "./screens/RankingScreen";
import TournamentsScreen from "./screens/TournamentsScreen";
import LiveScreen, { LiveGameView } from "./screens/LiveScreen";
import ShopScreen from "./screens/ShopScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SharedGameRoute from "./screens/SharedGameRoute";

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
  background:#0A0A0B;
  background-image:
    repeating-linear-gradient(
      135deg,
      rgba(202,255,77,0.018) 0px,
      rgba(202,255,77,0.018) 1px,
      transparent 1px,
      transparent 8px
    ),
    radial-gradient(ellipse at 20% 50%, rgba(34,85,34,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(20,60,20,0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(40,90,40,0.03) 0%, transparent 55%);
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

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem('pc_screen');
    const hasGame = !!localStorage.getItem('pc_gameData');
    return (saved === 'scorecard' && hasGame) ? 'scorecard' : 'home';
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
  const [liveGameId, setLiveGameId] = useState(() => localStorage.getItem('pc_liveGameId') || null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [liveGames, setLiveGames]       = useState([]);
  const [selectedLiveGame, setSelectedLiveGame] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [follows, setFollows] = useState([]);
  const [followsNames, setFollowsNames] = useState({}); // {uid: name}
  const [liveShareToken, setLiveShareToken] = useState(() => localStorage.getItem('pc_liveShareToken') || null);
  const [roundPhoto, setRoundPhoto] = useState(null);
  const [roundPhotoUrl, setRoundPhotoUrl] = useState(null);
  const shareCardRef = useRef(null);
  const leads = useRef([]);
  const liveDebounce = useRef(null);

  useEffect(() => {
    if (!roundPhoto) { setRoundPhotoUrl(null); return; }
    const url = URL.createObjectURL(roundPhoto);
    setRoundPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [roundPhoto]);

  // PWA install prompt
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Fetch activity feed (all recent games for the public feed)
    supabase.from("games").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setActivityFeed(data.map(mapGameToFeedItem));
      });

    // Fetch only active live games for Live screen
    supabase.from("games").select("*").eq("is_live", true).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data?.length) setLiveGames(data);
      });

    // Real-time subscription for new games
    const channel = supabase
      .channel("games-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "games" }, (payload) => {
        setActivityFeed(prev => [mapGameToFeedItem(payload.new), ...prev].slice(0, 20));
        if (payload.new.is_live) setLiveGames(prev => [payload.new, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games" }, (payload) => {
        // Remove from live list if game was just finished
        if (!payload.new.is_live) {
          setLiveGames(prev => prev.filter(g => g.id !== payload.new.id));
        } else {
          setLiveGames(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Re-fetch live games whenever the user navigates to the live screen
  useEffect(() => {
    if (screen === "live") {
      supabase.from("games").select("*").eq("is_live", true)
        .order("created_at", { ascending: false }).limit(20)
        .then(({ data }) => { if (data) setLiveGames(data); });
    }
  }, [screen]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const googleName = u.user_metadata?.full_name || u.user_metadata?.name || u.email.split("@")[0];

        // Profiles table is the source of truth for name and avatar.
        // Manually edited values must never be overwritten by the OAuth provider.
        const { data: profile } = await supabase.from("profiles").select("name,club,avatar_url").eq("id", u.id).single();
        const uName = profile?.name || googleName;
        const uClub = profile?.club || u.user_metadata?.club || "";
        const googlePicture = u.user_metadata?.picture || u.user_metadata?.avatar_url || null;
        const uAvatar = profile?.avatar_url || googlePicture;

        setUser({ id: u.id, name: uName, email: u.email, club: uClub, hcp: u.user_metadata?.hcp ?? null, license: u.user_metadata?.license || "", avatarUrl: uAvatar });
        // Only insert the profile row the first time — never overwrite custom-edited fields
        if (!profile) {
          supabase.from("profiles").insert({ id: u.id, name: uName, club: uClub, avatar_url: googlePicture }).then(() => {});
        }
        supabase.from("games").select("*").eq("user_id", u.id).order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (error) return;
            if (data) {
              setHistory(data.map(g => ({ id: g.id, course: g.course_name, date: g.date, mode: g.game_mode, players: g.players, scores: g.scores })));
              setUserPts(data.reduce((sum, g) => { const me = (g.players||[]).find(p => p.isMe); return sum + (me?.points || 0); }, 0));
            }
          });
        // Load follows + resolve names on every session restore
        supabase.from("follows").select("following_id").eq("follower_id", u.id).then(async ({ data }) => {
          if (!data?.length) return;
          const ids = data.map(f => f.following_id);
          setFollows(ids);
          const { data: gamesData } = await supabase.from("games").select("user_id,player_name").in("user_id", ids);
          if (gamesData) {
            const names = {};
            gamesData.forEach(g => { if (g.user_id && g.player_name) names[g.user_id] = g.player_name; });
            setFollowsNames(names);
          }
        });
      } else {
        setUser(null);
        setHistory([]);
        setUserPts(0);
        setFollows([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const openAuth = (mode="register") => { setAuthMode(mode); setShowAuth(true); };

  const handleAvatarChange = async (file) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const uid = authData.user.id;
    // Compress to 400x400 JPEG blob
    const blob = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        const ox = (img.width - s) / 2, oy = (img.height - s) / 2;
        ctx.drawImage(img, ox, oy, s, s, 0, 0, 400, 400);
        canvas.toBlob(resolve, "image/jpeg", 0.82);
      };
      img.src = URL.createObjectURL(file);
    });
    // Upload to Supabase Storage avatars bucket
    const path = `${uid}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, blob, {
      contentType: "image/jpeg", upsert: true,
    });
    if (uploadError) { showToast("Error pujant la foto: " + uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = publicUrl + "?t=" + Date.now();
    // Persist in profiles table (source of truth) and user_metadata
    await supabase.from("profiles").upsert({ id: uid, avatar_url: avatarUrl }, { onConflict: "id" });
    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    setUser(prev => ({ ...prev, avatarUrl }));
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
      setLiveGames(prev => prev.filter(g => g.id !== liveGameId));
      setLiveGameId(null);
    }
    localStorage.removeItem('pc_gameData');
    localStorage.removeItem('pc_scores');
    localStorage.removeItem('pc_curHole');
    localStorage.removeItem('pc_screen');
    localStorage.removeItem('pc_liveGameId');
    localStorage.removeItem('pc_liveShareToken');
    localStorage.removeItem('pc_gameStartedAt');
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
    // Load follows + resolve names
    const { data: followData } = await supabase.from("follows").select("following_id").eq("follower_id", u.id);
    if (followData?.length) {
      const ids = followData.map(f => f.following_id);
      setFollows(ids);
      const { data: fGames } = await supabase.from("games").select("user_id,player_name").in("user_id", ids);
      if (fGames) { const n={}; fGames.forEach(g=>{if(g.user_id&&g.player_name)n[g.user_id]=g.player_name;}); setFollowsNames(n); }
    }
  };

  const handleFollow = async (followingId, nameHint) => {
    if (!user) { openAuth(); return; }
    if (follows.includes(followingId)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", followingId);
      setFollows(f => f.filter(id => id !== followingId));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: followingId });
      setFollows(f => [...f, followingId]);
      if (nameHint) setFollowsNames(n => ({...n, [followingId]: nameHint}));
      else {
        const { data } = await supabase.from("games").select("player_name").eq("user_id", followingId).limit(1).single();
        if (data?.player_name) setFollowsNames(n => ({...n, [followingId]: data.player_name}));
      }
    }
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) { showToast("Afegeix VITE_VAPID_PUBLIC_KEY a .env"); return; }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("push_subscriptions").upsert({ user_id: authData.user.id, subscription: sub.toJSON() });
      showToast("Notificacions activades!");
    } catch(e) { console.error("Push subscription error:", e); }
  };

  const handleGameStart = async (data) => {
    localStorage.setItem('pc_gameData', JSON.stringify(data));
    localStorage.setItem('pc_screen', 'scorecard');
    localStorage.setItem('pc_gameStartedAt', String(Date.now()));
    setGameData(data);
    setScreen("scorecard");

    // Insert a live game row for logged-in users (enables spectators + live linking)
    if (user?.id) {
      const me = data.players.find(p => p.isMe) || data.players[0];
      const shareToken = crypto.randomUUID();
      const { data: row, error: liveErr } = await supabase.from("games").insert({
        user_id: user.id,
        course_name: data.course.name,
        player_name: me.name,
        avatar_url: user?.avatarUrl || null,
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
        share_token: shareToken,
        share_mode: "play",
      }).select().single();
      if (liveErr) { console.error("P&C: live game insert error:", liveErr); }
      else if (row) {
        setLiveGameId(row.id);
        setLiveShareToken(row.share_token || shareToken);
        localStorage.setItem('pc_liveGameId', row.id);
        localStorage.setItem('pc_liveShareToken', row.share_token || shareToken);
        setLiveGames(prev => [row, ...prev].slice(0, 10));
      }
    }
  };

  const handleGameFinish = async (scores, saveAndExit=false) => {
    if (!gameData) return;
    if (saveAndExit) {
      localStorage.setItem('pc_scores', JSON.stringify(scores));
      setScreen("home");
      return;
    }

    // ── Anti-fraud checks ──────────────────────────────────────────
    const fraudFlags = [];

    // Rule 1: Minimum game duration — 18 holes must take ≥ 40 min
    const startedAt = parseInt(localStorage.getItem('pc_gameStartedAt') || '0');
    const elapsedMin = startedAt ? (Date.now() - startedAt) / 60000 : 999;
    if (startedAt && elapsedMin < 40) {
      fraudFlags.push({ code: 'SPEED', detail: `${Math.round(elapsedMin)}m` });
    }

    // Crazy score: flag if avg diff/hole < -1.5 (≈ all hole-in-ones, physically impossible)
    const mePre = gameData.players.find(p => p.isMe);
    if (mePre) {
      const holesScored = scores.filter(h => h.playerScores[mePre.id] != null).length;
      const rawDiff = scores.reduce((a,h) => { const s=h.playerScores[mePre.id]; return s!=null?a+(s-h.par):a; }, 0);
      if (holesScored >= 3 && rawDiff / holesScored < -1.5) {
        fraudFlags.push({ code: 'SCORE', detail: `${rawDiff} en ${holesScored} forats` });
      }
    }

    // Rule 2: Solo play limits — max 1 solo/day, max 2 solo/week (logged-in only)
    const hasRegisteredCoPlayer = gameData.players.some(p => !p.isMe && p.isRegistered);
    if (user?.id && !hasRegisteredCoPlayer) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0, 10);
        const { data: recentGames } = await supabase
          .from('games').select('date, players').eq('user_id', user.id)
          .eq('is_live', false).gte('date', weekAgo);
        const soloGames = (recentGames||[]).filter(g => !g.players?.some(p => !p.isMe && p.isRegistered));
        const soloToday = soloGames.filter(g => g.date === today).length;
        if (soloToday >= 1) fraudFlags.push({ code: 'SOLO_DAY', detail: `${soloToday+1} partides sol·les avui` });
        else if (soloGames.length >= 2) fraudFlags.push({ code: 'SOLO_WEEK', detail: `${soloGames.length+1} partides sol·les aquesta setmana` });
      } catch(e) { /* non-blocking */ }
    }

    const pointsBlocked = fraudFlags.length > 0;
    // ──────────────────────────────────────────────────────────────

    const totalPar = gameData.course.par;
    const players = gameData.players.map(p => {
      const pPts = pointsBlocked ? 0 : scores.reduce((a,h) => { const s=h.playerScores[p.id]; return a+(s!==null?calcPCPoints(s,h.par):0); },0) + 8;
      const pScore = scores.reduce((a,h)=>a+(h.playerScores[p.id]??h.par),0);
      return {...p, score:pScore, diff:pScore-totalPar, points:pPts, hcp: p.isMe ? (user?.hcp ?? null) : (p.hcp ?? null)};
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
          setLiveGameId(null);
        } else {
          const { data: rows, error } = await supabase.from("games").insert({
            user_id: user.id,
            course_name: game.course,
            player_name: user?.name || "",
            avatar_url: user?.avatarUrl || null,
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
        // Save copies for other registered players via secure RPC
        // (direct cross-user INSERT is blocked by RLS; the function validates the host)
        const otherRegistered = gameData.players.filter(p => !p.isMe && p.userId);
        for (const rp of otherRegistered) {
          await supabase.rpc('save_linked_game', {
            p_user_id:   rp.userId,
            p_course:    game.course,
            p_date:      game.date,
            p_game_mode: game.mode,
            p_players:   game.players,
            p_scores:    game.scores,
          }).then(({error}) => { if (error) console.warn("P&C: linked player save error:", error.message); });
        }
        // Notify followers
        supabase.functions.invoke('notify-followers', { body: { game: {...game, players: game.players.map(p => ({...p, user_id: p.isMe ? user.id : null})) } } }).catch(()=>{});
      } catch(e) {
        console.error("P&C: Error saving game:", e);
        alert("Error guardant la partida:\n" + (e.message || JSON.stringify(e)));
      }
    }
    setLastGame({...game, supabaseId: dbGameId, fraudFlags});
    // Remove from live list + clear active game state
    setLiveGames(prev => prev.filter(g => g.id !== liveGameId));
    setGameData(null);

    localStorage.removeItem('pc_gameData');
    localStorage.removeItem('pc_scores');
    localStorage.removeItem('pc_curHole');
    localStorage.removeItem('pc_screen');
    localStorage.removeItem('pc_liveGameId');
    localStorage.removeItem('pc_liveShareToken');
    localStorage.removeItem('pc_gameStartedAt');
    setScreen("summary");
  };

  const setScreenSafe = (s) => { setScreen(s); window.scrollTo(0,0); };
  const isGameFlow = screen==="game-setup"||screen==="scorecard"||screen==="summary";

  // Public share route: /game/:token
  const sharedGameToken = window.location.pathname.match(/^\/game\/([^/]+)/)?.[1];
  if (sharedGameToken) return <SharedGameRoute token={sharedGameToken}/>;

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

        {screen==="home"       && <HomeScreen       user={user} userPts={userPts} history={history} setScreen={setScreenSafe} openAuth={openAuth} leads={leads} lang={lang} activeGame={gameData} onResumeGame={()=>setScreen("scorecard")} activityFeed={activityFeed} liveGames={liveGames} onSelectGame={g=>{setSelectedLiveGame(g);setScreenSafe("live");}}/>}
        {screen==="game-setup" && <GameSetupScreen   user={user} openAuth={openAuth} onStart={handleGameStart} lang={lang}/>}
        {screen==="scorecard"  && gameData && <ScorecardScreen gameData={gameData} onFinish={handleGameFinish} onDelete={handleGameDelete} user={user} openAuth={openAuth} lang={lang} liveGameId={liveGameId} onPhotoCapture={setRoundPhoto} liveShareToken={liveShareToken} onLiveUpdate={(scores, curHole) => {
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
        {screen==="summary"    && lastGame && <SummaryScreen   game={lastGame} userPts={userPts} prevPts={prevPts} setScreen={setScreenSafe} openAuth={openAuth} user={user} lang={lang} shareCardRef={shareCardRef} roundPhoto={roundPhotoUrl}/>}
        {screen==="ranking"    && <RankingScreen    user={user} openAuth={openAuth} setScreen={setScreenSafe} lang={lang} follows={follows} onFollow={handleFollow}/>}
        {screen==="live" && !selectedLiveGame && <LiveScreen user={user} openAuth={openAuth} lang={lang} liveGames={liveGames} setLiveGames={setLiveGames} onSelectGame={user?setSelectedLiveGame:null} setScreen={setScreenSafe}/>}
        {screen==="live" && selectedLiveGame && <LiveGameView game={selectedLiveGame} liveGames={liveGames} onClose={()=>setSelectedLiveGame(null)} lang={lang} user={user} openAuth={openAuth} follows={follows} onFollow={handleFollow}/>}
        {screen==="tournaments" && <TournamentsScreen user={user} openAuth={openAuth} lang={lang}/>}
        {screen==="shop"       && <ShopScreen       openAuth={openAuth} user={user} lang={lang}/>}
        {screen==="profile"    && <ProfileScreen    user={user} userPts={userPts} setScreen={setScreenSafe} lang={lang} onAvatarChange={handleAvatarChange} history={history} setUser={setUser} follows={follows} followsNames={followsNames} onFollow={handleFollow} enableNotifications={enableNotifications}/>}

        {!isGameFlow && <BottomNav screen={screen} setScreen={setScreenSafe} lang={lang} gameData={gameData}/>}

        {/* Hidden ShareCard for Stories export */}
        {lastGame && <ShareCard game={lastGame} cardRef={shareCardRef} photo={roundPhotoUrl}/>}

        {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth} lang={lang} initialMode={authMode}/>}
        {toast && <div className="toast">{toast}</div>}

        {/* PWA install banner */}
        {installPrompt && (
          <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',width:'calc(100% - 32px)',maxWidth:398,background:'#1A1B1E',border:'1px solid rgba(202,255,77,.25)',borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,zIndex:400,boxShadow:'0 4px 24px rgba(0,0,0,.4)'}}>
            <div style={{fontSize:22,flexShrink:0}}>📱</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:"#CAFF4D",marginBottom:2}}>Instal·la P&C</div>
              <div style={{fontSize:11,color:"#787C8A",fontWeight:400}}>Afegeix a la pantalla d'inici per rebre notificacions</div>
            </div>
            <button onClick={()=>{installPrompt.prompt();setInstallPrompt(null);}} style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#CAFF4D',color:'#0A0A0B',fontSize:11,fontWeight:700,cursor:'pointer',flexShrink:0}}>
              Instal·la
            </button>
            <button onClick={()=>setInstallPrompt(null)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',padding:4,flexShrink:0,lineHeight:1}}>
              <X size={14}/>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
