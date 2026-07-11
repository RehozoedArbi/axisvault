import { useState } from "react";
import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";
import { VaultIcon } from "../components/icons/VaultIcon";

// ─── ONBOARDING (first login only) ────────────────────────────────────────────
// Mandatory: accept legal notice + privacy policy.
// Optional, unchecked by default: newsletter opt-in.
// Nothing here is a dark pattern — the newsletter checkbox can never be forced.
export function Onboarding({ lang, onComplete }) {
  const t = useT(lang);
  const [accepted, setAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!accepted) { setShowError(true); return; }
    setSaving(true);
    await onComplete(newsletter);
  };

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:440,width:"100%",background:T.surface,border:`1px solid ${T.borderMd}`,borderRadius:20,padding:"32px 28px",boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:15,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 30px rgba(139,92,246,.35)"}}>
            <VaultIcon size={30}/>
          </div>
        </div>
        <h1 style={{fontFamily:FONT_DISPLAY,fontSize:20,fontWeight:800,color:T.tx1,textAlign:"center",letterSpacing:"-.02em",marginBottom:8}}>{t.onboardWelcome}</h1>
        <p style={{fontSize:13,color:T.tx2,textAlign:"center",lineHeight:1.6,marginBottom:26}}>{t.onboardSub}</p>

        {/* Mandatory: legal + privacy */}
        <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:16,padding:"12px 14px",borderRadius:10,background:T.surfaceEl,border:`1px solid ${showError && !accepted ? "rgba(248,113,113,.4)" : T.border}`}}>
          <input type="checkbox" checked={accepted}
            onChange={e=>{setAccepted(e.target.checked); if(e.target.checked) setShowError(false);}}
            style={{marginTop:2,width:16,height:16,accentColor:T.violet,flexShrink:0}}/>
          <span style={{fontSize:13,color:T.tx1,lineHeight:1.55}}>
            {t.onboardAcceptPre}
            <a href="/legal.html" target="_blank" rel="noopener" style={{color:T.violet}}>{t.onboardAcceptLegal}</a>
            {t.onboardAcceptAnd}
            <a href="/privacy.html" target="_blank" rel="noopener" style={{color:T.violet}}>{t.onboardAcceptPrivacy}</a>
            {t.onboardAcceptPost}
          </span>
        </label>
        {showError && !accepted && (
          <p style={{fontSize:12,color:T.red,marginTop:-8,marginBottom:16}}>{t.onboardMustAccept}</p>
        )}

        {/* Optional: newsletter, unchecked by default, never forced */}
        <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:24,padding:"12px 14px",borderRadius:10,background:T.surfaceEl,border:`1px solid ${T.border}`}}>
          <input type="checkbox" checked={newsletter}
            onChange={e=>setNewsletter(e.target.checked)}
            style={{marginTop:2,width:16,height:16,accentColor:T.violet,flexShrink:0}}/>
          <span style={{fontSize:13,color:T.tx2,lineHeight:1.55}}>{t.onboardNewsletter}</span>
        </label>

        <button className="av-btn-primary" onClick={submit} disabled={saving}
          style={{width:"100%",padding:"13px",borderRadius:11,fontSize:14}}>
          {saving ? "…" : t.onboardContinue}
        </button>
      </div>
    </div>
  );
}
