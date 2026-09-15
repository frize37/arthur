export type CaseStatus = "new" | "verifying" | "awaiting" | "ready" | "sent" | "closed";

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
  brief: { propertyValue: number; mortgage: number; income: number; ratioBand: "good" | "watch" | "risk" };
  offers: Offer[];
  timeline: { label: string; time: string }[];
  assignedAdvisorIds: string[];
  docTracks: LoanTrack[];
  docTotals: DocTotals;
  docSource: "ai" | "manual" | null;
}

export interface Advisor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  casesWon: number;
  avgResponseHours: number;
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
};

export const STATUS_META: Record<CaseStatus, { label: string; cls: string }> = {
  new: { label: "תיק חדש — לא הוקצה", cls: "pill-verifying" },
  verifying: { label: "ממתין לאימות זהות", cls: "pill-verifying" },
  awaiting: { label: "ממתין להצעות", cls: "pill-awaiting" },
  ready: { label: "מוכן לבחירת מנצח", cls: "pill-ready" },
  sent: { label: "נשלח ללקוח", cls: "pill-sent" },
  closed: { label: "נסגר בהצלחה", cls: "pill-closed" },
};

export const TABS: { key: CaseStatus | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "new", label: "לא הוקצה" },
  { key: "verifying", label: "ממתין לאימות" },
  { key: "awaiting", label: "ממתין להצעות" },
  { key: "ready", label: "לבחירת מנצח" },
  { key: "sent", label: "נשלח ללקוח" },
  { key: "closed", label: "נסגר" },
];

