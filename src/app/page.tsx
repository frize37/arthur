import Link from "next/link";
import Image from "next/image";
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
    desc: "התיק (בעילום שם) יוצא ליועצים המתאימים לכם — ואתם מקבלים רק את ההצעה המשתלמת ביותר.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "מה זה בעצם ארתור?",
    a: "ארתור הוא מערכת שבודקת בשבילכם, תוך דקות, אם המשכנתה שלכם — הקיימת או המתוכננת — עובדת בשבילכם, ומחברת אתכם ליועצי משכנתאות מומחים שמתחרים על התיק שלכם.",
  },
  {
    q: "איך זה עובד בפועל, שלב אחר שלב?",
    a: "עונים על שאלון קצר, מעלים מסמך אחד שה-AI קורא בשבילכם, מאמתים את הזהות שלכם ב-SMS ובמייל, והתיק (ללא שם) יוצא ליועצים המתאימים שמגישים הצעת מחיר.",
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
    q: "איך בוחרים את היועצים, ומה קורה עם ההצעות שלהם?",
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
          <div className="flex items-center gap-2">
            <ArthurMascot className="w-14 h-14 -my-2" />
            <div>
              <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="h-6 w-auto" />
              <small className="block text-[11px] text-ink-faint font-semibold">בדיקה ומחזור משכנתאות</small>
            </div>
          </div>
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
          <div className="max-w-2xl mx-auto flex flex-col items-center px-5 pt-12 pb-14 md:pt-16 md:pb-20">
            <span className="inline-flex font-display font-bold text-xs tracking-wide text-white bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5">
              🕵️ אני בודק לפניכם, לא מוכר לכם
            </span>

            <div className="relative mt-2">
              <h1 className="comic-bubble absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 z-10">
                אל תיקחו משכנתה
                <br />
                לפני ש<b>ארתור בודק</b>.
              </h1>
              <ArthurMascot className="hero-bear-pop w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[380px] md:h-[380px] drop-shadow-[0_20px_26px_rgba(0,0,0,0.3)]" />
            </div>

            <p className="text-white/85 pt-2 max-w-[40ch]">
              כמה שאלות פשוטות, מסמך אחד, ותוך כמה דקות תדעו בדיוק איפה אתם עומדים — ואם כדאי למחזר. בחינם, ובלי שום התחייבות.
            </p>
            <Link
              href="/wizard"
              className="inline-flex mt-6 font-display font-bold text-base rounded-xl bg-white text-[var(--hero-1)] px-6 py-3.5 shadow-lg transition hover:-translate-y-0.5"
            >
              תנו לי לבדוק ←
            </Link>
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

      <footer className="border-t border-line py-6">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-faint">
          <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="h-8 w-auto" />
          <Link href="/login" className="hover:text-ink-soft transition">כניסה ליועצים</Link>
        </div>
      </footer>
    </div>
  );
}
