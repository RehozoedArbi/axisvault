import { useState, useEffect } from "react";
import { T, FONT_DISPLAY, FONT_BODY } from "../lib/theme";
import { useT } from "../lib/i18n";
import { CATS } from "../lib/constants";
import { streakCount, fmtDate, getMinDateStr, getMinTimeStr, validateDeadline } from "../lib/utils";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useToast } from "../context/ToastContext";
import { NavLogo } from "../components/NavLogo";
import { LangToggle } from "../components/LangToggle";
import { BurgerMenu } from "../components/BurgerMenu";
import { CommitModal } from "../components/CommitModal";
import { SignOutModal } from "../components/SignOutModal";

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function Dashboard({ user,vaults,onAdd,onViewVaults,onAccount,onSignOut,lang,setLang }) {
  const t=useT(lang);
  const toast=useToast();
  const { isMobile } = useBreakpoint();
  const [text,setText]=useState("");
  const [date,setDate]=useState("");
  const [time,setTime]=useState("23:59");
  const [cat,setCat]=useState("personal");
  const [modal,setModal]=useState(false);
  const [cword,setCword]=useState("");
  const [shaking,setShaking]=useState(false);
  const [saving,setSaving]=useState(false);
  const [vis,setVis]=useState(false);
  const [signOutModal,setSignOutModal]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);
  const dlValidation = validateDeadline(date, time,lang);
  const canLock=text.trim().length>2&&date && dlValidation.valid;
  useEffect(()=>{
    const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter"&&canLock) setModal(true);};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[canLock]);
  const confirm=async()=>{
    if(cword!=="COMMIT"){setShaking(true);setTimeout(()=>setShaking(false),400);return;}
    setSaving(true);
    await onAdd({uid:user.uid,email:user.email,text:text.trim(),deadlineDate:date,deadlineTime:time,category:cat});
    toast(t.toastLocked,"success");
    setModal(false);setText("");setDate("");setTime("23:59");setCword("");setSaving(false);
  };
  const active=vaults.filter(v=>v.status==="locked").length;
  const open_=vaults.filter(v=>v.status==="unlocked").length;
  const done=vaults.filter(v=>v.status==="completed").length;
  const missed=vaults.filter(v=>v.status==="failed").length;
  const resolved=done+missed;
  const sr=resolved>0?Math.round((done/resolved)*100):null;
  const str=streakCount(vaults);

  const burgerItems = [
    { icon:"🌐", label: lang==="fr"?"English":"Français", onClick:()=>setLang(lang==="fr"?"en":"fr") },
    "divider",
    ...(vaults.length>0 ? [{ icon:"🏛", label:`${t.viewVaults} (${vaults.length})`, onClick:onViewVaults }] : []),
    { icon:"👤", label:t.account, onClick:onAccount },
    "divider",
    { icon:"🚪", label:t.signOut, onClick:()=>setSignOutModal(true) },
  ];

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",background:T.bg,opacity:vis?1:0,transition:"opacity .4s ease"}}>
      <div style={{maxWidth:580,margin:"0 auto",padding:`40px 20px ${isMobile?"140px":"120px"}`}}>

        {/* HEADER */}
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:48}}>
          <NavLogo/>
          {isMobile ? (
            <BurgerMenu items={burgerItems}/>
          ) : (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <LangToggle lang={lang} setLang={setLang}/>
              {vaults.length>0&&(
                <button className="av-btn-ghost" onClick={onViewVaults} style={{marginLeft:4}}>
                  {t.viewVaults}
                  <span style={{padding:"1px 6px",borderRadius:20,background:T.violetDim,color:T.violet,fontSize:11,fontWeight:700}}>{vaults.length}</span>
                </button>
              )}
              <button className="av-btn-ghost" onClick={onAccount} style={{padding:"8px 12px"}}>{t.account}</button>
              <button className="av-btn-ghost" onClick={()=>setSignOutModal(true)} style={{padding:"8px 12px"}}>{t.signOut}</button>
            </div>
          )}
        </header>

        <p style={{fontSize:13,color:T.tx2,marginBottom:8}}>
          {t.welcomeBack}, <span style={{color:T.violet,fontWeight:600}}>{user.name?.split(" ")[0]}</span>
          {str>1&&<span style={{marginLeft:10,color:T.amber,fontWeight:600,fontSize:12}}>🔥 {str} {t.streak}</span>}
        </p>
        <h1 style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?28:36,fontWeight:800,color:T.tx1,lineHeight:1.1,letterSpacing:"-.03em",marginBottom:10}}>
          {t.hero1}<br/>
          <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.hero2}</span>
        </h1>
        <p style={{fontSize:13,color:T.tx2,marginBottom:28,lineHeight:1.65}}>{t.inputSub}</p>

        {/* INPUT CARD */}
        <div style={{background:T.surface,borderRadius:16,border:`1px solid ${canLock?"rgba(139,92,246,.3)":T.border}`,overflow:"hidden",marginBottom:10,boxShadow:canLock?"0 0 0 1px rgba(139,92,246,.08),0 4px 24px rgba(139,92,246,.1)":"none",transition:"border-color .2s,box-shadow .2s"}}>
          <textarea className="av-input" value={text} onChange={e=>setText(e.target.value)} placeholder={t.placeholder} rows={3}/>
          <div style={{height:1,background:T.border,margin:"0 22px"}}/>
          {/* CATEGORIES */}
          <div style={{padding:"12px 22px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:T.tx3,fontWeight:500,marginRight:2}}>{t.category}</span>
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:cat===c.id?`${c.color}1A`:"transparent",border:`1px solid ${cat===c.id?`${c.color}44`:T.border}`,color:cat===c.id?c.color:T.tx2,transition:"all .15s"}}>
                {c.symbol} {lang==="fr"?c.fr:c.en}
              </button>
            ))}
          </div>
          <div style={{height:1,background:T.border,margin:"0 22px"}}/>
          {/* DEADLINE */}
       <div style={{ padding: "12px 22px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flexDirection: "column" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
    <span style={{ fontSize: 11, color: T.tx3, fontWeight: 500 }}>{t.deadline}</span>
    <input
      type="date" className="av-date"
      value={date}
      min={getMinDateStr()}
      onChange={e => {
        setDate(e.target.value);
        // Auto-ajuste le time si on est sur aujourd'hui
        if (e.target.value === new Date().toISOString().split("T")[0]) {
          const minT = getMinTimeStr(e.target.value);
          if (time < minT) setTime(minT);
        }
      }}
    />
    <input
      type="time" className="av-date"
      value={time}
      min={getMinTimeStr(date)}
      onChange={e => setTime(e.target.value)}
      style={{ width: 92 }}
    />
  </div>
  {/* Feedback en temps réel */}
  {date && dlValidation.error && (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, color: T.red, fontFamily: FONT_BODY,
      padding: "5px 10px", borderRadius: 7,
      background: T.redDim, border: `1px solid rgba(248,113,113,.2)`,
      animation: "fadeIn .2s ease",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      {dlValidation.error}
    </div>
  )}
  {date && dlValidation.valid && (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, color: T.green, fontFamily: FONT_BODY,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {lang === "fr" ? "Deadline valide ✓" : "Valid deadline ✓"}
    </div>
  )}
</div>
        </div>

        <button className="av-btn-primary" onClick={()=>setModal(true)} disabled={!canLock}
          style={{width:"100%",padding:"14px",borderRadius:11,fontSize:14}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {t.lockVault}
          {canLock&&!isMobile&&<span style={{fontSize:11,opacity:.6,fontWeight:500,marginLeft:4}}>⌘↵</span>}
        </button>

        {/* STATS */}
        {vaults.length>0&&(
          <div style={{marginTop:28}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
              {[{l:t.active,v:active,c:T.violet},{l:t.open,v:open_,c:T.blue},{l:t.done,v:done,c:T.green},{l:t.missed_f,v:missed,c:T.red}].map(s=>(
                <div key={s.l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?18:22,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:10,color:T.tx2,marginTop:5,fontWeight:500}}>{s.l}</div>
                </div>
              ))}
            </div>
            {sr!==null&&(
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:T.tx2}}>{t.successRate}</span>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="pbar" style={{width:isMobile?60:90}}>
                    <div className="pfill" style={{width:`${sr}%`,background:sr>=70?T.green:sr>=40?"linear-gradient(90deg,#8B5CF6,#3B82F6)":T.red}}/>
                  </div>
                  <span style={{fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:800,color:sr>=70?T.green:sr>=40?T.violet:T.red,minWidth:42,textAlign:"right"}}>{sr}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav className="av-bottom-nav">
          <button className="av-bottom-nav-item active" onClick={()=>{}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {t.lockVault.split(" ")[0]}
          </button>
          {vaults.length>0&&(
            <button className="av-bottom-nav-item" onClick={onViewVaults}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              {t.viewVaults}
            </button>
          )}
        </nav>
      )}

      {modal&&(
        <CommitModal goalText={text} deadline={fmtDate(date,time)}
          cword={cword} onCword={setCword}
          onConfirm={confirm} onCancel={()=>{setModal(false);setCword("");}}
          shaking={shaking} saving={saving} lang={lang}/>
      )}
      {signOutModal&&(
        <SignOutModal onConfirm={()=>{setSignOutModal(false);onSignOut();}} onCancel={()=>setSignOutModal(false)} lang={lang}/>
      )}
    </div>
  );
}
