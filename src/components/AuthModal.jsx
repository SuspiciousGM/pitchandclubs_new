import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { t } from '../data/i18n.js';

export default function AuthModal({ onClose, onAuth, lang, initialMode="register" }) {
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
      onAuth({ id: u.id, name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "", hcp: u.user_metadata?.hcp ?? null, license: u.user_metadata?.license || "" });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setErr(error.message); setLoading(false); return; }
      const u = data.user;
      onAuth({ id: u.id, name: u.user_metadata?.name || email.split("@")[0], email: u.email, club: u.user_metadata?.club || "", hcp: u.user_metadata?.hcp ?? null, license: u.user_metadata?.license || "" });
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

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"#1A1B1E"}}/>
          <span style={{fontSize:11,color:"#555761",fontWeight:500}}>{lang==="en"?"or":lang==="es"?"o":"o"}</span>
          <div style={{flex:1,height:1,background:"#1A1B1E"}}/>
        </div>

        {/* Google OAuth */}
        <button
          onClick={async()=>{
            const { error } = await supabase.auth.signInWithOAuth({
              provider:"google",
              options:{ redirectTo: window.location.origin + '/' }
            });
            if (error) setErr("Google: " + error.message);
          }}
          style={{width:"100%",padding:"12px",borderRadius:12,border:"1px solid #2a2a30",background:"#1A1B1E",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14}}>
          {/* Google "G" logo */}
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          {lang==="en"?"Continue with Google":lang==="es"?"Continuar con Google":"Continua amb Google"}
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
