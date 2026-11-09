/**
 * N306: eigener Nova-Ring (ersetzt `voice-ring`). Nachbau aus dem Artefakt „Nova Ring und Metall“, Werte je Zustand
 * vom Nutzer eingestellt. EINE WebGL-Grafik für alle Ringe auf der Seite (gezeichnet in einen versteckten Canvas und
 * je Ring in einen kleinen 2D-Canvas kopiert): keine Grenze mehr von Safari (~16 Grafiken), kein `RING_MAX` nötig.
 * Läuft nur, solange ein Ring im Bild ist; bei reduzierter Bewegung steht er still.
 * Farbig = Ring neben Antworten und groß beim Sprechen, mono = Nova in der unteren Leiste.
 */
import { useEffect, useRef } from "react";

export type RingState = "idle" | "listen" | "think" | "speak";
type Cfg = { lines: number; width: number; contrast: number; halo: number; inner: number; hue: number; sweep: number; speed: number; spread: number; tilt: number; tiltOne: number; glint: number; wobble: number; rot: number };

/** Werte des Nutzers (Artefakt, 8. Nov. 2026) */
const COLOR: Record<RingState, Cfg> = {
  idle: { lines: 6, width: 1.45, contrast: 0.55, halo: 0, inner: 0, hue: 0.85, sweep: 1, speed: 0.7, spread: 0.5, tilt: 0.5, tiltOne: 0.6, glint: 0.6, wobble: 0.6, rot: 0.35 },
  listen: { lines: 7, width: 1.55, contrast: 0.55, halo: 0, inner: 0, hue: 0.85, sweep: 1, speed: 1.7, spread: 0.5, tilt: 0.5, tiltOne: 0.6, glint: 0.6, wobble: 0.8, rot: 0.6 },
  think: { lines: 6, width: 1.45, contrast: 0.55, halo: 0, inner: 0, hue: 0.85, sweep: 1, speed: 1.7, spread: 0.5, tilt: 0.5, tiltOne: 0.6, glint: 0.6, wobble: 0.7, rot: 1.7 },
  speak: { lines: 6, width: 1.45, contrast: 0.6, halo: 0, inner: 0, hue: 0.85, sweep: 1, speed: 2.7, spread: 0.65, tilt: 0.5, tiltOne: 0.6, glint: 0.6, wobble: 1, rot: 0.85 },
};
const MONO_BASE = { lines: 2, width: 2, contrast: 0, halo: 0, inner: 0, hue: 0, sweep: 0, speed: 0.3, spread: 0.5, tilt: 0.5, tiltOne: 0.4, glint: 0.3, wobble: 0.5 };
const MONO: Record<RingState, Cfg> = {
  idle: { ...MONO_BASE, rot: 0.35 },
  listen: { ...MONO_BASE, rot: 0.6 },
  think: { ...MONO_BASE, rot: 1.7 },
  speak: { ...MONO_BASE, rot: 0.85 },
};

/** drei Töne je Farbe: Hauptton, zweiter Ton (Farbunterschied), dritter Ton */
export type RingTone = "red" | "blue" | "orange" | "green" | "purple" | "yellow" | "light";
const TONES: Record<RingTone, [number[], number[], number[]]> = {
  red: [[1, 0.13, 0.04], [1, 0.32, 0.62], [1, 0.58, 0.2]],
  blue: [[0.12, 0.38, 1], [0.35, 0.78, 1], [0.55, 0.45, 1]],
  orange: [[1, 0.4, 0.04], [1, 0.68, 0.2], [1, 0.28, 0.25]],
  green: [[0, 0.78, 0.38], [0.4, 1, 0.62], [0.1, 0.82, 0.8]],
  purple: [[0.42, 0.24, 1], [0.78, 0.4, 1], [0.35, 0.5, 1]],
  yellow: [[0.95, 0.68, 0], [1, 0.86, 0.3], [1, 0.52, 0.1]],
  light: [[0.95, 1, 0.97], [0.82, 1, 0.9], [1, 1, 1]],
};

const FS = `precision mediump float;
uniform vec2 R; uniform float t, lvl, think, mono, dark, scale;
uniform float lines, contrast, halo, inner, hue, sweep, width, spin, swp, spread, tilt, tiltOne, glint, wobble;
uniform vec3 c0, c1, c2;
void main(){
  vec2 p=(gl_FragCoord.xy-R*.5)/(R.y*.5)*scale;
  // Wobbeln: der ganze Ring atmet und verzieht sich langsam als Ganzes
  p*=1.+wobble*.035*sin(t*1.3);
  p.x*=1.+wobble*.05*sin(t*.9+.4); p.y*=1.+wobble*.05*sin(t*1.07+2.1);
  float r=length(p), a=atan(p.y,p.x);
  float wb=wobble*(.022*sin(a*2.+t*.75)+.012*sin(a*3.-t*.6+1.));
  vec3 col=vec3(0.);
  float sw=1.+sweep*2.2*pow(.5+.5*cos(a-swp),10.);
  vec3 base=mix(c0,vec3(.96,.96,.98),mono);
  for(int i=0;i<10;i++){
    float fi=float(i);
    if(fi>=ceil(lines)) break;
    float on=clamp(lines-fi,0.,1.);
    float ang=fi*2.39+spin*.15*(fi-1.5);
    vec2 q=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*p;
    q.x*=1.+tilt*.16*(.6+.4*sin(fi*2.1+.7));
    float one=1.-min(abs(fi-1.),1.);
    q.x*=1.+tiltOne*.8*one*(.75+.25*sin(spin*.6));
    float rr=length(q), aa=atan(q.y,q.x);
    float off=(fi-(ceil(lines)-1.)*.5)*spread*.028;
    float amp=mix(.035,.06,mono)+.05*lvl+.02*think;
    float ri=.66+off+amp*(sin(aa*2.+spin*(.7+fi*.13)+fi*1.7)*.6+sin(aa*3.-spin*(1.1+fi*.07)+fi*2.3)*.4)+wb+.025*lvl*sin(aa*7.+t*5.+fi*1.3);
    float w=mix(.012+.003*fi,.018,mono)*(1.45-contrast*.9)*width;
    float px=2.*scale/R.y;
    w=max(w,px*1.15);   // kleine Ringe (Leiste): Linie nie dünner als gut 2 Bildpunkte
    float d=abs(rr-ri);
    float crisp=1.-smoothstep(w*.5-px,w*.5+px,d);
    float core=mix(exp(-d*d/(w*w)),crisp,max(mono,contrast*.6));
    float glow=exp(-d/(w*4.))*(1.-contrast)*halo*2.;
    float bright=mix(1.,.3+.7*fract(fi*.618+.2),contrast);
    float g=pow(.5+.5*cos(aa-(fi*2.3+2.4+spin*.4)),4.);
    bright*=mix(1.,.3+1.9*g,glint);
    float h=.5+.5*sin(aa+spin*.5+fi*1.9);
    vec3 c=mix(c0,c1,h*hue);
    c=mix(c,c2,.35*hue*(.5+.5*sin(aa*2.-spin+fi)));
    c=mix(c,vec3(.94,.95,.97)*(.75+.25*h),mono);
    c=mix(c,vec3(1.),glint*g*g*.75*(1.-mono));
    col+=c*(core+glow)*bright*mix(.8,.95,mono)*sw*on;
  }
  float inside=smoothstep(.7,.0,r);
  col+=mix(base,vec3(1.),.45)*inner*(.35*inside+.5*exp(-max(0.,.66-r)/.12)*step(r,.68))*mix(1.,sw,.6);
  col+=base*halo*.6*exp(-max(0.,r-.66)/.11)*step(.62,r);
  col*=1.-smoothstep(.82,.98,r);
  col=1.-exp(-col*1.2);
  float al=max(col.r,max(col.g,col.b));
  gl_FragColor=dark>.5?vec4(vec3(.12)*al,al):vec4(col,al);
}`;
const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const KEYS = ["lines", "width", "contrast", "halo", "inner", "hue", "sweep", "spread", "tilt", "tiltOne", "glint", "wobble"] as const;

type Inst = {
  ctx: CanvasRenderingContext2D; el: HTMLCanvasElement; px: number; visible: boolean;
  state: RingState; mono: boolean; dark: boolean; tone: RingTone; level?: () => number;
  cur: Cfg | null; spin: number; swp: number; lvl: number; think: number; seed: number; drawn: boolean;
  /** N352: Linien dicker (klein als Symbol neben lucide-Symbolen, sonst wirkt der Ring dünn) */
  bold: number;
};

const insts = new Set<Inst>();
let gl: WebGLRenderingContext | null = null;
let glc: HTMLCanvasElement | null = null;
let U: Record<string, WebGLUniformLocation | null> = {};
let raf = 0, last = 0, broken = false;
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function setup(): boolean {
  if (gl) return true;
  if (broken || typeof document === "undefined") return false;
  glc = document.createElement("canvas");
  glc.width = glc.height = 64;
  const g = glc.getContext("webgl", { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false }) as WebGLRenderingContext | null;
  if (!g) { broken = true; return false; }
  const sh = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); return s; };
  const prog = g.createProgram()!;
  g.attachShader(prog, sh(g.VERTEX_SHADER, VS));
  g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS));
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) { broken = true; return false; }
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, "p");
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  U = {};
  for (const n of ["R", "t", "lvl", "think", "mono", "dark", "scale", "spin", "swp", "c0", "c1", "c2", ...KEYS]) U[n] = g.getUniformLocation(prog, n);
  g.enable(g.SCISSOR_TEST);
  glc.addEventListener("webglcontextlost", (e) => { e.preventDefault(); gl = null; glc = null; });
  gl = g;
  return true;
}

/** gesprochene Stimme nachgeahmt (beim Vorlesen gibt es bewusst keinen echten Pegel, siehe voiceLevel.ts) */
const voice = (t: number) => { const ph = t % 3.4; const g = ph < 2.7 ? Math.min(1, ph * 6, (2.7 - ph) * 6) : 0; return g * (0.25 + 0.65 * Math.pow(Math.max(0, Math.sin(t * Math.PI * 4.3)), 0.6)); };

function draw(i: Inst, t: number, dt: number) {
  if (!gl || !glc) return;
  const goal = (i.mono ? MONO : COLOR)[i.state];
  if (!i.cur) i.cur = { ...goal };
  const k = 1 - Math.exp(-dt / 0.5);
  for (const key of Object.keys(goal) as (keyof Cfg)[]) i.cur[key] += (goal[key] - i.cur[key]) * k;
  const c = i.cur;
  i.spin += dt * c.rot;
  i.swp += dt * c.speed * 1.2;
  const tt = t + i.seed;
  const target = i.state === "listen" ? (i.level ? 0.2 + 0.8 * i.level() : 0.35 + 0.55 * voice(tt + 0.7)) : i.state === "speak" ? 0.3 + 0.6 * voice(tt) : i.state === "think" ? 0.15 : 0.05;
  i.lvl += (target - i.lvl) * (1 - Math.exp(-dt / (target > i.lvl ? 0.06 : 0.2)));
  i.think += ((i.state === "think" ? 1 : 0) - i.think) * (1 - Math.exp(-dt / 0.4));
  const n = i.px;
  if (glc.width < n || glc.height < n) { glc.width = glc.height = Math.max(n, glc.width); }
  const H = glc.height;
  gl.viewport(0, 0, n, n);
  gl.scissor(0, 0, n, n);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const [a, b, d] = TONES[i.tone];
  gl.uniform2f(U.R, n, n);
  gl.uniform1f(U.t, tt); gl.uniform1f(U.lvl, i.lvl); gl.uniform1f(U.think, i.think);
  gl.uniform1f(U.mono, i.mono ? 1 : 0); gl.uniform1f(U.dark, i.dark ? 1 : 0); gl.uniform1f(U.scale, 1.25);
  gl.uniform1f(U.spin, i.spin); gl.uniform1f(U.swp, i.swp);
  gl.uniform3f(U.c0, a[0], a[1], a[2]); gl.uniform3f(U.c1, b[0], b[1], b[2]); gl.uniform3f(U.c2, d[0], d[1], d[2]);
  for (const key of KEYS) gl.uniform1f(U[key], key === "width" ? c[key] * i.bold : c[key]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  i.ctx.clearRect(0, 0, n, n);
  i.ctx.drawImage(glc, 0, H - n, n, n, 0, 0, n, n);
  i.drawn = true;
}

function loop(now: number) {
  raf = 0;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  if (typeof document !== "undefined" && document.hidden) { last = 0; return; }
  if (!setup()) return;
  const still = reduced();
  let any = false;
  for (const i of insts) {
    if (!i.visible) continue;
    if (still && i.drawn) continue;
    draw(i, now / 1000, still ? 1 : dt);
    any = true;
  }
  if (any && !still) raf = requestAnimationFrame(loop);
}
const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
const io = typeof IntersectionObserver !== "undefined"
  ? new IntersectionObserver((es) => { for (const e of es) for (const i of insts) if (i.el === e.target) { i.visible = e.isIntersecting; if (i.visible) kick(); } }, { rootMargin: "40px" })
  : undefined;

/** ein Ring: `size` = gezeichnete Fläche in CSS-Pixeln (der Ring selbst ist etwa size/1,8 groß, der Rest ist Platz) */
export function NovaRingCanvas({ size, state, mono = false, dark = false, tone = "red", level, bold = 1, className = "" }: { size: number; state: RingState; mono?: boolean; dark?: boolean; tone?: RingTone; level?: () => number; bold?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Inst | null>(null);
  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const px = Math.max(8, Math.round(size * Math.min(2, window.devicePixelRatio || 1)));
    el.width = el.height = px;
    const i: Inst = { ctx, el, px, visible: !io, state, mono, dark, tone, level, cur: null, spin: Math.random() * 6, swp: Math.random() * 6, lvl: 0, think: 0, seed: Math.random() * 30, drawn: false, bold };
    inst.current = i;
    insts.add(i);
    io?.observe(el);
    kick();
    return () => { io?.unobserve(el); insts.delete(i); inst.current = null; };
  }, [size]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const i = inst.current;
    if (!i) return;
    i.state = state; i.mono = mono; i.dark = dark; i.tone = tone; i.level = level; i.bold = bold; i.drawn = false;
    kick();
  }, [state, mono, dark, tone, level, bold]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} style={{ width: size, height: size }} />;
}
