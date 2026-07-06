// AxisVault — Edge Function: check-vaults
// Triggered every 15 min by GitHub Actions cron

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

// Plus besoin de Nodemailer ou de SDK, juste la clé API de Brevo
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
const SENDER_EMAIL = Deno.env.get("GMAIL_USER")!; // Ton adresse email d'expéditeur validée sur Brevo

serve(async (req) => {
  // ─── Security: verify cron secret ─────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // ─── 1. Fetch expired locked vaults ───────────────────────────────────────
  const { data: vaults, error } = await supabase
    .from("vaults")
    .select("id, email, text, secret_text, secret, deadline_date, deadline_time")
    .eq("status", "locked")
    .lte("unlock_at", new Date().toISOString());

  if (error) {
    console.error("Fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!vaults || vaults.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
  }

  let processed = 0;
  let failed = 0;

  for (const vault of vaults) {
    try {
      // ─── 2. Mark as unlocked ──────────────────────────────────────────────
      const { error: updateErr } = await supabase
        .from("vaults")
        .update({ status: "unlocked", email_sent_at: new Date().toISOString() })
        .eq("id", vault.id)
        .eq("status", "locked"); // idempotency guard

      if (updateErr) throw updateErr;

      // ─── 3. Préparation du mail ─────────────────────────────────────────
      const goalText = vault.secret ? "🔒 Your secret vault is now open." : vault.text;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#070D1A;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
            <div style="text-align:center;margin-bottom:40px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);line-height:56px;text-align:center;font-size:28px;margin-bottom:16px;">🔓</div>
              <h1 style="color:#F1F5F9;font-size:28px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">Your vault is open.</h1>
              <p style="color:#64748B;font-size:15px;margin:0;line-height:1.6;">The time has come. Head back to AxisVault to see your commitment.</p>
            </div>

            <div style="background:#0F1829;border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:24px;margin-bottom:32px;">
              <p style="color:#94A3B8;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">Your commitment</p>
              <p style="color:#F1F5F9;font-size:16px;font-weight:600;line-height:1.6;margin:0 0 16px;">${goalText}</p>
              <p style="color:#475569;font-size:13px;margin:0;">Deadline: <strong style="color:#64748B;">${vault.deadline_date} ${vault.deadline_time}</strong></p>
            </div>

            <div style="text-align:center;margin-bottom:40px;">
              <a href="${SUPABASE_URL.replace("supabase.co", "vercel.app")}"
                style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:9999px;letter-spacing:0.02em;">
                Open AxisVault →
              </a>
            </div>
            <p style="color:#1E293B;font-size:12px;text-align:center;margin:0;">AxisVault · Lock in. Level up.</p>
          </div>
        </body>
        </html>
      `;

      // ─── 4. Envoi via l'API REST HTTP de Brevo ───────────────────────────
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "AxisVault", email: SENDER_EMAIL },
          to: [{ email: vault.email }],
          subject: "🔓 Your vault is open — time to face it.",
          htmlContent: emailHtml,
        }),
      });

      if (!brevoResponse.ok) {
        const errorData = await brevoResponse.json();
        throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
      }

      processed++;
    } catch (err) {
      console.error(`Failed for vault ${vault.id}:`, err);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ processed, failed, total: vaults.length }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});