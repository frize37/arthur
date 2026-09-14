import Link from "next/link";
import { ArthurMascot } from "@/components/ArthurMascot";

const STEPS = [
  {
    title: "עונים על שאלון קצר",
    desc: "כ-2 דקות, מסך אחד-שניים לכל נושא. אפשר לעצור ולהמשיך בכל שלב.",
  },
  {
    title: "מעלים מסמך אחד",
    desc: "דוח יתרות או אישור עקרוני — ארתור קורא אותו לבד ושולף את המספרים.",
  },
  {
    title: "מאמתים זהות בקצרה",
    desc: "קוד ב-SMS וקוד במייל, כדי שהתיק ייפתח בביטחון מלא.",
  },
  {
    title: "מקבלים את ההצעה הזוכה",
    desc: "התיק (בעילום שם) יוצא ל-4 יועצים — ואתם מקבלים רק את המשתלמת ביותר.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "מה זה בעצם ארתור?",
    a: "ארתור הוא מערכת שבודקת בשבילכם, תוך דקות, אם המשכנתה שלכם — הקיימת או המתוכננת — עובדת בשבילכם, ומחברת אתכם ליועצי משכנתאות מומחים שמתחרים על התיק שלכם.",
  },
  {
    q: "איך זה עובד בפועל, שלב אחר שלב?",
    a: "עונים על שאלון קצר, מעלים מסמך אחד שה-AI קורא בשבילכם, מאמתים את הזהות שלכם ב-SMS ובמייל, והתיק (ללא שם) יוצא ל-4 יועצים שמגישים הצעת מחיר.",
  },
  {
    q: "כמה זמן זה לוקח?",
    a: "מילוי השאלון עצמו לוקח כ-2 דקות. תוך מספר ימים (לרוב פחות) תקבלו הצעה מהיועצים.",
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
    q: "מה אם עדיין אין לי את המסמכים?",
    a: "אין בעיה — אפשר לדלג על שלב העלאת המסמך ולהמשיך עם הערכה כללית. יועץ יוכל להשלים את התמונה מולכם בהמשך.",
  },
  {
    q: "איך בוחרים את 4 היועצים, ומה קורה עם ההצעות שלהם?",
    a: "היועצים נבחרים לפי סוג התיק שלכם (מיחזור, עצמאים, מסלולים משתנים ועוד). כל אחד מגיש הצעת מחיר, ואנחנו משווים ומעבירים אליכם רק את ההצעה המשתלמת ביותר.",
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <ArthurMascot className="w-8 h-8" />
            <div>
              <span className="font-display font-black text-base leading-none">ארתור</span>
              <small className="block text-[11px] text-ink-faint font-semibold">בדיקה ומחזור משכנתאות</small>
            </div>
          </div>
          <Link
            href="/wizard"
            className="font-display font-bold text-sm rounded-xl bg-accent text-[#2A1B02] px-4 py-2 shadow-[0_12px_22px_-12px_color-mix(in_srgb,var(--accent)_65%,transparent)] transition hover:-translate-y-0.5"
          >
            בדיקה חינמית
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden text-center md:text-start"
          style={{ background: "linear-gradient(155deg, var(--hero-1) 0%, var(--hero-2) 48%, var(--hero-3) 100%)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-5 py-14 md:py-20">
            <div className="flex-1">
              <span className="inline-flex font-display font-bold text-xs tracking-wide text-white bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5">
                בליווי אישי, שלב אחר שלב
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-display font-black leading-tight pt-4 max-w-[16ch] mx-auto md:mx-0">
                היי, אני ארתור. בואו נבדוק את המשכנתא שלכם.
              </h1>
              <p className="text-white/85 pt-4 max-w-[40ch] mx-auto md:mx-0">
                כמה שאלות פשוטות, מסמך אחד, ותוך כמה דקות תדעו בדיוק איפה אתם עומדים — ואם כדאי למחזר. בחינם, ובלי שום התחייבות.
              </p>
              <Link
                href="/wizard"
                className="inline-flex mt-6 font-display font-bold text-base rounded-xl bg-white text-[var(--hero-1)] px-6 py-3.5 shadow-lg transition hover:-translate-y-0.5"
              >
                לבדיקה החינמית שלי ←
              </Link>
            </div>
            <ArthurMascot className="w-40 h-40 md:w-56 md:h-56 flex-shrink-0 drop-shadow-[0_16px_20px_rgba(0,0,0,0.28)]" />
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="max-w-4xl mx-auto -mt-7 relative z-10 px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["עד 50% חיסכון", "AI קורא מסמכים", "2 דקות בדיקה", "ליווי אישי צמוד"].map((label) => (
              <div key={label} className="bg-surface border border-line rounded-2xl shadow-[var(--shadow)] px-3 py-4 text-center">
                <p className="font-display font-bold text-xs text-ink-soft leading-snug">{label}</p>
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

        {/* FAQ */}
        <section className="bg-surface-2/40 border-y border-line">
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
          <ArthurMascot className="w-16 h-16 mx-auto" />
          <h2 className="text-2xl md:text-3xl pt-4">מוכנים לדעת בדיוק איפה אתם עומדים?</h2>
          <p className="text-ink-soft pt-2 max-w-[46ch] mx-auto">2 דקות, בלי התחייבות, ובלי עלות. ארתור כבר מחכה.</p>
          <Link
            href="/wizard"
            className="inline-flex mt-6 font-display font-bold text-base rounded-xl bg-accent text-[#2A1B02] px-7 py-3.5 shadow-[0_12px_22px_-12px_color-mix(in_srgb,var(--accent)_65%,transparent)] transition hover:-translate-y-0.5"
          >
            בואו נתחיל
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-6">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-faint">
          <span>ארתור — פרויקט בפיתוח.</span>
          <Link href="/login" className="hover:text-ink-soft transition">כניסה ליועצים</Link>
        </div>
      </footer>
    </div>
  );
}
