import { useState, useEffect, useCallback } from "react";
import { T, FONT_DISPLAY } from "../lib/theme";
import { STRINGS, useT } from "../lib/i18n";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { getPins, togglePin, respondToVault } from "../lib/vaultsApi";
import { NavLogo } from "../components/NavLogo";
import { LangToggle } from "../components/LangToggle";
import { BurgerMenu } from "../components/BurgerMenu";
import { VaultCard } from "../components/VaultCard";
import { SignOutModal } from "../components/SignOutModal";

// ─── VAULTS SCREEN ────────────────────────────────────────────────────────────
export function VaultsScreen({ vaults,onBack,onAccount,onSignOut,lang,setLang,onUpdateVault }) {
  const t=useT(lang);
  const { isMobile, width } = useBreakpoint();
  const [vis,setVis]=useState(false);
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("newest");
  const [pins,setPins]=useState(getPins);
  const [signOutModal,setSignOutModal]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);

  const handleTogglePin=useCallback(id=>{setPins(togglePin(id));},[]);
  const handleOutcome=useCallback(async(vault,outcome,note)=>{
    const quotes=outcome==="completed"?STRINGS[lang].congrats:STRINGS[lang].encourage;
    const msg=note||(quotes[Math.floor(Math.random()*quotes.length)]);
    onUpdateVault(vault.id,{status:outcome,feedback_message:msg,responded_at:new Date().toISOString()});
    await respondToVault(vault.id,outcome,msg);
    if(outcome==="completed"){
      try{const{default:c}=await import("canvas-confetti");c({particleCount:100,spread:70,origin:{x:.5,y:.55},colors:["#34D399","#8B5CF6","#3B82F6","#FCD34D"]});}catch{}
    }
  },[onUpdateVault,lang]);

  const statusLabels={all:t.all,locked:t.locked,unlocked:t.timeIsUp,completed:t.done,failed:t.missed_f};
  const filterMap={"all":null,"locked":"locked","unlocked":"unlocked","completed":"completed","failed":"failed"};
  let displayed=[...vaults];
  if(filter!=="all") displayed=displayed.filter(v=>v.status===filterMap[filter]);
  if(sort==="deadline") displayed.sort((a,b)=>new Date(a.unlock_at)-new Date(b.unlock_at));
  displayed.sort((a,b)=>(pins.includes(b.id)?1:0)-(pins.includes(a.id)?1:0));
  const counts=s=>s==="all"?vaults.length:vaults.filter(v=>v.status===filterMap[s]).length;

  // 3 columns on wide screens, 2 on tablet, 1 on mobile
  const cols = width >= 1100 ? 3 : width >= 640 ? 2 : 1;

  const burgerItems = [
    { icon:"🌐", label: lang==="fr"?"English":"Français", onClick:()=>setLang(lang==="fr"?"en":"fr") },
    "divider",
    { icon:"➕", label:`+ ${t.newVault}`, onClick:onBack },
    { icon:"👤", label:t.account, onClick:onAccount },
    "divider",
    { icon:"🚪", label:t.signOut, onClick:()=>setSignOutModal(true) },
  ];

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",background:T.bg,opacity:vis?1:0,transition:"opacity .4s ease"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:`40px 20px ${isMobile?"140px":"80px"}`}}>

        {/* HEADER */}
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <NavLogo/>
          {isMobile ? (
            <BurgerMenu items={burgerItems}/>
          ) : (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <LangToggle lang={lang} setLang={setLang}/>
              <button className="av-btn-ghost" onClick={onBack} style={{marginLeft:4}}>+ {t.newVault}</button>
              <button className="av-btn-ghost" onClick={onAccount}>{t.account}</button>
              <button className="av-btn-ghost" onClick={()=>setSignOutModal(true)}>{t.signOut}</button>
            </div>
          )}
        </header>

        {/* TITLE + SORT */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <h1 style={{fontFamily:FONT_DISPLAY,fontSize:isMobile?18:22,fontWeight:800,color:T.tx1,letterSpacing:"-.02em"}}>{t.yourVaults}</h1>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{fontSize:12,color:T.tx3}}>{t.sortBy}:</span>
            {[["newest",t.newest],["deadline",t.deadline_s]].map(([k,l])=>(
              <button key={k} className={`av-tab ${sort===k?"on":"off"}`} onClick={()=>setSort(k)} style={{padding:"4px 11px",fontSize:11}}>{l}</button>
            ))}
          </div>
        </div>

        {/* FILTER TABS */}
        <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap"}}>
          {["all","locked","unlocked","completed","failed"].map(s=>(
            <button key={s} className={`av-tab ${filter===s?"on":"off"}`} onClick={()=>setFilter(s)}>
              {statusLabels[s]}<span style={{marginLeft:5,fontSize:10,opacity:.6}}>{counts(s)}</span>
            </button>
          ))}
        </div>

        {/* GRID — fixed 3 cols max */}
        {displayed.length===0?(
          <div style={{textAlign:"center",padding:"70px 0"}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.2}}>🏛</div>
            <p style={{color:T.tx3,fontSize:14}}>{filter==="all"?t.noVaults:t.noFiltered}</p>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:14}}>
            {displayed.map((v,i)=>(
              <VaultCard key={v.id} vault={v} index={i}
                onOutcome={handleOutcome}
                pinned={pins.includes(v.id)}
                onTogglePin={handleTogglePin}
                lang={lang}/>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav className="av-bottom-nav">
          <button className="av-bottom-nav-item" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {t.newVault}
          </button>
          <button className="av-bottom-nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            {t.yourVaults}
          </button>
        </nav>
      )}

      {signOutModal&&(
        <SignOutModal onConfirm={()=>{setSignOutModal(false);onSignOut();}} onCancel={()=>setSignOutModal(false)} lang={lang}/>
      )}
    </div>
  );
}
