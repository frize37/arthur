import { monthlyPayment, shekel } from "../../wizard/lib/finance";

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
  receivedAt: string;
  status: CaseStatus;
  requestType: "new" | "refinance" | "consolidate";
  goal: string;
  complex: boolean;
  property: { value: number; mortgage: number; legal: string; source: string | null };
  equity: number;
  repayment: { comfort: number; max: number };
  planning: {
    futureRelease: string;
    futureReleaseAmount: number | null;
    futureReleaseTiming: string | null;
    upcomingEvent: string;
    incomeChange: string;
  };
  profile: { hasSecond: string; employment1: string; seniority1: string; employment2?: string; seniority2?: string };
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

export function computeCase(c: AdvisorCase) {
  const totalMonths = c.doc.years * 12 + c.doc.months;
  const payment = monthlyPayment(c.doc.balance, c.doc.rate, totalMonths);
  const totalIncome = c.income.net + c.income.extra;
  const ratio = totalIncome > 0 ? payment / totalIncome : 0;
  const band: Band = payment <= c.repayment.comfort ? "good" : payment <= c.repayment.max ? "watch" : "risk";
  const betterRate = Math.max(3.2, c.doc.rate - 0.7);
  const betterPayment = monthlyPayment(c.doc.balance, betterRate, totalMonths);
  const suggestedSavings = Math.max(0, (payment - betterPayment) * totalMonths);
  return { payment, totalIncome, ratio, band, suggestedSavings };
}

// Distills the wizard fields that matter for giving actual advice — the raw
// data grids below already show everything, but an advisor scanning a new
// case needs the "so what" version first, not a form to re-read.
export function deriveKeyPoints(c: AdvisorCase): string[] {
  const points: string[] = [];

  if (c.complex) points.push("תיק מסומן כמורכב — כדאי לעבור על כל הפרטים בעיון לפני הגשת הצעה.");

  if (c.planning.futureRelease === "yes") {
    const amount = c.planning.futureReleaseAmount != null ? shekel(c.planning.futureReleaseAmount) : "סכום לא צוין";
    const timing = c.planning.futureReleaseTiming ? LABELS.futureReleaseTiming[c.planning.futureReleaseTiming] : null;
    points.push(`צפויה משיכת כספים משמעותית: ${amount}${timing ? ` (${timing})` : ""} — שווה לשקול מסלול עם אפשרות פירעון מוקדם ללא עמלה.`);
  } else if (c.planning.futureRelease === "unsure") {
    points.push("הלקוח לא בטוח אם צפויה משיכת כספים משמעותית בעתיד — כדאי לברר.");
  }

  if (c.planning.upcomingEvent !== "none") {
    points.push(`מתוכננת הוצאה גדולה בקרוב: ${LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent}.`);
  }

  if (c.planning.incomeChange === "yes") points.push("הלקוח צופה שינוי בהכנסה — כדאי לברר כיוון ומועד לפני שקובעים החזר יעד.");
  else if (c.planning.incomeChange === "unsure") points.push("הלקוח לא בטוח אם צפוי שינוי בהכנסה.");

  if (c.credit.otherLoans === "yes") {
    let text = `יש הלוואות נוספות בהחזר חודשי כולל של ${shekel(c.credit.otherLoansPayment ?? 0)}`;
    if (c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft) {
      text += `, צפויות להסתיים תוך ${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft] ?? c.credit.otherLoansMonthsLeft} — רלוונטי לחישוב יכולת ההחזר שלו בטווח הקרוב`;
    }
    points.push(text + ".");
  }

  if (c.credit.creditIssues === "yes") points.push("יש חיווי אשראי שדורש תשומת לב — כדאי לברר פרטים מול הלקוח לפני הגשת הצעה.");

  if (c.profile.hasSecond === "yes") points.push("יש לווה/ת נוסף/ת בתיק — ראו פרטי תעסוקה בכרטיס הפרופיל.");

  if (c.property.source) points.push(`אופן הרכישה: ${LABELS.propertySource[c.property.source] ?? c.property.source}.`);

  return points;
}
