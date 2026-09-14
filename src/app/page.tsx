import Link from "next/link";
import { ArthurMascot } from "@/components/ArthurMascot";

const APPS = [
  {
    href: "/wizard",
    title: "בדיקת משכנתא",
    audience: "ללקוחות",
    desc: "אשף אינטראקטיבי שבודק את המשכנתא הקיימת או המבוקשת ומתאים יועץ מומחה.",
  },
  {
    href: "/advisor",
    title: "לוח היועץ",
    audience: "ליועצי משכנתאות",
    desc: "תיקים נכנסים, תקציר מנותח לכל תיק, וסימולטור הצעה מהיר.",
  },
  {
    href: "/admin",
    title: "קונסולת ניהול",
    audience: "לצוות התפעול",
    desc: "מעקב חוצה-יועצים, אימות זהות לקוחות, ובחירת ההצעה הזוכה לכל תיק.",
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
        </div>
      </header>

      <main className="flex-1">
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
                כמה שאלות פשוטות, מסמך אחד, ותוך כמה דקות תדעו בדיוק איפה אתם עומדים — ואם כדאי למחזר.
              </p>
            </div>
            <ArthurMascot className="w-40 h-40 md:w-56 md:h-56 flex-shrink-0 drop-shadow-[0_16px_20px_rgba(0,0,0,0.28)]" />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-5 py-12">
          <h2 className="text-xl mb-5">שלושה חלקים, מערכת אחת</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {APPS.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-line-strong"
              >
                <span className="font-display font-bold text-xs text-accent-strong bg-accent-soft self-start rounded-full px-2.5 py-1">
                  {app.audience}
                </span>
                <strong className="font-display text-base">{app.title}</strong>
                <p className="text-sm text-ink-soft leading-relaxed">{app.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        ארתור — פרויקט בפיתוח.
      </footer>
    </div>
  );
}
