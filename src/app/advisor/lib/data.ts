import { monthlyPayment } from "../../wizard/lib/finance";

export type CaseStatus = "pending" | "sent" | "won" | "lost";
export type Band = "good" | "watch" | "risk";

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
  credit: { otherLoans: string; creditIssues: string };
  doc: { balance: number; rate: number; years: number; months: number };
  offer?: { savings: number; fee: number };
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
  specialtyIcon: { new: "ic-home", refinance: "ic-down", consolidate: "ic-merge" } as Record<string, string>,
};

export const STATUS_META: Record<CaseStatus, { label: string; cls: string }> = {
  pending: { label: "ממתין להצעה", cls: "pill-pending" },
  sent: { label: "הצעה נשלחה", cls: "pill-sent" },
  won: { label: "זכינו בתיק", cls: "pill-won" },
  lost: { label: "לא נבחרנו", cls: "pill-lost" },
};

export const MOCK_CASES: AdvisorCase[] = [
  {
    id: "C-1042", receivedAt: "לפני 20 דקות", status: "pending", requestType: "refinance", goal: "maximizeSavings", complex: false,
    property: { value: 1950000, mortgage: 1080000, legal: "tabu" },
    repayment: { comfort: 6500, max: 8500 },
    planning: { futureRelease: "no", upcomingEvent: "none", incomeChange: "no" },
    profile: { hasSecond: "yes", employment1: "salaried", seniority1: "over3", employment2: "salaried", seniority2: "over3" },
    income: { net: 19500, extra: 0 },
    credit: { otherLoans: "no", creditIssues: "no" },
    doc: { balance: 1080000, rate: 5.1, years: 19, months: 0 },
  },
  {
    id: "C-1039", receivedAt: "אתמול, 14:10", status: "pending", requestType: "new", goal: "investment", complex: true,
    property: { value: 2450000, mortgage: 1400000, legal: "rmi" },
    repayment: { comfort: 8000, max: 10500 },
    planning: { futureRelease: "yes", upcomingEvent: "none", incomeChange: "unsure" },
    profile: { hasSecond: "no", employment1: "controlling", seniority1: "1to3" },
    income: { net: 23000, extra: 3200 },
    credit: { otherLoans: "yes", creditIssues: "no" },
    doc: { balance: 1400000, rate: 4.6, years: 27, months: 0 },
  },
  {
    id: "C-1035", receivedAt: "לפני יומיים", status: "sent", requestType: "consolidate", goal: "closeExpensive", complex: true,
    property: { value: 1600000, mortgage: 1220000, legal: "tabu" },
    repayment: { comfort: 5800, max: 6800 },
    planning: { futureRelease: "no", upcomingEvent: "family", incomeChange: "no" },
    profile: { hasSecond: "yes", employment1: "salaried", seniority1: "over3", employment2: "selfemployed", seniority2: "under1" },
    income: { net: 16200, extra: 1500 },
    credit: { otherLoans: "yes", creditIssues: "yes" },
    doc: { balance: 1220000, rate: 6.2, years: 21, months: 6 },
    offer: { savings: 41000, fee: 3200 },
  },
  {
    id: "C-1028", receivedAt: "לפני 5 ימים", status: "won", requestType: "refinance", goal: "lower", complex: false,
    property: { value: 1750000, mortgage: 930000, legal: "tabu" },
    repayment: { comfort: 5200, max: 6200 },
    planning: { futureRelease: "no", upcomingEvent: "reno", incomeChange: "no" },
    profile: { hasSecond: "no", employment1: "salaried", seniority1: "over3" },
    income: { net: 14800, extra: 0 },
    credit: { otherLoans: "no", creditIssues: "no" },
    doc: { balance: 930000, rate: 5.4, years: 17, months: 0 },
    offer: { savings: 38500, fee: 1900 },
  },
  {
    id: "C-1021", receivedAt: "לפני שבוע", status: "lost", requestType: "new", goal: "singleHome", complex: false,
    property: { value: 1450000, mortgage: 1050000, legal: "pending" },
    repayment: { comfort: 5000, max: 6000 },
    planning: { futureRelease: "no", upcomingEvent: "none", incomeChange: "no" },
    profile: { hasSecond: "yes", employment1: "salaried", seniority1: "1to3", employment2: "salaried", seniority2: "1to3" },
    income: { net: 13600, extra: 0 },
    credit: { otherLoans: "no", creditIssues: "no" },
    doc: { balance: 1050000, rate: 4.9, years: 28, months: 0 },
  },
];

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
