import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, Lock, Mail, Smile, Wind, Vibrate } from "lucide-react";
import { Button } from "@/components/primitives";
import { Logo } from "@/components/Art";
import { Nova } from "@/components/Nova";

/**
 * 1:1 aus Notara (src/screens/Login.tsx). Nova wie in Notara, in Lila. Anmelden / Registrieren wie in Finastry: links das Formular (Felder mit Symbolen, Passwort-Stärke beim Registrieren),
 * rechts ab Desktop eine flache Fläche (volle Höhe, Linie links), Nova groß, darunter drei Versprechen.
 * Mit Convex echte Konten (Convex Auth), ohne Convex ein Demo-Konto im Browser.
 */
type Flow = "signIn" | "signUp";
type Submit = (data: { email: string; password: string; flow: Flow }) => Promise<void>;

export function ConvexLogin() {
  const { signIn } = useAuthActions();
  return (
    <LoginView
      onSubmit={async ({ email, password, flow }) => {
        const fd = new FormData();
        fd.set("email", email);
        fd.set("password", password);
        fd.set("flow", flow);
        try {
          await signIn("password", fd);
        } catch {
          throw new Error(flow === "signIn" ? "E-Mail oder Passwort stimmt nicht." : "Konto konnte nicht angelegt werden, gibt es die E-Mail schon?");
        }
      }}
      reset={{
        start: async (email) => {
          const fd = new FormData();
          fd.set("email", email);
          fd.set("flow", "reset");
          try { await signIn("password", fd); } catch { throw new Error("Der Code konnte nicht verschickt werden. Stimmt die E-Mail?"); }
        },
        verify: async (email, code, newPassword) => {
          const fd = new FormData();
          fd.set("email", email);
          fd.set("code", code);
          fd.set("newPassword", newPassword);
          fd.set("flow", "reset-verification");
          try { await signIn("password", fd); } catch { throw new Error("Der Code stimmt nicht oder ist abgelaufen."); }
        },
      }}
    />
  );
}

/** Demo ohne Server: das Konto gilt nur in diesem Browser, die Daten auch */
export function DemoLogin({ onDone }: { onDone: (email: string) => void }) {
  return <LoginView demoMode onSubmit={async ({ email }) => onDone(email)} />;
}

/** dieselben drei Versprechen wie auf der Website: festhalten, erinnern, planen (je mit Farbe des Bereichs) */
const POINTS = [
  { icon: Smile, color: "#6d4aff", title: "Hinspüren", text: "Jeden Tag kurz fragen: Wie geht's dir? Und kurz über den Tag nachdenken." },
  { icon: Wind, color: "#8b6bff", title: "Atmen", text: "Über 50 Atemübungen, passend zu deinem Gefühl." },
  { icon: Vibrate, color: "#4a4a55", title: "Spüren", text: "Mit Vibration: atmen ohne Kopfhörer, das Handy in der Tasche." },
];

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">{icon}</span>
        {children}
      </span>
    </label>
  );
}

const RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: "Mindestens 8 Zeichen", test: (p) => p.length >= 8 },
  { label: "Groß- und Kleinbuchstaben", test: (p) => /[a-zäöü]/.test(p) && /[A-ZÄÖÜ]/.test(p) },
  { label: "Eine Zahl oder ein Sonderzeichen", test: (p) => /[\d\W_]/.test(p) },
];
function Strength({ password }: { password: string }) {
  const score = RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-fg/10", "bg-[#e5484d]", "bg-[#f5c542]", "bg-[#34c27a]"];
  return (
    <div className="mt-2.5 px-1">
      <div className="flex gap-1.5" aria-hidden>{[1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${score >= i ? colors[score] : "bg-fg/10"}`} />)}</div>
      <ul className="mt-2 grid gap-1 text-[12.5px]">
        {RULES.map((r) => {
          const ok = r.test(password);
          return <li key={r.label} className={`flex items-center gap-1.5 ${ok ? "text-[#34c27a]" : "text-muted"}`}><span className={`grid h-4 w-4 place-items-center rounded-full ${ok ? "bg-[#34c27a] text-white" : "border border-fg/25"}`}>{ok && <Check size={10} strokeWidth={3} />}</span>{r.label}</li>;
        })}
      </ul>
    </div>
  );
}

type Reset = { start: (email: string) => Promise<void>; verify: (email: string, code: string, newPassword: string) => Promise<void> };

function LoginView({ onSubmit, demoMode = false, reset }: { onSubmit: Submit; demoMode?: boolean; reset?: Reset }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [flow, setFlowState] = useState<Flow>(loc.pathname.startsWith("/register") ? "signUp" : "signIn");
  const setFlow = (f: Flow) => { setFlowState(f); setErr(undefined); if (loc.pathname === "/login" || loc.pathname === "/register") navigate(f === "signUp" ? "/register" : "/login", { replace: true }); };
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setFocus] = useState<"email" | "password" | undefined>();
  // „Passwort vergessen“: erst E-Mail → Code kommt per Mail, dann Code + neues Passwort
  const [forgot, setForgot] = useState<"email" | "code" | undefined>();
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string>();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(undefined);
    if (forgot) {
      if (!reset) return setErr("In der Demo gibt es kein Passwort zum Zurücksetzen. Melde dich einfach mit einem neuen an.");
      setBusy(true);
      try {
        if (forgot === "email") { await reset.start(email.trim()); setForgot("code"); setInfo(`Wir haben dir einen Code an ${email.trim()} geschickt.`); }
        else {
          if (password.length < 8) throw new Error("Das neue Passwort braucht mindestens 8 Zeichen.");
          await reset.verify(email.trim(), code.trim(), password);
          setDone(true);
        }
      } catch (x) { setErr(x instanceof Error ? x.message : "Das hat nicht geklappt."); }
      finally { setBusy(false); }
      return;
    }
    if (flow === "signUp" && password.length < 8) return setErr("Das Passwort braucht mindestens 8 Zeichen.");
    setBusy(true);
    try {
      await onSubmit({ email: email.trim(), password, flow });
      setDone(true);
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  };

  const novaSay = forgot === "email" ? "Passiert jedem. Wir schicken dir einen Code." : forgot === "code" ? "Schau in dein Postfach." : done ? "Schön, dass du da bist." : err ? "Hm, da stimmt was nicht …" : flow === "signIn" ? "Atme kurz durch. Schön, dass du wieder da bist." : "Ein Atemzug, dann geht's los.";

  const input = "h-14 w-full appearance-none rounded-full border border-fg/15 bg-surface pr-12 pl-11 text-[16px] placeholder:text-muted focus:border-brand-500 focus:outline-none";
  return (
    <div className="relative grid min-h-dvh w-full bg-page lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 md:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Zum Start"><Logo /></Link>
          <Link to="/" className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold text-muted hover:bg-surface hover:text-fg"><ArrowLeft size={15} /> Start</Link>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8">
          {/* Nova mit Sprechblase */}
          <div className="mb-6 flex items-end gap-3">
            <Nova size={76} state={busy ? "think" : "idle"} label="Nova" className="mb-1 shrink-0" />
            <p key={novaSay} className="reveal-up mb-5 rounded-2xl rounded-bl-md bg-surface-3 px-3.5 py-2 text-[14px] font-medium text-fg">{novaSay}</p>
          </div>
          <h1 className="text-[30px] leading-9 font-[680] tracking-tight">{forgot ? "Passwort vergessen" : flow === "signIn" ? "Willkommen zurück" : "Konto anlegen"}</h1>
          <p className="mt-1.5 text-[15px] text-muted">{forgot === "email" ? "Gib deine E-Mail ein. Wir schicken dir einen Code." : forgot === "code" ? info : demoMode ? "Demo: Konto und Daten bleiben nur in diesem Browser." : flow === "signIn" ? "Melde dich an. Deine Check-ins warten auf dich." : "Kostenlos, dauert keine Minute."}</p>

          {/* Anmelden | Registrieren */}
          {!forgot && <div role="tablist" className="relative mt-6 grid grid-cols-2 rounded-full bg-fg/[0.08] p-1">
            <span aria-hidden className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-fg transition-transform duration-300" style={{ transform: flow === "signUp" ? "translateX(100%)" : "none" }} />
            {([["signIn", "Anmelden"], ["signUp", "Registrieren"]] as const).map(([f, label]) => (
              <button key={f} type="button" role="tab" aria-selected={flow === f} onClick={() => setFlow(f)} className={`relative z-10 inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold transition-colors ${flow === f ? "text-canvas" : "text-muted hover:text-fg"}`}>{label}</button>
            ))}
          </div>}

          <form onSubmit={submit} className="mt-5 space-y-3">
            <Field icon={<Mail size={17} />} label="E-Mail">
              <input name="email" type="email" required autoComplete="email" placeholder="name@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus("email")} onBlur={() => setFocus(undefined)} className={input} />
            </Field>
            {forgot === "code" && (
              <Field icon={<KeyRound size={17} />} label="Code aus der Mail">
                <input name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="Code aus der Mail" value={code} onChange={(e) => setCode(e.target.value)} className={`${input} tracking-[0.2em]`} />
              </Field>
            )}
            {forgot !== "email" && <Field icon={<Lock size={17} />} label="Passwort">
              <input name="password" type={show ? "text" : "password"} required autoComplete={flow === "signIn" && !forgot ? "current-password" : "new-password"} placeholder={forgot ? "Neues Passwort (mind. 8 Zeichen)" : flow === "signIn" ? "Passwort" : "Passwort (mind. 8 Zeichen)"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocus("password")} onBlur={() => setFocus(undefined)} className={input} />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShow(!show)} aria-label={show ? "Passwort verbergen" : "Passwort zeigen"} className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </Field>}
            {flow === "signIn" && !forgot && <div className="flex justify-end px-1"><button type="button" onClick={() => { setForgot("email"); setErr(undefined); setPassword(""); }} className="text-[13.5px] font-semibold text-soft hover:text-fg">Passwort vergessen?</button></div>}
            {(flow === "signUp" || forgot === "code") && password && <Strength password={password} />}
            {err && <p role="alert" className="rounded-2xl border border-[#e5484d]/30 bg-[#e5484d]/10 px-4 py-3 text-[14px] text-negative-text">{err}</p>}
            <Button type="submit" loading={busy} size="lg" className="mt-2 w-full">{forgot === "email" ? "Code schicken" : forgot === "code" ? "Passwort ändern" : flow === "signIn" ? "Anmelden" : "Kostenlos registrieren"}</Button>
            {forgot === "code" && <button type="button" onClick={() => { setForgot("email"); setCode(""); setErr(undefined); }} className="w-full text-center text-[13.5px] font-semibold text-soft hover:text-fg">Keinen Code bekommen? Noch einmal schicken</button>}
          </form>
          {forgot ? (
            <p className="mt-5 text-center text-[14px] text-muted"><button type="button" onClick={() => { setForgot(undefined); setErr(undefined); setCode(""); setPassword(""); }} className="font-semibold text-fg hover:underline">Zurück zum Anmelden</button></p>
          ) : null}
        </div>
      </div>

      {/* rechts: flache Fläche über die ganze Höhe und Breite der Spalte, Nova groß */}
      <aside className="hidden border-l border-fg/10 bg-surface lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto w-full max-w-xl px-12 py-12">
          <Nova size={130} label="Nova" />
          <h2 className="mt-8 text-[36px] leading-[42px] font-[680] tracking-tight">Ein Atemzug. <span className="text-brand-500">Dann weiter.</span></h2>
          <p className="mt-3 max-w-md text-[16px] leading-7 text-soft">Jeden Tag ein bisschen gelassener.</p>
          {/* reine Aufzählung (nicht anklickbar): Symbol in Farbe, Titel, ein Satz, ohne Rahmen und Trennlinien */}
          <ul className="mt-10 grid gap-6">
            {POINTS.map(({ icon: Icon, color, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-white" style={{ background: color }}><Icon size={19} /></span>
                <span><span className="block text-[16px] font-semibold">{title}</span><span className="mt-0.5 block text-[14.5px] leading-[21px] text-soft">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
