// AxisVault — Edge Function: whatsapp-webhook
// Receives WhatsApp messages via Twilio Sandbox and executes ChatOps commands.
//
// Commands allowed: status | restart | rollback
//
// Required secrets (Supabase Dashboard > Edge Functions > Secrets):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, MY_WHATSAPP_NUMBER,
//   GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO,
//   VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_APP_URL,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Env ─────────────────────────────────────────────────────────────────────
const TWILIO_ACCOUNT_SID     = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN      = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const MY_WHATSAPP_NUMBER     = Deno.env.get("MY_WHATSAPP_NUMBER")!; // e.g. whatsapp:+261XXXXXXXXX
const GITHUB_TOKEN           = Deno.env.get("GITHUB_TOKEN")!;
const GITHUB_OWNER           = Deno.env.get("GITHUB_OWNER")!;
const GITHUB_REPO            = Deno.env.get("GITHUB_REPO")!;
const VERCEL_TOKEN           = Deno.env.get("VERCEL_TOKEN")!;
const VERCEL_PROJECT_ID      = Deno.env.get("VERCEL_PROJECT_ID")!;
const VERCEL_APP_URL         = Deno.env.get("VERCEL_APP_URL")!; // https://axisvault.vercel.app
const SUPABASE_URL           = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_COMMANDS = ["status", "restart", "rollback"];

// ─── Twilio signature validation (Web Crypto API — no external deps) ─────────
// Twilio signs every request with HMAC-SHA1 — we verify it to block fakes.
async function validateTwilioSignature(req: Request, body: string): Promise<boolean> {
  const signature = req.headers.get("x-twilio-signature");
  if (!signature) return false;

  // Build the string to sign: URL + sorted POST params concatenated
  const url = req.url;
  const params = new URLSearchParams(body);
  const sortedKeys = [...params.keys()].sort();
  let dataToSign = url;
  for (const key of sortedKeys) {
    dataToSign += key + (params.get(key) ?? "");
  }

  // HMAC-SHA1 using native Web Crypto (no external package needed)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(TWILIO_AUTH_TOKEN);
  const messageData = encoder.encode(dataToSign);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  // Convert ArrayBuffer to base64
  const signatureBytes = new Uint8Array(signatureBuffer);
  const base64Sig = btoa(String.fromCharCode(...signatureBytes));

  return base64Sig === signature;
}

// ─── Twilio reply helper ──────────────────────────────────────────────────────
function twilioReply(message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
    status: 200,
  });
}

// ─── Log to Supabase ──────────────────────────────────────────────────────────
async function logCommand(
  supabase: ReturnType<typeof createClient>,
  command: string,
  result: "success" | "failure",
  details: string,
  duration_ms: number
) {
  await supabase.from("chatops_logs").insert({
    command,
    result,
    details,
    duration_ms,
    executed_at: new Date().toISOString(),
  });
}

// ─── STATUS command ───────────────────────────────────────────────────────────
async function runStatus(supabase: ReturnType<typeof createClient>): Promise<string> {
  const lines: string[] = [];

  // 1. Ping the Vercel app URL
  const pingStart = Date.now();
  try {
    const res = await fetch(VERCEL_APP_URL, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    const pingMs = Date.now() - pingStart;
    lines.push(`🌐 App: ${res.ok ? "✅ Online" : "⚠️ Degraded"} (${pingMs}ms)`);
  } catch {
    lines.push(`🌐 App: ❌ Unreachable`);
  }

  // 2. Last Vercel deployment
  try {
    const deployRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    const deployData = await deployRes.json();
    const last = deployData.deployments?.[0];
    if (last) {
      const stateEmoji: Record<string, string> = {
        READY: "✅",
        ERROR: "❌",
        BUILDING: "🔨",
        CANCELED: "⚠️",
      };
      const ago = Math.round((Date.now() - last.createdAt) / 60000);
      const agoStr = ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;
      lines.push(`🚀 Deploy: ${stateEmoji[last.state] ?? "❓"} ${last.state} (${agoStr})`);
      lines.push(`   Branch: ${last.meta?.githubCommitRef ?? "—"}`);
    }
  } catch {
    lines.push(`🚀 Deploy: ❓ Could not fetch`);
  }

  // 3. Supabase — active vaults count
  try {
    const { count } = await supabase
      .from("vaults")
      .select("id", { count: "exact", head: true })
      .eq("status", "locked");
    lines.push(`🔒 Active vaults: ${count ?? "?"}`);

    const { count: unlocked } = await supabase
      .from("vaults")
      .select("id", { count: "exact", head: true })
      .eq("status", "unlocked");
    lines.push(`🔓 Awaiting response: ${unlocked ?? "?"}`);
  } catch {
    lines.push(`🔒 Supabase: ❓ Could not fetch`);
  }

  return `📊 *AxisVault Status*\n${lines.join("\n")}`;
}

// ─── RESTART command ──────────────────────────────────────────────────────────
// Vercel is already linked to GitHub main → auto-deploys on push.
// For restart, we trigger a new deployment directly via Vercel API
// (redeploy the latest deployment) — no GitHub Actions needed.
async function runRestart(): Promise<string> {
  // 1. Get the latest deployment
  const listRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const latest = listData.deployments?.[0];

  if (!latest) throw new Error("No deployment found to redeploy.");

  // 2. Redeploy it (Vercel: POST /v13/deployments with deploymentId source)
  const redeployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deploymentId: latest.uid,  // clone this deployment
      name: VERCEL_PROJECT_ID,
      target: "production",
    }),
  });

  const redeployData = await redeployRes.json();

  if (redeployRes.ok) {
    return `🔨 *Restart triggered*\n\nRedeploying last production build.\nExpected in ~30–60s.\n\nSend \`status\` in 1min to check.`;
  } else {
    throw new Error(`Vercel redeploy error ${redeployRes.status}: ${redeployData.error?.message ?? JSON.stringify(redeployData)}`);
  }
}

// ─── ROLLBACK command ─────────────────────────────────────────────────────────
// Promotes the previous READY Vercel deployment back to production.
async function runRollback(): Promise<string> {
  // 1. Fetch last 2 ready deployments
  const listRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5&state=READY`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const deployments: Array<{ uid: string; url: string; createdAt: number; meta?: Record<string, string> }> =
    listData.deployments ?? [];

  if (deployments.length < 2) {
    return `⚠️ *Rollback not possible*\n\nNo previous deployment found to roll back to.`;
  }

  // Index 0 = current production, index 1 = previous
  const previous = deployments[1];
  const ago = Math.round((Date.now() - previous.createdAt) / 60000);
  const agoStr = ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;

  // 2. Promote previous deployment to production alias
  // Vercel: PATCH /v6/deployments/{id}/aliases  (assign the production domain)
  // Simpler alternative: use the "promote" endpoint
  const promoteRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/promote/${previous.uid}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (promoteRes.ok || promoteRes.status === 200 || promoteRes.status === 204) {
    const branch = previous.meta?.githubCommitRef ?? "—";
    return `↩️ *Rollback successful*\n\nRestored deployment from ${agoStr}\nBranch: \`${branch}\`\nURL: ${previous.url}\n\nSend \`status\` to confirm.`;
  } else {
    const err = await promoteRes.text();
    throw new Error(`Vercel promote error ${promoteRes.status}: ${err}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();

  // ── Validate Twilio signature ────────────────────────────────────────────
  const isValid = await validateTwilioSignature(req, rawBody);
  if (!isValid) {
    console.warn("Invalid Twilio signature — request rejected");
    return new Response("Forbidden", { status: 403 });
  }

  const params = new URLSearchParams(rawBody);
  const from    = params.get("From") ?? "";
  const body    = params.get("Body")?.trim().toLowerCase() ?? "";

  // ── Whitelist: only your number ──────────────────────────────────────────
  if (from !== MY_WHATSAPP_NUMBER) {
    console.warn(`Unauthorized sender: ${from}`);
    return twilioReply("⛔ Unauthorized.");
  }

  // ── Whitelist: only 3 commands ───────────────────────────────────────────
  if (!ALLOWED_COMMANDS.includes(body)) {
    return twilioReply(
      `❓ Unknown command: *${body}*\n\nAllowed commands:\n• *status* — check app health\n• *restart* — redeploy the app\n• *rollback* — restore previous version`
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const start = Date.now();
  let replyMessage = "";

  try {
    if (body === "status") {
      replyMessage = await runStatus(supabase);
    } else if (body === "restart") {
      replyMessage = await runRestart();
    } else if (body === "rollback") {
      replyMessage = await runRollback();
    }

    await logCommand(supabase, body, "success", replyMessage, Date.now() - start);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${body}] error:`, errMsg);
    replyMessage = `❌ *${body} failed*\n\n${errMsg}`;
    await logCommand(supabase, body, "failure", errMsg, Date.now() - start);
  }

  return twilioReply(replyMessage);
});