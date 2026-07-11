import { useState, useEffect } from "react";
import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";
import { signInWithGoogle } from "../lib/vaultsApi";
import { VaultIcon } from "../components/icons/VaultIcon";
import { GoogleLogo } from "../components/icons/GoogleLogo";
import { LangToggle } from "../components/LangToggle";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function Login({ lang, setLang }) {
  const t=useT(lang);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{const tm=setTimeout(()=>setVis(true),60);return()=>clearTimeout(tm);},[]);
  const go=async()=>{
    setLoading(true);setError(null);
    const {error:e}=await signInWithGoogle();
    if(e){setError(t.loginErr);setLoading(false);}
  };
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,opacity:vis?1:0,transition:"opacity .5s ease"}}>
      <div style={{position:"absolute",top:"10%",left:"15%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"15%",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:20,right:20}}><LangToggle lang={lang} setLang={setLang}/></div>
      <div style={{maxWidth:400,width:"100%",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:36}}>
          <div style={{width:58,height:58,borderRadius:17,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(139,92,246,.4)"}}>
            <VaultIcon size={36}/>
          </div>
        </div>
        <div style={{fontFamily:FONT_DISPLAY,fontSize:11,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:T.tx3,marginBottom:16}}>IlumviVault</div>
        <h1 style={{fontFamily:FONT_DISPLAY,fontSize:28,fontWeight:800,color:T.tx1,lineHeight:1.2,letterSpacing:"-.02em",marginBottom:12}}>
          {t.loginH}<br/>
          <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}></span>
        </h1>
        <p style={{fontSize:14,color:T.tx2,lineHeight:1.7,marginBottom:44}}>{t.loginSub}</p>
        <button onClick={go} disabled={loading}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,width:"100%",padding:"14px 20px",borderRadius:11,background:"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:FONT_DISPLAY,fontSize:15,fontWeight:600,color:"#111",boxShadow:"0 2px 20px rgba(0,0,0,.3)",transition:"all .15s",opacity:loading?.7:1}}
          onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,.38)";}}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 20px rgba(0,0,0,.3)";}}>
          {loading?<div style={{width:18,height:18,border:"2.5px solid #ddd",borderTopColor:"#8B5CF6",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<GoogleLogo/>}
          {loading?t.signingIn:t.google}
        </button>
        {error&&<p style={{fontSize:13,color:T.red,marginTop:14}}>{error}</p>}
        <p style={{fontSize:12,color:T.tx3,marginTop:22,lineHeight:1.6}}>{t.terms}</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
          <a href="/legal.html" target="_blank" rel="noopener" style={{fontSize:11,color:T.tx3,textDecoration:"underline"}}>{t.accountLegalLink}</a>
          <span style={{fontSize:11,color:T.tx3}}>·</span>
          <a href="/privacy.html" target="_blank" rel="noopener" style={{fontSize:11,color:T.tx3,textDecoration:"underline"}}>{t.accountPrivacyLink}</a>
        </div>
      </div>
    </div>
  );
}
