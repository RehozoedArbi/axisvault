import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";

// ─── DELETE ACCOUNT MODAL ─────────────────────────────────────────────────────
export function DeleteAccountModal({ cword, onCword, onConfirm, onCancel, shaking, deleting, lang }) {
  const t = useT(lang);
  const valid = cword === t.deleteTypeWord;
  return (
    <div className="av-modal-bg">
      <div className="av-modal" style={{borderColor:"rgba(248,113,113,.25)"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:50,height:50,borderRadius:14,background:T.redDim,border:"1px solid rgba(248,113,113,.25)",fontSize:22,marginBottom:14}}>⚠️</div>
          <h2 style={{fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:800,color:T.tx1,letterSpacing:"-.02em",marginBottom:6}}>{t.deleteTitle}</h2>
          <p style={{fontSize:13,color:T.tx2,lineHeight:1.6}}>{t.deleteSub}</p>
        </div>
        <p style={{fontSize:13,color:T.tx2,marginBottom:8}}>
          {t.deleteTypeLabel} <span style={{color:T.red,fontWeight:700}}>{t.deleteTypeWord}</span> {t.deleteTypeToConfirm}
        </p>
        <input className={`av-commit-input${valid?" valid":""}${shaking?" shake":""}`}
          type="text" value={cword} autoFocus placeholder={t.deleteTypeWord}
          onChange={e=>onCword(e.target.value.toUpperCase())}
          onKeyDown={e=>{if(e.key==="Enter"&&valid) onConfirm();}}
          style={{marginBottom:18,borderColor:valid?"rgba(248,113,113,.6)":undefined}}/>
        <div style={{display:"flex",gap:8}}>
          <button className="av-btn-ghost" onClick={onCancel} style={{flex:1,justifyContent:"center",padding:"12px"}}>{t.deleteCancelBtn}</button>
          <button onClick={onConfirm} disabled={!valid||deleting}
            style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px",borderRadius:9,border:"none",cursor:(!valid||deleting)?"not-allowed":"pointer",background:"linear-gradient(135deg,#DC2626,#F87171)",color:"#fff",fontFamily:FONT_DISPLAY,fontSize:14,fontWeight:700,opacity:(!valid||deleting)?.5:1,boxShadow:(!valid||deleting)?"none":"0 4px 20px rgba(248,113,113,.35)"}}>
            {deleting?t.deleteDeleting:t.deleteConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
