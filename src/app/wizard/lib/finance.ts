export function shekel(n: number): string {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function computeSuggestedSavings(balance: number, rate: number, totalMonths: number): number {
  const betterRate = Math.max(3.2, rate - 0.7);
  const currentPayment = monthlyPayment(balance, rate, totalMonths);
  const betterPayment = monthlyPayment(balance, betterRate, totalMonths);
  return Math.max(0, (currentPayment - betterPayment) * totalMonths);
}

export type Band = "good" | "watch" | "risk";

export function bandFor(payment: number, comfort: number, max: number): Band {
  if (payment <= comfort) return "good";
  if (payment <= max) return "watch";
  return "risk";
}

/**
 * תקרת שיעור המימון לפי סיווג הלווה (הוראת בנק ישראל מ-10/2012).
 * מחוסר דיור 75%, משפר דיור 70%, משקיע 50%.
 *
 * הסיווג נגזר ממטרת הרכישה שהלקוח כבר בחר — אין טעם לשאול שוב כמה דירות
 * בבעלותו. מה שכן נשאר פתוח אצל משפרי דיור הוא התזמון: מי שמוכר את דירתו
 * לפני הרכישה נחשב מחוסר דיור, ומי שמוכר אחריה — משפר דיור.
 */
export function ltvCapFor(goal: string | null, sellingExisting: string | null): { cap: number; label: string } {
  if (goal === "singleHome") return { cap: 0.75, label: "דירה יחידה" };
  if (goal === "investment") return { cap: 0.5, label: "דירה להשקעה" };
  if (goal === "upgrade") {
    if (sellingExisting === "before") return { cap: 0.75, label: "משפרי דיור — מוכרים לפני הרכישה" };
    if (sellingExisting === "after") return { cap: 0.7, label: "משפרי דיור — מוכרים אחרי הרכישה" };
    if (sellingExisting === "no") return { cap: 0.5, label: "נשארים עם שתי דירות — נחשב משקיע" };
    return { cap: 0.7, label: "משפרי דיור" };
  }
  return { cap: 0.7, label: "לא סווג — הנחה שמרנית" };
}

/** הבנקים דורשים שהמשכנתה תסתיים עד גיל 75, והרגולציה מגבילה ל-30 שנה. */
export function maxTermYears(oldestAge: number): number {
  if (!oldestAge || oldestAge <= 0) return 30;
  return Math.max(0, Math.min(30, 75 - oldestAge));
}

/**
 * נתוני שוק להערכה בלבד. מתעדכנים ידנית — בנק ישראל מפרסם את הריבית
 * הממוצעת למשכנתאות מדי חודש (boi.org.il/information/interestrates).
 * עודכן: ספטמבר 2026.
 */
export const MARKET = {
  boiRate: 3.5,
  primeSpread: 1.5,
  /** ריבית אפקטיבית משוערת לתמהיל טיפוסי — לאומדן החזר בלבד, לא הצעה. */
  assumedMixRate: 5.0,
};

/**
 * יחס ההחזר מההכנסה הפנויה. הרגולציה מתירה עד 50%, אבל בפועל:
 * עד 35% הבנקים רגועים, 35%–40% מתחיל להיות בעייתי ומתומחר יקר יותר
 * (מ-40% ומעלה הבנק נדרש ל-100% הקצאת הון), ומעל 40% כמעט אף בנק לא מאשר.
 */
export function dtiBandFor(ratio: number): { band: Band; label: string } {
  if (ratio <= 0.35) return { band: "good", label: "בתוך הטווח הנוח" };
  if (ratio <= 0.4) return { band: "watch", label: "גבוה — מתומחר יקר יותר" };
  return { band: "risk", label: "מעל הסף שהבנקים מאשרים" };
}

/**
 * ההחזר החודשי שנשאר פנוי למשכנתה, אחרי ניכוי התחייבויות שנספרות.
 * הלוואה שמסתיימת תוך 18 חודש אינה נספרת (הוראת בנק ישראל 04/2014).
 */
export function freeIncomeFor(
  income: number,
  extra: number,
  otherLoansPayment: number,
  endsWithin18Months: boolean
): number {
  const counted = endsWithin18Months ? 0 : otherLoansPayment;
  return Math.max(0, income + extra - counted);
}
