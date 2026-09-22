"use client";

import Image from "next/image";
import { AdvisorCase, KeyPoint, LABELS, computeCase } from "../lib/data";
import { ltvCapFor, maxTermYears, shekel } from "../../wizard/lib/finance";

/**
 * דוח תיק מלא להדפסה / שמירה כ-PDF. מוצג רק בהדפסה (ראו כללי @media print
 * ב-advisor.css) — היועץ לוחץ "הפקת דוח" והדפדפן פותח חלון הדפסה שממנו
 * אפשר גם לשמור PDF. כל מה שהלקוח ענה, מסודר, במקום אחד.
 */
export function CaseReport({ case_: c, keyPoints }: { case_: AdvisorCase; keyPoints: KeyPoint[] }) {
  const calc = computeCase(c);
  const { cap, label: capLabel } = ltvCapFor(c.goal, c.property.sellingExisting);
  const bankValue =
    c.property.appraisalValue && c.property.appraisalValue > 0
      ? Math.min(c.property.value, c.property.appraisalValue)
      : c.property.value;
  const ltv = bankValue > 0 ? c.property.mortgage / bankValue : 0;
  const termYears = maxTermYears(c.profile.oldestAge);
  const isNewCase = c.requestType === "new";
  const today = new Date().toLocaleDateString("he-IL");

  const reds = keyPoints.filter((p) => p.kind === "red");
  const greens = keyPoints.filter((p) => p.kind === "green");
  const tips = keyPoints.filter((p) => p.kind === "tip");
  const infos = keyPoints.filter((p) => p.kind === "info");

  return (
    <div id="case-report" className="case-report" dir="rtl">
      <header className="case-report__head">
        <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="case-report__logo" />
        <div className="case-report__meta">
          <strong>סיכום תיק {c.caseNumber}</strong>
          <span>הופק ב-{today}</span>
        </div>
      </header>

      <Section title="סיווג העסקה">
        <Row label="סוג הבקשה" value={LABELS.requestType[c.requestType]} />
        <Row label="מטרה" value={LABELS.goal[c.goal]} />
        {c.property.sellingExisting && (
          <Row
            label="מכירת הדירה הקיימת"
            value={
              c.property.sellingExisting === "before"
                ? "לפני הרכישה"
                : c.property.sellingExisting === "after"
                ? "אחרי הרכישה"
                : "לא מוכרים"
            }
          />
        )}
        <Row label="סיווג לצורך תקרת מימון" value={`${capLabel} — עד ${Math.round(cap * 100)}%`} />
        {c.complex && <Row label="סיווג תיק" value="מורכב — דורש בדיקה מעמיקה" />}
      </Section>

      <Section title="הנכס והמימון">
        <Row label="שווי הנכס / מחיר בחוזה" value={shekel(c.property.value)} />
        {c.property.appraisalValue && c.property.appraisalValue > 0 ? (
          <>
            <Row label="שמאות" value={shekel(c.property.appraisalValue)} />
            <Row label="שווי לחישוב הבנק (הנמוך מביניהם)" value={shekel(bankValue)} />
          </>
        ) : (
          isNewCase && <Row label="שמאות" value="טרם בוצעה" />
        )}
        <Row label="סכום המשכנתה המבוקש" value={shekel(c.property.mortgage)} />
        <Row label="שיעור מימון בפועל" value={`${(ltv * 100).toFixed(1)}%`} emphasis={ltv > cap} />
        {/* הון עצמי נשאל רק ברכישה חדשה — במחזור אין ערך אמיתי בתיק. */}
        {isNewCase && <Row label="הון עצמי" value={shekel(c.equity)} />}
        <Row label="סטטוס רישום" value={LABELS.legal[c.property.legal] ?? c.property.legal} />
        {c.property.source && (
          <Row label="אופן הרכישה" value={LABELS.propertySource[c.property.source] ?? c.property.source} />
        )}
      </Section>

      <Section title="הלווים">
        <Row label="גיל הלווה המבוגר" value={c.profile.oldestAge > 0 ? `${c.profile.oldestAge}` : "לא נמסר"} />
        <Row label="תקופה מקסימלית אפשרית" value={`${termYears} שנים (סיום עד גיל 75)`} />
        <Row label="מבקש/ת נוסף/ת" value={c.profile.hasSecond === "yes" ? "כן" : "לא"} />
        <Row
          label="מבקש/ת 1"
          value={`${LABELS.employment[c.profile.employment1] ?? c.profile.employment1} · ותק ${
            LABELS.seniority[c.profile.seniority1] ?? c.profile.seniority1
          }`}
        />
        {c.profile.hasSecond === "yes" && c.profile.employment2 && (
          <Row
            label="מבקש/ת 2"
            value={`${LABELS.employment[c.profile.employment2] ?? c.profile.employment2} · ותק ${
              LABELS.seniority[c.profile.seniority2 ?? ""] ?? c.profile.seniority2 ?? ""
            }`}
          />
        )}
        <Row label="תעודת זכאות" value={LABELS.yesno[c.zakaut ?? ""] ?? "לא נמסר"} />
      </Section>

      <Section title="יכולת החזר">
        <Row label="הכנסה נטו" value={shekel(c.income.net)} />
        {c.income.extra > 0 && <Row label="הכנסה נוספת" value={shekel(c.income.extra)} />}
        <Row
          label="הלוואות קיימות"
          value={
            c.credit.otherLoans === "yes"
              ? `${shekel(c.credit.otherLoansPayment ?? 0)} לחודש${
                  c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft
                    ? ` · מסתיימות תוך ${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft] ?? c.credit.otherLoansMonthsLeft}`
                    : ""
                }`
              : "אין"
          }
        />
        <Row label="הכנסה פנויה (אחרי הלוואות שנספרות)" value={shekel(calc.freeIncome)} />
        <Row label="החזר חודשי שנוח ללקוח" value={shekel(c.repayment.comfort)} />
        <Row label="החזר מקסימלי שהצהיר עליו" value={shekel(c.repayment.max)} />
        <Row
          label={calc.isEstimate ? "החזר חודשי (אומדן)" : "החזר חודשי נוכחי"}
          value={shekel(calc.payment)}
        />
        <Row
          label="יחס החזר מההכנסה הפנויה"
          value={`${(calc.ratio * 100).toFixed(1)}% — ${calc.bandLabel}`}
          emphasis={calc.band === "risk"}
        />
        <Row label="חיווי אשראי" value={c.credit.creditIssues === "yes" ? "דורש תשומת לב" : "תקין"} />
      </Section>

      <Section title="תכנון פיננסי">
        <Row
          label="משיכת כספים עתידית"
          value={
            c.planning.futureRelease === "yes"
              ? `${shekel(c.planning.futureReleaseAmount ?? 0)}${
                  c.planning.futureReleaseTiming
                    ? ` · ${LABELS.futureReleaseTiming[c.planning.futureReleaseTiming]}`
                    : ""
                }`
              : LABELS.yesno[c.planning.futureRelease] ?? c.planning.futureRelease
          }
        />
        <Row
          label="הוצאה גדולה מתוכננת"
          value={LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent}
        />
        <Row label="שינוי צפוי בהכנסה" value={LABELS.yesno[c.planning.incomeChange] ?? c.planning.incomeChange} />
      </Section>

      {c.docTracks.length > 0 && (
        <Section title="המשכנתה הקיימת">
          {c.docTracks.map((t, i) => (
            <Row
              key={i}
              label={`מסלול ${String.fromCharCode(0x5d0 + i)}׳`}
              value={[
                t.rateKind === "fixed" ? "קבועה" : t.rateKind === "variable" ? "משתנה" : null,
                t.linkedToCpi ? "צמודה למדד" : null,
                t.annualRate != null ? `${t.annualRate}%` : null,
                t.principalBalance != null ? `יתרה ${shekel(t.principalBalance)}` : null,
                t.monthsRemaining != null ? `${t.monthsRemaining} חודשים` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
          {c.docTotals.totalPayoff != null && (
            <Row label="סה״כ יתרה לסילוק" value={shekel(c.docTotals.totalPayoff)} />
          )}
          {c.docTotals.totalEarlyRepaymentFee != null && (
            <Row label="סה״כ עמלת פרעון מוקדם" value={shekel(c.docTotals.totalEarlyRepaymentFee)} />
          )}
          {c.docSource === "manual" && <Row label="מקור הנתונים" value="הוזנו ידנית על ידי הלקוח — לא נשלפו ממסמך" />}
        </Section>
      )}

      {(reds.length > 0 || greens.length > 0) && (
        <Section title="נקודות לתשומת לב">
          {reds.map((p, i) => (
            <Bullet key={`r${i}`} tone="red" text={p.text} />
          ))}
          {greens.map((p, i) => (
            <Bullet key={`g${i}`} tone="green" text={p.text} />
          ))}
          {infos.map((p, i) => (
            <Bullet key={`i${i}`} tone="info" text={p.text} />
          ))}
        </Section>
      )}

      {tips.length > 0 && (
        <Section title="המלצות">
          {tips.map((p, i) => (
            <Bullet key={`t${i}`} tone="tip" text={p.text} />
          ))}
        </Section>
      )}

      <footer className="case-report__foot">
        דוח זה הופק אוטומטית על ידי ארתור מתוך התשובות שמסר הלקוח, ככלי עזר ליועץ בלבד. אינו מהווה הצעה, אישור
        עקרוני או ייעוץ, והנתונים המסומנים כאומדן מבוססים על הנחות שוק שיש לאמת מול נתוני אמת.
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="case-report__section">
      <h2>{title}</h2>
      <div className="case-report__rows">{children}</div>
    </section>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="case-report__row">
      <span>{label}</span>
      <b style={emphasis ? { color: "var(--risk)" } : undefined}>{value}</b>
    </div>
  );
}

function Bullet({ tone, text }: { tone: "red" | "green" | "info" | "tip"; text: string }) {
  const color =
    tone === "red" ? "var(--risk)" : tone === "green" ? "var(--good)" : tone === "tip" ? "var(--accent-strong)" : "var(--ink-faint)";
  return (
    <div className="case-report__bullet">
      <span className="case-report__dot" style={{ background: color }} />
      <span>{text}</span>
    </div>
  );
}
