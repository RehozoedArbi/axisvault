import { useState, useEffect } from "react";
import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";

// ─── SPLASH ───────────────────────────────────────────────────────────────────
export function Splash({ onComplete, lang }) {
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
