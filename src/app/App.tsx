import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import React from 'react'; // Make sure this line exists!
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:        "#0F172A",
  surface:   "#1E293B",
  surfaceEl: "#273449",
  surfaceHi: "#2D3D52",
  border:    "rgba(148,163,184,0.08)",
  borderMd:  "rgba(148,163,184,0.14)",
  borderHi:  "rgba(148,163,184,0.22)",
  violet:    "#8B5CF6",
  blue:      "#3B82F6",
  violetDim: "rgba(139,92,246,0.12)",
  violetMid: "rgba(139,92,246,0.25)",
  grad:      "linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)",
  green:     "#34D399",
  greenDim:  "rgba(52,211,153,0.10)",
  red:       "#F87171",
  redDim:    "rgba(248,113,113,0.10)",
  amber:     "#F59E0B",
  tx1: "#F1F5F9",
  tx2: "#94A3B8",
  tx3: "#475569",
};

const FONT_DISPLAY = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";
const FONT_BODY    = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATS = [
  { id:"personal", symbol:"◈", color:"#9B8CF8", en:"Personal",  fr:"Personnel" },
  { id:"career",   symbol:"◆", color:"#4A90E2", en:"Career",    fr:"Carrière"  },
  { id:"health",   symbol:"◉", color:"#34D399", en:"Health",    fr:"Santé"     },
  { id:"finance",  symbol:"◎", color:"#F59E0B", en:"Finance",   fr:"Finance"   },
  { id:"love",     symbol:"♥", color:"#F472B6", en:"Love",      fr:"Amour"     },
];
const getCat = id => CATS.find(c=>c.id===id)||CATS[0];

// ─── i18n ─────────────────────────────────────────────────────────────────────
const STRINGS = {
  en:{
    appName:"AxisVault", tagline:"Lock in. Level up.",
    loginH:"Set goals you can't walk away from.",
    loginSub:"Write a commitment, lock it with a deadline. When the vault opens, there's no hiding — just a record of who you are.",
    google:"Continue with Google", signingIn:"Signing in…",
    terms:"By continuing you agree to our Terms & Privacy Policy.", loginErr:"Sign-in failed. Try again.",
    welcomeBack:"Welcome back", streak:"day streak",
    hero1:"What will you lock in", hero2:"today?",
    inputSub:"Write it clearly. Set a deadline. Once locked, it cannot change.",
    placeholder:"Describe your commitment…", deadline:"Deadline",
    lockVault:"Lock vault", viewVaults:"Vaults", signOut:"Sign out", category:"Category",
    irrevTitle:"This cannot be undone.",
    irrevSub:"Once locked, this vault is permanent. It opens on your deadline and asks for an answer.",
    typeCommit:"Type", toConfirm:"to confirm", cancel:"Cancel", lockItIn:"Lock it in", saving:"Locking…",
    unlocks:"Opens", locked:"Locked", timeIsUp:"Vault open", achieved:"Delivered", missed:"Missed",
    didYouAchieve:"Did you deliver on this commitment?",
    yes:"Yes, I delivered", no:"I fell short",
    addNote:"Add a reflection (optional)…",
    graceTitle:"Grace period active",
    graceSub:"Your deadline has passed. The vault will open automatically within the next 1 to 5 minutes once the server processes the transition. Sit tight.",
    elapsed:"elapsed", d:"d", h:"h", m:"m", s:"s",
    pinned:"Pinned", pin:"Pin", unpin:"Unpin",
    all:"All", active:"Active", open:"Open", done:"Done", missed_f:"Missed",
    noVaults:"No vaults yet. Lock your first commitment.", noFiltered:"Nothing here.",
    yourVaults:"Your vaults", newVault:"New vault",
    successRate:"Success rate", sortBy:"Sort", newest:"Newest", deadline_s:"Deadline",
    cats:{personal:"Personal",career:"Career",health:"Health",finance:"Finance",love:"Love"},
    congrats:["Every great achievement was once considered impossible. You proved them wrong.","You set the standard. Now raise it.","Discipline is choosing what you want most over what you want now.","The vault is open. The next one awaits.","Champions do what others won't. You just proved you're one."],
    encourage:["Every miss is data. The vault doesn't judge — it waits.","You showed up. That's more than most. Lock a new one.","Failure is a locked door you haven't found the key for yet.","The strongest commitments take the most attempts. Reset.","Not this time — but you're still here. That's the game."],
    toastLocked:"Vault locked 🔒", toastDelivered:"Commitment delivered ✓", toastMissed:"Marked as missed",
    signOutConfirmTitle:"Sign out?",
    signOutConfirmMsg:"You'll need to sign back in to access your vaults.",
    signOutConfirmYes:"Sign out", signOutConfirmNo:"Stay",
    menu:"Menu",
  },
  fr:{
    appName:"AxisVault", tagline:"Engage. Verrouille. Livre.",
    loginH:"Des objectifs dont tu ne peux pas te défiler.",
    loginSub:"Écris un engagement, verrouille-le avec une deadline. Quand le coffre s'ouvre, il n'y a plus de cachette — juste un bilan.",
    google:"Continuer avec Google", signingIn:"Connexion…",
    terms:"En continuant, tu acceptes nos Conditions & Politique de confidentialité.", loginErr:"Connexion échouée. Réessaie.",
    welcomeBack:"Bon retour", streak:"jours de suite",
    hero1:"Qu'est-ce que tu vas", hero2:"verrouiller aujourd'hui ?",
    inputSub:"Écris-le clairement. Fixe une deadline. Une fois verrouillé, plus de retour.",
    placeholder:"Décris ton engagement…", deadline:"Deadline",
    lockVault:"Verrouiller", viewVaults:"Coffres", signOut:"Déconnexion", category:"Catégorie",
    irrevTitle:"C'est irréversible.",
    irrevSub:"Une fois verrouillé, ce coffre est permanent. Il s'ouvre à la deadline et demande une réponse.",
    typeCommit:"Tape", toConfirm:"pour confirmer", cancel:"Annuler", lockItIn:"Verrouiller", saving:"Verrouillage…",
    unlocks:"S'ouvre le", locked:"Verrouillé", timeIsUp:"Coffre ouvert", achieved:"Livré", missed:"Raté",
    didYouAchieve:"As-tu tenu cet engagement ?",
    yes:"Oui, j'ai livré", no:"Je n'y suis pas arrivé",
    addNote:"Ajoute une réflexion (optionnel)…",
    graceTitle:"Période de grâce active",
    graceSub:"Ta deadline est passée. Le coffre s'ouvrira automatiquement dans 1 à 5 minutes, le temps que le serveur traite la transition. Patiente.",
    elapsed:"écoulé", d:"j", h:"h", m:"m", s:"s",
    pinned:"Épinglé", pin:"Épingler", unpin:"Désépingler",
    all:"Tous", active:"Actifs", open:"Ouverts", done:"Réussis", missed_f:"Ratés",
    noVaults:"Aucun coffre. Verrouille ton premier engagement.", noFiltered:"Rien ici.",
    yourVaults:"Mes coffres", newVault:"Nouveau coffre",
    successRate:"Taux de réussite", sortBy:"Trier", newest:"Récents", deadline_s:"Deadline",
    cats:{personal:"Personnel",career:"Carrière",health:"Santé",finance:"Finance",love:"Amour"},
    congrats:["Chaque grand succès était autrefois impossible. Tu viens de le prouver.","Tu as fixé la barre. Maintenant relève-la.","La discipline, c'est choisir ce que tu veux le plus.","Le coffre est ouvert. Le prochain t'attend.","Les champions font ce que les autres ne font pas. Tu viens de le prouver."],
    encourage:["Chaque raté est une donnée. Le coffre ne juge pas — il attend.","Tu t'es présenté. C'est plus que la plupart. Verrouilles-en un nouveau.","L'échec, c'est juste une porte fermée dont tu n'as pas encore trouvé la clé.","Les coffres les plus solides demandent le plus d'essais. Recommence.","Pas cette fois — mais tu es encore là. C'est tout le jeu."],
    toastLocked:"Coffre verrouillé 🔒", toastDelivered:"Engagement livré ✓", toastMissed:"Marqué comme raté",
    signOutConfirmTitle:"Se déconnecter ?",
    signOutConfirmMsg:"Tu devras te reconnecter pour accéder à tes coffres.",
    signOutConfirmYes:"Déconnexion", signOutConfirmNo:"Rester",
    menu:"Menu",
  },
};
const useT = lang => STRINGS[lang]||STRINGS.en;

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, width: w };
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3200);
  },[]);
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{position:"fixed",bottom:24,right:16,zIndex:999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",maxWidth:320}}>
        {toasts.map(t=>(
          <div key={t.id} style={{
            padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:FONT_BODY,
            background: t.type==="success"?T.green:t.type==="error"?T.red:T.surfaceHi,
            color:(t.type==="success"||t.type==="error")?"#fff":T.tx1,
            border:`1px solid ${t.type==="success"?"rgba(52,211,153,0.3)":t.type==="error"?"rgba(248,113,113,0.3)":T.borderMd}`,
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
            animation:"toastIn .25s cubic-bezier(0.34,1.4,0.64,1)",
            pointerEvents:"none",
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// ─── SIGN OUT CONFIRM MODAL ──────────────────────────────────────────────────
function SignOutModal({ onConfirm, onCancel, lang }) {
  const t = useT(lang);
  return (
    <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"rgba(15,23,42,0.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",animation:"fadeIn .18s ease"}}>
      <div style={{background:T.surface,border:`1px solid ${T.borderMd}`,borderRadius:18,padding:"28px 26px",maxWidth:360,width:"100%",boxShadow:"0 40px 80px rgba(0,0,0,0.65)",animation:"scaleIn .22s cubic-bezier(0.34,1.3,0.64,1)",fontFamily:FONT_BODY}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🚪</div>
        </div>
        <h2 style={{fontSize:17,fontWeight:800,color:T.tx1,textAlign:"center",marginBottom:8,letterSpacing:"-.02em"}}>{t.signOutConfirmTitle}</h2>
        <p style={{fontSize:13,color:T.tx2,textAlign:"center",lineHeight:1.6,marginBottom:22}}>{t.signOutConfirmMsg}</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:10,background:"rgba(148,163,184,0.08)",border:`1px solid ${T.border}`,color:T.tx2,fontFamily:FONT_BODY,fontSize:14,fontWeight:600,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(148,163,184,0.13)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(148,163,184,0.08)"}>{t.signOutConfirmNo}</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px",borderRadius:10,background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.25)",color:T.red,fontFamily:FONT_BODY,fontSize:14,fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.22)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(248,113,113,0.15)"}>{t.signOutConfirmYes}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:window.location.origin } });
}
async function fetchVaults(uid) {
  const { data } = await supabase.from("vaults").select("*").eq("uid",uid).order("created_at",{ascending:false});
  return data||[];
}
function watchVaults(uid, cb) {
  const ch = supabase
    .channel("vaults-" + uid)
    .on("postgres_changes",{event:"*",schema:"public",table:"vaults",filter:`uid=eq.${uid}`},
      () => { fetchVaults(uid).then(cb); })
    .subscribe((status, err) => {
      console.log("[realtime]", status, err||"");
    });
  fetchVaults(uid).then(cb);
  const pollId = setInterval(() => fetchVaults(uid).then(cb), 15000);
  return () => { supabase.removeChannel(ch); clearInterval(pollId); };
}
async function createVault({ uid,email,text,deadlineDate,deadlineTime,category }) {
  const unlockAt = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
  // ALL vaults are secret by design — content is always stored in secret_text
  return supabase.from("vaults").insert({
    uid, email,
    text: null,
    secret_text: text,
    secret: true,
    deadline_date: deadlineDate,
    deadline_time: deadlineTime,
    unlock_at: unlockAt,
    category,
    status: "locked",
    email_sent_at: null,
    responded_at: null,
    feedback_message: null,
  });
}
async function respondToVault(vaultId, status, feedbackMessage) {
  return supabase.from("vaults").update({
    status, feedback_message: feedbackMessage, responded_at: new Date().toISOString()
  }).eq("id",vaultId).eq("status","unlocked");
}
function getPins() { try { return JSON.parse(localStorage.getItem("av_pins")||"[]"); } catch { return []; } }
function togglePin(id) {
  const pins = getPins();
  const next = pins.includes(id)?pins.filter(p=>p!==id):[...pins,id];
  localStorage.setItem("av_pins", JSON.stringify(next));
  return next;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function fmtCountdown(ms) {
  const s = Math.max(0,Math.floor(ms/1000));
  return { days:Math.floor(s/86400),hours:Math.floor((s%86400)/3600),minutes:Math.floor((s%3600)/60),seconds:s%60 };
}
function pct(createdAt,unlockAt) {
  return Math.min(100,Math.max(0,((Date.now()-createdAt)/(unlockAt-createdAt))*100));
}
function streakCount(vaults) {
  const days=[...new Set(
    vaults.filter(v=>v.status==="completed"&&v.responded_at)
      .map(v=>new Date(v.responded_at).toDateString())
  )].sort((a,b)=>new Date(b)-new Date(a));
  if(!days.length) return 0;
  let s=1;
  for(let i=1;i<days.length;i++){
    if(Math.round((new Date(days[i-1])-new Date(days[i]))/86400000)===1) s++;
    else break;
  }
  return s;
}
function fmtDate(d,t){
  if(!d) return "";
  try {
    return new Date(`${d}T${t||"23:59"}:00`).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})+" · "+(t||"23:59");
  } catch { return `${d} ${t||""}`; }
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.tx1};font-family:${FONT_BODY};-webkit-font-smoothing:antialiased;}
::selection{background:rgba(139,92,246,.25);color:${T.tx1};}
input,textarea,button{font-family:inherit;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07);border-radius:2px;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
@keyframes cardIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes toastIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
@keyframes vaultPulse{0%,100%{opacity:.7;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes gracePulse{0%,100%{opacity:.4;}50%{opacity:1;}}
@keyframes vaultBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes menuSlide{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
@keyframes overlay{from{opacity:0;}to{opacity:1;}}

.av-btn-primary{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 20px;border-radius:9px;border:none;cursor:pointer;
  background:${T.grad};color:#fff;font-weight:700;font-size:14px;
  font-family:${FONT_DISPLAY};letter-spacing:-.01em;
  box-shadow:0 4px 20px rgba(139,92,246,.35);
  transition:opacity .15s,transform .15s,box-shadow .15s;
}
.av-btn-primary:hover:not(:disabled){opacity:.9;transform:translateY(-1px);box-shadow:0 8px 28px rgba(139,92,246,.45);}
.av-btn-primary:active:not(:disabled){transform:translateY(0);}
.av-btn-primary:disabled{opacity:.35;cursor:not-allowed;}

.av-btn-ghost{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:8px 14px;border-radius:8px;cursor:pointer;
  background:transparent;border:1px solid ${T.border};
  color:${T.tx2};font-size:13px;font-weight:500;
  transition:border-color .15s,color .15s,background .15s;
}
.av-btn-ghost:hover{border-color:${T.borderMd};color:${T.tx1};background:rgba(255,255,255,.03);}

.av-input{
  width:100%;background:transparent;border:none;resize:none;
  font-family:${FONT_BODY};font-size:15px;color:${T.tx1};
  line-height:1.7;padding:20px 22px;
}
.av-input::placeholder{color:${T.tx3};}
.av-input:focus{outline:none;}

.av-date{
  background:${T.surfaceEl};border:1px solid ${T.border};
  border-radius:8px;padding:7px 12px;
  font-family:${FONT_BODY};font-size:13px;color:${T.tx1};
  color-scheme:dark;outline:none;transition:border-color .15s;
}
.av-date:focus{border-color:rgba(139,92,246,.5);}

.av-modal-bg{
  position:fixed;inset:0;z-index:500;
  display:flex;align-items:center;justify-content:center;padding:20px;
  background:rgba(15,23,42,.88);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  animation:fadeIn .18s ease;
}
.av-modal{
  background:${T.surface};border:1px solid ${T.borderMd};
  border-radius:20px;padding:32px 28px;max-width:440px;width:100%;
  box-shadow:0 40px 80px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.04);
  animation:scaleIn .22s cubic-bezier(0.34,1.3,0.64,1);
}
.av-commit-input{
  width:100%;padding:12px 16px;border-radius:9px;
  background:${T.surfaceEl};border:1.5px solid ${T.border};
  font-family:${FONT_DISPLAY};font-size:14px;font-weight:700;
  color:${T.tx1};letter-spacing:.1em;outline:none;
  transition:border-color .2s;box-sizing:border-box;
}
.av-commit-input.valid{border-color:rgba(139,92,246,.6);}
.av-commit-input.shake{animation:shake .35s ease;}

.av-tab{
  padding:5px 14px;border-radius:20px;cursor:pointer;
  font-size:12px;font-weight:600;border:1px solid transparent;
  transition:all .15s;white-space:nowrap;
}
.av-tab.on{background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.3);color:${T.violet};}
.av-tab.off{background:transparent;border-color:${T.border};color:${T.tx2};}
.av-tab.off:hover{border-color:${T.borderMd};color:${T.tx1};}

.av-lang{
  padding:4px 10px;border-radius:6px;cursor:pointer;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  border:1px solid transparent;transition:all .15s;
}
.av-lang.on{background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.3);color:${T.violet};}
.av-lang.off{border-color:${T.border};color:${T.tx3};}
.av-lang.off:hover{color:${T.tx2};}

.chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:20px;
  font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}
.pbar{height:3px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden;}
.pfill{height:100%;border-radius:2px;transition:width 1s linear;}

/* Mobile bottom nav */
.av-bottom-nav{
  position:fixed;bottom:0;left:0;right:0;
  background:rgba(15,23,42,0.95);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-top:1px solid ${T.border};
  display:flex;align-items:center;justify-content:space-around;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index:200;
}
.av-bottom-nav-item{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  cursor:pointer;background:none;border:none;
  color:${T.tx3};font-size:10px;font-weight:600;
  transition:color .15s;padding:4px 12px;border-radius:8px;
  letter-spacing:.04em;text-transform:uppercase;
}
.av-bottom-nav-item.active{color:${T.violet};}

/* Burger menu dropdown */
.av-burger-menu{
  position:absolute;top:calc(100% + 8px);right:0;
  background:${T.surface};border:1px solid ${T.borderMd};
  border-radius:14px;padding:8px;min-width:180px;
  box-shadow:0 16px 48px rgba(0,0,0,.5);
  animation:menuSlide .18s ease;z-index:400;
}
.av-burger-item{
  display:flex;align-items:center;gap:10px;
  width:100%;padding:10px 12px;border-radius:9px;
  background:none;border:none;cursor:pointer;
  color:${T.tx2};font-size:13px;font-weight:500;
  transition:background .12s,color .12s;text-align:left;
}
.av-burger-item:hover{background:rgba(255,255,255,.04);color:${T.tx1};}
.av-burger-divider{height:1px;background:${T.border};margin:4px 8px;}
`;

// ─── VAULT ICON ───────────────────────────────────────────────────────────────
function VaultIcon({ cracked=false, size=80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vg-door" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
        <linearGradient id="vg-dial" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#60A5FA"/>
        </linearGradient>
        <radialGradient id="vg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#34D399" stopOpacity="0"/>
        </radialGradient>
        <filter id="vg-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#8B5CF6" floodOpacity="0.5"/>
        </filter>
      </defs>
      {cracked&&<ellipse cx="40" cy="42" rx="36" ry="36" fill="url(#vg-glow)"/>}
      <rect x="8" y="10" width="64" height="60" rx="10" fill="url(#vg-door)" filter="url(#vg-shadow)"/>
      <rect x="14" y="16" width="52" height="48" rx="7" fill="rgba(255,255,255,0.06)"/>
      <circle cx="40" cy="40" r="14" stroke="url(#vg-dial)" strokeWidth="2.5" fill="rgba(255,255,255,0.05)"/>
      <circle cx="40" cy="40" r="8" fill="url(#vg-dial)" fillOpacity="0.25"/>
      <circle cx="40" cy="40" r="3" fill="#A78BFA"/>
      {[0,60,120,180,240,300].map(deg=>(
        <line key={deg} x1="40" y1="27" x2="40" y2="30" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${deg} 40 40)`}/>
      ))}
      <rect x="56" y="36" width="10" height="8" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      <circle cx="16" cy="22" r="3" fill="rgba(255,255,255,0.12)"/>
      <circle cx="16" cy="58" r="3" fill="rgba(255,255,255,0.12)"/>
      {cracked&&(
        <>
          <line x1="40" y1="10" x2="44" y2="25" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
          <line x1="44" y1="25" x2="38" y2="35" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        </>
      )}
    </svg>
  );
}

// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <div style={{display:"flex",gap:4}}>
      {["en","fr"].map(l=>(
        <button key={l} className={`av-lang ${lang===l?"on":"off"}`} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

// ─── BURGER MENU (mobile header) ─────────────────────────────────────────────
function BurgerMenu({ items, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",flexDirection:"column",gap:4,padding:"8px",background:open?T.violetDim:"transparent",border:`1px solid ${open?"rgba(139,92,246,.3)":T.border}`,borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:18,height:2,borderRadius:1,background:open?T.violet:T.tx2,transition:"background .15s"}}/>
        ))}
      </button>
      {open && (
        <div className="av-burger-menu">
          {items.map((item, i) => item === "divider"
            ? <div key={i} className="av-burger-divider"/>
            : (
              <button key={i} className="av-burger-item" onClick={()=>{item.onClick();setOpen(false);}}>
                <span style={{fontSize:16}}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── NAV LOGO ─────────────────────────────────────────────────────────────────
function NavLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px rgba(139,92,246,0.3)"}}>
        <VaultIcon size={17}/>
      </div>
      <span style={{fontFamily:FONT_DISPLAY,fontSize:14,fontWeight:800,color:T.tx1,letterSpacing:"-.01em"}}>AxisVault</span>
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({ onComplete, lang }) {
  const t = useT(lang);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(true), 40),
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 700),   // dial spin starts
      setTimeout(() => setPhase(3), 2200),  // crack + golden glow
      setTimeout(() => setFadeOut(true), 3000),
      setTimeout(() => onComplete(), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 2) return;
    const start = Date.now(), dur = 1400;
    const raf = () => {
      const el = Date.now() - start;
      setProgress(Math.min(100, (el / dur) * 100));
      if (el < dur) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [phase]);

  const dialStyle = {
    transformOrigin: "80px 80px",
    transform: phase >= 2 ? "rotate(720deg)" : "rotate(0deg)",
    transition: phase >= 2 ? "transform 1.8s cubic-bezier(0.4,0,0.2,1)" : "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fadeOut ? 0 : visible ? 1 : 0, transition: "opacity .5s ease",
    }}>
      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(139,92,246,.18) 0%,rgba(59,130,246,.07) 45%,transparent 70%)",
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? "vaultPulse 2.5s ease-in-out infinite" : "none",
        transition: "opacity .6s ease",
      }} />

      {/* Vault with dial */}
      <div style={{
        marginBottom: 48, zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(.3)",
        transition: "opacity .5s ease, transform .7s cubic-bezier(0.34,1.56,0.64,1)",
        animation: phase >= 1 ? "vaultBounce 4s ease-in-out infinite" : "none",
      }}>
        <SplashVaultIcon phase={phase} dialStyle={dialStyle} />
      </div>

      <div style={{ textAlign: "center", zIndex: 1, marginBottom: 48, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity .5s .2s ease, transform .5s .2s ease" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 800, color: T.tx1, letterSpacing: "-.03em" }}>{t.appName}</div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", marginTop: 6, color: T.tx3 }}>{t.tagline}</div>
      </div>

      <div style={{ width: 200, height: 2, background: "rgba(148,163,184,.1)", borderRadius: 2, overflow: "hidden", opacity: phase >= 2 ? 1 : 0, transition: "opacity .3s ease", zIndex: 1 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#8B5CF6,#3B82F6)", borderRadius: 2, transition: "width .05s linear" }} />
      </div>
    </div>
  );
}
// ─── LandingPage ───────────────────────────────────────────────────────────────────
function LandingPage({ lang, setLang, onEnter }) {
  const t = useT(lang);
  const { isMobile } = useBreakpoint();
  const [vis, setVis] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setVis(true), 60); return () => clearTimeout(tm); }, []);

  const features = lang === "fr"
    ? [
        { icon: "🔒", title: "Verrouillage irréversible", desc: "Une fois enfermé, l'engagement ne peut pas changer. Le coffre s'ouvre à la deadline — jamais avant." },
        { icon: "⏱",  title: "Pression en temps réel", desc: "Le cadran tourne, les secondes défilent. Tu ne peux pas ignorer ce que tu as signé." },
        { icon: "📈", title: "Bilan sans concession", desc: "Livré ou raté — le coffre exige une réponse. L'historique ne ment pas et ne pardonne pas." },
      ]
    : [
        { icon: "🔒", title: "Irrevocable lock-in", desc: "Once sealed, your commitment cannot change. The vault opens at your deadline — never before." },
        { icon: "⏱",  title: "Real-time pressure", desc: "The dial turns, the seconds roll. You can't ignore what you signed." },
        { icon: "📈", title: "No-excuse reckoning", desc: "Delivered or missed — the vault demands an answer. The record doesn't lie." },
      ];

  return (
    /* AJOUT DE overflowX: "hidden" pour bloquer tout débordement des orbes absolus */
    <div style={{ position: "fixed", inset: 0, overflowY: "auto", overflowX: "hidden", background: T.bg, opacity: vis ? 1 : 0, transition: "opacity .5s ease" }}>
      {/* Orbes bg */}
      <div style={{ position: "absolute", top: -120, left: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.09) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 65%)", pointerEvents: "none" }} />

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", position: "relative", zIndex: 10, borderBottom: `1px solid ${T.border}` }}>
        <NavLogo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="av-btn-primary" onClick={onEnter} style={{ padding: "9px 20px", fontSize: 13, borderRadius: 9 }}>
            {lang === "fr" ? "Commencer →" : "Get started →"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: isMobile ? "60px 20px 48px" : "90px 24px 64px", position: "relative", zIndex: 2 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 20, marginBottom: 28,
          background: T.violetDim, border: "1px solid rgba(139,92,246,.25)",
          fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#A78BFA",
          fontFamily: FONT_BODY,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.violet, animation: "vaultPulse 2s ease-in-out infinite" }} />
          {lang === "fr" ? "Zero-excuse  sans compromis" : "Zero excuses, zero compromises"}
        </div>

        {/* 3D Vault animé */}
        <div style={{
          position: "relative", width: 180, height: 180, marginBottom: 52,
          animation: "vaultBounce 4s ease-in-out infinite",
          perspective: "800px",
        }}>
          {/* Aura */}
          <div style={{ position: "absolute", inset: -32, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.22) 0%,transparent 65%)", animation: "vaultPulse 3s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: -18, borderRadius: "50%", border: "1px solid rgba(139,92,246,.18)", animation: "vaultPulse 2.5s ease-in-out infinite" }} />
          {/* SVG coffre 3D */}
          <svg width="180" height="180" viewBox="0 0 160 160" fill="none" style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 20px 40px rgba(139,92,246,.35))" }}>
            <defs>
              <linearGradient id="lv-front" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
              <linearGradient id="lv-side" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#4A2AA0"/><stop offset="100%" stopColor="#1A3A7A"/>
              </linearGradient>
              <linearGradient id="lv-top" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="rgba(167,139,250,.4)"/><stop offset="100%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            {/* Face droite (3D) */}
            <polygon points="144,26 158,16 158,136 144,140" fill="url(#lv-side)" opacity=".8"/>
            {/* Face supérieure (3D) */}
            <polygon points="16,26 144,26 158,16 30,16" fill="url(#lv-top)"/>
            {/* Face principale */}
            <rect x="16" y="26" width="128" height="114" rx="14" fill="url(#lv-front)"/>
            <rect x="26" y="36" width="108" height="94" rx="10" fill="rgba(255,255,255,0.05)"/>
            {/* Reflet */}
            <rect x="26" y="36" width="108" height="28" rx="10" fill="rgba(255,255,255,0.07)"/>
            {/* Dial */}
            <circle cx="76" cy="80" r="26" stroke="rgba(167,139,250,.5)" strokeWidth="1.5" fill="rgba(255,255,255,.04)"/>
            {[0,90,180,270].map((deg,i) => {
              const a = deg * Math.PI/180;
              return <line key={i} x1={76+Math.sin(a)*20} y1={80-Math.cos(a)*20} x2={76+Math.sin(a)*25} y2={80-Math.cos(a)*25} stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>;
            })}
            <line x1="76" y1="58" x2="76" y2="68" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="76" cy="80" r="10" fill="rgba(139,92,246,.3)" stroke="rgba(167,139,250,.6)" strokeWidth="1.5"/>
            <circle cx="76" cy="80" r="4" fill="#A78BFA"/>
            {/* Poignée */}
            <rect x="128" y="70" width="14" height="20" rx="5" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
            <circle cx="135" cy="80" r="3" fill="rgba(255,255,255,.4)"/>
            {/* Boulons */}
            {[[28,38],[28,128],[132,38],[132,128]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3.5" fill="rgba(255,255,255,.1)"/>)}
          </svg>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: isMobile ? 34 : 58, fontWeight: 800, color: T.tx1, lineHeight: 1.08, letterSpacing: "-.035em", marginBottom: 20, maxWidth: 680 }}>
          {lang === "fr" ? <>Des objectifs<br/><span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>dont tu ne peux pas</span><br/>te défiler.</> : <>Commitments<br/><span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>you can't walk away from.</span></>}
        </h1>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: T.tx2, lineHeight: 1.75, maxWidth: 480, marginBottom: 44 }}>
          {lang === "fr"
            ? "Écris un engagement, verrouille-le avec une deadline. Quand le coffre s'ouvre, il n'y a plus de cachette — juste un bilan."
            : "Write a commitment, lock it with a deadline. When the vault opens, there's no hiding — just a record."}
        </p>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button className="av-btn-primary" onClick={onEnter} style={{ padding: "16px 40px", fontSize: 16, borderRadius: 12, animation: "vaultPulse 3s ease-in-out infinite" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {lang === "fr" ? "Verrouille ton premier engagement" : "Lock your first commitment"}
          </button>
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.tx3 }}>
            {lang === "fr" ? "Gratuit · Connexion Google · 30 secondes" : "Free · Google sign-in · 30 seconds"}
          </span>
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 24 : 56, padding: "28px 32px", margin: isMobile ? "0 16px 48px" : "0 auto 56px", maxWidth: 700, background: "rgba(30,41,59,.5)", border: `1px solid ${T.border}`, borderRadius: 16 }}>
        {[["84%", lang === "fr" ? "Taux de réussite moyen" : "Avg success rate"], ["∞", lang === "fr" ? "Coffres possibles" : "Possible vaults"], ["0", lang === "fr" ? "Excuse acceptée" : "Excuses accepted"]].map(([n, l], i, arr) => (
          <React.Fragment key={l}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "#A78BFA", letterSpacing: "-.03em" }}>{n}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.tx3, marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>{l}</div>
            </div>
            {i < arr.length - 1 && !isMobile && <div style={{ width: 1, height: 40, background: T.border }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, padding: isMobile ? "0 16px 80px" : "0 32px 100px", maxWidth: 960, margin: "0 auto" }}>
        {features.map(f => (
          <div key={f.title} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 20px", transition: "border-color .2s, transform .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = ""; }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.violetDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: T.tx1, marginBottom: 7, letterSpacing: "-.01em" }}>{f.title}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.tx2, lineHeight: 1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// Vault SVG avec cadran animé
function SplashVaultIcon({ phase, dialStyle }) {
  // Click sounds via Web Audio (optionnel — silencieux si bloqué)
  useEffect(() => {
    if (phase !== 2) return;
    const clicks = [0, 400, 900, 1300];
    const timers = clicks.map(delay => setTimeout(() => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 800 + Math.random() * 400;
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
      } catch {}
    }, delay));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sv-door" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
        <radialGradient id="sv-golden" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.85"/>
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Lumière dorée qui s'échappe */}
      {phase >= 3 && (
        <g style={{ animation: "fadeIn .4s ease both" }}>
          <ellipse cx="80" cy="80" rx="74" ry="74" fill="url(#sv-golden)" opacity=".65"/>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <line key={i}
              x1={80 + Math.cos(deg * Math.PI/180) * 74}
              y1={80 + Math.sin(deg * Math.PI/180) * 74}
              x2={80 + Math.cos(deg * Math.PI/180) * 90}
              y2={80 + Math.sin(deg * Math.PI/180) * 90}
              stroke="#FCD34D" strokeWidth="1.5" opacity={i % 2 === 0 ? .8 : .4}
              style={{ animation: `fadeIn .3s ease ${i * 0.04}s both` }}
            />
          ))}
        </g>
      )}

      {/* Corps du coffre */}
      <rect x="16" y="20" width="128" height="120" rx="18" fill="url(#sv-door)" opacity=".95"/>
      <rect x="26" y="30" width="108" height="100" rx="12" fill="rgba(255,255,255,0.05)"/>

      {/* Cadran qui tourne */}
      <g style={dialStyle}>
        <circle cx="80" cy="80" r="30" stroke="rgba(167,139,250,.5)" strokeWidth="1.5" fill="rgba(255,255,255,.04)"/>
        {/* Chiffres sur le cadran */}
        {[0, 25, 50, 75].map((num, i) => {
          const angle = i * 90 * Math.PI / 180;
          const tx = 80 + Math.sin(angle) * 23;
          const ty = 80 - Math.cos(angle) * 23 + 4;
          return (
            <text key={num} x={tx} y={ty} textAnchor="middle"
              style={{ fontSize: 7, fill: "#A78BFA", fontFamily: "system-ui", fontWeight: 600 }}>{num}</text>
          );
        })}
        {/* Tirets */}
        {Array.from({length: 20}, (_, i) => {
          const angle = i * 18 * Math.PI / 180;
          const r1 = 25, r2 = i % 5 === 0 ? 21 : 23;
          return (
            <line key={i}
              x1={80 + Math.sin(angle) * r1} y1={80 - Math.cos(angle) * r1}
              x2={80 + Math.sin(angle) * r2} y2={80 - Math.cos(angle) * r2}
              stroke="#A78BFA" strokeWidth={i % 5 === 0 ? 1.5 : .8} strokeLinecap="round"/>
          );
        })}
        {/* Pointeur */}
        <line x1="80" y1="55" x2="80" y2="67" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Centre */}
        <circle cx="80" cy="80" r="12" fill="rgba(139,92,246,.3)" stroke="rgba(167,139,250,.6)" strokeWidth="1.5"/>
        <circle cx="80" cy="80" r="5" fill="#A78BFA"/>
      </g>

      {/* Poignée */}
      <rect x="136" y="72" width="16" height="16" rx="5" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.25)" strokeWidth="1"/>
      <circle cx="144" cy="80" r="3" fill="rgba(255,255,255,.35)"/>

      {/* Boulons */}
      {[[30,36],[30,124],[130,36],[130,124]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="rgba(255,255,255,.1)"/>
      ))}

      {/* Fissures (après ouverture) */}
      {phase >= 3 && (
        <>
          <line x1="80" y1="20" x2="87" y2="52" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" style={{ animation: "fadeIn .2s ease both" }}/>
          <line x1="87" y1="52" x2="74" y2="72" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" style={{ animation: "fadeIn .2s ease .1s both" }}/>
        </>
      )}
    </svg>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ lang, setLang }) {
  const t=useT(lang);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);
  const go=async()=>{
    setLoading(true);setError(null);
    const {error:e}=await signInWithGoogle();
    if(e){setError(t.loginErr);setLoading(false);}
  };
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,opacity:vis?1:0,transition:"opacity .5s ease"}}>
      <div style={{position:"absolute",top:"10%",left:"15%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"15%",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:20,right:20}}><LangToggle lang={lang} setLang={setLang}/></div>
      <div style={{maxWidth:400,width:"100%",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:36}}>
          <div style={{width:58,height:58,borderRadius:17,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(139,92,246,.4)"}}>
            <VaultIcon size={36}/>
          </div>
        </div>
        <div style={{fontFamily:FONT_DISPLAY,fontSize:11,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:T.tx3,marginBottom:16}}>AxisVault</div>
        <h1 style={{fontFamily:FONT_DISPLAY,fontSize:28,fontWeight:800,color:T.tx1,lineHeight:1.2,letterSpacing:"-.02em",marginBottom:12}}>
          {t.loginH}<br/>
          <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}></span>
        </h1>
        <p style={{fontSize:14,color:T.tx2,lineHeight:1.7,marginBottom:44}}>{t.loginSub}</p>
        <button onClick={go} disabled={loading}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,width:"100%",padding:"14px 20px",borderRadius:11,background:"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:FONT_DISPLAY,fontSize:15,fontWeight:600,color:"#111",boxShadow:"0 2px 20px rgba(0,0,0,.3)",transition:"all .15s",opacity:loading?.7:1}}
          onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,.38)";}}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 20px rgba(0,0,0,.3)";}}>
          {loading?<div style={{width:18,height:18,border:"2.5px solid #ddd",borderTopColor:"#8B5CF6",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<GoogleLogo/>}
          {loading?t.signingIn:t.google}
        </button>
        {error&&<p style={{fontSize:13,color:T.red,marginTop:14}}>{error}</p>}
        <p style={{fontSize:12,color:T.tx3,marginTop:22,lineHeight:1.6}}>{t.terms}</p>
      </div>
    </div>
  );
}

function GoogleLogo(){return(
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.759-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
    <path d="M4.405 11.9A6.01 6.01 0 014.09 10c0-.662.114-1.305.314-1.9V5.51H1.063A9.996 9.996 0 000 10c0 1.614.386 3.141 1.064 4.491L4.405 11.9z" fill="#FBBC05"/>
    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0A9.996 9.996 0 001.064 5.51L4.405 8.1C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
  </svg>
);}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// Ajoute ces helpers AVANT le composant Dashboard (ou dans le module)
function getMinDeadline() {
  const d = new Date(Date.now() + 30 * 60 * 1000); // +30 min
  return d;
}
function getMinDateStr() {
  return getMinDeadline().toISOString().split("T")[0];
}
function getMinTimeStr(dateStr) {
  const now = new Date(Date.now() + 30 * 60 * 1000);
  const today = now.toISOString().split("T")[0];
  if (dateStr === today) {
    return now.toTimeString().slice(0, 5); // "HH:MM"
  }
  return "00:00";
}

// Validation complète
function validateDeadline(dateStr, timeStr,lang) {
  if (!dateStr || !timeStr) return { valid: false, error: null };
  const chosen = new Date(`${dateStr}T${timeStr}:00`);
  const minTime = new Date(Date.now() + 30 * 60 * 1000);

  if (chosen < new Date()) {
    return { valid: false, error: lang === "fr" ? "Cette date est dans le passé." : "This date is in the past." };
  }
  if (chosen < minTime) {
    const diff = Math.ceil((minTime - chosen) / 60000);
    return { valid: false, error: lang === "fr" ? `Minimum +30 min depuis maintenant (encore ${diff} min à ajouter).` : `Minimum +30 min from now (add ${diff} more min).` };
  }
  return { valid: true, error: null };
}
function Dashboard({ user,vaults,onAdd,onViewVaults,onSignOut,lang,setLang }) {
  const t=useT(lang);
  const toast=useToast();
  const { isMobile } = useBreakpoint();
  const [text,setText]=useState("");
  const [date,setDate]=useState("");
  const [time,setTime]=useState("23:59");
  const [cat,setCat]=useState("personal");
  const [modal,setModal]=useState(false);
  const [cword,setCword]=useState("");
  const [shaking,setShaking]=useState(false);
  const [saving,setSaving]=useState(false);
  const [vis,setVis]=useState(false);
  const [signOutModal,setSignOutModal]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);
  const today=new Date().toISOString().split("T")[0];
  const dlValidation = validateDeadline(date, time,lang); 
  const canLock=text.trim().length>2&&date && dlValidation.valid;
  useEffect(()=>{
    const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter"&&canLock) setModal(true);};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
      console.log(t)
  },[canLock]);
  const confirm=async()=>{
    if(cword!=="COMMIT"){setShaking(true);setTimeout(()=>setShaking(false),400);return;}
    setSaving(true);
    await onAdd({uid:user.uid,email:user.email,text:text.trim(),deadlineDate:date,deadlineTime:time,category:cat});
    toast(t.toastLocked,"success");
    setModal(false);setText("");setDate("");setTime("23:59");setCword("");setSaving(false);
  };
  const active=vaults.filter(v=>v.status==="locked").length;
  const open_=vaults.filter(v=>v.status==="unlocked").length;
  const done=vaults.filter(v=>v.status==="completed").length;
  const missed=vaults.filter(v=>v.status==="failed").length;
  const resolved=done+missed;
  const sr=resolved>0?Math.round((done/resolved)*100):null;
  const str=streakCount(vaults);

  const burgerItems = [
    { icon:"🌐", label: lang==="fr"?"English":"Français", onClick:()=>setLang(lang==="fr"?"en":"fr") },
    "divider",
    ...(vaults.length>0 ? [{ icon:"🏛", label:`${t.viewVaults} (${vaults.length})`, onClick:onViewVaults }] : []),
    "divider",
    { icon:"🚪", label:t.signOut, onClick:()=>setSignOutModal(true) },
  ];

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",background:T.bg,opacity:vis?1:0,transition:"opacity .4s ease"}}>
      <div style={{maxWidth:580,margin:"0 auto",padding:`40px 20px ${isMobile?"140px":"120px"}`}}>

        {/* HEADER */}
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:48}}>
          <NavLogo/>
          {isMobile ? (
            <BurgerMenu items={burgerItems} lang={lang}/>
          ) : (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <LangToggle lang={lang} setLang={setLang}/>
              {vaults.length>0&&(
                <button className="av-btn-ghost" onClick={onViewVaults} style={{marginLeft:4}}>
                  {t.viewVaults}
                  <span style={{padding:"1px 6px",borderRadius:20,background:T.violetDim,color:T.violet,fontSize:11,fontWeight:700}}>{vaults.length}</span>
                </button>
              )}
              <button className="av-btn-ghost" onClick={()=>setSignOutModal(true)} style={{padding:"8px 12px"}}>{t.signOut}</button>
            </div>
          )}
        </header>

        <p style={{fontSize:13,color:T.tx2,marginBottom:8}}>
          {t.welcomeBack}, <span style={{color:T.violet,fontWeight:600}}>{user.name?.split(" ")[0]}</span>
          {str>1&&<span style={{marginLeft:10,color:T.amber,fontWeight:600,fontSize:12}}>🔥 {str} {t.streak}</span>}
        </p>
        <h1 style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?28:36,fontWeight:800,color:T.tx1,lineHeight:1.1,letterSpacing:"-.03em",marginBottom:10}}>
          {t.hero1}<br/>
          <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.hero2}</span>
        </h1>
        <p style={{fontSize:13,color:T.tx2,marginBottom:28,lineHeight:1.65}}>{t.inputSub}</p>

        {/* INPUT CARD */}
        <div style={{background:T.surface,borderRadius:16,border:`1px solid ${canLock?"rgba(139,92,246,.3)":T.border}`,overflow:"hidden",marginBottom:10,boxShadow:canLock?"0 0 0 1px rgba(139,92,246,.08),0 4px 24px rgba(139,92,246,.1)":"none",transition:"border-color .2s,box-shadow .2s"}}>
          <textarea className="av-input" value={text} onChange={e=>setText(e.target.value)} placeholder={t.placeholder} rows={3}/>
          <div style={{height:1,background:T.border,margin:"0 22px"}}/>
          {/* CATEGORIES */}
          <div style={{padding:"12px 22px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:T.tx3,fontWeight:500,marginRight:2}}>{t.category}</span>
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:cat===c.id?`${c.color}1A`:"transparent",border:`1px solid ${cat===c.id?`${c.color}44`:T.border}`,color:cat===c.id?c.color:T.tx2,transition:"all .15s"}}>
                {c.symbol} {lang==="fr"?c.fr:c.en}
              </button>
            ))}
          </div>
          <div style={{height:1,background:T.border,margin:"0 22px"}}/>
          {/* DEADLINE */}
       <div style={{ padding: "12px 22px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flexDirection: "column" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
    <span style={{ fontSize: 11, color: T.tx3, fontWeight: 500 }}>{t.deadline}</span>
    <input
      type="date" className="av-date"
      value={date}
      min={getMinDateStr()}
      onChange={e => {
        setDate(e.target.value);
        // Auto-ajuste le time si on est sur aujourd'hui
        if (e.target.value === new Date().toISOString().split("T")[0]) {
          const minT = getMinTimeStr(e.target.value);
          if (time < minT) setTime(minT);
        }
      }}
    />
    <input
      type="time" className="av-date"
      value={time}
      min={getMinTimeStr(date)}
      onChange={e => setTime(e.target.value)}
      style={{ width: 92 }}
    />
  </div>
  {/* Feedback en temps réel */}
  {date && dlValidation.error && (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, color: T.red, fontFamily: FONT_BODY,
      padding: "5px 10px", borderRadius: 7,
      background: T.redDim, border: `1px solid rgba(248,113,113,.2)`,
      animation: "fadeIn .2s ease",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      {dlValidation.error}
    </div>
  )}
  {date && dlValidation.valid && (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, color: T.green, fontFamily: FONT_BODY,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {lang === "fr" ? "Deadline valide ✓" : "Valid deadline ✓"}
    </div>
  )}
</div>
        </div>

        <button className="av-btn-primary" onClick={()=>setModal(true)} disabled={!canLock}
          style={{width:"100%",padding:"14px",borderRadius:11,fontSize:14}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {t.lockVault}
          {canLock&&!isMobile&&<span style={{fontSize:11,opacity:.6,fontWeight:500,marginLeft:4}}>⌘↵</span>}
        </button>

        {/* STATS */}
        {vaults.length>0&&(
          <div style={{marginTop:28}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
              {[{l:t.active,v:active,c:T.violet},{l:t.open,v:open_,c:T.blue},{l:t.done,v:done,c:T.green},{l:t.missed_f,v:missed,c:T.red}].map(s=>(
                <div key={s.l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?18:22,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:10,color:T.tx2,marginTop:5,fontWeight:500}}>{s.l}</div>
                </div>
              ))}
            </div>
            {sr!==null&&(
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:T.tx2}}>{t.successRate}</span>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="pbar" style={{width:isMobile?60:90}}>
                    <div className="pfill" style={{width:`${sr}%`,background:sr>=70?T.green:sr>=40?"linear-gradient(90deg,#8B5CF6,#3B82F6)":T.red}}/>
                  </div>
                  <span style={{fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:800,color:sr>=70?T.green:sr>=40?T.violet:T.red,minWidth:42,textAlign:"right"}}>{sr}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav className="av-bottom-nav">
          <button className="av-bottom-nav-item active" onClick={()=>{}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {t.lockVault.split(" ")[0]}
          </button>
          {vaults.length>0&&(
            <button className="av-bottom-nav-item" onClick={onViewVaults}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              {t.viewVaults}
            </button>
          )}
        </nav>
      )}

      {modal&&(
        <CommitModal goalText={text} deadline={fmtDate(date,time)}
          cword={cword} onCword={setCword}
          onConfirm={confirm} onCancel={()=>{setModal(false);setCword("");}}
          shaking={shaking} saving={saving} lang={lang}/>
      )}
      {signOutModal&&(
        <SignOutModal onConfirm={()=>{setSignOutModal(false);onSignOut();}} onCancel={()=>setSignOutModal(false)} lang={lang}/>
      )}
    </div>
  );
}

// ─── COMMIT MODAL ─────────────────────────────────────────────────────────────
function CommitModal({ goalText,deadline,cword,onCword,onConfirm,onCancel,shaking,saving,lang }) {
  const t=useT(lang);
  const valid=cword==="COMMIT";
  return (
    <div className="av-modal-bg">
      <div className="av-modal">
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:50,height:50,borderRadius:14,background:T.violetDim,border:"1px solid rgba(139,92,246,.25)",fontSize:22,marginBottom:14}}>🔒</div>
          <h2 style={{fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:800,color:T.tx1,letterSpacing:"-.02em",marginBottom:6}}>{t.irrevTitle}</h2>
          <p style={{fontSize:13,color:T.tx2,lineHeight:1.6}}>{t.irrevSub}</p>
        </div>
        <div style={{background:T.surfaceEl,borderRadius:10,padding:"13px 15px",marginBottom:20,border:`1px solid ${T.border}`}}>
          <p style={{fontSize:13,color:T.tx1,fontWeight:500,lineHeight:1.55,marginBottom:6}}>"{goalText}"</p>
          <p style={{fontSize:12,color:T.tx2}}>{t.unlocks}: <span style={{color:T.tx1}}>{deadline}</span></p>
        </div>
        <p style={{fontSize:13,color:T.tx2,marginBottom:8}}>
          {t.typeCommit} <span style={{color:T.violet,fontWeight:700}}>COMMIT</span> {t.toConfirm}
        </p>
        <input className={`av-commit-input${valid?" valid":""}${shaking?" shake":""}`}
          type="text" value={cword} autoFocus placeholder="COMMIT"
          onChange={e=>onCword(e.target.value.toUpperCase())}
          onKeyDown={e=>{if(e.key==="Enter"&&valid) onConfirm();}}
          style={{marginBottom:18}}/>
        <div style={{display:"flex",gap:8}}>
          <button className="av-btn-ghost" onClick={onCancel} style={{flex:1,justifyContent:"center",padding:"12px"}}>{t.cancel}</button>
          <button className="av-btn-primary" onClick={onConfirm} disabled={!valid||saving} style={{flex:2,justifyContent:"center",padding:"12px"}}>
            {saving?t.saving:t.lockItIn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VAULTS SCREEN ────────────────────────────────────────────────────────────
function VaultsScreen({ vaults,onBack,onSignOut,lang,setLang,onUpdateVault }) {
  const t=useT(lang);
  const { isMobile, width } = useBreakpoint();
  const [vis,setVis]=useState(false);
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("newest");
  const [pins,setPins]=useState(getPins);
  const [signOutModal,setSignOutModal]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);

  const handleTogglePin=useCallback(id=>{setPins(togglePin(id));},[]);
  const handleOutcome=useCallback(async(vault,outcome,note)=>{
    const quotes=outcome==="completed"?STRINGS[lang].congrats:STRINGS[lang].encourage;
    const msg=note||(quotes[Math.floor(Math.random()*quotes.length)]);
    onUpdateVault(vault.id,{status:outcome,feedback_message:msg,responded_at:new Date().toISOString()});
    await respondToVault(vault.id,outcome,msg);
    if(outcome==="completed"){
      try{const{default:c}=await import("canvas-confetti");c({particleCount:100,spread:70,origin:{x:.5,y:.55},colors:["#34D399","#8B5CF6","#3B82F6","#FCD34D"]});}catch{}
    }
  },[onUpdateVault,lang]);

  const statusLabels={all:t.all,locked:t.locked,unlocked:t.timeIsUp,completed:t.done,failed:t.missed_f};
  const filterMap={"all":null,"locked":"locked","unlocked":"unlocked","completed":"completed","failed":"failed"};
  let displayed=[...vaults];
  if(filter!=="all") displayed=displayed.filter(v=>v.status===filterMap[filter]);
  if(sort==="deadline") displayed.sort((a,b)=>new Date(a.unlock_at)-new Date(b.unlock_at));
  displayed.sort((a,b)=>(pins.includes(b.id)?1:0)-(pins.includes(a.id)?1:0));
  const counts=s=>s==="all"?vaults.length:vaults.filter(v=>v.status===filterMap[s]).length;

  // 3 columns on wide screens, 2 on tablet, 1 on mobile
  const cols = width >= 1100 ? 3 : width >= 640 ? 2 : 1;

  const burgerItems = [
    { icon:"🌐", label: lang==="fr"?"English":"Français", onClick:()=>setLang(lang==="fr"?"en":"fr") },
    "divider",
    { icon:"➕", label:`+ ${t.newVault}`, onClick:onBack },
    "divider",
    { icon:"🚪", label:t.signOut, onClick:()=>setSignOutModal(true) },
  ];

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",background:T.bg,opacity:vis?1:0,transition:"opacity .4s ease"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:`40px 20px ${isMobile?"140px":"80px"}`}}>

        {/* HEADER */}
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <NavLogo/>
          {isMobile ? (
            <BurgerMenu items={burgerItems} lang={lang}/>
          ) : (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <LangToggle lang={lang} setLang={setLang}/>
              <button className="av-btn-ghost" onClick={onBack} style={{marginLeft:4}}>+ {t.newVault}</button>
              <button className="av-btn-ghost" onClick={()=>setSignOutModal(true)}>{t.signOut}</button>
            </div>
          )}
        </header>

        {/* TITLE + SORT */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <h1 style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?18:22,fontWeight:800,color:T.tx1,letterSpacing:"-.02em"}}>{t.yourVaults}</h1>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{fontSize:12,color:T.tx3}}>{t.sortBy}:</span>
            {[["newest",t.newest],["deadline",t.deadline_s]].map(([k,l])=>(
              <button key={k} className={`av-tab ${sort===k?"on":"off"}`} onClick={()=>setSort(k)} style={{padding:"4px 11px",fontSize:11}}>{l}</button>
            ))}
          </div>
        </div>

        {/* FILTER TABS */}
        <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap"}}>
          {["all","locked","unlocked","completed","failed"].map(s=>(
            <button key={s} className={`av-tab ${filter===s?"on":"off"}`} onClick={()=>setFilter(s)}>
              {statusLabels[s]}<span style={{marginLeft:5,fontSize:10,opacity:.6}}>{counts(s)}</span>
            </button>
          ))}
        </div>

        {/* GRID — fixed 3 cols max */}
        {displayed.length===0?(
          <div style={{textAlign:"center",padding:"70px 0"}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.2}}>🏛</div>
            <p style={{color:T.tx3,fontSize:14}}>{filter==="all"?t.noVaults:t.noFiltered}</p>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:14}}>
            {displayed.map((v,i)=>(
              <VaultCard key={v.id} vault={v} index={i}
                onOutcome={handleOutcome}
                pinned={pins.includes(v.id)}
                onTogglePin={handleTogglePin}
                lang={lang}/>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav className="av-bottom-nav">
          <button className="av-bottom-nav-item" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {t.newVault}
          </button>
          <button className="av-bottom-nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            {t.yourVaults}
          </button>
        </nav>
      )}

      {signOutModal&&(
        <SignOutModal onConfirm={()=>{setSignOutModal(false);onSignOut();}} onCancel={()=>setSignOutModal(false)} lang={lang}/>
      )}
    </div>
  );
}

// ─── VAULT CARD ───────────────────────────────────────────────────────────────
function VaultCard({ vault,index,onOutcome,pinned,onTogglePin,lang }) {
  const t=useT(lang);
  const cat=getCat(vault.category);
  const [now,setNow]=useState(Date.now());
  const [busy,setBusy]=useState(false);
  const [note,setNote]=useState("");
  const [showNote,setShowNote]=useState(false);
  const toast=useToast();

  useEffect(()=>{
    if(vault.status!=="locked") return;
    const id=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(id);
  },[vault.status]);

  const unlockMs=new Date(vault.unlock_at).getTime();
  const createdMs=new Date(vault.created_at).getTime();
  const remaining=unlockMs-now;
  const cd=fmtCountdown(remaining);
  const progress=pct(createdMs,unlockMs);

  const timerDone=vault.status==="locked"&&remaining<=0;

  const handle=async(outcome)=>{
    if(busy) return;
    setBusy(true);
    await onOutcome(vault,outcome,note||undefined);
    toast(outcome==="completed"?t.toastDelivered:t.toastMissed,outcome==="completed"?"success":"error");
  };

  const baseStyle={
    position:"relative",overflow:"hidden",
    background:T.surface,borderRadius:18,padding:"22px",
    border:`1px solid ${T.border}`,
    animation:`cardIn .3s ease ${Math.min(index,.5)*.06}s both`,
    transition:"border-color .2s",fontFamily:FONT_BODY,
  };

  // ⑤ Pin button — no vault number stamp
  const PinBtn=()=>(
    <button onClick={e=>{e.stopPropagation();onTogglePin(vault.id);}} title={pinned?t.unpin:t.pin}
      style={{position:"absolute",top:14,right:14,background:"transparent",border:"none",cursor:"pointer",padding:4,color:pinned?T.violet:T.tx3,fontSize:14,lineHeight:1,transition:"color .15s"}}
      onMouseEnter={e=>e.currentTarget.style.color=T.violet}
      onMouseLeave={e=>e.currentTarget.style.color=pinned?T.violet:T.tx3}>
      {pinned?"📌":"⊙"}
    </button>
  );

  // ── GRACE PERIOD ──
  if(timerDone) {
    return (
      <div style={{...baseStyle,borderColor:"rgba(139,92,246,.25)",boxShadow:"0 0 20px rgba(139,92,246,.07)"}}>
        <PinBtn/>
        {pinned&&<div className="chip" style={{background:T.violetDim,color:T.violet,border:`1px solid rgba(139,92,246,.25)`,marginBottom:12,fontSize:10}}>📌 {t.pinned}</div>}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.violet,animation:"gracePulse 1.5s ease-in-out infinite"}}/>
          <span style={{fontFamily:FONT_DISPLAY,fontSize:12,fontWeight:700,color:T.violet,letterSpacing:".04em"}}>{t.graceTitle}</span>
        </div>
        {/* Content hidden until unlocked — secret by design */}
        <div style={{padding:"14px 16px",background:T.violetDim,borderRadius:12,border:`1px solid rgba(139,92,246,.2)`}}>
          <p style={{fontSize:13,color:"rgba(139,92,246,.85)",lineHeight:1.7}}>{t.graceSub}</p>
        </div>
      </div>
    );
  }

  // ── LOCKED ──
  if(vault.status==="locked") {
    return (
      <div style={{...baseStyle,borderColor:`${cat.color}28`}}>
        <div style={{position:"absolute",top:-24,right:-24,width:80,height:80,borderRadius:"50%",background:`radial-gradient(circle,${cat.color}1A 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <PinBtn/>
        {pinned&&<div className="chip" style={{background:T.violetDim,color:T.violet,border:`1px solid rgba(139,92,246,.25)`,marginBottom:10,fontSize:10}}>📌 {t.pinned}</div>}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,paddingRight:24}}>
          <span style={{fontSize:13,color:cat.color}}>{cat.symbol}</span>
          <div className="chip" style={{background:`${cat.color}15`,color:cat.color,border:`1px solid ${cat.color}30`}}>{t.locked}</div>
        </div>
        {/* Always secret — show lock placeholder */}
        <div style={{marginBottom:16,padding:"14px",background:`${cat.color}0D`,borderRadius:10,border:`1px dashed ${cat.color}2A`,textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:4}}>🔒</div>
          <p style={{fontSize:12,color:T.tx2}}>{lang==="fr"?"Contenu confidentiel — révélé à l'ouverture du coffre.":"Confidential — content revealed when the vault opens."}</p>
        </div>
        <div style={{marginBottom:14}}>
          <div className="pbar" style={{marginBottom:7}}>
            <div className="pfill" style={{width:`${progress}%`,background:`linear-gradient(90deg,${cat.color},${cat.color}99)`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:T.tx3}}>{Math.round(progress)}% {t.elapsed}</span>
            <span style={{fontSize:11,color:T.tx3}}>{fmtDate(vault.deadline_date,vault.deadline_time)}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[{v:cd.days,l:t.d},{v:cd.hours,l:t.h},{v:cd.minutes,l:t.m},{v:cd.seconds,l:t.s}].map(({v,l})=>(
            <div key={l} style={{flex:1,padding:"9px 4px",borderRadius:10,textAlign:"center",background:`${cat.color}0F`,border:`1px solid ${cat.color}1E`}}>
              <div style={{fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:800,color:cat.color,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{String(v).padStart(2,"0")}</div>
              <div style={{fontSize:10,color:T.tx3,marginTop:2,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── UNLOCKED ──
  if(vault.status==="unlocked") {
    return (
      <div style={{...baseStyle,borderColor:"rgba(52,211,153,.28)",boxShadow:"0 0 20px rgba(52,211,153,.06)"}}>
        <PinBtn/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingRight:24}}>
          <div className="chip" style={{background:T.greenDim,color:T.green,border:"1px solid rgba(52,211,153,.25)"}}>
            <span style={{animation:"vaultBounce 1.5s ease-in-out infinite",display:"inline-block"}}>🔓</span>
            {t.timeIsUp}
          </div>
        </div>
        {/* Reveal secret content on unlock */}
        <p style={{fontSize:14,fontWeight:600,color:T.tx1,lineHeight:1.6,marginBottom:6}}>{vault.secret_text||vault.text}</p>
        <div style={{display:"inline-flex",alignItems:"center",gap:4,marginBottom:14,padding:"2px 8px",background:T.greenDim,borderRadius:20,border:"1px solid rgba(52,211,153,.2)"}}>
          <span style={{fontSize:11,color:T.green}}>✨ {lang==="fr"?"Contenu révélé":"Content revealed"}</span>
        </div>
        <p style={{fontSize:13,color:T.tx2,marginBottom:14,lineHeight:1.5,fontWeight:500}}>{t.didYouAchieve}</p>
        {showNote?(
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.addNote} rows={2}
            style={{width:"100%",background:T.surfaceEl,border:`1px solid ${T.borderMd}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.tx1,lineHeight:1.6,resize:"none",outline:"none",marginBottom:12,fontFamily:FONT_BODY}}/>
        ):(
          <button onClick={()=>setShowNote(true)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:12,color:T.tx3,marginBottom:12,padding:0,textDecoration:"underline",textDecorationStyle:"dotted"}}>
            + {t.addNote.replace("…","")}
          </button>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>handle("completed")} disabled={busy}
            style={{flex:1,padding:"11px 8px",borderRadius:11,border:"none",cursor:busy?"wait":"pointer",background:busy?"rgba(52,211,153,.15)":"linear-gradient(135deg,#059669,#34D399)",color:"#fff",fontSize:13,fontWeight:700,fontFamily:FONT_DISPLAY,boxShadow:busy?"none":"0 4px 16px rgba(52,211,153,.25)",transition:"opacity .15s",opacity:busy?.6:1}}>
            {t.yes}
          </button>
          <button onClick={()=>handle("failed")} disabled={busy}
            style={{flex:1,padding:"11px 8px",borderRadius:11,cursor:busy?"wait":"pointer",background:T.redDim,border:`1px solid rgba(248,113,113,.2)`,color:T.red,fontSize:13,fontWeight:600,fontFamily:FONT_DISPLAY,transition:"opacity .15s",opacity:busy?.6:1}}>
            {t.no}
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETED ──
  if(vault.status==="completed") {
    return (
      <div style={{...baseStyle,background:`linear-gradient(145deg,rgba(52,211,153,.07) 0%,${T.surface} 55%)`,borderColor:"rgba(52,211,153,.2)"}}>
        <PinBtn/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingRight:24}}>
          <div className="chip" style={{background:T.greenDim,color:T.green,border:"1px solid rgba(52,211,153,.22)"}}>✓ {t.achieved}</div>
          <span style={{fontSize:16,opacity:.8}}>🏆</span>
        </div>
        <p style={{fontSize:14,color:T.tx2,lineHeight:1.55,marginBottom:12,textDecoration:"line-through",textDecorationColor:"rgba(52,211,153,.4)"}}>{vault.secret_text||vault.text}</p>
        {vault.feedback_message&&(
          <div style={{padding:"11px 14px",background:T.greenDim,borderRadius:10,borderLeft:`3px solid ${T.green}`}}>
            <p style={{fontSize:12,color:"rgba(52,211,153,.85)",fontStyle:"italic",lineHeight:1.65}}>"{vault.feedback_message}"</p>
          </div>
        )}
        <div style={{marginTop:12,display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:T.green}}/>
          <span style={{fontSize:11,color:T.tx3}}>{fmtDate(vault.deadline_date,vault.deadline_time)}</span>
        </div>
      </div>
    );
  }

  // ── FAILED ──
  return (
    <div style={{...baseStyle,opacity:.55}}>
      <PinBtn/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingRight:24}}>
        <div className="chip" style={{background:"rgba(255,255,255,.04)",color:T.tx2,border:`1px solid ${T.border}`}}>{t.missed}</div>
        <span style={{fontSize:14,opacity:.4}}>💪</span>
      </div>
      <p style={{fontSize:14,color:T.tx2,lineHeight:1.55,marginBottom:10,textDecoration:"line-through",textDecorationColor:T.tx3}}>{vault.secret_text||vault.text}</p>
      {vault.feedback_message&&(
        <p style={{fontSize:12,color:T.tx3,fontStyle:"italic",lineHeight:1.6}}>{vault.feedback_message}</p>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [user,setUser]=useState(null);
  const [vaults,setVaults]=useState([]);
  const [lang,setLang]=useState("fr");

  useEffect(()=>{
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){
        const u=session.user;
        setUser({uid:u.id,email:u.email,name:u.user_metadata?.full_name||u.email});
        setScreen(p=>p==="login"?"splash":p);
      } else {
        setUser(null);setVaults([]);setScreen("landing");
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user) return;
    return watchVaults(user.uid,setVaults);
  },[user]);

  const handleUpdateVault=useCallback((id,patch)=>{
    setVaults(prev=>prev.map(v=>v.id===id?{...v,...patch}:v));
  },[]);

  const handleAddVault=async(params)=>{
    const unlockAt=new Date(`${params.deadlineDate}T${params.deadlineTime}:00`).toISOString();
    const temp={
      id:"temp-"+Date.now(),uid:params.uid,email:params.email,
      text:null, secret_text:params.text,
      secret:true, deadline_date:params.deadlineDate,deadline_time:params.deadlineTime,
      unlock_at:unlockAt,category:params.category,status:"locked",
      created_at:new Date().toISOString(),feedback_message:null,responded_at:null,
    };
    setVaults(p=>[temp,...p]);
    setScreen("vaults");
    await createVault(params);
  };

  const shared={lang,setLang};
  return (
    <ToastProvider>
      <style>{CSS}</style>
      {screen === "landing" && <LandingPage lang={lang} setLang={setLang} onEnter={() => setScreen("login")} />}
      {screen==="login"&&<Login {...shared}/>}
      {screen==="splash"&&<Splash onComplete={()=>setScreen("dashboard")} {...shared}/>}
      {screen==="dashboard"&&user&&(
        <Dashboard user={user} vaults={vaults}
          onAdd={handleAddVault}
          onViewVaults={()=>setScreen("vaults")}
          onSignOut={()=>supabase.auth.signOut()}
          {...shared}/>
      )}
      {screen==="vaults"&&user&&(
        <VaultsScreen vaults={vaults}
          onBack={()=>setScreen("dashboard")}
          onSignOut={()=>supabase.auth.signOut()}
          onUpdateVault={handleUpdateVault}
          {...shared}/>
      )}
    </ToastProvider>
  );
}