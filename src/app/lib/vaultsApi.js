import { supabase } from "./supabase";

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:window.location.origin } });
}

export async function fetchVaults(uid) {
  const { data } = await supabase.from("vaults").select("*").eq("uid",uid).order("created_at",{ascending:false});
  return data||[];
}

export function watchVaults(uid, cb) {
  const ch = supabase
    .channel("vaults-" + uid)
    .on("postgres_changes",{event:"*",schema:"public",table:"vaults",filter:`uid=eq.${uid}`},
      () => { fetchVaults(uid).then(cb); })
    .subscribe((status, err) => {
      console.log("[realtime]", status, err||"");
    });
  fetchVaults(uid).then(cb);
  const pollId = setInterval(() => fetchVaults(uid).then(cb), 15000);
  return () => { supabase.removeChannel(ch); clearInterval(pollId); };
}

export async function createVault({ uid,email,text,deadlineDate,deadlineTime,category }) {
  const unlockAt = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
  // ALL vaults are secret by design — content is always stored in secret_text
  return supabase.from("vaults").insert({
    uid, email,
    text: null,
    secret_text: text,
    secret: true,
    deadline_date: deadlineDate,
    deadline_time: deadlineTime,
    unlock_at: unlockAt,
    category,
    status: "locked",
    email_sent_at: null,
    responded_at: null,
    feedback_message: null,
  });
}

export async function respondToVault(vaultId, status, feedbackMessage) {
  return supabase.from("vaults").update({
    status, feedback_message: feedbackMessage, responded_at: new Date().toISOString()
  }).eq("id",vaultId).eq("status","unlocked");
}

// ─── LOCAL PINS (localStorage) ────────────────────────────────────────────────
export function getPins() { try { return JSON.parse(localStorage.getItem("av_pins")||"[]"); } catch { return []; } }

export function togglePin(id) {
  const pins = getPins();
  const next = pins.includes(id)?pins.filter(p=>p!==id):[...pins,id];
  localStorage.setItem("av_pins", JSON.stringify(next));
  return next;
}
