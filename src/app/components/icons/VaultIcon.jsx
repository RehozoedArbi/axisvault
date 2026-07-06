// ─── VAULT ICON ───────────────────────────────────────────────────────────────
export function VaultIcon({ cracked=false, size=80 }) {
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
