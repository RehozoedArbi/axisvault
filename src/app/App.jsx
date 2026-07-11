import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { CSS } from "./lib/theme";
import { watchVaults, createVault } from "./lib/vaultsApi";
import { getUserSettings, completeOnboarding } from "./lib/accountApi";
import { ToastProvider } from "./context/ToastContext";
import { LandingPage } from "./screens/LandingPage";
import { Login } from "./screens/Login";
import { Splash } from "./screens/Splash";
import { Onboarding } from "./screens/Onboarding";
import { Dashboard } from "./screens/Dashboard";
import { VaultsScreen } from "./screens/VaultsScreen";
import { Account } from "./screens/Account";

// Local fallback flag so a transient DB read hiccup never re-triggers the
// onboarding dialog for someone who has already accepted it once. Keyed per
// user id so switching Google accounts on the same device behaves correctly.
const onboardedKey = (uid) => `iv_onboarded_${uid}`;
const hasOnboardedLocally = (uid) => {
  try {
    return localStorage.getItem(onboardedKey(uid)) === "1";
  } catch {
    return false;
  }
};
const markOnboardedLocally = (uid) => {
  try {
    localStorage.setItem(onboardedKey(uid), "1");
  } catch {}
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [settings, setSettings] = useState(null);
  const [lang, setLang] = useState("fr");

  // Refs mirror the latest user/settings so callbacks fired from timers
  // (the splash screen) always read fresh values without needing to change
  // identity on every render — that identity churn was what made the splash
  // screen's effect restart mid-animation and re-ask for onboarding.
  const userRef = useRef(null);
  const settingsRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          uid: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.email,
        });
        setScreen((prev) => (prev === "login" ? "splash" : prev));
        getUserSettings(u.id).then(setSettings);
      } else {
        setUser(null);
        setVaults([]);
        setSettings(null);
        setScreen("landing");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    return watchVaults(user.uid, setVaults);
  }, [user]);

  const handleUpdateVault = useCallback((id, patch) => {
    setVaults((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    );
  }, []);

  const handleAddVault = async (params) => {
    const unlockAt = new Date(
      `${params.deadlineDate}T${params.deadlineTime}:00`,
    ).toISOString();
    const temp = {
      id: "temp-" + Date.now(),
      uid: params.uid,
      email: params.email,
      text: null,
      secret_text: params.text,
      secret: true,
      deadline_date: params.deadlineDate,
      deadline_time: params.deadlineTime,
      unlock_at: unlockAt,
      category: params.category,
      status: "locked",
      created_at: new Date().toISOString(),
      feedback_message: null,
      responded_at: null,
    };
    setVaults((p) => [temp, ...p]);
    setScreen("vaults");
    await createVault(params);
  };

  // Stable identity (empty deps) so the Splash component's own effect never
  // restarts mid-animation. By the time this actually fires (~3.5s after
  // mount), the settings fetch triggered on sign-in has almost always
  // resolved into settingsRef — and if it hasn't, the local fallback flag
  // still prevents onboarding from reappearing for someone who already did it.
  const handleSplashComplete = useCallback(() => {
    const u = userRef.current;
    const s = settingsRef.current;
    const onboarded =
      !!(s && s.terms_accepted_at) || (u && hasOnboardedLocally(u.uid));
    setScreen((cur) =>
      cur === "splash" ? (onboarded ? "dashboard" : "onboarding") : cur,
    );
  }, []);

  const handleOnboardingComplete = async (newsletterOptIn) => {
    if (!user) return;
    await completeOnboarding(user.uid, newsletterOptIn);
    markOnboardedLocally(user.uid);
    setSettings((prev) => ({
      ...(prev || {}),
      uid: user.uid,
      newsletter_opt_in: newsletterOptIn,
      terms_accepted_at: new Date().toISOString(),
    }));
    setScreen("dashboard");
  };

  const handleUpdateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...(prev || {}), ...patch }));
  }, []);

  const handleAccountDeleted = () => {
    if (user) {
      try {
        localStorage.removeItem(onboardedKey(user.uid));
      } catch {}
    }
    setUser(null);
    setVaults([]);
    setSettings(null);
    setScreen("landing");
  };

  const shared = { lang, setLang };
  return (
    <ToastProvider>
      <style>{CSS}</style>
      {screen === "landing" && (
        <LandingPage
          lang={lang}
          setLang={setLang}
          onEnter={() => setScreen("login")}
        />
      )}
      {screen === "login" && <Login {...shared} />}
      {screen === "splash" && (
        <Splash onComplete={handleSplashComplete} {...shared} />
      )}
      {screen === "onboarding" && user && (
        <Onboarding lang={lang} onComplete={handleOnboardingComplete} />
      )}
      {screen === "dashboard" && user && (
        <Dashboard
          user={user}
          vaults={vaults}
          onAdd={handleAddVault}
          onViewVaults={() => setScreen("vaults")}
          onAccount={() => setScreen("account")}
          onSignOut={() => supabase.auth.signOut()}
          {...shared}
        />
      )}
      {screen === "vaults" && user && (
        <VaultsScreen
          vaults={vaults}
          onBack={() => setScreen("dashboard")}
          onAccount={() => setScreen("account")}
          onSignOut={() => supabase.auth.signOut()}
          onUpdateVault={handleUpdateVault}
          {...shared}
        />
      )}
      {screen === "account" && user && (
        <Account
          user={user}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setScreen(vaults.length > 0 ? "vaults" : "dashboard")}
          onAccountDeleted={handleAccountDeleted}
          {...shared}
        />
      )}
    </ToastProvider>
  );
}
