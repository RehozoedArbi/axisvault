import { VaultIcon } from "./icons/VaultIcon";
import { T, FONT_DISPLAY } from "../lib/theme";

// ─── NAV LOGO ─────────────────────────────────────────────────────────────────
export function NavLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px rgba(139,92,246,0.3)"}}>
        <VaultIcon size={17}/>
      </div>
      <span style={{fontFamily:FONT_DISPLAY,fontSize:14,fontWeight:800,color:T.tx1,letterSpacing:"-.01em"}}>IlumviVault</span>
    </div>
  );
}
