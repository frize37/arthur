import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "ארתור <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

async function send(to: string | string[], subject: string, html: string) {
  if (!resend) {
    console.error("RESEND_API_KEY not configured — skipping email:", subject);
    return { ok: false as const, error: "שירות המייל לא מוגדר בשרת." };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("Resend error:", error.message);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Email send failed:", message);
    return { ok: false as const, error: message };
  }
}

function shekel(n: number | null | undefined) {
  if (n == null) return "—";
  return `₪${Math.round(n).toLocaleString("he-IL")}`;
}

function shell(previewText: string, bodyHtml: string, opts: { showBear?: boolean } = {}) {
  const logoHtml = APP_URL
    ? `<img src="${APP_URL}/brand/arthur-wordmark-email.png" alt="ארתור" width="110" style="display:block;height:auto;">`
    : `<span style="font-size:20px;font-weight:900;color:#FFB300;">ארתור</span>`;
  const bearHtml =
    opts.showBear && APP_URL
      ? `<tr><td align="center" style="padding:24px 28px 0;">
<img src="${APP_URL}/brand/arthur-bear-email.png" alt="ארתור" width="120" style="display:block;height:auto;border-radius:16px;">
</td></tr>`
      : "";
  return `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body dir="rtl" style="margin:0;padding:0;background:#F2F8FA;font-family:Arial,Helvetica,sans-serif;color:#0E2038;text-align:right;">
<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
<table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F8FA;padding:24px 0;">
<tr><td align="center">
<table role="presentation" dir="rtl" width="100%" style="max-width:520px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid rgba(14,32,56,0.12);">
<tr><td dir="rtl" align="right" style="background:#0B2647;padding:20px 28px;text-align:right;">
${logoHtml}
</td></tr>
${bearHtml}
<tr><td dir="rtl" align="right" style="padding:28px;text-align:right;">
${bodyHtml}
</td></tr>
<tr><td dir="rtl" align="right" style="padding:16px 28px;border-top:1px solid rgba(14,32,56,0.1);font-size:11px;color:#74869F;text-align:right;">
ארתור — מכרז יועצי משכנתא. הודעה זו נשלחה אוטומטית, אין להשיב למייל זה.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;background:#FFB300;color:#0B2647;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">${label}</a>`;
}

export async function sendCaseSubmittedEmails(input: {
  caseId: string;
  contactName: string;
  contactEmail: string;
  requestType: string;
  mortgageAmount: number | null;
  propertyValue: number | null;
}) {
  const clientHtml = shell(
    "קיבלנו את הבקשה שלך",
    `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">היי ${input.contactName},</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 8px;">קיבלנו את הפרטים שלך בהצלחה. אנחנו עכשיו שולחים אותם למספר יועצי משכנתא, כדי שיציעו לך את התנאים הכי טובים שהם יכולים.</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">נחזור אליך ברגע שיהיו הצעות מרוכזות — בדרך כלל תוך יום עסקים.</p>`,
    { showBear: true }
  );
  const results = [await send(input.contactEmail, "ארתור — קיבלנו את הבקשה שלך", clientHtml)];

  if (ADMIN_EMAIL) {
    const link = APP_URL ? button(`${APP_URL}/admin`, "לצפייה בתיק") : "";
    const adminHtml = shell(
      "תיק חדש התקבל",
      `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">תיק חדש: ${input.contactName}</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">סוג בקשה: ${input.requestType}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">שווי נכס: ${shekel(input.propertyValue)}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">סכום משכנתא מבוקש: ${shekel(input.mortgageAmount)}</p>
${link}`
    );
    results.push(await send(ADMIN_EMAIL, `תיק חדש התקבל — ${input.contactName}`, adminHtml));
  }

  return results;
}

export async function sendAdvisorAssignedEmail(input: {
  advisorEmail: string;
  advisorName: string;
  caseId: string;
  requestType: string;
  mortgageAmount: number | null;
  propertyValue: number | null;
}) {
  const link = APP_URL ? button(`${APP_URL}/advisor`, "לצפייה בתיק") : "";
  const html = shell(
    "תיק חדש ממתין להצעה שלך",
    `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">היי ${input.advisorName},</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 8px;">שויכת לתיק חדש בארתור.</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">סוג בקשה: ${input.requestType}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">שווי נכס: ${shekel(input.propertyValue)}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">סכום משכנתא מבוקש: ${shekel(input.mortgageAmount)}</p>
${link}`
  );
  return send(input.advisorEmail, "ארתור — תיק חדש ממתין להצעה שלך", html);
}

export async function sendWinnerChosenEmails(input: {
  caseId: string;
  contactName: string;
  contactEmail: string;
  advisorName: string;
  advisorEmail: string | null;
  advisorLogoUrl?: string | null;
  savings: number;
  fee: number;
}) {
  const advisorLogoHtml = input.advisorLogoUrl
    ? `<img src="${input.advisorLogoUrl}" alt="${input.advisorName}" width="40" height="40" style="display:inline-block;vertical-align:middle;border-radius:8px;object-fit:cover;margin-inline-start:8px;">`
    : "";
  const clientHtml = shell(
    "יש לך הצעה",
    `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">היי ${input.contactName},</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 8px;">נבחרה עבורך ההצעה הטובה ביותר מבין היועצים שבדקו את התיק — של <b>${input.advisorName}</b>${advisorLogoHtml}.</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">חיסכון משוער: ${shekel(input.savings)}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">עלות שירות היועץ: ${shekel(input.fee)}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:16px 0 0;">היועץ ייצור איתך קשר בקרוב להמשך התהליך.</p>`,
    { showBear: true }
  );
  const results = [await send(input.contactEmail, "ארתור — יש לך הצעה", clientHtml)];

  if (input.advisorEmail) {
    const advisorHtml = shell(
      "זכית בתיק",
      `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">מזל טוב ${input.advisorName},</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">ההצעה שלך נבחרה עבור ${input.contactName}. אפשר ליצור קשר ולהתקדם.</p>`
    );
    results.push(await send(input.advisorEmail, "ארתור — זכית בתיק", advisorHtml));
  }

  return results;
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  const html = shell(
    "קוד האימות שלך",
    `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">קוד האימות שלך</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 14px;">הזינו את הקוד הבא כדי לאמת את כתובת המייל ולנעול את התיק:</p>
<div style="font-family:Arial,sans-serif;font-size:32px;font-weight:900;letter-spacing:10px;color:#0B2647;background:#F2F8FA;border-radius:10px;padding:16px;text-align:center;">${code}</div>
<p dir="rtl" style="font-size:12px;line-height:1.6;margin:14px 0 0;color:#74869F;">הקוד תקף ל-10 דקות. אם לא ביקשתם קוד זה, אפשר להתעלם מהמייל.</p>`
  );
  return send(email, "ארתור — קוד האימות שלך", html);
}

export async function sendOfferSubmittedEmail(input: {
  caseId: string;
  advisorName: string;
  savings: number;
  fee: number;
}) {
  if (!ADMIN_EMAIL) return { ok: false as const, error: "לא הוגדרה כתובת התראות מנהל." };
  const link = APP_URL ? button(`${APP_URL}/admin`, "לצפייה בתיק") : "";
  const html = shell(
    "התקבלה הצעה חדשה",
    `<h1 dir="rtl" style="font-size:18px;margin:0 0 14px;">הצעה חדשה מ-${input.advisorName}</h1>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0 0 4px;">חיסכון משוער: ${shekel(input.savings)}</p>
<p dir="rtl" style="font-size:14px;line-height:1.7;margin:0;">עלות שירות: ${shekel(input.fee)}</p>
${link}`
  );
  return send(ADMIN_EMAIL, `הצעה חדשה מ-${input.advisorName}`, html);
}
