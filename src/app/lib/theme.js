// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const T = {
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

export const FONT_DISPLAY = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";
export const FONT_BODY    = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const CSS = `
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
