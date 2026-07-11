// supabase/functions/delete-account/index.ts
//
// Deletes the calling user's account entirely:
//   1. Deletes their vaults (public.vaults)
//   2. Deletes their settings row (public.user_settings)
//   3. Deletes the auth.users record itself (revokes all sessions)
//
// Deploy with:  supabase functions deploy delete-account
// The function must be called with the user's own access token (the client
// already does this via supabase.functions.invoke, which forwards the
// current session automatically).
//
// NOTE: "FunctionsFetchError: Failed to send a request to the Edge Function"
// on the client almost always means one of:
//   - the function isn't deployed yet (`supabase functions deploy delete-account`)
//   - the browser's CORS preflight (OPTIONS) request was rejected because no
//     CORS headers were returned — this is why every response below includes
//     `corsHeaders`, including the OPTIONS branch.
//   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY aren't set in the function's
//     environment (Project Settings → Edge Functions → Secrets; these two are
//     usually pre-populated automatically, but double-check on self-hosted).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Browsers send a preflight OPTIONS request before the real POST. Without
  // this branch the preflight fails and the client never even attempts the
  // real call — this is the #1 cause of FunctionsFetchError.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client scoped to the caller — used only to identify who is asking.
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client — required to delete rows across RLS and remove the auth user.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: vaultsErr } = await admin.from("vaults").delete().eq("uid", user.id);
    if (vaultsErr) throw vaultsErr;

    const { error: settingsErr } = await admin.from("user_settings").delete().eq("uid", user.id);
    if (settingsErr) throw settingsErr;

    const { error: authDeleteErr } = await admin.auth.admin.deleteUser(user.id);
    if (authDeleteErr) throw authDeleteErr;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});