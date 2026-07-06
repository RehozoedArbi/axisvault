// ─── UTILS ───────────────────────────────────────────────────────────────────
export function fmtCountdown(ms) {
  const s = Math.max(0,Math.floor(ms/1000));
  return { days:Math.floor(s/86400),hours:Math.floor((s%86400)/3600),minutes:Math.floor((s%3600)/60),seconds:s%60 };
}

export function pct(createdAt,unlockAt) {
  return Math.min(100,Math.max(0,((Date.now()-createdAt)/(unlockAt-createdAt))*100));
}

export function streakCount(vaults) {
  const days=[...new Set(
    vaults.filter(v=>v.status==="completed"&&v.responded_at)
      .map(v=>new Date(v.responded_at).toDateString())
  )].sort((a,b)=>new Date(b)-new Date(a));
  if(!days.length) return 0;
  let s=1;
  for(let i=1;i<days.length;i++){
    if(Math.round((new Date(days[i-1])-new Date(days[i]))/86400000)===1) s++;
    else break;
  }
  return s;
}

export function fmtDate(d,t){
  if(!d) return "";
  try {
    return new Date(`${d}T${t||"23:59"}:00`).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})+" · "+(t||"23:59");
  } catch { return `${d} ${t||""}`; }
}

// ─── DEADLINE VALIDATION HELPERS ──────────────────────────────────────────────
export function getMinDeadline() {
  const d = new Date(Date.now() + 30 * 60 * 1000); // +30 min
  return d;
}

export function getMinDateStr() {
  return getMinDeadline().toISOString().split("T")[0];
}

export function getMinTimeStr(dateStr) {
  const now = new Date(Date.now() + 30 * 60 * 1000);
  const today = now.toISOString().split("T")[0];
  if (dateStr === today) {
    return now.toTimeString().slice(0, 5); // "HH:MM"
  }
  return "00:00";
}

// Validation complète
export function validateDeadline(dateStr, timeStr, lang) {
  if (!dateStr || !timeStr) return { valid: false, error: null };
  const chosen = new Date(`${dateStr}T${timeStr}:00`);
  const minTime = new Date(Date.now() + 30 * 60 * 1000);

  if (chosen < new Date()) {
    return { valid: false, error: lang === "fr" ? "Cette date est dans le passé." : "This date is in the past." };
  }
  if (chosen < minTime) {
    const diff = Math.ceil((minTime - chosen) / 60000);
    return { valid: false, error: lang === "fr" ? `Minimum +30 min depuis maintenant (encore ${diff} min à ajouter).` : `Minimum +30 min from now (add ${diff} more min).` };
  }
  return { valid: true, error: null };
}
