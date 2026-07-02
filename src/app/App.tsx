// AxisVault — Full Application
// Stack: React + Vite + Supabase (Auth + Postgres)
// Features:
//   - Google OAuth via Supabase Auth
//   - Bilingual EN/FR
//   - Vault categories (Health, Career, Love, Finance, Personal)
//   - Secret mode: content hidden until unlock
//   - Streak tracker
//   - New splash: vault dial animation
//   - Supabase Edge Function triggers (check-vaults cron via GitHub Actions)
//   - RLS: vaults are immutable from client after creation

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "AxisVault",
    tagline: "Lock in. Level up.",
    loginTitle: "Set your goals.",
    loginHighlight: "Lock them in.",
    loginSub: "Become the best version of yourself.\nOne committed goal at a time.",
    continueGoogle: "Continue with Google",
    signingIn: "Signing in…",
    terms: "By continuing, you agree to our Terms & Privacy Policy.",
    whatWillYou: "What will you",
    lockInToday: "lock in today?",
    inputSub: "Write your goal. Set a deadline. Commit — and it becomes irreversible.",
    placeholder: "What is your next big challenge?",
    deadline: "Deadline:",
    lockVault: "LOCK VAULT",
    viewGoals: "Goals",
    signOut: "Sign out",
    welcomeBack: "Welcome back",
    active: "Active",
    unlocked: "Unlocked",
    completed: "Completed",
    failed: "Failed",
    successRate: "Success rate",
    streak: "day streak 🔥",
    yourGoals: "Your Vaults",
    newGoal: "+ New Vault",
    noGoals: "No vaults locked yet. Start your first one.",
    irreversible: "This is irreversible.",
    irreversibleSub: "Once locked, this vault cannot be edited or deleted until your deadline passes.",
    typeCommit: "Type",
    toConfirm: "to confirm:",
    cancel: "Cancel",
    lockItIn: "Lock It In",
    saving: "Saving…",
    unlocks: "Unlocks:",
    locked: "Locked",
    timeIsUp: "Time is up",
    achieved: "Achieved",
    notThisTime: "Not this time",
    didYouAchieve: "Did you achieve this goal?",
    yesIdidIt: "✨ Yes, I did it!",
    iFellShort: "I fell short",
    elapsed: "elapsed",
    days: "days",
    hrs: "hrs",
    min: "min",
    sec: "sec",
    category: "Category:",
    secretMode: "Secret mode",
    secretHint: "Content hidden until unlocked",
    hiddenContent: "Content revealed on unlock",
    categories: {
      personal: "Personal",
      career: "Career",
      health: "Health",
      finance: "Finance",
      love: "Love",
    },
    congrats: [
      "Every great achievement was once considered impossible. You proved them wrong.",
      "You set the standard. Now raise it again.",
      "Discipline is choosing between what you want now and what you want most.",
      "The vault is open. The next one awaits.",
      "Champions do what others won't. You just proved you are one.",
    ],
    encourage: [
      "Every miss is data. The vault doesn't judge — it waits.",
      "You showed up. That's already more than most. Lock a new one.",
      "Failure is just a locked door you haven't found the key for yet.",
      "The strongest vaults take the most attempts. Reset and go again.",
      "Not this time — but you're still here. That's the whole game.",
    ],
    loginError: "Sign-in failed. Please try again.",
  },
  fr: {
    appName: "AxisVault",
    tagline: "Verrouille. Évolue.",
    loginTitle: "Fixe tes objectifs.",
    loginHighlight: "Verrouille-les.",
    loginSub: "Deviens la meilleure version de toi-même.\nUn engagement à la fois.",
    continueGoogle: "Continuer avec Google",
    signingIn: "Connexion…",
    terms: "En continuant, tu acceptes nos Conditions & Politique de confidentialité.",
    whatWillYou: "Qu'est-ce que tu vas",
    lockInToday: "verrouiller aujourd'hui ?",
    inputSub: "Écris ton objectif. Fixe une deadline. Engage-toi — c'est irréversible.",
    placeholder: "Quel est ton prochain grand défi ?",
    deadline: "Deadline :",
    lockVault: "VERROUILLER",
    viewGoals: "Coffres",
    signOut: "Déconnexion",
    welcomeBack: "Bon retour",
    active: "Actifs",
    unlocked: "Ouverts",
    completed: "Réussis",
    failed: "Échoués",
    successRate: "Taux de réussite",
    streak: "jours de suite 🔥",
    yourGoals: "Mes Coffres",
    newGoal: "+ Nouveau Coffre",
    noGoals: "Aucun coffre verrouillé. Lance-toi !",
    irreversible: "C'est irréversible.",
    irreversibleSub: "Une fois verrouillé, ce coffre ne peut être ni modifié ni supprimé jusqu'à la deadline.",
    typeCommit: "Tape",
    toConfirm: "pour confirmer :",
    cancel: "Annuler",
    lockItIn: "Verrouiller",
    saving: "Sauvegarde…",
    unlocks: "S'ouvre le :",
    locked: "Verrouillé",
    timeIsUp: "Temps écoulé",
    achieved: "Accompli",
    notThisTime: "Pas cette fois",
    didYouAchieve: "As-tu atteint cet objectif ?",
    yesIdidIt: "✨ Oui, je l'ai fait !",
    iFellShort: "Je n'y suis pas arrivé",
    elapsed: "écoulé",
    days: "j",
    hrs: "h",
    min: "min",
    sec: "sec",
    category: "Catégorie :",
    secretMode: "Mode secret",
    secretHint: "Contenu masqué jusqu'à l'ouverture",
    hiddenContent: "Contenu révélé à l'ouverture",
    categories: {
      personal: "Personnel",
      career: "Carrière",
      health: "Santé",
      finance: "Finance",
      love: "Amour",
    },
    congrats: [
      "Chaque grand succès était autrefois impossible. Tu viens de le prouver.",
      "Tu as fixé la barre. Maintenant relève-la encore.",
      "La discipline, c'est choisir ce que tu veux le plus plutôt que ce que tu veux maintenant.",
      "Le coffre est ouvert. Le prochain t'attend.",
      "Les champions font ce que les autres ne font pas. Tu viens de le prouver.",
    ],
    encourage: [
      "Chaque raté est une donnée. Le coffre ne juge pas — il attend.",
      "Tu t'es présenté. C'est déjà plus que la plupart. Verrouilles-en un nouveau.",
      "L'échec, c'est juste une porte fermée dont tu n'as pas encore trouvé la clé.",
      "Les coffres les plus solides demandent le plus d'essais. Recommence.",
      "Pas cette fois — mais tu es encore là. C'est tout le jeu.",
    ],
    loginError: "Connexion échouée. Réessaie.",
  },
};

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "personal", emoji: "⭐", color: "#8B5CF6" },
  { id: "career",   emoji: "💼", color: "#3B82F6" },
  { id: "health",   emoji: "💪", color: "#34D399" },
  { id: "finance",  emoji: "💰", color: "#F59E0B" },
  { id: "love",     emoji: "❤️", color: "#F43F5E" },
];

function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function progressPercent(createdAt, unlockAt) {
  const total = unlockAt - createdAt;
  const elapsed = Date.now() - createdAt;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function calcStreak(goals) {
  const completed = goals
    .filter((g) => g.status === "completed" && g.responded_at)
    .map((g) => new Date(g.responded_at).toDateString());
  const unique = [...new Set(completed)].sort((a, b) => new Date(b) - new Date(a));
  if (!unique.length) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

async function signOutUser() {
  return supabase.auth.signOut();
}

async function createVault({ uid, email, text, deadlineDate, deadlineTime, category, secret }) {
  const unlockAt = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
  return supabase.from("vaults").insert({
    uid,
    email,
    text: secret ? null : text,        // secret vaults: text stored separately
    secret_text: secret ? text : null, // only revealed after unlock by edge function
    secret,
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

// Client can ONLY update status from unlocked → completed/failed + feedback_message
// RLS blocks any other update. The Edge Function uses service role key (bypasses RLS).
async function respondToVault(vaultId, status, feedbackMessage) {
  return supabase
    .from("vaults")
    .update({ status, feedback_message: feedbackMessage, responded_at: new Date().toISOString() })
    .eq("id", vaultId)
    .eq("status", "unlocked"); // RLS double-check: only allowed when unlocked
}

function watchVaults(uid, cb) {
  const channel = supabase
    .channel("vaults-" + uid)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vaults", filter: `uid=eq.${uid}` },
      () => fetchVaults(uid).then(cb)
    )
    .subscribe();
  fetchVaults(uid).then(cb);
  return () => supabase.removeChannel(channel);
}

async function fetchVaults(uid) {
  const { data } = await supabase
    .from("vaults")
    .select("*")
    .eq("uid", uid)
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── VaultDial Splash ─────────────────────────────────────────────────────────
// Signature animation: rotating combination dial → click → vault opens with golden light

function SplashScreen({ onComplete, lang }) {
  const t = T[lang];
  const [phase, setPhase] = useState(0);
  // 0: mount  1: dial spins  2: click  3: cracks open  4: fade out
  const [dialAngle, setDialAngle] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    // Phase 1: spin the dial for 2.2s
    const t1 = setTimeout(() => {
      setPhase(1);
      startRef.current = performance.now();
      const spin = (now) => {
        const elapsed = now - startRef.current;
        const progress = Math.min(1, elapsed / 2200);
        // easeInOutQuart
        const eased = progress < 0.5
          ? 8 * progress ** 4
          : 1 - (-2 * progress + 2) ** 4 / 2;
        setDialAngle(eased * 1080); // 3 full turns
        if (progress < 1) rafRef.current = requestAnimationFrame(spin);
        else setPhase(2);
      };
      rafRef.current = requestAnimationFrame(spin);
    }, 400);

    // Phase 3: vault cracks
    const t3 = setTimeout(() => setPhase(3), 3200);
    // Phase 4: fade out
    const t4 = setTimeout(() => setFadeOut(true), 4200);
    const t5 = setTimeout(() => onComplete(), 4700);

    return () => {
      [t1, t3, t4, t5].forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  const isOpen = phase >= 3;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#070D1A",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transition: "opacity 0.5s ease",
        opacity: fadeOut ? 0 : 1,
        overflow: "hidden",
      }}
    >
      {/* Radial background glow */}
      <div style={{
        position: "absolute",
        width: 500, height: 500,
        borderRadius: "50%",
        background: isOpen
          ? "radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)"
          : "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        transition: "background 0.8s ease",
        pointerEvents: "none",
      }} />

      {/* Vault body */}
      <div style={{
        position: "relative",
        width: 160, height: 160,
        transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
        opacity: phase >= 1 ? 1 : 0,
        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        marginBottom: 48,
      }}>
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <defs>
            <linearGradient id="splashBody" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isOpen ? "#92400E" : "#4C1D95"} />
              <stop offset="100%" stopColor={isOpen ? "#D97706" : "#1D4ED8"} />
            </linearGradient>
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <filter id="splashShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="16"
                floodColor={isOpen ? "#FCD34D" : "#8B5CF6"}
                floodOpacity={isOpen ? "0.6" : "0.5"} />
            </filter>
          </defs>

          {/* Gold burst behind vault when open */}
          {isOpen && (
            <ellipse cx="80" cy="84" rx="72" ry="72" fill="url(#goldGlow)"
              style={{ animation: "goldPulse 1.5s ease-in-out infinite" }} />
          )}

          {/* Vault door */}
          <rect
            x={isOpen ? "16" : "16"} y="20"
            width="128" height="120" rx="20"
            fill="url(#splashBody)"
            filter="url(#splashShadow)"
            style={{
              transform: isOpen ? "rotateY(-30deg)" : "rotateY(0deg)",
              transformOrigin: "16px 80px",
              transition: "transform 0.6s ease",
            }}
          />

          {/* Surface sheen */}
          <rect x="28" y="32" width="104" height="96" rx="14" fill="rgba(255,255,255,0.06)" />

          {/* Light escaping from crack when open */}
          {isOpen && (
            <rect x="14" y="20" width="6" height="120" rx="3"
              fill="#FCD34D" opacity="0.9"
              style={{ animation: "lightPulse 1s ease-in-out infinite alternate" }}
            />
          )}

          {/* Combination dial — rotates during phase 1 */}
          <g transform={`translate(80, 80)`}>
            {/* Outer ring */}
            <circle r="38" stroke={isOpen ? "#D97706" : "rgba(167,139,250,0.6)"} strokeWidth="3"
              fill="rgba(255,255,255,0.04)"
              style={{ transition: "stroke 0.6s ease" }} />
            {/* Inner ring */}
            <circle r="28" stroke={isOpen ? "#F59E0B" : "rgba(139,92,246,0.4)"} strokeWidth="1.5"
              fill="rgba(0,0,0,0.2)"
              style={{ transition: "stroke 0.6s ease" }} />
            {/* Center knob */}
            <circle r="10" fill={isOpen ? "#D97706" : "#7C3AED"}
              style={{ transition: "fill 0.6s ease" }} />
            <circle r="4" fill={isOpen ? "#FCD34D" : "#A78BFA"}
              style={{ transition: "fill 0.6s ease" }} />

            {/* Spinning group */}
            <g style={{ transform: `rotate(${dialAngle}deg)`, transformOrigin: "0 0", transition: phase === 2 ? "transform 0.3s ease" : "none" }}>
              {/* Notch indicator */}
              <line x1="0" y1="-38" x2="0" y2="-28"
                stroke={isOpen ? "#FCD34D" : "#A78BFA"} strokeWidth="3" strokeLinecap="round" />
              {/* Tick marks */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="0" y1="-32"
                  x2="0" y2={i % 3 === 0 ? "-26" : "-29"}
                  stroke={isOpen ? "rgba(253,211,77,0.5)" : "rgba(167,139,250,0.4)"}
                  strokeWidth={i % 3 === 0 ? 2 : 1}
                  strokeLinecap="round"
                  style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: "0 0" }}
                />
              ))}
              {/* Numbers around dial */}
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((n, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                return (
                  <text key={n}
                    x={Math.cos(angle) * 20}
                    y={Math.sin(angle) * 20 + 4}
                    fontSize="5" textAnchor="middle"
                    fill={isOpen ? "rgba(253,211,77,0.7)" : "rgba(167,139,250,0.6)"}
                    style={{ fontFamily: "monospace" }}>
                    {n}
                  </text>
                );
              })}
            </g>
          </g>

          {/* Handle */}
          <rect x="112" y="72" width="24" height="16" rx="6"
            fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Hinge bolts */}
          <circle cx="24" cy="44" r="6" fill="rgba(255,255,255,0.1)" />
          <circle cx="24" cy="116" r="6" fill="rgba(255,255,255,0.1)" />

          {/* Crack lines when open */}
          {isOpen && (
            <>
              <line x1="80" y1="20" x2="88" y2="50" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
              <line x1="88" y1="50" x2="76" y2="70" stroke="#34D399" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
              <line x1="76" y1="70" x2="84" y2="90" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </>
          )}
        </svg>

        {/* Phase indicator: "click" pulse when dial stops spinning */}
        {phase === 2 && (
          <div style={{
            position: "absolute", bottom: -16, left: "50%",
            transform: "translateX(-50%)",
            fontSize: 11, color: "#8B5CF6",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "0.15em", textTransform: "uppercase",
            animation: "blink 1s ease-in-out infinite",
          }}>
            ▸ CLICK
          </div>
        )}
      </div>

      {/* App name */}
      <div style={{
        textAlign: "center",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.6s ease 0.3s",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 36, fontWeight: 800,
          color: isOpen ? "#FCD34D" : "#F1F5F9",
          letterSpacing: "-0.02em",
          transition: "color 0.6s ease",
        }}>
          {t.appName}
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, fontWeight: 400,
          color: isOpen ? "rgba(253,211,77,0.7)" : "#475569",
          marginTop: 6, letterSpacing: "0.12em", textTransform: "uppercase",
          transition: "color 0.6s ease",
        }}>
          {t.tagline}
        </div>
      </div>

      <style>{`
        @keyframes goldPulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes lightPulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        @keyframes blink {
          0%,100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLoginSuccess, lang, setLang }) {
  const t = T[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(tm);
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(t.loginError);
      setLoading(false);
    }
    // Supabase redirects back → onAuthStateChange handles the rest
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "#070D1A",
      transition: "opacity 0.6s ease", opacity: visible ? 1 : 0,
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", top: "8%", left: "10%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "12%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Lang toggle */}
      <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 4 }}>
        {["en", "fr"].map((l) => (
          <button key={l} onClick={() => setLang(l)}
            style={{
              padding: "4px 10px", borderRadius: 20,
              background: lang === l ? "rgba(139,92,246,0.2)" : "transparent",
              border: `1px solid ${lang === l ? "rgba(139,92,246,0.4)" : "rgba(148,163,184,0.12)"}`,
              color: lang === l ? "#A78BFA" : "#475569",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "all 0.2s",
            }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 400, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 48px rgba(139,92,246,0.4)",
          }}>
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
              <rect x="8" y="10" width="64" height="60" rx="10" fill="rgba(255,255,255,0.9)" />
              <circle cx="40" cy="40" r="14" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
              <circle cx="40" cy="40" r="5" fill="#8B5CF6" />
              <line x1="40" y1="27" x2="40" y2="30" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="56" y="36" width="10" height="8" rx="3" fill="#64748B" />
            </svg>
          </div>
        </div>

        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#475569", marginBottom: 14 }}>
          AxisVault
        </div>

        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 30, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 14 }}>
          {t.loginTitle}<br />
          <span style={{ background: "linear-gradient(90deg, #34D399, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t.loginHighlight}
          </span>
        </h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#64748B", lineHeight: 1.7, marginBottom: 52, whiteSpace: "pre-line" }}>
          {t.loginSub}
        </p>

        <button onClick={handleGoogle} disabled={loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            width: "100%", padding: "15px 24px", borderRadius: 9999,
            background: "#ffffff", border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease", opacity: loading ? 0.75 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)"; }}>
          {loading
            ? <div style={{ width: 20, height: 20, border: "2.5px solid #E2E8F0", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            : <GoogleLogo />}
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "#1E293B" }}>
            {loading ? t.signingIn : t.continueGoogle}
          </span>
        </button>

        {error && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#F87171", marginTop: 16 }}>{error}</p>}

        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#334155", marginTop: 22 }}>{t.terms}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.759-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
      <path d="M4.405 11.9A6.01 6.01 0 014.09 10c0-.662.114-1.305.314-1.9V5.51H1.063A9.996 9.996 0 000 10c0 1.614.386 3.141 1.064 4.491L4.405 11.9z" fill="#FBBC05" />
      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0A9.996 9.996 0 001.064 5.51L4.405 8.1C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
    </svg>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ user, vaults, onAddVault, onViewVaults, onSignOut, lang, setLang }) {
  const t = T[lang];
  const [text, setText] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [category, setCategory] = useState("personal");
  const [secret, setSecret] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commitWord, setCommitWord] = useState("");
  const [shaking, setShaking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const tm = setTimeout(() => setVisible(true), 60); return () => clearTimeout(tm); }, []);

  const today = new Date().toISOString().split("T")[0];
  const canLock = text.trim() && deadlineDate;

  const handleLock = () => { if (!canLock) return; setShowModal(true); };

  const handleConfirm = async () => {
    if (commitWord !== "COMMIT") {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    setSaving(true);
    await onAddVault({ uid: user.uid, email: user.email, text: text.trim(), deadlineDate, deadlineTime, category, secret });
    setShowModal(false);
    setText(""); setDeadlineDate(""); setDeadlineTime("23:59");
    setCommitWord(""); setSecret(false);
    setSaving(false);
  };

  const active = vaults.filter((v) => v.status === "locked").length;
  const unlocked = vaults.filter((v) => v.status === "unlocked").length;
  const completed = vaults.filter((v) => v.status === "completed").length;
  const failed = vaults.filter((v) => v.status === "failed").length;
  const resolved = completed + failed;
  const successRate = resolved > 0 ? Math.round((completed / resolved) * 100) : null;
  const streak = calcStreak(vaults);

  return (
    <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "#070D1A", transition: "opacity 0.5s ease", opacity: visible ? 1 : 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 24px 100px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #8B5CF6, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(139,92,246,0.4)" }}>
                <svg width="18" height="18" viewBox="0 0 80 80" fill="none">
                  <rect x="8" y="10" width="64" height="60" rx="10" fill="rgba(255,255,255,0.9)" />
                  <circle cx="40" cy="40" r="12" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
                  <circle cx="40" cy="40" r="4" fill="#8B5CF6" />
                  <line x1="40" y1="29" x2="40" y2="32" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="54" y="37" width="9" height="7" rx="2.5" fill="#64748B" />
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.01em" }}>AxisVault</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569" }}>
              {t.welcomeBack}, <span style={{ color: "#8B5CF6", fontWeight: 600 }}>{user.name?.split(" ")[0]}</span>
              {streak > 1 && <span style={{ marginLeft: 10, fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>{streak} {t.streak}</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Lang toggle */}
            {["en", "fr"].map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "4px 8px", borderRadius: 16, background: lang === l ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${lang === l ? "rgba(139,92,246,0.3)" : "rgba(148,163,184,0.1)"}`, color: lang === l ? "#A78BFA" : "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}>
                {l.toUpperCase()}
              </button>
            ))}
            {vaults.length > 0 && (
              <button onClick={onViewVaults}
                style={{ fontSize: 13, fontWeight: 600, color: "#8B5CF6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}>
                {t.viewGoals} ({vaults.length})
              </button>
            )}
            <button onClick={onSignOut}
              style={{ fontSize: 12, fontWeight: 500, color: "#334155", background: "transparent", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#64748B"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#334155"; }}>
              {t.signOut}
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 12 }}>
            {t.whatWillYou}<br />
            <span style={{ background: "linear-gradient(90deg, #34D399 0%, #3B82F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t.lockInToday}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>{t.inputSub}</p>
        </div>

        {/* Input card */}
        <div style={{ background: "#0F1829", borderRadius: 20, border: "1px solid rgba(139,92,246,0.2)", overflow: "hidden", marginBottom: 14, boxShadow: "0 4px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(139,92,246,0.08)" }}>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder} rows={4}
            style={{ width: "100%", padding: "20px 22px", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "#F1F5F9", lineHeight: 1.6, boxSizing: "border-box" }}
          />

          {/* Category row */}
          <div style={{ padding: "0 22px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{t.category}</span>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{
                  padding: "3px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: category === cat.id ? `${cat.color}22` : "transparent",
                  border: `1px solid ${category === cat.id ? `${cat.color}66` : "rgba(148,163,184,0.1)"}`,
                  color: category === cat.id ? cat.color : "#475569",
                  transition: "all 0.15s",
                }}>
                {cat.emoji} {t.categories[cat.id]}
              </button>
            ))}
          </div>

          {/* Deadline + secret row */}
          <div style={{ padding: "0 22px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{t.deadline}</span>
            <input type="date" value={deadlineDate} min={today} onChange={(e) => setDeadlineDate(e.target.value)}
              style={{ background: "#1E293B", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 8, padding: "5px 10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: deadlineDate ? "#F1F5F9" : "#475569", colorScheme: "dark", outline: "none" }} />
            <input type="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)}
              style={{ background: "#1E293B", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 8, padding: "5px 10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#F1F5F9", colorScheme: "dark", outline: "none" }} />

            {/* Secret toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginLeft: "auto" }}>
              <div onClick={() => setSecret(!secret)}
                style={{
                  width: 34, height: 19, borderRadius: 10,
                  background: secret ? "#8B5CF6" : "rgba(148,163,184,0.15)",
                  border: `1px solid ${secret ? "#7C3AED" : "rgba(148,163,184,0.2)"}`,
                  position: "relative", cursor: "pointer",
                  transition: "background 0.2s",
                }}>
                <div style={{
                  position: "absolute", top: 2,
                  left: secret ? 16 : 2,
                  width: 13, height: 13, borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </div>
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>🔒 {t.secretMode}</span>
            </label>
          </div>

          {secret && (
            <div style={{ margin: "0 22px 20px", padding: "8px 12px", background: "rgba(139,92,246,0.08)", borderRadius: 8, border: "1px solid rgba(139,92,246,0.15)" }}>
              <p style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500 }}>🙈 {t.secretHint}</p>
            </div>
          )}
        </div>

        {/* Lock button */}
        <button onClick={handleLock} disabled={!canLock}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: 14,
            background: canLock ? "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)" : "rgba(139,92,246,0.12)",
            border: "none", cursor: canLock ? "pointer" : "not-allowed",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700,
            color: canLock ? "#ffffff" : "#334155", letterSpacing: "0.05em",
            transition: "all 0.25s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: canLock ? "0 4px 28px rgba(139,92,246,0.45)" : "none",
          }}
          onMouseEnter={(e) => { if (canLock) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(139,92,246,0.55)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = canLock ? "0 4px 28px rgba(139,92,246,0.45)" : "none"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
          {t.lockVault}
        </button>

        {/* Stats */}
        {vaults.length > 0 && (
          <>
            <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: t.active, value: active, color: "#8B5CF6" },
                { label: t.unlocked, value: unlocked, color: "#34D399" },
                { label: t.completed, value: completed, color: "#F59E0B" },
                { label: t.failed, value: failed, color: "#F87171" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#0F1829", borderRadius: 14, padding: "14px 8px", border: "1px solid rgba(148,163,184,0.07)", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {successRate !== null && (
              <div style={{ marginTop: 10, background: "#0F1829", borderRadius: 14, padding: "14px 20px", border: "1px solid rgba(148,163,184,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{t.successRate}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 100, height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${successRate}%`, background: successRate >= 70 ? "#34D399" : successRate >= 40 ? "#F59E0B" : "#F87171", borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: successRate >= 70 ? "#34D399" : successRate >= 40 ? "#F59E0B" : "#F87171" }}>{successRate}%</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CommitModal
          goalText={text} deadline={`${deadlineDate} ${deadlineTime}`}
          commitWord={commitWord} onCommitWordChange={setCommitWord}
          onConfirm={handleConfirm} onCancel={() => { setShowModal(false); setCommitWord(""); }}
          shaking={shaking} saving={saving} lang={lang}
        />
      )}
    </div>
  );
}

// ─── CommitModal ──────────────────────────────────────────────────────────────
function CommitModal({ goalText, deadline, commitWord, onCommitWordChange, onConfirm, onCancel, shaking, saving, lang }) {
  const t = T[lang];
  const canConfirm = commitWord === "COMMIT";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(7,13,26,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", animation: "fadeIn 0.2s ease" }}>
      <div style={{ background: "#0F1829", borderRadius: 24, padding: "36px 32px", maxWidth: 440, width: "100%", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🔒</div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em" }}>{t.irreversible}</h2>
        <p style={{ fontSize: 13, color: "#475569", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>{t.irreversibleSub}</p>

        <div style={{ background: "#070D1A", borderRadius: 12, padding: "14px 16px", marginBottom: 24, border: "1px solid rgba(139,92,246,0.12)" }}>
          <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, lineHeight: 1.5, marginBottom: 6 }}>"{goalText}"</p>
          <p style={{ fontSize: 12, color: "#334155" }}>{t.unlocks} <span style={{ color: "#475569" }}>{deadline}</span></p>
        </div>

        <p style={{ fontSize: 13, color: "#64748B", marginBottom: 10, fontWeight: 500 }}>
          {t.typeCommit} <span style={{ color: "#8B5CF6", fontWeight: 700 }}>COMMIT</span> {t.toConfirm}
        </p>
        <input type="text" value={commitWord} onChange={(e) => onCommitWordChange(e.target.value.toUpperCase())}
          placeholder="COMMIT" autoFocus
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "#1E293B", border: `1.5px solid ${canConfirm ? "#8B5CF6" : "rgba(148,163,184,0.1)"}`, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#F1F5F9", outline: "none", letterSpacing: "0.1em", transition: "border-color 0.2s", animation: shaking ? "shake 0.4s ease" : "none", marginBottom: 20, boxSizing: "border-box" }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", color: "#64748B", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
          <button onClick={onConfirm} disabled={!canConfirm || saving}
            style={{ flex: 2, padding: "12px", borderRadius: 10, background: canConfirm && !saving ? "linear-gradient(135deg, #8B5CF6, #3B82F6)" : "rgba(139,92,246,0.12)", border: "none", color: canConfirm && !saving ? "#fff" : "#334155", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: canConfirm && !saving ? "pointer" : "not-allowed", boxShadow: canConfirm && !saving ? "0 4px 16px rgba(139,92,246,0.4)" : "none" }}>
            {saving ? t.saving : t.lockItIn}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(24px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
}

// ─── Vaults Grid Screen ───────────────────────────────────────────────────────
function VaultsScreen({ vaults, onBack, onSignOut, lang, setLang }) {
  const t = T[lang];
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState("all");
  const confettiRef = useRef(null);

  useEffect(() => { const tm = setTimeout(() => setVisible(true), 60); return () => clearTimeout(tm); }, []);

  const handleOutcome = useCallback(async (vaultId, outcome) => {
    const quotes = outcome === "completed" ? T[lang].congrats : T[lang].encourage;
    const msg = quotes[Math.floor(Math.random() * quotes.length)];
    await respondToVault(vaultId, outcome, msg);
    if (outcome === "completed" && confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect();
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({ particleCount: 140, spread: 80, origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }, colors: ["#34D399", "#8B5CF6", "#3B82F6", "#F59E0B", "#FCD34D"] });
      });
    }
  }, [lang]);

  const statuses = ["all", "locked", "unlocked", "completed", "failed"];
  const filtered = filter === "all" ? vaults : vaults.filter((v) => v.status === filter);

  return (
    <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "#070D1A", transition: "opacity 0.5s ease", opacity: visible ? 1 : 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 24px 100px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #8B5CF6, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 80 80" fill="none">
                  <rect x="8" y="10" width="64" height="60" rx="10" fill="rgba(255,255,255,0.9)" />
                  <circle cx="40" cy="40" r="12" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
                  <circle cx="40" cy="40" r="4" fill="#8B5CF6" />
                  <line x1="40" y1="29" x2="40" y2="32" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="54" y="37" width="9" height="7" rx="2.5" fill="#64748B" />
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9" }}>AxisVault</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>{t.yourGoals}</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["en", "fr"].map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "4px 8px", borderRadius: 16, background: lang === l ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${lang === l ? "rgba(139,92,246,0.3)" : "rgba(148,163,184,0.1)"}`, color: lang === l ? "#A78BFA" : "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {l.toUpperCase()}
              </button>
            ))}
            <button onClick={onBack} style={{ fontSize: 13, fontWeight: 600, color: "#8B5CF6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "6px 14px", cursor: "pointer" }}>{t.newGoal}</button>
            <button onClick={onSignOut} style={{ fontSize: 12, color: "#334155", background: "transparent", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: "6px 12px", cursor: "pointer" }}>{t.signOut}</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: filter === s ? "rgba(139,92,246,0.2)" : "transparent",
                border: `1px solid ${filter === s ? "rgba(139,92,246,0.4)" : "rgba(148,163,184,0.1)"}`,
                color: filter === s ? "#A78BFA" : "#475569",
                transition: "all 0.15s",
              }}>
              {s === "all" ? (lang === "fr" ? "Tous" : "All") : t[s] || s}
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                {s === "all" ? vaults.length : vaults.filter((v) => v.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🏛️</div>
            <p style={{ color: "#334155", fontSize: 15 }}>{t.noGoals}</p>
          </div>
        ) : (
          <div ref={confettiRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((vault, i) => (
              <VaultCard key={vault.id} vault={vault} index={i} onOutcome={handleOutcome} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VaultCard ────────────────────────────────────────────────────────────────
function VaultCard({ vault, index, onOutcome, lang }) {
  const t = T[lang];
  const [now, setNow] = useState(Date.now());
  const cat = getCat(vault.category);

  useEffect(() => {
    if (vault.status !== "locked") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [vault.status]);

  const unlockMs = new Date(vault.unlock_at).getTime();
  const createdMs = new Date(vault.created_at).getTime();

  if (vault.status === "locked") {
    const remaining = unlockMs - now;
    const cd = formatCountdown(remaining);
    const pct = progressPercent(createdMs, unlockMs);

    return (
      <div style={{
        background: "#0F1829", borderRadius: 20, padding: "22px",
        border: `1px solid ${cat.color}33`,
        boxShadow: `0 0 24px ${cat.color}12, inset 0 0 0 1px ${cat.color}0d`,
        position: "relative", overflow: "hidden",
        animation: `cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s both`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Ambient corner glow */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${cat.color}18 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{cat.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: cat.color, background: `${cat.color}18`, padding: "3px 8px", borderRadius: 20 }}>{t.locked}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
            <rect x="5" y="11" width="14" height="10" rx="3" stroke={cat.color} strokeWidth="2" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke={cat.color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill={cat.color} />
          </svg>
        </div>

        {/* ─── SECRET MODE: content hidden ─────────────────────────────────── */}
        {vault.secret ? (
          <div style={{ marginBottom: 18, padding: "16px", background: `${cat.color}0d`, borderRadius: 12, border: `1px dashed ${cat.color}33`, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
            <p style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{t.secretHint}</p>
          </div>
        ) : (
          <p style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.5, marginBottom: 18, minHeight: 48 }}>{vault.text}</p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 3, background: "rgba(148,163,184,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 7 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`, borderRadius: 2, transition: "width 1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#334155" }}>{Math.round(pct)}% {t.elapsed}</span>
            <span style={{ fontSize: 11, color: "#334155" }}>{vault.deadline_date} {vault.deadline_time}</span>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: cd.days, l: t.days }, { v: cd.hours, l: t.hrs }, { v: cd.minutes, l: t.min }, { v: cd.seconds, l: t.sec }].map(({ v, l }) => (
            <div key={l} style={{ flex: 1, background: `${cat.color}0d`, borderRadius: 8, padding: "8px 4px", textAlign: "center", border: `1px solid ${cat.color}1a` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: cat.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 2, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
        <style>{`@keyframes cardIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      </div>
    );
  }

  if (vault.status === "unlocked") {
    const [busy, setBusy] = useState(false);
    const handle = async (outcome) => { setBusy(true); await onOutcome(vault.id, outcome); };

    return (
      <div style={{
        background: "#0F1829", borderRadius: 20, padding: "22px",
        border: "1px solid rgba(52,211,153,0.35)",
        boxShadow: "0 0 32px rgba(52,211,153,0.12), inset 0 0 0 1px rgba(52,211,153,0.1)",
        animation: `cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s both`,
        fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 160, height: 80, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(52,211,153,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{cat.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34D399", background: "rgba(52,211,153,0.1)", padding: "3px 8px", borderRadius: 20 }}>{t.timeIsUp}</span>
          </div>
          <span style={{ fontSize: 20, animation: "vaultBounce 1.5s ease-in-out infinite" }}>🔓</span>
        </div>

        {/* Secret mode: show text only when unlocked */}
        <p style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.5, marginBottom: 8 }}>
          {vault.secret ? (vault.secret_text || vault.text) : vault.text}
        </p>
        {vault.secret && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8, padding: "2px 8px", background: "rgba(52,211,153,0.1)", borderRadius: 12, border: "1px solid rgba(52,211,153,0.2)" }}>
            <span style={{ fontSize: 11, color: "#34D399" }}>✨ {t.hiddenContent}</span>
          </div>
        )}
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>{t.didYouAchieve}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handle("completed")} disabled={busy}
            style={{ flex: 1, padding: "12px 8px", borderRadius: 12, background: busy ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg, #059669, #34D399)", border: "none", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(52,211,153,0.3)" }}>
            {t.yesIdidIt}
          </button>
          <button onClick={() => handle("failed")} disabled={busy}
            style={{ flex: 1, padding: "12px 8px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
            {t.iFellShort}
          </button>
        </div>
        <style>{`@keyframes vaultBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
      </div>
    );
  }

  if (vault.status === "completed") {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(52,211,153,0.07) 0%, #0F1829 60%)",
        borderRadius: 20, padding: "22px",
        border: "1px solid rgba(52,211,153,0.2)",
        animation: `cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s both`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{cat.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34D399", background: "rgba(52,211,153,0.1)", padding: "3px 8px", borderRadius: 20 }}>{t.achieved}</span>
          </div>
          <span style={{ fontSize: 20 }}>🏆</span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", lineHeight: 1.5, marginBottom: 14, textDecoration: "line-through", textDecorationColor: "rgba(52,211,153,0.4)" }}>{vault.text || vault.secret_text}</p>
        {vault.feedback_message && (
          <div style={{ padding: "12px 14px", background: "rgba(52,211,153,0.06)", borderRadius: 10, borderLeft: "3px solid #34D399" }}>
            <p style={{ fontSize: 12, color: "#6EE7B7", fontWeight: 500, lineHeight: 1.65, fontStyle: "italic" }}>"{vault.feedback_message}"</p>
          </div>
        )}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontSize: 11, color: "#334155" }}>{vault.deadline_date}</span>
        </div>
      </div>
    );
  }

  // failed
  return (
    <div style={{
      background: "#0F1829", borderRadius: 20, padding: "22px",
      border: "1px solid rgba(148,163,184,0.07)", opacity: 0.75,
      animation: `cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s both`,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{cat.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", background: "rgba(148,163,184,0.06)", padding: "3px 8px", borderRadius: 20 }}>{t.notThisTime}</span>
        </div>
        <span style={{ fontSize: 16 }}>💪</span>
      </div>
      <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.5, marginBottom: 12, textDecoration: "line-through" }}>{vault.text || vault.secret_text}</p>
      {vault.feedback_message && (
        <p style={{ fontSize: 12, color: "#334155", fontStyle: "italic", lineHeight: 1.6 }}>{vault.feedback_message}</p>
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [lang, setLang] = useState("fr");

  // Supabase Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ uid: u.id, email: u.email, name: u.user_metadata?.full_name || u.email });
        setScreen((prev) => prev === "login" ? "splash" : prev);
      } else {
        setUser(null);
        setVaults([]);
        setScreen("login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Real-time vaults
  useEffect(() => {
    if (!user) return;
    const unsub = watchVaults(user.uid, setVaults);
    return unsub;
  }, [user]);

  const handleSplashComplete = () => setScreen("dashboard");

  const handleAddVault = async (params) => {
    await createVault(params);
    setScreen("vaults");
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const sharedProps = { lang, setLang };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {screen === "login" && <LoginScreen onLoginSuccess={() => {}} {...sharedProps} />}
      {screen === "splash" && <SplashScreen onComplete={handleSplashComplete} {...sharedProps} />}
      {screen === "dashboard" && user && (
        <DashboardScreen user={user} vaults={vaults} onAddVault={handleAddVault}
          onViewVaults={() => setScreen("vaults")} onSignOut={handleSignOut} {...sharedProps} />
      )}
      {screen === "vaults" && user && (
        <VaultsScreen vaults={vaults} onBack={() => setScreen("dashboard")}
          onSignOut={handleSignOut} {...sharedProps} />
      )}
    </div>
  );
}