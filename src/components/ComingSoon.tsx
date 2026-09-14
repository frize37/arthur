import Link from "next/link";
import { ArthurMascot } from "@/components/ArthurMascot";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <ArthurMascot className="w-24 h-24" />
      <span className="font-display font-bold text-xs text-accent-strong bg-accent-soft rounded-full px-3 py-1.5">
        בבנייה
      </span>
      <h1 className="text-2xl">{title}</h1>
      <p className="text-ink-soft max-w-[42ch]">{note}</p>
      <Link
        href="/"
        className="font-display font-bold text-sm rounded-xl bg-accent text-[#2A1B02] px-5 py-2.5"
      >
        חזרה לעמוד הבית
      </Link>
    </div>
  );
}
