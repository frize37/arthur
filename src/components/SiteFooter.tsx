import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/#faq", label: "שאלות נפוצות" },
  { href: "/login", label: "כניסה ליועצים" },
  { href: "/about", label: "אודות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
];

// The desk under the folder: every public page ends on it.
export function SiteFooter() {
  return (
    <footer className="bg-desk text-on-folder-soft border-t border-white/10 py-8">
      <div className="max-w-[1320px] mx-auto px-[clamp(16px,4vw,48px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="h-8 w-auto brightness-0 invert opacity-85" />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold" aria-label="קישורים">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-on-folder-soft hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-[13px]">© ארתור — כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}
