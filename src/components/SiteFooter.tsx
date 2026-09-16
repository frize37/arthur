import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8">
      <div className="max-w-5xl mx-auto px-5 flex flex-col items-center gap-4 text-center">
        <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="h-7 w-auto opacity-80" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-display font-semibold text-ink-soft">
          <Link href="/#faq" className="hover:text-teal transition">שאלות נפוצות</Link>
          <Link href="/login" className="hover:text-teal transition">כניסה ליועצים</Link>
          <Link href="/about" className="hover:text-teal transition">אודות</Link>
          <Link href="/terms" className="hover:text-teal transition">תנאי שימוש</Link>
          <Link href="/privacy" className="hover:text-teal transition">מדיניות פרטיות</Link>
          <Link href="/accessibility" className="hover:text-teal transition">הצהרת נגישות</Link>
        </nav>
        <p className="text-[11px] text-ink-faint">© ארתור — כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}
