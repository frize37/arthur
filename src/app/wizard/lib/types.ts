export const STAGES = [
  "welcome",
  "requestType",
  "goal",
  "property",
  "numbers",
  "repayment",
  "planning",
  "employment",
  "credit",
  "documents",
  "summary",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_CHAPTER: Partial<Record<Stage, number>> = {
  requestType: 0,
  goal: 0,
  property: 1,
  numbers: 1,
  repayment: 2,
  planning: 2,
  employment: 3,
  credit: 3,
  documents: 4,
  summary: 4,
};

export const CHAPTERS = ["בקשה ומטרה", "פרטי הנכס", "תכנון פיננסי", "פרופיל והכנסות", "מסמכים וסיכום"];

export type YesNo = "yes" | "no" | "unsure" | null;

export interface LoanTrack {
  bankName: string | null;
  rateKind: "fixed" | "variable" | null;
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

export interface WizardState {
  stage: Stage;
  requestType: "new" | "refinance" | "consolidate" | null;
  goal: string | null;

  propertySource: string | null;
  propertyLegal: string | null;
  propertyValue: number;
  mortgageAmount: number;
  equity: number;

  comfortPayment: number;
  maxStressPayment: number;

  futureRelease: YesNo;
  futureReleaseAmount: number;
  futureReleaseTiming: string | null;
  upcomingEvent: string | null;
  incomeChange: YesNo;

  hasSecondApplicant: "yes" | "no" | null;
  employment1: string | null;
  seniority1: string | null;
  employment2: string | null;
  seniority2: string | null;
  income: number;
  extra: number;

  otherLoans: "yes" | "no" | null;
  otherLoansPayment: number;
  otherLoansEndingSoon: "yes" | "no" | null;
  otherLoansMonthsLeft: "under6" | "6to12" | "13to18" | "over18" | null;
  creditIssues: "yes" | "no" | null;

  docSkipped: boolean;
  docConfirmed: boolean;
  docParsedOnce: boolean;
  docBalance: number;
  docRate: number;
  docYears: number;
  docMonths: number;

  docTracks: LoanTrack[];
  docQuoteValidDate: string | null;
  docTotalPrincipal: number | null;
  docTotalEarlyRepaymentFee: number | null;
  docTotalPayoff: number | null;
  docAccountComparisonRate: number | null;
  docAccountForecastRate: number | null;

  contactTime: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  identityVerified: boolean;
  submitted: boolean;
  celebratedSummary: boolean;
}

export const initialWizardState: WizardState = {
  stage: "welcome",
  requestType: null,
  goal: null,

  propertySource: null,
  propertyLegal: null,
  propertyValue: 1800000,
  mortgageAmount: 950000,
  equity: 400000,

  comfortPayment: 6000,
  maxStressPayment: 8000,

  futureRelease: null,
  futureReleaseAmount: 100000,
  futureReleaseTiming: null,
  upcomingEvent: null,
  incomeChange: null,

  hasSecondApplicant: null,
  employment1: null,
  seniority1: null,
  employment2: null,
  seniority2: null,
  income: 18000,
  extra: 0,

  otherLoans: null,
  otherLoansPayment: 1500,
  otherLoansEndingSoon: null,
  otherLoansMonthsLeft: null,
  creditIssues: null,

  docSkipped: false,
  docConfirmed: false,
  docParsedOnce: false,
  docBalance: 952400,
  docRate: 4.83,
  docYears: 22,
  docMonths: 3,

  docTracks: [],
  docQuoteValidDate: null,
  docTotalPrincipal: null,
  docTotalEarlyRepaymentFee: null,
  docTotalPayoff: null,
  docAccountComparisonRate: null,
  docAccountForecastRate: null,

  contactTime: null,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  identityVerified: false,
  submitted: false,
  celebratedSummary: false,
};

export const GOAL_LABELS: Record<string, string> = {
  maximizeSavings: "מקסום החיסכון הכולל",
  lower: "הקטנת ההחזר",
  shorten: "קיצור התקופה",
  closeExpensive: "סגירת ההלוואות היקרות",
  cash: "גיוס הסכום הנוסף",
  singleHome: "רכישת הדירה",
  investment: "רכישת דירת ההשקעה",
  upgrade: "שדרוג הדירה",
};

export function deriveEstimateFromTracks(
  tracks: LoanTrack[],
  totalPrincipal: number | null
): { balance: number; rate: number; years: number; months: number } {
  const balance = totalPrincipal ?? tracks.reduce((sum, t) => sum + (t.principalBalance ?? 0), 0);
  let weightedRateSum = 0;
  let weightSum = 0;
  for (const t of tracks) {
    const w = t.principalBalance ?? 0;
    weightedRateSum += w * (t.annualRate ?? 0);
    weightSum += w;
  }
  const rate = weightSum > 0 ? weightedRateSum / weightSum : tracks[0]?.annualRate ?? 0;
  const maxMonths = Math.max(0, ...tracks.map((t) => t.monthsRemaining ?? 0));
  return {
    balance: Math.round(balance),
    rate: Math.round(rate * 100) / 100,
    years: Math.floor(maxMonths / 12),
    months: maxMonths % 12,
  };
}

export function isComplexCase(state: WizardState): boolean {
  return (
    state.employment1 === "selfemployed" ||
    state.employment1 === "controlling" ||
    state.employment2 === "selfemployed" ||
    state.employment2 === "controlling" ||
    state.creditIssues === "yes"
  );
}
