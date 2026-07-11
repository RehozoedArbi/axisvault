import { supabase } from "./supabase";

// ─── USER SETTINGS (newsletter opt-in, terms acceptance) ─────────────────────
// Table expected: user_settings(uid uuid primary key, newsletter_opt_in boolean default false,
//   terms_accepted_at timestamptz, updated_at timestamptz)

export async function getUserSettings(uid) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("uid", uid)
    .maybeSingle();
  if (error) { console.warn("[user_settings] fetch error", error); return null; }
  return data;
}

export async function upsertUserSettings(uid, patch) {
  return supabase.from("user_settings").upsert({
    uid,
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export async function completeOnboarding(uid, newsletterOptIn) {
  return upsertUserSettings(uid, {
    newsletter_opt_in: !!newsletterOptIn,
    terms_accepted_at: new Date().toISOString(),
  });
}

export async function setNewsletterOptIn(uid, value) {
  return upsertUserSettings(uid, { newsletter_opt_in: !!value });
}

// ─── ACCOUNT DELETION ──────────────────────────────────────────────────────────
// Calls the `delete-account` Supabase Edge Function, which is responsible for
// wiping the account server-side (auth user, vaults, user_settings, sessions).
// Locally we also clear any functional local storage and sign the user out.
//
// `supabase.functions.invoke` can throw (not just return `{error}`) when the
// request never reaches the function at all — wrong project URL, the function
// isn't deployed, or a CORS/network failure (this is the
// "FunctionsFetchError: Failed to send a request to the Edge Function" case).
// We catch that here so the UI can show a clean error toast instead of an
// unhandled rejection.
export async function deleteAccount() {
  try {
    const { data, error } = await supabase.functions.invoke("delete-account");
    if (error) {
      console.error("[delete-account] function returned an error:", error);
      return { error };
    }

    try { localStorage.removeItem("av_pins"); } catch {}

    await supabase.auth.signOut();
    return { data, error: null };
  } catch (err) {
    console.error("[delete-account] request never reached the function:", err);
    return { error: err };
  }
}