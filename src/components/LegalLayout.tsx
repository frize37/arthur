import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "./SiteFooter";

// A legal page is one ruled sheet on the desk, filed under Arthur's folder.
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-desk">
      <header>
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-3 px-[clamp(16px,4vw,48px)] h-20">
          <Link href="/" aria-label="ארתור — עמוד הבית">
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="h-12 w-auto brightness-0 invert" />
          </Link>
          <Link href="/" className="text-sm font-bold text-on-folder-soft hover:text-white transition-colors">
            חזרה לעמוד הבית
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16">
        <article className="max-w-3xl mx-auto bg-surface rounded-lg shadow-[var(--shadow-paper)] px-[clamp(20px,5vw,56px)] py-10">
          <div className="border-b-2 border-ink pb-4">
            <h1 className="text-3xl md:text-4xl">{title}</h1>
            <p className="text-sm text-ink-faint pt-2 font-semibold">עודכן לאחרונה: {updated}</p>
          </div>
          <div className="flex flex-col gap-5 pt-8 text-base leading-relaxed text-ink-soft max-w-[70ch] [&_h2]:text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:pt-3 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
            {children}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
