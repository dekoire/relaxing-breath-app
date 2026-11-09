import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { usePrefs } from "@/lib/prefs";
import { useStore } from "@/lib/store";
import { streak } from "@/lib/stats";
import { reminderText, type Remind } from "@/lib/remind";
import { todayIso } from "@/lib/types";

/**
 * Tägliche Erinnerung. Handy-App: lokale Mitteilungen, täglich wiederholt (auch bei geschlossener App).
 * Browser: nur solange die App offen ist, einmal je Uhrzeit und Tag (`atem:remind-sent`).
 * Nicht, wenn heute zu dieser Tageszeit schon eingecheckt bzw. geatmet wurde.
 */
const native = () => Capacitor.isNativePlatform();
const IDS = { morning: 4101, evening: 4102 } as const;

/** Erlaubnis holen (Handy oder Browser); gibt zurück, ob Mitteilungen gehen */
export async function askNotify(): Promise<boolean> {
  try {
    if (native()) return (await LocalNotifications.requestPermissions()).display === "granted";
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    return (await Notification.requestPermission()) === "granted";
  } catch { return false; }
}
export const notifySupported = () => native() || (typeof window !== "undefined" && "Notification" in window);

async function scheduleNative(r: Remind, days: number) {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: IDS.morning }, { id: IDS.evening }] });
    if (!r.on) return;
    const items = (["morning", "evening"] as const).filter((p) => (p === "morning" ? r.morning : r.evening)).map((p) => {
      const [hour, minute] = (p === "morning" ? r.mTime : r.eTime).split(":").map(Number);
      const t = reminderText(p, days, new Date().getDate());
      return { id: IDS[p], title: t.title, body: t.body, schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true } };
    });
    if (items.length) await LocalNotifications.schedule({ notifications: items });
  } catch { /* egal */ }
}

export function RemindWatcher() {
  const [prefs] = usePrefs();
  const { checkins, sessions } = useStore();
  const r = prefs.remind;
  const days = streak(checkins, sessions);

  useEffect(() => { if (native()) void scheduleNative(r, days); }, [r.on, r.morning, r.evening, r.mTime, r.eTime, days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (native() || !r.on || !("Notification" in window)) return;
    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hm = now.toTimeString().slice(0, 5);
      const today = todayIso();
      for (const p of ["morning", "evening"] as const) {
        if (!(p === "morning" ? r.morning : r.evening)) continue;
        const at = p === "morning" ? r.mTime : r.eTime;
        const key = `${today}:${p}`;
        let sent: string[] = [];
        try { sent = JSON.parse(localStorage.getItem("atem:remind-sent") ?? "[]"); } catch { /* egal */ }
        if (hm < at || sent.includes(key)) continue;
        const done = [...checkins, ...sessions].some((x) => x.date === today && (p === "morning" ? x.createdAt.slice(11, 13) < "12" : x.createdAt.slice(11, 13) >= "17"));
        try { localStorage.setItem("atem:remind-sent", JSON.stringify([key, ...sent].slice(0, 20))); } catch { /* egal */ }
        if (done) continue;
        const t = reminderText(p, days, now.getDate());
        try { new Notification(t.title, { body: t.body, icon: "/logo.svg" }); } catch { /* egal */ }
      }
    };
    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [r, checkins, sessions, days]);
  return null;
}
