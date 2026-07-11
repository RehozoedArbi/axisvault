import { useState } from "react";
import { T, FONT_DISPLAY } from "../lib/theme";
import { useT } from "../lib/i18n";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useToast } from "../context/ToastContext";
import { setNewsletterOptIn, deleteAccount } from "../lib/accountApi";
import { NavLogo } from "../components/NavLogo";
import { LangToggle } from "../components/LangToggle";
import { DeleteAccountModal } from "../components/DeleteAccountModal";

// ─── ACCOUNT SCREEN ────────────────────────────────────────────────────────────
export function Account({
  user,
  settings,
  onUpdateSettings,
  onBack,
  onAccountDeleted,
  lang,
  setLang,
}) {
  const t = useT(lang);
  const toast = useToast();
  const { isMobile } = useBreakpoint();
  const [busy, setBusy] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [cword, setCword] = useState("");
  const [shaking, setShaking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const newsletterOn = !!settings?.newsletter_opt_in;

  const toggleNewsletter = async () => {
    if (busy) return;
    setBusy(true);
    const next = !newsletterOn;
    onUpdateSettings({ newsletter_opt_in: next });
    await setNewsletterOptIn(user.uid, next);
    setBusy(false);
  };

  const confirmDelete = async () => {
    if (cword !== t.deleteTypeWord) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      toast(t.deleteErrorToast, "error");
      return;
    }
    toast(t.deleteSuccessToast, "success");
    setDeleteModal(false);
    onAccountDeleted();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: T.bg,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: `40px 20px ${isMobile ? "100px" : "80px"}`,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <NavLogo />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <LangToggle lang={lang} setLang={setLang} />
            <button className="av-btn-ghost" onClick={onBack}>
              {t.accountBack}
            </button>
          </div>
        </header>

        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 26,
            fontWeight: 800,
            color: T.tx1,
            letterSpacing: "-.02em",
            marginBottom: 6,
          }}
        >
          {t.accountTitle}
        </h1>
        <p style={{ fontSize: 13, color: T.tx2, marginBottom: 32 }}>
          {t.accountSignedInAs}{" "}
          <span style={{ color: T.tx1, fontWeight: 600 }}>{user.email}</span>
        </p>

        {/* Newsletter */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.tx1,
                  marginBottom: 4,
                }}
              >
                {t.accountNewsletterTitle}
              </h2>
              <p style={{ fontSize: 12, color: T.tx2, lineHeight: 1.6 }}>
                {t.accountNewsletterSub}
              </p>
            </div>
            <button
              onClick={toggleNewsletter}
              disabled={busy}
              aria-pressed={newsletterOn}
              style={{
                flexShrink: 0,
                width: 46,
                height: 26,
                borderRadius: 20,
                border: "none",
                cursor: busy ? "wait" : "pointer",
                background: newsletterOn ? T.grad : "rgba(148,163,184,.18)",
                position: "relative",
                transition: "background .2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: newsletterOn ? 23 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,.3)",
                }}
              />
            </button>
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              fontWeight: 700,
              color: newsletterOn ? T.green : T.tx3,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            {newsletterOn ? t.accountNewsletterOn : t.accountNewsletterOff}
          </div>
        </div>

        {/* Danger zone */}
        <div
          style={{
            background: T.redDim,
            border: "1px solid rgba(248,113,113,.2)",
            borderRadius: 16,
            padding: "20px 22px",
          }}
        >
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              color: T.red,
              marginBottom: 6,
            }}
          >
            {t.accountDangerTitle}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: T.tx2,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t.accountDeleteSub}
          </p>
          <button
            onClick={() => setDeleteModal(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 9,
              border: "1px solid rgba(248,113,113,.35)",
              background: "rgba(248,113,113,.12)",
              color: T.red,
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.accountDeleteBtn}
          </button>
        </div>
      </div>

      {deleteModal && (
        <DeleteAccountModal
          cword={cword}
          onCword={setCword}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteModal(false);
            setCword("");
          }}
          shaking={shaking}
          deleting={deleting}
          lang={lang}
        />
      )}
    </div>
  );
}
