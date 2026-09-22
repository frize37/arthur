import { ltvCapFor, maxTermYears, shekel } from "../../wizard/lib/finance";

export type CaseStatus = "new" | "verifying" | "awaiting" | "ready" | "sent" | "closed" | "closed_no_deal";

export interface Offer {
  advisorId: string;
  savings: number;
  fee: number;
  notes: string;
  submittedAt: string;
  winner?: boolean;
}

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

export interface AdminCase {
  id: string;
  receivedAt: string;
  status: CaseStatus;
  requestType: "new" | "refinance" | "consolidate";
  goal: string;
  complex: boolean;
  client: { name: string; phone: string; email: string; phoneVerified: boolean; emailVerified: boolean };
  brief: {
    propertyValue: number;
    mortgage: number;
    income: number;
    ratioBand: "good" | "watch" | "risk";
    propertyLegal: string;
    propertySource: string | null;
    equity: number;
    ownedProperties: string | null;
    sellingExisting: string | null;
    appraisalValue: number | null;
  };
  zakaut: string | null;
  planning: {
    futureRelease: string;
    futureReleaseAmount: number | null;
    futureReleaseTiming: string | null;
    upcomingEvent: string;
    incomeChange: string;
  };
  profile: { hasSecond: string; employment1: string; seniority1: string; employment2?: string; seniority2?: string; oldestAge: number };
  credit: { otherLoans: string; otherLoansPayment: number | null; otherLoansEndingSoon?: string; otherLoansMonthsLeft?: string; creditIssues: string };
  offers: Offer[];
  timeline: { label: string; time: string }[];
  assignedAdvisorIds: string[];
  docTracks: LoanTrack[];
  docTotals: DocTotals;
  docSource: "ai" | "manual" | null;
  originalDocName: string | null;
  originalDocType: string | null;
  cleanDocName: string | null;
  cleanDocType: string | null;
  completionNote: string | null;
  completedBy: "advisor" | "admin" | null;
}

export interface Advisor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  casesWon: number;
  avgResponseHours: number;
  email: string | null;
  commissionType: "percent" | "fixed" | null;
  commissionValue: number | null;
  logoUrl: string | null;
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
  specialtyIcon: { new: "ic-home", refinance: "ic-down", consolidate: "ic-merge" } as Record<string, string>,
  legal: { tabu: "רשום בטאבו", rmi: "רמ״י / חברה משכנת", pending: "בתהליכי רישום" } as Record<string, string>,
  employment: { salaried: "שכיר/ה", selfemployed: "עצמאי/ת", controlling: "בעל/ת שליטה", none: "לא עובד/ת" } as Record<string, string>,
  seniority: { under1: "מתחת לשנה", "1to3": "1–3 שנים", over3: "מעל 3 שנים" } as Record<string, string>,
  yesno: { yes: "כן", no: "לא", unsure: "עוד לא ידוע" } as Record<string, string>,
  monthsLeft: { under6: "עד 6 חודשים", "6to12": "7–12 חודשים", "13to18": "13–18 חודשים", over18: "מעל 18 חודשים" } as Record<string, string>,
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
  new: { label: "תיק חדש — לא הוקצה", cls: "pill-verifying" },
  verifying: { label: "ממתין לאימות זהות", cls: "pill-verifying" },
  awaiting: { label: "ממתין להצעות", cls: "pill-awaiting" },
  ready: { label: "מוכן לבחירת מנצח", cls: "pill-ready" },
  sent: { label: "נשלח ללקוח", cls: "pill-sent" },
  closed: { label: "נסגר בהצלחה", cls: "pill-closed" },
  closed_no_deal: { label: "נסגר ללא ביצוע", cls: "pill-verifying" },
};

export const TABS: { key: CaseStatus | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "new", label: "לא הוקצה" },
  { key: "verifying", label: "ממתין לאימות" },
  { key: "awaiting", label: "ממתין להצעות" },
  { key: "ready", label: "לבחירת מנצח" },
  { key: "sent", label: "נשלח ללקוח" },
  { key: "closed", label: "נסגר בהצלחה" },
  { key: "closed_no_deal", label: "נסגר ללא ביצוע" },
];

// Same idea as the advisor dashboard's key-points list — a distilled "so
// what" summary of the wizard answers, for a quick read before assigning
// or reviewing offers, instead of hunting through several data grids.
export type KeyPoint = { kind: "red" | "green" | "info"; text: string };

export function deriveKeyPoints(c: AdminCase): KeyPoint[] {
  const points: KeyPoint[] = [];
  const red = (text: string) => points.push({ kind: "red", text });
  const green = (text: string) => points.push({ kind: "green", text });
  const info = (text: string) => points.push({ kind: "info", text });

  /* --- שומר סף 1: שיעור מימון --- */
  const { cap, label } = ltvCapFor(c.brief.ownedProperties, c.brief.sellingExisting);
  const bankValue = c.brief.appraisalValue && c.brief.appraisalValue > 0
    ? Math.min(c.brief.propertyValue, c.brief.appraisalValue)
    : c.brief.propertyValue;
  const actualLtv = bankValue > 0 ? c.brief.mortgage / bankValue : 0;

  if (c.brief.ownedProperties) {
    if (actualLtv > cap + 0.001) {
      const maxLoan = cap * bankValue;
      red(
        `חריגה מתקרת המימון: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}). ` +
          `המקסימום שיאושר הוא ${shekel(maxLoan)} — חסרים ${shekel(c.brief.mortgage - maxLoan)} בהון עצמי.`
      );
    } else if (actualLtv <= cap - 0.1) {
      green(`שיעור מימון נוח: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}).`);
    } else {
      info(`שיעור מימון: כ-${(actualLtv * 100).toFixed(1)}% מול תקרה של ${Math.round(cap * 100)}% (${label}).`);
    }
  }

  if (c.brief.appraisalValue && c.brief.appraisalValue > 0 && c.brief.appraisalValue < c.brief.propertyValue) {
    red(
      `השמאות (${shekel(c.brief.appraisalValue)}) נמוכה ממחיר החוזה (${shekel(c.brief.propertyValue)}) — ` +
        `פער של ${shekel(c.brief.propertyValue - c.brief.appraisalValue)} שחייב לבוא מההון העצמי.`
    );
  }

  /* --- שומר סף 2: גיל מול תקופה --- */
  if (c.profile.oldestAge > 0) {
    const maxYears = maxTermYears(c.profile.oldestAge);
    if (maxYears < 30) {
      const kind = maxYears <= 15 ? red : info;
      kind(`גיל הלווה המבוגר ${c.profile.oldestAge} — תקופה מקסימלית ${maxYears} שנים (סיום עד גיל 75).`);
    }
  }

  /* --- זכאות --- */
  if (c.zakaut === "yes") {
    green("יש תעודת זכאות — ריבית נמוכה יותר, בלי עמלת פירעון מוקדם, ולא נכנסת להקצאת ההון.");
  } else if (c.zakaut === "unsure") {
    info("הלקוח לא בטוח לגבי זכאות — שווה לבדוק.");
  }

  if (c.complex) red("תיק מסומן כמורכב — כדאי לעבור על כל הפרטים בעיון לפני הקצאה ליועצים.");

  if (c.planning.futureRelease === "yes") {
    const amount = c.planning.futureReleaseAmount != null ? shekel(c.planning.futureReleaseAmount) : "סכום לא צוין";
    const timing = c.planning.futureReleaseTiming ? LABELS.futureReleaseTiming[c.planning.futureReleaseTiming] : null;
    green(`צפויה משיכת כספים משמעותית: ${amount}${timing ? ` (${timing})` : ""}.`);
  } else if (c.planning.futureRelease === "unsure") {
    info("הלקוח לא בטוח אם צפויה משיכת כספים משמעותית בעתיד.");
  }

  if (c.planning.upcomingEvent !== "none") {
    info(`מתוכננת הוצאה גדולה בקרוב: ${LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent}.`);
  }

  if (c.planning.incomeChange === "yes") info("הלקוח צופה שינוי בהכנסה.");

  if (c.credit.otherLoans === "yes") {
    const endingSoon = c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft;
    if (endingSoon) {
      green(
        `הלוואות נוספות (${shekel(c.credit.otherLoansPayment ?? 0)} לחודש) שמסתיימות תוך ` +
          `${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft!] ?? c.credit.otherLoansMonthsLeft} — לא נספרות בכושר ההחזר.`
      );
    } else {
      red(`הלוואות נוספות בהחזר חודשי של ${shekel(c.credit.otherLoansPayment ?? 0)} שנספרות בכושר ההחזר.`);
    }
  }

  if (c.credit.creditIssues === "yes") red("יש חיווי אשראי שדורש תשומת לב.");

  if (c.profile.hasSecond === "yes") info("יש לווה/ת נוסף/ת בתיק.");

  if (c.brief.propertySource) info(`אופן הרכישה: ${LABELS.propertySource[c.brief.propertySource] ?? c.brief.propertySource}.`);

  return points;
}

