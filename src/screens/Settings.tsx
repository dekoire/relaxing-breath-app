import { ChevronRight, LogOut, Monitor, Moon, Sun, Vibrate } from "lucide-react";
import { useThemeChoice, type ThemeChoice } from "@/lib/theme";
import { usePrefs } from "@/lib/prefs";
import { useStore } from "@/lib/store";
import { useVoices, say } from "@/lib/speech";
import { canVibrate, isNative, play, type Cue, type HapticLevel } from "@/lib/haptics";
import { LENGTH, type Length } from "@/lib/checkin";
import { PageTitle, Segmented } from "@/components/primitives";

/** Einstellungen wie die iOS-Einstellungen: Gruppen aus Zeilen auf weißen bzw. dunklen Karten */
export default function Settings() {
  const [theme, setTheme] = useThemeChoice();
  const [prefs, setPrefs] = usePrefs();
  const { account } = useStore();
  const voices = useVoices();
  const vib = canVibrate();
  const LEARN: { cue: Cue; s: number; label: string; sub: string }[] = [
    { cue: "in", s: 4, label: "Einatmen", sub: "wird schneller und kräftiger" },
    { cue: "hold", s: 4, label: "Halten", sub: "ein weicher Doppel-Tipper" },
    { cue: "out", s: 6, label: "Ausatmen", sub: "wird langsamer und leiser" },
    { cue: "in2", s: 1, label: "Nachatmen", sub: "zwei kräftige Tipper" },
    { cue: "end", s: 0, label: "Fertig", sub: "drei Schläge" },
  ];
  return (
    <div>
      <PageTitle title="Profil" sub={account.email} />

      <Group title="Design">
        <div className="p-3">
          <Segmented label="Design" joined value={theme} onChange={(v: ThemeChoice) => setTheme(v)} options={[{ id: "system", label: "Automatisch" }, { id: "light", label: "Hell" }, { id: "dark", label: "Dunkel" }]} />
        </div>
        <p className="flex items-center gap-2 px-4 pb-3 text-small text-muted">{theme === "system" ? <Monitor size={15} /> : theme === "light" ? <Sun size={15} /> : <Moon size={15} />} {theme === "system" ? "Folgt deinem Gerät" : theme === "light" ? "Immer hell" : "Immer dunkel"}</p>
      </Group>

      <Group title="Vibration" foot={vib ? "So spürst du die Atemanweisung ohne Kopfhörer, wie bei der Apple Watch. Antippen zum Ausprobieren." : isNative() ? "" : "Vibration gibt es in der App fürs iPhone und Android und in Android-Browsern. Safari am iPhone kann nicht vibrieren."}>
        <div className="p-3"><Segmented label="Stärke" joined value={prefs.haptics} onChange={(v: HapticLevel) => setPrefs(v === "off" ? { haptics: v } : { haptics: v, hapticLevel: v })} options={[{ id: "strong", label: "Deutlich" }, { id: "soft", label: "Sanft" }, { id: "off", label: "Aus" }]} /></div>
        {LEARN.map((l) => (
          <Row key={l.label} onClick={() => play(l.cue, l.s, prefs.haptics === "off" ? "strong" : prefs.haptics)} disabled={!vib}>
            <span className="grid h-9 w-9 place-items-center rounded-tile bg-lavender text-brand-400"><Vibrate size={17} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium">{l.label}</span><span className="block text-small text-muted">{l.sub}</span></span>
            <span className="text-small font-semibold text-brand-400">Spüren</span>
          </Row>
        ))}
      </Group>

      <Group title="Stimme und Klang">
        <Toggle label="Stimme spricht mit" on={prefs.voice} onChange={(v) => setPrefs({ voice: v })} />
        {voices.length > 0 && (
          <label className="flex items-center gap-3 border-t border-line px-4 py-3">
            <span className="flex-1 text-[16px] font-medium">Stimme</span>
            <select value={prefs.voiceName} onChange={(e) => { setPrefs({ voiceName: e.target.value }); void say("Einatmen. Und langsam ausatmen.", { voiceName: e.target.value }); }} className="h-10 max-w-[55%] border border-card-line pl-4 text-small">
              <option value="">Automatisch</option>
              {voices.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </label>
        )}
        <Toggle label="Klangschale" on={prefs.bowl} onChange={(v) => setPrefs({ bowl: v })} />
      </Group>

      <Group title="Check-in">
        <div className="p-3"><Segmented label="Länge" joined value={prefs.length} onChange={(v: Length) => setPrefs({ length: v })} options={(Object.keys(LENGTH) as Length[]).map((k) => ({ id: k, label: LENGTH[k].label }))} /></div>
        <p className="px-4 pb-3 text-small text-muted">{LENGTH[prefs.length].sub} zum Reflektieren nach den Fragen zum Gefühl.</p>
        <Toggle label="Fragen vorlesen" on={prefs.readAloud} onChange={(v) => setPrefs({ readAloud: v })} />
      </Group>

      <Group title="Konto" foot={account.demo ? "Demo: Konto und Daten bleiben nur in diesem Browser." : undefined}>
        <Row onClick={account.signOut}><LogOut size={19} className="text-muted" /><span className="flex-1 text-[16px] font-medium">Abmelden</span><ChevronRight size={18} className="text-muted" /></Row>
      </Group>

      <p className="mt-8 px-2 text-caption leading-5 text-muted">Atemübungen ersetzen keine ärztliche oder psychotherapeutische Behandlung. Wenn es dir sehr schlecht geht: TelefonSeelsorge 0800 111 0 111 (kostenlos, rund um die Uhr). Im Notfall 112.</p>
    </div>
  );
}

function Group({ title, foot, children }: { title: string; foot?: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 px-2 text-small font-semibold tracking-wide text-muted uppercase">{title}</h2>
      <div className="overflow-hidden rounded-3xl border border-card-line bg-surface">{children}</div>
      {foot && <p className="mt-2 px-2 text-small leading-5 text-muted">{foot}</p>}
    </section>
  );
}
function Row({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-[58px] w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left first:border-t-0 hover:bg-fg/[0.03] disabled:opacity-45">{children}</button>;
}
function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex min-h-[58px] w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left first:border-t-0">
      <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium">{label}</span>{sub && <span className="block text-small text-muted">{sub}</span>}</span>
      <span className={`h-[31px] w-[51px] shrink-0 rounded-full p-[2px] transition ${on ? "bg-brand-500" : "bg-fg/15"}`}><span className={`block h-[27px] w-[27px] rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} /></span>
    </button>
  );
}
