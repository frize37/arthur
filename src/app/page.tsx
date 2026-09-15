import Link from "next/link";
import Image from "next/image";
import { ArthurMascot } from "@/components/ArthurMascot";
import { fetchPublicStats } from "./lib/publicStats";
import { shekel } from "./wizard/lib/finance";

// Stats are live data, not build-time content — refresh at most once a
// minute instead of baking in whatever the counts were at deploy time.
export const revalidate = 60;

const STEPS = [
  {
    title: "עונים על שאלון קצר",
    desc: "כ-2 דקות, מסך אחד-שניים לכל נושא. כל שאלה חשובה לדיוק ההצעה שתקבלו.",
  },
  {
    title: "מעלים דוח יתרות",
    desc: "או ממלאים את פרטי הריבית בעצמכם — כך או כך, המספרים האלה הם הבסיס להצעה האמיתית.",
  },
  {
    title: "מאמתים זהות בקצרה",
    desc: "קוד ב-SMS וקוד במייל, כדי שהתיק ייפתח בביטחון מלא.",
  },
  {
    title: "יועצים מתחרים על התיק שלכם",
    desc: "התיק (בעילום שם) יוצא למספר יועצי משכנתאות, וכל אחד מגיש הצעת מחיר אמיתית — אתם מקבלים את המשתלמת ביותר.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "מה זה בעצם ארתור?",
    a: "ארתור היא מערכת שפותחה על ידי אנשים שראו צורך לבדוק כל הלוואה או משכנתה מול כמה מומחים בו-זמנית — האם יש בכלל היתכנות למיחזור, וכמה זה יעלה לבצע בפועל.",
  },
  {
    q: "למה לא לבדוק ישר מול הבנק שלי?",
    a: "כי הבנק מחפש את הפתרון הכי טוב עבורו. אנחנו בצד השני — יחד עם יועצי המשכנתאות — לטובת הלקוח, ומשווים מי מציע את הפתרון הטוב ביותר במחיר הכי משתלם והאפשרי.",
  },
  {
    q: "איך זה עובד בפועל, שלב אחר שלב?",
    a: "עונים על שאלון ממוקד, מעלים דוח יתרות (או ממלאים את הפרטים בעצמכם), מאמתים את הזהות שלכם ב-SMS ובמייל — והתיק (ללא שם) יוצא ליועצים שמגישים הצעת מחיר אמיתית.",
  },
  {
    q: "האם אני צריך להעביר לכם פרטים אישיים?",
    a: "לא. אתם מעלים דוח יתרות שמופיעים בו פרטי המשכנתה בלבד. אנחנו לא שומרים את הדוח עצמו אצלנו — רק שולפים ממנו את הנתונים הפיננסיים, בלי שום פרט מזהה, ומעבירים אותם ליועצים.",
  },
  {
    q: "כמה זמן זה לוקח?",
    a: "מילוי השאלון עצמו לוקח כ-2 דקות. מיד אחרי זה התיק עובר ליועצים ואתם מקבלים תשובה מהר — היועצים אצלנו נמדדים על חיסכון, יעילות, שירות, ומהירות שליחת הצעת המחיר.",
  },
  {
    q: "האם הבדיקה עולה כסף?",
    a: "לא. הבדיקה וההשוואה בין היועצים חינמיות לחלוטין עבורכם.",
  },
  {
    q: "מה עם הפרטיות שלי?",
    a: "התיק שלכם נשלח ליועצים ללא שם, טלפון או מייל — רק הנתונים הפיננסיים הרלוונטיים. פרטי הקשר שלכם נחשפים רק ליועץ שנבחר, ורק אחרי שתאשרו.",
  },
  {
    q: "מה אם עדיין אין לי את דוח היתרות?",
    a: "אפשר להמשיך גם בלעדיו — תמלאו בעצמכם את פרטי הריבית, היתרה והתקופה. שימו לב שההצעה שתתקבל תהיה מבוססת על הנתונים שהצהרתם, ולכן כדאי שיהיו מדויקים ככל האפשר.",
  },
  {
    q: "איך בוחרים את היועצים, ומה קורה עם ההצעות שלהם?",
    a: "היועצים נבחרים לפי סוג התיק שלכם (מיחזור, עצמאים, מסלולים משתנים ועוד). כל אחד מגיש הצעת מחיר, ואנחנו משווים ומעבירים אליכם רק את ההצעה המשתלמת ביותר.",
  },
  {
    q: "מה קורה אם יועץ לא נותן שירות טוב?",
    a: "בסוף התהליך אתם מדרגים את היועץ שטיפל בכם. אנחנו כאן כדי לשרת אתכם — יועץ שמקבל דירוגים נמוכים לא ממשיך לעבוד איתנו.",
  },
  {
    q: "האם אני מחויב/ת לקחת את ההצעה?",
    a: "ממש לא. הבדיקה, ההשוואה וההצעה — הכל ללא כל התחייבות מצידכם.",
  },
  {
    q: "יש לי כבר משכנתה תקינה, יש בכלל טעם לבדוק?",
    a: "כן — ריביות משתנות עם הזמן, ולעיתים קרובות אפשר לחסוך עשרות אלפי שקלים גם במשכנתה \"בסדר\", בלי לשנות כלום מלבד התנאים.",
  },
  {
    q: "איך יוצרים איתי קשר בהמשך?",
    a: "אחרי שתאשרו את ההצעה הנבחרת, היועץ יוצר איתכם קשר ישירות, בטווח השעות שבחרתם באשף.",
  },
];

export default async function Home() {
  const stats = await fetchPublicStats();
  const statTiles = [
    { label: "תיקים שבדקנו", value: stats.casesChecked.toLocaleString("he-IL") },
    { label: "תיקים שנסגרו בהצלחה", value: stats.casesClosed.toLocaleString("he-IL") },
    { label: "חיסכון שסיפקנו ללקוחות", value: shekel(stats.totalSavings) },
    { label: "היקף משכנתאות שבדקנו", value: shekel(stats.totalMortgageVolume) },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-5 py-3.5">
          <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="h-16 w-auto" />
          <Link
            href="/wizard"
            className="font-display font-bold text-sm rounded-xl bg-accent text-[var(--hero-1)] px-4 py-2 shadow-[0_12px_22px_-12px_color-mix(in_srgb,var(--accent)_65%,transparent)] transition hover:-translate-y-0.5"
          >
            בדיקה חינמית
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden text-center"
          style={{ background: "linear-gradient(155deg, var(--hero-1) 0%, var(--hero-2) 48%, var(--hero-3) 100%)" }}
        >
          <div className="max-w-2xl mx-auto flex flex-col items-center px-5 pt-6 pb-10 md:pb-14">
            <div className="hero-visual w-full">
              <div className="bear-drop">
                <ArthurMascot className="w-[340px] sm:w-[440px] md:w-[520px] h-auto drop-shadow-[0_24px_30px_rgba(0,0,0,0.32)]" />
              </div>
              <h1 className="comic-bubble">
                אל תיקחו משכנתה
                <br />
                לפני ש<b>ארתור בודק</b>.
              </h1>
            </div>

            <div className="hero-copy-fade flex flex-col items-center">
              <p className="text-white/85 pt-1.5 max-w-[40ch]">
                כמה שאלות פשוטות, דוח יתרות אחד — ותוך זמן קצר כמה יועצי משכנתאות מתחרים על התיק שלכם. תדעו בדיוק כמה תחסכו, ומה זה יעלה. בחינם, ובלי שום התחייבות.
              </p>
              <Link
                href="/wizard"
                className="inline-flex mt-6 font-display font-bold text-base rounded-xl bg-white text-[var(--hero-1)] px-6 py-3.5 shadow-lg transition hover:-translate-y-0.5"
              >
                תנו לי לבדוק ←
              </Link>
            </div>
          </div>
        </section>

        {/* LIVE STATS */}
        <section className="max-w-4xl mx-auto -mt-7 relative z-10 px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statTiles.map((tile) => (
              <div key={tile.label} className="bg-surface border border-line rounded-2xl shadow-[var(--shadow)] px-3 py-4 text-center">
                <p className="font-display font-black text-lg text-teal tabular-nums">{tile.value}</p>
                <p className="font-display font-bold text-xs text-ink-soft leading-snug pt-1">{tile.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <span className="font-display font-bold text-xs text-accent-strong bg-accent-soft rounded-full px-3 py-1.5">התהליך</span>
            <h2 className="text-2xl md:text-3xl pt-3">איך זה עובד, מהתחלה ועד ההצעה</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
                <span className="font-display font-black text-2xl text-accent-strong">{i + 1}</span>
                <strong className="block font-display text-base pt-2">{step.title}</strong>
                <p className="text-sm text-ink-soft leading-relaxed pt-1.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MEET ARTHUR VISUAL */}
        <section className="max-w-5xl mx-auto px-5 pb-16">
          <div className="rounded-3xl border border-line bg-surface p-2.5 shadow-[var(--shadow)] overflow-hidden">
            <Image
              src="/brand/arthur-hero-banner.jpg"
              alt="ארתור מעביר את התיק ליועצים המתאימים"
              width={1536}
              height={1024}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-surface-2/40 border-y border-line">
          <div className="max-w-3xl mx-auto px-5 py-16">
            <div className="text-center mb-8">
              <span className="font-display font-bold text-xs text-accent-strong bg-accent-soft rounded-full px-3 py-1.5">שאלות ותשובות</span>
              <h2 className="text-2xl md:text-3xl pt-3">10 שאלות שכולם שואלים אותנו</h2>
            </div>
            <div className="flex flex-col gap-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-line bg-surface px-5 py-4 open:shadow-[var(--shadow)]">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer font-display font-bold text-sm list-none">
                    {item.q}
                    <span className="text-accent-strong text-lg leading-none transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-sm text-ink-soft leading-relaxed pt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <ArthurMascot className="w-24 h-24 mx-auto" />
          <h2 className="text-2xl md:text-3xl pt-4">מוכנים לדעת בדיוק איפה אתם עומדים?</h2>
          <p className="text-ink-soft pt-2 max-w-[46ch] mx-auto">2 דקות, בלי התחייבות, ובלי עלות. ארתור כבר בודק.</p>
          <Link
            href="/wizard"
            className="inline-flex mt-6 font-display font-bold text-base rounded-xl bg-accent text-[var(--hero-1)] px-7 py-3.5 shadow-[0_12px_22px_-12px_color-mix(in_srgb,var(--accent)_65%,transparent)] transition hover:-translate-y-0.5"
          >
            בואו נתחיל
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col items-center gap-4 text-center">
          <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="h-7 w-auto opacity-80" />
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-display font-semibold text-ink-soft">
            <a href="#faq" className="hover:text-teal transition">שאלות נפוצות</a>
            <Link href="/login" className="hover:text-teal transition">כניסה ליועצים</Link>
            <span className="cursor-default opacity-60">אודות</span>
            <span className="cursor-default opacity-60">תנאי שימוש</span>
            <span className="cursor-default opacity-60">מדיניות פרטיות</span>
            <span className="cursor-default opacity-60">הצהרת נגישות</span>
          </nav>
          <p className="text-[11px] text-ink-faint">© ארתור — כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
