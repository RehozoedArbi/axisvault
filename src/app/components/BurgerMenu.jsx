import { useState, useEffect, useRef } from "react";
import { T } from "../lib/theme";

// ─── BURGER MENU (mobile header) ─────────────────────────────────────────────
export function BurgerMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",flexDirection:"column",gap:4,padding:"8px",background:open?T.violetDim:"transparent",border:`1px solid ${open?"rgba(139,92,246,.3)":T.border}`,borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:18,height:2,borderRadius:1,background:open?T.violet:T.tx2,transition:"background .15s"}}/>
        ))}
      </button>
      {open && (
        <div className="av-burger-menu">
          {items.map((item, i) => item === "divider"
            ? <div key={i} className="av-burger-divider"/>
            : (
              <button key={i} className="av-burger-item" onClick={()=>{item.onClick();setOpen(false);}}>
                <span style={{fontSize:16}}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
