/**
 * Design: Wie das Gerät (Standard), Dunkel oder Hell. Gemerkt in `atem:theme`; index.html setzt `data-theme` schon
 * vor dem ersten Bild (dieselbe Regel wie hier), dieser Hook hält es aktuell – auch wenn das Gerät umschaltet.
 */
import { useEffect, useState } from "react";

export type ThemeChoice = "dark" | "light" | "system";
const KEY = "atem:theme";
const BG = { dark: "#121214", light: "#f4f4f6" } as const;

export function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const sysDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  const theme = choice === "system" ? (sysDark ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = theme;
  setBar();
}

/** N78: gespeicherte Wahl erneut anwenden (nach dem Abgleich mit dem Konto) */
export function applyTheme() { apply(readChoice()); }

/** Farbe der Statusleiste: im Glas-Design die oberste Farbe des Verlaufs, sonst der Grund (sonst dunkler Streifen oben) */
function setBar() {
  const h = document.documentElement;
  const c = h.dataset.theme === "light" ? BG.light : BG.dark;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c);
}

/** In App: Design anwenden und Geräte-Wechsel mitnehmen */
export function useTheme() {
  useEffect(() => {
    apply(readChoice());
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => readChoice() === "system" && apply("system");
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);
}

/** Design setzen (auch von Nova im Chat) */
export function setThemeChoice(c: ThemeChoice) {
  try {
    if (c === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, c);
  } catch {
    /* egal */
  }
  apply(c);
  window.dispatchEvent(new Event("atem:theme"));
}

/** Für die Einstellungen: Wahl lesen und setzen */
export function useThemeChoice() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice);
  useEffect(() => { const on = () => setChoice(readChoice()); window.addEventListener("atem:theme", on); return () => window.removeEventListener("atem:theme", on); }, []);
  const set = (c: ThemeChoice) => { setChoice(c); setThemeChoice(c); };
  return [choice, set] as const;
}


