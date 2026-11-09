import { Link } from "react-router";
import { APP_NAME } from "@/components/Art";
import { Nova } from "@/components/Nova";

/** Startseite für Besucher: bewusst schlicht – Nova, ein Satz, zwei große Knöpfe */
export default function Landing() {
  return (
    <div className="top-safe flex min-h-dvh flex-col bg-page px-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Nova size={130} label="Nova" />
        <h1 className="mt-8 text-[40px] leading-[46px] font-bold tracking-tight">{APP_NAME}</h1>
        <p className="mt-3 text-[18px] leading-7 text-soft">Jeden Tag kurz hinspüren, stoisch reflektieren und richtig atmen.</p>
      </div>
      <div className="mx-auto grid w-full max-w-md gap-3" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        <Link to="/register" className="grid h-14 place-items-center rounded-full bg-brand-500 text-[17px] font-semibold text-white">Kostenlos registrieren</Link>
        <Link to="/login" className="grid h-14 place-items-center rounded-full bg-fg/[0.08] text-[17px] font-semibold hover:bg-fg/[0.13]">Anmelden</Link>
      </div>
    </div>
  );
}
