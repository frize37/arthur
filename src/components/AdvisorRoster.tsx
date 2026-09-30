import type { PublicAdvisor } from "@/app/lib/publicAdvisors";

/**
 * The advisors working with Arthur, on the landing page, as a row of index
 * cards. Most of them have no logo file yet, so the card falls back to a
 * monogram — its tab tinted from the name so the row doesn't read as one
 * repeated shape. Once a logo is uploaded (advisor dashboard or admin team
 * page) it replaces the monogram with no change here.
 */

// The folder's tab colors, picked deterministically so an advisor keeps theirs.
const TINTS = ["var(--hoodie)", "var(--folder)", "var(--pop-warm)", "#B7851A", "var(--good)"];

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
    <section id="advisors" className="cf-section" style={{ paddingTop: 0 }} aria-labelledby="advisors-title">
      <div className="cf-wrap cf-roster">
        <div className="cf-roster__head">
          <h2 id="advisors-title" className="cf-h2">יועצי המשכנתאות שעובדים איתנו</h2>
          <p className="cf-sub">
            אלה האנשים שיקבלו את התיק שלכם ויתחרו עליו. לכל אחד מהם תחום שהוא חזק בו במיוחד, והתיק נשלח למי שמתאים לו.
          </p>
        </div>

        <ul className="cf-cards">
          {advisors.map((a) => {
            const tint = tintFor(a.id || a.name);
            return (
              <li key={a.id} className="cf-card" style={{ ["--t" as string]: tint }}>
                {a.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logoUrl} alt="" className="cf-card__logo" />
                ) : (
                  <span aria-hidden className="cf-card__mono">{monogram(a.name)}</span>
                )}
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.specialty}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
