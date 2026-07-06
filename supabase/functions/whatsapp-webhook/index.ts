// AxisVault — Edge Function: whatsapp-webhook
// Handles TWO types of incoming webhooks on the same endpoint:
//
//   1. Twilio WhatsApp ChatOps commands (status | restart | rollback)
//      → identified by: form-urlencoded body, ?secret= query param
//
//   2. GitHub Actions push notification (on push to main)
//      → identified by: JSON body, "x-github-secret" header
//
// Required secrets (Supabase Dashboard > Edge Functions > Secrets):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM,
//   MY_WHATSAPP_NUMBER, WEBHOOK_SECRET, VERCEL_TOKEN, VERCEL_PROJECT_ID,
//   VERCEL_APP_URL, GITHUB_WEBHOOK_SECRET,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Twilio webhook URL:
//   https://xxxx.supabase.co/functions/v1/whatsapp-webhook?secret=YOUR_WEBHOOK_SECRET
//
// GitHub Actions calls this endpoint directly with header:
//   x-github-secret: YOUR_GITHUB_WEBHOOK_SECRET

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Env ─────────────────────────────────────────────────────────────────────
const MY_WHATSAPP_NUMBER    = Deno.env.get("MY_WHATSAPP_NUMBER")!;
const WEBHOOK_SECRET        = Deno.env.get("WEBHOOK_SECRET") ?? "";
const VERCEL_TOKEN          = Deno.env.get("VERCEL_TOKEN")!;
const VERCEL_PROJECT_ID     = Deno.env.get("VERCEL_PROJECT_ID")!;
const VERCEL_APP_URL        = Deno.env.get("VERCEL_APP_URL")!;
const GITHUB_WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID    = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN     = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_FROM  = Deno.env.get("TWILIO_WHATSAPP_FROM")!; // ex: whatsapp:+14155238886

const ALLOWED_COMMANDS = ["status", "restart", "rollback"];

// ─── Security: timing-safe string comparison ──────────────────────────────────
// Évite les timing attacks sur la comparaison des secrets.
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // Toujours comparer sur la longueur du buffer le plus long pour ne pas
  // fuiter d'info via le temps d'exécution en cas de longueurs différentes.
  const maxLen = Math.max(bufA.length, bufB.length);
  let result = bufA.length === bufB.length ? 0 : 1;

  for (let i = 0; i < maxLen; i++) {
    const byteA = i < bufA.length ? bufA[i] : 0;
    const byteB = i < bufB.length ? bufB[i] : 0;
    result |= byteA ^ byteB;
  }

  return result === 0;
}

// ─── Helpers: phone normalization ─────────────────────────────────────────────
function normalizePhone(num: string): string {
  return num.replace(/^whatsapp:/, "").trim();
}

// ─── Secret validation (Twilio path) ──────────────────────────────────────────
function validateTwilioSecret(req: Request): boolean {
  if (!WEBHOOK_SECRET) return true; // dev mode: skip if not set
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") ?? "";
  return timingSafeEqual(provided, WEBHOOK_SECRET);
}

// ─── Secret validation (GitHub Actions path) ──────────────────────────────────
function validateGithubSecret(req: Request): boolean {
  const provided = req.headers.get("x-github-secret") ?? "";
  return timingSafeEqual(provided, GITHUB_WEBHOOK_SECRET);
}

// ─── Rate limiting: block after repeated failures from same source ───────────
async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  source: string,
  maxFailures = 5,
  windowMinutes = 5
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("chatops_logs")
    .select("id", { count: "exact", head: true })
    .eq("command", source)
    .eq("result", "failure")
    .gte("executed_at", windowStart);

  return (count ?? 0) < maxFailures;
}

// ─── Twilio reply helper (inbound → reply via TwiML) ──────────────────────────
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

// ─── Twilio outbound send (used for proactive push notifications) ────────────
async function sendWhatsAppOutbound(message: string) {
  const toNumber = MY_WHATSAPP_NUMBER.startsWith("whatsapp:")
    ? MY_WHATSAPP_NUMBER
    : `whatsapp:${MY_WHATSAPP_NUMBER}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM,
      To: toNumber,
      Body: message,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Twilio send error:", err);
    throw new Error(`Twilio error ${res.status}: ${err}`);
  }
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

  // 1. Ping the Vercel app
  const pingStart = Date.now();
  try {
    const res = await fetch(VERCEL_APP_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
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
        READY: "✅", ERROR: "❌", BUILDING: "🔨", CANCELED: "⚠️",
      };
      const ago = Math.round((Date.now() - last.createdAt) / 60000);
      const agoStr = ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;
      lines.push(`🚀 Deploy: ${stateEmoji[last.state] ?? "❓"} ${last.state} (${agoStr})`);
      lines.push(`   Branch: ${last.meta?.githubCommitRef ?? "—"}`);
    }
  } catch {
    lines.push(`🚀 Deploy: ❓ Could not fetch`);
  }

  // 3. Site link
  lines.push(`🔗 Site: ${VERCEL_APP_URL}`);

  return `📊 *AxisVault Status*\n${lines.join("\n")}`;
}

// ─── RESTART command ──────────────────────────────────────────────────────────
async function runRestart(): Promise<string> {
  // Get the latest deployment
  const listRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const latest = listData.deployments?.[0];

  if (!latest) throw new Error("No deployment found to redeploy.");

  // Redeploy it
  const redeployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deploymentId: latest.uid,
      name: VERCEL_PROJECT_ID,
      target: "production",
    }),
  });

  if (redeployRes.ok) {
    return `🔨 *Restart triggered*\n\nRedeploying last production build.\nExpected in ~30–60s.\n\nSend \`status\` in 1min to check.`;
  } else {
    const err = await redeployRes.json();
    throw new Error(`Vercel error ${redeployRes.status}: ${err.error?.message ?? JSON.stringify(err)}`);
  }
}

// ─── ROLLBACK command ─────────────────────────────────────────────────────────
async function runRollback(): Promise<string> {
  // Fetch last 5 READY deployments
  const listRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5&state=READY`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const deployments = listData.deployments ?? [];

  if (deployments.length < 2) {
    return `⚠️ *Rollback not possible*\n\nNo previous deployment found.`;
  }

  const previous = deployments[1]; // index 0 = current, index 1 = previous
  const ago = Math.round((Date.now() - previous.createdAt) / 60000);
  const agoStr = ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;

  // Promote previous deployment to production
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

  if (promoteRes.ok || promoteRes.status === 204) {
    const branch = previous.meta?.githubCommitRef ?? "—";
    return `↩️ *Rollback successful*\n\nRestored deployment from ${agoStr}\nBranch: \`${branch}\`\n\nSend \`status\` to confirm.`;
  } else {
    const err = await promoteRes.text();
    throw new Error(`Vercel promote error ${promoteRes.status}: ${err}`);
  }
}

// ─── GitHub push notification handler ─────────────────────────────────────────
async function handleGithubWebhook(
  req: Request,
  rawBody: string,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  // ── Rate limit avant même de valider le secret (anti brute-force) ────────
  const withinLimit = await checkRateLimit(supabase, "github-push-notify-auth");
  if (!withinLimit) {
    console.warn("GitHub webhook rate limit exceeded");
    return new Response("Too Many Requests", { status: 429 });
  }

  if (!validateGithubSecret(req)) {
    console.warn("Invalid GitHub secret — request rejected");
    await logCommand(supabase, "github-push-notify-auth", "failure", "Invalid secret", 0);
    return new Response("Forbidden", { status: 403 });
  }

  let payload: {
    commit_sha?: string;
    commit_message?: string;
    author?: string;
    branch?: string;
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { commit_sha, commit_message, author, branch } = payload;
  const shortSha = commit_sha?.slice(0, 7) ?? "—";

  const message =
    `🚀 *Push détecté sur ${branch ?? "main"}*\n\n` +
    `👤 ${author ?? "—"}\n` +
    `📝 ${commit_message ?? "—"}\n` +
    `🔗 \`${shortSha}\`\n\n` +
    `Le déploiement Vercel est en cours.\nEnvoie \`status\` dans ~1 min pour confirmer.`;

  const start = Date.now();
  try {
    await sendWhatsAppOutbound(message);
    await logCommand(supabase, "github-push-notify", "success", message, Date.now() - start);
    return new Response("OK", { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logCommand(supabase, "github-push-notify", "failure", errMsg, Date.now() - start);
    return new Response("Failed to send notification", { status: 500 });
  }
}

// ─── Twilio ChatOps command handler ───────────────────────────────────────────
async function handleTwilioWebhook(
  req: Request,
  rawBody: string,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const withinLimit = await checkRateLimit(supabase, "twilio-auth");
  if (!withinLimit) {
    console.warn("Twilio webhook rate limit exceeded");
    return new Response("Too Many Requests", { status: 429 });
  }

  if (!validateTwilioSecret(req)) {
    console.warn("Invalid webhook secret — request rejected");
    await logCommand(supabase, "twilio-auth", "failure", "Invalid secret", 0);
    return new Response("Forbidden", { status: 403 });
  }

  const params = new URLSearchParams(rawBody);
  const from = params.get("From") ?? "";
  const body = params.get("Body")?.trim().toLowerCase() ?? "";

  if (normalizePhone(from) !== normalizePhone(MY_WHATSAPP_NUMBER)) {
    console.warn(`Unauthorized sender: ${from}`);
    await logCommand(supabase, "twilio-auth", "failure", `Unauthorized sender`, 0);
    return twilioReply("⛔ Unauthorized. bruu");
  }

  if (!ALLOWED_COMMANDS.includes(body)) {
    return twilioReply(
      `❓ Unknown command: *${body}*\n\nAllowed:\n• *status*\n• *restart*\n• *rollback*`
    );
  }

  const start = Date.now();
  let replyMessage = "";

  try {
    if (body === "status")   replyMessage = await runStatus(supabase);
    if (body === "restart")  replyMessage = await runRestart();
    if (body === "rollback") replyMessage = await runRollback();

    await logCommand(supabase, body, "success", replyMessage, Date.now() - start);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${body}] error:`, errMsg);
    replyMessage = `❌ *${body} failed*\n\n${errMsg}`;
    await logCommand(supabase, body, "failure", errMsg, Date.now() - start);
  }

  return twilioReply(replyMessage);
}

// ─── Main handler: routes by request origin ──────────────────────────────────
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // GitHub Actions envoie ce header custom ; Twilio ne l'envoie jamais.
  const isGithubWebhook = req.headers.has("x-github-secret");

  if (isGithubWebhook) {
    return await handleGithubWebhook(req, rawBody, supabase);
  } else {
    return await handleTwilioWebhook(req, rawBody, supabase);
  }
});