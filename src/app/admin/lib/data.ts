import { shekel } from "../../wizard/lib/finance";

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
  };
  planning: {
    futureRelease: string;
    futureReleaseAmount: number | null;
    futureReleaseTiming: string | null;
    upcomingEvent: string;
    incomeChange: string;
  };
  profile: { hasSecond: string; employment1: string; seniority1: string; employment2?: string; seniority2?: string };
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
export function deriveKeyPoints(c: AdminCase): string[] {
  const points: string[] = [];

  if (c.complex) points.push("תיק מסומן כמורכב — כדאי לעבור על כל הפרטים בעיון לפני הקצאה ליועצים.");

  if (c.planning.futureRelease === "yes") {
    const amount = c.planning.futureReleaseAmount != null ? shekel(c.planning.futureReleaseAmount) : "סכום לא צוין";
    const timing = c.planning.futureReleaseTiming ? LABELS.futureReleaseTiming[c.planning.futureReleaseTiming] : null;
    points.push(`צפויה משיכת כספים משמעותית: ${amount}${timing ? ` (${timing})` : ""}.`);
  } else if (c.planning.futureRelease === "unsure") {
    points.push("הלקוח לא בטוח אם צפויה משיכת כספים משמעותית בעתיד.");
  }

  if (c.planning.upcomingEvent !== "none") {
    points.push(`מתוכננת הוצאה גדולה בקרוב: ${LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent}.`);
  }

  if (c.planning.incomeChange === "yes") points.push("הלקוח צופה שינוי בהכנסה.");
  else if (c.planning.incomeChange === "unsure") points.push("הלקוח לא בטוח אם צפוי שינוי בהכנסה.");

  if (c.credit.otherLoans === "yes") {
    let text = `יש הלוואות נוספות בהחזר חודשי כולל של ${shekel(c.credit.otherLoansPayment ?? 0)}`;
    if (c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft) {
      text += `, צפויות להסתיים תוך ${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft] ?? c.credit.otherLoansMonthsLeft}`;
    }
    points.push(text + ".");
  }

  if (c.credit.creditIssues === "yes") points.push("יש חיווי אשראי שדורש תשומת לב.");

  if (c.profile.hasSecond === "yes") points.push("יש לווה/ת נוסף/ת בתיק.");

  if (c.brief.propertySource) points.push(`אופן הרכישה: ${LABELS.propertySource[c.brief.propertySource] ?? c.brief.propertySource}.`);

  return points;
}

