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

export function isComplexCase(state: WizardState): boolean {
  return (
    state.employment1 === "selfemployed" ||
    state.employment1 === "controlling" ||
    state.employment2 === "selfemployed" ||
    state.employment2 === "controlling" ||
    state.creditIssues === "yes"
  );
}
