import { useState, useEffect } from "react";
import { T, FONT_BODY, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";
import { getCat } from "../lib/constants";
import { fmtCountdown, pct, fmtDate } from "../lib/utils";
import { useToast } from "../context/ToastContext";

// ─── VAULT CARD ───────────────────────────────────────────────────────────────
export function VaultCard({ vault,index,onOutcome,pinned,onTogglePin,lang }) {
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
