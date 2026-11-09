import { NovaRingCanvas, type RingState, type RingTone } from "@/components/NovaRing";

/**
 * Nova wie in Notara (Vorgabe dort: der eigene Ring, `OwnRing` in `AiAvatar.tsx`), in Atem in Lila. Gezeichnet auf
 * `size × 1,8` – der Rest ist Platz für Bewegung und Leuchten, der Ring selbst ist etwa `size` groß.
 */
const FRAME = 1.8;
export function Nova({ size = 36, state = "idle", tone = "purple", label, className = "" }: { size?: number; state?: RingState; tone?: RingTone; label?: string; className?: string }) {
  const S = Math.round(size * FRAME);
  return (
    <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span className="ring-in pointer-events-none absolute" style={{ width: S, height: S, left: (size - S) / 2, top: (size - S) / 2 }}>
        <NovaRingCanvas size={S} state={state} tone={tone} />
      </span>
    </span>
  );
}
