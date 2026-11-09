/**
 * Datenquelle wie in Notara: mit Convex (angemeldet) aus dem Konto, ohne Convex ein Demo-Konto nur in diesem Browser.
 * Seiten lesen alles über `useStore()` und kennen den Unterschied nicht.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import type { CheckIn, Session } from "@/lib/types";
import { adoptPrefs, onPrefsChange } from "@/lib/prefs";

export type Store = {
  account: { email: string; signOut: () => void; demo: boolean };
  checkins: CheckIn[];
  sessions: Session[];
  saveCheckin: (c: CheckIn) => void;
  removeCheckin: (id: string) => void;
  saveSession: (s: Session) => void;
};

const Ctx = createContext<Store | null>(null);
export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore außerhalb des StoreProvider");
  return s;
}

const upsert = <T extends { id: string }>(xs: T[], x: T) => (xs.some((y) => y.id === x.id) ? xs.map((y) => (y.id === x.id ? x : y)) : [...xs, x]);

/* ---------- Demo: im Browser ---------- */

export function LocalStoreProvider({ email, signOut, children }: { email: string; signOut: () => void; children: React.ReactNode }) {
  const key = `atem:demo:${email}`;
  const [data, setData] = useState<{ checkins: CheckIn[]; sessions: Session[] }>(() => {
    try { return { checkins: [], sessions: [], ...JSON.parse(localStorage.getItem(key) ?? "{}") }; } catch { return { checkins: [], sessions: [] }; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* voll */ } }, [key, data]);
  const value = useMemo<Store>(() => ({
    account: { email, signOut, demo: true },
    ...data,
    saveCheckin: (c) => setData((d) => ({ ...d, checkins: upsert(d.checkins, c) })),
    removeCheckin: (id) => setData((d) => ({ ...d, checkins: d.checkins.filter((c) => c.id !== id) })),
    saveSession: (s) => setData((d) => ({ ...d, sessions: upsert(d.sessions, s) })),
  }), [data, email, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ---------- Convex ---------- */

export function ConvexStoreProvider({ children, loading }: { children: React.ReactNode; loading: React.ReactNode }) {
  const all = useQuery(api.data.all);
  const { signOut } = useAuthActions();
  const saveC = useMutation(api.data.saveCheckin);
  const removeC = useMutation(api.data.removeCheckin);
  const saveS = useMutation(api.data.saveSession);
  const saveP = useMutation(api.data.savePrefs);
  // Einstellungen: einmal aus dem Konto übernehmen, danach Änderungen zurückschreiben
  const prefsJson = all?.prefs;
  const [adopted, setAdopted] = useState(false);
  useEffect(() => { if (prefsJson !== undefined && !adopted) { adoptPrefs(prefsJson); setAdopted(true); } }, [prefsJson, adopted]);
  useEffect(() => { onPrefsChange((json) => void saveP({ json })); return () => onPrefsChange(undefined); }, [saveP]);
  // eigene Änderungen sofort zeigen, bis Convex sie bestätigt
  const [pending, setPending] = useState<{ checkins: CheckIn[]; sessions: Session[] }>({ checkins: [], sessions: [] });
  const value = useMemo<Store | null>(() => {
    if (!all) return null;
    let checkins = all.checkins as CheckIn[], sessions = all.sessions as Session[];
    for (const c of pending.checkins) checkins = upsert(checkins, c);
    for (const s of pending.sessions) sessions = upsert(sessions, s);
    return {
      account: { email: all.email, signOut: () => void signOut(), demo: false },
      checkins,
      sessions,
      saveCheckin: (c) => {
        setPending((p) => ({ ...p, checkins: upsert(p.checkins, c) }));
        const { id, ...rest } = c;
        void saveC({ key: id, ...rest }).finally(() => setPending((p) => ({ ...p, checkins: p.checkins.filter((x) => x !== c) })));
      },
      removeCheckin: (id) => void removeC({ key: id }),
      saveSession: (s) => {
        setPending((p) => ({ ...p, sessions: upsert(p.sessions, s) }));
        const { id, ...rest } = s;
        void saveS({ key: id, ...rest }).finally(() => setPending((p) => ({ ...p, sessions: p.sessions.filter((x) => x !== s) })));
      },
    };
  }, [all, pending, signOut, saveC, removeC, saveS]);
  if (!value) return <>{loading}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
