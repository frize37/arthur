export type CaseStatus = "verifying" | "awaiting" | "ready" | "sent" | "closed";

export interface Offer {
  advisorId: string;
  savings: number;
  fee: number;
  notes: string;
  submittedAt: string;
  winner?: boolean;
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

export const ADVISORS: Record<string, Advisor> = {
  adv1: { id: "adv1", name: "רותם כהן", specialty: "מיחזור ואיחוד הלוואות", rating: 4.9, casesWon: 18, avgResponseHours: 3 },
  adv2: { id: "adv2", name: "אבי לוגסי", specialty: "מסלולים משתנים ותמהיל ריבית", rating: 4.8, casesWon: 14, avgResponseHours: 5 },
  adv3: { id: "adv3", name: "מאיה שגיא", specialty: "עצמאים ותיקים מורכבים", rating: 4.7, casesWon: 11, avgResponseHours: 6 },
  adv4: { id: "adv4", name: "דניאל אשכנזי", specialty: "לקוחות חדשים ורכישת דירה ראשונה", rating: 4.6, casesWon: 9, avgResponseHours: 8 },
};

export const STATUS_META: Record<CaseStatus, { label: string; cls: string }> = {
  verifying: { label: "ממתין לאימות זהות", cls: "pill-verifying" },
  awaiting: { label: "ממתין להצעות", cls: "pill-awaiting" },
  ready: { label: "מוכן לבחירת מנצח", cls: "pill-ready" },
  sent: { label: "נשלח ללקוח", cls: "pill-sent" },
  closed: { label: "נסגר בהצלחה", cls: "pill-closed" },
};

export const TABS: { key: CaseStatus | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "verifying", label: "ממתין לאימות" },
  { key: "awaiting", label: "ממתין להצעות" },
  { key: "ready", label: "לבחירת מנצח" },
  { key: "sent", label: "נשלח ללקוח" },
  { key: "closed", label: "נסגר" },
];

export const MOCK_CASES: AdminCase[] = [
  {
    id: "C-2101", receivedAt: "לפני 40 דקות", status: "verifying", requestType: "new", goal: "singleHome", complex: false,
    client: { name: "א. לוי", phone: "050-1234567", email: "a.levi@example.com", phoneVerified: false, emailVerified: true },
    brief: { propertyValue: 1650000, mortgage: 1150000, income: 15200, ratioBand: "watch" },
    offers: [],
    timeline: [
      { label: "התיק נקלט מהאשף", time: "40 דקות" },
      { label: "מייל אומת", time: "32 דקות" },
      { label: "ממתין לאימות טלפון", time: "עכשיו" },
    ],
  },
  {
    id: "C-2098", receivedAt: "לפני 3 שעות", status: "awaiting", requestType: "refinance", goal: "maximizeSavings", complex: false,
    client: { name: "ד. ברק", phone: "052-2345678", email: "d.barak@example.com", phoneVerified: true, emailVerified: true },
    brief: { propertyValue: 1950000, mortgage: 1080000, income: 19500, ratioBand: "good" },
    offers: [{ advisorId: "adv1", savings: 36000, fee: 2200, notes: "מומלץ לפצל למסלול קבוע+פריים.", submittedAt: "לפני שעה" }],
    timeline: [
      { label: "התיק נקלט מהאשף", time: "3 שעות" },
      { label: "זהות אומתה (טלפון+מייל)", time: "2:50 שעות" },
      { label: "נשלח ל-4 יועצים", time: "2:45 שעות" },
      { label: "התקבלה הצעה מרותם כהן", time: "שעה" },
    ],
  },
  {
    id: "C-2095", receivedAt: "אתמול, 11:20", status: "ready", requestType: "consolidate", goal: "closeExpensive", complex: true,
    client: { name: "מ. עזרן", phone: "053-3456789", email: "m.ezran@example.com", phoneVerified: true, emailVerified: true },
    brief: { propertyValue: 1600000, mortgage: 1220000, income: 17700, ratioBand: "watch" },
    offers: [
      { advisorId: "adv1", savings: 41000, fee: 3200, notes: "איחוד 3 הלוואות יקרות תחת מסלול אחד.", submittedAt: "אתמול 15:10" },
      { advisorId: "adv3", savings: 44500, fee: 2900, notes: "ניסיון בתיקים עם הכנסה מעצמאות — מכיר את המקרה.", submittedAt: "אתמול 16:40" },
      { advisorId: "adv2", savings: 37200, fee: 2500, notes: "הצעה שמרנית, בלי שינוי מסלולים קיימים.", submittedAt: "אתמול 18:05" },
      { advisorId: "adv4", savings: 39800, fee: 2700, notes: "אפשרות לקצר תקופה ב-3 שנים.", submittedAt: "היום 08:15" },
    ],
    timeline: [
      { label: "התיק נקלט מהאשף", time: "אתמול 11:20" },
      { label: "זהות אומתה (טלפון+מייל)", time: "אתמול 11:35" },
      { label: "נשלח ל-4 יועצים", time: "אתמול 11:40" },
      { label: "4/4 הצעות התקבלו", time: "היום 08:15" },
      { label: "ממתין לבחירת מנצח", time: "עכשיו" },
    ],
  },
  {
    id: "C-2088", receivedAt: "לפני 4 ימים", status: "sent", requestType: "new", goal: "investment", complex: true,
    client: { name: "נ. שריקי", phone: "054-4567890", email: "n.shariki@example.com", phoneVerified: true, emailVerified: true },
    brief: { propertyValue: 2450000, mortgage: 1400000, income: 26200, ratioBand: "good" },
    offers: [{ advisorId: "adv3", savings: 52000, fee: 3800, notes: "מבנה מימון מותאם למשקיע עם הכנסה מעורבת.", submittedAt: "לפני 3 ימים", winner: true }],
    timeline: [
      { label: "התיק נקלט מהאשף", time: "4 ימים" },
      { label: "זהות אומתה", time: "4 ימים" },
      { label: "נשלח ל-4 יועצים", time: "4 ימים" },
      { label: "4/4 הצעות התקבלו", time: "3 ימים" },
      { label: "נבחרה הצעת מאיה שגיא ונשלחה ללקוח", time: "3 ימים" },
      { label: "ממתין לתשובת הלקוח", time: "עכשיו" },
    ],
  },
  {
    id: "C-2071", receivedAt: "לפני שבוע", status: "closed", requestType: "refinance", goal: "lower", complex: false,
    client: { name: "ע. כרמלי", phone: "050-5678901", email: "o.carmeli@example.com", phoneVerified: true, emailVerified: true },
    brief: { propertyValue: 1750000, mortgage: 930000, income: 14800, ratioBand: "good" },
    offers: [{ advisorId: "adv1", savings: 38500, fee: 1900, notes: "", submittedAt: "לפני 6 ימים", winner: true }],
    timeline: [
      { label: "התיק נקלט מהאשף", time: "שבוע" },
      { label: "זהות אומתה", time: "שבוע" },
      { label: "נשלח ל-4 יועצים", time: "שבוע" },
      { label: "נבחרה הצעת רותם כהן ונשלחה ללקוח", time: "6 ימים" },
      { label: "הלקוח אישר — היועצת יצרה קשר", time: "5 ימים" },
      { label: "התיק נסגר בהצלחה", time: "3 ימים" },
    ],
  },
];
