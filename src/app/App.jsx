import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { CSS } from "./lib/theme";
import { watchVaults, createVault } from "./lib/vaultsApi";
import { ToastProvider } from "./context/ToastContext";
import { LandingPage } from "./screens/LandingPage";
import { Login } from "./screens/Login";
import { Splash } from "./screens/Splash";
import { Dashboard } from "./screens/Dashboard";
import { VaultsScreen } from "./screens/VaultsScreen";

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [user,setUser]=useState(null);
  const [vaults,setVaults]=useState([]);
  const [lang,setLang]=useState("fr");

  useEffect(()=>{
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){
        const u=session.user;
        setUser({uid:u.id,email:u.email,name:u.user_metadata?.full_name||u.email});
        setScreen(p=>p==="login"?"splash":p);
      } else {
        setUser(null);setVaults([]);setScreen("landing");
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user) return;
    return watchVaults(user.uid,setVaults);
  },[user]);

  const handleUpdateVault=useCallback((id,patch)=>{
    setVaults(prev=>prev.map(v=>v.id===id?{...v,...patch}:v));
  },[]);

  const handleAddVault=async(params)=>{
    const unlockAt=new Date(`${params.deadlineDate}T${params.deadlineTime}:00`).toISOString();
    const temp={
      id:"temp-"+Date.now(),uid:params.uid,email:params.email,
      text:null, secret_text:params.text,
      secret:true, deadline_date:params.deadlineDate,deadline_time:params.deadlineTime,
      unlock_at:unlockAt,category:params.category,status:"locked",
      created_at:new Date().toISOString(),feedback_message:null,responded_at:null,
    };
    setVaults(p=>[temp,...p]);
    setScreen("vaults");
    await createVault(params);
  };

  const shared={lang,setLang};
  return (
    <ToastProvider>
      <style>{CSS}</style>
      {screen === "landing" && <LandingPage lang={lang} setLang={setLang} onEnter={() => setScreen("login")} />}
      {screen==="login"&&<Login {...shared}/>}
      {screen==="splash"&&<Splash onComplete={()=>setScreen("dashboard")} {...shared}/>}
      {screen==="dashboard"&&user&&(
        <Dashboard user={user} vaults={vaults}
          onAdd={handleAddVault}
          onViewVaults={()=>setScreen("vaults")}
          onSignOut={()=>supabase.auth.signOut()}
          {...shared}/>
      )}
      {screen==="vaults"&&user&&(
        <VaultsScreen vaults={vaults}
          onBack={()=>setScreen("dashboard")}
          onSignOut={()=>supabase.auth.signOut()}
          onUpdateVault={handleUpdateVault}
          {...shared}/>
      )}
    </ToastProvider>
  );
}
