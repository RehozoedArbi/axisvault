import { useState, useCallback, createContext, useContext } from "react";
import { T, FONT_BODY } from "../lib/theme";

// ─── TOAST ────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3200);
  },[]);
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{position:"fixed",bottom:24,right:16,zIndex:999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",maxWidth:320}}>
        {toasts.map(t=>(
          <div key={t.id} style={{
            padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:FONT_BODY,
            background: t.type==="success"?T.green:t.type==="error"?T.red:T.surfaceHi,
            color:(t.type==="success"||t.type==="error")?"#fff":T.tx1,
            border:`1px solid ${t.type==="success"?"rgba(52,211,153,0.3)":t.type==="error"?"rgba(248,113,113,0.3)":T.borderMd}`,
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
            animation:"toastIn .25s cubic-bezier(0.34,1.4,0.64,1)",
            pointerEvents:"none",
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
