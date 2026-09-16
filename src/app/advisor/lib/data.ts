import { monthlyPayment } from "../../wizard/lib/finance";

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
  property: { value: number; mortgage: number; legal: string };
  repayment: { comfort: number; max: number };
  planning: { futureRelease: string; upcomingEvent: string; incomeChange: string };
  profile: { hasSecond: string; employment1: string; seniority1: string; employment2?: string; seniority2?: string };
  income: { net: number; extra: number };
  credit: { otherLoans: string; otherLoansEndingSoon?: string; otherLoansMonthsLeft?: string; creditIssues: string };
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
