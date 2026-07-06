import React, { useState, useEffect } from "react";
import { T, FONT_DISPLAY, FONT_BODY } from "../lib/theme";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { NavLogo } from "../components/NavLogo";
import { LangToggle } from "../components/LangToggle";

// ─── LandingPage ───────────────────────────────────────────────────────────────────
export function LandingPage({ lang, setLang, onEnter }) {
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
