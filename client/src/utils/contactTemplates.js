// client/src/utils/contactTemplates.js
// -------------------------------------------------------------
// Prefilled Email / WhatsApp links for DESKTOP/MOBILE usage.
// Gmail opens in Web. WhatsApp: user can pick Web or App.
// -------------------------------------------------------------

/**
 * Normalize an Israeli phone number into E.164 WITHOUT the '+'
 *  "054-1234567"   -> "972541234567"
 *  "+972541234567" -> "972541234567"
 *  "972541234567"  -> "972541234567"
 */
export const toE164NoPlusIL = (raw) => {
    const s = (raw || "").trim();
    const digits = s.replace(/\D+/g, "");
    if (!digits) return "";
    if (s.startsWith("+")) return s.slice(1);
    if (digits.startsWith("0")) return `972${digits.slice(1)}`;
    return digits;
};

// ---------- Email ----------
export const buildEmailTemplate = ({ mentorFirstName, menteeName }) => {
    const subject = `Guidance Request- QueenB Program`;
    const body =
        `Hi ${mentorFirstName},

My name is ${menteeName}, and I'm a mentee in the QueenB program.
I'd love to schedule a short call to ask a few questions and get your guidance.

Thank you so much!`;
    return { subject, body };
};

// ---------- WhatsApp ----------
export const buildWhatsappTemplate = ({ mentorFirstName, menteeName }) =>
    `Hi ${mentorFirstName}! This is ${menteeName} from QueenB 😊 I'd love to schedule a short call and get your advice.`;

// Gmail Web compose (opens in Chrome tab)
export const gmailComposeHref = ({ to, subject = "", body = "", cc = "", bcc = "" }) => {
    const params = new URLSearchParams();
    if (to) params.set("to", to);
    if (cc) params.set("cc", cc);
    if (bcc) params.set("bcc", bcc);
    if (subject) params.set("su", subject);
    if (body) params.set("body", body);
    params.set("view", "cm");
    params.set("ui", "2");
    params.set("tf", "1");
    return `https://mail.google.com/mail/?${params.toString()}`;
};

// --- WhatsApp URL builders ---
export const waWebUrl = (e164NoPlus, text) =>
    `https://web.whatsapp.com/send?phone=${encodeURIComponent(e164NoPlus)}&text=${encodeURIComponent(text)}&app_absent=0`;

export const waApiUrl = (e164NoPlus, text) =>
    `https://api.whatsapp.com/send?phone=${encodeURIComponent(e164NoPlus)}&text=${encodeURIComponent(text)}`;

export const waHref = (e164NoPlus, text) =>
    `https://wa.me/${encodeURIComponent(e164NoPlus)}?text=${encodeURIComponent(text)}&app_absent=0`;

// --- Openers for the menu buttons ---
export async function openWhatsAppWeb(e164NoPlus, text) {
    try { if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text); } catch {}
    const url = waWebUrl(e164NoPlus, text);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    return Boolean(w);
}

export async function openWhatsAppApp(e164NoPlus, text) {
    try { if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text); } catch {}
    // Try wa.me first (mobile/app), fallback to api
    const direct = waHref(e164NoPlus, text);
    const w1 = window.open(direct, "_blank", "noopener,noreferrer");
    setTimeout(() => {
        if (!w1 || w1.closed) window.open(waApiUrl(e164NoPlus, text), "_blank", "noopener,noreferrer");
    }, 500);
    return Boolean(w1);
}