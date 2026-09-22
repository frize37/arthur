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
 * מחוסר דיור 75%, משפר דיור 70%, משקיע 50%. מי שמוכר את דירתו הקיימת
 * לפני הרכישה נחשב מחוסר דיור; מי שמוכר אחריה — משפר דיור.
 */
export function ltvCapFor(
  ownedProperties: string | null,
  sellingExisting: string | null
): { cap: number; label: string } {
  if (ownedProperties === "none") return { cap: 0.75, label: "מחוסר דיור" };
  if (ownedProperties === "twoPlus") return { cap: 0.5, label: "משקיע" };
  if (ownedProperties === "one") {
    if (sellingExisting === "before") return { cap: 0.75, label: "מחוסר דיור (מוכרים לפני)" };
    if (sellingExisting === "after") return { cap: 0.7, label: "משפר דיור" };
    return { cap: 0.5, label: "משקיע (נשארים עם שתי דירות)" };
  }
  return { cap: 0.7, label: "לא סווג — הנחה שמרנית" };
}

/** הבנקים דורשים שהמשכנתה תסתיים עד גיל 75, והרגולציה מגבילה ל-30 שנה. */
export function maxTermYears(oldestAge: number): number {
  if (!oldestAge || oldestAge <= 0) return 30;
  return Math.max(0, Math.min(30, 75 - oldestAge));
}
