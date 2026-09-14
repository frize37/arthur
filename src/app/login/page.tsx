import Link from "next/link";
import { ArthurMascot } from "@/components/ArthurMascot";

export const metadata = {
  title: "כניסה למערכת | ארתור",
};

export default function LoginPage() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <ArthurMascot className="w-7 h-7" />
            <span className="font-display font-black text-base">ארתור</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <ArthurMascot className="w-16 h-16" />
          <div>
            <h1 className="text-2xl">כניסה למערכת</h1>
            <p className="text-ink-soft text-sm pt-2">
              בחרו את סוג הכניסה שלכם. בקרוב זה יהיה מסך התחברות אחד עם שם משתמש וסיסמה — כרגע, עד שזה מוכן, תבחרו ידנית.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 pt-2">
            <Link
              href="/advisor"
              className="w-full rounded-xl border border-line bg-surface px-5 py-3.5 text-start shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-line-strong flex items-center justify-between gap-3"
            >
              <span>
                <strong className="block font-display text-sm">כניסה ליועץ</strong>
                <small className="text-ink-faint text-xs">לוח התיקים וסימולטור ההצעות שלך</small>
              </span>
              <span className="text-ink-faint text-lg leading-none">‹</span>
            </Link>

            <Link
              href="/admin"
              className="w-full rounded-xl border border-line bg-surface px-5 py-3.5 text-start shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-line-strong flex items-center justify-between gap-3"
            >
              <span>
                <strong className="block font-display text-sm">כניסה לאדמין</strong>
                <small className="text-ink-faint text-xs">קונסולת הניהול הפנימית</small>
              </span>
              <span className="text-ink-faint text-lg leading-none">‹</span>
            </Link>
          </div>

          <span className="font-display font-bold text-[11px] text-accent-strong bg-accent-soft rounded-full px-3 py-1.5">
            🧪 מסך זמני — עד שיהיה אימות משתמשים אמיתי
          </span>
        </div>
      </main>
    </div>
  );
}
