/**
 * Nova mit KI (Vercel AI Gateway, OpenAI-kompatibel). Schlüssel: AI_GATEWAY_API_KEY oder das OIDC-Token von Vercel.
 * Fokus: Beruhigung, Wohlbefinden, Haltung. Antwortet kurz, fragt höchstens eine Sache und empfiehlt am Ende
 * immer eine Übung aus der Liste, die das Gerät mitschickt. Ohne Schlüssel: 503, die App nutzt dann die Fragen ohne KI.
 */
type Msg = { role: "user" | "assistant"; content: string };
type Body = { messages: Msg[]; today: { minutes: number; done: string[]; part: string; mood?: number }; exercises: { id: string; name: string; tags: string[]; level: string; minutes: number }[] };

const SYSTEM = `Du bist Nova, eine ruhige Begleiterin in einer Atem-App. Du sprichst Deutsch, duzt, schreibst kurz (höchstens 3 Sätze), warm und klar, ohne Fachwörter und ohne Gedankenstriche.
Deine Themen: Beruhigung, Wohlbefinden, Haltung (gelassen bleiben, unterscheiden was in der eigenen Hand liegt). Keine Diagnosen, keine Heilversprechen.
Frag höchstens eine Sache auf einmal. Spätestens nach zwei Fragen empfiehlst du genau eine Übung aus der Liste.
Beachte, was die Person heute schon gemacht hat: hat sie schon viel geatmet (30 Minuten oder mehr), empfiehl nur etwas Kurzes und Sanftes oder sag ehrlich, dass es reicht, und empfiehl trotzdem eine kurze Übung.
Abends oder zum Einschlafen nichts Aktivierendes (keine fortgeschrittenen Energie-Übungen).
Wenn jemand von Selbstverletzung, Suizid oder großer Not spricht: nenn die TelefonSeelsorge 0800 111 0 111 (kostenlos, rund um die Uhr) und im Notfall 112.
Antworte NUR mit JSON: {"reply": "...", "exercise": "<id aus der Liste oder null>", "quick": ["bis zu 3 kurze Antwortvorschläge"]}`;

export async function POST(req: Request): Promise<Response> {
  const key = process.env.AI_GATEWAY_API_KEY ?? req.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  if (!key) return Response.json({ error: "no-ai" }, { status: 503 });
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return Response.json({ error: "bad" }, { status: 400 }); }
  const ctx = `HEUTE: ${body.today.minutes} Minuten geatmet, Übungen: ${body.today.done.join(", ") || "keine"}, Tageszeit: ${body.today.part}${body.today.mood ? `, Stimmung zuletzt ${body.today.mood} von 5` : ""}.
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
