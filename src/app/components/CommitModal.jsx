import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";

// ─── COMMIT MODAL ─────────────────────────────────────────────────────────────
export function CommitModal({ goalText,deadline,cword,onCword,onConfirm,onCancel,shaking,saving,lang }) {
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
