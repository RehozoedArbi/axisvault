// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
export function LangToggle({ lang, setLang }) {
  return (
    <div style={{display:"flex",gap:4}}>
      {["en","fr"].map(l=>(
        <button key={l} className={`av-lang ${lang===l?"on":"off"}`} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
