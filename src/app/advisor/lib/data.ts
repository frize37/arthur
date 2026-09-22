import { MARKET, bandFor, dtiBandFor, freeIncomeFor, ltvCapFor, maxTermYears, monthlyPayment, shekel } from "../../wizard/lib/finance";

export type CaseStatus = "pending" | "sent" | "won" | "closed" | "closed_no_deal" | "lost";
export type Band = "good" | "watch" | "risk";

export interface LoanTrack {
  bankName: string | null;
  rateKind: string | null;
  anchorBasis: string | null;
  linkedToCpi: boolean | null;
  repaymentMethod: string | null;
  annualRate: number | null;
  anchorRate: number | null;
  marginRate: number | null;
  nextRateChangeDate: string | null;
  monthsRemaining: number | null;
  principalBalance: number | null;
  accruedInterest: number | null;
  arrearsBalance: number | null;
  arrearsInterest: number | null;
  payoffBalance: number | null;
  earlyRepaymentFee: number | null;
  comparisonRate: number | null;
  forecastRate: number | null;
}

export interface DocTotals {
  quoteValidDate: string | null;
  totalPrincipal: number | null;
  totalEarlyRepaymentFee: number | null;
  totalPayoff: number | null;
  accountComparisonRate: number | null;
  accountForecastRate: number | null;
}

export interface AdvisorCase {
  id: string;
  /** מספר תצוגה קצר; המזהה האמיתי נשאר ה-UUID. */
  caseNumber: number;
  receivedAt: string;
  status: CaseStatus;
  requestType: "new" | "refinance" | "consolidate";
  goal: string;
  complex: boolean;
  property: {
    value: number;
    mortgage: number;
    legal: string;
    source: string | null;
    sellingExisting: string | null;
    appraisalValue: number | null;
  };
  equity: number;
  zakaut: string | null;
  repayment: { comfort: number; max: number };
  planning: {
    futureRelease: string;
    futureReleaseAmount: number | null;
    futureReleaseTiming: string | null;
    upcomingEvent: string;
    incomeChange: string;
  };
  profile: { hasSecond: string; employment1: string; seniority1: string; employment2?: string; seniority2?: string; oldestAge: number };
  income: { net: number; extra: number };
  credit: { otherLoans: string; otherLoansPayment: number | null; otherLoansEndingSoon?: string; otherLoansMonthsLeft?: string; creditIssues: string };
  doc: { balance: number; rate: number; years: number; months: number };
  docTracks: LoanTrack[];
  docTotals: DocTotals;
  docSource: "ai" | "manual" | null;
  cleanDocName: string | null;
  offer?: { savings: number; fee: number };
  client?: { name: string; phone: string; email: string };
  completionNote: string | null;
  completedBy: "advisor" | "admin" | null;
}

export const LABELS = {
  requestType: { new: "משכנתה חדשה", refinance: "מחזור משכנתה", consolidate: "איחוד הלוואות" } as Record<string, string>,
  goal: {
    maximizeSavings: "מקסום חיסכון",
    lower: "הקטנת החזר חודשי",
    shorten: "קיצור תקופה",
    closeExpensive: "סגירת הלוואות יקרות",
    cash: "גיוס סכום נוסף",
    singleHome: "רכישת דירה יחידה",
    investment: "רכישת דירה להשקעה",
    upgrade: "שדרוג דירה",
  } as Record<string, string>,
  legal: { tabu: "רשום בטאבו", rmi: "רמ״י / חברה משכנת", pending: "בתהליכי רישום" } as Record<string, string>,
  employment: { salaried: "שכיר/ה", selfemployed: "עצמאי/ת", controlling: "בעל/ת שליטה", none: "לא עובד/ת" } as Record<string, string>,
  seniority: { under1: "מתחת לשנה", "1to3": "1–3 שנים", over3: "מעל 3 שנים" } as Record<string, string>,
  yesno: { yes: "כן", no: "לא", unsure: "עוד לא ידוע" } as Record<string, string>,
  monthsLeft: { under6: "עד 6 חודשים", "6to12": "7–12 חודשים", "13to18": "13–18 חודשים", over18: "מעל 18 חודשים" } as Record<string, string>,
  specialtyIcon: { new: "ic-home", refinance: "ic-down", consolidate: "ic-merge" } as Record<string, string>,
  propertySource: {
    contractor: "מקבלן (על הנייר)",
    secondhand: "יד שנייה",
    selfbuild: "בנייה עצמית / תמ״א 38",
    discounted: "מחיר למשתכן / מופחת",
  } as Record<string, string>,
  upcomingEvent: { reno: "שיפוץ", family: "אירוע משפחתי", edu: "לימודים", none: "אין" } as Record<string, string>,
  futureReleaseTiming: { soon: "עד שנה", mid: "1–3 שנים", later: "3–5 שנים" } as Record<string, string>,
};

export const STATUS_META: Record<CaseStatus, { label: string; cls: string }> = {
  pending: { label: "ממתין להצעה", cls: "pill-pending" },
  sent: { label: "הצעה נשלחה", cls: "pill-sent" },
  won: { label: "זכינו בתיק", cls: "pill-won" },
  closed: { label: "העסקה בוצעה", cls: "pill-won" },
  closed_no_deal: { label: "נסגר ללא ביצוע", cls: "pill-lost" },
  lost: { label: "לא נבחרנו", cls: "pill-lost" },
};

export function computeCommission(feeIncVat: number, commissionType: "percent" | "fixed" | null, commissionValue: number | null): number {
  if (commissionType === "fixed") return commissionValue ?? 0;
  if (commissionType === "percent") return feeIncVat * ((commissionValue ?? 0) / 100);
  return 0;
}

/**
 * החישוב האחד שכל המסך של היועץ נשען עליו.
 *
 * שתי הבחנות שהיו כאן קודם ותוקנו:
 * 1. במשכנתה חדשה אין משכנתה קיימת, ולכן אי אפשר לחשב לפי doc.* —
 *    הערכים האלה לא נשאלו והיו מיובאים מברירת המחדל של האשף.
 * 2. יחס ההחזר נמדד מול ההכנסה הפנויה (אחרי הלוואות שנספרות),
 *    לא מול סך ההכנסה — זה היחס שהבנק בודק.
 */
export function computeCase(c: AdvisorCase) {
  const isNew = c.requestType === "new";
  const termYears = maxTermYears(c.profile.oldestAge);
  const endsWithin18 = c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft !== "over18";
  const freeIncome = freeIncomeFor(c.income.net, c.income.extra, c.credit.otherLoansPayment ?? 0, endsWithin18);
  const totalIncome = c.income.net + c.income.extra;

  const payment = isNew
    ? monthlyPayment(c.property.mortgage, MARKET.assumedMixRate, termYears * 12)
    : monthlyPayment(c.doc.balance, c.doc.rate, c.doc.years * 12 + c.doc.months);

  const ratio = freeIncome > 0 ? payment / freeIncome : 0;
  const { band, label: bandLabel } = dtiBandFor(ratio);
  return {
    payment,
    /** ברכישה חדשה ההחזר הוא אומדן לפי ריבית שוק משוערת, לא נתון אמת. */
    isEstimate: isNew,
    termYears,
    freeIncome,
    totalIncome,
    ratio,
    band,
    bandLabel,
    comfortBand: bandFor(payment, c.repayment.comfort, c.repayment.max),
  };
}

export type KeyPoint = { kind: "red" | "green" | "info" | "tip"; text: string };

// Distills the wizard fields that matter for giving actual advice — the raw
// data grids below already show everything, but an advisor scanning a new
// case needs the "so what" version first, not a form to re-read. Red points
// are things that block or price the file badly; green points are what
// strengthens it.
/**
 * אומדן יחס ההחזר. במיחזור יש לנו את ההחזר האמיתי מדוח היתרות; ברכישה
 * חדשה עוד אין ריבית, אז מעריכים לפי ריבית שוק משוערת והתקופה המקסימלית
 * שהגיל מאפשר — ומסמנים במפורש שזה אומדן.
 */
function estimateDti(c: AdvisorCase) {
  const calc = computeCase(c);
  if (calc.freeIncome <= 0 || calc.payment <= 0) return null;
  const basis = calc.isEstimate ? ` (אומדן לפי ריבית ${MARKET.assumedMixRate}% ו-${calc.termYears} שנים)` : "";
  return { ratio: calc.ratio, band: calc.band, label: calc.bandLabel, basis, payment: calc.payment, freeIncome: calc.freeIncome, termYears: calc.termYears };
}

export function deriveKeyPoints(c: AdvisorCase): KeyPoint[] {
  const points: KeyPoint[] = [];
  const red = (text: string) => points.push({ kind: "red", text });
  const green = (text: string) => points.push({ kind: "green", text });
  const info = (text: string) => points.push({ kind: "info", text });
  const tip = (text: string) => points.push({ kind: "tip", text });

  /* --- שומר סף 1: שיעור מימון --- */
  const { cap, label } = ltvCapFor(c.goal, c.property.sellingExisting);
  // הבנק מחשב לפי הנמוך מבין מחיר החוזה לשמאות
  const bankValue = c.property.appraisalValue && c.property.appraisalValue > 0
    ? Math.min(c.property.value, c.property.appraisalValue)
    : c.property.value;
  const actualLtv = bankValue > 0 ? c.property.mortgage / bankValue : 0;

  if (c.requestType === "new") {
    if (actualLtv > cap + 0.001) {
      const maxLoan = cap * bankValue;
      red(
        `חריגה מתקרת המימון: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}). ` +
          `המקסימום שהבנק יאשר הוא ${shekel(maxLoan)} — חסרים ${shekel(c.property.mortgage - maxLoan)} בהון עצמי.`
      );
    } else if (actualLtv <= cap - 0.1) {
      green(`שיעור מימון נוח: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}).`);
    } else {
      info(`שיעור מימון: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}).`);
    }
  }

  if (c.property.appraisalValue && c.property.appraisalValue > 0 && c.property.appraisalValue < c.property.value) {
    red(
      `השמאות (${shekel(c.property.appraisalValue)}) נמוכה ממחיר החוזה (${shekel(c.property.value)}) — ` +
        `הבנק מממן לפי הנמוך, כך שנוצר פער של ${shekel(c.property.value - c.property.appraisalValue)} שחייב לבוא מההון העצמי.`
    );
  }

  /* --- שומר סף 2: גיל מול תקופה --- */
  if (c.profile.oldestAge > 0) {
    const maxYears = maxTermYears(c.profile.oldestAge);
    if (maxYears < 30) {
      const kind = maxYears <= 15 ? red : info;
      kind(
        `גיל הלווה המבוגר ${c.profile.oldestAge} — המשכנתה חייבת להסתיים עד גיל 75, כלומר תקופה מקסימלית של ${maxYears} שנים` +
          (maxYears <= 15 ? ". זה מעלה משמעותית את ההחזר החודשי, ושווה לבדוק צירוף לווה נוסף או ערב." : ".")
      );
    }
  }

  /* --- שומר סף 3: יחס החזר מההכנסה --- */
  const dti = estimateDti(c);
  if (dti) {
    const { ratio, band, label, basis, freeIncome } = dti;
    const pct = (ratio * 100).toFixed(1);
    if (band === "good") green(`יחס החזר כ-${pct}% — ${label}${basis}.`);
    else if (band === "watch")
      red(`יחס החזר כ-${pct}% — ${label}${basis}. מ-40% הבנק נדרש ל-100% הקצאת הון והתיק מתומחר יקר יותר.`);
    else red(`יחס החזר כ-${pct}% — ${label}${basis}. בלי שינוי במבנה העסקה קשה יהיה לקבל אישור.`);

    if (band !== "good") {
      const gap = dti.payment - freeIncome * 0.35;
      tip(`צריך להוריד כ-${shekel(gap)} מההחזר החודשי כדי להיכנס מתחת ל-35%.`);
    }
  }

  /* --- זכאות --- */
  if (c.zakaut === "yes") {
    green("יש תעודת זכאות — ריבית נמוכה יותר, בלי עמלת פירעון מוקדם, ואינה נכנסת להקצאת ההון של הבנק.");
  } else if (c.zakaut === "unsure") {
    info("הלקוח לא בטוח לגבי זכאות — שווה לבדוק, זה משפיע גם על הריבית וגם על עמלות הפירעון.");
  }

  if (c.complex) red("תיק מסומן כמורכב — כדאי לעבור על כל הפרטים בעיון לפני הגשת הצעה.");

  if (c.planning.futureRelease === "yes") {
    const amount = c.planning.futureReleaseAmount != null ? shekel(c.planning.futureReleaseAmount) : "סכום לא צוין";
    const timing = c.planning.futureReleaseTiming ? LABELS.futureReleaseTiming[c.planning.futureReleaseTiming] : null;
    green(`צפויה משיכת כספים משמעותית: ${amount}${timing ? ` (${timing})` : ""} — שווה מסלול שאפשר לפרוע בלי עמלה.`);
  } else if (c.planning.futureRelease === "unsure") {
    info("הלקוח לא בטוח אם צפויה משיכת כספים משמעותית בעתיד — כדאי לברר.");
  }

  if (c.planning.upcomingEvent !== "none") {
    info(`מתוכננת הוצאה גדולה בקרוב: ${LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent}.`);
  }

  if (c.planning.incomeChange === "yes") info("הלקוח צופה שינוי בהכנסה — כדאי לברר כיוון ומועד לפני שקובעים החזר יעד.");

  if (c.credit.otherLoans === "yes") {
    // הלוואה שנגמרת תוך 18 חודש לא נספרת בכושר ההחזר (הוראת בנק ישראל 04/2014),
    // ולכן סילוק של אחת שקרובה לסף הוא מנוף ממשי להגדלת המשכנתא.
    const endingSoon = c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft;
    if (endingSoon) {
      green(
        `יש הלוואות נוספות (${shekel(c.credit.otherLoansPayment ?? 0)} לחודש) שמסתיימות תוך ` +
          `${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft!] ?? c.credit.otherLoansMonthsLeft} — ` +
          `הלוואה שנגמרת תוך 18 חודש לא נספרת בכושר ההחזר.`
      );
    } else {
      red(`יש הלוואות נוספות בהחזר חודשי של ${shekel(c.credit.otherLoansPayment ?? 0)} שנספרות בכושר ההחזר.`);
    }
  }

  if (c.credit.creditIssues === "yes") red("יש חיווי אשראי שדורש תשומת לב — כדאי לברר פרטים מול הלקוח לפני הגשת הצעה.");

  if (c.profile.hasSecond === "yes") info("יש לווה/ת נוסף/ת בתיק — ראו פרטי תעסוקה בכרטיס הפרופיל.");

  if (c.property.source) info(`אופן הרכישה: ${LABELS.propertySource[c.property.source] ?? c.property.source}.`);

  /* --- המלצות: רק מה שנגזר מהמספרים של התיק הזה --- */

  // ההפרש בין ההחזר הנוח למקסימלי הוא תקציב הסיכון שהלקוח עצמו הגדיר.
  if (c.repayment.comfort > 0 && c.repayment.max > c.repayment.comfort) {
    tip(
      `הלקוח הצהיר על החזר נוח ${shekel(c.repayment.comfort)} ומקסימלי ${shekel(c.repayment.max)} — ` +
        `תקציב סיכון של ${shekel(c.repayment.max - c.repayment.comfort)} לחודש. זה הגבול לחשיפה למשתנה בתיק הזה.`
    );
  }

  // סכום ומועד ידועים — אפשר להצמיד אליהם את מבנה הרכיב הקבוע.
  if (c.planning.futureRelease === "yes" && c.planning.futureReleaseAmount) {
    const timing = c.planning.futureReleaseTiming ? LABELS.futureReleaseTiming[c.planning.futureReleaseTiming] : null;
    tip(
      `צפויים ${shekel(c.planning.futureReleaseAmount)} ${timing ? `בעוד ${timing}` : "בעתיד"} — ` +
        `כדאי לבנות את התיק כך שהסכום הזה ייפרע בלי קנס.`
    );
  }

  return points;
}
