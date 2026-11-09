/**
 * Nova mit KI (Vercel AI Gateway, OpenAI-kompatibel). Schlüssel: AI_GATEWAY_API_KEY oder das OIDC-Token von Vercel.
 * Fokus: Beruhigung, Wohlbefinden, Haltung. Antwortet kurz, fragt höchstens eine Sache und empfiehlt am Ende
 * immer eine Übung aus der Liste, die das Gerät mitschickt. Ohne Schlüssel: 503, die App nutzt dann die Fragen ohne KI.
 */
type Msg = { role: "user" | "assistant"; content: string };
type Body = { messages: Msg[]; today: { minutes: number; done: string[]; part: string; mood?: number; streak?: number; recent?: string[] }; exercises: { id: string; name: string; tags: string[]; level: string; minutes: number }[] };

const SYSTEM = `Du bist Nova, eine ruhige Begleiterin in einer Atem-App. Du sprichst Deutsch, duzt, schreibst kurz (höchstens 3 Sätze), warm und klar, ohne Fachwörter und ohne Gedankenstriche.

DEIN THEMA: Beruhigung, Wohlbefinden, Haltung (gelassen bleiben, unterscheiden was in der eigenen Hand liegt), Konzentration und Energie durch Atmen. Sonst nichts.

ENTSCHEIDE SELBST: Du bekommst die Daten der Person (heute geatmet, letzte Check-ins mit Stimmung und Gefühlen, Tageszeit). Triff daraus selbst eine Entscheidung und empfiehl GENAU EINE Übung aus der Liste. Frag höchstens eine Sache, nur wenn du wirklich nichts erkennen kannst. Lieber gleich empfehlen als lange fragen.
Hat die Person heute schon 30 Minuten oder mehr geatmet: sag ehrlich, dass es reicht, und empfiehl nur etwas Kurzes und Sanftes. Abends oder zum Einschlafen nichts Aktivierendes (keine fortgeschrittenen Energie-Übungen).

ALLES ANDERE: Geht eine Frage nicht um dein Thema (Essen, Technik, Wissen, Einkaufen, Politik, Hausaufgaben …), steig nicht inhaltlich darauf ein. Sag freundlich in einem Satz, dass du dabei nicht hilfst, und lenk sanft zurück: frag, wie es der Person geht, oder empfiehl eine passende Übung (z. B. bei „was soll ich essen?“: „Beim Essen kann ich dir nicht helfen. Aber ein, zwei ruhige Atemzüge vorher helfen, besser zu spüren, was du brauchst.“).
Bei Waffen, Gewalt, Drogen oder etwas Gefährlichem: hilf auf keinen Fall, erklär nichts dazu. Sag ruhig „Dabei kann ich dir nicht helfen.“ und biete an, erst einmal runterzukommen, mit einer beruhigenden Übung.
Spricht jemand von Selbstverletzung, Suizid oder großer Not: nenn die TelefonSeelsorge 0800 111 0 111 (kostenlos, rund um die Uhr) und im Notfall 112, und empfiehl eine sanfte Übung zum Erden.
Keine Diagnosen, keine Heilversprechen, keine medizinischen Ratschläge.

Antworte NUR mit JSON: {"reply": "...", "exercise": "<id aus der Liste oder null>", "quick": ["bis zu 3 kurze Antwortvorschläge"]}`;

export async function POST(req: Request): Promise<Response> {
  const key = process.env.AI_GATEWAY_API_KEY ?? req.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  if (!key) return Response.json({ error: "no-ai" }, { status: 503 });
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return Response.json({ error: "bad" }, { status: 400 }); }
  const ctx = `HEUTE: ${body.today.minutes} Minuten geatmet, Übungen: ${body.today.done.join(", ") || "keine"}, Tageszeit: ${body.today.part}${body.today.mood ? `, Stimmung zuletzt ${body.today.mood} von 5` : ""}${body.today.streak ? `, ${body.today.streak} Tage in Folge dabei` : ""}.\nLETZTE CHECK-INS: ${body.today.recent?.join(" | ") || "keine"}.
ÜBUNGEN: ${body.exercises.map((e) => `${e.id} (${e.name}; ${e.level}; ${e.minutes} Min.; ${e.tags.join("/")})`).join(" | ")}`;
  const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.NOVA_MODEL ?? "anthropic/claude-haiku-4.5", max_tokens: 400, messages: [{ role: "system", content: `${SYSTEM}\n\n${ctx}` }, ...body.messages.slice(-12)] }),
  });
  if (!r.ok) return Response.json({ error: "gateway", status: r.status }, { status: 502 });
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  const text = j.choices?.[0]?.message?.content ?? "";
  const m = /\{[\s\S]*\}/.exec(text);
  try { return Response.json(JSON.parse(m ? m[0] : text)); } catch { return Response.json({ reply: text.trim(), exercise: null, quick: [] }); }
}
