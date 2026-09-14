import "server-only";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "gemini-3.6-flash";

const TRACK_SCHEMA = {
  type: "object",
  properties: {
    bankName: { type: "string", nullable: true },
    rateKind: { type: "string", enum: ["fixed", "variable"], nullable: true },
    linkedToCpi: { type: "boolean", nullable: true },
    repaymentMethod: { type: "string", nullable: true },
    annualRate: { type: "number", nullable: true },
    anchorRate: { type: "number", nullable: true },
    marginRate: { type: "number", nullable: true },
    nextRateChangeDate: { type: "string", nullable: true, description: "ISO date yyyy-mm-dd, if known" },
    monthsRemaining: { type: "integer", nullable: true },
    principalBalance: { type: "number", nullable: true },
    accruedInterest: { type: "number", nullable: true },
    arrearsBalance: { type: "number", nullable: true },
    arrearsInterest: { type: "number", nullable: true },
    payoffBalance: { type: "number", nullable: true },
    earlyRepaymentFee: { type: "number", nullable: true },
    comparisonRate: { type: "number", nullable: true },
    forecastRate: { type: "number", nullable: true },
  },
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    quoteValidDate: { type: "string", nullable: true, description: "ISO date yyyy-mm-dd the payoff figures are valid as of" },
    totalPrincipal: { type: "number", nullable: true },
    totalEarlyRepaymentFee: { type: "number", nullable: true },
    totalPayoff: { type: "number", nullable: true },
    accountComparisonRate: { type: "number", nullable: true },
    accountForecastRate: { type: "number", nullable: true },
    tracks: { type: "array", items: TRACK_SCHEMA },
  },
  required: ["tracks"],
};

const PROMPT = `זהו דוח "יתרות לסילוק" של משכנתא מבנק ישראלי. הדוחות האלה כפופים לנוהל בנקאי תקין 454, כך שהשדות דומים בכל הבנקים גם אם העיצוב שונה.

חלץ מהמסמך:
1. לכל מסלול/הלוואה בנפרד: שם הבנק, סוג ריבית (קבועה/משתנה), האם צמודה למדד, שיטת פרעון, שיעור ריבית שנתית נוכחי, ריבית עוגן, שיעור תוספת/הפחתה מעל העוגן, תאריך שינוי ריבית קרוב (אם רלוונטי), יתרת תקופה בחודשים, יתרת קרן, ריבית צבורה, יתרת פיגור, ריבית פיגורים, סה"כ יתרה לסילוק של המסלול, עמלת פרעון מוקדם של המסלול, שיעור ריבית לצרכי השוואה, שיעור ריבית כוללת חזויה.
2. ברמת כל החשבון (מהטבלת הסיכום): סה"כ יתרת קרן, סה"כ עמלת פרעון מוקדם, סה"כ יתרה לסילוק, שיעור ריבית לצרכי השוואה ברמת חשבון, שיעור ריבית כוללת חזויה ברמת חשבון, ותאריך התוקף של הנתונים (מהמשפט על כיבוד ההרשאה לחיוב, אם קיים).

אל תכלול שם לקוח, ת"ז, כתובת או מספר חשבון בתשובה. אם שדה לא מופיע במסמך, השאר אותו null. החזר אך ורק את ה-JSON לפי הסכימה.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "שירות קריאת המסמכים לא מוגדר בשרת." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "לא צורף קובץ." }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "סוג קובץ לא נתמך. יש להעלות PDF או תמונה." }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "הקובץ גדול מדי (מקסימום 15MB)." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ inline_data: { mime_type: file.type, data: base64 } }, { text: PROMPT }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { ok: false, error: `קריאת המסמך נכשלה (${res.status}). נסו שוב.`, detail: errText.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini returned no text:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { ok: false, error: "לא הצלחנו לחלץ נתונים מהמסמך.", detail: JSON.stringify(data).slice(0, 500) },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(text);
    return NextResponse.json({ ok: true, result: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Document parsing failed:", message);
    return NextResponse.json({ ok: false, error: "קרתה תקלה בקריאת המסמך. נסו שוב.", detail: message }, { status: 500 });
  }
}
