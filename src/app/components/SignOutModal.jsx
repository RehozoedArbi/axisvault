import { T, FONT_BODY } from "../lib/theme";
import { useT } from "../lib/i18n";

// ─── SIGN OUT CONFIRM MODAL ──────────────────────────────────────────────────
export function SignOutModal({ onConfirm, onCancel, lang }) {
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
