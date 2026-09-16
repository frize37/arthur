import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "./SiteFooter";

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-5 py-3.5">
          <Link href="/">
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="h-16 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-display font-semibold text-ink-soft hover:text-teal transition">
            חזרה לעמוד הבית
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="text-2xl md:text-3xl">{title}</h1>
          <p className="text-xs text-ink-faint pt-2">עודכן לאחרונה: {updated}</p>
          <div className="flex flex-col gap-5 pt-8 text-[15px] leading-relaxed text-ink-soft [&_h2]:text-ink [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:pt-3 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
            {children}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
