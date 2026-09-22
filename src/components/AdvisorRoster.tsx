import type { PublicAdvisor } from "@/app/lib/publicAdvisors";

/**
 * The wall of advisors working with Arthur, on the landing page. Most of them
 * have no logo file yet, so the tile falls back to a monogram — tinted from
 * the name so the wall doesn't read as one repeated shape. Once a logo is
 * uploaded (advisor dashboard or admin team page) it replaces the monogram
 * with no change here.
 */

// Brand-family tints, picked deterministically so an advisor keeps their color.
const TINTS = ["var(--teal)", "var(--pop)", "var(--accent-strong)", "var(--pop-warm)", "var(--good)"];

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return TINTS[hash % TINTS.length];
}

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export function AdvisorRoster({ advisors }: { advisors: PublicAdvisor[] }) {
  if (advisors.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-5 pt-16">
      <div className="text-center mb-9">
        <span className="font-display font-bold text-xs text-accent-strong bg-accent-soft rounded-full px-3 py-1.5">מי מתחרה עליכם</span>
        <h2 className="text-2xl md:text-3xl pt-3">יועצי המשכנתאות שעובדים איתנו</h2>
        <p className="text-ink-soft pt-2 max-w-[48ch] mx-auto leading-relaxed">
          אלה האנשים שיקבלו את התיק שלכם ויתחרו עליו. לכל אחד מהם תחום שהוא חזק בו במיוחד, והתיק נשלח למי שמתאים לו.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {advisors.map((a) => {
          const tint = tintFor(a.id || a.name);
          return (
            <div
              key={a.id}
              className="flex flex-col items-center text-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-6 shadow-[var(--shadow)]"
            >
              {a.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.logoUrl}
                  alt={a.name}
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ boxShadow: `0 0 0 3px color-mix(in srgb, ${tint} 22%, transparent)` }}
                />
              ) : (
                <div
                  aria-hidden
                  className="w-14 h-14 rounded-full grid place-items-center font-display font-black text-lg text-white"
                  style={{ background: tint, boxShadow: `0 0 0 3px color-mix(in srgb, ${tint} 22%, transparent)` }}
                >
                  {monogram(a.name)}
                </div>
              )}
              <div>
                <strong className="block font-display text-sm">{a.name}</strong>
                <span className="block text-xs text-ink-faint pt-0.5 leading-snug">{a.specialty}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
