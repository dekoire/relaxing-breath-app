import { useState } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router";

/** Demo zum Durchklicken (eine Datei-Seite ohne Server): Adressen hinter # statt echter Pfade */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { CONVEX_URL } from "@/lib/convex";
import { ConvexStoreProvider, LocalStoreProvider } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { ConvexLogin, DemoLogin } from "@/screens/Login";
import { Shell } from "@/components/Shell";
import { LogoMark } from "@/components/Art";
import Landing from "@/screens/Landing";
import Home from "@/screens/Home";
import Discover from "@/screens/Discover";
import ExercisePage, { BreathePage } from "@/screens/Exercise";
import CheckInPage from "@/screens/CheckIn";
import Review from "@/screens/Review";
import ArticlePage from "@/screens/Article";
import Settings from "@/screens/Settings";
import TimerPage from "@/screens/Timer";
import { BadgeWatcher } from "@/components/Progress";
import { RemindWatcher } from "@/components/Reminders";

/** Nicht angemeldet: „/“ ist die schlichte Startseite, alles andere (/login, /register) die Anmeldung */
function PublicSite({ login }: { login: React.ReactNode }) {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={login} />
    </Routes>
  );
}

const Splash = () => <div className="grid min-h-dvh place-items-center bg-page"><span className="splash-breathe"><LogoMark size={72} /></span></div>;

/** Ohne Convex: Demo-Konto nur in diesem Browser (gleiche Anmeldeseite, Daten lokal) – wie Notara */
const DEMO_USER = "atem:demo-user";
function DemoGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(DEMO_USER) ?? undefined; } catch { return undefined; } });
  const save = (v?: string) => { try { if (v) localStorage.setItem(DEMO_USER, v); else localStorage.removeItem(DEMO_USER); } catch { /* egal */ } setEmail(v); };
  if (!email) return <PublicSite login={<DemoLogin onDone={save} />} />;
  return <LocalStoreProvider email={email} signOut={() => save(undefined)}>{children}</LocalStoreProvider>;
}

function DataSource({ children }: { children: React.ReactNode }) {
  if (!CONVEX_URL) return <DemoGate>{children}</DemoGate>;
  return (
    <>
      <AuthLoading><Splash /></AuthLoading>
      <Unauthenticated><PublicSite login={<ConvexLogin />} /></Unauthenticated>
      <Authenticated><ConvexStoreProvider loading={<Splash />}>{children}</ConvexStoreProvider></Authenticated>
    </>
  );
}

export function App() {
  useTheme();
  return (
    <Router>
      <DataSource>
        <BadgeWatcher />
        <RemindWatcher />
        <Routes>
          {/* Vollbild ohne Leiste */}
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/atmen/:id" element={<BreathePage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="*" element={
            <Shell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/entdecken" element={<Discover />} />
                <Route path="/uebung/:id" element={<ExercisePage />} />
                <Route path="/rueckblick" element={<Review />} />
                <Route path="/artikel/:id" element={<ArticlePage />} />
                <Route path="/einstellungen" element={<Settings />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Shell>
          } />
        </Routes>
      </DataSource>
    </Router>
  );
}
