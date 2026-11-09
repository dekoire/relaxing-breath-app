import Resend from "@auth/core/providers/resend";

/**
 * „Passwort vergessen“: Convex Auth schickt einen 8-stelligen Code per E-Mail (über Resend, nur `fetch`, kein Zusatzpaket).
 * Convex-Variablen: `AUTH_RESEND_KEY` (Schlüssel von resend.com) und optional `AUTH_EMAIL_FROM`
 * (z. B. „Atem <hallo@deine-domain.de>“; ohne eigene Domain geht nur die Test-Adresse von Resend).
 */
/** Mail im Atem-Design (Aufbau wie die Finastry-Mails): Logo, weiße Karte mit Titel, Code in grauer Kachel, Hinweis kursiv, Fußzeile */
const APP = "https://relaxing-breath-app.vercel.app";
function resetMail(code: string) {
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif";
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Passwort zurücksetzen</title></head>
<body style="margin:0;padding:0;background:#f4f5f8;font-family:${font};color:#14161f;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8;"><tr><td align="center" style="padding:36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 0 20px 4px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;"><img src="${APP}/logo.svg" width="36" height="36" alt="" style="display:block;border:0;border-radius:9px;"></td>
<td style="padding-left:10px;vertical-align:middle;font-size:21px;line-height:24px;font-weight:600;letter-spacing:-0.3px;color:#14161f;">Atem</td>
</tr></table></td></tr>
<tr><td style="background:#ffffff;border:1px solid #e1e5ee;border-radius:24px;padding:36px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:0 0 10px 0;font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.4px;color:#14161f;">Neues Passwort</td></tr>
<tr><td style="padding:0 0 22px 0;font-size:16px;line-height:25px;color:#4b5563;">Gib diesen Code in Atem ein und leg danach dein neues Passwort fest.</td></tr>
<tr><td style="padding:0 0 22px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:#f4f5f8;border:1px solid #e6e9f0;border-radius:18px;padding:22px 12px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:34px;line-height:40px;font-weight:700;letter-spacing:8px;color:#14161f;">${code}</td></tr></table></td></tr>
<tr><td style="padding:0;font-size:13px;line-height:20px;font-style:italic;color:#6b7280;">Der Code ist 20 Minuten gültig.</td></tr>
</table>
</td></tr>
<tr><td style="padding:22px 12px 0 12px;font-size:12px;line-height:19px;color:#8a93a3;text-align:center;">Du hast das nicht angefordert? Dann ignoriere diese Mail.<br>Atem fragt nie per Mail nach deinem Passwort.<br>
<a href="${APP}" style="color:#8a93a3;text-decoration:underline;">Atem öffnen</a></td></tr>
</table></td></tr></table>
</body></html>`;
}

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const n = new Uint32Array(8);
    crypto.getRandomValues(n);
    return Array.from(n, (x) => String(x % 10)).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    if (!provider.apiKey) throw new Error("Für „Passwort vergessen“ fehlt AUTH_RESEND_KEY in Convex.");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM ?? "Atem <onboarding@resend.dev>",
        to: [email],
        subject: `Dein Atem-Code: ${token}`,
        text: `Neues Passwort\n\nGib diesen Code in Atem ein und leg danach dein neues Passwort fest:\n\n${token}\n\nDer Code ist 20 Minuten gültig.\n\nDu hast das nicht angefordert? Dann ignoriere diese Mail. Atem fragt nie per Mail nach deinem Passwort.`,
        html: resetMail(token),
      }),
    });
    if (!res.ok) throw new Error("Die Mail mit dem Code konnte nicht verschickt werden.");
  },
  maxAge: 20 * 60,
});
